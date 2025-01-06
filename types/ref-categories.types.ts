import { InferModel } from 'drizzle-orm';
import { refCategories } from '@/database/schema/ref-categories.schema';

export type RefCategory = InferModel<typeof refCategories>;
export type NewRefCategory = InferModel<typeof refCategories, 'insert'>;
