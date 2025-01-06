import { z } from 'zod';

/**
 * Insurance Pack Schema
 */
export const insurancePackSchema = z.object({
    id: z.number().optional(),
    packCode: z.string().min(1).max(50),
    packName: z.string().min(1).max(100),
    packDescription: z.string().nullable().optional(),
    options: z.record(z.any()).nullable().optional(),
    configuration: z.record(z.any()).nullable().optional(),
    isActive: z.boolean().default(true),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional()
});

/**
 * Insurance Pack Type
 */
export type InsurancePack = z.infer<typeof insurancePackSchema>;

/**
 * Create Insurance Pack Input
 */
export type CreateInsurancePackInput = Omit<InsurancePack, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Update Insurance Pack Input
 */
export type UpdateInsurancePackInput = Partial<Omit<InsurancePack, 'id' | 'createdAt' | 'updatedAt'>>;

/**
 * Insurance Pack Filter Options
 */
export interface InsurancePackFilter {
    isActive?: boolean;
    packCode?: string;
    search?: string;
}
