import { eq, and, like, or } from 'drizzle-orm';
import { getDatabase } from '../config/database';
import { insurancePacks } from '../database/schema/insurance-packs.schema';
import { 
    InsurancePack, 
    CreateInsurancePackInput, 
    UpdateInsurancePackInput,
    InsurancePackFilter,
    insurancePackSchema 
} from '../types/insurance-pack.types';

/**
 * Insurance Packs Service
 * Manages CRUD operations for insurance packages
 */
export class InsurancePacksService {
    private readonly db;

    /**
     * Constructor initializing database connection
     */
    constructor() {
        this.db = getDatabase();
    }

    /**
     * Create a new insurance pack
     * @param data Pack creation data
     * @returns Created insurance pack
     * @throws Error if packCode already exists
     */
    async create(data: CreateInsurancePackInput): Promise<InsurancePack> {
        try {
            // Validate input data
            insurancePackSchema.parse(data);

            // Insert pack
            const [pack] = await this.db.insert(insurancePacks)
                .values(data)
                .returning();

            return pack;
        } catch (error) {
            if (error instanceof Error && error.message.includes('Duplicate entry')) {
                throw new Error(`Pack code '${data.packCode}' already exists`);
            }
            throw error;
        }
    }

    /**
     * Update an existing insurance pack
     * @param id Pack ID
     * @param data Update data
     * @returns Updated insurance pack
     * @throws Error if pack not found
     */
    async update(id: number, data: UpdateInsurancePackInput): Promise<InsurancePack> {
        // Validate input data
        insurancePackSchema.partial().parse(data);

        // Update pack
        const [updated] = await this.db.update(insurancePacks)
            .set(data)
            .where(eq(insurancePacks.id, id))
            .returning();

        if (!updated) {
            throw new Error(`Insurance pack with ID ${id} not found`);
        }

        return updated;
    }

    /**
     * Get insurance pack by ID
     * @param id Pack ID
     * @returns Insurance pack or null if not found
     */
    async getById(id: number): Promise<InsurancePack | null> {
        const [pack] = await this.db.select()
            .from(insurancePacks)
            .where(eq(insurancePacks.id, id))
            .limit(1);

        return pack || null;
    }

    /**
     * Get insurance pack by code
     * @param packCode Pack code
     * @returns Insurance pack or null if not found
     */
    async getByCode(packCode: string): Promise<InsurancePack | null> {
        console.log(`Searching for pack with code: ${packCode}`);
        const [pack] = await this.db.select()
            .from(insurancePacks)
            .where(eq(insurancePacks.packCode, packCode))
            .limit(1);

        console.log('Found pack:', pack);
        return pack || null;
    }

    /**
     * List insurance packs with filtering
     * @param filter Filter options
     * @returns Array of insurance packs
     */
    async list(filter: InsurancePackFilter = {}): Promise<InsurancePack[]> {
        const conditions = [];

        // Add filter conditions
        if (filter.isActive !== undefined) {
            conditions.push(eq(insurancePacks.isActive, filter.isActive));
        }

        if (filter.packCode) {
            conditions.push(eq(insurancePacks.packCode, filter.packCode));
        }

        if (filter.search) {
            conditions.push(
                or(
                    like(insurancePacks.packName, `%${filter.search}%`),
                    like(insurancePacks.packDescription || '', `%${filter.search}%`)
                )
            );
        }

        // Build query
        const query = this.db.select()
            .from(insurancePacks);

        // Add where clause if conditions exist
        if (conditions.length > 0) {
            query.where(and(...conditions));
        }

        return query;
    }

    /**
     * Delete an insurance pack
     * @param id Pack ID
     * @returns True if deleted, false if not found
     */
    async delete(id: number): Promise<boolean> {
        const [deleted] = await this.db.delete(insurancePacks)
            .where(eq(insurancePacks.id, id))
            .returning();

        return !!deleted;
    }

    /**
     * Soft delete an insurance pack by setting isActive to 0
     * @param id Pack ID
     * @returns Updated pack if found, null if not found
     */
    async softDelete(id: number): Promise<InsurancePack | null> {
        const [updated] = await this.db.update(insurancePacks)
            .set({ isActive: 0 })
            .where(eq(insurancePacks.id, id))
            .returning();

        return updated || null;
    }

    /**
     * Restore a soft-deleted insurance pack
     * @param id Pack ID
     * @returns Updated pack if found, null if not found
     */
    async restore(id: number): Promise<InsurancePack | null> {
        const [updated] = await this.db.update(insurancePacks)
            .set({ isActive: 1 })
            .where(eq(insurancePacks.id, id))
            .returning();

        return updated || null;
    }
}
