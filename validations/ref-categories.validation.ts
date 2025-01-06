import { z } from 'zod';

export const RefCategorySchema = z.object({
  id: z.number().optional(),
  code: z.string().min(1).max(10),
  name: z.string().min(1).max(100),
  description: z.string().nullable().optional(),
  minPower: z.number().min(0).default(0),
  maxPower: z.number().min(0).default(999),
  parentId: z.number().nullable().optional(),
  isActive: z.boolean().default(true),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type RefCategoryInput = z.infer<typeof RefCategorySchema>;
