const axios = require('axios');

// Pruebas de INTEGRACIÓN: se ejecutan contra la pila real que levanta
// docker compose (app + Postgres + Keycloak), no contra mocks.
// BASE_URL apunta al servicio "app" cuando corre dentro de la red de
// Compose, o a localhost cuando se corre desde la máquina del host.
const BASE_URL = process.env.BASE_URL || 'http://localhost:8000';

describe('Integración: /health y /ready', () => {
  test('GET /health responde 200 sin autenticación', async () => {
    const res = await axios.get(`${BASE_URL}/health`);
    expect(res.status).toBe(200);
  });

  test('GET /ready responde 200 cuando Postgres está disponible', async () => {
    const res = await axios.get(`${BASE_URL}/ready`);
    expect(res.status).toBe(200);
  });
});

describe('Integración: /partidas', () => {
  test('POST /partidas sin token responde 401', async () => {
    await expect(
      axios.post(`${BASE_URL}/partidas`, { agente_id: 1, mapa_id: 1, resultado_id: 1 })
    ).rejects.toMatchObject({ response: { status: 401 } });
  });

  test('GET /partidas responde 200 con una lista', async () => {
    const res = await axios.get(`${BASE_URL}/partidas`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
  });

  test('GET /partidas/{id} responde 404 si no existe', async () => {
    await expect(axios.get(`${BASE_URL}/partidas/999999`)).rejects.toMatchObject({
      response: { status: 404 },
    });
  });

  // NOTA: para probar el flujo completo de creación con token real,
  // hay que obtener un token de Keycloak vía password grant contra el
  // realm/client configurados, y usarlo en el header Authorization.
  // Se deja como TODO documentado -- requiere las credenciales de
  // prueba del realm que configure el grupo.
  test.todo('POST /partidas con token válido y rol "jugador" responde 201');
  test.todo('POST /partidas con token válido pero sin el rol responde 403');
});
