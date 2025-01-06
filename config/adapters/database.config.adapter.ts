import { z } from 'zod';
import { BaseConfigAdapter } from './base.config.adapter';
import { drizzle } from 'drizzle-orm/node-postgres/driver';
import { Pool } from 'pg';

/**
 * Database Configuration Adapter
 * Loads and manages configuration from a database
 */
export class DatabaseConfigAdapter extends BaseConfigAdapter {
    private db: ReturnType<typeof drizzle>;
    private configData: any;

    /**
     * Constructor for Database Config Adapter
     * @param connectionString PostgreSQL connection string
     */
    constructor(connectionString: string) {
        super();
        const pool = new Pool({ connectionString });
        this.db = drizzle(pool);
        this.configSchema = this.createConfigSchema();
        this.configData = this.loadConfig();
    }

    /**
     * Create the configuration schema
     * @returns Zod schema for configuration validation
     */
    private createConfigSchema(): z.ZodSchema {
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
                // Similar structure to JSON adapter, but loaded from database
            })
        });
    }

    /**
     * Load configuration from database
     * @returns Validated configuration
     */
    public loadConfig(): any {
        try {
            // Implement database configuration retrieval
            const configQuery = this.db.select().from('insurance_config');
            const rawConfig = this.transformDatabaseConfig(configQuery);
            return this.validate(rawConfig);
        } catch (error) {
            throw new Error(`Failed to load configuration from database: ${error}`);
        }
    }

    /**
     * Transform database query result to configuration object
     * @param configQuery Database query result
     * @returns Transformed configuration
     */
    private transformDatabaseConfig(configQuery: any): any {
        // Implement transformation logic from database rows to config object
        return {};
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
     * Get coverage configuration details
     * @param coverageName Optional name of the coverage. If not provided, returns all coverage configurations.
     * @returns Coverage configuration details or all coverage configurations
     */
    public getCoverages(coverageName?: string): any {
        // If no specific coverage name is provided, return all coverages
        if (!coverageName) {
            return this.db.select()
                .from('coverage_config')
                .all();
        }
        
        // Return specific coverage configuration
        return this.db.select()
            .from('coverage_config')
            .where('coverage_name', coverageName)
            .first();
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
     * Get coverage rate for a specific category
     * @param coverageName Name of the coverage
     * @param category Category number
     * @returns Coverage rate for the specified category
     */
    public getCoverageRate(coverageName: string, category?: number): number | Record<string, number> {
        const coverage = this.getCoverages(coverageName);
        
        // If rate is a number, return it directly
        if (typeof coverage.rate === 'number') {
            return coverage.rate;
        }
        
        // If rate is a record and category is provided, return the specific category rate
        if (category && coverage.rate && coverage.rate[category]) {
            return coverage.rate[category];
        }
        
        // If no specific category rate found, return the entire rate record
        return coverage.rate || 0;
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
     * Get RC (Responsabilité Civile) rate
     * @param category RC rate category
     * @param horsePower Vehicle horsepower
     * @returns RC rate
     * @throws {Error} If no matching rate is found
     */
    public getRCRate(category: number, horsePower: number): number {
        const baseRates = this.getBaseRate(category);
        
        // Implement database-specific rate lookup
        const rateTable = this.db.select()
            .from('insurance_rates')
            .where('category', category)
            .where('min_hp', '<=', horsePower)
            .where('max_hp', '>=', horsePower)
            .first();

        if (rateTable) {
            return rateTable.rate;
        }
        
        throw new Error(`No RC rate found for category ${category} with ${horsePower} HP`);
    }

    /**
     * Get tax rate
     * @returns Current tax rate
     */
    public getTaxesRate(): number {
        return this.db.select('rate')
            .from('config_rates')
            .where('type', 'taxes')
            .first()
            .rate;
    }

    /**
     * Get FGA rate
     * @returns Current FGA rate
     */
    public getFGARate(): number {
        return this.db.select('rate')
            .from('config_rates')
            .where('type', 'fga')
            .first()
            .rate;
    }

    /**
     * Get commercial rate
     * @returns Current commercial rate
     */
    public getCommercialRate(): number {
        return this.db.select('rate')
            .from('config_rates')
            .where('type', 'commercial')
            .first()
            .rate;
    }

    /**
     * Get accessories amount
     * @returns Current accessories amount
     */
    public getAccessoiresAmount(): number {
        return this.db.select('amount')
            .from('config_amounts')
            .where('type', 'accessories')
            .first()
            .amount;
    }

    /**
     * Get brown card amount
     * @returns Current brown card amount
     */
    public getBrownCardAmount(): number {
        return this.db.select('amount')
            .from('config_amounts')
            .where('type', 'brownCard')
            .first()
            .amount;
    }
}
