import { z } from 'zod';
import { FuelTypeCategory } from '../types/ref-fuel-types.types';

export const fuelTypeSchema = z.object({
  code: z.string().min(1).max(20),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  category: FuelTypeCategory,
  powerConversionFactor: z.number().min(0).default(1.0),
  riskFactor: z.number().min(0).default(1.0),
  ecoBonus: z.number().min(0).default(0.0),
  sortingOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const updateFuelTypeSchema = fuelTypeSchema.partial();

export type CreateFuelTypeDTO = z.infer<typeof fuelTypeSchema>;
export type UpdateFuelTypeDTO = z.infer<typeof updateFuelTypeSchema>;
