const axios = require("axios");

const MAX_CUERPO = 500;

function enmascarar(clave, valor) {
  return clave === "identificacion" && typeof valor === "string" && valor.length > 4
    ? `***${valor.slice(-4)}`
    : valor;
}

/** Cuerpo serializado, con identificacion enmascarada y truncado. */
function resumirCuerpo(cuerpo) {
  if (cuerpo === undefined || cuerpo === null || cuerpo === "") return undefined;
  let texto;
  try {
    texto = typeof cuerpo === "string" ? cuerpo : JSON.stringify(cuerpo, enmascarar);
  } catch (error) {
    return "[no serializable]";
  }
  return texto.length > MAX_CUERPO ? `${texto.slice(0, MAX_CUERPO)}...[truncado]` : texto;
}

const urlDe = (config) => `${config.baseURL || ""}${config.url || ""}`;

/**
 * Cliente axios que registra en log cada llamada saliente y su respuesta
 * (metodo, url, request, status, duracion y cuerpo; nunca lanza por logging).
 *
 * @param {{ nombre: string, baseURL?: string, timeout?: number, logger?: Console }} opciones
 */
function crearClienteHttp({ nombre, baseURL, timeout, logger = console }) {
  const cliente = axios.create({ baseURL, timeout });

  cliente.interceptors.request.use((config) => {
    config.metadata = { inicioMs: Date.now() };
    logger.log(`[Core -> ${nombre}] Llamada:`, {
      metodo: String(config.method).toUpperCase(),
      url: urlDe(config),
      params: config.params,
      cuerpo: resumirCuerpo(config.data)
    });
    return config;
  });

  cliente.interceptors.response.use(
    (response) => {
      logger.log(`[Core <- ${nombre}] Respuesta:`, {
        metodo: String(response.config.method).toUpperCase(),
        url: urlDe(response.config),
        status: response.status,
        duracionMs: Date.now() - response.config.metadata.inicioMs,
        cuerpo: resumirCuerpo(response.data)
      });
      return response;
    },
    (error) => {
      const config = error.config || {};
      logger.error(`[Core <- ${nombre}] Error:`, {
        metodo: String(config.method || "").toUpperCase(),
        url: urlDe(config),
        status: error.response && error.response.status,
        code: error.code,
        message: error.message,
        duracionMs: config.metadata ? Date.now() - config.metadata.inicioMs : undefined,
        cuerpo: resumirCuerpo(error.response && error.response.data)
      });
      return Promise.reject(error);
    }
  );

  return cliente;
}

module.exports = { crearClienteHttp, resumirCuerpo };
