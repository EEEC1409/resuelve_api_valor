const express = require("express");
const router = express.Router();
const { CLIENTES_SEED } = require("../db/seed");

/**
 * GET /clientes/:identificacion/historial
 * Consulta el historial crediticio interno del cliente. Retorna 404 si no existe.
 */
router.get("/clientes/:identificacion/historial", async (req, res, next) => {
  try {
    const { identificacion } = req.params;

    // Placeholder: busqueda en base de datos o fallback a seed en memoria
    const cliente = CLIENTES_SEED.find(c => c.identificacion === identificacion);

    if (!cliente) {
      return res.status(404).json({
        error: {
          message: `Cliente con identificacion ${identificacion} no encontrado en repositorio interno`,
          code: "CLIENTE_NO_ENCONTRADO"
        }
      });
    }

    return res.status(200).json(cliente);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
