import { mysqlTable, bigint, varchar, text, int, timestamp, tinyint, index, uniqueIndex } from 'drizzle-orm/mysql-core';

export const refVehicleBodyTypes = mysqlTable('ref_vehicle_body_types', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  code: varchar('code', { length: 10 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  nameFr: varchar('name_fr', { length: 100 }).notNull(),
  category: varchar('category', { length: 50 }).notNull(),
  description: text('description'),
  seatsMin: int('seats_min').notNull().default(1),
  seatsMax: int('seats_max'),
  weightClass: varchar('weight_class', { length: 20 }),
  usageType: varchar('usage_type', { length: 50 }),
  internationalCode: varchar('international_code', { length: 20 }),
  sortOrder: int('sort_order').default(0),
  isActive: tinyint('is_active').default(1),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
}, (table) => ({
  codeUnique: uniqueIndex('code').on(table.code),
  codeIdx: index('idx_code').on(table.code),
  categoryIdx: index('idx_category').on(table.category),
  activeSortIdx: index('idx_active_sort').on(table.isActive, table.sortOrder)
}));
