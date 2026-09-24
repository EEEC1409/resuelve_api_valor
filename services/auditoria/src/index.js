require("dotenv").config();
const auditoriaConfig = require("./config/auditoriaConfig");
const { crearMemoriaRegistroAuditoriaRepository } = require("./repositories/memoriaRegistroAuditoriaRepository");
const { crearApp } = require("./app");

// Composicion: aqui se elige la implementacion concreta del repositorio.
const app = crearApp({
  registroRepository: crearMemoriaRegistroAuditoriaRepository()
});

if (process.env.NODE_ENV !== "test") {
  app.listen(auditoriaConfig.port, () => {
    console.log(`[Auditoria] Servidor escuchando en el puerto ${auditoriaConfig.port}`);
  });
}

module.exports = app;
