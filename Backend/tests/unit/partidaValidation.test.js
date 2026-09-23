const { validarPartida } = require('../../src/models/partidaValidation');

// Pruebas UNITARIAS: no abren conexión a Postgres ni a Keycloak,
// solo ejercitan la lógica de validación de forma aislada.
describe('validarPartida', () => {
  test('rechaza si falta agente_id', () => {
    const errores = validarPartida({ mapa_id: 1, resultado_id: 1 });
    expect(errores).toContain('agente_id es obligatorio y debe ser un entero');
  });

  test('rechaza si falta mapa_id', () => {
    const errores = validarPartida({ agente_id: 1, resultado_id: 1 });
    expect(errores).toContain('mapa_id es obligatorio y debe ser un entero');
  });

  test('rechaza kills negativos', () => {
    const errores = validarPartida({ agente_id: 1, mapa_id: 1, resultado_id: 1, kills: -5 });
    expect(errores.some((e) => e.includes('kills'))).toBe(true);
  });

  test('rechaza valores no enteros', () => {
    const errores = validarPartida({ agente_id: 1.5, mapa_id: 1, resultado_id: 1 });
    expect(errores.length).toBeGreaterThan(0);
  });

  test('acepta un cuerpo válido', () => {
    const errores = validarPartida({
      agente_id: 1,
      mapa_id: 1,
      resultado_id: 1,
      kills: 10,
      deaths: 5,
      assists: 3,
    });
    expect(errores).toHaveLength(0);
  });
});
