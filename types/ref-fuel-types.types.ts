import { z } from 'zod';
import { refFuelTypes } from '../db/schema/ref-fuel-types.schema';

export type FuelType = typeof refFuelTypes.$inferSelect;
export type NewFuelType = typeof refFuelTypes.$inferInsert;

export const FuelTypeCategory = z.enum(['fossil', 'electric', 'hybrid', 'alternative']);
export type FuelTypeCategory = z.infer<typeof FuelTypeCategory>;
