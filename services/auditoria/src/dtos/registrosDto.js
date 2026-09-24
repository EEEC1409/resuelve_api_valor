/**
 * DTOs de salida del Servicio de Auditoria.
 */

/** Respuesta de POST /registros (201). */
function toRegistroCreadoDto(registro) {
  return {
    mensaje: "Registro de auditoria almacenado exitosamente",
    registro
  };
}

/** Respuesta paginada de GET /registros. */
function toPaginaRegistrosDto({ total, datos }, { pagina, limite }) {
  return {
    total,
    pagina,
    limite,
    datos
  };
}

module.exports = {
  toRegistroCreadoDto,
  toPaginaRegistrosDto
};
