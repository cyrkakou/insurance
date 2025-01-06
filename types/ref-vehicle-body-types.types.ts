import type { InferModel } from 'drizzle-orm';
import { refVehicleBodyTypes } from '@/database/schema/ref-vehicle-body-types.schema';

export type VehicleBodyType = InferModel<typeof refVehicleBodyTypes>;
export type NewVehicleBodyType = InferModel<typeof refVehicleBodyTypes, 'insert'>;
