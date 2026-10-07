const { ErrorAuditoria, registroInvalido, clasificarErrorAlmacen } = require("../utils/errorAuditoria");

/**
 * Manejador central de errores: ErrorRespuesta { error: { code, message } }
 * sin mensajes del driver, cadenas de conexion ni hosts (Req 5.6). El detalle
 * tecnico de los 5xx queda solo en el log.
 */
function manejadorErrores(err, req, res, next) {
  // JSON mal formado en el cuerpo (express.json).
  if (err && err.type === "entity.parse.failed") {
    console.warn("[Auditoria Rechazo]:", { codigo: "REGISTRO_INVALIDO", metodo: req && req.method, ruta: req && req.path, detalle: err.message });
    const error = registroInvalido("El cuerpo debe ser un objeto JSON");
    return res.status(error.status).json(error.toRespuesta());
  }

  const error = err instanceof ErrorAuditoria ? err : clasificarErrorAlmacen(err);
  if (error.status >= 500) {
    console.error("[Auditoria Error]:", {
      codigo: error.code,
      status: error.status,
      metodo: req && req.method,
      ruta: req && req.route ? `${req.baseUrl || ""}${req.route.path}` : req && req.path,
      duracionMs: req && req.inicioMs ? Date.now() - req.inicioMs : undefined,
      message: err && err.message,
      nombreOrigen: err && err.name,
      codigoOrigen: err && err.code,
      codeName: err && err.codeName,
      syscall: err && err.syscall,
      stack: err && err.stack
    });
  }
  if (error.status < 500) {
    // 4xx: la peticion llego pero fue rechazada; el motivo (sin datos del cuerpo) queda en el log.
    console.warn("[Auditoria Rechazo]:", {
      codigo: error.code,
      status: error.status,
      metodo: req && req.method,
      ruta: req && req.route ? `${req.baseUrl || ""}${req.route.path}` : req && req.path,
      detalle: error.message,
      idEvaluacion: req && req.body && req.body.idEvaluacion
    });
  }
  return res.status(error.status).json(error.toRespuesta());
}

module.exports = {
  manejadorErrores
};
