import { mysqlTable, bigint, varchar, int, timestamp, index } from 'drizzle-orm/mysql-core';
import { insuranceSimulations } from './insurance-simulations.schema';

export const insuranceSimulationVehicles = mysqlTable('insurance_simulation_vehicles', {
  id: bigint('id', { mode: 'number' }).autoincrement().notNull(),
  simulationId: bigint('simulation_id', { mode: 'number' }).notNull()
    .references(() => insuranceSimulations.id, { onDelete: 'restrict', onUpdate: 'restrict' }),
  category: int('category').notNull(),
  registrationNumber: varchar('registration_number', { length: 20 }),
  brand: varchar('brand', { length: 50 }).notNull(),
  model: varchar('model', { length: 50 }).notNull(),
  year: int('year').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
}, (table) => {
  return {
    simulationIdIdx: index('idx_simulation_id').on(table.simulationId),
    categoryIdx: index('idx_category').on(table.category),
    registrationNumberIdx: index('idx_registration_number').on(table.registrationNumber),
  };
});
