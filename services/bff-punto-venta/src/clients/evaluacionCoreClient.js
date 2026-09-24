const axios = require("axios");

const EVALUACION_CORE_URL = process.env.EVALUACION_CORE_URL || "http://evaluacion-core:8090";

const coreHttpClient = axios.create({
  baseURL: EVALUACION_CORE_URL,
  timeout: 5000,
  headers: {
    "Content-Type": "application/json"
  }
});

/**
 * Envia solicitud de credito a evaluacion-core
 * @param {Object} solicitud
 */
async function solicitarEvaluacion(solicitud) {
  // Placeholder para llamada HTTP a /evaluar
  const response = await coreHttpClient.post("/evaluar", solicitud);
  return response.data;
}

/**
 * Obtiene evaluacion por ID de evaluacion-core
 * @param {string} id
 */
async function obtenerEvaluacionPorId(id) {
  // Placeholder para llamada HTTP a /evaluaciones/:id
  const response = await coreHttpClient.get(`/evaluaciones/${id}`);
  return response.data;
}

module.exports = {
  solicitarEvaluacion,
  obtenerEvaluacionPorId
};
