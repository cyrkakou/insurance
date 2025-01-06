/**
 * Vehicle details interface for insurance calculations
 */
export interface VehicleDetails {
    category: number;
    horsePower: number;
    fuelType: string;
    seatCount: number;
    maxWeight?: number;
    originalValue: number;
    marketValue: number;
}

/**
 * Contract details interface
 */
export interface ContractDetails {
    duration?: number;
    periodicity?: 'month' | 'day';
}

/**
 * Premium calculation input data
 */
export interface PremiumCalculationInput {
    vehicle: VehicleDetails;
    contract: ContractDetails;
    coverages: CoverageType[];
}

/**
 * Coverage premium details
 */
export interface CoveragePremium {
    prime_annuelle: number;
    prime_periode: number;
}

/**
 * Premium calculation result
 */
export interface PremiumCalculationResult {
    contrat: ContractDetails;
    vehicucle: VehicleDetails;
    premiums: {
        basePremium: number;
        accessoryAmount: number;
        taxes: number;
        fga: number;
        brownCard: number;
        totalPremium: number;
    };
    adjustments: any[];
    coverages: Record<string, CoveragePremium>;
    metadata: {
        issuedAt: string;
        validUntil: string;
        currency: string;
    };
}

/**
 * Coverage types for insurance calculations
 */
export enum CoverageType {
    CIVIL_LIABILITY = 'civil_liability',
    DAMAGE = 'damage',
    COLLISION = 'collision',
    CAPPED_DAMAGE = 'capped_damage',
    THEFT = 'theft',
    FIRE = 'fire',
    GLASS_BREAKAGE = 'glass_breakage',
    ADVANCE_ON_RECOURSE = 'advance_on_recourse',
    PASSENGERS = 'passengers',
    DEFENSE_AND_RECOURSE = 'defense_and_recourse',
    ROADSIDE_ASSISTANCE = 'roadside_assistance'
}
