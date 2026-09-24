require("dotenv").config();
const express = require("express");
const cors = require("cors");
const evaluarRoutes = require("./routes/evaluar");

const app = express();
const PORT = process.env.PORT || 8090;

app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP", service: "evaluacion-core", timestamp: new Date().toISOString() });
});

// Rutas de evaluacion
app.use("/", evaluarRoutes);

// Manejador de errores
app.use((err, req, res, next) => {
  console.error("[Evaluacion Core Error]:", err.message);
  res.status(err.status || 500).json({
    error: {
      message: err.message || "Error interno en Evaluacion Core",
      code: err.code || "INTERNAL_CORE_ERROR"
    }
  });
});

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`[Evaluacion Core] Servidor escuchando en el puerto ${PORT}`);
  });
}

module.exports = app;
