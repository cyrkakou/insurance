import { NextRequest } from 'next/server';
import { RefFuelTypesService } from '@/services/ref-fuel-types.service';
import { authenticateRequest } from '@/middleware/auth';
import { ApiResponse } from '@/common/api-response';
import { z } from 'zod';

const fuelTypesService = new RefFuelTypesService();

// Liste des variations acceptées pour isActive
const isActiveVariations = ['isactive', 'isActive', 'is_active'];

// Schéma de validation pour les paramètres
const ParamSchema = z.object({
  field: z.string().transform(val => val.toLowerCase()).refine(
    (val) => ['code', 'name', 'category'].includes(val) || isActiveVariations.includes(val),
    { message: "Champ de recherche invalide" }
  ),
  value: z.string().refine((val) => {
    return val.length > 0;
  }, "Valeur de recherche requise")
});

export async function GET(
  request: NextRequest, 
  { params }: { params: { field: string, value: string } }
) {
  try {
    let p = await params;

    // Authentification
    const authResult = await authenticateRequest(request);
    if (authResult !== null) {
      return authResult;
    }

    // Validation des paramètres
    const paramValidation = ParamSchema.safeParse(p);
   
    if (!paramValidation.success) {
      return ApiResponse.badRequest('Paramètres invalides', paramValidation.error.errors);
    }

    // Déterminer si on doit retourner plusieurs résultats
    const isActiveField = isActiveVariations.includes(paramValidation.data.field);
    const multiple = isActiveField || paramValidation.data.field === 'category';

    // Validation supplémentaire pour isActive
    if (isActiveField && !['0', '1'].includes(paramValidation.data.value)) {
      return ApiResponse.badRequest('La valeur de isActive doit être 0 ou 1');
    }

    // Recherche du/des fuel type(s)
    const fuelTypes = await fuelTypesService.findByField(
      paramValidation.data.field, 
      paramValidation.data.value,
      multiple
    );
    
    if (!fuelTypes) {
      return ApiResponse.notFound('Fuel type(s) non trouvé(s)');
    }

    // Nettoyer les résultats (supprimer createdAt et updatedAt)
    const cleanResults = Array.isArray(fuelTypes) 
      ? fuelTypes.map(({ createdAt, updatedAt, ...rest }) => rest)
      : (() => {
          const { createdAt, updatedAt, ...rest } = fuelTypes;
          return rest;
        })();

    return ApiResponse.success(cleanResults);

  } catch (error) {
    return ApiResponse.error('Erreur interne du serveur');
  }
}
