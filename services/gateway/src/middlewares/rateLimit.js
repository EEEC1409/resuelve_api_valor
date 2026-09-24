const rateLimit = require("express-rate-limit");

const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || "60000", 10);
const max = parseInt(process.env.RATE_LIMIT_MAX || "100", 10);

const rateLimiter = rateLimit({
  windowMs,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      message: "Demasiadas peticiones desde esta IP, por favor intente mas tarde.",
      code: "RATE_LIMIT_EXCEEDED"
    }
  }
});

module.exports = rateLimiter;
