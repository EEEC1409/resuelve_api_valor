require("dotenv").config();
const express = require("express");
const cors = require("cors");
const registrosRoutes = require("./routes/registros");

const app = express();
const PORT = process.env.PORT || 8095;

app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP", service: "auditoria", timestamp: new Date().toISOString() });
});

// Rutas de registros de auditoria
app.use("/registros", registrosRoutes);

// Manejador de errores
app.use((err, req, res, next) => {
  console.error("[Auditoria Error]:", err.message);
  res.status(err.status || 500).json({
    error: {
      message: err.message || "Error interno en Servicio de Auditoria",
      code: "AUDITORIA_ERROR"
    }
  });
});

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`[Auditoria] Servidor escuchando en el puerto ${PORT}`);
  });
}

module.exports = app;
