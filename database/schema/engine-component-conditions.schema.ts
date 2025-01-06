import { mysqlTable, int, varchar, timestamp } from 'drizzle-orm/mysql-core';

export const engineComponentConditions = mysqlTable('engine_component_conditions', {
  id: int('id').autoincrement().notNull(),
  componentId: int('component_id').notNull(),
  refConditionId: int('ref_condition_id').notNull(),
  variableId: int('variable_id').notNull(),
  valueStart: varchar('value_start', { length: 255 }).notNull(),
  valueEnd: varchar('value_end', { length: 255 }),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
});
