const express = require("express");
const router = express.Router();
const evaluarCreditoUseCase = require("../application/evaluarCreditoUseCase");

/**
 * POST /evaluar
 * Ejecuta evaluacion de credito con motor de reglas y orquestacion.
 */
router.post("/evaluar", async (req, res, next) => {
  try {
    const solicitud = req.body;
    const resultado = await evaluarCreditoUseCase.ejecutar(solicitud);
    return res.status(200).json(resultado);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /evaluaciones/:id
 * Consulta evaluacion por su ID.
 */
router.get("/evaluaciones/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const resultado = await evaluarCreditoUseCase.obtenerPorId(id);
    return res.status(200).json(resultado);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
