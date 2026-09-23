const express = require('express');
const pool = require('../db/pool');
const router = express.Router();

/**
 * @openapi
 * /ready:
 *   get:
 *     summary: Readiness -- verifica la conexión con PostgreSQL
 *     tags: [Sistema]
 *     responses:
 *       200:
 *         description: La base de datos responde
 *       503:
 *         description: La base de datos no responde
 */
// Readiness: 200 si Postgres responde, 503 si no.
// Esto es lo que evita que docker-compose "dé por lista" la app
// antes de que su dependencia real (la base) lo esté.
router.get('/ready', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'ready' });
  } catch (err) {
    res.status(503).json({ status: 'not ready' });
  }
});

module.exports = router;
