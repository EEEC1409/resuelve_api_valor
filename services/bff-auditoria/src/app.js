const express = require("express");
const cors = require("cors");
const { asegurarRegistroAuditoriaRepository } = require("./repositories/registroAuditoriaRepository.interface");
const { crearEvaluacionesController } = require("./controllers/evaluacionesController");
const { crearEvaluacionesRoutes } = require("./routes/evaluacionesRoutes");
const { manejadorErrores } = require("./middlewares/manejadorErrores");

/**
 * Construye la aplicacion a partir de sus dependencias (inyeccion).
 * @param {{ registroRepository: Object }} deps
 */
function crearApp({ registroRepository }) {
  const app = express();
  const evaluacionesController = crearEvaluacionesController({
    registroRepository: asegurarRegistroAuditoriaRepository(registroRepository)
  });

  app.use(cors());
  app.use(express.json());

  app.get("/health", (req, res) => {
    res.status(200).json({ status: "UP", service: "bff-auditoria", timestamp: new Date().toISOString() });
  });

  app.use("/evaluaciones", crearEvaluacionesRoutes(evaluacionesController));
  app.use(manejadorErrores);

  return app;
}

module.exports = {
  crearApp
};
