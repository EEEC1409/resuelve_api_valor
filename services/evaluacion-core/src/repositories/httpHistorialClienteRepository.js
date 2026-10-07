const { crearClienteHttp } = require("../utils/clienteHttp");
const HistorialCliente = require("../models/historialCliente");
const { asegurarHistorialClienteRepository } = require("./historialClienteRepository.interface");

/**
 * Implementacion HTTP de HistorialClienteRepository contra el Repositorio
 * Interno (GET /clientes/{identificacion}/historial, spec6).
 *
 * @param {{ baseURL?: string, timeoutMs?: number, httpClient?: Object }} opciones
 *   `httpClient` permite inyectar un cliente axios en pruebas.
 * @returns {import("./historialClienteRepository.interface").HistorialClienteRepository}
 */
function crearHttpHistorialClienteRepository({ baseURL, timeoutMs = 4000, httpClient } = {}) {
  const cliente = httpClient || crearClienteHttp({ nombre: "Repositorio Interno", baseURL, timeout: timeoutMs });

  async function buscarPorIdentificacion(identificacion) {
    try {
      const response = await cliente.get(`/clientes/${identificacion}/historial`);
      return new HistorialCliente(response.data);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return null; // Cliente nuevo sin historial
      }
      console.error("[HistorialRepository] fallo al llamar al Repositorio Interno:", {
        url: error && error.config && `${error.config.baseURL || ""}${error.config.url || ""}`,
        code: error && error.code,
        message: error && error.message,
        status: error && error.response && error.response.status
      });
      throw error;
    }
  }

  return asegurarHistorialClienteRepository({ buscarPorIdentificacion });
}

module.exports = {
  crearHttpHistorialClienteRepository
};
