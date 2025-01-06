/**
 * @swagger
 * /api/v1/ref/categories/{id}:
 *   get:
 *     summary: Récupère une catégorie par son ID
 *     description: Retourne les détails d'une catégorie spécifique
 *     tags: [References, Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la catégorie
 *     responses:
 *       200:
 *         description: Catégorie trouvée avec succès
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
 *         description: ID invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       404:
 *         description: Catégorie non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/schemas/Error'
 *   put:
 *     summary: Met à jour une catégorie
 *     description: Met à jour les informations d'une catégorie existante
 *     tags: [References, Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la catégorie à mettre à jour
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 example: "AUTO"
 *               name:
 *                 type: string
 *                 example: "Automobile"
 *               description:
 *                 type: string
 *                 example: "Assurance automobile"
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Catégorie mise à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       404:
 *         description: Catégorie non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Conflit - Code déjà utilisé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/schemas/Error'
 *   delete:
 *     summary: Supprime une catégorie
 *     description: Supprime une catégorie existante
 *     tags: [References, Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la catégorie à supprimer
 *     responses:
 *       200:
 *         description: Catégorie supprimée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       404:
 *         description: Catégorie non trouvée
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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authenticateRequest(request);
    if (authResult !== null) {
      return authResult;
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return ApiResponse.badRequest('ID invalide');
    }

    const category = await categoriesService.findById(id);
    if (!category) {
      return ApiResponse.notFound('Catégorie non trouvée');
    }

    const { createdAt, updatedAt, ...cleanResult } = category;
    return ApiResponse.success(cleanResult);
  } catch (error) {
    console.error('Erreur lors de la récupération de la catégorie:', error);
    return ApiResponse.internalError('Erreur lors de la récupération de la catégorie');
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authenticateRequest(request);
    if (authResult !== null) {
      return authResult;
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return ApiResponse.badRequest('ID invalide');
    }

    const body = await request.json();
    const validation = RefCategorySchema.partial().safeParse(body);

    if (!validation.success) {
      return ApiResponse.badRequest('Données invalides', validation.error.errors);
    }

    // Vérifier si la catégorie existe
    const exists = await categoriesService.exists(id);
    if (!exists) {
      return ApiResponse.notFound('Catégorie non trouvée');
    }

    // Si le code est modifié, vérifier qu'il n'existe pas déjà
    if (validation.data.code) {
      const existing = await categoriesService.findByCode(validation.data.code);
      if (existing && existing.id !== id) {
        return ApiResponse.conflict('Une catégorie avec ce code existe déjà');
      }
    }

    const category = await categoriesService.update(id, validation.data);
    if (!category) {
      return ApiResponse.internalError('Erreur lors de la mise à jour de la catégorie');
    }

    const { createdAt, updatedAt, ...cleanResult } = category;
    return ApiResponse.success(cleanResult);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la catégorie:', error);
    return ApiResponse.internalError('Erreur lors de la mise à jour de la catégorie');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authenticateRequest(request);
    if (authResult !== null) {
      return authResult;
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return ApiResponse.badRequest('ID invalide');
    }

    const success = await categoriesService.delete(id);
    if (!success) {
      return ApiResponse.notFound('Catégorie non trouvée');
    }

    return ApiResponse.success({ message: 'Catégorie supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la catégorie:', error);
    return ApiResponse.internalError('Erreur lors de la suppression de la catégorie');
  }
}
