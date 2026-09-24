const rateLimit = require("express-rate-limit");

/**
 * Middleware de limitacion de tasa (express-rate-limit).
 * @param {{ rateLimitWindowMs: number, rateLimitMax: number }} opciones
 */
function crearLimiteTasa({ rateLimitWindowMs, rateLimitMax }) {
  return rateLimit({
    windowMs: rateLimitWindowMs,
    max: rateLimitMax,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: {
        message: "Demasiadas peticiones desde esta IP, por favor intente mas tarde.",
        code: "RATE_LIMIT_EXCEEDED"
      }
    }
  });
}

module.exports = {
  crearLimiteTasa
};
