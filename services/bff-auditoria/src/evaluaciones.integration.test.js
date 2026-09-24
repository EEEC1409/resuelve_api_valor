const request = require("supertest");
const { crearApp } = require("./app");
const { crearHttpRegistroAuditoriaRepository } = require("./repositories/httpRegistroAuditoriaRepository");

const PAGINA = { total: 1, pagina: 1, limite: 20, datos: [{ decision: "APROBADO" }] };

describe("BFF Auditoria - comportamiento HTTP", () => {
  beforeEach(() => jest.spyOn(console, "error").mockImplementation(() => {}));
  afterEach(() => console.error.mockRestore());

  it("GET /health responde 200", async () => {
    const app = crearApp({ registroRepository: { buscar: jest.fn() } });
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: "UP", service: "bff-auditoria" });
  });

  it("GET /evaluaciones traduce el query a filtros y devuelve la pagina del repositorio", async () => {
    const registroRepository = { buscar: jest.fn().mockResolvedValue(PAGINA) };
    const app = crearApp({ registroRepository });

    const res = await request(app).get("/evaluaciones?decision=APROBADO&fechaDesde=2026-01-01&page=2&limit=5");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(PAGINA);
    expect(registroRepository.buscar).toHaveBeenCalledWith({
      fechaDesde: "2026-01-01",
      fechaHasta: undefined,
      decision: "APROBADO",
      page: 2,
      limit: 5
    });
  });

  it("GET /evaluaciones sin query usa page 1 y limit 20", async () => {
    const registroRepository = { buscar: jest.fn().mockResolvedValue(PAGINA) };
    await request(crearApp({ registroRepository })).get("/evaluaciones");
    expect(registroRepository.buscar).toHaveBeenCalledWith(expect.objectContaining({ page: 1, limit: 20 }));
  });

  it("un error del repositorio conserva el formato de error actual", async () => {
    const error = Object.assign(new Error("Request failed with status code 500"), {
      response: { status: 500, data: { error: { message: "x" } } }
    });
    const app = crearApp({ registroRepository: { buscar: jest.fn().mockRejectedValue(error) } });

    const res = await request(app).get("/evaluaciones");

    expect(res.status).toBe(500);
    expect(res.body.error).toHaveProperty("message");
    expect(res.body.error).toHaveProperty("details");
  });

  it("el repositorio HTTP llama a GET /registros con los filtros como params", async () => {
    const httpClient = { get: jest.fn().mockResolvedValue({ data: PAGINA }) };
    const repo = crearHttpRegistroAuditoriaRepository({ httpClient });

    const filtros = { decision: "RECHAZADO", page: 1, limit: 20 };
    expect(await repo.buscar(filtros)).toEqual(PAGINA);
    expect(httpClient.get).toHaveBeenCalledWith("/registros", { params: filtros });
  });

  it("crearApp rechaza un repositorio que no cumple la interfaz", () => {
    expect(() => crearApp({ registroRepository: {} })).toThrow(
      'RegistroAuditoriaRepository invalido: falta el metodo "buscar"'
    );
  });
});
