require("dotenv").config();
const express = require("express");
const cors = require("cors");
const evaluacionesRoutes = require("./routes/evaluaciones");

const app = express();
const PORT = process.env.PORT || 8081;

app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP", service: "bff-punto-venta", timestamp: new Date().toISOString() });
});

// Rutas de evaluaciones
app.use("/evaluaciones-credito", evaluacionesRoutes);

// Manejador de errores
app.use((err, req, res, next) => {
  console.error("[BFF POS Error]:", err.message);
  res.status(err.status || 500).json({
    error: {
      message: err.message || "Error interno en BFF Punto de Venta",
      details: err.response ? err.response.data : null
    }
  });
});

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`[BFF Punto de Venta] Servidor escuchando en el puerto ${PORT}`);
  });
}

module.exports = app;
