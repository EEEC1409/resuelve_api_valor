/**
 * Manejador central de errores: { error: { message, code: "AUDITORIA_ERROR" } }.
 */
function manejadorErrores(err, req, res, next) {
  console.error("[Auditoria Error]:", err.message);
  res.status(err.status || 500).json({
    error: {
      message: err.message || "Error interno en Servicio de Auditoria",
      code: "AUDITORIA_ERROR"
    }
  });
}

module.exports = {
  manejadorErrores
};
