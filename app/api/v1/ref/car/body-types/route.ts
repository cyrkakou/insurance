/**
 * @swagger
 * /api/v1/ref/car/body-types:
 *   get:
 *     summary: Récupère la liste des types de carrosserie
 *     description: |
 *       Retourne tous les types de carrosserie actifs disponibles dans le système.
 *       Les types de carrosserie sont utilisés pour catégoriser les véhicules.
 *       Les champs createdAt et updatedAt sont automatiquement exclus de la réponse.
 *     tags: [References, Vehicles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des types de carrosserie récupérée avec succès
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
 *                         description: Identifiant unique du type de carrosserie
 *                       name:
 *                         type: string
 *                         example: "Berline"
 *                         description: Nom du type de carrosserie
 *                       code:
 *                         type: string
 *                         example: "SEDAN"
 *                         description: Code unique du type de carrosserie
 *                       description:
 *                         type: string
 *                         example: "Voiture à 3 volumes : capot, habitacle et coffre"
 *                         description: Description détaillée du type de carrosserie
 *                       isActive:
 *                         type: boolean
 *                         example: true
 *                         description: Indique si le type de carrosserie est actif
 *             examples:
 *               success:
 *                 summary: Liste des types de carrosserie
 *                 value:
 *                   success: true
 *                   data: [
 *                     {
 *                       id: "1",
 *                       code: "SEDAN",
 *                       name: "Berline",
 *                       description: "Voiture à 3 volumes : capot, habitacle et coffre",
 *                       isActive: true
 *                     },
 *                     {
 *                       id: "2",
 *                       code: "BREAK",
 *                       name: "Break",
 *                       description: "Voiture familiale avec un grand coffre",
 *                       isActive: true
 *                     }
 *                   ]
 *       401:
 *         description: Non autorisé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               unauthorized:
 *                 summary: Token manquant ou invalide
 *                 value:
 *                   success: false
 *                   error: "Unauthorized"
 *                   message: "Missing or invalid authentication token"
 *               token_expired:
 *                 summary: Token expiré
 *                 value:
 *                   success: false
 *                   error: "Unauthorized"
 *                   message: "Authentication token has expired"
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               database_error:
 *                 summary: Erreur de base de données
 *                 value:
 *                   success: false
 *                   error: "Internal server error"
 *                   message: "Error fetching body types from database"
 */

import { NextRequest } from 'next/server';
import { RefVehicleBodyTypesService } from '@/services/ref-vehicle-body-types.service';
import { authenticateRequest } from '@/middleware/auth';
import { ApiResponse } from '@/common/api-response';

const bodyTypesService = new RefVehicleBodyTypesService();

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (authResult !== null) {
      return authResult;
    }

    const bodyTypes = await bodyTypesService.findAll(true);
    const cleanResults = bodyTypes.map(({ createdAt, updatedAt, ...rest }) => rest);
    
    return ApiResponse.success(cleanResults);
  } catch (error) {
    return ApiResponse.error('Erreur interne du serveur');
  }
}
