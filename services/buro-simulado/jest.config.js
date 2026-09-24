// Configuracion de Jest para buro-simulado (CommonJS, entorno Node).
//
// Motivo de maxWorkers:1 (ejecucion serial):
// scenarioState.js mantiene un estado singleton en memoria (el escenario activo:
// NORMAL / LATENCIA_ALTA / CAIDO). Varias suites lo mutan (admin.test.js,
// score.latencia.test.js, score.respuesta.test.js). Jest reutiliza procesos de
// worker entre archivos de prueba, por lo que la ejecucion en paralelo puede
// entrelazar el estado compartido entre suites y volver la corrida no
// determinista. Forzar ejecucion serial elimina ese entrelazado sin tocar la
// logica de negocio del servicio.
module.exports = {
  testEnvironment: "node",
  maxWorkers: 1
};
