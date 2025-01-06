import { NextResponse } from 'next/server';

interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: any;
  };
}

interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export class ApiResponse {
  static success<T>(data: T, status: number = 200): NextResponse<ApiSuccessResponse<T>> {
    return NextResponse.json(
      { 
        success: true, 
        data 
      }, 
      { status }
    );
  }

  static error(
    message: string, 
    status: number = 500, 
    code?: string,
    details?: any
  ): NextResponse<ApiErrorResponse> {
    return NextResponse.json(
      { 
        success: false, 
        error: {
          message,
          ...(code && { code }),
          ...(details && { details })
        }
      }, 
      { status }
    );
  }

  static badRequest(message: string = 'Requête invalide', details?: any): NextResponse<ApiErrorResponse> {
    return this.error(message, 400, 'BAD_REQUEST', details);
  }

  static notFound(message: string = 'Ressource non trouvée', details?: any): NextResponse<ApiErrorResponse> {
    return this.error(message, 404, 'NOT_FOUND', details);
  }

  static unauthorized(message: string = 'Non autorisé', details?: any): NextResponse<ApiErrorResponse> {
    return this.error(message, 401, 'UNAUTHORIZED', details);
  }

  static forbidden(message: string = 'Accès interdit', details?: any): NextResponse<ApiErrorResponse> {
    return this.error(message, 403, 'FORBIDDEN', details);
  }

  static conflict(message: string = 'Conflit de ressources', details?: any): NextResponse<ApiErrorResponse> {
    return this.error(message, 409, 'CONFLICT', details);
  }

  static created<T>(data: T): NextResponse<ApiSuccessResponse<T>> {
    return this.success(data, 201);
  }

  static internalError(message: string = 'Erreur interne du serveur', details?: any): NextResponse<ApiErrorResponse> {
    return this.error(message, 500, 'INTERNAL_ERROR', details);
  }
}
