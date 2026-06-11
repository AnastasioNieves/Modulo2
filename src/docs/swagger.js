const swaggerJsdoc = require('swagger-jsdoc');

const definition = {
  openapi: '3.0.0',
  info: {
    title: 'AprenTIC Campus API',
    version: '1.0.0',
    description: 'API REST para gestion academica multi-campus con MongoDB y Express.'
  },
  servers: [
    {
      url: '/',
      description: 'Local'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      AuthResponse: {
        type: 'object',
        properties: {
          token: { type: 'string' },
          user: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              email: { type: 'string' },
              role: { type: 'string', enum: ['admin', 'profesor', 'alumno'] }
            }
          }
        }
      },
      Error: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          details: { type: 'array', items: { type: 'object' } }
        }
      }
    }
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        security: [],
        responses: {
          200: { description: 'API funcionando' }
        }
      }
    },
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                  role: { type: 'string', enum: ['admin', 'profesor', 'alumno'] },
                  profesor: { type: 'string' },
                  alumno: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Usuario registrado' },
          400: { description: 'Datos invalidos' }
        }
      }
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'JWT emitido' },
          401: { description: 'Credenciales invalidas' }
        }
      }
    },
    '/api/alumnos': {
      get: {
        tags: ['Alumnos'],
        parameters: [
          { in: 'query', name: 'campus', schema: { type: 'string' } },
          { in: 'query', name: 'promocion', schema: { type: 'string' } },
          { in: 'query', name: 'page', schema: { type: 'integer' } },
          { in: 'query', name: 'sort', schema: { type: 'string', example: '-createdAt' } }
        ],
        responses: {
          200: { description: 'Listado paginado de alumnos' }
        }
      },
      post: {
        tags: ['Alumnos'],
        responses: {
          201: { description: 'Alumno creado' },
          403: { description: 'Solo admin' }
        }
      }
    },
    '/api/alumnos/{id}/photo': {
      post: {
        tags: ['Alumnos'],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  foto: { type: 'string', format: 'binary' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Foto subida' }
        }
      }
    },
    '/api/notas': {
      get: {
        tags: ['Notas'],
        responses: {
          200: { description: 'Listado de notas segun permisos' }
        }
      },
      post: {
        tags: ['Notas'],
        responses: {
          201: { description: 'Nota creada' }
        }
      }
    },
    '/api/analytics/tasa-aptos-campus': {
      get: {
        tags: ['Analytics'],
        responses: {
          200: { description: 'Porcentaje de aptos por campus' }
        }
      }
    },
    '/api/analytics/alumnos-riesgo': {
      get: {
        tags: ['Analytics'],
        parameters: [
          { in: 'query', name: 'threshold', schema: { type: 'number', default: 60 } },
          { in: 'query', name: 'minNoAptos', schema: { type: 'integer', default: 2 } }
        ],
        responses: {
          200: { description: 'Alumnos con media baja o demasiados no aptos' }
        }
      }
    },
    '/api/analytics/ranking-proyectos-no-aptos': {
      get: {
        tags: ['Analytics'],
        parameters: [{ in: 'query', name: 'limit', schema: { type: 'integer', default: 10 } }],
        responses: {
          200: { description: 'Ranking de proyectos por numero de no aptos' }
        }
      }
    }
  }
};

module.exports = swaggerJsdoc({
  definition,
  apis: ['./src/routes/*.js']
});
