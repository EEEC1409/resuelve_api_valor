const axios = require("axios");
const { asegurarRegistroAuditoriaRepository } = require("./registroAuditoriaRepository.interface");

/**
 * Implementacion HTTP de RegistroAuditoriaRepository: lee GET /registros del
 * Servicio de Auditoria (timeout explicito; los errores se propagan).
 *
 * @param {{ baseURL: string, timeoutMs: number, httpClient?: Object }} opciones
 *   `httpClient` permite inyectar un cliente axios en pruebas.
 * @returns {import("./registroAuditoriaRepository.interface").RegistroAuditoriaRepository}
 */
function crearHttpRegistroAuditoriaRepository({ baseURL, timeoutMs, httpClient }) {
  const cliente =
    httpClient ||
    axios.create({
      baseURL,
      timeout: timeoutMs,
      headers: { "Content-Type": "application/json" }
    });

  async function buscar(filtros) {
    const response = await cliente.get("/registros", { params: filtros });
    return response.data;
  }

  return asegurarRegistroAuditoriaRepository({ buscar });
}

module.exports = {
  crearHttpRegistroAuditoriaRepository
};
