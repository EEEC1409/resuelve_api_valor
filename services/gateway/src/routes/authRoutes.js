const express = require("express");
const jwt = require("jsonwebtoken");

/**
 * Rutas de autenticacion OAuth2 (Client Credentials).
 * Aplica express.json() de manera localizada para no interferir con
 * el streaming de http-proxy-middleware en las demas rutas.
 *
 * @param {{ jwtSecret: string }} config
 */
function crearAuthRoutes(config) {
  const router = express.Router();
  const jwtSecret = config.jwtSecret || "supersecretkey_resuelve_jwt";

  router.post(
    "/oauth/token",
    express.json(),
    express.urlencoded({ extended: true }),
    (req, res) => {
      const grantType = req.body?.grant_type || req.query?.grant_type;

      if (!grantType || grantType !== "client_credentials") {
        return res.status(400).json({
          codigo: "GRANT_TYPE_INVALIDO",
          mensaje: "El parámetro grant_type debe ser client_credentials",
          error: {
            code: "GRANT_TYPE_INVALIDO",
            message: "El parámetro grant_type debe ser client_credentials"
          }
        });
      }

      const clientId = req.body?.client_id || "frontend-tiendas";
      const scopes = [
        "evaluaciones:escribir",
        "evaluaciones:leer",
        "auditoria:leer"
      ];

      const payload = {
        client_id: clientId,
        sub: clientId,
        scopes,
        roles: ["tienda:pos", "auditor"],
        iss: "https://auth.resuelve.com"
      };

      const access_token = jwt.sign(payload, jwtSecret, { expiresIn: "1h" });

      return res.status(200).json({
        access_token,
        token_type: "Bearer",
        expires_in: 3600,
        scope: scopes.join(" ")
      });
    }
  );

  return router;
}

module.exports = {
  crearAuthRoutes
};
