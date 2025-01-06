import { eq, and } from 'drizzle-orm';
import { getDatabase } from '../config/database';
import { insurancePackCoverages } from '../database/schema/insurance-pack-coverages.schema';
import { insurancePacks } from '../database/schema/insurance-packs.schema';
import { insuranceCoverages } from '../database/schema/insurance-coverages.schema';
import { 
    InsurancePackCoverage, 
    CreateInsurancePackCoverageInput, 
    InsurancePackCoverageWithDetails,
    InsurancePackCoverageFilter,
    insurancePackCoverageSchema 
} from '../types/insurance-pack-coverages.types';
import { InsurancePacksService } from './insurance-packs.service';

/**
 * Insurance Pack Coverages Service
 * Manages operations related to coverages within insurance packages
 */
export class InsurancePackCoveragesService {
    private readonly db;
    private readonly packService: InsurancePacksService;

    /**
     * Constructor for InsurancePackCoveragesService
     */
    constructor() {
        this.db = getDatabase();
        this.packService = new InsurancePacksService();
    }

    /**
     * Add a coverage to an insurance pack
     * @param data Coverage details
     * @returns Created pack coverage
     */
    async create(data: CreateInsurancePackCoverageInput): Promise<InsurancePackCoverage> {
        // Validate input
        insurancePackCoverageSchema.parse(data);

        // Verify pack exists
        await this.packService.getById(data.packId);

        // Verify coverage exists
        await this.db.select()
            .from(insuranceCoverages)
            .where(eq(insuranceCoverages.id, data.coverageId))
            .limit(1)
            .then(result => {
                if (result.length === 0) {
                    throw new Error(`Coverage with ID ${data.coverageId} not found`);
                }
            });

        // Insert pack coverage
        const [packCoverage] = await this.db.insert(insurancePackCoverages)
            .values(data)
            .returning();

        return packCoverage;
    }

    /**
     * Get all coverages for a pack by pack ID
     * @param packId Pack ID
     * @returns List of coverages with details
     */
    async getCoveragesByPackId(packId: number): Promise<InsurancePackCoverageWithDetails[]> {
        console.log(`Retrieving coverages for pack ID: ${packId}`);
        
        const coverages = await this.db.select({
            id: insurancePackCoverages.id,
            packId: insurancePackCoverages.packId,
            coverageId: insurancePackCoverages.coverageId,
            isMainCoverage: insurancePackCoverages.isMainCoverage,
            options: insurancePackCoverages.options,
            coverageName: insuranceCoverages.coverageName,
            coverageCode: insuranceCoverages.coverageCode,
            coverageDescription: insuranceCoverages.description
        })
        .from(insurancePackCoverages)
        .innerJoin(insuranceCoverages, eq(insurancePackCoverages.coverageId, insuranceCoverages.id))
        .where(eq(insurancePackCoverages.packId, packId));

        console.log('Coverages found:', coverages);
        
        return coverages;
    }

    /**
     * Get all coverages for a pack by pack code
     * @param packCode Pack code
     * @returns List of coverage codes
     */
    async getCoveragesByPackCode(packCode: string): Promise<InsurancePackCoverageWithDetails[]> {
        // First, get the pack ID by code
        const pack = await this.packService.getByCode(packCode);
        
        if (!pack) {
            console.error(`Pack with code ${packCode} not found`);
            throw new Error(`Pack with code ${packCode} not found`);
        }
        const coverages = await this.getCoveragesByPackId(pack.id);
        
        if (!coverages || coverages.length === 0) {
            console.warn(`No coverages found for pack ID: ${pack.id}`);
        }
        return coverages;
    }

    /**
     * List pack coverages with optional filtering
     * @param filter Filtering options
     * @returns List of pack coverages
     */
    async list(filter: InsurancePackCoverageFilter = {}): Promise<InsurancePackCoverageWithDetails[]> {
        const conditions = [];

        // Filter by pack ID
        if (filter.packId) {
            conditions.push(eq(insurancePackCoverages.packId, filter.packId));
        }

        // Filter by main coverage
        if (filter.isMainCoverage !== undefined) {
            conditions.push(eq(insurancePackCoverages.isMainCoverage, filter.isMainCoverage));
        }

        // If pack code is provided, first get the pack ID
        if (filter.packCode) {
            const pack = await this.packService.getByCode(filter.packCode);
            
            if (!pack) {
                return []; // No pack found, return empty list
            }

            conditions.push(eq(insurancePackCoverages.packId, pack.id));
        }

        // Build query with full details
        return this.db.select({
            id: insurancePackCoverages.id,
            packId: insurancePackCoverages.packId,
            coverageId: insurancePackCoverages.coverageId,
            isMainCoverage: insurancePackCoverages.isMainCoverage,
            options: insurancePackCoverages.options,
            coverageName: insuranceCoverages.coverageName,
            coverageCode: insuranceCoverages.coverageCode,
            coverageDescription: insuranceCoverages.description
        })
        .from(insurancePackCoverages)
        .innerJoin(insuranceCoverages, eq(insurancePackCoverages.coverageId, insuranceCoverages.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined);
    }

    /**
     * Remove a coverage from a pack
     * @param id Pack coverage ID
     * @returns True if deleted, false if not found
     */
    async delete(id: number): Promise<boolean> {
        const [deleted] = await this.db.delete(insurancePackCoverages)
            .where(eq(insurancePackCoverages.id, id))
            .returning();

        return !!deleted;
    }

    /**
     * Remove all coverages from a pack
     * @param packId Pack ID
     * @returns Number of coverages removed
     */
    async deleteAllPackCoverages(packId: number): Promise<number> {
        const result = await this.db.delete(insurancePackCoverages)
            .where(eq(insurancePackCoverages.packId, packId));

        return result.length;
    }
}
