import { mysqlTable, int, varchar } from 'drizzle-orm/mysql-core';

export const insurancePolicies = mysqlTable('insurance_policies', {
  id: int('id').autoincrement().notNull(),
  referenceNumber: varchar('reference_number', { length: 100 }).notNull(),
});
