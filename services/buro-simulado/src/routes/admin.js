const express = require("express");
const router = express.Router();

// El estado de escenario ya no vive aqui: se consume desde scenarioState,
// que centraliza el estado en memoria y su normalizacion/validacion. Asi se
// elimina el acoplamiento router -> router (score.js consume scenarioState
// directamente).
const { getEscenario, setEscenario } = require("../scenarioState");

/**
 * GET /admin/escenario
 * Retorna el escenario actualmente activo (Requisito 5.4)
 */
router.get("/escenario", (req, res) => {
  res.status(200).json({ escenario: getEscenario() });
});

/**
 * POST /admin/escenario
 * Alterna el escenario del buro simulado (NORMAL, LATENCIA_ALTA, CAIDO).
 * Delega la normalizacion/validacion en setEscenario. (Requisitos 5.1, 5.2, 5.3)
 */
router.post("/escenario", (req, res) => {
  const { escenario } = req.body;
  const resultado = setEscenario(escenario);

  if (!resultado.ok) {
    // Escenario ausente o invalido: se conserva el estado previo sin cambios.
    return res.status(400).json({
      error: {
        message: "Escenario invalido. Permitidos: NORMAL, LATENCIA_ALTA, CAIDO",
        code: "INVALID_SCENARIO"
      }
    });
  }

  console.log(`[Buro Simulado] Escenario cambiado a: ${resultado.escenario}`);

  return res.status(200).json({
    mensaje: "Escenario actualizado exitosamente",
    escenario: resultado.escenario
  });
});

module.exports = router;
