require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authMiddleware = require("./middlewares/auth");
const rateLimitMiddleware = require("./middlewares/rateLimit");
const proxyRoutes = require("./routes/proxy");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(rateLimitMiddleware);

// Health check publico
app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP", service: "gateway", timestamp: new Date().toISOString() });
});

// Middleware de autenticacion JWT (placeholder)
app.use(authMiddleware);

// Rutas de proxy hacia BFFs
app.use(proxyRoutes);

// Manejador global de errores
app.use((err, req, res, next) => {
  console.error("[Gateway Error]:", err.message);
  res.status(err.status || 500).json({
    error: {
      message: err.message || "Error interno del API Gateway",
      code: err.code || "INTERNAL_GATEWAY_ERROR"
    }
  });
});

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`[Gateway] Servidor escuchando en el puerto ${PORT}`);
  });
}

module.exports = app;
