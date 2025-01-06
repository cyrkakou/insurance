import { mysqlTable, int } from 'drizzle-orm/mysql-core';

export const insurancePackCategories = mysqlTable('insurance_pack_categories', {
  packId: int('pack_id').notNull(),
  categoryId: int('category_id').notNull(),
});
