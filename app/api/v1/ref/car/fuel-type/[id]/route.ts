import { NextRequest } from 'next/server';
import { RefFuelTypesService } from '@/services/ref-fuel-types.service';
import { authenticateRequest } from '@/middleware/auth';
import { ApiResponse } from '@/common/api-response';
import { z } from 'zod';
import type { FuelType } from '@/types/ref-fuel-types.types';
import { FuelTypeCategory } from '@/types/ref-fuel-types.types';

const fuelTypesService = new RefFuelTypesService();

// Schéma de validation pour la modification
const FuelTypeSchema = z.object({
  code: z.string().min(1, 'Le code est requis').max(20, 'Le code est trop long'),
  name: z.string().min(1, 'Le nom est requis').max(100, 'Le nom est trop long'),
  description: z.string().optional(),
  category: FuelTypeCategory,
  powerConversionFactor: z.number().default(1),
  riskFactor: z.number().optional(),
  ecoBonus: z.number().optional(),
  sortingOrder: z.number().int().optional(),
  isActive: z.number().int().min(0).max(1).default(1)
});

/**
 * @swagger
 * /api/v1/ref/car/fuel-type/{id}:
 *   get:
 *     summary: Récupère un type de carburant par son ID
 *     description: Retourne les détails d'un type de carburant spécifique
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           format: int32
 *         description: ID du type de carburant
 *     responses:
 *       200:
 *         description: Type de carburant récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/FuelType'
 *       400:
 *         description: ID invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Type de carburant non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
export async function GET(
  request: NextRequest, 
  { params }: { params: { id: string } }
) {
  try {
    const args = await params;

    // Authentification
    const authResult = await authenticateRequest(request);
    if (authResult !== null) {
      return authResult;
    }

    // Validation de l'ID
    const idSchema = z.coerce.number().int().positive();
    const idValidation = idSchema.safeParse(args.id);
    
    if (!idValidation.success) {
      return ApiResponse.badRequest('ID invalide', idValidation.error.errors);
    }

    // Recherche du fuel type
    const fuelType = await fuelTypesService.findById(idValidation.data);
    
    if (!fuelType) {
      return ApiResponse.notFound('Type de carburant non trouvé');
    }

    // Supprimer les champs createdAt et updatedAt
    const { createdAt, updatedAt, ...cleanedFuelType } = fuelType;
    return ApiResponse.success(cleanedFuelType);

  } catch (error) {
    console.error('Erreur lors de la recherche du type de carburant par ID:', error);
    return ApiResponse.error('Erreur interne du serveur');
  }
}

/**
 * @swagger
 * /api/v1/ref/car/fuel-type/{id}:
 *   put:
 *     summary: Met à jour un type de carburant spécifique
 *     description: Met à jour les détails d'un type de carburant existant
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           format: int32
 *         description: ID du type de carburant à mettre à jour
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 20
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *               description:
 *                 type: string
 *               category:
 *                 $ref: '#/components/schemas/FuelTypeCategory'
 *               powerConversionFactor:
 *                 type: number
 *                 default: 1
 *               riskFactor:
 *                 type: number
 *               ecoBonus:
 *                 type: number
 *               sortingOrder:
 *                 type: integer
 *               isActive:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 1
 *                 default: 1
 *             required:
 *               - id
 *     responses:
 *       200:
 *         description: Type de carburant mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/FuelType'
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Type de carburant non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Conflit - Le code existe déjà
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const args = await params;

    // Authentification
    const authResult = await authenticateRequest(request);
    if (authResult !== null) {
      return authResult;
    }

    // Validation de l'ID
    const idSchema = z.coerce.number().int().positive();
    const idValidation = idSchema.safeParse(args.id);
    
    if (!idValidation.success) {
      return ApiResponse.badRequest('ID invalide', idValidation.error.errors);
    }

    // Récupération et validation du corps de la requête
    const body = await request.json();
    const validation = FuelTypeSchema.partial().safeParse(body);

    if (!validation.success) {
      return ApiResponse.badRequest('Données invalides', validation.error.errors);
    }

    // Vérification si le type de carburant existe
    const exists = await fuelTypesService.exists(idValidation.data);
    if (!exists) {
      return ApiResponse.notFound('Type de carburant non trouvé');
    }

    // Si le code est modifié, vérifier qu'il n'existe pas déjà
    if (validation.data.code) {
      const existing = await fuelTypesService.findByField('code', validation.data.code, false) as FuelType;
      if (existing && existing.id !== idValidation.data) {
        return ApiResponse.conflict('Un type de carburant avec ce code existe déjà');
      }
    }

    // Mise à jour du type de carburant
    const updated = await fuelTypesService.update(idValidation.data, validation.data);

    // Nettoyage des données
    const { createdAt, updatedAt, ...cleanedFuelType } = updated;

    return ApiResponse.success(cleanedFuelType);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du type de carburant:', error);
    return ApiResponse.error('Erreur interne du serveur');
  }
}

/**
 * @swagger
 * /api/v1/ref/car/fuel-type/{id}:
 *   delete:
 *     summary: Supprime un type de carburant spécifique
 *     description: Supprime un type de carburant existant par son ID
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           format: int32
 *         description: ID du type de carburant à supprimer
 *     responses:
 *       200:
 *         description: Type de carburant supprimé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Type de carburant supprimé avec succès
 *       400:
 *         description: ID invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Type de carburant non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const args = await params;

    // Authentification
    const authResult = await authenticateRequest(request);
    if (authResult !== null) {
      return authResult;
    }

    // Validation de l'ID
    const idSchema = z.coerce.number().int().positive();
    const idValidation = idSchema.safeParse(args.id);
    
    if (!idValidation.success) {
      return ApiResponse.badRequest('ID invalide', idValidation.error.errors);
    }

    // Vérification si le type de carburant existe
    const exists = await fuelTypesService.exists(idValidation.data);
    if (!exists) {
      return ApiResponse.notFound('Type de carburant non trouvé');
    }

    // Suppression du type de carburant
    await fuelTypesService.delete(idValidation.data);

    return ApiResponse.success({ message: 'Type de carburant supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du type de carburant:', error);
    return ApiResponse.error('Erreur interne du serveur');
  }
}
