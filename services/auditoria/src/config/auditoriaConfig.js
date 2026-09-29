/**
 * Configuracion del Servicio de Auditoria. Lee process.env una sola vez.
 *
 * Los parametros de conexion a MongoDB se leen desde MONGO_URI y DB_NAME.
 */
const auditoriaConfig = {
  port: process.env.PORT || 8095
};

module.exports = auditoriaConfig;
