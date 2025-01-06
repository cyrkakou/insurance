/**
 * @swagger
 * /api/v1/auth/token:
 *   post:
 *     summary: Génère un token JWT d'authentification
 *     description: |
 *       Authentifie un utilisateur avec son client ID et secret, et retourne un token JWT.
 *       Le client ID et le secret doivent être fournis dans le corps de la requête.
 *       Les tokens générés sont valables pour une durée limitée et doivent être inclus 
 *       dans l'en-tête Authorization de toutes les requêtes ultérieures.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - clientId
 *               - clientSecret
 *             properties:
 *               clientId:
 *                 type: string
 *                 description: Identifiant client unique fourni lors de l'inscription
 *                 example: "client_123456789"
 *                 minLength: 1
 *               clientSecret:
 *                 type: string
 *                 description: Secret client associé à l'identifiant
 *                 example: "sec_abcdefghijklmnop"
 *                 minLength: 1
 *           examples:
 *             success:
 *               summary: Exemple de requête valide
 *               value:
 *                 clientId: "client_123456789"
 *                 clientSecret: "sec_abcdefghijklmnop"
 *     responses:
 *       200:
 *         description: Token JWT généré avec succès
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
 *                     access_token:
 *                       type: string
 *                       description: Token JWT à utiliser pour l'authentification
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     token_type:
 *                       type: string
 *                       description: Type du token
 *                       example: "Bearer"
 *                     expires_in:
 *                       type: integer
 *                       description: Durée de validité du token en secondes
 *                       example: 3600
 *             examples:
 *               success:
 *                 summary: Authentification réussie
 *                 value:
 *                   success: true
 *                   data:
 *                     access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     token_type: "Bearer"
 *                     expires_in: 3600
 *       400:
 *         description: Erreur de validation des données
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Validation failed"
 *                 details:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                       message:
 *                         type: string
 *             examples:
 *               missing_fields:
 *                 summary: Champs manquants
 *                 value:
 *                   success: false
 *                   error: "Validation failed"
 *                   details: [
 *                     {
 *                       field: "clientId",
 *                       message: "Client ID is required"
 *                     }
 *                   ]
 *               invalid_json:
 *                 summary: JSON invalide
 *                 value:
 *                   success: false
 *                   error: "Invalid request body"
 *                   message: "Request body must be a valid JSON"
 *       401:
 *         description: Authentification échouée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Authentication failed"
 *                 message:
 *                   type: string
 *             examples:
 *               invalid_credentials:
 *                 summary: Identifiants invalides
 *                 value:
 *                   success: false
 *                   error: "Authentication failed"
 *                   message: "Invalid client credentials"
 *               client_inactive:
 *                 summary: Client inactif
 *                 value:
 *                   success: false
 *                   error: "Authentication failed"
 *                   message: "Client account is inactive"
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                 message:
 *                   type: string
 *             examples:
 *               server_error:
 *                 summary: Erreur interne
 *                 value:
 *                   success: false
 *                   error: "Internal server error"
 *                   message: "An unexpected error occurred during authentication"
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { getDatabase } from '@/config/database';
import { users } from '@/database/schema/users.schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

// Schéma de validation pour les credentials
const CredentialsSchema = z.object({
  clientId: z.string().min(1, "Client ID is required"),
  clientSecret: z.string().min(1, "Client Secret is required")
});

export async function POST(request: NextRequest) {
  try {
    // Récupérer et valider les données de la requête
    let requestData;
    try {
      requestData = await request.json();
    } catch (error) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid request body', 
          message: 'Request body must be a valid JSON' 
        },
        { status: 400 }
      );
    }

    // Valider les credentials
    const validationResult = CredentialsSchema.safeParse(requestData);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Validation failed', 
          details: validationResult.error.errors.map(err => ({
            field: err.path[0],
            message: err.message
          }))
        },
        { status: 400 }
      );
    }

    const { clientId, clientSecret } = validationResult.data;

    // Initialiser la connexion à la base de données
    const db = await getDatabase();

    // Rechercher l'utilisateur par clientId
    const userResult = await db
      .select({
        id: users.id,
        username: users.username,
        password: users.password,
        role: users.role,
        isActive: users.isActive 
      })
      .from(users)
      .where(eq(users.username, clientId))
      .limit(1);

    // Vérifier si l'utilisateur existe et est actif
    if (userResult.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Authentication failed', 
          message: 'Invalid client credentials' 
        },
        { status: 401 }
      );
    }

    const user = userResult[0];

    // Vérifier le statut de l'utilisateur
    if (user.isActive !== 1) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Account inactive', 
          message: 'User account is not active' 
        },
        { status: 403 }
      );
    }

    // Vérifier le mot de passe
    const hashedInputSecret = crypto
      .createHash('sha256')
      .update(clientSecret)
      .digest('hex');

    if (hashedInputSecret !== user.password) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Authentication failed', 
          message: 'Invalid client credentials' 
        },
        { status: 401 }
      );
    }

    // Générer un token JWT
    const token = jwt.sign(
      {
        userId: user.id.toString(),
        username: user.username,
        role: user.role,
        type: 'access_token'
      },
      process.env.JWT_SECRET || '',
      { 
        expiresIn: '24h',
        issuer: 'next-insurance-api',
        audience: 'next-insurance-client'
      }
    );

    // Générer un refresh token (optionnel)
    const refreshToken = jwt.sign(
      {
        userId: user.id.toString(),
        type: 'refresh_token'
      },
      process.env.JWT_REFRESH_SECRET  || '',
      { 
        expiresIn: '7d',
        issuer: 'next-insurance-api',
        audience: 'next-insurance-client'
      }
    );

    return NextResponse.json({
      success: true,
      data: {
        access_token: token,
        refresh_token: refreshToken,
        token_type: 'Bearer',
        expires_in: 24 * 60 * 60, // 24 heures en secondes
        user: {
          id: user.id,
          username: user.username,
          role: user.role
        }
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Token generation error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error', 
        message: 'An unexpected error occurred during authentication' 
      },
      { status: 500 }
    );
  }
}
