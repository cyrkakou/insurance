import { mysqlTable, int, varchar, text, json, mysqlEnum, timestamp, index } from 'drizzle-orm/mysql-core';

export const insuranceRules = mysqlTable('insurance_rules', {
  id: int('id').autoincrement().notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  type: varchar('type', { length: 50 }).notNull(),
  category: varchar('category', { length: 50 }).notNull(),
  conditionExpression: text('condition_expression').notNull(),
  parameters: json('parameters'),
  priority: int('priority').default(0).notNull(),
  status: mysqlEnum('status', ['active', 'inactive']).default('active').notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
}, (table) => {
  return {
    typeCategoryStatus: index('type_category_status').on(table.type, table.category, table.status),
  };
});
