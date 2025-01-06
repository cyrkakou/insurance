import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Interface for rate configuration
 */
export interface RateConfig {
    min: number;
    max: number | null;
    value: number;
}

/**
 * Type definitions for configuration schema
 */
const RateConfigSchema = z.object({
    min: z.number(),
    max: z.number().nullable(),
    value: z.number()
});

const BaseRatesSchema = z.object({
    "1": z.array(RateConfigSchema),
    "2": z.object({
        tourism: z.array(RateConfigSchema),
        "under3.5": z.array(RateConfigSchema),
        "over3.5": z.array(RateConfigSchema)
    }),
    "3": z.object({
        "under3.5": z.array(RateConfigSchema),
        "over3.5": z.array(RateConfigSchema)
    }),
    "4": z.object({
        "under9_seats": z.array(RateConfigSchema),
        "over9_seats": z.array(RateConfigSchema)
    }),
    "5": z.record(z.string(), z.number())
});

const ConfigSchema = z.object({
    constants: z.object({
        periodicity: z.object({
            day: z.string(),
            month: z.string()
        }),
        rates: z.object({
            taxes: z.number(),
            fga: z.number(),
            commercial: z.number()
        }),
        amounts: z.object({
            accessories: z.number(),
            brownCard: z.number()
        })
    }),
    monthlyRates: z.record(z.string(), z.number()),
    coverages: z.record(z.string(), z.object({
        isRequired: z.boolean().optional(),
        isMandatory: z.boolean().nullable().optional()
    })),
    coverageRates: z.object({
        damage: z.record(z.string(), z.number()),
        collision: z.record(z.string(), z.number()),
        capped_damage: z.object({
            rate: z.number(),
            min_premium: z.number()
        }),
        theft: z.object({
            rate: z.number()
        }),
        fire: z.object({
            rate: z.number()
        }),
        advance_on_recourse: z.object({
            insured_capital: z.array(z.number()),
            rate: z.number()
        }),
        defense_and_recourse: z.object({
            amount: z.record(z.string(), z.number())
        })
    }),
    baseRates: BaseRatesSchema
});

type InsuranceConfigData = z.infer<typeof ConfigSchema>;

/**
 * Insurance Configuration Class
 * Manages all configuration data for the insurance service
 */
export class InsuranceConfig {
    private static instance: InsuranceConfig | null;
    private config: InsuranceConfigData;

    /**
     * Constructor to enforce singleton pattern
     * @param configPath Optional path to configuration file
     */
    constructor(configPath?: string) {
        const defaultPath = path.resolve(process.cwd(), 'config', 'insurance.config.json');
        const finalPath = configPath || defaultPath;

        try {
            const configData = JSON.parse(fs.readFileSync(finalPath, 'utf-8'));
            this.config = ConfigSchema.parse(configData);
        } catch (error) {
            if (error instanceof z.ZodError) {
                throw new Error(`Configuration validation failed: ${JSON.stringify(error.errors, null, 2)}`);
            }
            throw new Error(`Failed to load configuration from ${finalPath}: ${error}`);
        }
    }

    /**
     * Get singleton instance of InsuranceConfig
     * @param configPath Optional path to configuration file
     * @returns InsuranceConfig instance
     */
    public static getInstance(configPath?: string): InsuranceConfig {
        if (!InsuranceConfig.instance) {
            InsuranceConfig.instance = new InsuranceConfig(configPath);
        }
        return InsuranceConfig.instance;
    }

    /**
     * Reset the singleton instance (for testing)
     */
    public static resetInstance(): void {
        this.instance = null;
    }

    get CONSTANTS(): InsuranceConfigData['constants'] {
        return this.config.constants;
    }

    /**
     * Get monthly rate for a specific month
     * @param month Month number (1-12)
     * @returns Monthly rate percentage
     */
    public getMonthlyRate(month: number): number {
        return this.config.monthlyRates[month];
    }

    /**
     * Get periodicity days value
     * @returns Periodicity days value
     */
    public getPeriodicityDays(): string {
        return this.config.constants.periodicity.day;
    }

    /**
     * Get periodicity month value
     * @returns Periodicity month value
     */
    public getPeriodicityMonth(): string {
        return this.config.constants.periodicity.month;
    }

    /**
     * Get coverage information
     * @param coverageType Type of coverage
     * @returns Coverage details if found
     */
    public getCoverage(coverageType: string): { isRequired?: boolean; isMandatory?: boolean | null } | undefined {
        return this.config.coverages[coverageType];
    }

    /**
     * Get coverage rate information
     * @param coverageType Type of coverage
     * @returns Coverage rate details
     */
    public getCoverageRate(coverageType: keyof typeof this.config.coverageRates): any {
        return this.config.coverageRates[coverageType as keyof typeof this.config.coverageRates];
    }

    /**
     * Get tax rate
     * @returns Current tax rate
     */
    public getTaxesRate(): number {
        return this.config.constants.rates.taxes;
    }

    /**
     * Get FGA rate
     * @returns Current FGA rate
     */
    public getFGARate(): number {
        return this.config.constants.rates.fga;
    }

    /**
     * Get commercial rate
     * @returns Current commercial rate
     */
    public getCommercialRate(): number {
        return this.config.constants.rates.commercial;
    }

    /**
     * Get accessories amount
     * @returns Current accessories amount
     */
    public getAccessoiresAmount(): number {
        return this.config.constants.amounts.accessories;
    }

    /**
     * Get brown card amount
     * @returns Current brown card amount
     */
    public getBrownCardAmount(): number {
        return this.config.constants.amounts.brownCard;
    }

    /**
     * Validate the entire configuration
     * @throws Error if configuration is invalid
     */
    public validate(): void {
        try {
            ConfigSchema.parse(this.config);
        } catch (error) {
            if (error instanceof z.ZodError) {
                throw new Error(`Configuration validation failed: ${JSON.stringify(error.errors, null, 2)}`);
            }
            throw error;
        }
    }

    /**
     * Get raw configuration data (useful for debugging)
     */
    public getRawConfig(): InsuranceConfigData {
        return { ...this.config };
    }

    /**
     * Get base rate for a category
     * @param category Vehicle category
     * @returns Base rate configuration
     */
    public getBaseRate(category: number): any {
        return this.config.baseRates[category.toString() as keyof typeof this.config.baseRates];
    }

    /**
     * Validate vehicle details
     * @param category Vehicle category
     * @param horsePower Vehicle horsepower
     * @param vehicleType Optional commercial vehicle type
     * @throws {Error} If validation fails
     */
    public validateVehicleDetails(
        category: number,
        horsePower: number,
        vehicleType?: string
    ): void {
        if (horsePower < 0) {
            throw new Error('Horse power cannot be negative');
        }

        if (category < 1 || category > 5) {
            throw new Error('Unsupported vehicle category');
        }

        if (category === 2 && !vehicleType) {
            throw new Error('Vehicle type must be specified for commercial vehicles');
        }
    }

    /**
     * Get the rate for a specific vehicle category and horsepower
     * @param category Vehicle category (1-5)
     * @param horsePower Vehicle horsepower
     * @param vehicleType Type of commercial vehicle (required for category 2)
     * @returns Calculated rate configuration for the vehicle
     * @throws {Error} If inputs are invalid or no rate is found
     */
    public getRCRate(category: number, horsePower: number, vehicleType?: string): RateConfig[] {
        this.validateVehicleDetails(category, horsePower, vehicleType);

        if (category === 2) {
            const baseRates = this.getBaseRate(2) as { 
                tourism: RateConfig[], 
                "under3.5": RateConfig[], 
                "over3.5": RateConfig[] 
            };
            
            const commercialTypes = ['tourism', 'under3.5', 'over3.5'];
            if (!vehicleType || !commercialTypes.includes(vehicleType)) {
                throw new Error(`Invalid commercial vehicle type. Must be one of: ${commercialTypes.join(', ')}`);
            }

            return baseRates[vehicleType as keyof typeof baseRates];
        }

        return this.getBaseRate(category) as RateConfig[];
    }

    /**
     * Find equivalent gasoline horsepower range for diesel vehicle
     * @param horsePower Diesel vehicle horsepower
     * @returns Equivalent gasoline horsepower for rate calculation
     */
    public convertDieselPower(horsePower: number): number {
        // Conversion mapping based on provided rules
        const conversionMap = [
            { dieselMin: 0, dieselMax: 2, gasMin: 0, gasMax: 2 },
            { dieselMin: 3, dieselMax: 4, gasMin: 3, gasMax: 6 },
            { dieselMin: 5, dieselMax: 7, gasMin: 7, gasMax: 10 },
            { dieselMin: 8, dieselMax: 10, gasMin: 11, gasMax: 14 },
            { dieselMin: 11, dieselMax: 16, gasMin: 15, gasMax: 23 },
            { dieselMin: 17, dieselMax: null, gasMin: 24, gasMax: null }
        ];

        // Find the matching conversion range
        const conversionRange = conversionMap.find(
            range => 
                (range.dieselMin <= horsePower) && 
                (range.dieselMax === null || horsePower <= range.dieselMax)
        );

        if (!conversionRange) {
            throw new Error(`Unable to convert diesel horsepower: ${horsePower}`);
        }

        // Return the midpoint of the equivalent gasoline horsepower range
        return conversionRange.gasMax !== null 
            ? Math.round((conversionRange.gasMin + conversionRange.gasMax) / 2)
            : conversionRange.gasMin;
    }
}

/**
 * Custom error for rate calculation failures
 */
class RateNotFoundException extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'RateNotFoundException';
    }
}
