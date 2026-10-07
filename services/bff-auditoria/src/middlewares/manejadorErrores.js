const { ErrorBffAuditoria, traducirErrorAuditoria } = require("../utils/errorBffAuditoria");

/**
 * Manejador central: ErrorRespuestaAuditoria { error: { code, message, reintentable } }
 * sin mensajes de axios ni el cuerpo del Servicio de Auditoria (Req 4.5). El
 * detalle tecnico de los 5xx queda solo en el log (mismo formato que Evaluacion Core).
 */
function manejadorErrores(err, req, res, next) {
  const error = err instanceof ErrorBffAuditoria ? err : traducirErrorAuditoria(err);
  if (error.status >= 500) {
    console.error("[BFF Auditoria Error]:", {
      codigo: error.code,
      status: error.status,
      metodo: req && req.method,
      ruta: req && req.route ? `${req.baseUrl || ""}${req.route.path}` : req && req.path,
      duracionMs: req && req.inicioMs ? Date.now() - req.inicioMs : undefined,
      message: err && err.message,
      codigoOrigen: err && err.code,
      url: err && err.config && `${err.config.baseURL || ""}${err.config.url || ""}`,
      statusRespuesta: err && err.response && err.response.status,
      stack: err && err.stack
    });
  }
  return res.status(error.status).json(error.toRespuesta());
}

module.exports = {
  manejadorErrores
};
