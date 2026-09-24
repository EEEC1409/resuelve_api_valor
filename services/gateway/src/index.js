require("dotenv").config();
const gatewayConfig = require("./config/gatewayConfig");
const { crearApp } = require("./app");

// Composicion: el Gateway solo necesita su configuracion.
const app = crearApp(gatewayConfig);

if (process.env.NODE_ENV !== "test") {
  app.listen(gatewayConfig.port, () => {
    console.log(`[Gateway] Servidor escuchando en el puerto ${gatewayConfig.port}`);
  });
}

module.exports = app;
