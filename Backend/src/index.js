const express = require('express');
const swaggerUi = require('swagger-ui-express');
const config = require('./config/env');
const swaggerSpec = require('./docs/swaggerSpec');
const healthRoute = require('./routes/health');
const readyRoute = require('./routes/ready');
const partidasRoute = require('./routes/partidas');

const app = express();
app.use(express.json());

app.use(healthRoute);
app.use(readyRoute);
app.use('/partidas', partidasRoute);

// Página tipo Swagger UI (la misma idea que trae Spring Boot con
// springdoc): lista cada ruta con sus campos y deja probarla desde
// el navegador con el botón "Try it out", incluido el header
// Authorization para las rutas protegidas.
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Red de seguridad: si algo lanza una excepción no manejada en un
// handler, esto responde 500 en vez de tumbar el proceso completo.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno' });
});

app.listen(config.port, () => {
  console.log(`Servidor escuchando en puerto ${config.port}`);
});

module.exports = app;
