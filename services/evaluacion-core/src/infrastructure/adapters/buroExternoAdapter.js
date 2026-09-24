const axios = require("axios");
const CircuitBreaker = require("opossum");

const BURO_URL = process.env.BURO_SIMULADO_URL || "http://buro-simulado:8091";

const axiosInstance = axios.create({
  baseURL: BURO_URL,
  timeout: 3000
});

// Rango valido de score segun contrato buro-simulado (ScoreResponse: 300-850).
const SCORE_MIN = 300;
const SCORE_MAX = 850;

/**
 * Normaliza un score crudo del contrato ScoreResponse a number|null.
 * Solo se acepta un numero dentro del rango valido 300-850; cualquier otro
 * valor (null, no numerico, fuera de rango) se traduce a null para que el
 * dominio no tome decisiones con datos no confiables.
 */
function normalizarScore(scoreCrudo) {
  if (typeof scoreCrudo !== "number" || Number.isNaN(scoreCrudo)) {
    return null;
  }
  if (scoreCrudo < SCORE_MIN || scoreCrudo > SCORE_MAX) {
    return null;
  }
  return scoreCrudo;
}

/**
 * Resultado de fallback normalizado (Datos_Buro) cuando el buro falla,
 * excede su timeout o el Circuit Breaker esta abierto (RF-07 crit. 1).
 */
function construirFallback() {
  return {
    score: null,
    moraExterna: false,
    deudaExternaTotal: 0,
    estadoBuro: "INDISPONIBLE"
  };
}

/**
 * Mapea la respuesta real del buro (ScoreResponse, que NO incluye estadoBuro)
 * a la forma consistente Datos_Buro que espera el dominio. El adapter sintetiza
 * estadoBuro: "DISPONIBLE" para el camino exitoso.
 */
function normalizarRespuesta(data) {
  const fuente = data || {};
  return {
    score: normalizarScore(fuente.score),
    moraExterna: fuente.moraExterna === true,
    deudaExternaTotal:
      typeof fuente.deudaExternaTotal === "number" && !Number.isNaN(fuente.deudaExternaTotal)
        ? fuente.deudaExternaTotal
        : 0,
    estadoBuro: "DISPONIBLE"
  };
}

/**
 * Determina si un error de axios corresponde a una respuesta HTTP 4xx
 * (error del cliente: entrada invalida), segun el contrato buro-simulado el
 * caso 400 -> INVALID_IDENTIFICACION. Un 4xx NO es una caida del buro.
 */
function esErrorCliente4xx(error) {
  const status = error && error.response && error.response.status;
  return typeof status === "number" && status >= 400 && status <= 499;
}

/**
 * Construye un Error tipado de cliente a partir de una respuesta 4xx del buro.
 * Expone `status` (4xx del upstream) y `code` (usa error.error.code del
 * contrato ErrorRespuesta cuando existe, ej. "INVALID_IDENTIFICACION"; si no,
 * "BURO_BAD_REQUEST"). Se marca con esClienteBuro para que el breaker lo
 * filtre y obtenerScore lo re-lance sin caer al fallback INDISPONIBLE.
 */
function construirErrorCliente(error, identificacion) {
  const status = (error && error.response && error.response.status) || 400;
  const cuerpo = (error && error.response && error.response.data) || {};
  const codeUpstream = cuerpo && cuerpo.error && cuerpo.error.code;
  const messageUpstream = cuerpo && cuerpo.error && cuerpo.error.message;

  const errClient = new Error(
    messageUpstream ||
      `Solicitud invalida al buro externo para ID ${identificacion} (HTTP ${status})`
  );
  errClient.status = status;
  errClient.code = codeUpstream || "BURO_BAD_REQUEST";
  errClient.esClienteBuro = true;
  return errClient;
}

async function callBuro(identificacion) {
  try {
    const response = await axiosInstance.get(`/score/${identificacion}`);
    return normalizarRespuesta(response.data);
  } catch (error) {
    // Un 4xx es un error del cliente (entrada invalida), NO una caida.
    // Se re-lanza como error tipado para que el errorFilter del breaker lo
    // deje pasar al llamador sin activar el fallback INDISPONIBLE.
    if (esErrorCliente4xx(error)) {
      throw construirErrorCliente(error, identificacion);
    }
    // Cualquier otro fallo (503, 504, timeout, red) se propaga tal cual para
    // que el breaker lo cuente como fallo y active el fallback INDISPONIBLE.
    throw error;
  }
}

// Configuracion de Circuit Breaker con Opossum
const breakerOptions = {
  timeout: 3000,
  errorThresholdPercentage: 50,
  resetTimeout: 10000,
  // errorFilter que retorna true => opossum NO cuenta el error como fallo,
  // NO invoca el fallback y re-lanza el error al llamador (breaker.fire).
  // Verificado contra opossum 8.5.0 (lib/circuit.js handleError). Asi los
  // errores de cliente 4xx se propagan y las caidas 503/504/timeout no.
  errorFilter: (error) => Boolean(error && error.esClienteBuro)
};

const breaker = new CircuitBreaker(callBuro, breakerOptions);

breaker.fallback((identificacion) => {
  console.warn(`[CircuitBreaker] Activado fallback para buro externo con ID: ${identificacion}`);
  return construirFallback();
});

/**
 * Obtiene los Datos_Buro normalizados de un cliente. Maneja timeout y error de
 * forma explicita: cualquier fallo se resuelve con el fallback normalizado y
 * NUNCA propaga una excepcion al llamador (RF-07 crit. 1-2).
 */
async function obtenerScore(identificacion) {
  try {
    return await breaker.fire(identificacion);
  } catch (error) {
    // Los errores de cliente 4xx (entrada invalida) se re-lanzan para que el
    // manejador central los convierta en una respuesta HTTP de cliente
    // (honra err.status / err.code). NO deben enmascararse como INDISPONIBLE.
    if (error && (error.esClienteBuro || (typeof error.status === "number" && error.status >= 400 && error.status <= 499))) {
      throw error;
    }
    // Fallos transitorios/caidas (503, 504, timeout, red, breaker abierto) se
    // resuelven con el fallback INDISPONIBLE y NUNCA propagan (RF-07 crit. 1-2).
    console.warn(
      `[BuroExternoAdapter] Buro indisponible para ID ${identificacion}: ${error.message}`
    );
    return construirFallback();
  }
}

module.exports = {
  obtenerScore,
  breaker
};
