'use client';

import { useState, useEffect, useMemo } from 'react';
import { PremiumCalculationService } from '@/engine/service.premium';
import { JsonProvider } from '@/engine/providers/json_provider';
import { COVERAGES_CONFIG } from '@/engine/config/coverages';
import type { IPremiumCalculationParams, IPremiumCalculationResult, ICoverageConfig } from '@/engine/service.premium';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ChevronDown } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

const configProvider = new JsonProvider();
const premiumService = new PremiumCalculationService(configProvider);

const PERIODICITY_OPTIONS = [
  { value: 'DAYS', label: 'Jours' },
  { value: 'MONTHS', label: 'Mois' }
];

const VEHICLE_CATEGORIES = [
  { value: 'TOURISM', label: 'Tourisme' },
  { value: 'COMMERCIAL', label: 'Commercial' },
  { value: 'PUBLIC_TRANSPORT', label: 'Transport Public' }
];

const BODY_TYPES = [
  { value: 'SEDAN', label: 'Berline' },
  { value: 'SUV', label: 'SUV' },
  { value: 'COUPE', label: 'Coupé' },
  { value: 'WAGON', label: 'Break' },
  { value: 'VAN', label: 'Fourgonnette' },
  { value: 'PICKUP', label: 'Pick-up' },
  { value: 'MINIBUS', label: 'Minibus' }
];

export default function QuotePage() {
  const COVERAGES_GROUPS = useMemo(() => {
    const groups: Record<string, { title: string, items: ICoverageConfig[] }> = {
      mandatory: { title: 'Garanties Obligatoires', items: [] },
      damage: { title: 'Dommages', items: [] },
      additional: { title: 'Garanties Additionnelles', items: [] },
      assistance: { title: 'Assistance', items: [] }
    };

    COVERAGES_CONFIG.forEach(coverage => {
      if (groups[coverage.type]) {
        groups[coverage.type].items.push(coverage);
      }
    });

    return groups;
  }, []);

  const [contractInfo, setContractInfo] = useState({
    duration: 12,
    periodicity: 'MONTHS' as const,
    effectDate: new Date().toISOString().split('T')[0]
  });

  const [vehicleInfo, setVehicleInfo] = useState({
    category: 'TOURISM',
    bodyType: 'SEDAN',
    brand: '',
    model: '',
    registrationDate: new Date().toISOString().split('T')[0],
    newValue: 0,
    currentValue: 0,
    power: 0,
    seatingCapacity: 5
  });

  const [coverages, setCoverages] = useState(() => 
    COVERAGES_CONFIG.filter(c => c.is_mandatory).map(c => c.id)
  );

  const [premium, setPremium] = useState<IPremiumCalculationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serviceReady, setServiceReady] = useState(false);

  useEffect(() => {
    const initService = async () => {
      try {
        setServiceReady(true);
      } catch (err) {
        setError("Erreur d'initialisation du service de calcul");
        console.error('Service initialization error:', err);
      }
    };

    initService();
  }, []);

  const calculatePremium = async () => {
    if (!serviceReady) return;

    const registrationDate = new Date(vehicleInfo.registrationDate);
    const today = new Date();
    const vehicleAge = today.getFullYear() - registrationDate.getFullYear() +
      (today.getMonth() - registrationDate.getMonth()) / 12;

    const params: IPremiumCalculationParams = {
      category: vehicleInfo.category,
      fiscalPower: vehicleInfo.power,
      vehicleValue: vehicleInfo.currentValue,
      vehicleAge,
      weight: 0,
      bodyType: vehicleInfo.bodyType,
      seatingCapacity: vehicleInfo.seatingCapacity,
      coverages: coverages,
      hasTrailer: false,
      fleetSize: 1,
      isElectric: false,
      isConstructionEquipment: false,
      passengerOption: null,
      advanceRecourseOption: null,
      roadsideAssistanceOption: null,
      duration: contractInfo.duration,
      periodicity: contractInfo.periodicity
    };

    setLoading(true);
    setError(null);

    try {
      const result = await premiumService.calculate(params);
      setPremium(result);
    } catch (err) {
      console.error('Error calculating premium:', err);
      setError('Une erreur est survenue lors du calcul de la prime');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      calculatePremium();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [
    vehicleInfo.category,
    vehicleInfo.bodyType,
    vehicleInfo.power,
    vehicleInfo.currentValue,
    vehicleInfo.registrationDate,
    vehicleInfo.seatingCapacity,
    coverages,
    contractInfo.duration,
    contractInfo.periodicity,
    serviceReady
  ]);

  const handleContractChange = (field: string, value: string | number) => {
    setContractInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleVehicleChange = (field: string, value: string | number) => {
    setVehicleInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCoverageToggle = (coverageId: string) => {
    const coverage = COVERAGES_CONFIG.find(c => c.id === coverageId);
    if (!coverage || coverage.is_mandatory) return;

    setCoverages(prev => {
      if (prev.includes(coverageId)) {
        return prev.filter(id => id !== coverageId);
      }
      return [...prev, coverageId];
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Simulation Tarifaire</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
<Card className="shadow-lg">
  <CardHeader className="pb-4">
    <CardTitle className="text-base font-semibold">Informations du Contrat</CardTitle>
  </CardHeader>
  <CardContent className="space-y-3">
    <div className="space-y-1.5">
      <Label className="text-sm">Durée du contrat</Label>
      <div className="flex space-x-2">
        <div className="flex-1">
          <Input
            id="duration"
            type="number"
            value={contractInfo.duration}
            onChange={(e) => handleContractChange('duration', parseInt(e.target.value))}
            min={1}
            className="h-9 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
        <div className="w-32">
          <Select
            value={contractInfo.periodicity}
            onValueChange={(value) => handleContractChange('periodicity', value)}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Périodicité" />
            </SelectTrigger>
            <SelectContent>
              {PERIODICITY_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>

    <div className="space-y-1.5">
      <Label htmlFor="effectDate" className="text-sm">Date d'effet</Label>
      <Input
        id="effectDate"
        type="date"
        value={contractInfo.effectDate}
        onChange={(e) => handleContractChange('effectDate', e.target.value)}
        className="h-9"
      />
    </div>
  </CardContent>
</Card>

<Card className="shadow-lg">
  <CardHeader className="pb-4">
    <CardTitle className="text-base font-semibold">Informations du Véhicule</CardTitle>
  </CardHeader>
  <CardContent className="space-y-3">
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1.5">
        <Label htmlFor="category" className="text-sm">Catégorie</Label>
        <Select
          value={vehicleInfo.category}
          onValueChange={(value) => handleVehicleChange('category', value)}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Sélectionner une catégorie" />
          </SelectTrigger>
          <SelectContent>
            {VEHICLE_CATEGORIES.map(category => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="bodyType" className="text-sm">Type de carrosserie</Label>
        <Select
          value={vehicleInfo.bodyType}
          onValueChange={(value) => handleVehicleChange('bodyType', value)}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Sélectionner un type" />
          </SelectTrigger>
          <SelectContent>
            {BODY_TYPES.map(type => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1.5">
        <Label htmlFor="power" className="text-sm">Puissance fiscale</Label>
        <Input
          id="power"
          type="number"
          value={vehicleInfo.power}
          onChange={(e) => handleVehicleChange('power', parseInt(e.target.value))}
          min={0}
          max={100}
          className="h-9"
        />
      </div>
    
      <div className="space-y-1.5">
        <Label htmlFor="seatingCapacity" className="text-sm">Nombre de sièges</Label>
        <Input
          id="seatingCapacity"
          type="number"
          value={vehicleInfo.seatingCapacity}
          onChange={(e) => handleVehicleChange('seatingCapacity', parseInt(e.target.value))}
          min={1}
          max={100}
          className="h-9"
        />
      </div>
    </div>
    
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1.5">
        <Label htmlFor="brand" className="text-sm">Marque</Label>
        <Input
          id="brand"
          value={vehicleInfo.brand}
          onChange={(e) => handleVehicleChange('brand', e.target.value)}
          placeholder="Ex: Renault"
          className="h-9"
        />
      </div>
    
      <div className="space-y-1.5">
        <Label htmlFor="model" className="text-sm">Modèle</Label>
        <Input
          id="model"
          value={vehicleInfo.model}
          onChange={(e) => handleVehicleChange('model', e.target.value)}
          placeholder="Ex: Clio"
          className="h-9"
        />
      </div>
    </div>
    
    <div className="space-y-1.5">
      <Label htmlFor="registrationDate" className="text-sm">Date de mise en circulation</Label>
      <Input
        id="registrationDate"
        type="date"
        value={vehicleInfo.registrationDate}
        onChange={(e) => handleVehicleChange('registrationDate', e.target.value)}
        max={new Date().toISOString().split('T')[0]}
        className="h-9"
      />
    </div>
    
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1.5">
        <Label htmlFor="newValue" className="text-sm">Valeur à neuf</Label>
        <Input
          id="newValue"
          type="number"
          value={vehicleInfo.newValue}
          onChange={(e) => handleVehicleChange('newValue', parseInt(e.target.value))}
          min={0}
          placeholder="En XOF"
          className="h-9"
        />
      </div>
    
      <div className="space-y-1.5">
        <Label htmlFor="currentValue" className="text-sm">Valeur vénale</Label>
        <Input
          id="currentValue"
          type="number"
          value={vehicleInfo.currentValue}
          onChange={(e) => handleVehicleChange('currentValue', parseInt(e.target.value))}
          min={0}
          placeholder="En XOF"
          className="h-9"
        />
      </div>
    </div>
  </CardContent>
</Card>

          <div className="md:col-span-2">
            <Card className="shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold">Garanties</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" defaultValue={['mandatory']} className="space-y-4">
                  {Object.entries(COVERAGES_GROUPS).map(([key, group]) => (
                    <AccordionItem key={key} value={key} className="border rounded-lg">
                      <AccordionTrigger className="px-4 hover:no-underline [&[data-state=open]>div>.chevron]:rotate-180">
                        <div className="flex items-center justify-between flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{group.title}</span>
                            <Badge variant="secondary" className="text-xs">
                              {group.items.filter(item => coverages.includes(item.id)).length}/{group.items.length}
                            </Badge>
                          </div>
                          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 chevron" />
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-4 px-4">
                        <div className="space-y-3">
                          {group.items.map(coverage => (
                            <div key={coverage.id} 
                              className={`flex items-center justify-between p-3 rounded-lg transition-colors
                                ${coverage.is_mandatory ? 'bg-gray-50' : 
                                  coverages.includes(coverage.id) ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                            >
                              <div className="flex-1">
                                <Label 
                                  htmlFor={coverage.id} 
                                  className={`text-sm ${coverage.is_mandatory ? 'font-medium' : ''}`}
                                >
                                  {coverage.label}
                                  {coverage.is_mandatory && 
                                    <Badge variant="secondary" className="ml-2 text-xs">
                                      Obligatoire
                                    </Badge>
                                  }
                                </Label>
                              </div>
                              <Switch
                                id={coverage.id}
                                checked={coverages.includes(coverage.id)}
                                onCheckedChange={() => handleCoverageToggle(coverage.id)}
                                disabled={coverage.is_mandatory}
                                className={`${coverage.is_mandatory ? 'opacity-50' : ''}`}
                              />
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="shadow-lg mt-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">Résultat de la Simulation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span>Prime de base</span>
                <span className="font-semibold">
                  {premium ? formatCurrency(premium.basePremium) : '0 XOF'}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>Prime des garanties</span>
                <span className="font-semibold">
                  {premium ? formatCurrency(premium.coveragesPremium) : '0 XOF'}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>Taxes</span>
                <span className="font-semibold">
                  {premium ? formatCurrency(premium.taxes) : '0 XOF'}
                </span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t">
                <span className="font-semibold">Total</span>
                <span className="font-bold">
                  {premium ? formatCurrency(premium.totalPremium) : '0 XOF'}
                </span>
              </div>

              {premium && Object.keys(premium.breakdown.discounts).length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2 text-sm">Réductions Appliquées</h4>
                  {Object.entries(premium.breakdown.discounts).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center text-sm">
                      <span>{key}</span>
                      <span>{formatCurrency(value)}</span>
                    </div>
                  ))}
                </div>
              )}

              {premium && Object.keys(premium.breakdown.surcharges).length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2 text-sm">Majorations Appliquées</h4>
                  {Object.entries(premium.breakdown.surcharges).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center text-sm">
                      <span>{key}</span>
                      <span>{formatCurrency(value)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button 
            type="submit" 
            className="w-full md:w-auto h-9"
            disabled={loading || !serviceReady}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Calcul en cours...
              </>
            ) : (
              'Calculer la Prime'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}