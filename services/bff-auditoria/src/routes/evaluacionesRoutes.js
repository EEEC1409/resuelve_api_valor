const express = require("express");

/**
 * Rutas de evaluaciones auditadas: solo cablean el controlador.
 * @param {{ listar: Function }} evaluacionesController
 */
function crearEvaluacionesRoutes(evaluacionesController) {
  const router = express.Router();

  router.get("/", evaluacionesController.listar);

  return router;
}

module.exports = {
  crearEvaluacionesRoutes
};
