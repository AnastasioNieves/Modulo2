const swaggerJsdoc = require('swagger-jsdoc');

// Helper para generar respuestas de error
const errorResponse = (code, description) => ({
  [code]: {
    description,
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/Error' }
      }
    }
  }
});

// Respuestas de error comunes reutilizables
const commonErrors = {
  badRequest: errorResponse('400', 'Datos invalidos'),
  unauthorized: errorResponse('401', 'No autorizado'),
  forbidden: errorResponse('403', 'Acceso prohibido'),
  notFound: errorResponse('404', 'No encontrado'),
  serverError: errorResponse('500', 'Error interno de servidor')
};

const definition = {
  openapi: '3.0.0',
  info: {
    title: 'AprenTIC Campus API',
    version: '1.0.0',
    description: 'API REST para gestion academica multi-campus con MongoDB y Express.'
  },
  servers: [
    {
      url: 'http://localhost:3000',
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
      Pagination: {
        type: 'object',
        description: 'Pagination metadata for paged list responses',
        properties: {
          page: { type: 'integer', description: 'Current page number' },
          limit: { type: 'integer', description: 'Maximum items returned per page' },
          total: { type: 'integer', description: 'Total number of items available' },
          pages: { type: 'integer', description: 'Total number of pages' }
        }
      },
      User: {
        type: 'object',
        description: 'Authenticated user profile information',
        properties: {
          id: { type: 'string', description: 'Unique user identifier' },
          email: { type: 'string', format: 'email', description: 'User email address' },
          role: { type: 'string', enum: ['admin', 'profesor', 'alumno'], description: 'User role for authorization checks' }
        }
      },
      AuthResponse: {
        type: 'object',
        description: 'Authentication response containing JWT and user profile',
        properties: {
          token: { type: 'string', description: 'JWT token to use in Authorization header' },
          user: { $ref: '#/components/schemas/User' }
        }
      },
      Error: {
        type: 'object',
        description: 'Standard error response',
        properties: {
          message: { type: 'string', description: 'Error message suitable for display' },
          details: {
            type: 'array',
            description: 'Optional validation or field-level details',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string', description: 'Field name related to the error' },
                message: { type: 'string', description: 'Description of the validation issue' }
              }
            }
          }
        }
      },
      Campus: {
        type: 'object',
        description: 'Campus location and contact details',
        properties: {
          _id: { type: 'string', description: 'Campus identifier' },
          nombre: { type: 'string', description: 'Campus name' },
          ciudad: { type: 'string', description: 'City where the campus is located' },
          direccion: { type: 'string', description: 'Postal address of the campus' }
        }
      },
      Promocion: {
        type: 'object',
        description: 'Academic promotion cohort information',
        properties: {
          _id: { type: 'string', description: 'Promotion identifier' },
          nombre: { type: 'string', description: 'Promotion name or title' },
          codigo: { type: 'string', description: 'External code for the promotion' },
          fechaInicio: { type: 'string', format: 'date', description: 'Promotion start date' },
          fechaFin: { type: 'string', format: 'date', description: 'Promotion end date' },
          modalidad: { type: 'string', enum: ['presencial', 'online', 'hibrida'], description: 'Delivery modality' },
          campus: { $ref: '#/components/schemas/Campus' }
        }
      },
      Profesor: {
        type: 'object',
        description: 'Professor profile data and assigned campus',
        properties: {
          _id: { type: 'string', description: 'Professor identifier' },
          nombre: { type: 'string', description: 'First name of the professor' },
          apellidos: { type: 'string', description: 'Last name of the professor' },
          email: { type: 'string', format: 'email', description: 'Contact email' },
          especialidad: { type: 'string', description: 'Main teaching specialty' },
          campus: { $ref: '#/components/schemas/Campus' },
          promociones: { type: 'array', items: { $ref: '#/components/schemas/Promocion' }, description: 'List of promotions assigned to the professor' }
        }
      },
      Proyecto: {
        type: 'object',
        description: 'Project assignment details including professor and promotion',
        properties: {
          _id: { type: 'string', description: 'Project identifier' },
          nombre: { type: 'string', description: 'Project name' },
          modulo: { type: 'string', description: 'Module or subject area for the project' },
          descripcion: { type: 'string', description: 'Detailed project description' },
          fechaEntrega: { type: 'string', format: 'date', description: 'Planned delivery date' },
          promocion: { $ref: '#/components/schemas/Promocion' },
          profesor: { $ref: '#/components/schemas/Profesor' }
        }
      },
      Alumno: {
        type: 'object',
        description: 'Student record including promotion assignment and academic status',
        properties: {
          _id: { type: 'string', description: 'Student identifier' },
          nombre: { type: 'string', description: 'First name of the student' },
          apellidos: { type: 'string', description: 'Last name of the student' },
          email: { type: 'string', format: 'email', description: 'Student email address' },
          telefono: { type: 'string', description: 'Optional phone number' },
          estado: { type: 'string', enum: ['activo', 'riesgo', 'baja', 'egresado'], description: 'Current academic status' },
          promocion: { $ref: '#/components/schemas/Promocion' }
        }
      },
      Nota: {
        type: 'object',
        description: 'Evaluation note for a student project',
        properties: {
          _id: { type: 'string', description: 'Note identifier' },
          alumno: { $ref: '#/components/schemas/Alumno' },
          proyecto: { $ref: '#/components/schemas/Proyecto' },
          profesor: { $ref: '#/components/schemas/Profesor' },
          score: { type: 'number', description: 'Numeric score for the project' },
          apto: { type: 'boolean', description: 'Pass/fail status' },
          feedback: { type: 'string', description: 'Optional instructor comments' }
        }
      },
      HealthCheck: {
        type: 'object',
        description: 'API health check response payload',
        properties: {
          status: { type: 'string', description: 'Current API status' },
          service: { type: 'string', description: 'Service identifier' }
        }
      },
      PaginatedAlumnos: {
        type: 'object',
        description: 'Paginated result for alumnos list calls',
        properties: {
          items: { type: 'array', items: { $ref: '#/components/schemas/Alumno' }, description: 'Array of alumnos' },
          pagination: { $ref: '#/components/schemas/Pagination' }
        }
      },
      PaginatedPromociones: {
        type: 'object',
        description: 'Paginated result for promociones list calls',
        properties: {
          items: { type: 'array', items: { $ref: '#/components/schemas/Promocion' }, description: 'Array of promociones' },
          pagination: { $ref: '#/components/schemas/Pagination' }
        }
      },
      PaginatedCampus: {
        type: 'object',
        description: 'Paginated result for campus list calls',
        properties: {
          items: { type: 'array', items: { $ref: '#/components/schemas/Campus' }, description: 'Array of campus objects' },
          pagination: { $ref: '#/components/schemas/Pagination' }
        }
      },
      PaginatedProfesores: {
        type: 'object',
        description: 'Paginated result for profesores list calls',
        properties: {
          items: { type: 'array', items: { $ref: '#/components/schemas/Profesor' }, description: 'Array of profesores' },
          pagination: { $ref: '#/components/schemas/Pagination' }
        }
      },
      PaginatedProyectos: {
        type: 'object',
        description: 'Paginated result for proyectos list calls',
        properties: {
          items: { type: 'array', items: { $ref: '#/components/schemas/Proyecto' }, description: 'Array of proyectos' },
          pagination: { $ref: '#/components/schemas/Pagination' }
        }
      },
      PaginatedNotas: {
        type: 'object',
        description: 'Paginated result for notas list calls',
        properties: {
          items: { type: 'array', items: { $ref: '#/components/schemas/Nota' }, description: 'Array of notas' },
          pagination: { $ref: '#/components/schemas/Pagination' }
        }
      }
    }
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/health': {
      get: {
        summary: 'Health check for API availability',
        tags: ['Health'],
        security: [],
        responses: {
          200: {
            description: 'API funcionando',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/HealthCheck' }
              }
            }
          }
        }
      }
    },
    '/api/auth/register': {
      post: {
        summary: 'Register a new user with email and password',
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
          ...commonErrors.badRequest,
          ...commonErrors.serverError
        }
      }
    },
    '/api/auth/login': {
      post: {
        summary: 'Authenticate a user and issue a JWT token',
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
          200: { description: 'JWT emitido', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
          ...errorResponse('401', 'Credenciales invalidas'),
          ...commonErrors.serverError
        }
      }
    },
    '/api/auth/me': {
      get: {
        summary: 'Get profile information for the authenticated user',
        tags: ['Auth'],
        responses: {
          200: { description: 'Perfil del usuario autenticado', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
          ...commonErrors.unauthorized,
          ...commonErrors.serverError
        }
      }
    },
    '/api/alumnos': {
      get: {
        summary: 'List or search students with optional filtering and pagination',
        tags: ['Alumnos'],
        parameters: [
          { in: 'query', name: 'campus', schema: { type: 'string' } },
          { in: 'query', name: 'promocion', schema: { type: 'string' } },
          { in: 'query', name: 'estado', schema: { type: 'string', enum: ['activo', 'riesgo', 'baja', 'egresado'] } },
          { in: 'query', name: 'search', schema: { type: 'string' } },
          { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
          { in: 'query', name: 'limit', schema: { type: 'integer', default: 20 } },
          { in: 'query', name: 'sort', schema: { type: 'string', example: '-createdAt' } }
        ],
        responses: {
          200: {
            description: 'Listado paginado de alumnos',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PaginatedAlumnos' }
              }
            }
          },
          ...commonErrors.unauthorized,
          ...commonErrors.serverError
        }
      },
      post: {
        summary: 'Create a new student record (admin only)',
        tags: ['Alumnos'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nombre', 'apellidos', 'email', 'promocion'],
                properties: {
                  nombre: { type: 'string' },
                  apellidos: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  telefono: { type: 'string' },
                  promocion: { type: 'string' },
                  estado: { type: 'string', enum: ['activo', 'riesgo', 'baja', 'egresado'] }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Alumno creado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Alumno' } } } },
          ...commonErrors.badRequest,
          ...commonErrors.unauthorized,
          ...commonErrors.forbidden,
          ...commonErrors.serverError
        }
      }
    },
    '/api/alumnos/{id}': {
      get: {
        summary: 'Get a student by ID',
        tags: ['Alumnos'],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Alumno encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Alumno' } } } },
          ...commonErrors.unauthorized,
          ...commonErrors.notFound,
          ...commonErrors.serverError
        }
      },
      put: {
        summary: 'Update student attributes by ID',
        tags: ['Alumnos'],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  nombre: { type: 'string' },
                  apellidos: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  telefono: { type: 'string' },
                  promocion: { type: 'string' },
                  estado: { type: 'string', enum: ['activo', 'riesgo', 'baja', 'egresado'] }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Alumno actualizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Alumno' } } } },
          ...commonErrors.badRequest,
          ...commonErrors.unauthorized,
          ...commonErrors.forbidden,
          ...commonErrors.notFound,
          ...commonErrors.serverError
        }
      },
      delete: {
        summary: 'Delete a student by ID',
        tags: ['Alumnos'],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: {
          204: { description: 'Alumno eliminado' },
          ...commonErrors.unauthorized,
          ...commonErrors.forbidden,
          ...commonErrors.notFound,
          ...commonErrors.serverError
        }
      }
    },
    '/api/alumnos/{id}/photo': {
      post: {
        summary: 'Upload a student photo by student ID',
        tags: ['Alumnos'],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
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
          200: { description: 'Foto subida' },
          ...commonErrors.unauthorized,
          ...commonErrors.forbidden,
          ...commonErrors.notFound,
          ...commonErrors.serverError
        }
      }
    },
    '/api/promociones': {
      get: {
        summary: 'List promotions with optional filtering and pagination',
        tags: ['Promociones'],
        parameters: [
          { in: 'query', name: 'campus', schema: { type: 'string' } },
          { in: 'query', name: 'modalidad', schema: { type: 'string', enum: ['presencial', 'online', 'hibrida'] } },
          { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
          { in: 'query', name: 'limit', schema: { type: 'integer', default: 20 } },
          { in: 'query', name: 'sort', schema: { type: 'string', example: '-createdAt' } }
        ],
        responses: {
          200: {
            description: 'Listado de promociones',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PaginatedPromociones' }
              }
            }
          },
          ...commonErrors.unauthorized,
          ...commonErrors.serverError
        }
      },
      post: {
        summary: 'Create a new promotion',
        tags: ['Promociones'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nombre', 'codigo', 'campus'],
                properties: {
                  nombre: { type: 'string' },
                  codigo: { type: 'string' },
                  campus: { type: 'string' },
                  fechaInicio: { type: 'string', format: 'date' },
                  fechaFin: { type: 'string', format: 'date' },
                  modalidad: { type: 'string', enum: ['presencial', 'online', 'hibrida'] }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Promocion creada' },
          ...commonErrors.badRequest,
          ...commonErrors.unauthorized,
          ...commonErrors.forbidden,
          ...commonErrors.serverError
        }
      }
    },
    '/api/promociones/{id}': {
      get: {
        summary: 'Get promotion details by ID',
        tags: ['Promociones'],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Promocion encontrada' },
          ...commonErrors.unauthorized,
          ...errorResponse('404', 'No encontrada'),
          ...commonErrors.serverError
        }
      },
      put: {
        summary: 'Update a promotion by ID',
        tags: ['Promociones'],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  nombre: { type: 'string' },
                  codigo: { type: 'string' },
                  campus: { type: 'string' },
                  fechaInicio: { type: 'string', format: 'date' },
                  fechaFin: { type: 'string', format: 'date' },
                  modalidad: { type: 'string', enum: ['presencial', 'online', 'hibrida'] }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Promocion actualizada' },
          ...commonErrors.badRequest,
          ...commonErrors.unauthorized,
          ...commonErrors.forbidden,
          ...errorResponse('404', 'No encontrada'),
          ...commonErrors.serverError
        }
      },
      delete: {
        summary: 'Delete a promotion by ID',
        tags: ['Promociones'],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: {
          204: { description: 'Promocion eliminada' },
          ...commonErrors.unauthorized,
          ...commonErrors.forbidden,
          ...errorResponse('404', 'No encontrada'),
          ...commonErrors.serverError
        }
      }
    },
    '/api/campus': {
      get: {
        summary: 'List campuses with optional city filter and pagination',
        tags: ['Campus'],
        parameters: [
          { in: 'query', name: 'ciudad', schema: { type: 'string' } },
          { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
          { in: 'query', name: 'limit', schema: { type: 'integer', default: 20 } },
          { in: 'query', name: 'sort', schema: { type: 'string', example: '-createdAt' } }
        ],
        responses: {
          200: {
            description: 'Listado de campus',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PaginatedCampus' }
              }
            }
          },
          ...commonErrors.unauthorized,
          ...commonErrors.serverError
        }
      },
      post: {
        summary: 'Create a new campus',
        tags: ['Campus'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nombre', 'ciudad'],
                properties: {
                  nombre: { type: 'string' },
                  ciudad: { type: 'string' },
                  direccion: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Campus creado' },
          ...commonErrors.badRequest,
          ...commonErrors.unauthorized,
          ...commonErrors.forbidden,
          ...commonErrors.serverError
        }
      }
    },
    '/api/campus/{id}': {
      get: {
        summary: 'Get campus details by ID',
        tags: ['Campus'],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Campus encontrado' },
          ...commonErrors.unauthorized,
          ...commonErrors.notFound,
          ...commonErrors.serverError
        }
      },
      put: {
        summary: 'Update a campus by ID',
        tags: ['Campus'],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  nombre: { type: 'string' },
                  ciudad: { type: 'string' },
                  direccion: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Campus actualizado' },
          ...commonErrors.badRequest,
          ...commonErrors.unauthorized,
          ...commonErrors.forbidden,
          ...commonErrors.notFound,
          ...commonErrors.serverError
        }
      },
      delete: {
        summary: 'Delete a campus by ID',
        tags: ['Campus'],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: {
          204: { description: 'Campus eliminado' },
          ...commonErrors.unauthorized,
          ...commonErrors.forbidden,
          ...commonErrors.notFound,
          ...commonErrors.serverError
        }
      }
    },
    '/api/profesores': {
      get: {
        summary: 'List professors with optional filters for campus and promotion',
        tags: ['Profesores'],
        parameters: [
          { in: 'query', name: 'campus', schema: { type: 'string' } },
          { in: 'query', name: 'promocion', schema: { type: 'string' } },
          { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
          { in: 'query', name: 'limit', schema: { type: 'integer', default: 20 } },
          { in: 'query', name: 'sort', schema: { type: 'string', example: '-createdAt' } }
        ],
        responses: {
          200: {
            description: 'Listado de profesores',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PaginatedProfesores' }
              }
            }
          },
          ...commonErrors.unauthorized,
          ...commonErrors.serverError
        }
      },
      post: {
        summary: 'Create a new professor',
        tags: ['Profesores'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nombre', 'apellidos', 'email', 'campus'],
                properties: {
                  nombre: { type: 'string' },
                  apellidos: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  especialidad: { type: 'string' },
                  campus: { type: 'string' },
                  promociones: { type: 'array', items: { type: 'string' } }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Profesor creado' },
          ...commonErrors.badRequest,
          ...commonErrors.unauthorized,
          ...commonErrors.forbidden,
          ...commonErrors.serverError
        }
      }
    },
    '/api/profesores/{id}': {
      get: {
        summary: 'Get professor details by ID',
        tags: ['Profesores'],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Profesor encontrado' },
          ...commonErrors.unauthorized,
          ...commonErrors.notFound,
          ...commonErrors.serverError
        }
      },
      put: {
        summary: 'Update a professor by ID',
        tags: ['Profesores'],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  nombre: { type: 'string' },
                  apellidos: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  especialidad: { type: 'string' },
                  campus: { type: 'string' },
                  promociones: { type: 'array', items: { type: 'string' } }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Profesor actualizado' },
          ...commonErrors.badRequest,
          ...commonErrors.unauthorized,
          ...commonErrors.forbidden,
          ...commonErrors.notFound,
          ...commonErrors.serverError
        }
      },
      delete: {
        summary: 'Delete a professor by ID',
        tags: ['Profesores'],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: {
          204: { description: 'Profesor eliminado' },
          ...commonErrors.unauthorized,
          ...commonErrors.forbidden,
          ...commonErrors.notFound,
          ...commonErrors.serverError
        }
      }
    },
    '/api/proyectos': {
      get: {
        summary: 'List projects with optional promotion, professor, and module filters',
        tags: ['Proyectos'],
        parameters: [
          { in: 'query', name: 'promocion', schema: { type: 'string' } },
          { in: 'query', name: 'profesor', schema: { type: 'string' } },
          { in: 'query', name: 'modulo', schema: { type: 'string' } },
          { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
          { in: 'query', name: 'limit', schema: { type: 'integer', default: 20 } },
          { in: 'query', name: 'sort', schema: { type: 'string', example: '-createdAt' } }
        ],
        responses: {
          200: {
            description: 'Listado de proyectos',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PaginatedProyectos' }
              }
            }
          },
          ...commonErrors.unauthorized,
          ...commonErrors.serverError
        }
      },
      post: {
        summary: 'Create a new project',
        tags: ['Proyectos'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nombre', 'modulo', 'promocion', 'profesor'],
                properties: {
                  nombre: { type: 'string' },
                  modulo: { type: 'string' },
                  descripcion: { type: 'string' },
                  promocion: { type: 'string' },
                  profesor: { type: 'string' },
                  fechaEntrega: { type: 'string', format: 'date' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Proyecto creado' },
          ...commonErrors.badRequest,
          ...commonErrors.unauthorized,
          ...commonErrors.forbidden,
          ...commonErrors.serverError
        }
      }
    },
    '/api/proyectos/{id}': {
      get: {
        summary: 'Get project details by ID',
        tags: ['Proyectos'],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Proyecto encontrado' },
          ...commonErrors.unauthorized,
          ...commonErrors.notFound,
          ...commonErrors.serverError
        }
      },
      put: {
        summary: 'Update a project by ID',
        tags: ['Proyectos'],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  nombre: { type: 'string' },
                  modulo: { type: 'string' },
                  descripcion: { type: 'string' },
                  promocion: { type: 'string' },
                  profesor: { type: 'string' },
                  fechaEntrega: { type: 'string', format: 'date' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Proyecto actualizado' },
          ...commonErrors.badRequest,
          ...commonErrors.unauthorized,
          ...commonErrors.forbidden,
          ...commonErrors.notFound,
          ...commonErrors.serverError
        }
      },
      delete: {
        summary: 'Delete a project by ID',
        tags: ['Proyectos'],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: {
          204: { description: 'Proyecto eliminado' },
          ...commonErrors.unauthorized,
          ...commonErrors.forbidden,
          ...commonErrors.notFound,
          ...commonErrors.serverError
        }
      }
    },
    '/api/notas': {
      get: {
        summary: 'List notes accessible to the authenticated user',
        tags: ['Notas'],
        parameters: [
          { in: 'query', name: 'alumno', schema: { type: 'string' } },
          { in: 'query', name: 'proyecto', schema: { type: 'string' } },
          { in: 'query', name: 'profesor', schema: { type: 'string' } },
          { in: 'query', name: 'apto', schema: { type: 'boolean' } },
          { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
          { in: 'query', name: 'limit', schema: { type: 'integer', default: 20 } },
          { in: 'query', name: 'sort', schema: { type: 'string', example: '-createdAt' } }
        ],
        responses: {
          200: {
            description: 'Listado de notas',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PaginatedNotas' }
              }
            }
          },
          ...commonErrors.unauthorized,
          ...commonErrors.serverError
        }
      },
      post: {
        summary: 'Create a new note for a project evaluation',
        tags: ['Notas'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['alumno', 'proyecto', 'score'],
                properties: {
                  alumno: { type: 'string' },
                  proyecto: { type: 'string' },
                  profesor: { type: 'string' },
                  score: { type: 'number', minimum: 0, maximum: 100 },
                  apto: { type: 'boolean' },
                  feedback: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Nota creada' },
          ...commonErrors.badRequest,
          ...commonErrors.unauthorized,
          ...commonErrors.forbidden,
          ...commonErrors.serverError
        }
      }
    },
    '/api/notas/{id}': {
      get: {
        summary: 'Get a note by its ID',
        tags: ['Notas'],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Nota encontrada' },
          ...commonErrors.unauthorized,
          ...errorResponse('404', 'No encontrada'),
          ...commonErrors.serverError
        }
      },
      put: {
        summary: 'Update an existing note by ID',
        tags: ['Notas'],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  alumno: { type: 'string' },
                  proyecto: { type: 'string' },
                  profesor: { type: 'string' },
                  score: { type: 'number', minimum: 0, maximum: 100 },
                  apto: { type: 'boolean' },
                  feedback: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Nota actualizada' },
          ...commonErrors.badRequest,
          ...commonErrors.unauthorized,
          ...commonErrors.forbidden,
          ...errorResponse('404', 'No encontrada'),
          ...commonErrors.serverError
        }
      },
      delete: {
        summary: 'Delete a note by ID',
        tags: ['Notas'],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: {
          204: { description: 'Nota eliminada' },
          ...commonErrors.unauthorized,
          ...commonErrors.forbidden,
          ...errorResponse('404', 'No encontrada'),
          ...commonErrors.serverError
        }
      }
    },
    '/api/notas/{id}/acta': {
      post: {
        summary: 'Upload an acta file for a note by ID',
        tags: ['Notas'],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  acta: { type: 'string', format: 'binary' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Acta subida' },
          ...commonErrors.unauthorized,
          ...commonErrors.forbidden,
          ...errorResponse('404', 'No encontrada'),
          ...commonErrors.serverError
        }
      }
    },
    '/api/analytics/tasa-aptos-campus': {
      get: {
        summary: 'Calculate pass rates for each campus',
        tags: ['Analytics'],
        responses: {
          200: { description: 'Porcentaje de aptos por campus' },
          ...commonErrors.unauthorized,
          ...commonErrors.serverError
        }
      }
    },
    '/api/analytics/alumnos-riesgo': {
      get: {
        summary: 'List students at academic risk based on threshold and no-aptos count',
        tags: ['Analytics'],
        parameters: [
          { in: 'query', name: 'threshold', schema: { type: 'number', default: 60 } },
          { in: 'query', name: 'minNoAptos', schema: { type: 'integer', default: 1 } }
        ],
        responses: {
          200: { description: 'Alumnos en riesgo' },
          ...commonErrors.unauthorized,
          ...commonErrors.serverError
        }
      }
    },
    '/api/analytics/ranking-proyectos-no-aptos': {
      get: {
        summary: 'Get projects ranked by number of non-passing notes',
        tags: ['Analytics'],
        parameters: [{ in: 'query', name: 'limit', schema: { type: 'integer', default: 10 } }],
        responses: {
          200: { description: 'Ranking de proyectos no aptos' },
          ...commonErrors.unauthorized,
          ...commonErrors.serverError
        }
      }
    }
  }
};

module.exports = swaggerJsdoc({
  definition,
  apis: ['./src/routes/*.js']
});
