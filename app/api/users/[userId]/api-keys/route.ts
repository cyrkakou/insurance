import { NextRequest, NextResponse } from 'next/server';
import { apiKeys, users } from '@schema/index';
import { generateApiKey } from '@common/api-key';
import { getDatabase } from '@config/database';
import { eq } from 'drizzle-orm';
import { verifyJWT } from '@common/jwt-verify';

export async function POST(
  request: NextRequest,
  context: { params: { userId: string } }
) {
    // Récupérer et valider les données de la requête
    let requestData = {};
    
    if (request.headers.get('content-length') !== '0') {
      try {
        const body = await request.json();
        if (body && typeof body === 'object') {
          requestData = body;
        }
      } catch (error) {
        // Continue avec l'objet vide par défaut si le JSON est invalide
        console.warn('Invalid JSON in request body, using default values');
      }
    }

  try {
    // Vérifier le JWT
    const decoded = await verifyJWT(request);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Récupérer et valider l'ID utilisateur
    const { userId } = await context.params;
    if (!userId || userId.length === 0) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const userIdNum = parseInt(userId);
    if (isNaN(userIdNum) || userIdNum <= 0) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }

    // Initialiser la connexion à la base de données
    const db = await getDatabase();

    // Vérifier si l'utilisateur existe
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.id, userIdNum))
      .limit(1);

    if (!userResult || userResult.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Générer une nouvelle clé API
    const apiKey = generateApiKey(userIdNum);

    // Récupérer les données de la requête
    const name = requestData.name || 'Default API Key';
    const description = requestData.description || 'Default API Key';
    const environment = ['PRODUCTION', 'SANDBOX', 'DEVELOPMENT'].includes(requestData.environment)
      ? requestData.environment
      : 'DEVELOPMENT';

    // Insérer la nouvelle clé API
    await db.insert(apiKeys).values({
      userId: userIdNum.toString(),
      apiKey: apiKey,
      name: name,
      description: description,
      environment: environment,
      expiresAt: null,
      lastUsedAt: null,
      rateLimit: 100,
      isActive: 1,
      permissions: null,
      metadata: null
    });

    return NextResponse.json({ 
      apiKey, 
      message: 'API Key generated successfully' 
    }, { status: 201 });

  } catch (error) {
    console.error('API Key Generation Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  context: { params: { userId: string } }
) {
  try {
    // Vérifier le JWT
    const decoded = await verifyJWT(request);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Récupérer et valider l'ID utilisateur
    const { userId } = context.params;
    if (!userId || userId.length === 0) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const userIdNum = parseInt(userId);
    if (isNaN(userIdNum) || userIdNum <= 0) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }

    // Initialiser la connexion à la base de données
    const db = await getDatabase();

    // Récupérer toutes les clés API de l'utilisateur
    const userApiKeys = await db.select({
      id: apiKeys.id,
      name: apiKeys.name,
      description: apiKeys.description,
      environment: apiKeys.environment,
      isActive: apiKeys.isActive,
      lastUsedAt: apiKeys.lastUsedAt,
      expiresAt: apiKeys.expiresAt,
      createdAt: apiKeys.createdAt,
      updatedAt: apiKeys.updatedAt
    })
    .from(apiKeys)
    .where(eq(apiKeys.userId, userIdNum.toString()));

    return NextResponse.json(userApiKeys);

  } catch (error) {
    console.error('API Keys Retrieval Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: String(error) },
      { status: 500 }
    );
  }
}
