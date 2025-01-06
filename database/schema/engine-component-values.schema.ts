import { mysqlTable, int, decimal, mysqlEnum, timestamp } from 'drizzle-orm/mysql-core';

export const engineComponentValues = mysqlTable('engine_component_values', {
  id: int('id').autoincrement().notNull(),
  componentId: int('component_id').notNull(),
  categoryId: int('category_id').notNull(),
  valueType: mysqlEnum('value_type', ['fixed', 'percentage', 'multiplier']).notNull(),
  value: decimal('value', { precision: 10, scale: 4 }).notNull(),
  minValue: decimal('min_value', { precision: 15, scale: 2 }),
  maxValue: decimal('max_value', { precision: 15, scale: 2 }),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
});
