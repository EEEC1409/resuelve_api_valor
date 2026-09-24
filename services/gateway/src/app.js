const express = require("express");
const cors = require("cors");
const { crearLimiteTasa } = require("./middlewares/limiteTasa");
const { crearAutenticacion } = require("./middlewares/autenticacion");
const { crearProxyRoutes } = require("./routes/proxyRoutes");
const { manejadorErrores } = require("./middlewares/manejadorErrores");

/**
 * Construye el Gateway a partir de su configuracion (inyeccion). El Gateway no
 * accede a datos: no tiene repositorios (steering structure.md).
 *
 * @param {{ nodeEnv?: string, bffPosUrl: string, bffAuditoriaUrl: string,
 *           rateLimitWindowMs: number, rateLimitMax: number }} config
 */
function crearApp(config) {
  const app = express();

  app.use(cors());
  app.use(crearLimiteTasa(config));

  // Health check publico
  app.get("/health", (req, res) => {
    res.status(200).json({ status: "UP", service: "gateway", timestamp: new Date().toISOString() });
  });

  app.use(crearAutenticacion(config));
  app.use(crearProxyRoutes(config));
  app.use(manejadorErrores);

  return app;
}

module.exports = {
  crearApp
};
