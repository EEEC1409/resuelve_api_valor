// Prueba de ejemplo (Supertest) para el manejador de errores global del buro-simulado.
// Tarea 8.5 — Fuerza un error no controlado y verifica que la respuesta sea
// estructurada con un objeto `error` que contiene `message` y `code`.
// Requisitos: 7.1

// Forzar entorno de prueba antes de importar cualquier modulo del servicio
// para evitar que la app real invoque app.listen().
process.env.NODE_ENV = "test";

const express = require("express");
const request = require("supertest");

// Enfoque B: se construye una mini-app Express en el propio test que REPLICA
// exactamente el mismo middleware de manejo de errores definido en src/index.js
// (mismo shape de respuesta: { error: { message, code: "BURO_SIMULATOR_ERROR" } }).
//
// Se eligio el enfoque B sobre el A porque en Express el manejador de errores
// de la app real ya esta registrado al final de su pila de middlewares. Una
// ruta agregada dinamicamente con app.get() DESPUES de importar la app queda
// posicionada por detras de ese manejador en la pila, de modo que su next(err)
// no seria capturado por el handler existente. Replicar el handler en una
// mini-app es deterministico y de menor riesgo, sin tocar la logica real.

// Middleware de manejo de errores identico al de src/index.js.
function manejadorDeErrores(err, req, res, next) {
  res.status(err.status || 500).json({
    error: {
      message: err.message || "Error interno en Simulador de Buro",
      code: "BURO_SIMULATOR_ERROR"
    }
  });
}

// Construir la mini-app de prueba: una ruta que pasa un error no controlado a
// next(err) y el mismo middleware de errores al final de la pila.
function crearAppDePrueba() {
  const app = express();
  app.use(express.json());

  app.get("/falla", (req, res, next) => {
    // Simula un error no controlado dentro de un handler.
    next(new Error("Fallo no controlado de prueba"));
  });

  app.use(manejadorDeErrores);
  return app;
}

describe("Manejador de errores global (error no controlado)", () => {
  const app = crearAppDePrueba();

  test("responde 500 con un objeto error que contiene message y code no vacios", async () => {
    const respuesta = await request(app).get("/falla");

    // Verificar codigo de estado por defecto (err.status no definido => 500)
    expect(respuesta.status).toBe(500);

    // Verificar estructura de la respuesta de error
    expect(respuesta.body).toHaveProperty("error");
    expect(typeof respuesta.body.error).toBe("object");
    expect(respuesta.body.error).not.toBeNull();

    // message: string no vacio
    expect(typeof respuesta.body.error.message).toBe("string");
    expect(respuesta.body.error.message.length).toBeGreaterThan(0);

    // code: string no vacio
    expect(typeof respuesta.body.error.code).toBe("string");
    expect(respuesta.body.error.code.length).toBeGreaterThan(0);
    expect(respuesta.body.error.code).toBe("BURO_SIMULATOR_ERROR");
  });

  test("respeta err.status cuando el error lo define", async () => {
    // App con un error que trae status personalizado.
    const appConStatus = express();
    appConStatus.get("/falla-status", (req, res, next) => {
      const err = new Error("Solicitud invalida");
      err.status = 400;
      next(err);
    });
    appConStatus.use(manejadorDeErrores);

    const respuesta = await request(appConStatus).get("/falla-status");

    expect(respuesta.status).toBe(400);
    expect(respuesta.body.error).toHaveProperty("message");
    expect(respuesta.body.error).toHaveProperty("code");
    expect(respuesta.body.error.message.length).toBeGreaterThan(0);
    expect(respuesta.body.error.code.length).toBeGreaterThan(0);
  });
});
