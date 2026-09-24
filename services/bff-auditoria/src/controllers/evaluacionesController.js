const { toFiltrosAuditoria } = require("../dtos/filtrosAuditoriaDto");

/**
 * Controlador de consulta de evaluaciones auditadas. Depende de la INTERFAZ
 * RegistroAuditoriaRepository.
 *
 * @param {{ registroRepository: import("../repositories/registroAuditoriaRepository.interface").RegistroAuditoriaRepository }} deps
 */
function crearEvaluacionesController({ registroRepository }) {
  /** GET /evaluaciones: historial con filtros y paginacion. */
  async function listar(req, res, next) {
    try {
      const datos = await registroRepository.buscar(toFiltrosAuditoria(req.query));
      return res.status(200).json(datos);
    } catch (error) {
      return next(error);
    }
  }

  return { listar };
}

module.exports = {
  crearEvaluacionesController
};
