// Middleware de autenticacion JWT - Placeholder
const { expressjwt: jwt } = require("express-jwt");

/**
 * Placeholder de validacion JWT.
 * En produccion valida tokens con JWKS o secreto compartido.
 */
function authMiddleware(req, res, next) {
  // Rutas publicas exentas de JWT
  const publicPaths = ["/health", "/docs"];
  if (publicPaths.includes(req.path)) {
    return next();
  }

  // Placeholder: si se provee JWT_SECRET se puede activar la validacion real
  // Por ahora permite el paso si viene Header Authorization o en modo dev
  const authHeader = req.headers.authorization;
  if (!authHeader && process.env.NODE_ENV === "production") {
    return res.status(401).json({
      error: {
        message: "Cabecera Authorization requerida (Bearer token)",
        code: "UNAUTHORIZED"
      }
    });
  }

  // Si viene header de simulacion de usuario, inyectarlo en req.user
  req.user = {
    sub: "user-placeholder",
    roles: ["tienda:pos", "auditor"]
  };

  next();
}

module.exports = authMiddleware;
