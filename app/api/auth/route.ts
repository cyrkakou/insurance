import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const API_KEY = process.env.API_KEY || 'your-api-key';

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'API Key
    const apiKey = request.headers.get('x-api-key');
    if (!apiKey || apiKey !== API_KEY) {
      return NextResponse.json(
        { error: 'Invalid API Key' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { clientId, clientSecret } = body;

    // Dans un environnement de production, vous devriez vérifier ces informations
    // par rapport à une base de données d'utilisateurs
    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'Missing credentials' },
        { status: 400 }
      );
    }

    // Générer le token JWT
    const token = jwt.sign(
      { 
        clientId,
        type: 'access_token'
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return NextResponse.json({
      access_token: token,
      token_type: 'Bearer',
      expires_in: 3600
    });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
