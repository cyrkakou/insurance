import { eq, sql } from 'drizzle-orm';
import { getDatabase } from '../config/database';
import { insuranceSimulations } from '@/database/schema/insurance-simulations.schema';
import { BaseDataService } from './service.schema';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

// Define types for type safety
type InsuranceSimulation = typeof insuranceSimulations.$inferSelect;
type NewInsuranceSimulation = typeof insuranceSimulations.$inferInsert;

// Validation schema for insurance simulation
const InsuranceSimulationSchema = z.object({
  packId: z.number().positive('Pack ID must be a positive number'),
  clientType: z.enum(['individual', 'company']),
  clientName: z.string().min(2, 'Client name must be at least 2 characters'),
  clientEmail: z.string().email('Invalid email address'),
  clientPhone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
  referenceNumber: z.string(),
  simulationDate: z.date(),
  status: z.enum(['draft', 'completed', 'expired']).default('draft'),
  params: z.string().optional(),
});

/**
 * Service for managing insurance simulation records
 * Extends BaseDataService with advanced querying capabilities
 */
export class InsuranceSimulationService extends BaseDataService<InsuranceSimulation, NewInsuranceSimulation> {
  /**
   * Database connection instance
   * @protected
   */
  protected db = getDatabase();

  /**
   * Table name for database operations
   * @protected
   */
  protected readonly tableName = 'insurance_simulations';

  /**
   * Searchable fields for flexible querying
   * @protected
   */
  protected readonly searchableFields = [
    'referenceNumber', 
    'clientName', 
    'clientEmail', 
    'clientPhone', 
    'status'
  ];

  /**
   * Field mapping for external to internal field names
   * @protected
   */
  protected readonly fieldMapping: { [key: string]: string } = {
    reference: 'referenceNumber',
    name: 'clientName',
    email: 'clientEmail',
    phone: 'clientPhone',
    simulationStatus: 'status'
  };

  /**
   * Find all simulations with optional filtering
   * @param {Partial<InsuranceSimulation>} [filter] - Optional filter criteria
   * @returns {Promise<InsuranceSimulation[]>} Array of simulation records
   */
  async findAll(filter?: Partial<InsuranceSimulation>): Promise<InsuranceSimulation[]> {
    try {
      const query = this.db
        .select()
        .from(insuranceSimulations);

      // Apply dynamic filtering
      if (filter) {
        const filterConditions = Object.entries(filter)
          .map(([key, value]) => eq(insuranceSimulations[key as keyof InsuranceSimulation], value));
        
        query.where(sql.join(filterConditions, ' and '));
      }

      return await query;
    } catch (error) {
      console.error('Error finding simulations:', error);
      throw new Error('Failed to retrieve simulations');
    }
  }

  /**
   * Validate insurance simulation data
   * @param {NewInsuranceSimulation} data - Data to validate
   * @private
   */
  private validateSimulationData(data: NewInsuranceSimulation): NewInsuranceSimulation {
    try {
      // Validate and parse the input data
      const validatedData = InsuranceSimulationSchema.parse({
        ...data,
        referenceNumber: data.referenceNumber || this.generateReferenceNumber(),
        simulationDate: data.simulationDate || new Date(),
        status: data.status || 'draft'
      });

      return validatedData;
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Provide detailed validation error messages
        const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('; ');
        throw new Error(`Validation failed: ${errorMessages}`);
      }
      throw error;
    }
  }

  /**
   * Generate a unique reference number for a simulation
   * @returns {string} Unique reference number
   * @private
   */
  private generateReferenceNumber(): string {
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').slice(0, 14);
    const uniquePart = uuidv4().split('-')[0].toUpperCase();
    return `SIM-${timestamp}-${uniquePart}`;
  }

  /**
   * Create a new insurance simulation record
   * @param {NewInsuranceSimulation} data - Simulation data to create
   * @returns {Promise<InsuranceSimulation>} Created simulation
   */
  async create(data: NewInsuranceSimulation): Promise<InsuranceSimulation> {
    try {
      // Validate the input data
      const validatedData = this.validateSimulationData(data);

      // Attempt to create the simulation
      const [createdSimulation] = await this.db
        .insert(insuranceSimulations)
        .values(validatedData)
        .$returningId();

      if (!createdSimulation) {
        throw new Error('Failed to create simulation: No record returned');
      }

      // Fetch the created simulation to get full details
      const simulation = await this.findById(createdSimulation.id);
      if (!simulation) {
        throw new Error('Failed to retrieve created simulation');
      }

      return simulation;
    } catch (error) {
      console.error('Error creating insurance simulation:', error);
      throw error instanceof Error 
        ? error 
        : new Error('Failed to create insurance simulation');
    }
  }

  /**
   * Find a simulation by its ID
   * @param {number | string} id - Simulation ID
   * @returns {Promise<InsuranceSimulation | null>} Simulation record or null
   */
  async findById(id: number | string): Promise<InsuranceSimulation | null> {
    try {
      // Validate ID is a number
      const numericId = Number(id);
      if (isNaN(numericId)) {
        throw new Error('Invalid ID: must be a number');
      }

      const result = await this.db
        .select()
        .from(insuranceSimulations)
        .where(eq(insuranceSimulations.id, numericId))
        .limit(1);

      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('Error finding simulation by ID:', error);
      throw new Error('Failed to find simulation');
    }
  }

  /**
   * Find simulations by a specific field
   * @param {string} field - Field to search by
   * @param {string} value - Value to search for
   * @param {boolean} [multiple=false] - Whether to return multiple results
   * @returns {Promise<InsuranceSimulation | InsuranceSimulation[] | null>} Found record(s)
   */
  async findByField(
    field: string, 
    value: string, 
    multiple = false
  ): Promise<InsuranceSimulation | InsuranceSimulation[] | null> {
    try {
      // Map external field name to internal if needed
      const internalField = (this.fieldMapping[field] || field) as keyof InsuranceSimulation;

      // Validate searchable field
      if (!this.searchableFields.includes(internalField as string)) {
        throw new Error(`Field ${field} is not searchable`);
      }

      const query = this.db
        .select()
        .from(insuranceSimulations)
        .where(eq(insuranceSimulations[internalField], value));

      if (multiple) {
        const results = await query;
        return results.length > 0 ? results : null;
      }

      const results = await query.limit(1);
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error(`Error finding simulation by ${field}:`, error);
      throw new Error(`Failed to find simulation by ${field}`);
    }
  }

  /**
   * Update an existing simulation
   * @param {number | string} id - Simulation ID to update
   * @param {Partial<NewInsuranceSimulation>} data - Partial update data
   * @returns {Promise<InsuranceSimulation>} Updated simulation
   */
  async update(id: number | string, data: Partial<NewInsuranceSimulation>): Promise<InsuranceSimulation> {
    try {
      // Validate ID is a number
      const numericId = Number(id);
      if (isNaN(numericId)) {
        throw new Error('Invalid ID: must be a number');
      }

      // Validate update data
      const validatedData = InsuranceSimulationSchema.partial().parse(data);

      const [updatedSimulation] = await this.db
        .update(insuranceSimulations)
        .set(validatedData)
        .where(eq(insuranceSimulations.id, numericId))
        .returning();

      if (!updatedSimulation) {
        throw new Error(`Simulation with ID ${id} not found`);
      }

      return updatedSimulation;
    } catch (error) {
      console.error('Error updating simulation:', error);
      throw error instanceof Error 
        ? error 
        : new Error('Failed to update simulation');
    }
  }

  /**
   * Delete a simulation by ID
   * @param {number | string} id - Simulation ID to delete
   * @returns {Promise<boolean>} Deletion success status
   */
  async delete(id: number | string): Promise<boolean> {
    try {
      // Validate ID is a number
      const numericId = Number(id);
      if (isNaN(numericId)) {
        throw new Error('Invalid ID: must be a number');
      }

      const result = await this.db
        .delete(insuranceSimulations)
        .where(eq(insuranceSimulations.id, numericId));

      return result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting simulation:', error);
      throw new Error('Failed to delete simulation');
    }
  }

  /**
   * Check if a simulation exists
   * @param {number | string} id - Simulation ID to check
   * @returns {Promise<boolean>} Existence status
   */
  async exists(id: number | string): Promise<boolean> {
    try {
      const simulation = await this.findById(id);
      return simulation !== null;
    } catch (error) {
      console.error('Error checking simulation existence:', error);
      return false;
    }
  }

  /**
   * List simulations with optional pagination and filtering
   * @param {Object} options - Listing options
   * @param {number} [options.page=1] - Page number
   * @param {number} [options.pageSize=10] - Number of items per page
   * @param {Object} [options.filters] - Filtering options
   * @returns {Promise<{data: InsuranceSimulation[], page: number, pageSize: number, total: number}>} Paginated simulations
   */
  async listSimulations(options: {
    page?: number;
    pageSize?: number;
    filters?: Partial<InsuranceSimulation>;
  } = {}): Promise<{
    data: InsuranceSimulation[];
    page: number;
    pageSize: number;
    total: number;
  }> {
    try {
      const page = Math.max(1, options.page || 1);
      const pageSize = Math.max(1, options.pageSize || 10);
      const offset = (page - 1) * pageSize;

      // Validate and prepare filter conditions
      const filterConditions = options.filters 
        ? Object.entries(options.filters)
            .filter(([_, value]) => value !== undefined)
            .map(([key, value]) => eq(insuranceSimulations[key as keyof InsuranceSimulation], value))
        : [];

      // Fetch paginated results
      const query = this.db
        .select()
        .from(insuranceSimulations)
        .where(sql`true`)
        .limit(pageSize)
        .offset(offset);

      // Apply filters if any
      if (filterConditions.length > 0) {
        query.where(sql.join(filterConditions, ' and '));
      }

      const data = await query;

      // Count total matching records
      const [countResult] = await this.db
        .select({ count: sql`count(*)` })
        .from(insuranceSimulations)
        .where(filterConditions.length > 0 ? sql.join(filterConditions, ' and ') : sql`true`);

      return {
        data,
        page,
        pageSize,
        total: Number(countResult.count)
      };
    } catch (error) {
      console.error('Error listing simulations:', error);
      throw new Error('Failed to list simulations');
    }
  }
}

// Export a singleton instance for easy use
export const insuranceSimulationService = new InsuranceSimulationService();
