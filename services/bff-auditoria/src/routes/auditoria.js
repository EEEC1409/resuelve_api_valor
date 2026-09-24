const express = require("express");
const router = express.Router();
const auditoriaClient = require("../clients/auditoriaClient");

/**
 * GET /evaluaciones
 * Consulta historial de evaluaciones con filtros (fechaDesde, fechaHasta, decision) y paginacion.
 */
router.get("/", async (req, res, next) => {
  try {
    const { fechaDesde, fechaHasta, decision, page = 1, limit = 20 } = req.query;
    // Placeholder: llamada al servicio de auditoria
    const datos = await auditoriaClient.obtenerRegistros({
      fechaDesde,
      fechaHasta,
      decision,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10)
    });
    return res.status(200).json(datos);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
