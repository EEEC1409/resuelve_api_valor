/**
 * Configuracion del Servicio de Auditoria. Lee process.env una sola vez.
 *
 * Nota: hoy los registros se guardan en memoria (memoriaRegistroAuditoriaRepository).
 * La implementacion sobre MongoDB (db/connection.js) queda para el spec de
 * este servicio; cuando exista se elegira en index.js sin tocar el resto.
 */
const auditoriaConfig = {
  port: process.env.PORT || 8095
};

module.exports = auditoriaConfig;
