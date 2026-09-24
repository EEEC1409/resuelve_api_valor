const express = require("express");
const router = express.Router();
const evaluacionCoreClient = require("../clients/evaluacionCoreClient");
const { mapDecisionToResultadoPos } = require("../mappers/decisionToResultadoPos");

/**
 * POST /evaluaciones-credito
 * Recibe la solicitud del POS, orquesta con Evaluacion Core y retorna respuesta adaptada para tienda.
 */
router.post("/", async (req, res, next) => {
  try {
    const solicitud = req.body;
    // Placeholder: llamada a evaluacion-core
    const decisionCore = await evaluacionCoreClient.solicitarEvaluacion(solicitud);
    const resultadoPos = mapDecisionToResultadoPos(decisionCore);
    return res.status(200).json(resultadoPos);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /evaluaciones-credito/:id
 * Consulta una evaluacion previa por su ID.
 */
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    // Placeholder: consultar evaluacion por ID
    const evaluacion = await evaluacionCoreClient.obtenerEvaluacionPorId(id);
    return res.status(200).json(evaluacion);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
