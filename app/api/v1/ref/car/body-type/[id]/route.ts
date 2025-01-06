import { NextRequest } from 'next/server';
import { RefVehicleBodyTypesService } from '@/services/ref-vehicle-body-types.service';
import { authenticateRequest } from '@/middleware/auth';
import { ApiResponse } from '@/common/api-response';
import { z } from 'zod';

const bodyTypesService = new RefVehicleBodyTypesService();

const IdSchema = z.number().int().positive();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authenticateRequest(request);
    if (authResult !== null) {
      return authResult;
    }
    const p = await params;
    const id = parseInt(p.id, 10);
    const idValidation = IdSchema.safeParse(id);

    if (!idValidation.success) {
      return ApiResponse.badRequest('ID invalide', idValidation.error.errors);
    }

    const bodyType = await bodyTypesService.findById(id);
    
    if (!bodyType) {
      return ApiResponse.notFound('Body type non trouvé');
    }

    const { createdAt, updatedAt, ...cleanedBodyType } = bodyType;
    return ApiResponse.success(cleanedBodyType);
  } catch (error) {
    return ApiResponse.error('Erreur interne du serveur');
  }
}
