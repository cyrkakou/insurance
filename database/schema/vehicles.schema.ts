import { mysqlTable, varchar, int, decimal, timestamp } from 'drizzle-orm/mysql-core';

export const vehicles = mysqlTable('vehicles', {
  id: int('id').primaryKey().autoincrement(),
  make: varchar('make', { length: 255 }).notNull(),
  model: varchar('model', { length: 255 }).notNull(),
  year: int('year').notNull(),
  value: decimal('value', { precision: 10, scale: 2 }).notNull(),
  fuelTypeId: int('fuel_type_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});
