const express = require("express");
const cors = require("cors");
const { asegurarRegistroAuditoriaRepository } = require("./repositories/registroAuditoriaRepository.interface");
const { crearRegistrosController } = require("./controllers/registrosController");
const { crearRegistrosRoutes } = require("./routes/registrosRoutes");
const { manejadorErrores } = require("./middlewares/manejadorErrores");

/**
 * Construye la aplicacion a partir de sus dependencias (inyeccion).
 * @param {{ registroRepository: Object, ahora?: () => Date }} deps
 */
function crearApp({ registroRepository, ahora }) {
  const app = express();
  const registrosController = crearRegistrosController({
    registroRepository: asegurarRegistroAuditoriaRepository(registroRepository),
    ahora
  });

  app.use(cors());
  app.use(express.json());

  app.get("/health", (req, res) => {
    res.status(200).json({ status: "UP", service: "auditoria", timestamp: new Date().toISOString() });
  });

  app.use("/registros", crearRegistrosRoutes(registrosController));
  app.use(manejadorErrores);

  return app;
}

module.exports = {
  crearApp
};
