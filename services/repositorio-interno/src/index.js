require("dotenv").config();
const express = require("express");
const cors = require("cors");
const historialRoutes = require("./routes/historial");

const app = express();
const PORT = process.env.PORT || 8092;

app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP", service: "repositorio-interno", timestamp: new Date().toISOString() });
});

// Rutas de historial de cliente
app.use("/", historialRoutes);

// Manejador de errores
app.use((err, req, res, next) => {
  console.error("[Repositorio Interno Error]:", err.message);
  res.status(err.status || 500).json({
    error: {
      message: err.message || "Error interno en Repositorio Interno",
      code: "REPO_INTERNO_ERROR"
    }
  });
});

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`[Repositorio Interno] Servidor escuchando en el puerto ${PORT}`);
  });
}

module.exports = app;
