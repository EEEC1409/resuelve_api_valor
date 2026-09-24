const axios = require("axios");

const REPO_URL = process.env.REPOSITORIO_INTERNO_URL || "http://repositorio-interno:8092";

const client = axios.create({
  baseURL: REPO_URL,
  timeout: 4000
});

async function obtenerHistorial(identificacion) {
  try {
    const response = await client.get(`/clientes/${identificacion}/historial`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null; // Cliente nuevo sin historial
    }
    throw error;
  }
}

module.exports = {
  obtenerHistorial
};
