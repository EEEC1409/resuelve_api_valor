/**
 * Manejador central de errores del BFF Auditoria.
 *
 * Conserva el formato actual. Pendiente para el spec de este servicio (igual
 * que en bff-punto-venta): dejar de exponer `err.message` de axios y
 * `err.response.data` del Servicio de Auditoria.
 */
function manejadorErrores(err, req, res, next) {
  console.error("[BFF Auditoria Error]:", err.message);
  res.status(err.status || 500).json({
    error: {
      message: err.message || "Error interno en BFF Auditoria",
      details: err.response ? err.response.data : null
    }
  });
}

module.exports = {
  manejadorErrores
};
