const axios = require("axios");
const EvaluacionAuditada = require("../models/evaluacionAuditada");
const { asegurarRegistroAuditoriaRepository } = require("./registroAuditoriaRepository.interface");
const { errorAuditoria } = require("../utils/errorBffAuditoria");

/**
 * Implementacion HTTP de RegistroAuditoriaRepository contra el Servicio de
 * Auditoria (Spec 7 v1.1.0), con timeout explicito (steering tech.md).
 *
 * @param {{ baseURL?: string, timeoutMs?: number, httpClient?: Object }} opciones
 *   `httpClient` permite inyectar un cliente axios en pruebas.
 * @returns {import("./registroAuditoriaRepository.interface").RegistroAuditoriaRepository}
 */
function crearHttpRegistroAuditoriaRepository({ baseURL, timeoutMs = 3000, httpClient } = {}) {
  const cliente =
    httpClient ||
    axios.create({
      baseURL,
      timeout: timeoutMs,
      headers: { "Content-Type": "application/json" }
    });

  function registrarFallo(error) {
    console.error("[AuditoriaRepository] fallo al llamar al Servicio de Auditoria:", {
      url: error && error.config && `${error.config.baseURL || ""}${error.config.url || ""}`,
      code: error && error.code,
      message: error && error.message,
      status: error && error.response && error.response.status
    });
  }

  async function buscar(listado) {
    let response;
    try {
      response = await cliente.get("/registros", { params: listado });
    } catch (error) {
      registrarFallo(error);
      throw error;
    }
    const pagina = response.data;
    if (!pagina || typeof pagina.total !== "number" || !Array.isArray(pagina.items)) {
      console.error("[AuditoriaRepository] respuesta fuera de Spec 7 en GET /registros");
      throw errorAuditoria(); // respuesta fuera de Spec 7
    }
    return {
      total: pagina.total,
      page: listado.page,
      size: listado.size,
      items: pagina.items.map(EvaluacionAuditada.desdeRegistro)
    };
  }

  async function buscarPorId(idEvaluacion) {
    try {
      const response = await cliente.get(`/registros/${encodeURIComponent(idEvaluacion)}`);
      return EvaluacionAuditada.desdeRegistro(response.data);
    } catch (error) {
      if (error && error.response && error.response.status === 404) {
        return null;
      }
      registrarFallo(error);
      throw error;
    }
  }

  return asegurarRegistroAuditoriaRepository({ buscar, buscarPorId });
}

module.exports = {
  crearHttpRegistroAuditoriaRepository
};
