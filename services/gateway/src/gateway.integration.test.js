const express = require("express");
const request = require("supertest");
const jwt = require("jsonwebtoken");
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

  it("POST /v1/evaluaciones-credito se reenvia al BFF POS como /evaluaciones-credito", async () => {
    const res = await request(app).post("/v1/evaluaciones-credito").send({});
    expect(res.body).toEqual({ metodo: "POST", ruta: "/evaluaciones-credito" });
  });

  it("con el BFF POS caido responde 502 JSON", async () => {
    const appCaida = crearApp({ ...configBase, bffPosUrl: "http://localhost:1", bffAuditoriaUrl: "http://localhost:1" });
    const res = await request(appCaida).post("/evaluaciones-credito");
    expect(res.status).toBe(502);
    expect(res.body.error.message).toBe("Error de comunicacion con BFF Punto de Venta");
  });

  describe("OAuth2 /oauth/token y Autenticacion JWT", () => {
    const jwtSecret = "supersecretkey_resuelve_jwt";
    let appAuth;

    beforeAll(() => {
      appAuth = crearApp({
        ...configBase,
        nodeEnv: "production",
        jwtSecret,
        bffPosUrl: destino.url,
        bffAuditoriaUrl: destino.url
      });
    });

    it("POST /oauth/token emite token JWT con client_credentials", async () => {
      const res = await request(appAuth)
        .post("/oauth/token")
        .send({
          grant_type: "client_credentials",
          client_id: "frontend-tiendas",
          client_secret: "secret-key-resuelve"
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("access_token");
      expect(res.body.token_type).toBe("Bearer");
      expect(res.body.expires_in).toBe(3600);
      expect(res.body.scope).toContain("evaluaciones:escribir");

      // Verificar que el token sea valido criptograficamente
      const decoded = jwt.verify(res.body.access_token, jwtSecret);
      expect(decoded.client_id).toBe("frontend-tiendas");
      expect(decoded.scopes).toContain("evaluaciones:escribir");
    });

    it("POST /oauth/token rechaza grant_type invalido con 400", async () => {
      const res = await request(appAuth)
        .post("/oauth/token")
        .send({ grant_type: "authorization_code" });

      expect(res.status).toBe(400);
      expect(res.body.codigo).toBe("GRANT_TYPE_INVALIDO");
      expect(res.body.error.code).toBe("GRANT_TYPE_INVALIDO");
    });

    it("permite acceso a ruta protegida con token valido emitido por /oauth/token", async () => {
      const tokenRes = await request(appAuth)
        .post("/oauth/token")
        .send({ grant_type: "client_credentials" });

      const res = await request(appAuth)
        .get("/auditoria/evaluaciones")
        .set("Authorization", `Bearer ${tokenRes.body.access_token}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ metodo: "GET", ruta: "/evaluaciones" });
    });

    it("rechaza acceso con token invalido con 401", async () => {
      const res = await request(appAuth)
        .get("/auditoria/evaluaciones")
        .set("Authorization", "Bearer token_invalido_12345");

      expect(res.status).toBe(401);
      expect(res.body.codigo).toBe("TOKEN_INVALIDO");
    });

    it("rechaza acceso con scope insuficiente con 403", async () => {
      const tokenSinScope = jwt.sign(
        { client_id: "test", scopes: ["auditoria:leer"] },
        jwtSecret,
        { expiresIn: "1h" }
      );

      const res = await request(appAuth)
        .post("/evaluaciones-credito")
        .set("Authorization", `Bearer ${tokenSinScope}`)
        .send({});

      expect(res.status).toBe(403);
      expect(res.body.codigo).toBe("SCOPE_INSUFICIENTE");
    });
  });
});
