const { Pool } = require('pg');
const config = require('../config/env');

// Un solo pool compartido por toda la app -- evita abrir una conexión
// nueva por cada request.
const pool = new Pool(config.db);

module.exports = pool;
