const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

/**
 * Rutas de proxy hacia los BFFs (sin logica de negocio, steering tech.md).
 *
 * Las rutas se filtran sin montar el proxy en un prefijo para conservar la
 * URL completa en http-proxy-middleware 3.x.
 *
 * @param {{ bffPosUrl: string, bffAuditoriaUrl: string }} destinos
 */
function crearProxyRoutes({ bffPosUrl, bffAuditoriaUrl }) {
  const router = express.Router();

  // Proxy hacia BFF Punto de Venta; /v1 es el prefijo publico del API.
  router.use(createProxyMiddleware({
    target: bffPosUrl,
    pathFilter: ["/v1/evaluaciones-credito", "/evaluaciones-credito"],
    changeOrigin: true,
    pathRewrite: {
      "^/v1/evaluaciones-credito": "/evaluaciones-credito"
    },
    on: {
      error: (err, req, res) => {
        console.error("[Proxy -> BFF POS Error]:", err.message);
        res.status(502).json({
          error: {
            message: "Error de comunicacion con BFF Punto de Venta",
            details: err.message
          }
        });
      }
    }
  }));

  // Proxy hacia BFF Auditoria (/auditoria/*), con y sin version publica.
  router.use(createProxyMiddleware({
    target: bffAuditoriaUrl,
    pathFilter: ["/v1/auditoria", "/auditoria"],
    changeOrigin: true,
    pathRewrite: {
      "^/v1/auditoria": "",
      "^/auditoria": ""
    },
    on: {
      error: (err, req, res) => {
        console.error("[Proxy -> BFF Auditoria Error]:", err.message);
        res.status(502).json({
          error: {
            message: "Error de comunicacion con BFF Auditoria",
            details: err.message
          }
        });
      }
    }
  }));

  return router;
}

module.exports = {
  crearProxyRoutes
};
