const express = require("express");
const cors = require("cors");
const { crearLimiteTasa } = require("./middlewares/limiteTasa");
const { crearAuthRoutes } = require("./routes/authRoutes");
const { crearAutenticacion } = require("./middlewares/autenticacion");
const { crearProxyRoutes } = require("./routes/proxyRoutes");
const { manejadorErrores } = require("./middlewares/manejadorErrores");

/**
 * Construye el Gateway a partir de su configuracion (inyeccion).
 *
 * Orden de la cadena:
 * cors -> limiteTasa -> /health -> /oauth/token -> autenticacion (JWT + Scopes) -> proxy -> manejadorErrores
 *
 * @param {{ nodeEnv?: string, bffPosUrl: string, bffAuditoriaUrl: string,
 *           rateLimitWindowMs: number, rateLimitMax: number, jwtSecret?: string }} config
 */
function crearApp(config) {
  const app = express();

  app.use(cors());
  app.use(crearLimiteTasa(config));

  // Health check publico
  app.get("/health", (req, res) => {
    res.status(200).json({ status: "UP", service: "gateway", timestamp: new Date().toISOString() });
  });

  // Endpoints OAuth2 (POST /oauth/token)
  app.use(crearAuthRoutes(config));

  // Autenticacion JWT y autorizacion de scopes
  app.use(crearAutenticacion(config));

  // Rutas de proxy hacia BFF POS y BFF Auditoria
  app.use(crearProxyRoutes(config));

  // Manejador central de errores
  app.use(manejadorErrores);

  return app;
}

module.exports = {
  crearApp
};
