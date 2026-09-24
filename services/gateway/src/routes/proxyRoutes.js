const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

/**
 * Rutas de proxy hacia los BFFs (sin logica de negocio, steering tech.md).
 *
 * Configuracion conservada tal cual estaba. Ver pruebas de caracterizacion en
 * proxyRoutes.test.js: con http-proxy-middleware 3.x la opcion `onError` no se
 * usa (la API v3 es `on: { error }`), y el prefijo montado por router.use()
 * no llega al destino. Corregirlo corresponde al spec del Gateway.
 *
 * @param {{ bffPosUrl: string, bffAuditoriaUrl: string }} destinos
 */
function crearProxyRoutes({ bffPosUrl, bffAuditoriaUrl }) {
  const router = express.Router();

  // Proxy hacia BFF Punto de Venta (/evaluaciones-credito*)
  router.use(
    "/evaluaciones-credito",
    createProxyMiddleware({
      target: bffPosUrl,
      changeOrigin: true,
      pathRewrite: {
        "^/evaluaciones-credito": "/evaluaciones-credito"
      },
      onError: (err, req, res) => {
        console.error("[Proxy -> BFF POS Error]:", err.message);
        res.status(502).json({
          error: {
            message: "Error de comunicacion con BFF Punto de Venta",
            details: err.message
          }
        });
      }
    })
  );

  // Proxy hacia BFF Auditoria (/auditoria/*)
  router.use(
    "/auditoria",
    createProxyMiddleware({
      target: bffAuditoriaUrl,
      changeOrigin: true,
      pathRewrite: {
        "^/auditoria": ""
      },
      onError: (err, req, res) => {
        console.error("[Proxy -> BFF Auditoria Error]:", err.message);
        res.status(502).json({
          error: {
            message: "Error de comunicacion con BFF Auditoria",
            details: err.message
          }
        });
      }
    })
  );

  return router;
}

module.exports = {
  crearProxyRoutes
};
