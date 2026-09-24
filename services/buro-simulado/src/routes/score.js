const express = require("express");
const router = express.Router();
const { getEscenario } = require("../scenarioState");

// Latencia configurable por entorno para testabilidad (Req. 3.2, 3.4).
// Por defecto 5000ms; si LATENCIA_MS es invalido (NaN) o negativo, se usa 5000.
const LATENCIA_MS = (() => {
  const valor = parseInt(process.env.LATENCIA_MS, 10);
  return Number.isNaN(valor) || valor < 0 ? 5000 : valor;
})();

/**
 * Genera un score deterministico y estado de mora basado en la identificacion (hash).
 */
function calcularScoreDeterministico(identificacion) {
  let hash = 0;
  for (let i = 0; i < identificacion.length; i++) {
    hash = (hash << 5) - hash + identificacion.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);
  // Rango tipico de score: [300, 850]
  const score = 300 + (absHash % 551);
  const moraExterna = (absHash % 10) === 0; // 10% probabilidad deterministica

  return {
    score,
    moraExterna,
    deudaExternaTotal: moraExterna ? (absHash % 5000) + 500 : 0
  };
}

/**
 * GET /score/:identificacion
 * Retorna score crediticio segun el escenario activo (NORMAL, LATENCIA_ALTA, CAIDO)
 */
router.get("/:identificacion", async (req, res, next) => {
  try {
    const { identificacion } = req.params;

    // Validar identificacion no vacia (rechaza cadenas vacias o solo espacios en blanco)
    if (identificacion.trim() === "") {
      return res.status(400).json({
        error: {
          message: "La identificacion es obligatoria y no puede estar vacia",
          code: "INVALID_IDENTIFICACION"
        }
      });
    }

    const escenario = getEscenario();

    // Manejo de escenario CAIDO
    if (escenario === "CAIDO") {
      return res.status(503).json({
        error: {
          message: "Servicio de buro de credito no disponible temporalmente (Escenario CAIDO)",
          code: "SERVICE_UNAVAILABLE"
        }
      });
    }

    // Manejo de escenario LATENCIA_ALTA (retraso intencional, LATENCIA_MS >= 5000 por defecto)
    if (escenario === "LATENCIA_ALTA") {
      await new Promise(resolve => setTimeout(resolve, LATENCIA_MS));
    }

    const { score, moraExterna, deudaExternaTotal } = calcularScoreDeterministico(identificacion);

    return res.status(200).json({
      identificacion,
      score,
      moraExterna,
      deudaExternaTotal,
      fechaConsulta: new Date().toISOString(),
      escenarioSimulado: escenario
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
// Exportacion adicional para pruebas directas de la funcion de calculo deterministico.
// No altera el uso del router: module.exports sigue siendo el router de Express.
module.exports.calcularScoreDeterministico = calcularScoreDeterministico;
