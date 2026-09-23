const swaggerJsdoc = require('swagger-jsdoc');

// Genera el spec OpenAPI leyendo los comentarios @openapi de los
// archivos de rutas -- así la documentación vive junto al código
// que describe, en vez de un archivo separado que se desactualiza.
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Tarea 1 - Partidas API',
      version: '1.0.0',
      description: 'CRUD de partidas protegido con tokens de Keycloak',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsdoc(options);
