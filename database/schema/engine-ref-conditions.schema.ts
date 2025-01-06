import { mysqlTable, int, varchar, text, mysqlEnum, timestamp, index, unique } from 'drizzle-orm/mysql-core';

export const engineRefConditions = mysqlTable('engine_ref_conditions', {
  id: int('id').autoincrement().notNull(),
  code: varchar('code', { length: 50 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  operator: mysqlEnum('operator', ['equals', 'not_equals', 'greater', 'less', 'between', 'in', 'not_in']).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
}, (table) => {
  return {
    code: unique('code').on(table.code),
  };
});
