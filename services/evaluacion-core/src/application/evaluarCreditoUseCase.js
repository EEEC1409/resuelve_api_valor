const crypto = require("crypto");

const MotorReglas = require("../domain/motorReglas");
const buroExternoAdapter = require("../infrastructure/adapters/buroExternoAdapter");
const repositorioInternoAdapter = require("../infrastructure/adapters/repositorioInternoAdapter");
const auditoriaPublisher = require("../infrastructure/auditoriaPublisher");

/**
 * Caso de Uso: Evaluar Solicitud de Credito.
 *
 * Orquesta la evaluacion crediticia con CONSULTA PEREZOSA (lazy) del buro
 * externo para proteger el KPI del 60% de evaluaciones sin buro (RF-06 crit. 5):
 *
 *   1. Obtiene el Historial_Interno (repositorioInternoAdapter). Un 404 se
 *      traduce a `historial = null` (cliente nuevo); cualquier otro error se
 *      propaga (dato base imprescindible -> 5xx en la ruta).
 *   2. Ejecuta la FASE INTERNA del motor (reglas que NO requieren buro). Si una
 *      regla interna decide, se finaliza sin tocar el buro
 *      (`consultaBuroRealizada = false`).
 *   3. Si la fase interna no decide, consulta el buro (`obtenerScore`, que nunca
 *      lanza: devuelve fallback normalizado en caso de fallo/timeout) marcando
 *      `consultaBuroRealizada = true`, y ejecuta la FASE CON BURO (`continuar`),
 *      preservando el acumulado `reglasAplicadas` de la fase interna.
 *   4. Construye la DecisionCore con `idEvaluacion` (UUID), `reglasAplicadas` y
 *      `consultaBuroRealizada`.
 *   5. Publica el registro de auditoria de forma NO bloqueante (fire-and-forget)
 *      en todos los caminos resueltos, incluido el fallback del buro (RF-08).
 */
class EvaluarCreditoUseCase {
  constructor() {
    this.motorReglas = new MotorReglas();
  }

  async ejecutar(solicitud) {
    // 1. Historial interno: 404 -> null (cliente nuevo); otros errores propagan.
    const historial = await repositorioInternoAdapter.obtenerHistorial(
      solicitud.identificacion
    );

    // 2. Fase interna (sin buro).
    const estadoInterno = this.motorReglas.ejecutarInternas(historial, solicitud);

    let decision;
    let consultaBuroRealizada = false;
    let buro = null;

    if (estadoInterno.decidido) {
      // Una regla interna emitio veredicto: no se consulta el buro.
      decision = estadoInterno.resultado;
    } else {
      // 3. Consulta condicional del buro. obtenerScore NUNCA lanza: devuelve un
      // Datos_Buro normalizado (o fallback INDISPONIBLE). Se marca la consulta
      // como realizada independientemente del estado del buro.
      buro = await buroExternoAdapter.obtenerScore(solicitud.identificacion);
      consultaBuroRealizada = true;

      // Fase con buro: preserva el acumulado reglasAplicadas de la fase interna.
      decision = this.motorReglas.continuar(
        historial,
        buro,
        solicitud,
        estadoInterno
      );
    }

    // 4. Construir DecisionCore (contrato spec4).
    const idEvaluacion = crypto.randomUUID();
    const fecha = new Date().toISOString();

    const decisionCore = {
      idEvaluacion,
      decision: decision.decision,
      motivo: decision.motivo,
      fecha,
      consultaBuroRealizada,
      reglasAplicadas: decision.reglasAplicadas
    };

    // 5. Auditoria fire-and-forget: sincrono, no bloqueante y no lanza. Se
    // invoca en todos los caminos resueltos, incluido el fallback del buro.
    auditoriaPublisher.publicarEvento({
      idEvaluacion,
      identificacion: solicitud.identificacion,
      montoSolicitado: solicitud.montoSolicitado,
      plazoMeses: solicitud.plazoMeses,
      decision: decisionCore.decision,
      motivo: decisionCore.motivo,
      reglasAplicadas: decisionCore.reglasAplicadas,
      consultaBuroRealizada,
      fecha,
      tiendaId: solicitud.tiendaId,
      scoreBuro: buro ? buro.score : null
    });

    return decisionCore;
  }

  async obtenerPorId(id) {
    // Placeholder para consulta de evaluacion por ID.
    return {
      idEvaluacion: id,
      status: "COMPLETADA"
    };
  }
}

module.exports = new EvaluarCreditoUseCase();
