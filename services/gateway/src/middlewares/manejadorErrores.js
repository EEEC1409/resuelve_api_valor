/**
 * Manejador global de errores del Gateway.
 * Estructura las respuestas de error manteniendo compatibilidad con
 * los contratos OpenAPI ({ codigo, mensaje }) y los estándares de microservicios ({ error: { code, message } }).
 */
function manejadorErrores(err, req, res, next) {
  const status = err.status || (err.name === "UnauthorizedError" ? 401 : 500);
  const code = err.codigo || err.code || (err.name === "UnauthorizedError" ? "UNAUTHORIZED" : "INTERNAL_GATEWAY_ERROR");
  const message = err.mensaje || err.message || "Error interno del API Gateway";

  console.error(`[Gateway Error] ${code} (${status}):`, message);

  if (res.headersSent) {
    return next(err);
  }

  res.status(status).json({
    codigo: code,
    mensaje: message,
    error: {
      message,
      code
    }
  });
}

module.exports = {
  manejadorErrores
};
