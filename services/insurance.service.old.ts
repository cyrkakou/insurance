import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

// Custom error for rate lookup
export class RateNotFoundException extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'RateNotFoundException';
    }
}

// Vehicle category type
export type VehicleCategory = 1 | 2 | 3 | 4 | 5;

// Vehicle type for commercial vehicles
export type CommercialVehicleType = 'tourism' | 'under3.5' | 'over3.5';

// Rate configuration type
type RateConfig = { min: number; max: number | null; rate: number };

/**
 * @description Comprehensive Insurance Calculation Service
 * @class InsuranceService
 * @remarks Maintains 100% fidelity with original PHP implementation
 */
export class InsuranceService {
    // Constants
    private static readonly PERIODICITE_DAYS = 'day';
    private static readonly PERIODICITE_MONTH = 'month';
    private static readonly TAXES_RATE = 14/100;
    private static readonly FGA_RATE = 2.5/100;
    private static readonly COMMERCIAL_RATE = 80/100;
    private static readonly ACCESSOIRES_AMOUNT = 3000;
    private static readonly BROWN_CARD_AMOUNT = 300;

    /**
     * Table de correspondance mois -> taux
     */
    private static readonly MONTHLY_RATES: { [key: number]: number } = {
        1: 8.75,
        2: 17.50,
        3: 26.25,
        4: 35.00,
        5: 43.75,
        6: 52.50,
        7: 61.25,
        8: 70.00,
        9: 78.75,
        10: 87.50,
        11: 96.25,
        12: 100.00
    };

    /**
     * Coverage types and their mandatory status
     */
    private static readonly COVERAGES: { 
        [key: string]: { 
            isRequired?: boolean, 
            isMandatory?: boolean | null 
        } 
    } = {
        'civil_liability': {
            isRequired: true,
            isMandatory: true
        },
        'damage': {
            isMandatory: true
        },
        'collision': {
            isMandatory: true
        },
        'capped_damage': {
            isMandatory: true
        },
        'theft': {
            isMandatory: true
        },
        'fire': {
            isMandatory: true
        },
        'glass_breakage': {
            isMandatory: false
        },
        'advance_on_recourse': {
            isMandatory: false
        },
        'passengers': {
            isMandatory: false
        },
        'defense_and_recourse': {
            isMandatory: false
        },
        'roadside_assistance': {
            isMandatory: null
        }
    };

    /**
     * Taux de prime pour les garanties complémentaires
     */
    private static readonly COVERAGE_RATES: {
        [key: string]: {
            [key: number]: number
        } | {
            rate?: number,
            min_premium?: number,
            insured_capital?: number[],
            amount?: { [key: number]: number }
        }
    } = {
        'damage': {
            1: 2.60, // Catégorie 1
            2: 5.20, // Catégorie 2
            3: 5.20  // Catégorie 3
        },
        'collision': {
            1: 1.65, // Catégorie 1
            2: 2.55, // Catégorie 2
            3: 2.60  // Catégorie 3
        },
        'capped_damage': {
            rate: 4.20,
            min_premium: 100000
        },
        'theft': {
            rate: 0.14,
        },
        'fire': {
            rate: 0.15,
        },
        'advance_on_recourse': {
            insured_capital: [500000, 1000000, 2000000],
            rate: 2.75,
        },
        'defense_and_recourse': {
            amount: {
                1: 3000,
                2: 4000,
                3: 4000,
                4: 4000,
                5: 5000,
            }
        }
    };

    // Base Rates for RC Premium Calculation
    private static readonly BASE_RATES: {
        1: RateConfig[];
        2: {
            tourism: RateConfig[];
            'under3.5': RateConfig[];
            'over3.5': RateConfig[];
        };
        3: RateConfig[];
        4: RateConfig[];
        5: RateConfig[];
    } = {
        1: [ // Tourism vehicles
            { min: 0, max: 2, rate: 37601 },
            { min: 3, max: 6, rate: 45181 },
            { min: 7, max: 10, rate: 51078 },
            { min: 11, max: 14, rate: 65677 },
            { min: 15, max: 23, rate: 86456 },
            { min: 24, max: null, rate: 104143 }
        ],
        2: { // Commercial vehicles
            tourism: [
                { min: 0, max: 2, rate: 56958 },
                { min: 3, max: 6, rate: 67644 },
                { min: 7, max: 10, rate: 78974 },
                { min: 11, max: 14, rate: 113944 },
                { min: 15, max: 23, rate: 146969 },
                { min: 24, max: null, rate: 174491 }
            ],
            'under3.5': [
                { min: 0, max: 2, rate: 88759 },
                { min: 3, max: 6, rate: 101048 },
                { min: 7, max: 10, rate: 127880 },
                { min: 11, max: 14, rate: 168085 },
                { min: 15, max: 23, rate: 206063 },
                { min: 24, max: null, rate: 237710 }
            ],
            'over3.5': [
                { min: 0, max: 2, rate: 91294 },
                { min: 3, max: 6, rate: 103580 },
                { min: 7, max: 10, rate: 130415 },
                { min: 11, max: 14, rate: 170617 },
                { min: 15, max: 23, rate: 208597 },
                { min: 24, max: null, rate: 240245 }
            ]
        },
        3: [], // Placeholder for category 3
        4: [], // Placeholder for category 4
        5: []  // Placeholder for category 5
    };

    /**
     * Validates the details of a vehicle for rate calculation
     * 
     * @param category Numeric identifier for vehicle category (1-5)
     * @param horsePower Total horse power of the vehicle
     * @param vehicleType Optional type specification for commercial vehicles
     * 
     * @throws {Error} If any validation check fails
     */
    private validateVehicleDetails(
        category: VehicleCategory, 
        horsePower: number, 
        vehicleType?: CommercialVehicleType
    ): void {
        // Validate horse power is non-negative
        if (horsePower < 0) {
            throw new Error('Horse power cannot be negative');
        }

        // Validate vehicle category
        if (![1, 2, 3, 4, 5].includes(category)) {
            throw new Error('Unsupported vehicle category');
        }

        // Enforce vehicle type for commercial vehicles
        if (category === 2 && !vehicleType) {
            throw new Error('Vehicle type must be specified for commercial vehicles');
        }
    }

    /**
     * Retrieves the RC (Civil Liability) rate for a specific vehicle
     * 
     * @param category Numeric identifier for vehicle category (1-5)
     * @param horsePower Total horse power of the vehicle
     * @param vehicleType Optional type specification for commercial vehicles
     * @returns Calculated RC rate
     * 
     * @throws {RateNotFoundException} If no rate can be found
     */
    public getRCRate(
        category: VehicleCategory, 
        horsePower: number, 
        vehicleType?: CommercialVehicleType
    ): number {
        // Validate input parameters
        this.validateVehicleDetails(category, horsePower, vehicleType);

        // Find rate for the specific category
        const rate = this.findRateForCategory(category, horsePower, vehicleType);

        // Throw error if no rate found
        if (rate === undefined) {
            throw new RateNotFoundException(`No rate found for category ${category}`);
        }

        return rate;
    }

    /**
     * Finds the appropriate RC rate for a specific vehicle category
     * 
     * @param category Vehicle category
     * @param horsePower Vehicle's horse power
     * @param vehicleType Optional commercial vehicle type
     * @returns Calculated rate or undefined
     */
    private findRateForCategory(
        category: VehicleCategory, 
        horsePower: number, 
        vehicleType?: CommercialVehicleType
    ): number | undefined {
        switch (category) {
            case 1: // Tourism vehicles
                return this.findTourismRate(horsePower);
            case 2: // Commercial vehicles
                return vehicleType 
                    ? this.findCommercialRate(vehicleType, horsePower)
                    : undefined;
            case 3: // Future implementation
            case 4: 
            case 5:
                return undefined;
            default:
                throw new Error('Unsupported vehicle category');
        }
    }

    /**
     * Finds the RC rate for tourism vehicles
     * @param horsePower Vehicle's horse power
     * @returns Matching RC rate or undefined
     */
    private findTourismRate(horsePower: number): number | undefined {
        return InsuranceService.BASE_RATES[1].find(
            (config: RateConfig) => horsePower >= config.min && (config.max === null || horsePower <= config.max)
        )?.rate;
    }

    /**
     * Finds the RC rate for commercial vehicles
     * @param vehicleType Type of commercial vehicle
     * @param horsePower Power of the vehicle
     * @returns Matching RC rate or undefined
     */
    private findCommercialRate(
        vehicleType: CommercialVehicleType, 
        horsePower: number
    ): number | undefined {
        const rateConfig = InsuranceService.BASE_RATES[2][vehicleType]?.find(
            (config: RateConfig) => horsePower >= config.min && (config.max === null || horsePower <= config.max)
        );
        return rateConfig?.rate;
    }

    // Constant Retrieval Methods
    public getPeriodicity(type: 'day' | 'month'): string {
        return type === 'day' 
            ? InsuranceService.PERIODICITE_DAYS 
            : InsuranceService.PERIODICITE_MONTH;
    }

    public getTaxesRate(): number {
        return InsuranceService.TAXES_RATE;
    }

    public getFGARate(): number {
        return InsuranceService.FGA_RATE;
    }

    public getCommercialRate(): number {
        return InsuranceService.COMMERCIAL_RATE;
    }

    public getAccessoiresAmount(): number {
        return InsuranceService.ACCESSOIRES_AMOUNT;
    }

    public getBrownCardAmount(): number {
        return InsuranceService.BROWN_CARD_AMOUNT;
    }

    /**
     * Retrieves the monthly rate for a given month
     * 
     * @param month Month number (1-12)
     * @returns Corresponding monthly rate
     * @throws {Error} If month is not between 1 and 12
     */
    public getMonthlyRate(month: number): number {
        if (month < 1 || month > 12) {
            throw new Error('Month must be between 1 and 12');
        }
        return InsuranceService.MONTHLY_RATES[month];
    }

    /**
     * Retrieves information about a specific coverage type
     * 
     * @param coverageType The type of coverage to retrieve
     * @returns Coverage information or undefined if not found
     */
    public getCoverageInfo(coverageType: string): { isRequired?: boolean, isMandatory?: boolean | null } | undefined {
        return InsuranceService.COVERAGES[coverageType];
    }

    /**
     * Checks if a specific coverage type is mandatory
     * 
     * @param coverageType The type of coverage to check
     * @returns True if mandatory, false otherwise
     * @throws {Error} If coverage type is not found
     */
    public isCoverageMandatory(coverageType: string): boolean {
        const coverage = this.getCoverageInfo(coverageType);
        if (!coverage) {
            throw new Error(`Coverage type '${coverageType}' not found`);
        }
        return coverage.isMandatory === true;
    }

    /**
     * Retrieves the rate for a specific coverage type and category
     * 
     * @param coverageType The type of coverage
     * @param category The vehicle category (for coverage types with category-based rates)
     * @returns The rate for the specified coverage type and category
     * @throws {Error} If coverage type or category is not found
     */
    public getCoverageRate(coverageType: string, category?: number): number {
        const coverageRates = InsuranceService.COVERAGE_RATES[coverageType];
        
        if (!coverageRates) {
            throw new Error(`Coverage type '${coverageType}' not found`);
        }

        // For coverage types with category-based rates
        if (typeof coverageRates === 'object' && category !== undefined) {
            const rate = coverageRates[category];
            if (rate !== undefined) {
                return rate;
            }
            throw new Error(`Category ${category} not found for coverage type '${coverageType}'`);
        }

        // For coverage types with a single rate
        if (typeof coverageRates === 'object' && 'rate' in coverageRates) {
            return coverageRates.rate!;
        }

        throw new Error(`Unable to retrieve rate for coverage type '${coverageType}'`);
    }

    /**
     * Retrieves additional details for a specific coverage type
     * 
     * @param coverageType The type of coverage
     * @returns Additional coverage details
     * @throws {Error} If coverage type is not found
     */
    public getCoverageDetails(coverageType: string): { 
        rate?: number, 
        min_premium?: number, 
        insured_capital?: number[], 
        amount?: { [key: number]: number } 
    } {
        const coverageRates = InsuranceService.COVERAGE_RATES[coverageType];
        
        if (!coverageRates || typeof coverageRates !== 'object') {
            throw new Error(`Coverage type '${coverageType}' not found`);
        }

        // Return all non-numeric keys (details)
        return Object.entries(coverageRates)
            .filter(([key]) => isNaN(Number(key)))
            .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
    }
}
