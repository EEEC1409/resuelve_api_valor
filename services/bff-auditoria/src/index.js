require("dotenv").config();
const express = require("express");
const cors = require("cors");
const auditoriaRoutes = require("./routes/auditoria");

const app = express();
const PORT = process.env.PORT || 8082;

app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP", service: "bff-auditoria", timestamp: new Date().toISOString() });
});

// Rutas de auditoria para paneles internos
app.use("/evaluaciones", auditoriaRoutes);

// Manejador de errores
app.use((err, req, res, next) => {
  console.error("[BFF Auditoria Error]:", err.message);
  res.status(err.status || 500).json({
    error: {
      message: err.message || "Error interno en BFF Auditoria",
      details: err.response ? err.response.data : null
    }
  });
});

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`[BFF Auditoria] Servidor escuchando en el puerto ${PORT}`);
  });
}

module.exports = app;
