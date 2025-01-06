import { mysqlTable, bigint, tinyint, json, timestamp, index, unique } from 'drizzle-orm/mysql-core';
import { insurancePacks } from './insurance-packs.schema';
import { insuranceCoverages } from './insurance-coverages.schema';

export const insurancePackCoverages = mysqlTable('insurance_pack_coverages', {
  id: bigint('id', { mode: 'number' }).autoincrement().notNull(),
  packId: bigint('pack_id', { mode: 'number' }).notNull().references(() => insurancePacks.id, { onDelete: 'restrict', onUpdate: 'restrict' }),
  coverageId: bigint('coverage_id', { mode: 'number' }).notNull().references(() => insuranceCoverages.id, { onDelete: 'restrict', onUpdate: 'restrict' }),
  isMainCoverage: tinyint('is_main_coverage').default(0),
  options: json('options'),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
}, (table) => {
  return {
    coverageId: index('coverage_id').on(table.coverageId),
    ukPackCoverage: unique('uk_pack_coverage').on(table.packId, table.coverageId),
  };
});
