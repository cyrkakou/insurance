import { NextRequest } from 'next/server';
import { RefCategoriesService } from '@/services/ref-categories.service';
import { authenticateRequest } from '@/middleware/auth';
import { ApiResponse } from '@/common/api-response';
import { z } from 'zod';

const categoriesService = new RefCategoriesService();

// Liste des variations acceptées pour isActive
const isActiveVariations = ['isactive', 'isActive', 'is_active'];

// Schéma de validation pour les paramètres
const ParamSchema = z.object({
  field: z.string().transform(val => val.toLowerCase()).refine(
    (val) => ['code', 'name'].includes(val) || isActiveVariations.includes(val),
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
    const multiple = isActiveField;

    // Validation supplémentaire pour isActive
    if (isActiveField && !['0', '1'].includes(paramValidation.data.value)) {
      return ApiResponse.badRequest('La valeur de isActive doit être 0 ou 1');
    }

    const categories = await categoriesService.findByField(
      paramValidation.data.field, 
      paramValidation.data.value,
      multiple
    );
    
    if (!categories) {
      return ApiResponse.notFound('Catégorie(s) non trouvée(s)');
    }

    const cleanResults = Array.isArray(categories) 
      ? categories.map(({ createdAt, updatedAt, ...rest }) => rest)
      : (() => {
          const { createdAt, updatedAt, ...rest } = categories;
          return rest;
        })();

    return ApiResponse.success(cleanResults);
  } catch (error) {
    console.error('Erreur lors de la recherche des catégories:', error);
    return ApiResponse.internalError('Erreur lors de la recherche des catégories');
  }
}
