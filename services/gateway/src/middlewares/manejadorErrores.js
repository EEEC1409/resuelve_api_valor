/**
 * Manejador global de errores del Gateway.
 */
function manejadorErrores(err, req, res, next) {
  console.error("[Gateway Error]:", err.message);
  res.status(err.status || 500).json({
    error: {
      message: err.message || "Error interno del API Gateway",
      code: err.code || "INTERNAL_GATEWAY_ERROR"
    }
  });
}

module.exports = {
  manejadorErrores
};
