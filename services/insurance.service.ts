import { BaseConfigAdapter } from '../config/adapters/base.config.adapter';
import { VehicleDetails, CoverageType } from '../types/insurance.types';

/**
 * Insurance Service responsible for core business logic
 * Provides flexible and extensible insurance calculation methods
 */
export class InsuranceService {
    /**
     * Configuration instance for insurance-related constants and calculations
     * @protected Allow extension by child classes
     */
    protected readonly config: BaseConfigAdapter;

    /**
     * Constructor for InsuranceService
     * @param configAdapter Configuration adapter (MUST implement BaseConfigAdapter)
     * @throws {Error} If the config adapter is invalid
     */
    constructor(configAdapter: BaseConfigAdapter) {
        // Validate config adapter
        this.validateConfigAdapter(configAdapter);
        
        this.config = configAdapter;
    }

    /**
     * Validate the configuration adapter
     * @param configAdapter Configuration adapter to validate
     * @throws {Error} If the config adapter is invalid
     */
    private validateConfigAdapter(configAdapter: BaseConfigAdapter): void {
        // Check if adapter is null or undefined
        if (!configAdapter) {
            throw new Error('Configuration adapter cannot be null or undefined');
        }

        // Check if required methods exist
        const requiredMethods: (keyof BaseConfigAdapter)[] = ['loadConfig', 'get', 'has'];
        for (const method of requiredMethods) {
            if (typeof configAdapter[method] !== 'function') {
                throw new Error(`Invalid config adapter: missing ${method} method`);
            }
        }

        // Attempt to load configuration
        try {
            const config = configAdapter.loadConfig();
            
            // Additional validation checks can be added here
            if (!config || Object.keys(config).length === 0) {
                throw new Error('Configuration loaded is empty');
            }
        } catch (error) {
            throw new Error(`Configuration validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Calculate RC (Responsabilité Civile) premium
     * @param category Vehicle category
     * @param horsePower Vehicle horsepower
     * @param fuelType Type of fuel (can be any string)
     * @param seatCount Number of seats
     * @param maxWeight Maximum vehicle weight
     * @param vehicleType Optional commercial vehicle type
     * @returns Calculated RC premium
     */
    public calculateRCPremium(
        category: number,
        horsePower: number,
        fuelType: string,
        seatCount: number,
        maxWeight: number,
        vehicleType?: string
    ): number {
        // Convert diesel power if necessary
        let adjustedHorsePower = fuelType.toLowerCase() === 'diesel' 
            ? this.config.convertDieselPower(horsePower) 
            : horsePower;
        // Validate vehicle details
        // Get RC rates based on category and horsepower
        let basePremium = this.config.getRCRate(category, adjustedHorsePower, vehicleType);
        
        // TODO: Add passenger surcharge for TPV (Transport Public de Voyageurs)
        
        // Apply commercial effort rate (discount) from config
        const commercialRate = this.config.getCommercialRate();
        basePremium = Math.round(basePremium * commercialRate * 100) / 100;

        return Math.round(basePremium);
    }

    /**
     * Calculate premiums for different types of coverage
     * 
     * @param coverage - Coverage type to calculate premium for
     * @param vehicle - Vehicle details required for premium calculation
     * @returns Calculated premium amount in cents
     * @throws Error if coverage type is not supported
     */
    private calculateCoveragePremiums(coverage: CoverageType, vehicle: VehicleDetails): number {
        switch (coverage) {
            case CoverageType.CIVIL_LIABILITY:
                return this.calculateRCPremium(
                    vehicle.category,
                    vehicle.horsePower,
                    vehicle.fuelType,
                    vehicle.seatCount,
                    vehicle.maxWeight || 0
                );

            case CoverageType.DAMAGE:
                return this.calculateTierceCompletePremium(
                    vehicle.category,
                    vehicle.originalValue
                );

            case CoverageType.COLLISION:
                return this.calculateTierceCollisionPremium(
                    vehicle.category,
                    vehicle.originalValue
                );

            case CoverageType.CAPPED_DAMAGE:
                return this.calculateTiercePlafonneePremium(
                    vehicle.category,
                    vehicle.marketValue
                );

            case CoverageType.THEFT:
                return this.calculateTheftPremium(
                    vehicle.category,
                    vehicle.marketValue
                );

            case CoverageType.FIRE:
                return this.calculateFirePremium(
                    vehicle.category,
                    vehicle.marketValue
                );

            case CoverageType.GLASS_BREAKAGE:
                return this.calculateGlassBreakagePremium(
                    vehicle.horsePower
                );

            case CoverageType.ADVANCE_ON_RECOURSE:
                const insuredCapital = this.config.getCoverages('advance_on_recourse').insured_capital[0];
                return this.calculateAdvanceOnRecoursePremium(
                    insuredCapital
                );

            case CoverageType.PASSENGERS:
                return this.calculatePassengersPremium(
                    1, // Default option 1
                    vehicle.seatCount
                );

            case CoverageType.DEFENSE_AND_RECOURSE:
                return this.calculateDefenseAndRecoursePremium(
                    vehicle.category
                );

            default:
                throw new Error(`Unsupported coverage type: ${coverage}`);
        }
    }

    /**
     * Calculate Tierce Complete Premium
     * @param category Vehicle category
     * @param originalValue Original premium value
     * @returns Calculated Tierce Complete Premium
     */
    private calculateTierceCompletePremium(category: number, originalValue: number): number {
        const damageRate = this.config.getCoverages('damage')[category];
        return originalValue * (damageRate / 100);
    }

    /**
     * Calculate Tierce Collision Premium
     * @param category Vehicle category
     * @param originalValue Original premium value
     * @returns Calculated Tierce Collision Premium
     */
    private calculateTierceCollisionPremium(category: number, originalValue: number): number {
        const collisionRate = this.config.getCoverages('collision')[category];
        return originalValue * (collisionRate / 100);
    }

    /**
     * Calculate Tierce Plafonnee Premium
     * @param category Vehicle category
     * @param horsePower Vehicle horsepower
     * @returns Calculated Tierce Plafonnee Premium
     */
    private calculateTiercePlafonneePremium(category: number, horsePower: number): number {
        const coverageParams = this.config.getCoverages('capped_damage');
        
        // Use the fixed rate from coverage parameters
        const rate = coverageParams.rate || 4.20;
        
        // Get the base RC rate for the category
        const baseRate = this.config.getRCRate(category, horsePower);
        
        // Calculate premium
        const premium = baseRate * (rate / 100);
        
        // Check if minimum premium applies
        const minPremium = coverageParams.min_premium || 100000;
        return Math.max(premium, minPremium);
    }

    /**
     * Calculate Theft Premium
     * @param category Vehicle category
     * @param marketValue Market value of the vehicle
     * @returns Calculated Theft Premium
     */
    private calculateTheftPremium(category: number, marketValue: number): number {
        const theftRate = this.config.getCoverages('theft').rate;
        return marketValue * (theftRate / 100);
    }

    /**
     * Calculate Fire Premium
     * @param category Vehicle category
     * @param marketValue Market value of the vehicle
     * @returns Calculated Fire Premium
     */
    private calculateFirePremium(category: number, marketValue: number): number {
        const fireRate = this.config.getCoverages('fire').rate;
        return marketValue * (fireRate / 100);
    }

    /**
     * Calculate Glass Breakage Premium
     * @param horsePower Vehicle horsepower
     * @returns Calculated Glass Breakage Premium
     */
    private calculateGlassBreakagePremium(horsePower: number): number {
        if (horsePower <= 10) {
            return 12500; // Up to 10 HP
        } else if (horsePower <= 14) {
            return 15000; // 11 HP to 14 HP
        } else {
            return 17500; // Over 14 HP
        }
    }

    /**
     * Calculate Advance on Recourse Premium
     * @param insuredCapital Insured capital amount
     * @returns Calculated Advance on Recourse Premium
     */
    private calculateAdvanceOnRecoursePremium(insuredCapital: number): number {
        const premiumRate = this.config.getCoverages('advance_on_recourse').rate / 100;
        return insuredCapital * premiumRate;
    }

    /**
     * Calculate Defense and Recourse Premium
     * @param category Vehicle category
     * @returns Calculated Defense and Recourse Premium
     */
    private calculateDefenseAndRecoursePremium(category: number): number {
        return this.config.getCoverages('defense_and_recourse').amount[category];
    }

    /**
     * Calculate Passengers Premium
     * @param option Passenger coverage option
     * @param seatCount Number of seats (optional, not used in current implementation)
     * @returns Calculated Passengers Premium
     */
    private calculatePassengersPremium(option: number, seatCount?: number): number {
        switch (option) {
            case 1:
                return 4250;
            case 2:
                return 6000;
            case 3:
                return 8750;
            case 4:
                return 30000;
            default:
                return 0;
        }
    }

    /**
     * Calculate Roadside Assistance Premium
     * @param category Vehicle category
     * @param maxWeight Maximum vehicle weight
     * @param selectedCoverages Array of selected coverage types
     * @returns Calculated Roadside Assistance Premium
     */
    private calculateRoadsideAssistancePremium(
        category: number, 
        maxWeight: number, 
        selectedCoverages: string[]
    ): number {
        // Option 4: Heavy Vehicles (weight > 3.5T)
        if (maxWeight > 3500) {
            return 75000;
        }

        // Coverages that determine Assistance Privilege or VIP options
        const privilegeCoverages = ['damage', 'capped_damage', 'collision'];
        
        // Check if any privilege coverages are selected
        const hasPrivilegeCoverage = privilegeCoverages.some(coverage => 
            selectedCoverages.includes(coverage)
        );

        // Option 1: Light vehicles without privilege coverages
        if (!hasPrivilegeCoverage) {
            return 9000;
        }

        // Option 2: Light vehicles with privilege coverages
        if (selectedCoverages.length === 1) {
            return 35500;
        }

        // Option 3: Light vehicles with multiple privilege coverages
        return 67000;
    }

    /**
     * Calculate Prorata Premium
     * @param premium Base premium amount
     * @param duration Contract duration
     * @param periodicity Contract periodicity (month or day)
     * @returns Prorated premium amount
     */
    private calculateProrata(premium: number, duration: number, periodicity: string): number {
        const monthlyRate = this.config.getMonthlyRate(duration);
        return Math.round(premium * (monthlyRate / 100));
    }

    /**
     * Calculate insurance premiums and fees based on vehicle and contract details
     * 
     * @param data Insurance calculation input data
     * @returns Calculated premium details including coverages, taxes, and fees
     * @throws Error if calculation data is incomplete
     */
    public calculate(data: PremiumCalculationInput): PremiumCalculationResult {
        // Basic validation
        if (!data.vehicle || !data.contract || !data.coverages) {
            throw new Error('Données de calcul de prime incomplètes');
        }

        const { vehicle, contract, coverages } = data;
        const duration = contract.duration || 12;
        const periodicity = contract.periodicity || 'month';

        const result: {
            total: { prime_nette_annuelle: number; prime_nette: number };
            coverages: Record<string, CoveragePremium>;
        } = {
            total: { prime_nette_annuelle: 0, prime_nette: 0 },
            coverages: {}
        };

        // Calculate main coverages
        for (const coverageType of Object.values(CoverageType)) {
            if (coverages.includes(coverageType)) {
                const coverageConfig = this.config.getCoverages(coverageType);
                
                if (coverageConfig) {
                    const prime = this.calculateCoveragePremiums(coverageType, vehicle);
                    const prime_periode = this.calculateProrata(prime, duration, periodicity);

                    result.coverages[coverageType] = {
                        prime_annuelle: prime,
                        prime_periode: prime_periode
                    };

                    result.total.prime_nette_annuelle += prime;
                    result.total.prime_nette += prime_periode;
                }
            }
        }

        // Calculate roadside assistance if selected
        if (coverages.includes(CoverageType.ROADSIDE_ASSISTANCE)) {
            const prime = this.calculateRoadsideAssistancePremium(
                vehicle.category,
                vehicle.maxWeight || 0,
                coverages
            );
            const prime_periode = this.calculateProrata(prime, duration, periodicity);
            
            result.coverages[CoverageType.ROADSIDE_ASSISTANCE] = {
                prime_annuelle: prime,
                prime_periode: prime_periode
            };
        }

        // Calculate taxes and fees
        const basePremium = result.total.prime_nette;
        const accessoryAmount = this.config.getAccessoiresAmount();
        const taxes = Math.round((basePremium + accessoryAmount) * this.config.getTaxesRate());
        const fga = Math.round(
            result.coverages[CoverageType.CIVIL_LIABILITY].prime_periode * 
            this.config.getFGARate()
        );
        const brownCardAmount = this.config.getBrownCardAmount();

        // Calculate total premium
        const totalPremium = basePremium + accessoryAmount + taxes + fga + brownCardAmount;

        // Prepare and return result
        return {
            contrat: contract,
            vehicucle: vehicle,
            premiums: {
                basePremium,
                accessoryAmount,
                taxes,
                fga,
                brownCard: brownCardAmount,
                totalPremium
            },
            adjustments: [],
            coverages: result.coverages,
            metadata: {
                issuedAt: new Date().toISOString(),
                validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                currency: 'XOF'
            }
        };
    }
}
