import { z } from 'zod';

// Vehicle Schema
export const VehicleSchema = z.object({
  category: z.number().int().positive(),
  subCategory: z.string(),
  registrationNumber: z.string(),
  horsePower: z.number().int().positive(),
  seatCount: z.number().int().positive(),
  firstUseDate: z.string().refine(
    (date) => /^\d{4}-\d{2}-\d{2}$/.test(date) && !isNaN(Date.parse(date)),
    { message: "Invalid date format. Use YYYY-MM-DD" }
  ),
  originalValue: z.number().positive(),
  marketValue: z.number().positive(),
  fuelType: z.string(),
  usage: z.string(),
  maxWeight: z.number().positive()
});

// Contract Schema
export const ContractSchema = z.object({
  duration: z.number().int().positive(),
  periodicity: z.enum(['month', 'year']),
  startDate: z.string().refine(
    (date) => /^\d{4}-\d{2}-\d{2}$/.test(date) && !isNaN(Date.parse(date)),
    { message: "Invalid date format. Use YYYY-MM-DD" }
  )
});

// Quote Request Schema
export const CarQuoteRequestSchema = z.object({
  package: z.string(),
  contract: ContractSchema,
  vehicle: VehicleSchema
});

// Types derived from schemas
export type Vehicle = z.infer<typeof VehicleSchema>;
export type Contract = z.infer<typeof ContractSchema>;
export type CarQuoteRequest = z.infer<typeof CarQuoteRequestSchema>;

// Quote Response Types
export interface Premiums {
  basePremium: number;
  accessoryAmount: number;
  taxes: number;
  fga: number;
  brownCard: number;
  totalPremium: number;
}

export interface Coverage {
  prime_annuelle: number;
  prime_periode: number;
}

export interface Coverages {
  civil_liability: Coverage;
  glass_breakage: Coverage;
  advance_on_recourse: Coverage;
  passengers: Coverage;
  defense_and_recourse: Coverage;
}

export interface Metadata {
  issuedAt: string;
  validUntil: string;
  currency: string;
}

export interface Pack {
  code: string;
  name: string;
  description: string;
}

export interface CarQuoteResponse {
  status: 'success' | 'error';
  data: {
    contrat: Contract;
    vehicucle: Vehicle;
    premiums: Premiums;
    adjustments: any[];
    coverages: Coverages;
    metadata: Metadata;
    pack: Pack;
    reference: string;
  };
}
