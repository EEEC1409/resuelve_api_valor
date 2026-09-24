require("dotenv").config();
const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const scoreRoutes = require("./routes/score");
const adminRoutes = require("./routes/admin");

const app = express();
const PORT = process.env.PORT || 8091;

// Carga del contrato OpenAPI ubicado en la raiz del servicio (index.js vive en src/)
const rutaOpenApi = path.join(__dirname, "..", "openapi.yaml");
let documentoOpenApi = null;
try {
  documentoOpenApi = YAML.load(rutaOpenApi);
} catch (err) {
  // Si el YAML no se puede leer/parsear, no tumbamos el arranque: solo avisamos
  console.warn(`[Buro Simulado] No se pudo cargar el contrato OpenAPI (${rutaOpenApi}): ${err.message}`);
  documentoOpenApi = null;
}

app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP", service: "buro-simulado", timestamp: new Date().toISOString() });
});

// Rutas de score y administracion de escenarios
app.use("/score", scoreRoutes);
app.use("/admin", adminRoutes);

// Documentacion interactiva: solo se monta si el contrato se cargo correctamente
if (documentoOpenApi) {
  app.use(
    "/docs",
    swaggerUi.serve,
    swaggerUi.setup(documentoOpenApi, { customSiteTitle: "Buro Simulado - API Docs" })
  );
}

// Spec crudo en formato YAML; 404 estandar si el contrato no esta disponible
app.get("/openapi.yaml", (req, res, next) => {
  if (!documentoOpenApi) {
    return res.status(404).json({
      error: {
        message: "Contrato OpenAPI no disponible",
        code: "BURO_OPENAPI_NOT_FOUND"
      }
    });
  }
  fs.readFile(rutaOpenApi, "utf8", (err, contenido) => {
    if (err) {
      return next(err);
    }
    res.type("text/yaml").send(contenido);
  });
});

// Manejador de errores
app.use((err, req, res, next) => {
  console.error("[Buro Simulado Error]:", err.message);
  res.status(err.status || 500).json({
    error: {
      message: err.message || "Error interno en Simulador de Buro",
      code: "BURO_SIMULATOR_ERROR"
    }
  });
});

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`[Buro Simulado] Servidor escuchando en el puerto ${PORT}`);
    console.log(`[Buro Simulado] Swagger UI disponible en http://localhost:${PORT}/docs`);
  });
}

module.exports = app;
