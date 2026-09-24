const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const router = express.Router();

const BFF_POS_URL = process.env.BFF_POS_URL || "http://bff-punto-venta:8081";
const BFF_AUDITORIA_URL = process.env.BFF_AUDITORIA_URL || "http://bff-auditoria:8082";

// Proxy hacia BFF Punto de Venta (/evaluaciones-credito*)
router.use(
  "/evaluaciones-credito",
  createProxyMiddleware({
    target: BFF_POS_URL,
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
    target: BFF_AUDITORIA_URL,
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

module.exports = router;
