/**
 * Mapea la decision emitida por evaluacion-core al formato esperado por el frontend POS (Spec 0 / Spec 2).
 * @param {Object} coreDecision
 * @returns {Object} resultado POS
 */
function mapDecisionToResultadoPos(coreDecision = {}) {
  return {
    idEvaluacion: coreDecision.idEvaluacion || "00000000-0000-0000-0000-000000000000",
    decision: coreDecision.decision || "PENDIENTE",
    motivo: coreDecision.motivo || "En proceso de evaluacion",
    consultaBuroRealizada: Boolean(coreDecision.consultaBuroRealizada),
    fecha: coreDecision.fecha || new Date().toISOString()
  };
}

module.exports = {
  mapDecisionToResultadoPos
};
