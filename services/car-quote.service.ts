import { 
  CarQuoteRequest, 
  CarQuoteResponse, 
  CarQuoteRequestSchema 
} from '@/types/car-quote.types';
import { InsurancePacksService } from './insurance-packs.service';
import { InsurancePackCoveragesService } from './insurance-pack-coverages.service';
import { InsuranceService } from './insurance.service';
import { JsonConfigAdapter } from '@/config/adapters/json.config.adapter';
import * as crypto from 'crypto';
import * as z from 'zod';

/**
 * Configuration options for reference number generation
 */
interface ReferenceNumberOptions {
  prefix?: string;
  length?: number;
  includeYear?: boolean;
}

/**
 * Generate a unique reference number with flexible configuration
 * @param options Configuration options for reference number
 * @returns Formatted reference number
 */
export function generateReferenceNumber(options: ReferenceNumberOptions = {}): string {
  // Default options
  const {
    prefix = 'SIM',
    length = 12,
    includeYear = true
  } = options;

  // Validate inputs
  if (length < 6) {
    throw new Error('Reference number length must be at least 6 characters');
  }

  // Use high-resolution time with microsecond precision
  const timestamp = process.hrtime.bigint().toString();
  
  // Generate a cryptographically secure random string
  const randomBytes = crypto.randomBytes(4).toString('hex');
  
  // Create a hash to further ensure uniqueness
  const hash = crypto.createHash('sha256')
    .update(`${timestamp}${randomBytes}`)
    .digest('hex')
    .toUpperCase();

  // Calculate remaining length for hash
  const yearPart = includeYear ? String(new Date().getFullYear()) : '';
  const remainingLength = length - prefix.length - yearPart.length;

  // Truncate or pad the hash as needed
  const uniquePart = hash.substring(0, remainingLength);

  // Combine elements to create a unique reference
  return `${prefix}${yearPart}${uniquePart}`;
}

/**
 * Custom error classes for more specific error handling
 */
class QuoteProcessingError extends Error {
  constructor(
    public message: string, 
    public code: string, 
    public details?: any
  ) {
    super(message);
    this.name = 'QuoteProcessingError';
  }
}

class PackNotFoundError extends QuoteProcessingError {
  constructor(packageCode: string) {
    super(
      `Insurance pack with code ${packageCode} not found`, 
      'PACK_NOT_FOUND',
      { packageCode }
    );
  }
}

class CoverageRetrievalError extends QuoteProcessingError {
  constructor(packageCode: string, originalError: Error) {
    super(
      `Failed to retrieve coverages for package ${packageCode}`, 
      'COVERAGE_RETRIEVAL_FAILED',
      { 
        packageCode, 
        originalErrorMessage: originalError.message 
      }
    );
  }
}

class PremiumCalculationError extends QuoteProcessingError {
  constructor(originalError: Error, input: any) {
    super(
      'Failed to calculate premium', 
      'PREMIUM_CALCULATION_FAILED',
      { 
        originalErrorMessage: originalError.message,
        input 
      }
    );
  }
}

export class CarQuoteService {
  private packService: InsurancePacksService;
  private packCoveragesService: InsurancePackCoveragesService;
  private insuranceService: InsuranceService;
  private jsonAdapter: JsonConfigAdapter;

  constructor() {
    this.packService = new InsurancePacksService();
    this.packCoveragesService = new InsurancePackCoveragesService();
    this.jsonAdapter = new JsonConfigAdapter();
    this.insuranceService = new InsuranceService(this.jsonAdapter);
  }

  /**
   * Process car insurance quote request with robust error handling
   * @param requestBody Raw request body
   * @returns Processed quote response
   * @throws {QuoteProcessingError} Detailed error during quote processing
   */
  async processQuoteRequest(requestBody: any): Promise<CarQuoteResponse> {
    // Logging request for traceability
    console.log('Processing quote request', { 
      timestamp: new Date().toISOString(), 
      requestBody 
    });

    try {
      // 1. Validate input with detailed error handling
      let input: CarQuoteRequest;
      try {
        input = CarQuoteRequestSchema.parse(requestBody);
      } catch (validationError) {
        if (validationError instanceof z.ZodError) {
          throw new QuoteProcessingError(
            'Invalid quote request', 
            'VALIDATION_ERROR', 
            validationError.errors
          );
        }
        throw validationError;
      }

      // 2. Get pack details with specific error
      const pack = await this.packService.getByCode(input.package);
      if (!pack) {
        throw new PackNotFoundError(input.package);
      }

      // 3. Get coverages for the pack with error handling
      let packageCoverages;
      try {
        packageCoverages = await this.packCoveragesService.getCoveragesByPackCode(input.package);
      } catch (coverageError) {
        throw new CoverageRetrievalError(input.package, coverageError as Error);
      }

      // 4. Calculate premium with detailed error tracking
      let response;
      try {
        const calculationInput = {
          ...input,
          coverages: packageCoverages.map(coverage => coverage.coverageCode)
        };
        response = this.insuranceService.calculate(calculationInput);
      } catch (calculationError) {
        throw new PremiumCalculationError(
          calculationError as Error, 
          { 
            package: input.package, 
            contract: input.contract, 
            vehicle: input.vehicle 
          }
        );
      }

      // 5. Generate reference number with potential crypto error handling
      let reference;
      try {
        reference = generateReferenceNumber({
          prefix: 'SIM',
          length: 16,
          includeYear: true
        });
      } catch (referenceError) {
        throw new QuoteProcessingError(
          'Failed to generate reference number', 
          'REFERENCE_GENERATION_FAILED',
          { originalError: referenceError }
        );
      }

      // 6. Log successful processing
      console.log('Quote processing completed successfully', { 
        timestamp: new Date().toISOString(), 
        packageCode: input.package 
      });

      // 7. Return structured response
      return {
        status: 'success',
        data: {
          reference,
          pack: {
            code: pack.packCode,
            name: pack.packName,
            description: pack.packDescription
          },
          ...response
        }
      };

    } catch (error) {
      // Central error logging
      console.error('Quote processing failed', { 
        timestamp: new Date().toISOString(), 
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });

      // Re-throw for upstream error handling
      throw error;
    }
  }
}

export const carQuoteService = new CarQuoteService();
