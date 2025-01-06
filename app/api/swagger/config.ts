import { OAS3Definition, OAS3Options } from 'swagger-jsdoc';

const swaggerDefinition: OAS3Definition = {
  openapi: '3.0.0', // Changed from 3.1.0 to 3.0.0 for better compatibility
  info: {
    title: 'Next Insurance API Documentation',
    version: '1.0.0',
    description: 'API documentation for Next Insurance platform',
    contact: {
      name: 'API Support',
      email: 'support@next-insurance.com'
    },
  },
  servers: [
    {
      url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
      description: 'API Server',
    },
  ],
  tags: [
    {
      name: 'Authentication',
      description: 'Endpoints pour l\'authentification'
    },
    {
      name: 'References',
      description: 'Endpoints pour les données de référence'
    },
    {
      name: 'Categories',
      description: 'Gestion des catégories d\'assurance'
    },
    {
      name: 'Vehicles',
      description: 'Gestion des données relatives aux véhicules'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Utilisez le token JWT obtenu via /api/v1/auth/token'
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false
          },
          error: {
            type: 'string',
            example: 'Error message'
          }
        }
      },
      Success: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true
          },
          data: {
            type: 'object',
            example: {}
          }
        }
      },
      Category: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            example: 1
          },
          name: {
            type: 'string',
            example: 'Auto'
          },
          description: {
            type: 'string',
            example: 'Assurance automobile'
          },
          isActive: {
            type: 'integer',
            minimum: 0,
            maximum: 1,
            example: 1
          }
        }
      },
      VehicleBodyType: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            example: 1
          },
          name: {
            type: 'string',
            example: 'Berline'
          },
          description: {
            type: 'string',
            example: 'Voiture à coffre fermé'
          },
          isActive: {
            type: 'integer',
            minimum: 0,
            maximum: 1,
            example: 1
          }
        }
      },
      FuelType: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            example: 1
          },
          name: {
            type: 'string',
            example: 'Essence'
          },
          description: {
            type: 'string',
            example: 'Carburant essence'
          },
          isActive: {
            type: 'integer',
            minimum: 0,
            maximum: 1,
            example: 1
          }
        }
      },
      NewFuelType: {
        type: 'object',
        required: ['name', 'description'],
        properties: {
          name: {
            type: 'string',
            example: 'Essence'
          },
          description: {
            type: 'string',
            example: 'Carburant essence'
          },
          isActive: {
            type: 'integer',
            minimum: 0,
            maximum: 1,
            example: 1
          }
        }
      }
    }
  },
  security: [{
    bearerAuth: []
  }]
};

export const swaggerOptions: OAS3Options = {
  definition: swaggerDefinition,
  apis: ['./app/api/**/*.ts'], // Path to the API docs
};
