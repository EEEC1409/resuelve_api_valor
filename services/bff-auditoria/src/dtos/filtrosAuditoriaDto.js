/**
 * DTO de entrada: traduce el query string del panel a los filtros de busqueda
 * (fechaDesde, fechaHasta, decision) y la paginacion (page, limit).
 *
 * @param {Object} query req.query
 * @returns {{ fechaDesde?: string, fechaHasta?: string, decision?: string, page: number, limit: number }}
 */
function toFiltrosAuditoria(query = {}) {
  const { fechaDesde, fechaHasta, decision, page = 1, limit = 20 } = query;
  return {
    fechaDesde,
    fechaHasta,
    decision,
    page: parseInt(page, 10),
    limit: parseInt(limit, 10)
  };
}

module.exports = {
  toFiltrosAuditoria
};
