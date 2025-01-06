import { mysqlTable, int, varchar, text, timestamp, unique } from 'drizzle-orm/mysql-core';

export const engineRefOperationTypes = mysqlTable('engine_ref_operation_types', {
  id: int('id').autoincrement().notNull(),
  code: varchar('code', { length: 20 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
}, (table) => {
  return {
    code: unique('code').on(table.code),
  };
});
