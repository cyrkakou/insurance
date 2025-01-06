import { eq } from 'drizzle-orm';
import { getDatabase } from '../config/database';
import { refFuelTypes } from '../database/schema/ref-fuel-types.schema';
import type { FuelType, NewFuelType } from '../types/ref-fuel-types.types';
import { BaseDataService } from './service.schema';

/**
 * Service for managing fuel type reference data
 */
export class RefFuelTypesService extends BaseDataService<FuelType, NewFuelType> {
  protected readonly tableName = 'ref_fuel_types';
  protected readonly searchableFields = ['code', 'name', 'category', 'isActive'];
  protected readonly fieldMapping = {
    code: 'code',
    name: 'name',
    category: 'category',
    isActive: 'is_active'
  };

  /**
   * Find all active fuel types
   * @returns {Promise<FuelType[]>} List of active fuel types
   */
  async findActiveFuelTypes(): Promise<FuelType[]> {
    return this.findAll(false);
  }

  /**
   * Find all fuel types
   * @param {boolean} [includeInactive=false] - Whether to include inactive fuel types
   * @returns {Promise<FuelType[]>} List of fuel types
   */
  async findAll(includeInactive = false): Promise<FuelType[]> {
    const db = getDatabase();
    const query = db.select().from(refFuelTypes);
    
    if (!includeInactive) {
      query.where(eq(refFuelTypes.isActive, 1));
    }

    return await query;
  }

  /**
   * Find a fuel type by ID
   * @param {number | string} id - Fuel type ID
   * @returns {Promise<FuelType | null>} Fuel type if found, null otherwise
   */
  async findById(id: number | string): Promise<FuelType | null> {
    const db = getDatabase();
    const result = await db
      .select()
      .from(refFuelTypes)
      .where(eq(refFuelTypes.id, Number(id)))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Create a new fuel type
   * @param {NewFuelType} data - New fuel type data
   * @returns {Promise<FuelType>} Created fuel type
   */
  async create(data: NewFuelType): Promise<FuelType> {
    const db = getDatabase();
    const result = await db.insert(refFuelTypes).values({
      code: data.code,
      name: data.name,
      description: data.description,
      category: data.category,
      powerConversionFactor: data.powerConversionFactor,
      riskFactor: data.riskFactor,
      ecoBonus: data.ecoBonus,
      sortingOrder: data.sortingOrder,
      isActive: data.isActive ?? 1
    });

    if (!result[0].insertId) {
      throw new Error('Failed to create fuel type: No insert ID returned');
    }

    const created = await this.findById(result[0].insertId);

    if (!created) {
      throw new Error('Failed to create fuel type: Could not find created record');
    }

    return created;
  }

  /**
   * Update a fuel type
   * @param {number | string} id - Fuel type ID
   * @param {Partial<FuelType>} data - Updated fuel type data
   * @returns {Promise<FuelType>} Updated fuel type
   */
  async update(id: number | string, data: Partial<FuelType>): Promise<FuelType> {
    const db = getDatabase();
    await db
      .update(refFuelTypes)
      .set(data)
      .where(eq(refFuelTypes.id, Number(id)));

    const updated = await this.findById(id);

    if (!updated) {
      throw new Error('Failed to update fuel type');
    }

    return updated;
  }

  /**
   * Delete a fuel type
   * @param {number | string} id - Fuel type ID
   * @returns {Promise<boolean>} True if deleted, false otherwise
   */
  async delete(id: number | string): Promise<boolean> {
    const db = getDatabase();
    const result = await db
      .delete(refFuelTypes)
      .where(eq(refFuelTypes.id, Number(id)));

    return result.rowsAffected > 0;
  }

  /**
   * Check if a fuel type exists
   * @param {number | string} id - Fuel type ID
   * @returns {Promise<boolean>} True if exists, false otherwise
   */
  async exists(id: number | string): Promise<boolean> {
    const db = getDatabase();
    const result = await db
      .select({ count: refFuelTypes.id })
      .from(refFuelTypes)
      .where(eq(refFuelTypes.id, Number(id)))
      .limit(1);

    return result[0]?.count > 0;
  }

  /**
   * Find records by a specific field value
   * @param {string} field - Field to search by
   * @param {string} value - Value to search for
   * @param {boolean} [multiple=false] - Whether to return multiple results
   * @returns {Promise<FuelType | FuelType[] | null>} Found record(s) or null
   */
  async findByField(field: string, value: string, multiple = false): Promise<FuelType | FuelType[] | null> {
    try {
      this.validateSearchField(field);
      const db = getDatabase();
      const normalizedField = this.normalizeFieldName(field);
      
      // Handle isActive field specially
      if (normalizedField === 'is_active') {
        const numericValue = parseInt(value, 10);
        this.validateIsActiveValue(numericValue);
        value = numericValue.toString();
      }

      const query = db.select()
        .from(refFuelTypes)
        .where(eq(refFuelTypes[normalizedField], value));

      if (!multiple) {
        query.limit(1);
      }

      const results = await query;
      
      if (results.length === 0) {
        return null;
      }

      return multiple ? results : results[0];
    } catch (error) {
      this.logError('Error in findByField', error);
      throw error;
    }
  }
}
