import { mysqlTable, varchar, int, decimal, timestamp } from 'drizzle-orm/mysql-core';

export const insuranceRates = mysqlTable('insurance_rates', {
  id: int('id').primaryKey().autoincrement(),
  vehicleType: varchar('vehicle_type', { length: 50 }).notNull(),
  baseRate: decimal('base_rate', { precision: 10, scale: 2 }).notNull(),
  riskFactor: decimal('risk_factor', { precision: 5, scale: 2 }).notNull(),
  minAge: int('min_age').notNull(),
  maxAge: int('max_age').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});
