/**
 * @swagger
 * /api/v1/ref/categories:
 *   get:
 *     summary: Récupère la liste des catégories
 *     description: Retourne toutes les catégories disponibles dans le système
 *     tags: [References, Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des catégories récupérée avec succès
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
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "1"
 *                       code:
 *                         type: string
 *                         example: "AUTO"
 *                       name:
 *                         type: string
 *                         example: "Automobile"
 *                       description:
 *                         type: string
 *                         example: "Assurance automobile"
 *                       isActive:
 *                         type: boolean
 *                         example: true
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/schemas/Error'
 *   post:
 *     summary: Crée une nouvelle catégorie
 *     description: Crée une nouvelle catégorie dans le système
 *     tags: [References, Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - name
 *             properties:
 *               code:
 *                 type: string
 *                 example: "AUTO"
 *                 description: Code unique de la catégorie
 *               name:
 *                 type: string
 *                 example: "Automobile"
 *                 description: Nom de la catégorie
 *               description:
 *                 type: string
 *                 example: "Assurance automobile"
 *                 description: Description détaillée de la catégorie
 *               isActive:
 *                 type: boolean
 *                 default: true
 *                 description: Statut d'activation de la catégorie
 *     responses:
 *       201:
 *         description: Catégorie créée avec succès
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
 *                     id:
 *                       type: string
 *                       example: "1"
 *                     code:
 *                       type: string
 *                       example: "AUTO"
 *                     name:
 *                       type: string
 *                       example: "Automobile"
 *                     description:
 *                       type: string
 *                       example: "Assurance automobile"
 *                     isActive:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       409:
 *         description: Conflit - Code déjà existant
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/schemas/Error'
 */

import { NextRequest } from 'next/server';
import { RefCategoriesService } from '@/services/ref-categories.service';
import { authenticateRequest } from '@/middleware/auth';
import { ApiResponse } from '@/common/api-response';
import { RefCategorySchema } from '@/validations/ref-categories.validation';

const categoriesService = new RefCategoriesService();

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (authResult !== null) {
      return authResult;
    }

    const categories = await categoriesService.findAll();
    
    const cleanResults = categories.map(({ createdAt, updatedAt, ...rest }) => rest);
    return ApiResponse.success(cleanResults);
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    return ApiResponse.internalError('Erreur lors de la récupération des catégories');
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (authResult !== null) {
      return authResult;
    }

    const body = await request.json();
    const validation = RefCategorySchema.safeParse(body);

    if (!validation.success) {
      return ApiResponse.badRequest('Données invalides', validation.error.errors);
    }

    // Vérifier si le code existe déjà
    const existing = await categoriesService.findByCode(validation.data.code);
    if (existing) {
      return ApiResponse.conflict('Une catégorie avec ce code existe déjà');
    }

    const category = await categoriesService.create(validation.data);
    if (!category) {
      return ApiResponse.internalError('Erreur lors de la création de la catégorie');
    }

    const { createdAt, updatedAt, ...cleanResult } = category;
    return ApiResponse.created(cleanResult);
  } catch (error) {
    console.error('Erreur lors de la création de la catégorie:', error);
    return ApiResponse.internalError('Erreur lors de la création de la catégorie');
  }
}
