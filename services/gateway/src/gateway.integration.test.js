const express = require("express");
const request = require("supertest");
const { crearApp } = require("./app");

/**
 * Levanta un BFF de prueba que responde con el metodo y la ruta recibidos.
 * @returns {Promise<{ url: string, cerrar: () => void }>}
 */
function levantarDestinoEco() {
  return new Promise((resolve) => {
    const destino = express();
    destino.use((req, res) => res.json({ metodo: req.method, ruta: req.originalUrl }));
    const servidor = destino.listen(0, () => {
      resolve({ url: `http://localhost:${servidor.address().port}`, cerrar: () => servidor.close() });
    });
  });
}

const configBase = { rateLimitWindowMs: 60000, rateLimitMax: 100 };

describe("Gateway - comportamiento HTTP", () => {
  let destino;
  let app;

  beforeAll(async () => {
    destino = await levantarDestinoEco();
    app = crearApp({ ...configBase, bffPosUrl: destino.url, bffAuditoriaUrl: destino.url });
  });
  afterAll(() => destino.cerrar());

  it("GET /health responde 200 sin autenticacion", async () => {
    const res = await request(crearApp({ ...configBase, nodeEnv: "production", bffPosUrl: destino.url, bffAuditoriaUrl: destino.url })).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: "UP", service: "gateway" });
  });

  it("en production exige la cabecera Authorization (401 UNAUTHORIZED)", async () => {
    const appProd = crearApp({ ...configBase, nodeEnv: "production", bffPosUrl: destino.url, bffAuditoriaUrl: destino.url });
    const res = await request(appProd).get("/auditoria/evaluaciones");
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  it("aplica el limite de tasa (429 RATE_LIMIT_EXCEEDED)", async () => {
    const appLimitada = crearApp({ rateLimitWindowMs: 60000, rateLimitMax: 1, bffPosUrl: destino.url, bffAuditoriaUrl: destino.url });
    await request(appLimitada).get("/health");
    const res = await request(appLimitada).get("/health");
    expect(res.status).toBe(429);
    expect(res.body.error.code).toBe("RATE_LIMIT_EXCEEDED");
  });

  it("/auditoria/* se reenvia al BFF Auditoria sin el prefijo /auditoria", async () => {
    const res = await request(app).get("/auditoria/evaluaciones?page=1");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ metodo: "GET", ruta: "/evaluaciones?page=1" });
  });

  // ---- Defectos preexistentes (http-proxy-middleware 3.x), pendientes del spec del Gateway ----
  // test.failing: pasa mientras el defecto exista y FALLA cuando se corrija,
  // avisando que hay que convertirlo en una prueba normal.

  test.failing("DEFECTO: POST /evaluaciones-credito debe llegar al BFF POS como /evaluaciones-credito (hoy llega como /)", async () => {
    const res = await request(app).post("/evaluaciones-credito").send({});
    expect(res.body).toEqual({ metodo: "POST", ruta: "/evaluaciones-credito" });
  });

  test.failing("DEFECTO: con el BFF POS caido debe responder 502 JSON (hoy onError se ignora y responde 504 texto)", async () => {
    const appCaida = crearApp({ ...configBase, bffPosUrl: "http://localhost:1", bffAuditoriaUrl: "http://localhost:1" });
    const res = await request(appCaida).post("/evaluaciones-credito");
    expect(res.status).toBe(502);
    expect(res.body.error.message).toBe("Error de comunicacion con BFF Punto de Venta");
  });
});
