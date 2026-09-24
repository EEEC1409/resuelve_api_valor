/**
 * Configuracion del BFF Auditoria. Lee process.env una sola vez.
 */
const bffAuditoriaConfig = {
  port: process.env.PORT || 8082,
  auditoriaServiceUrl: process.env.AUDITORIA_SERVICE_URL || "http://auditoria:8095",
  auditoriaTimeoutMs: 5000
};

module.exports = bffAuditoriaConfig;
