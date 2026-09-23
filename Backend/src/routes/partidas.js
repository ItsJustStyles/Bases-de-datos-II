const express = require('express');
const pool = require('../db/pool');
const requireAuth = require('../auth/jwtMiddleware');
const { validarPartida } = require('../models/partidaValidation');

const router = express.Router();

// SELECT compartido con JOINs para devolver nombres legibles
// (agente, mapa, resultado) en vez de solo los ids de las FK.
const SELECT_BASE = `
  SELECT p.id, p.agente_id, a.nombre AS agente,
         p.mapa_id, m.nombre AS mapa,
         p.resultado_id, r.nombre AS resultado,
         p.kills, p.deaths, p.assists, p.jugado_en
  FROM partidas p
  JOIN agentes a ON p.agente_id = a.id
  JOIN mapas m ON p.mapa_id = m.id
  JOIN resultados r ON p.resultado_id = r.id
`;

/**
 * @openapi
 * /partidas:
 *   post:
 *     summary: Crear una partida
 *     tags: [Partidas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [agente_id, mapa_id, resultado_id]
 *             properties:
 *               agente_id: { type: integer, example: 1 }
 *               mapa_id: { type: integer, example: 1 }
 *               resultado_id: { type: integer, example: 1 }
 *               kills: { type: integer, example: 18 }
 *               deaths: { type: integer, example: 9 }
 *               assists: { type: integer, example: 5 }
 *     responses:
 *       201: { description: Partida creada }
 *       400: { description: Cuerpo inválido o FK inexistente }
 *       401: { description: Token faltante o inválido }
 *       403: { description: Token válido sin el rol "jugador" }
 */
// Crear -- protegida, requiere rol "jugador"
router.post('/', requireAuth('jugador'), async (req, res) => {
  const errores = validarPartida(req.body);
  if (errores.length > 0) {
    return res.status(400).json({ errores });
  }

  const { agente_id, mapa_id, resultado_id, kills = 0, deaths = 0, assists = 0 } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO partidas (agente_id, mapa_id, resultado_id, kills, deaths, assists)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [agente_id, mapa_id, resultado_id, kills, deaths, assists]
    );
    res.status(201).json({ id: result.rows[0].id, agente_id, mapa_id, resultado_id, kills, deaths, assists });
  } catch (err) {
    // Ej: agente_id/mapa_id/resultado_id que no existen -> viola la FK.
    // Se traduce a 400 (error del cliente), nunca a un 500 ni un crash.
    res.status(400).json({ error: 'No se pudo crear la partida', detalle: err.message });
  }
});

/**
 * @openapi
 * /partidas:
 *   get:
 *     summary: Listar partidas, con filtro opcional
 *     tags: [Partidas]
 *     parameters:
 *       - in: query
 *         name: mapa
 *         schema: { type: string }
 *         example: Ascent
 *       - in: query
 *         name: resultado
 *         schema: { type: string }
 *         example: victoria
 *     responses:
 *       200: { description: Lista de partidas }
 */
// Listar -- pública, admite filtro por ?mapa= y/o ?resultado=
router.get('/', async (req, res) => {
  const { mapa, resultado } = req.query;
  const condiciones = [];
  const valores = [];

  if (mapa) {
    valores.push(mapa);
    condiciones.push(`m.nombre = $${valores.length}`);
  }
  if (resultado) {
    valores.push(resultado);
    condiciones.push(`r.nombre = $${valores.length}`);
  }

  const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';

  try {
    const result = await pool.query(`${SELECT_BASE} ${where} ORDER BY p.jugado_en DESC`, valores);
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al listar partidas' });
  }
});

/**
 * @openapi
 * /partidas/{id}:
 *   get:
 *     summary: Consultar una partida por id
 *     tags: [Partidas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Partida encontrada }
 *       404: { description: No existe }
 */
// Consultar por id -- pública
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(`${SELECT_BASE} WHERE p.id = $1`, [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Partida no encontrada' });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: 'id inválido' });
  }
});

/**
 * @openapi
 * /partidas/{id}:
 *   put:
 *     summary: Actualizar una partida
 *     tags: [Partidas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [agente_id, mapa_id, resultado_id]
 *             properties:
 *               agente_id: { type: integer, example: 1 }
 *               mapa_id: { type: integer, example: 1 }
 *               resultado_id: { type: integer, example: 1 }
 *               kills: { type: integer, example: 20 }
 *               deaths: { type: integer, example: 7 }
 *               assists: { type: integer, example: 4 }
 *     responses:
 *       200: { description: Partida actualizada }
 *       400: { description: Cuerpo inválido }
 *       401: { description: Token faltante o inválido }
 *       403: { description: Token válido sin el rol "coach" }
 *       404: { description: No existe }
 */
// Actualizar -- protegida, requiere rol "coach"
router.put('/:id', requireAuth('coach'), async (req, res) => {
  const errores = validarPartida(req.body);
  if (errores.length > 0) {
    return res.status(400).json({ errores });
  }

  const { agente_id, mapa_id, resultado_id, kills = 0, deaths = 0, assists = 0 } = req.body;

  try {
    const result = await pool.query(
      `UPDATE partidas
       SET agente_id = $1, mapa_id = $2, resultado_id = $3, kills = $4, deaths = $5, assists = $6
       WHERE id = $7
       RETURNING id`,
      [agente_id, mapa_id, resultado_id, kills, deaths, assists, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Partida no encontrada' });
    }
    res.status(200).json({ id: result.rows[0].id, agente_id, mapa_id, resultado_id, kills, deaths, assists });
  } catch (err) {
    res.status(400).json({ error: 'No se pudo actualizar', detalle: err.message });
  }
});

/**
 * @openapi
 * /partidas/{id}:
 *   delete:
 *     summary: Eliminar una partida
 *     tags: [Partidas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: Eliminada }
 *       401: { description: Token faltante o inválido }
 *       403: { description: Token válido sin el rol "coach" }
 *       404: { description: No existe }
 */
// Eliminar -- protegida, requiere rol "coach"
router.delete('/:id', requireAuth('coach'), async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM partidas WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Partida no encontrada' });
    }
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: 'id inválido' });
  }
});

module.exports = router;
