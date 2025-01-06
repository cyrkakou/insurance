import { mysqlTable, bigint, varchar, timestamp, json, mysqlEnum, index, uniqueIndex } from 'drizzle-orm/mysql-core';

export const insuranceSimulations = mysqlTable('insurance_simulations', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement().notNull(),
  packId: bigint('pack_id', { mode: 'number' }),
  referenceNumber: varchar('reference_number', { length: 20 }).notNull().unique(),
  simulationDate: timestamp('simulation_date').notNull(),
  params: json('params'),
  result: json('result'),
  status: mysqlEnum('status', ['draft', 'completed', 'expired']).default('draft').notNull(),
  clientType: mysqlEnum('client_type', ['individual', 'company']).notNull(),
  clientName: varchar('client_name', { length: 100 }),
  clientEmail: varchar('client_email', { length: 100 }),
  clientPhone: varchar('client_phone', { length: 20 }),
  validityPeriod: bigint('validity_period', { mode: 'number' }).default(7),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  referenceNumberIdx: uniqueIndex('idx_reference_number').on(table.referenceNumber),
  clientIdx: index('idx_client').on(table.clientType, table.clientName),
  dateIdx: index('idx_date').on(table.simulationDate),
}));
