/**
 * Middleware de autenticacion JWT - placeholder.
 *
 * En produccion debe validar el token con JWKS (express-jwt + jwks-rsa,
 * steering tech.md). Hoy: rutas publicas exentas; en `production` exige la
 * cabecera Authorization; en cualquier caso inyecta un usuario simulado.
 *
 * @param {{ nodeEnv?: string }} opciones
 */
function crearAutenticacion({ nodeEnv }) {
  const RUTAS_PUBLICAS = ["/health", "/docs"];

  return function autenticacion(req, res, next) {
    if (RUTAS_PUBLICAS.includes(req.path)) {
      return next();
    }

    if (!req.headers.authorization && nodeEnv === "production") {
      return res.status(401).json({
        error: {
          message: "Cabecera Authorization requerida (Bearer token)",
          code: "UNAUTHORIZED"
        }
      });
    }

    req.user = {
      sub: "user-placeholder",
      roles: ["tienda:pos", "auditor"]
    };

    return next();
  };
}

module.exports = {
  crearAutenticacion
};
