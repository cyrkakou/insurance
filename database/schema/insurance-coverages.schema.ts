import { mysqlTable, bigint, varchar, text, json, tinyint, timestamp, index, unique } from 'drizzle-orm/mysql-core';

export const insuranceCoverages = mysqlTable('insurance_coverages', {
  id: bigint('id', { mode: 'number' }).autoincrement().notNull(),
  coverageCode: varchar('coverage_code', { length: 50 }).notNull(),
  coverageName: varchar('coverage_name', { length: 100 }).notNull(),
  description: text('description'),
  options: json('options'),
  rules: json('rules'),
  isActive: tinyint('is_active').default(1),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
}, (table) => {
  return {
    idxCoverageCode: index('idx_coverage_code').on(table.coverageCode),
    idxActive: index('idx_active').on(table.isActive),
    coverageCode: unique('coverage_code').on(table.coverageCode),
  };
});
