import { mysqlTable, bigint, varchar, decimal, timestamp, index } from 'drizzle-orm/mysql-core';
import { insuranceSimulations } from './insurance-simulations.schema';

export const insuranceSimulationDiscounts = mysqlTable('insurance_simulation_discounts', {
  id: bigint('id', { mode: 'number' }).autoincrement().notNull(),
  simulationId: bigint('simulation_id', { mode: 'number' }).notNull().references(() => insuranceSimulations.id, { onDelete: 'restrict', onUpdate: 'restrict' }),
  discountType: varchar('discount_type', { length: 50 }).notNull(),
  discountRate: decimal('discount_rate', { precision: 5, scale: 2 }).notNull(),
  discountAmount: decimal('discount_amount', { precision: 15, scale: 2 }).notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
}, (table) => {
  return {
    idxSimulation: index('idx_simulation').on(table.simulationId),
  };
});
