import { SQL } from 'drizzle-orm';

/**
 * Base interface for all data services
 * @template T The type of the data model
 * @template N The type for new data entries
 */
export interface IDataService<T, N> {
  /**
   * Retrieves a record by its ID
   * @param {number | string} id - Record identifier
   * @returns {Promise<T | null>} Record if found, null otherwise
   */
  findById(id: number | string): Promise<T | null>;

  /**
   * Retrieves all records matching the filter criteria
   * @param {Partial<T>} [filter] - Filter criteria
   * @returns {Promise<T[]>} Array of records
   */
  findAll(filter?: Partial<T>): Promise<T[]>;

  /**
   * Creates a new record
   * @param {N} data - Data for creation
   * @returns {Promise<T>} Created record
   */
  create(data: N): Promise<T>;

  /**
   * Updates an existing record
   * @param {number | string} id - Record identifier
   * @param {Partial<T>} data - Data for update
   * @returns {Promise<T>} Updated record
   */
  update(id: number | string, data: Partial<T>): Promise<T>;

  /**
   * Permanently deletes a record
   * @param {number | string} id - Record identifier
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  delete(id: number | string): Promise<boolean>;

  /**
   * Checks if a record exists
   * @param {number | string} id - Record identifier
   * @returns {Promise<boolean>} True if exists
   */
  exists(id: number | string): Promise<boolean>;

  /**
   * Finds records by a specific field value
   * @param {string} field - Field to search by
   * @param {string} value - Value to search for
   * @param {boolean} [multiple=false] - Whether to return multiple results
   * @returns {Promise<T | T[] | null>} Found record(s) or null
   */
  findByField(field: string, value: string, multiple?: boolean): Promise<T | T[] | null>;
}

/**
 * Base class implementing common CRUD operations for data services
 * @template T The type of the data model
 * @template N The type for new data entries
 */
export abstract class BaseDataService<T, N> implements IDataService<T, N> {
  /**
   * Table name in the database
   * @protected
   */
  protected abstract readonly tableName: string;

  /**
   * List of fields that can be searched
   * @protected
   */
  protected abstract readonly searchableFields: string[];

  /**
   * Mapping of external field names to internal field names
   * @protected
   */
  protected abstract readonly fieldMapping: { [key: string]: string };

  /**
   * Retrieves a record by its ID
   * @param {number | string} id - Record identifier
   * @returns {Promise<T | null>} Record if found, null otherwise
   */
  abstract findById(id: number | string): Promise<T | null>;

  /**
   * Retrieves all records matching the filter criteria
   * @param {Partial<T>} [filter] - Filter criteria
   * @returns {Promise<T[]>} Array of records
   */
  abstract findAll(filter?: Partial<T>): Promise<T[]>;

  /**
   * Creates a new record
   * @param {N} data - Data for creation
   * @returns {Promise<T>} Created record
   */
  abstract create(data: N): Promise<T>;

  /**
   * Updates an existing record
   * @param {number | string} id - Record identifier
   * @param {Partial<T>} data - Data for update
   * @returns {Promise<T>} Updated record
   */
  abstract update(id: number | string, data: Partial<T>): Promise<T>;

  /**
   * Permanently deletes a record
   * @param {number | string} id - Record identifier
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  abstract delete(id: number | string): Promise<boolean>;

  /**
   * Checks if a record exists
   * @param {number | string} id - Record identifier
   * @returns {Promise<boolean>} True if exists
   */
  abstract exists(id: number | string): Promise<boolean>;

  /**
   * Finds records by a specific field value
   * @param {string} field - Field to search by
   * @param {string} value - Value to search for
   * @param {boolean} [multiple=false] - Whether to return multiple results
   * @returns {Promise<T | T[] | null>} Found record(s) or null
   */
  abstract findByField(field: string, value: string, multiple?: boolean): Promise<T | T[] | null>;

  /**
   * Retrieves a record by its ID
   * @param {number | string} id - Record identifier
   * @returns {Promise<T | null>} Record if found, null otherwise
   */
  abstract findById(id: number | string): Promise<T | null>;

  /**
   * Checks if a field is searchable
   * @param {string} field - Field name to check
   * @returns {boolean} True if field is searchable
   */
  isFieldSearchable(field: string): boolean {
    const normalizedField = this.normalizeFieldName(field);
    return this.searchableFields.includes(normalizedField);
  }

  /**
   * Normalizes a field name according to the mapping
   * @param {string} field - Field name to normalize
   * @returns {string} Normalized field name
   * @throws {Error} If field is not recognized
   */
  normalizeFieldName(field: string): string {
    const normalizedField = this.fieldMapping[field.toLowerCase()];
    if (!normalizedField) {
      throw new Error(`Field '${field}' not recognized`);
    }
    return normalizedField;
  }

  /**
   * Validates a search field
   * @protected
   * @param {string} field - Field to validate
   * @throws {Error} If field is not searchable
   */
  protected validateSearchField(field: string): void {
    if (!this.isFieldSearchable(field)) {
      const error = `Search by field '${field}' not allowed`;
      this.logError(error);
      throw new Error(error);
    }
  }

  /**
   * Validates an isActive value
   * @protected
   * @param {number} value - Value to validate
   * @throws {Error} If value is invalid
   */
  protected validateIsActiveValue(value: number): void {
    if (![0, 1].includes(value)) {
      throw new Error('isActive value must be 0 or 1');
    }
  }

  /**
   * Logs a debug message
   * @protected
   * @param {string} message - Message to log
   * @param {...any} args - Additional arguments
   */
  protected logDebug(message: string, ...args: any[]): void {
    console.log(`[DEBUG] [${this.tableName}] ${message}`, ...args);
  }

  /**
   * Logs an error message
   * @protected
   * @param {string} message - Message to log
   * @param {any} [error] - Error object
   */
  protected logError(message: string, error?: any): void {
    console.error(`[ERROR] [${this.tableName}] ${message}`, error || '');
  }
}
