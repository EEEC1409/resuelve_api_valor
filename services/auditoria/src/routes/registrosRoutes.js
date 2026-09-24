const express = require("express");

/**
 * Rutas de registros de auditoria: solo cablean el controlador.
 * @param {{ crear: Function, listar: Function }} registrosController
 */
function crearRegistrosRoutes(registrosController) {
  const router = express.Router();

  router.post("/", registrosController.crear);
  router.get("/", registrosController.listar);

  return router;
}

module.exports = {
  crearRegistrosRoutes
};
