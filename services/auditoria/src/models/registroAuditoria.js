/**
 * Modelo de dominio del registro de auditoria de una evaluacion de credito.
 *
 * Conserva los datos recibidos (RegistroAuditoria de evaluacion-core) y
 * agrega los metadatos del servicio: idRegistro y creadoEn. Es inmutable.
 *
 * @param {Object} datos cuerpo recibido
 * @param {Date} [ahora]
 * @returns {Readonly<Object>}
 */
function crearRegistroAuditoria(datos, ahora = new Date()) {
  return Object.freeze({
    ...datos,
    idRegistro: "reg-" + ahora.getTime(),
    creadoEn: ahora.toISOString()
  });
}

module.exports = {
  crearRegistroAuditoria
};
