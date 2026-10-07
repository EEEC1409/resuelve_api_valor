/**
 * Manejador central de errores: ErrorRespuesta { error: { message, code } }.
 * Honra err.status / err.code (p. ej. 4xx del buro, ErrorCore de validacion).
 */
function manejadorErrores(err, req, res, next) {
  if (err && err.type === "entity.parse.failed") {
    return res.status(400).json({
      error: { message: "El cuerpo de la solicitud debe ser un objeto JSON", code: "INVALID_REQUEST" }
    });
  }

  console.error("[Evaluacion Core Error]:", {
    message: err && err.message,
    code: err && err.code,
    status: err && err.status,
    url: err && err.config && `${err.config.baseURL || ""}${err.config.url || ""}`,
    statusRespuesta: err && err.response && err.response.status,
    stack: err && err.stack
  });
  return res.status(err.status || 500).json({
    error: {
      message: err.message || "Error interno en Evaluacion Core",
      code: err.code || "INTERNAL_CORE_ERROR"
    }
  });
}

module.exports = {
  manejadorErrores
};
