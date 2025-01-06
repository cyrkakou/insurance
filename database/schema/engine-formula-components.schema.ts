import { mysqlTable, int, tinyint, timestamp } from 'drizzle-orm/mysql-core';

export const engineFormulaComponents = mysqlTable('engine_formula_components', {
  id: int('id').autoincrement().notNull(),
  formulaId: int('formula_id').notNull(),
  componentId: int('component_id').notNull(),
  executionOrder: int('execution_order').notNull(),
  isOptional: tinyint('is_optional').default(0),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
});
