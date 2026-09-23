const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const config = require('../config/env');

// Cliente que descarga y cachea las llaves públicas (JWKS) de Keycloak.
const client = jwksClient({ jwksUri: config.keycloak.jwksUri });

function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    callback(null, key.getPublicKey());
  });
}

// requireAuth(rol) devuelve un middleware que:
//   - 401 si no hay token o el token no es válido
//   - 403 si el token es válido pero no trae el rol pedido
//   - deja pasar (y adjunta req.user) si todo está bien
function requireAuth(requiredRole) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token requerido' });
    }
    const token = authHeader.split(' ')[1];

    jwt.verify(
      token,
      getKey,
      { issuer: config.keycloak.issuer, algorithms: ['RS256'] },
      (err, decoded) => {
        if (err) {
          console.error('JWT verify error:', err.name, err.message);
          return res.status(401).json({ error: 'Token inválido o expirado' });
        }

        const roles = decoded.realm_access?.roles || [];
        if (requiredRole && !roles.includes(requiredRole)) {
          return res.status(403).json({ error: 'Rol insuficiente' });
        }

        req.user = decoded;
        next();
      }
    );
  };
}

module.exports = requireAuth;
