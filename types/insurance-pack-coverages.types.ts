import { z } from 'zod';

/**
 * Insurance Pack Coverage Schema
 */
export const insurancePackCoverageSchema = z.object({
    id: z.number().optional(),
    packId: z.number(),
    coverageId: z.number(),
    isMainCoverage: z.number().min(0).max(1).default(0),
    options: z.record(z.any()).nullable().optional(),
    createdAt: z.string().optional()
});

/**
 * Insurance Pack Coverage Type
 */
export type InsurancePackCoverage = z.infer<typeof insurancePackCoverageSchema>;

/**
 * Create Insurance Pack Coverage Input
 */
export type CreateInsurancePackCoverageInput = Omit<InsurancePackCoverage, 'id' | 'createdAt'>;

/**
 * Insurance Pack Coverage with Coverage Details
 */
export interface InsurancePackCoverageWithDetails extends InsurancePackCoverage {
    coverageName: string;
    coverageCode: string;
    coverageDescription?: string;
}

/**
 * Filter Options for Insurance Pack Coverages
 */
export interface InsurancePackCoverageFilter {
    packId?: number;
    packCode?: string;
    isMainCoverage?: number;
}
