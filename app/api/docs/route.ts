import { NextRequest, NextResponse } from 'next/server';
import swaggerJsdoc from 'swagger-jsdoc';
import { swaggerOptions } from '../swagger/config';

const specs = swaggerJsdoc(swaggerOptions);

export async function GET(request: NextRequest) {
  return NextResponse.json(specs);
}
