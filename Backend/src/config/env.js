require('dotenv').config();

module.exports = {
  port: process.env.APP_PORT || 8000,
  db: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
  keycloak: {
    issuer: process.env.KEYCLOAK_ISSUER,
    jwksUri: process.env.KEYCLOAK_JWKS_URI,
  },
};
