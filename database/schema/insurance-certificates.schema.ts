import { mysqlTable, bigint, varchar, timestamp, index } from 'drizzle-orm/mysql-core';

export const insuranceCertificates = mysqlTable('insurance_certificate', {
  id: bigint('id', { mode: 'number' }).autoincrement().notNull(),
  certificateNumber: varchar('certificate_number', { length: 100 }),
  registrationNumber: varchar('registration_number', { length: 100 }),
  chassisNumber: varchar('chassis_number', { length: 100 }),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  status: varchar('status', { length: 20 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
}, (table) => {
  return {
    certificateNumberIdx: index('idx_certificate_number').on(table.certificateNumber),
    registrationNumberIdx: index('idx_registration_number').on(table.registrationNumber),
    chassisNumberIdx: index('idx_chassis_number').on(table.chassisNumber),
    startDateIdx: index('idx_start_date').on(table.startDate),
    endDateIdx: index('idx_end_date').on(table.endDate),
    statusIdx: index('idx_status').on(table.status),
  };
});
