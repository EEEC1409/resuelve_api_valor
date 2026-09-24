const axios = require("axios");

const AUDITORIA_URL = process.env.AUDITORIA_SERVICE_URL || "http://auditoria:8095";
const AUDITORIA_TIMEOUT_MS = 3000;

const client = axios.create({
  baseURL: AUDITORIA_URL,
  timeout: AUDITORIA_TIMEOUT_MS
});

/**
 * Normaliza el score del buro a un entero valido o null.
 * RegistroAuditoria.scoreBuro es integer|null (contrato spec7).
 */
function normalizarScoreBuro(scoreBuro) {
  if (typeof scoreBuro !== "number" || !Number.isFinite(scoreBuro)) {
    return null;
  }
  return Math.trunc(scoreBuro);
}

/**
 * Construye el RegistroAuditoria segun el contrato spec7-auditoria.
 * Incluye scoreBuro (integer|null) y tiendaId (opcional), ademas de los
 * campos base: idEvaluacion, identificacion, montoSolicitado, plazoMeses,
 * decision, motivo, reglasAplicadas, consultaBuroRealizada y fecha.
 */
function construirRegistroAuditoria(datos = {}) {
  const registro = {
    idEvaluacion: datos.idEvaluacion,
    identificacion: datos.identificacion,
    montoSolicitado: datos.montoSolicitado,
    plazoMeses: datos.plazoMeses,
    decision: datos.decision,
    motivo: datos.motivo,
    reglasAplicadas: Array.isArray(datos.reglasAplicadas) ? datos.reglasAplicadas : [],
    consultaBuroRealizada: datos.consultaBuroRealizada === true,
    fecha: datos.fecha || new Date().toISOString(),
    scoreBuro: normalizarScoreBuro(datos.scoreBuro)
  };

  // tiendaId es opcional en el contrato; solo se incluye si viene informado.
  if (datos.tiendaId !== undefined && datos.tiendaId !== null) {
    registro.tiendaId = datos.tiendaId;
  }

  return registro;
}

/**
 * Publica el RegistroAuditoria de forma no bloqueante (fire-and-forget).
 * El envio tiene un timeout de 3000 ms; cualquier fallo o timeout se registra
 * en log y NUNCA altera ni bloquea la DecisionCore devuelta al solicitante
 * (RF-08 crit. 3). No se propaga ninguna excepcion al llamador.
 */
function publicarEvento(datos) {
  const registro = construirRegistroAuditoria(datos);

  // Fire-and-forget: no se espera (await) la promesa; el fallo solo se loguea.
  client
    .post("/registros", registro)
    .catch((err) => {
      console.warn(
        "[EvaluacionCore] Error publicando auditoria (no bloqueante):",
        err && err.message ? err.message : err
      );
    });
}

module.exports = {
  publicarEvento,
  construirRegistroAuditoria
};
