const { asegurarRegistroAuditoriaRepository } = require("./registroAuditoriaRepository.interface");

/**
 * Implementacion en memoria de RegistroAuditoriaRepository. Los registros se
 * pierden al reiniciar el proceso (comportamiento actual del servicio).
 *
 * @returns {import("./registroAuditoriaRepository.interface").RegistroAuditoriaRepository}
 */
function crearMemoriaRegistroAuditoriaRepository() {
  const registros = [];

  async function guardar(registro) {
    registros.push(registro);
  }

  async function buscar({ decision, pagina, limite }) {
    const filtrados = decision ? registros.filter((r) => r.decision === decision) : [...registros];
    return {
      total: filtrados.length,
      datos: filtrados.slice((pagina - 1) * limite, pagina * limite)
    };
  }

  return asegurarRegistroAuditoriaRepository({ guardar, buscar });
}

module.exports = {
  crearMemoriaRegistroAuditoriaRepository
};
