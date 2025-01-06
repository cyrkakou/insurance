import * as fs from 'fs';
import * as path from 'path';
import { z } from 'zod';
import { BaseConfigAdapter } from './base.config.adapter';

/**
 * JSON Configuration Adapter
 * Loads and manages configuration from a JSON file
 */
export class JsonConfigAdapter extends BaseConfigAdapter {
    private configPath: string;
    private configData: any;

    /**
     * Constructor for JSON Config Adapter
     * @param configPath Path to the JSON configuration file
     */
    constructor(configPath?: string) {
        super();
        this.configPath = configPath || path.resolve(process.cwd(), 'config', 'insurance.config.json');
        this.configSchema = this.createConfigSchema();
        this.configData = this.loadConfig();
    }

    /**
     * Create the configuration schema
     * @returns Zod schema for configuration validation
     */
    private createConfigSchema(): z.ZodSchema {
        const RateConfigSchema = z.object({
            min: z.number(),
            max: z.number().nullable(),
            value: z.number()
        });

        const CoverageConfigSchema = z.object({
            isRequired: z.boolean().optional(),
            isMandatory: z.boolean().nullable().optional(),
            rate: z.union([
                z.number(), 
                z.record(z.string(), z.number())
            ]).optional(),
            min_premium: z.number().optional(),
            insured_capital: z.array(z.number()).optional(),
            amount: z.record(z.string(), z.number()).optional()
        });

        return z.object({
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
            baseRates: z.object({
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
            }),
            coverages: z.record(z.string(), CoverageConfigSchema)
        });
    }

    /**
     * Load configuration from JSON file
     * @returns Validated configuration
     */
    public loadConfig(): any {
        try {
            const rawConfig = JSON.parse(fs.readFileSync(this.configPath, 'utf-8'));
            return this.validate(rawConfig);
        } catch (error) {
            throw new Error(`Failed to load configuration from ${this.configPath}: ${error}`);
        }
    }

    /**
     * Get a specific configuration value
     * @param path Dot-separated path to the configuration value
     * @returns Configuration value
     */
    public get(path: string): any {
        const keys = path.split('.');
        let value = this.configData;

        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            } else {
                throw new Error(`Configuration path not found: ${path}`);
            }
        }

        return value;
    }

    /**
     * Check if a configuration path exists
     * @param path Dot-separated path to check
     * @returns Boolean indicating existence
     */
    public has(path: string): boolean {
        try {
            this.get(path);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Get periodicity for days
     * @returns Day periodicity constant
     */
    public getPeriodicityDays(): string {
        return this.get('constants.periodicity.day');
    }

    /**
     * Get monthly rate for a given duration
     * @param duration Contract duration in months
     * @returns Monthly rate
     */
    public getMonthlyRate(duration: number): number {
        const monthlyRates = this.get('monthlyRates');
        return monthlyRates[duration.toString()] || 
            (duration > 12 ? 100 : monthlyRates[duration.toString()] || 0);
    }

    /**
     * Get base rate for a specific category
     * @param category Base rate category
     * @returns Base rate configuration
     */
    public getBaseRate(category: number): any {
        return this.get(`baseRates.${category}`);
    }

    /**
     * Convert diesel power to equivalent horsepower
     * @param horsePower Original horsepower
     * @returns Converted horsepower for diesel engines, rounded up to the next integer
     */
    public convertDieselPower(horsePower: number): number {
        // Typical conversion: diesel engines are rated at 1.3 times the gasoline equivalent
        // Round up to the next integer to ensure conservative power estimation
        return Math.ceil(horsePower * 1.3);
    }

    /**
     * Get RC (Responsabilité Civile) rate
     * @param category RC rate category
     * @param horsePower Vehicle horsepower
     * @param vehicleType Optional commercial vehicle type or weight specification
     * @returns RC rate
     */
    public getRCRate(category: number, horsePower: number, vehicleType?: string): number {
        let baseRates = this.getBaseRate(category);
        if (category === 5) {
            // For category 5, use specific vehicle type or default to a standard type
            const defaultVehicleType = 'scooters_under_125';
            const rateKey = vehicleType || defaultVehicleType;
            
            // If the specific vehicle type exists, return its rate
            if (baseRates[rateKey]) {
                return baseRates[rateKey];
            }
            
            // Fallback to default vehicle type
            return baseRates[defaultVehicleType];
        }        
        // Handle special cases for categories with nested structures
        if (category === 2) {
            // For category 2, use provided vehicleType or default to 'tourism'
            const rateKey = vehicleType || 'tourism';
            baseRates = baseRates[rateKey];
        }
        
        if (category === 3) {
            // For categories 3 and 4, use weight-based rates
            const rateKey = vehicleType || 'under3.5';
            baseRates = baseRates[rateKey];
        }
        
        if (category === 4) {
            // For categories 3 and 4, use weight-based rates
            const rateKey = vehicleType || 'under9_seats';
            baseRates = baseRates[rateKey];
        }
        console.log("baseRates",baseRates); 
        // For other categories, use direct rate lookup
        return this.getPremiumByHorsePower(baseRates, horsePower);
    }

    /**
     * Get premium rate based on horsepower
     * @param ranges Array of rate ranges
     * @param horsePower Vehicle horsepower
     * @returns Calculated premium rate
     * @throws {Error} If no matching rate range is found
     */
    private getPremiumByHorsePower(
        ranges: Array<{
            min: number;
            max: number | null;
            value: number;
        }>, 
        horsePower: number
    ): number {
        for (const range of ranges) {
            if (
                horsePower >= range.min && 
                (range.max === null || horsePower <= range.max)
            ) {
                return range.value;
            }
        }

        throw new Error(`No RC rate found for horsepower ${horsePower}`);
    }

    /**
     * Get coverage configuration details
     * @param coverageName Optional name of the coverage. If not provided, returns all coverage configurations.
     * @returns Coverage configuration details or all coverage configurations
     */
    public getCoverages(coverageName?: string): any {
        const coverages = this.get('coverages');
        
        // If no specific coverage name is provided, return all coverages
        if (!coverageName) {
            return coverages;
        }
        
        // Return specific coverage configuration
        return coverages[coverageName];
    }

    /**
     * Get coverage parameters
     * @param coverageName Name of the coverage
     * @returns Coverage parameters
     */
    public getCoverageParams(coverageName: string): any {
        const coverage = this.getCoverages(coverageName);
        return {
            rate: coverage.rate,
            min_premium: coverage.min_premium,
            insured_capital: coverage.insured_capital,
            amount: coverage.amount
        };
    }

    /**
     * Get tax rate
     * @returns Current tax rate
     */
    public getTaxesRate(): number {
        return this.get('constants.rates.taxes');
    }

    /**
     * Get FGA rate
     * @returns Current FGA rate
     */
    public getFGARate(): number {
        return this.get('constants.rates.fga');
    }

    /**
     * Get commercial rate
     * @returns Current commercial rate
     */
    public getCommercialRate(): number {
        return this.get('constants.rates.commercial');
    }

    /**
     * Get accessories amount
     * @returns Current accessories amount
     */
    public getAccessoiresAmount(): number {
        return this.get('constants.amounts.accessories');
    }

    /**
     * Get brown card amount
     * @returns Current brown card amount
     */
    public getBrownCardAmount(): number {
        return this.get('constants.amounts.brownCard');
    }
}
