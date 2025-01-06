import { mysqlTable, int, varchar, text, decimal, tinyint, timestamp, index, unique } from 'drizzle-orm/mysql-core';
import { refCategories } from './ref-categories.schema';

export const insuranceCategories = mysqlTable('insurance_categories', {
  id: int('id').autoincrement().notNull(),
  code: varchar('code', { length: 20 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  refCategoryId: int('ref_category_id').notNull().references(() => refCategories.id, { onDelete: 'restrict', onUpdate: 'restrict' }),
  powerCategory: varchar('power_category', { length: 50 }),
  maxWeight: decimal('max_weight', { precision: 10, scale: 2 }),
  maxSeats: int('max_seats'),
  isActive: tinyint('is_active').default(1),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
}, (table) => {
  return {
    idxCode: index('idx_code').on(table.code),
    idxCategory: index('idx_category').on(table.refCategoryId),
    idxActive: index('idx_active').on(table.isActive),
    code: unique('code').on(table.code),
  };
});
