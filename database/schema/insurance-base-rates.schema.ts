import { mysqlTable, int, varchar, decimal, timestamp, index } from 'drizzle-orm/mysql-core';

export const insuranceBaseRates = mysqlTable('insurance_base_rates', {
  id: int('id').autoincrement().notNull(),
  category: varchar('category', { length: 50 }).notNull(),
  subCategory: varchar('sub_category', { length: 50 }),
  fiscalPower: varchar('fiscal_power', { length: 20 }).notNull(),
  rate: decimal('rate', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
}, (table) => {
  return {
    categorySubCategoryFiscalPower: index('category_sub_category_fiscal_power').on(table.category, table.subCategory, table.fiscalPower),
  };
});
