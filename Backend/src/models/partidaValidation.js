// Validación de la entidad "partida" ANTES de tocar la base de datos.
// Esta función no abre conexión ninguna -- por eso se puede probar
// con pruebas unitarias aisladas (sin Postgres, sin Keycloak).
function validarPartida(body) {
  const errores = [];

  if (!body || typeof body !== 'object') {
    return ['El cuerpo de la solicitud es inválido'];
  }

  if (!Number.isInteger(body.agente_id)) {
    errores.push('agente_id es obligatorio y debe ser un entero');
  }
  if (!Number.isInteger(body.mapa_id)) {
    errores.push('mapa_id es obligatorio y debe ser un entero');
  }
  if (!Number.isInteger(body.resultado_id)) {
    errores.push('resultado_id es obligatorio y debe ser un entero');
  }

  ['kills', 'deaths', 'assists'].forEach((campo) => {
    if (body[campo] !== undefined) {
      if (!Number.isInteger(body[campo]) || body[campo] < 0) {
        errores.push(`${campo} debe ser un entero mayor o igual a 0`);
      }
    }
  });

  return errores;
}

module.exports = { validarPartida };
