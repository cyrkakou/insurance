import { NextRequest } from 'next/server';
import { RefVehicleBodyTypesService } from '@/services/ref-vehicle-body-types.service';
import { authenticateRequest } from '@/middleware/auth';
import { ApiResponse } from '@/common/api-response';
import { z } from 'zod';

const bodyTypesService = new RefVehicleBodyTypesService();

// Liste des variations acceptées pour isActive
const isActiveVariations = ['isactive', 'isActive', 'is_active'];

// Schéma de validation pour les paramètres
const ParamSchema = z.object({
  field: z.string().transform(val => val.toLowerCase()).refine(
    (val) => ['code', 'name', 'category'].includes(val) || isActiveVariations.includes(val),
    { message: "Champ de recherche invalide. Les champs autorisés sont : code, name, category, isActive" }
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
    // Authentification
    const authResult = await authenticateRequest(request);
    if (authResult !== null) {
      return authResult;
    }

    // Récupération des paramètres
    let p = await params;

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

    const bodyTypes = await bodyTypesService.findByField(
      paramValidation.data.field, 
      paramValidation.data.value,
      multiple
    );
    
    if (!bodyTypes) {
      return ApiResponse.notFound('Body type(s) non trouvé(s)');
    }

    const cleanResults = Array.isArray(bodyTypes) 
      ? bodyTypes.map(({ createdAt, updatedAt, ...rest }) => rest)
      : (() => {
          const { createdAt, updatedAt, ...rest } = bodyTypes;
          return rest;
        })();

    return ApiResponse.success(cleanResults);
  } catch (error) {
    console.error('Erreur lors de la recherche des body types:', error);
    return ApiResponse.internalError('Erreur lors de la recherche des body types');
  }
}
