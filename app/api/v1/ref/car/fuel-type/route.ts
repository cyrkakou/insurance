import { NextRequest } from 'next/server';
import { RefFuelTypesService } from '@/services/ref-fuel-types.service';
import { authenticateRequest } from '@/middleware/auth';
import { ApiResponse } from '@/common/api-response';
import { z } from 'zod';
import type { FuelType } from '@/types/ref-fuel-types.types';
import { FuelTypeCategory } from '@/types/ref-fuel-types.types';

const fuelTypesService = new RefFuelTypesService();

// Schéma de validation pour la création/modification
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

// Schéma pour la création avec champs requis
const CreateFuelTypeSchema = FuelTypeSchema.required({
  code: true,
  name: true,
  category: true,
  powerConversionFactor: true,
  isActive: true
});

/**
 * @swagger
 * /api/v1/ref/car/fuel-type:
 *   get:
 *     summary: Récupère la liste des types de carburant
 *     description: Retourne tous les types de carburant, avec option pour inclure les inactifs
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: includeInactive
 *         schema:
 *           type: boolean
 *         description: Inclure les types de carburant inactifs
 *     responses:
 *       200:
 *         description: Liste des types de carburant récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/FuelType'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
export async function GET(request: NextRequest) {
  try {
    // Authentification
    const authResult = await authenticateRequest(request);
    if (authResult !== null) {
      return authResult;
    }

    // Récupération des paramètres de requête
    const searchParams = request.nextUrl.searchParams;
    const includeInactive = searchParams.get('includeInactive') === 'true';

    // Récupération des types de carburant
    const fuelTypes = await fuelTypesService.findAll(includeInactive);

    // Nettoyage des données (suppression de createdAt et updatedAt)
    const cleanedFuelTypes = fuelTypes.map(({ createdAt, updatedAt, ...rest }) => rest);

    return ApiResponse.success(cleanedFuelTypes);
  } catch (error) {
    console.error('Erreur lors de la récupération des types de carburant:', error);
    return ApiResponse.error('Erreur interne du serveur');
  }
}

/**
 * @swagger
 * /api/v1/ref/car/fuel-type:
 *   post:
 *     summary: Crée un nouveau type de carburant
 *     description: Crée un nouveau type de carburant avec les paramètres spécifiés
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
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
 *               - code
 *               - name
 *               - category
 *               - powerConversionFactor
 *               - isActive
 *     responses:
 *       201:
 *         description: Type de carburant créé avec succès
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
 *       409:
 *         description: Conflit - Le code existe déjà
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
export async function POST(request: NextRequest) {
  try {
    // Authentification
    const authResult = await authenticateRequest(request);
    if (authResult !== null) {
      return authResult;
    }

    // Récupération et validation du corps de la requête
    const body = await request.json();
    const validation = CreateFuelTypeSchema.safeParse(body);

    if (!validation.success) {
      return ApiResponse.badRequest('Données invalides', validation.error.errors);
    }

    // Vérification si le code existe déjà
    const existing = await fuelTypesService.findByField('code', validation.data.code, false);
    if (existing) {
      return ApiResponse.conflict('Un type de carburant avec ce code existe déjà');
    }

    // Création du type de carburant
    const created = await fuelTypesService.create(validation.data);

    // Nettoyage des données
    const { createdAt, updatedAt, ...cleanedFuelType } = created;

    return ApiResponse.created(cleanedFuelType);
  } catch (error) {
    console.error('Erreur lors de la création du type de carburant:', error);
    return ApiResponse.error('Erreur interne du serveur');
  }
}

/**
 * @swagger
 * /api/v1/ref/car/fuel-type:
 *   put:
 *     summary: Met à jour un type de carburant existant
 *     description: Met à jour un type de carburant existant avec les paramètres spécifiés
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     format: int32
 *                     description: ID du type de carburant à mettre à jour
 *                     example: 1
 *                 required:
 *                   - id
 *               - $ref: '#/components/schemas/NewFuelType'
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
export async function PUT(request: NextRequest) {
  try {
    // Authentification
    const authResult = await authenticateRequest(request);
    if (authResult !== null) {
      return authResult;
    }

    // Récupération et validation du corps de la requête
    const body = await request.json();
    const validation = FuelTypeSchema.partial().safeParse(body);

    if (!validation.success) {
      return ApiResponse.badRequest('Données invalides', validation.error.errors);
    }

    // Vérification de l'existence de l'ID
    const idSchema = z.number().int().positive();
    const idValidation = idSchema.safeParse(body.id);

    if (!idValidation.success) {
      return ApiResponse.badRequest('ID invalide ou manquant');
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
 * /api/v1/ref/car/fuel-type:
 *   delete:
 *     summary: Supprime un type de carburant
 *     description: Supprime un type de carburant existant
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 format: int32
 *                 description: ID du type de carburant à supprimer
 *                 example: 1
 *             required:
 *               - id
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
export async function DELETE(request: NextRequest) {
  try {
    // Authentification
    const authResult = await authenticateRequest(request);
    if (authResult !== null) {
      return authResult;
    }

    // Récupération et validation de l'ID
    const body = await request.json();
    const idSchema = z.number().int().positive();
    const idValidation = idSchema.safeParse(body.id);

    if (!idValidation.success) {
      return ApiResponse.badRequest('ID invalide ou manquant');
    }

    // Vérification si le type de carburant existe
    const fuelType = await fuelTypesService.findById(idValidation.data);
    if (!fuelType) {
      return ApiResponse.notFound('Type de carburant non trouvé');
    }

    // Vérification si le type de carburant est actif
    if (fuelType.isActive === 1) {
      return ApiResponse.badRequest('Impossible de supprimer un type de carburant actif. Veuillez d\'abord le désactiver.');
    }

    // Suppression du type de carburant
    await fuelTypesService.delete(idValidation.data);

    return ApiResponse.success({ message: 'Type de carburant supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du type de carburant:', error);
    return ApiResponse.error('Erreur interne du serveur');
  }
}
