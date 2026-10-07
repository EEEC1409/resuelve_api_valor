const { ErrorBuro } = require("../utils/errorBuro");

/**
 * Manejador central de errores (Req. 7.1): toda falla sale como
 * { error: { message, code } }. Los ErrorBuro conservan su estado y codigo; el
 * resto usa err.status (o 500) y el codigo BURO_SIMULATOR_ERROR.
 */
function manejadorErrores(err, req, res, next) {
  // Mismo formato de log que Evaluacion Core. Los ErrorBuro tambien se registran
  // (p. ej. 503 del escenario CAIDO) para poder distinguir una caida simulada de una real.
  console.error("[Buro Simulado Error]:", {
    message: err && err.message,
    code: err && err.code,
    status: err && err.status,
    metodo: req && req.method,
    ruta: req && req.route ? `${req.baseUrl || ""}${req.route.path}` : req && req.path,
    duracionMs: req && req.inicioMs ? Date.now() - req.inicioMs : undefined,
    stack: err && err.stack
  });

  if (err instanceof ErrorBuro) {
    return res.status(err.status).json({ error: { message: err.message, code: err.code } });
  }

  return res.status(err.status || 500).json({
    error: {
      message: err.message || "Error interno en Simulador de Buro",
      code: "BURO_SIMULATOR_ERROR"
    }
  });
}

module.exports = {
  manejadorErrores
};
