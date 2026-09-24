/**
 * Puerto (interfaz) del repositorio de registros de auditoria.
 *
 * Controladores dependen SOLO de esta interfaz. Implementacion actual: en
 * memoria (memoriaRegistroAuditoriaRepository). La implementacion MongoDB
 * (mongoRegistroAuditoriaRepository) se agregara en el spec del servicio.
 *
 * @typedef {Object} RegistroAuditoriaRepository
 * @property {(registro: Object) => Promise<void>} guardar
 *   Almacena un registro (inmutable) de auditoria.
 * @property {(criterios: { decision?: string, pagina: number, limite: number }) => Promise<{ total: number, datos: Object[] }>} buscar
 *   Devuelve la pagina solicitada y el total de registros que cumplen el filtro.
 */

const METODOS_REGISTRO_AUDITORIA_REPOSITORY = Object.freeze(["guardar", "buscar"]);

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
