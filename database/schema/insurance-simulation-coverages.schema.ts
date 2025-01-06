import { mysqlTable, bigint, varchar, tinyint, json, decimal, timestamp, index } from 'drizzle-orm/mysql-core';
import { insuranceSimulations } from './insurance-simulations.schema';

export const insuranceSimulationCoverages = mysqlTable('insurance_simulation_coverages', {
  id: bigint('id', { mode: 'number' }).autoincrement().notNull(),
  simulationId: bigint('simulation_id', { mode: 'number' }).notNull().references(() => insuranceSimulations.id, { onDelete: 'restrict', onUpdate: 'restrict' }),
  coverageType: varchar('coverage_type', { length: 50 }).notNull(),
  isMainCoverage: tinyint('is_main_coverage').default(1),
  options: json('options'),
  premiumAmount: decimal('premium_amount', { precision: 15, scale: 2 }).notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
}, (table) => {
  return {
    idxSimulationCoverage: index('idx_simulation_coverage').on(table.simulationId, table.coverageType),
  };
});
