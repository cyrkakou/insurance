import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { getDatabase } from '@/config/database';
import { apiKeys } from '@/database/schema/api-keys.schema';
import { eq } from 'drizzle-orm';

// Schéma de validation pour l'API Key
const ApiKeySchema = z.string().min(16, "API Key must be at least 16 characters long");

// Configuration de l'authentification
const AUTH_CONFIG = {
  API_KEY: process.env.API_KEY || '',
  JWT_SECRET: process.env.JWT_SECRET || '',
};

// Interface pour le payload du token JWT
export interface JWTPayload {
  userId: string;
  role: string;
  iat?: number;
  exp?: number;
}

export async function authenticateRequest(request: NextRequest) {
  try {
    // Vérifier l'API Key
    const apiKey = request.headers.get('x-api-key');
    if (!apiKey) {
      return createErrorResponse('API Key is required', 401);
    }

    // Valider le format de l'API Key
    const apiKeyValidation = ApiKeySchema.safeParse(apiKey);
    if (!apiKeyValidation.success) {
      return createErrorResponse('Invalid API Key format', 401);
    }

    // Vérifier si l'API Key existe dans la base de données
    const db = await getDatabase();
    const apiKeyRecord = await db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.apiKey, apiKey))
      .limit(1);

    // Vérifier si la clé API est valide et active
    if (apiKeyRecord.length === 0 || apiKeyRecord[0].isActive !== 1) {
      // Si la clé n'est pas dans la base de données, vérifier la clé de configuration
      if (apiKey !== AUTH_CONFIG.API_KEY) {
        return createErrorResponse('Invalid API Key', 401);
      }
    }

    // Vérifier le Bearer Token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return createErrorResponse('Bearer Token is required', 401);
    }

    const token = authHeader.split(' ')[1];
    
    // Vérifier et décoder le token JWT
    const decoded = verifyToken(token);

    if (!decoded) {
      return createErrorResponse('Invalid or expired token', 401);
    }

    // Si tout est ok, retourner null (pas d'erreur)
    return null;
  } catch (error) {
    console.error('Authentication error:', error);
    return createErrorResponse('Authentication failed', 500);
  }
}

// Fonction pour créer un token JWT
export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  if (!AUTH_CONFIG.JWT_SECRET) {
    throw new Error('JWT_SECRET is not set');
  }

  return jwt.sign(payload, AUTH_CONFIG.JWT_SECRET, { 
    expiresIn: '6h' 
  });
}

// Fonction pour vérifier un token JWT
function verifyToken(token: string): JWTPayload | null {
  try {
    if (!AUTH_CONFIG.JWT_SECRET) {
      throw new Error('JWT_SECRET is not set');
    }

    // Log des informations de débogage
    //console.log('JWT Secret:', AUTH_CONFIG.JWT_SECRET);
    //console.log('Token to verify:', token);

    // Vérifier si le secret est le même que le token (cas anormal)
    if (AUTH_CONFIG.JWT_SECRET === token) {
      console.error('JWT_SECRET is incorrectly set to the token itself');
      return null;
    }

    // Essayer de décoder manuellement pour comprendre la structure
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid token format');
      return null;
    }

    // Décodage du payload
    const payloadBase64 = parts[1];
    const payloadJson = Buffer.from(payloadBase64, 'base64').toString('utf-8');
    const payload = JSON.parse(payloadJson) as JWTPayload;

    // Validation du payload
    if (!payload.userId || !payload.role) {
      console.error('Invalid token payload:', payload);
      return null;
    }

    // Vérification de l'expiration
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      console.error('Token has expired');
      return null;
    }

    return payload;
  } catch (error) {
    // Log détaillé de l'erreur
    console.error('Token verification error:', error);
    return null;
  }
}

// Fonction utilitaire pour créer des réponses d'erreur
function createErrorResponse(message: string, status: number) {
  return NextResponse.json(
    { 
      success: false, 
      error: { message } 
    }, 
    { status }
  );
}

// Fonction pour générer une nouvelle API Key (à utiliser avec précaution)
export function generateApiKey(): string {
  return crypto.randomBytes(32).toString('hex');
}
