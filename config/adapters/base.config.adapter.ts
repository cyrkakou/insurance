import { z } from 'zod';

/**
 * Abstract base class for configuration adapters
 * Defines the contract for loading and validating configuration
 */
export abstract class BaseConfigAdapter {
    /**
     * Configuration schema for validation
     * @protected Allow extension by child classes
     */
    protected abstract configSchema: z.ZodSchema;

    /**
     * Load configuration from source
     * @returns Validated configuration
     */
    public abstract loadConfig(): any;

    /**
     * Validate configuration against the schema
     * @param config Configuration to validate
     * @returns Validated configuration
     */
    protected validate(config: any): any {
        try {
            return this.configSchema.parse(config);
        } catch (error) {
            if (error instanceof z.ZodError) {
                throw new Error(`Configuration validation failed: ${JSON.stringify(error.errors, null, 2)}`);
            }
            throw error;
        }
    }

    /**
     * Get a specific configuration value
     * @param path Dot-separated path to the configuration value
     * @returns Configuration value
     */
    public abstract get(path: string): any;

    /**
     * Check if a configuration path exists
     * @param path Dot-separated path to check
     * @returns Boolean indicating existence
     */
    public abstract has(path: string): boolean;

    /**
     * Get periodicity for days
     * @returns Day periodicity constant
     */
    public abstract getPeriodicityDays(): string;

    /**
     * Get monthly rate for a given duration
     * @param duration Contract duration in months
     * @returns Monthly rate
     */
    public abstract getMonthlyRate(duration: number): number;

    /**
     * Get coverage configuration details
     * @param coverageName Optional name of the coverage. If not provided, returns all coverage configurations.
     * @returns Coverage configuration details or all coverage configurations
     */
    public abstract getCoverages(coverageName?: string): any;

    /**
     * Get base rate for a specific category
     * @param category Base rate category
     * @returns Base rate configuration
     */
    public abstract getBaseRate(category: number): any;

    /**
     * Convert diesel power to equivalent horsepower
     * @param horsePower Original horsepower
     * @returns Converted horsepower for diesel engines
     */
    public abstract convertDieselPower(horsePower: number): number;

    /**
     * Get RC (Responsabilité Civile) rate
     * @param category RC rate category
     * @param horsePower Vehicle horsepower
     * @param vehicleType Optional commercial vehicle type
     * @returns RC rate
     */
    public abstract getRCRate(category: number, horsePower: number, vehicleType?: string): number;

    /**
     * Get tax rate
     * @returns Current tax rate
     */
    public abstract getTaxesRate(): number;

    /**
     * Get FGA rate
     * @returns Current FGA rate
     */
    public abstract getFGARate(): number;

    /**
     * Get commercial rate
     * @returns Current commercial rate
     */
    public abstract getCommercialRate(): number;

    /**
     * Get accessories amount
     * @returns Current accessories amount
     */
    public abstract getAccessoiresAmount(): number;

    /**
     * Get brown card amount
     * @returns Current brown card amount
     */
    public abstract getBrownCardAmount(): number;
}
