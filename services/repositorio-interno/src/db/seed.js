/**
 * Script de Seed para inicializar la base de datos con 3 clientes de prueba:
 * 1. Cliente con mora vigente
 * 2. Cliente con buen historial
 * 3. Cliente nuevo sin historial
 */
const { pool } = require("./connection");

const CLIENTES_SEED = [
  {
    identificacion: "1710000001",
    nombres: "Carlos Mora Vigente",
    tieneMoraVigente: true,
    diasMoraMaximo: 45,
    creditosActivos: 2,
    creditosPagados: 1,
    saldoPendiente: 1500.00,
    calificacionInterna: "RIESGO_ALTO"
  },
  {
    identificacion: "1720000002",
    nombres: "Ana Buen Historial",
    tieneMoraVigente: false,
    diasMoraMaximo: 0,
    creditosActivos: 1,
    creditosPagados: 5,
    saldoPendiente: 300.00,
    calificacionInterna: "EXCELENTE"
  },
  {
    identificacion: "1730000003",
    nombres: "Luis Cliente Nuevo",
    tieneMoraVigente: false,
    diasMoraMaximo: 0,
    creditosActivos: 0,
    creditosPagados: 0,
    saldoPendiente: 0.00,
    calificacionInterna: "SIN_HISTORIAL"
  }
];

async function seed() {
  console.log("[Seed] Inicializando datos de prueba en Repositorio Interno...");
  // Placeholder: en ejecucion real conectara a Postgres para insertar clientes
  console.log(`[Seed] Clientes preparados para sembrar: ${CLIENTES_SEED.length}`);
  return CLIENTES_SEED;
}

if (require.main === module) {
  seed()
    .then(() => {
      console.log("[Seed] Completado exitosamente.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("[Seed Error]:", err);
      process.exit(1);
    });
}

module.exports = {
  CLIENTES_SEED,
  seed
};
