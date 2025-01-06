/**
 * @swagger
 * /api/v1/ref/car/fuel-types:
 *   get:
 *     summary: Récupère la liste des types de carburant actifs
 *     tags: [References]
 *     security:
 *       - bearerAuth: []
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
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "1"
 *                       name:
 *                         type: string
 *                         example: "Essence"
 *                       isActive:
 *                         type: boolean
 *                         example: true
 *       401:
 *         description: Non autorisé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

import { NextRequest } from 'next/server';
import { RefFuelTypesService } from '@/services/ref-fuel-types.service';
import { authenticateRequest } from '@/middleware/auth';
import { ApiResponse } from '@/common/api-response';

const fuelTypesService = new RefFuelTypesService();

export async function GET(request: NextRequest) {
  try {
    // Authentification
    const authResult = await authenticateRequest(request);
    if (authResult !== null) {
      return authResult;
    }

    // Récupérer tous les fuel types actifs
    const fuelTypes = await fuelTypesService.findActiveFuelTypes();

    // Supprimer les champs createdAt et updatedAt
    const cleanedFuelTypes = fuelTypes.map(({ createdAt, updatedAt, ...rest }) => rest);

    return ApiResponse.success(cleanedFuelTypes);
  } catch (error) {
    console.error('Error fetching active fuel types:', error);
    return ApiResponse.error('Internal server error');
  }
}
