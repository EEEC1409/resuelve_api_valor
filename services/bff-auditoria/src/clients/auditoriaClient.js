const axios = require("axios");

const AUDITORIA_SERVICE_URL = process.env.AUDITORIA_SERVICE_URL || "http://auditoria:8095";

const auditoriaHttpClient = axios.create({
  baseURL: AUDITORIA_SERVICE_URL,
  timeout: 5000,
  headers: {
    "Content-Type": "application/json"
  }
});

/**
 * Obtiene registros de auditoria con filtros y paginacion
 * @param {Object} filtros
 */
async function obtenerRegistros(filtros = {}) {
  // Placeholder para llamada HTTP a /registros
  const response = await auditoriaHttpClient.get("/registros", { params: filtros });
  return response.data;
}

module.exports = {
  obtenerRegistros
};
