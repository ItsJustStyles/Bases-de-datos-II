const express = require('express');
const router = express.Router();

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Liveness -- el proceso está vivo (no toca la base de datos)
 *     tags: [Sistema]
 *     responses:
 *       200:
 *         description: OK
 */
// Liveness: el proceso está vivo. NO toca la base de datos.
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

module.exports = router;
