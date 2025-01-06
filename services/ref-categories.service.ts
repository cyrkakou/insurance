import { eq } from 'drizzle-orm';
import { getDatabase } from '../config/database';
import { refCategories } from '../database/schema/ref-categories.schema';
import type { Category, NewCategory } from '../types/ref-categories.types';
import { BaseDataService } from './service.schema';

/**
 * Service for managing category reference data
 */
export class RefCategoriesService extends BaseDataService<Category, NewCategory> {
  protected readonly tableName = 'ref_categories';
  protected readonly fieldMapping = {
    code: 'code',
    name: 'name',
    parentId: 'parent_id',
    isActive: 'is_active'
  };

  /**
   * Find all categories
   * @param {boolean} [includeInactive=false] - Whether to include inactive categories
   * @returns {Promise<Category[]>} List of categories
   */
  async findAll(includeInactive = false): Promise<Category[]> {
    const db = getDatabase();
    const query = db.select().from(refCategories);
    
    if (!includeInactive) {
      query.where(eq(refCategories.isActive, 1));
    }

    return await query;
  }

  /**
   * Find a category by ID
   * @param {number | string} id - Category ID
   * @returns {Promise<Category | null>} Category if found, null otherwise
   */
  async findById(id: number | string): Promise<Category | null> {
    const db = getDatabase();
    const result = await db
      .select()
      .from(refCategories)
      .where(eq(refCategories.id, Number(id)))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Create a new category
   * @param {NewCategory} data - New category data
   * @returns {Promise<Category>} Created category
   */
  async create(data: NewCategory): Promise<Category> {
    const db = getDatabase();
    const result = await db.insert(refCategories).values({
      code: data.code,
      name: data.name,
      parentId: data.parentId,
      description: data.description,
      isActive: data.isActive ?? true
    });

    const id = Number(result.insertId);
    const created = await this.findById(id);

    if (!created) {
      throw new Error('Failed to create category');
    }

    return created;
  }

  /**
   * Update a category
   * @param {number | string} id - Category ID
   * @param {Partial<Category>} data - Updated category data
   * @returns {Promise<Category>} Updated category
   */
  async update(id: number | string, data: Partial<Category>): Promise<Category> {
    const db = getDatabase();
    await db
      .update(refCategories)
      .set(data)
      .where(eq(refCategories.id, Number(id)));

    const updated = await this.findById(id);

    if (!updated) {
      throw new Error('Failed to update category');
    }

    return updated;
  }

  /**
   * Delete a category
   * @param {number | string} id - Category ID
   * @returns {Promise<boolean>} True if deleted, false otherwise
   */
  async delete(id: number | string): Promise<boolean> {
    const db = getDatabase();
    const result = await db
      .delete(refCategories)
      .where(eq(refCategories.id, Number(id)));

    return result.rowsAffected > 0;
  }

  /**
   * Check if a category exists
   * @param {number | string} id - Category ID
   * @returns {Promise<boolean>} True if exists, false otherwise
   */
  async exists(id: number | string): Promise<boolean> {
    const db = getDatabase();
    const result = await db
      .select({ count: refCategories.id })
      .from(refCategories)
      .where(eq(refCategories.id, Number(id)))
      .limit(1);

    return result[0]?.count > 0;
  }
}
