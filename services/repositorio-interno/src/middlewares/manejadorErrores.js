const { ErrorRepositorio, clasificarErrorBaseDatos } = require("../utils/errorRepositorio");

/**
 * Manejador central de errores: responde ErrorRespuesta { error: { code, message } }
 * sin detalles del driver, SQL, tablas ni hosts (Req 4 crit. 4). El detalle
 * tecnico de los 5xx queda solo en el log (mismo formato que Evaluacion Core),
 * sin la identificacion del cliente (dato personal) ni credenciales.
 */
function manejadorErrores(err, req, res, next) {
  const error = err instanceof ErrorRepositorio ? err : clasificarErrorBaseDatos(err);
  if (error.status >= 500) {
    console.error("[Repositorio Interno Error]:", {
      codigo: error.code,
      status: error.status,
      metodo: req && req.method,
      ruta: req && req.route ? `${req.baseUrl || ""}${req.route.path}` : req && req.path,
      duracionMs: req && req.inicioMs ? Date.now() - req.inicioMs : undefined,
      message: err && err.message,
      codigoOrigen: err && err.code,
      errno: err && err.errno,
      syscall: err && err.syscall,
      hostDestino: err && err.address,
      puertoDestino: err && err.port,
      stack: err && err.stack
    });
  }
  res.status(error.status).json(error.toRespuesta());
}

module.exports = {
  manejadorErrores
};
