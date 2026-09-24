/**
 * scenarioState.js
 *
 * Estado de escenario compartido del buro-simulado. Centraliza el estado en
 * memoria (una sola instancia, sin persistencia) y su ciclo de vida, de modo
 * que tanto routes/admin.js como routes/score.js lo consuman sin acoplarse
 * entre si (elimina la dependencia router -> router).
 *
 * Escenarios validos: NORMAL, LATENCIA_ALTA, CAIDO.
 */

// Conjunto fijo de escenarios validos.
const ESCENARIOS_VALIDOS = ["NORMAL", "LATENCIA_ALTA", "CAIDO"];

// Escenario activo en memoria. Se inicializa al cargar el modulo.
let escenarioActual = "NORMAL";

/**
 * Indica si un valor, tras normalizarse a mayusculas, pertenece al conjunto
 * de escenarios validos.
 * @param {string} valor
 * @returns {boolean}
 */
function esEscenarioValido(valor) {
  if (typeof valor !== "string") {
    return false;
  }
  return ESCENARIOS_VALIDOS.includes(valor.toUpperCase());
}

/**
 * Inicializa el estado a partir de la variable de entorno ESCENARIO_INICIAL.
 * Si su valor normalizado pertenece al conjunto valido, lo usa; en caso
 * contrario (ausente o invalido) usa NORMAL. Establece el estado interno y lo
 * retorna. (Requisitos 5.5, 5.6)
 * @returns {string} el escenario activo resultante
 */
function inicializarEscenario() {
  const inicial = process.env.ESCENARIO_INICIAL;

  if (esEscenarioValido(inicial)) {
    escenarioActual = inicial.toUpperCase();
  } else {
    escenarioActual = "NORMAL";
  }

  return escenarioActual;
}

/**
 * Retorna el escenario activo actual.
 * @returns {string}
 */
function getEscenario() {
  return escenarioActual;
}

/**
 * Normaliza el valor a mayusculas; si es valido actualiza el estado y retorna
 * { ok: true, escenario }. Si es ausente o invalido retorna { ok: false } sin
 * modificar el estado. (Requisitos 5.1, 5.2, 5.3)
 * @param {string} valor
 * @returns {{ ok: boolean, escenario?: string }}
 */
function setEscenario(valor) {
  if (!esEscenarioValido(valor)) {
    return { ok: false };
  }

  escenarioActual = valor.toUpperCase();
  return { ok: true, escenario: escenarioActual };
}

// Dejar el estado inicial listo al cargar el modulo.
inicializarEscenario();

module.exports = {
  inicializarEscenario,
  getEscenario,
  setEscenario,
  esEscenarioValido
};
