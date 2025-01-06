import { mysqlTable, bigint, varchar, text, json, tinyint, timestamp, index, unique } from 'drizzle-orm/mysql-core';

export const insurancePacks = mysqlTable('insurance_packs', {
  id: bigint('id', { mode: 'number' }).autoincrement().notNull(),
  packCode: varchar('pack_code', { length: 50 }).notNull(),
  packName: varchar('pack_name', { length: 100 }).notNull(),
  packDescription: text('pack_description'),
  options: json('options'),
  configuration: json('configuration'),
  isActive: tinyint('is_active').default(1),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
}, (table) => {
  return {
    idxPackCode: index('idx_pack_code').on(table.packCode),
    idxActive: index('idx_active').on(table.isActive),
    packCode: unique('pack_code').on(table.packCode),
  };
});
