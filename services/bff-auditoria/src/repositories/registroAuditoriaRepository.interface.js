/**
 * Puerto (interfaz) de lectura de registros de auditoria para el panel interno.
 *
 * El controlador depende SOLO de esta interfaz. La implementacion actual lee
 * del Servicio de Auditoria por HTTP (httpRegistroAuditoriaRepository).
 *
 * @typedef {Object} RegistroAuditoriaRepository
 * @property {(filtros: { fechaDesde?: string, fechaHasta?: string, decision?: string, page: number, limit: number }) => Promise<Object>} buscar
 *   Devuelve la pagina de registros tal como la entrega el Servicio de Auditoria.
 */

const METODOS_REGISTRO_AUDITORIA_REPOSITORY = Object.freeze(["buscar"]);

/**
 * Verifica en tiempo de ejecucion que `implementacion` cumpla la interfaz.
 * @param {*} implementacion
 * @returns {RegistroAuditoriaRepository}
 * @throws {TypeError} si falta algun metodo
 */
function asegurarRegistroAuditoriaRepository(implementacion) {
  for (const metodo of METODOS_REGISTRO_AUDITORIA_REPOSITORY) {
    if (!implementacion || typeof implementacion[metodo] !== "function") {
      throw new TypeError(`RegistroAuditoriaRepository invalido: falta el metodo "${metodo}"`);
    }
  }
  return implementacion;
}

module.exports = {
  METODOS_REGISTRO_AUDITORIA_REPOSITORY,
  asegurarRegistroAuditoriaRepository
};
