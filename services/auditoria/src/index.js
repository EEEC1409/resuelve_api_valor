require("dotenv").config();
const auditoriaConfig = require("./config/auditoriaConfig");
const { crearMemoriaRegistroAuditoriaRepository } = require("./repositories/memoriaRegistroAuditoriaRepository");
const { crearMongoRegistroAuditoriaRepository } = require("./repositories/mongoRegistroAuditoriaRepository");
const { connectDB, closeDB } = require("./db/connection");
const { crearApp } = require("./app");

const registroRepository = process.env.NODE_ENV === "test"
  ? crearMemoriaRegistroAuditoriaRepository()
  : crearMongoRegistroAuditoriaRepository({ connectDB });

const app = crearApp({
  registroRepository
});

if (process.env.NODE_ENV !== "test") {
  connectDB()
    .then(() => {
      const server = app.listen(auditoriaConfig.port, () => {
        console.log(`[Auditoria] Servidor escuchando en el puerto ${auditoriaConfig.port}`);
      });

      const detener = async () => {
        server.close(async () => {
          await closeDB();
          process.exit(0);
        });
      };

      process.once("SIGINT", detener);
      process.once("SIGTERM", detener);
    })
    .catch((error) => {
      console.error("[Auditoria] No se pudo conectar a MongoDB:", error.message);
      process.exitCode = 1;
    });
}

module.exports = app;
