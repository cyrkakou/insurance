import { NextRequest } from 'next/server';
import { headers } from 'next/headers';
import jwt from 'jsonwebtoken';

export interface JWTPayload {
  userId: number;
  role: string;
}

export async function verifyJWT(request: NextRequest): Promise<JWTPayload | null> {
  const headersList = await headers();
  const authorization = headersList.get('authorization');

  if (!authorization?.startsWith('Bearer ')) {
    return null;
  }

  const token = authorization.split(' ')[1];
  const JWT_SECRET = process.env.JWT_SECRET;

  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }

  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}
