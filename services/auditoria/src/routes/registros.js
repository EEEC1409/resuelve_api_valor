const express = require("express");
const router = express.Router();

// Almacenamiento en memoria temporal como placeholder hasta conectar MongoDB
const registrosMemoria = [];

/**
 * POST /registros
 * Guarda un nuevo registro o evento de auditoria de evaluacion de credito.
 */
router.post("/", async (req, res, next) => {
  try {
    const registro = {
      ...req.body,
      idRegistro: "reg-" + Date.now(),
      creadoEn: new Date().toISOString()
    };

    // Placeholder: guardar en coleccion de MongoDB
    registrosMemoria.push(registro);

    return res.status(201).json({
      mensaje: "Registro de auditoria almacenado exitosamente",
      registro
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /registros
 * Consulta registros de auditoria con filtros (fechaDesde, fechaHasta, decision) y paginacion.
 */
router.get("/", async (req, res, next) => {
  try {
    const { fechaDesde, fechaHasta, decision, page = 1, limit = 20 } = req.query;

    // Placeholder: filtros y paginacion en coleccion
    let filtrados = [...registrosMemoria];

    if (decision) {
      filtrados = filtrados.filter(r => r.decision === decision);
    }

    const total = filtrados.length;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const paginados = filtrados.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    return res.status(200).json({
      total,
      pagina: pageNum,
      limite: limitNum,
      datos: paginados
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
