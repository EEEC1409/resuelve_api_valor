const { crearRegistroAuditoria } = require("../models/registroAuditoria");
const { toRegistroCreadoDto, toPaginaRegistrosDto } = require("../dtos/registrosDto");

/**
 * Controlador de registros de auditoria. Depende de la INTERFAZ
 * RegistroAuditoriaRepository, no del almacenamiento concreto.
 *
 * @param {{ registroRepository: import("../repositories/registroAuditoriaRepository.interface").RegistroAuditoriaRepository,
 *           ahora?: () => Date }} deps
 */
function crearRegistrosController({ registroRepository, ahora = () => new Date() }) {
  /** POST /registros: guarda un evento de auditoria de evaluacion de credito. */
  async function crear(req, res, next) {
    try {
      const registro = crearRegistroAuditoria(req.body, ahora());
      await registroRepository.guardar(registro);
      return res.status(201).json(toRegistroCreadoDto(registro));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * GET /registros: consulta con filtro por decision y paginacion.
   * (fechaDesde/fechaHasta se aceptan pero aun no filtran: pendiente del spec.)
   */
  async function listar(req, res, next) {
    try {
      const { decision, page = 1, limit = 20 } = req.query;
      const paginacion = { pagina: parseInt(page, 10), limite: parseInt(limit, 10) };
      const resultado = await registroRepository.buscar({ decision, ...paginacion });
      return res.status(200).json(toPaginaRegistrosDto(resultado, paginacion));
    } catch (error) {
      return next(error);
    }
  }

  return { crear, listar };
}

module.exports = {
  crearRegistrosController
};
