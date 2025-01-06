import { mysqlTable, int, varchar, text, timestamp, tinyint, index, uniqueIndex, foreignKey } from 'drizzle-orm/mysql-core';

export const refCategories = mysqlTable('ref_categories', {
  id: int('id').autoincrement().primaryKey(),
  code: varchar('code', { length: 10 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  minPower: int('min_power').default(0),
  maxPower: int('max_power').default(999),
  parentId: int('parent_id').references(() => refCategories.id),
  isActive: tinyint('is_active').default(1),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
}, (table) => ({
  codeUnique: uniqueIndex('code').on(table.code),
  codeIdx: index('idx_code').on(table.code),
  activeIdx: index('idx_active').on(table.isActive),
  parentIdx: index('parent_id').on(table.parentId),
}));
