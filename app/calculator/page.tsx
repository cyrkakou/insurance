'use client';

import React, { useState, useEffect } from 'react';
import { 
    Card, 
    CardContent, 
    CardDescription, 
    CardFooter, 
    CardHeader, 
    CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import config from '@/rules/config/config.json';

// Interfaces for form data
interface ContractDetails {
    duration: number;
    periodicity: 'DAYS' | 'MONTHS';
    effectiveDate: string;
    expirationDate?: string;  
}

interface VehicleDetails {
    registrationNumber: string;
    chassisNumber: string;
    category: string;
    make: string;
    model: string;
    bodyType: string;
    color: string;
    seatCount: string;
    circulationZone: string;
    firstUseDate: string;
    firstRegistrationDate: string;
    emptyWeight: number;
    maxWeight: number;
    payload: number;
    fuelType: string;
    usage: string;
    horsePower: number;
    hasTrailer: boolean;
    originalValue: number;
    marketValue: number;
}

interface Guarantees {
    [key: string]: {
        isEnabled: boolean;
        code: string;
        description: string;
    };
}

interface AdditionalOptions {
    [key: string]: {
        isEnabled: boolean;
        code: string;
        description: string;
    };
}

interface PremiumResult {
    basePremium: number;
    taxes: number;
    totalPremium: number;
    details?: Record<string, any>;
}

export default function InsuranceCalculatorPage() {
    const getTomorrowDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    };

    const [contractDetails, setContractDetails] = useState<ContractDetails>({
        duration: 1,
        periodicity: 'MONTHS',
        effectiveDate: getTomorrowDate(),
        expirationDate: ''
    });

    const [vehicleDetails, setVehicleDetails] = useState<VehicleDetails>({
        registrationNumber: '',
        chassisNumber: '',
        category: '',
        make: '',
        model: '',
        bodyType: '',
        color: '',
        seatCount: '',
        circulationZone: '',
        firstUseDate: '',
        firstRegistrationDate: '',
        emptyWeight: 0,
        maxWeight: 0,
        payload: 0,
        fuelType: '',
        usage: '',
        horsePower: 0,
        hasTrailer: false,
        originalValue: 0,
        marketValue: 0
    });

    const [guarantees, setGuarantees] = useState<Guarantees>(
        Object.keys(config.coverages).reduce((acc, key) => {
            acc[key] = {
                isEnabled: config.coverages[key].isRequired || false,
                code: config.coverages[key].code,
                description: config.coverages[key].description
            };
            return acc;
        }, {} as Guarantees)
    );

    const [additionalOptions, setAdditionalOptions] = useState<AdditionalOptions>(
        Object.keys(config.additionalCoverages).reduce((acc, key) => {
            acc[key] = {
                isEnabled: false,
                code: config.additionalCoverages[key].code,
                description: config.additionalCoverages[key].description
            };
            return acc;
        }, {} as AdditionalOptions)
    );

    const [calculationResult, setCalculationResult] = useState<PremiumResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [validationErrors, setValidationErrors] = useState({
        category: false,
        seatCount: false,
        horsePower: false,
        fuelType: false,
        originalValue: false,  
        marketValue: false,    
        maxWeight: false,
        duration: false,
        periodicity: false,
        effectiveDate: false
    });

    const isFieldRequired = (fieldName: string) => {
        switch (fieldName) {
            case 'originalValue':
            case 'marketValue':
                return vehicleDetails.category === '202';
            case 'maxWeight':
                return vehicleDetails.category === '203';
            case 'category':
            case 'seatCount':
            case 'horsePower':
            case 'fuelType':
                return true;
            case 'duration':
            case 'periodicity':
            case 'effectiveDate':
                return true;
            default:
                return false;
        }
    };

    const validateRequiredFields = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);  // Reset time to start of day for accurate comparison
        const effectiveDate = contractDetails.effectiveDate ? new Date(contractDetails.effectiveDate) : null;

        const errors = {
            category: !vehicleDetails.category,
            seatCount: !vehicleDetails.seatCount || 
                       isNaN(Number(vehicleDetails.seatCount)) || 
                       Number(vehicleDetails.seatCount) <= 0,
            horsePower: vehicleDetails.horsePower <= 0,
            fuelType: !vehicleDetails.fuelType,
            originalValue: vehicleDetails.category === '202' && !vehicleDetails.originalValue,
            marketValue: vehicleDetails.category === '202' && !vehicleDetails.marketValue,
            maxWeight: vehicleDetails.category === '203' && (!vehicleDetails.maxWeight || vehicleDetails.maxWeight <= 0),
            duration: !contractDetails.duration || contractDetails.duration <= 0,
            periodicity: !contractDetails.periodicity,
            effectiveDate: !contractDetails.effectiveDate || 
                           !effectiveDate || 
                           effectiveDate <= today  
        };
        setValidationErrors(errors);
        return !Object.values(errors).some(error => error);
    };

    const getInputClassName = (fieldName: string) => {
        const alwaysRequiredFields = ['category', 'seatCount', 'horsePower', 'fuelType'];
        
        const isRequired = isFieldRequired(fieldName);
        const hasError = validationErrors[fieldName];

        return `
            ${hasError ? 'border-red-500 border-2' : ''}
            ${isRequired && !hasError ? 'border-blue-500 border-2' : ''}
        `.trim();
    };

    const calculateExpirationDate = (effectiveDate: string, duration: number, periodicity: 'DAYS' | 'MONTHS') => {
        if (!effectiveDate) return '';

        const startDate = new Date(effectiveDate);
        const expirationDate = new Date(startDate);

        if (periodicity === 'DAYS') {
            expirationDate.setDate(startDate.getDate() + duration);
        } else if (periodicity === 'MONTHS') {
            expirationDate.setMonth(startDate.getMonth() + duration);
        }

        // Subtract one day to get the exact expiration date
        expirationDate.setDate(expirationDate.getDate() - 1);

        return expirationDate.toISOString().split('T')[0];
    };

    useEffect(() => {
        if (contractDetails.effectiveDate && contractDetails.duration && contractDetails.periodicity) {
            const calculatedExpirationDate = calculateExpirationDate(
                contractDetails.effectiveDate, 
                contractDetails.duration, 
                contractDetails.periodicity
            );
            setContractDetails(prev => ({
                ...prev,
                expirationDate: calculatedExpirationDate
            }));
        }
    }, [contractDetails.effectiveDate, contractDetails.duration, contractDetails.periodicity]);

    const handleCalculate = async () => {
        if (!validateRequiredFields()) {
            return;
        }

        setIsLoading(true);
        setError(null);
        setCalculationResult(null);

        try {
            const response = await fetch('/api/calculate-premium', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contract: contractDetails,
                    vehicle: vehicleDetails,
                    guarantees: Object.keys(guarantees).filter(key => guarantees[key].isEnabled),
                    additionalOptions: Object.keys(additionalOptions).filter(key => additionalOptions[key].isEnabled)
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erreur de calcul de prime');
            }

            const result: PremiumResult = await response.json();
            setCalculationResult(result);
        } catch (error: any) {
            setError(error.message || 'Une erreur est survenue');
        } finally {
            setIsLoading(false);
        }
    };

    const renderContractCard = () => (
        <Card>
            <CardHeader>
                <CardTitle className="text-blue-600">Détails du Contrat</CardTitle>
                <CardDescription>Informations du contrat d'assurance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Durée</Label>
                        <Input 
                            type="number" 
                            value={contractDetails.duration}
                            onChange={(e) => {
                                setContractDetails({...contractDetails, duration: Number(e.target.value)});
                                setValidationErrors(prev => ({...prev, duration: false}));
                            }}
                            placeholder="Ex: 12"
                            className={getInputClassName('duration')}
                        />
                        {validationErrors.duration && (
                            <p className="text-red-500 text-sm">La durée du contrat est obligatoire</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label>Périodicité</Label>
                        <Select 
                            value={contractDetails.periodicity || "DEFAULT"}
                            onValueChange={(value: string) => {
                                setContractDetails({...contractDetails, periodicity: value});
                                setValidationErrors(prev => ({...prev, periodicity: false}));
                            }}
                        >
                            <SelectTrigger 
                                className={getInputClassName('periodicity')}
                            >
                                <SelectValue placeholder="Sélectionnez la périodicité" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="DEFAULT" disabled>Sélectionnez la périodicité</SelectItem>
                                <SelectItem value="MONTHS">Mensuel</SelectItem>
                                <SelectItem value="DAYS">Journalier</SelectItem>
                            </SelectContent>
                        </Select>
                        {validationErrors.periodicity && (
                            <p className="text-red-500 text-sm">La périodicité est obligatoire</p>
                        )}
                    </div>
                    <div className="space-y-2 col-span-full grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Date d'Effet</Label>
                            <Input 
                                type="date" 
                                value={contractDetails.effectiveDate || ''}
                                min={getTomorrowDate()}  
                                onChange={(e) => {
                                    setContractDetails({...contractDetails, effectiveDate: e.target.value});
                                    setValidationErrors(prev => ({...prev, effectiveDate: false}));
                                }}
                                className={getInputClassName('effectiveDate')}
                            />
                            {validationErrors.effectiveDate && (
                                <p className="text-red-500 text-sm">La date d'effet est obligatoire et doit être au moins J+1</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label>Date d'Échéance</Label>
                            <Input 
                                type="date" 
                                value={contractDetails.expirationDate || ''}
                                readOnly
                                className="bg-gray-100 cursor-not-allowed"
                                title="Date calculée automatiquement"
                            />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    const renderVehicleCard = () => (
        <Card>
            <CardHeader>
                <CardTitle className="text-blue-600">Détails du Véhicule</CardTitle>
                <CardDescription>Informations détaillées du véhicule</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Numéro d'Immatriculation</Label>
                        <Input 
                            type="text" 
                            value={vehicleDetails.registrationNumber}
                            onChange={(e) => setVehicleDetails({...vehicleDetails, registrationNumber: e.target.value})}
                            placeholder="Ex: DK2314BA"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Numéro de Châssis</Label>
                        <Input 
                            type="text" 
                            value={vehicleDetails.chassisNumber}
                            onChange={(e) => setVehicleDetails({...vehicleDetails, chassisNumber: e.target.value})}
                            placeholder="Ex: VF7SXHFXBHS512345"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Catégorie</Label>
                        <Select 
                            value={vehicleDetails.category || "DEFAULT"}
                            onValueChange={(value: string) => {
                                setVehicleDetails({...vehicleDetails, category: value});
                                setValidationErrors(prev => ({...prev, category: false}));
                            }}
                        >
                            <SelectTrigger 
                                className={getInputClassName('category')}
                            >
                                <SelectValue placeholder="Sélectionnez une catégorie" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="DEFAULT" disabled>Sélectionnez une catégorie</SelectItem>
                                <SelectItem value="201">Tourisme</SelectItem>
                                <SelectItem value="202">Commercial</SelectItem>
                                <SelectItem value="203">Transport Public de Marchandises</SelectItem>
                                <SelectItem value="204">Transport Public de Personnes</SelectItem>
                                <SelectItem value="205">Deux/Trois Roues</SelectItem>
                            </SelectContent>
                        </Select>
                        {validationErrors.category && (
                            <p className="text-red-500 text-sm">La catégorie est obligatoire</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label>Type de Carburant</Label>
                        <Select 
                            value={vehicleDetails.fuelType || "DEFAULT"}
                            onValueChange={(value: string) => {
                                setVehicleDetails({...vehicleDetails, fuelType: value});
                                setValidationErrors(prev => ({...prev, fuelType: false}));
                            }}
                        >
                            <SelectTrigger 
                                className={getInputClassName('fuelType')}
                            >
                                <SelectValue placeholder="Sélectionnez un type de carburant" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="DEFAULT" disabled>Sélectionnez un type de carburant</SelectItem>
                                <SelectItem value="essence">Essence</SelectItem>
                                <SelectItem value="diesel">Diesel</SelectItem>
                                <SelectItem value="electrique">Électrique</SelectItem>
                                <SelectItem value="hybride">Hybride</SelectItem>
                            </SelectContent>
                        </Select>
                        {validationErrors.fuelType && (
                            <p className="text-red-500 text-sm">Le type de carburant est obligatoire</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label>Usage</Label>
                        <Select 
                            value={vehicleDetails.usage || "DEFAULT"}
                            onValueChange={(value: string) => setVehicleDetails({...vehicleDetails, usage: value})}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Sélectionnez un usage" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="DEFAULT" disabled>Sélectionnez un usage</SelectItem>
                                <SelectItem value="E00001">Personnel</SelectItem>
                                <SelectItem value="E00002">Professionnel</SelectItem>
                                <SelectItem value="E00003">Mixte</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Zone de Circulation</Label>
                        <Select 
                            value={vehicleDetails.circulationZone || "DEFAULT"}
                            onValueChange={(value: string) => setVehicleDetails({...vehicleDetails, circulationZone: value})}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Sélectionnez une zone" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="DEFAULT" disabled>Sélectionnez une zone</SelectItem>
                                <SelectItem value="CEDEAO">CEDEAO</SelectItem>
                                <SelectItem value="NATIONAL">National</SelectItem>
                                <SelectItem value="INTERNATIONAL">International</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Marque</Label>
                        <Input 
                            type="text" 
                            value={vehicleDetails.make}
                            onChange={(e) => setVehicleDetails({...vehicleDetails, make: e.target.value})}
                            placeholder="Ex: Toyota"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Modèle</Label>
                        <Input 
                            type="text" 
                            value={vehicleDetails.model}
                            onChange={(e) => setVehicleDetails({...vehicleDetails, model: e.target.value})}
                            placeholder="Ex: RAV4"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Type de Carrosserie</Label>
                        <Input 
                            type="text" 
                            value={vehicleDetails.bodyType}
                            onChange={(e) => setVehicleDetails({...vehicleDetails, bodyType: e.target.value})}
                            placeholder="Ex: Berline"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Couleur</Label>
                        <Input 
                            type="text" 
                            value={vehicleDetails.color}
                            onChange={(e) => setVehicleDetails({...vehicleDetails, color: e.target.value})}
                            placeholder="Ex: Noir"
                        />
                    </div>
                    <div className="flex items-end space-x-2">
                        <div className="flex-grow space-y-2">
                            <Label>Nombre de Places</Label>
                            <Input 
                                type="text" 
                                value={vehicleDetails.seatCount}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/[^0-9]/g, '');
                                    setVehicleDetails({...vehicleDetails, seatCount: value});
                                    setValidationErrors(prev => ({...prev, seatCount: false}));
                                }}
                                placeholder="Ex: 5"
                                className={getInputClassName('seatCount')}
                            />
                            {validationErrors.seatCount && (
                                <p className="text-red-500 text-sm">
                                    Le nombre de places est obligatoire et doit être un nombre positif
                                </p>
                            )}
                        </div>
                        <div className="flex-grow space-y-2">
                            <Label>Puissance Fiscale (CV)</Label>
                            <Input 
                                type="number" 
                                value={vehicleDetails.horsePower}
                                onChange={(e) => {
                                    setVehicleDetails({...vehicleDetails, horsePower: Number(e.target.value)});
                                    setValidationErrors(prev => ({...prev, horsePower: false}));
                                }}
                                placeholder="Ex: 10"
                                className={getInputClassName('horsePower')}
                            />
                            {validationErrors.horsePower && (
                                <p className="text-red-500 text-sm">La puissance fiscale est obligatoire</p>
                            )}
                        </div>
                    </div>
                    <div className="col-span-full grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Date de Première Mise en Service</Label>
                            <Input 
                                type="date" 
                                value={vehicleDetails.firstUseDate}
                                onChange={(e) => setVehicleDetails({...vehicleDetails, firstUseDate: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Date de Première Immatriculation</Label>
                            <Input 
                                type="date" 
                                value={vehicleDetails.firstRegistrationDate}
                                onChange={(e) => setVehicleDetails({...vehicleDetails, firstRegistrationDate: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="col-span-full grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Poids à Vide (kg)</Label>
                            <Input 
                                type="number" 
                                value={vehicleDetails.emptyWeight}
                                onChange={(e) => setVehicleDetails({...vehicleDetails, emptyWeight: Number(e.target.value)})}
                                placeholder="Ex: 1500"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Poids Total (kg)</Label>
                            <Input 
                                type="number" 
                                value={vehicleDetails.maxWeight}
                                onChange={(e) => {
                                    setVehicleDetails({...vehicleDetails, maxWeight: Number(e.target.value)});
                                    setValidationErrors(prev => ({...prev, maxWeight: false}));
                                }}
                                placeholder="Ex: 2000"
                                className={getInputClassName('maxWeight')}
                            />
                            {validationErrors.maxWeight && (
                                <p className="text-red-500 text-sm">Le poids total est obligatoire pour cette catégorie</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label>Charge Utile (kg)</Label>
                            <Input 
                                type="number" 
                                value={vehicleDetails.payload}
                                onChange={(e) => setVehicleDetails({...vehicleDetails, payload: Number(e.target.value)})}
                                placeholder="Ex: 500"
                            />
                        </div>
                    </div>
                    {vehicleDetails.category === '202' && (
                        <div className="space-y-2">
                            <Label>Valeur à Neuf</Label>
                            <Input 
                                type="number" 
                                value={vehicleDetails.originalValue}
                                onChange={(e) => {
                                    setVehicleDetails({...vehicleDetails, originalValue: Number(e.target.value)});
                                    setValidationErrors(prev => ({...prev, originalValue: false}));
                                }}
                                placeholder="Ex: 25000"
                                className={getInputClassName('originalValue')}
                            />
                            {validationErrors.originalValue && (
                                <p className="text-red-500 text-sm">La valeur à neuf est obligatoire pour cette catégorie</p>
                            )}
                        </div>
                    )}
                    {vehicleDetails.category === '202' && (
                        <div className="space-y-2">
                            <Label>Valeur Marchande</Label>
                            <Input 
                                type="number" 
                                value={vehicleDetails.marketValue}
                                onChange={(e) => {
                                    setVehicleDetails({...vehicleDetails, marketValue: Number(e.target.value)});
                                    setValidationErrors(prev => ({...prev, marketValue: false}));
                                }}
                                placeholder="Ex: 15000"
                                className={getInputClassName('marketValue')}
                            />
                            {validationErrors.marketValue && (
                                <p className="text-red-500 text-sm">La valeur marchande est obligatoire pour cette catégorie</p>
                            )}
                        </div>
                    )}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label>Remorque</Label>
                            <Switch
                                checked={vehicleDetails.hasTrailer}
                                onCheckedChange={(checked) => setVehicleDetails({...vehicleDetails, hasTrailer: checked})}
                            />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    const renderGuaranteesCard = () => {
        const toggleGuarantee = (key: string) => {
            if (config.coverages[key].isRequired) return;

            setGuarantees(prev => ({
                ...prev,
                [key]: {
                    ...prev[key],
                    isEnabled: !prev[key].isEnabled
                }
            }));
        };

        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-blue-600">Garanties</CardTitle>
                    <CardDescription>Sélectionnez vos garanties</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        {Object.entries(config.coverages).map(([key, coverage]) => (
                            <div key={key} className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    <Label className={coverage.isRequired ? "font-bold text-blue-600" : ""}>
                                        {coverage.description}
                                        {coverage.isRequired && " (Obligatoire)"}
                                    </Label>
                                </div>
                                <Switch
                                    checked={guarantees[key].isEnabled}
                                    onCheckedChange={() => toggleGuarantee(key)}
                                    disabled={coverage.isRequired}
                                />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    };

    const toggleAdditionalOption = (key: string) => {
        setAdditionalOptions(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                isEnabled: !prev[key].isEnabled
            }
        }));
    };

    const renderOptionsCard = () => (
        <Card>
            <CardHeader>
                <CardTitle className="text-blue-600">Garanties Supplémentaires</CardTitle>
                <CardDescription>Options supplémentaires</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4">
                    {Object.entries(config.additionalCoverages).map(([key, coverage]) => (
                        <div key={key} className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <Label>
                                    {coverage.description}
                                </Label>
                            </div>
                            <Switch
                                checked={additionalOptions[key].isEnabled}
                                onCheckedChange={() => toggleAdditionalOption(key)}
                            />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );

    const renderResultCard = () => (
        calculationResult && (
            <Card>
                <CardHeader>
                    <CardTitle className="text-green-700">Résultat du Calcul</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Prime de Base</Label>
                        <p className="text-lg font-bold">{calculationResult.basePremium.toFixed(2)} XOF</p>
                    </div>
                    <div className="space-y-2">
                        <Label>Taxes</Label>
                        <p className="text-lg font-bold">{calculationResult.taxes.toFixed(2)} XOF</p>
                    </div>
                    <div className="space-y-2">
                        <Label>Prime Totale</Label>
                        <p className="text-lg font-bold text-blue-600">{calculationResult.totalPremium.toFixed(2)} XOF</p>
                    </div>
                    {calculationResult.details && (
                        <details className="mt-2 text-sm text-gray-600">
                            <summary>Détails du calcul</summary>
                            <pre>{JSON.stringify(calculationResult.details, null, 2)}</pre>
                        </details>
                    )}
                </CardContent>
            </Card>
        )
    );

    return (
        <div className="container mx-auto p-4 max-w-4xl space-y-4">
            {renderContractCard()}
            {renderVehicleCard()}
            {renderGuaranteesCard()}
            {renderOptionsCard()}
            
            {error && (
                <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            <Button 
                onClick={handleCalculate}
                disabled={isLoading}
                className="w-full"
            >
                {isLoading ? 'Calcul en cours...' : 'Calculer la Prime'}
            </Button>

            {renderResultCard()}
        </div>
    );
}
