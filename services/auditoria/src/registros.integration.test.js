const request = require("supertest");
const { crearApp } = require("./app");
const { crearMemoriaRegistroAuditoriaRepository } = require("./repositories/memoriaRegistroAuditoriaRepository");
const { asegurarRegistroAuditoriaRepository } = require("./repositories/registroAuditoriaRepository.interface");

const AHORA = new Date("2026-09-24T12:00:00.000Z");

function appNueva() {
  return crearApp({ registroRepository: crearMemoriaRegistroAuditoriaRepository(), ahora: () => AHORA });
}

describe("Servicio de Auditoria - comportamiento HTTP", () => {
  it("GET /health responde 200", async () => {
    const res = await request(appNueva()).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: "UP", service: "auditoria" });
  });

  it("POST /registros responde 201 con el registro y sus metadatos", async () => {
    const res = await request(appNueva()).post("/registros").send({ idEvaluacion: "e-1", decision: "APROBADO" });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      mensaje: "Registro de auditoria almacenado exitosamente",
      registro: {
        idEvaluacion: "e-1",
        decision: "APROBADO",
        idRegistro: `reg-${AHORA.getTime()}`,
        creadoEn: AHORA.toISOString()
      }
    });
  });

  it("GET /registros filtra por decision y pagina", async () => {
    const app = appNueva();
    for (const decision of ["APROBADO", "RECHAZADO", "APROBADO", "APROBADO"]) {
      await request(app).post("/registros").send({ decision });
    }

    const res = await request(app).get("/registros?decision=APROBADO&page=2&limit=2");

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(3);
    expect(res.body.pagina).toBe(2);
    expect(res.body.limite).toBe(2);
    expect(res.body.datos).toHaveLength(1);
    expect(res.body.datos[0].decision).toBe("APROBADO");
  });

  it("GET /registros sin filtros usa pagina 1 y limite 20", async () => {
    const res = await request(appNueva()).get("/registros");
    expect(res.body).toEqual({ total: 0, pagina: 1, limite: 20, datos: [] });
  });

  it("un error del repositorio se responde con AUDITORIA_ERROR", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    const app = crearApp({
      registroRepository: { guardar: jest.fn().mockRejectedValue(new Error("fallo")), buscar: jest.fn() }
    });

    const res = await request(app).post("/registros").send({});

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe("AUDITORIA_ERROR");
    console.error.mockRestore();
  });
});

describe("RegistroAuditoriaRepository (interfaz)", () => {
  it("la implementacion en memoria cumple la interfaz", () => {
    expect(() => asegurarRegistroAuditoriaRepository(crearMemoriaRegistroAuditoriaRepository())).not.toThrow();
  });

  it("crearApp rechaza un repositorio incompleto", () => {
    expect(() => crearApp({ registroRepository: { guardar: async () => {} } })).toThrow(
      'RegistroAuditoriaRepository invalido: falta el metodo "buscar"'
    );
  });
});
