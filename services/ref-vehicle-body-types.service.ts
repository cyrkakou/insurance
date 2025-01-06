import { eq } from 'drizzle-orm';
import { getDatabase } from '../config/database';
import { refVehicleBodyTypes } from '../database/schema/ref-vehicle-body-types.schema';
import type { VehicleBodyType, NewVehicleBodyType } from '../types/ref-vehicle-body-types.types';
import { BaseDataService } from './service.schema';

/**
 * Service for managing vehicle body type reference data
 */
export class RefVehicleBodyTypesService extends BaseDataService<VehicleBodyType, NewVehicleBodyType> {
  protected readonly tableName = 'ref_vehicle_body_types';
  protected readonly fieldMapping = {
    code: 'code',
    name: 'name',
    category: 'category',
    isActive: 'is_active'
  };

  /**
   * Find all vehicle body types
   * @param {boolean} [includeInactive=false] - Whether to include inactive body types
   * @returns {Promise<VehicleBodyType[]>} List of vehicle body types
   */
  async findAll(includeInactive = false): Promise<VehicleBodyType[]> {
    const db = getDatabase();
    const query = db.select().from(refVehicleBodyTypes);
    
    if (!includeInactive) {
      query.where(eq(refVehicleBodyTypes.isActive, 1));
    }

    return await query;
  }

  /**
   * Find a vehicle body type by ID
   * @param {number | string} id - Vehicle body type ID
   * @returns {Promise<VehicleBodyType | null>} Vehicle body type if found, null otherwise
   */
  async findById(id: number | string): Promise<VehicleBodyType | null> {
    const db = getDatabase();
    const result = await db
      .select()
      .from(refVehicleBodyTypes)
      .where(eq(refVehicleBodyTypes.id, Number(id)))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Create a new vehicle body type
   * @param {NewVehicleBodyType} data - New vehicle body type data
   * @returns {Promise<VehicleBodyType>} Created vehicle body type
   */
  async create(data: NewVehicleBodyType): Promise<VehicleBodyType> {
    const db = getDatabase();
    const result = await db.insert(refVehicleBodyTypes).values({
      code: data.code,
      name: data.name,
      category: data.category,
      description: data.description,
      isActive: data.isActive ?? true
    });

    const id = Number(result.insertId);
    const created = await this.findById(id);

    if (!created) {
      throw new Error('Failed to create vehicle body type');
    }

    return created;
  }

  /**
   * Update a vehicle body type
   * @param {number | string} id - Vehicle body type ID
   * @param {Partial<VehicleBodyType>} data - Updated vehicle body type data
   * @returns {Promise<VehicleBodyType>} Updated vehicle body type
   */
  async update(id: number | string, data: Partial<VehicleBodyType>): Promise<VehicleBodyType> {
    const db = getDatabase();
    await db
      .update(refVehicleBodyTypes)
      .set(data)
      .where(eq(refVehicleBodyTypes.id, Number(id)));

    const updated = await this.findById(id);

    if (!updated) {
      throw new Error('Failed to update vehicle body type');
    }

    return updated;
  }

  /**
   * Delete a vehicle body type
   * @param {number | string} id - Vehicle body type ID
   * @returns {Promise<boolean>} True if deleted, false otherwise
   */
  async delete(id: number | string): Promise<boolean> {
    const db = getDatabase();
    const result = await db
      .delete(refVehicleBodyTypes)
      .where(eq(refVehicleBodyTypes.id, Number(id)));

    return result.rowsAffected > 0;
  }

  /**
   * Check if a vehicle body type exists
   * @param {number | string} id - Vehicle body type ID
   * @returns {Promise<boolean>} True if exists, false otherwise
   */
  async exists(id: number | string): Promise<boolean> {
    const db = getDatabase();
    const result = await db
      .select({ count: refVehicleBodyTypes.id })
      .from(refVehicleBodyTypes)
      .where(eq(refVehicleBodyTypes.id, Number(id)))
      .limit(1);

    return result[0]?.count > 0;
  }
}
