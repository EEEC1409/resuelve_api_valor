/**
 * Configuracion del API Gateway. Lee process.env una sola vez.
 */
const gatewayConfig = {
  port: process.env.PORT || 8080,
  nodeEnv: process.env.NODE_ENV,
  bffPosUrl: process.env.BFF_POS_URL || "http://bff-punto-venta:8081",
  bffAuditoriaUrl: process.env.BFF_AUDITORIA_URL || "http://bff-auditoria:8082",
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "60000", 10),
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || "100", 10)
};

module.exports = gatewayConfig;
