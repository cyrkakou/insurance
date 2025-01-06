import { mysqlTable, int, varchar, text, mysqlEnum, decimal, timestamp, tinyint } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

export const refFuelTypes = mysqlTable('ref_fuel_types', {
  id: int('id').autoincrement().notNull(),
  code: varchar('code', { length: 20 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  category: mysqlEnum('category', ['fossil', 'electric', 'hybrid', 'alternative']).notNull(),
  powerConversionFactor: decimal('power_conversion_factor', { precision: 10, scale: 4 }).default('1.0000'),
  riskFactor: decimal('risk_factor', { precision: 10, scale: 4 }).default('1.0000'),
  ecoBonus: decimal('eco_bonus', { precision: 10, scale: 4 }).default('0.0000'),
  sortingOrder: int('sorting_order').default(0),
  isActive: tinyint('is_active').default(1),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  idxCode: mysqlTable.index('idx_code').on(table.code),
  idxCategory: mysqlTable.index('idx_category').on(table.category),
  idxActive: mysqlTable.index('idx_active').on(table.isActive),
  code: mysqlTable.unique('code').on(table.code),
}));
