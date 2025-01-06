import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Ne traiter que les requêtes API
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Vérifier si la route correspond au pattern de routes définies
    const apiRoutePattern = /^\/api\/(v1\/(auth\/token|ref\/car\/fuel-types?|token)|users|auth)/;
    
    if (!apiRoutePattern.test(request.nextUrl.pathname)) {
      console.log('[DEBUG] Route non autorisée:', request.nextUrl.pathname);
      return NextResponse.json(
        {
          error: 'Not Found',
          message: 'The requested API endpoint does not exist',
          path: request.nextUrl.pathname
        }, 
        { status: 404 }
      );
    }
    console.log('[DEBUG] Route autorisée:', request.nextUrl.pathname);
  }

  // Continuer normalement pour les routes valides
  return NextResponse.next();
}

// Configurer les routes à surveiller
export const config = {
  matcher: '/api/:path*'
};
