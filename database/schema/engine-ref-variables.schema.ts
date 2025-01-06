import { mysqlTable, int, varchar, text, mysqlEnum, timestamp, unique } from 'drizzle-orm/mysql-core';

export const engineRefVariables = mysqlTable('engine_ref_variables', {
  id: int('id').autoincrement().notNull(),
  code: varchar('code', { length: 50 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  dataType: mysqlEnum('data_type', ['numeric', 'boolean', 'string', 'date']).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
}, (table) => {
  return {
    code: unique('code').on(table.code),
  };
});
