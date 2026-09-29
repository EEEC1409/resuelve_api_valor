const jwt = require("jsonwebtoken");

/**
 * Middleware de autenticacion OAuth2 JWT y control de scopes.
 *
 * - Rutas publicas exentas: /health, /docs, /oauth/token.
 * - En 'production': exige cabecera Authorization (Bearer <token>).
 * - Si se envia Authorization en cualquier entorno: valida firma con jwtSecret y expiracion.
 * - Valida scopes requeridos segun la ruta y metodo:
 *     POST /evaluaciones-credito -> evaluaciones:escribir
 *     GET /evaluaciones-credito  -> evaluaciones:leer
 *     /auditoria                 -> auditoria:leer
 * - Si no se envia token en entornos de no-produccion (dev/test):
 *   inyecta usuario por defecto con todos los scopes para facilitar pruebas directas.
 *
 * @param {{ nodeEnv?: string, jwtSecret?: string }} opciones
 */
function crearAutenticacion({ nodeEnv, jwtSecret = "supersecretkey_resuelve_jwt" } = {}) {
  const RUTAS_PUBLICAS = ["/health", "/docs", "/oauth/token"];

  return function autenticacion(req, res, next) {
    if (RUTAS_PUBLICAS.some(ruta => req.path === ruta || req.path.startsWith(ruta + "/"))) {
      return next();
    }

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      if (nodeEnv === "production") {
        return res.status(401).json({
          codigo: "UNAUTHORIZED",
          mensaje: "Cabecera Authorization requerida (Bearer token)",
          error: {
            code: "UNAUTHORIZED",
            message: "Cabecera Authorization requerida (Bearer token)"
          }
        });
      }

      // En entornos de desarrollo/test sin cabecera Authorization
      req.user = {
        sub: "user-placeholder",
        roles: ["tienda:pos", "auditor"],
        scopes: ["evaluaciones:escribir", "evaluaciones:leer", "auditoria:leer"]
      };
      return next();
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        codigo: "TOKEN_INVALIDO",
        mensaje: "Formato de cabecera Authorization inválido (Bearer token requerido)",
        error: {
          code: "UNAUTHORIZED",
          message: "Formato de cabecera Authorization inválido (Bearer token requerido)"
        }
      });
    }

    const token = authHeader.slice(7).trim();

    try {
      const decoded = jwt.verify(token, jwtSecret);
      req.user = decoded;

      // Validacion de scopes
      let requiredScope = null;
      const rutaEvaluaciones = req.path.replace(/^\/v1(?=\/)/, "");
      const rutaAuditoria = req.path.replace(/^\/v1(?=\/)/, "");

      if (rutaEvaluaciones.startsWith("/evaluaciones-credito")) {
        if (req.method === "POST") {
          requiredScope = "evaluaciones:escribir";
        } else if (req.method === "GET") {
          requiredScope = "evaluaciones:leer";
        }
      } else if (rutaAuditoria.startsWith("/auditoria")) {
        requiredScope = "auditoria:leer";
      }

      if (requiredScope) {
        const scopes = Array.isArray(decoded.scopes)
          ? decoded.scopes
          : (decoded.scope ? decoded.scope.split(" ") : []);

        if (!scopes.includes(requiredScope)) {
          return res.status(403).json({
            codigo: "SCOPE_INSUFICIENTE",
            mensaje: `Acceso denegado. Se requiere el scope '${requiredScope}'`,
            error: {
              code: "SCOPE_INSUFICIENTE",
              message: `Acceso denegado. Se requiere el scope '${requiredScope}'`
            }
          });
        }
      }

      return next();
    } catch (err) {
      return res.status(401).json({
        codigo: "TOKEN_INVALIDO",
        mensaje: "Token OAuth2 inválido o expirado",
        error: {
          code: "UNAUTHORIZED",
          message: "Token OAuth2 inválido o expirado"
        }
      });
    }
  };
}

module.exports = {
  crearAutenticacion
};
