// Feature: buro-simulado, Property 9: Inicialización total del escenario
//
// Property 9: Inicialización total del escenario.
// Validates: Requisitos 5.5, 5.6
//
// Para todo valor de ESCENARIO_INICIAL: si su normalización a mayúsculas
// pertenece al conjunto { NORMAL, LATENCIA_ALTA, CAIDO }, el escenario activo
// inicial es ese valor normalizado; en cualquier otro caso (cadena inválida o
// variable ausente) el escenario activo inicial es NORMAL.

const fc = require("fast-check");

const ESCENARIOS_VALIDOS = ["NORMAL", "LATENCIA_ALTA", "CAIDO"];

describe("scenarioState - inicialización total del escenario (Property 9)", () => {
  let envOriginal;

  beforeEach(() => {
    // Preservar el entorno completo para restaurarlo tras cada prueba.
    envOriginal = { ...process.env };
  });

  afterEach(() => {
    process.env = { ...envOriginal };
    jest.resetModules();
  });

  /**
   * Carga fresca del módulo tras (re)configurar el entorno, de modo que se
   * vuelva a ejecutar inicializarEscenario() al importar.
   * @returns {string} el escenario activo inicial reportado por getEscenario()
   */
  function cargarEscenarioInicial() {
    jest.resetModules();
    // eslint-disable-next-line global-require
    const scenarioState = require("./scenarioState");
    return scenarioState.getEscenario();
  }

  test("valores válidos en distintas capitalizaciones se normalizan a mayúsculas", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...ESCENARIOS_VALIDOS),
        // Vector de capitalización: por cada carácter decide mayúscula/minúscula.
        fc.array(fc.boolean(), { minLength: 0, maxLength: 20 }),
        (escenarioCanonico, capsFlags) => {
          const mezclado = escenarioCanonico
            .split("")
            .map((ch, i) => (capsFlags[i] ? ch.toUpperCase() : ch.toLowerCase()))
            .join("");

          process.env.ESCENARIO_INICIAL = mezclado;

          const activo = cargarEscenarioInicial();
          expect(activo).toBe(escenarioCanonico);
        }
      ),
      { numRuns: 100 }
    );
  });

  test("valores inválidos (fuera del conjunto) inicializan en NORMAL", () => {
    fc.assert(
      fc.property(
        fc.string().filter(
          (s) => !ESCENARIOS_VALIDOS.includes(s.toUpperCase())
        ),
        (valorInvalido) => {
          process.env.ESCENARIO_INICIAL = valorInvalido;

          const activo = cargarEscenarioInicial();
          expect(activo).toBe("NORMAL");
        }
      ),
      { numRuns: 100 }
    );
  });

  test("ESCENARIO_INICIAL ausente inicializa en NORMAL", () => {
    fc.assert(
      fc.property(fc.constant(undefined), () => {
        delete process.env.ESCENARIO_INICIAL;

        const activo = cargarEscenarioInicial();
        expect(activo).toBe("NORMAL");
      }),
      { numRuns: 100 }
    );
  });
});
