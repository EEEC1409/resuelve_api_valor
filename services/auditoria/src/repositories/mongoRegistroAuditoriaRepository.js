const { asegurarRegistroAuditoriaRepository } = require("./registroAuditoriaRepository.interface");

const NOMBRE_COLECCION = "registros_auditoria";

/**
 * Implementacion MongoDB de RegistroAuditoriaRepository.
 * @param {{ connectDB: () => Promise<Object> }} deps
 */
function crearMongoRegistroAuditoriaRepository({ connectDB }) {
  if (typeof connectDB !== "function") {
    throw new TypeError("Se requiere connectDB para crear el repositorio MongoDB");
  }

  async function obtenerColeccion() {
    const db = await connectDB();
    return db.collection(NOMBRE_COLECCION);
  }

  async function guardar(registro) {
    const coleccion = await obtenerColeccion();
    await coleccion.insertOne({ ...registro });
  }

  async function buscar({ decision, pagina, limite }) {
    const coleccion = await obtenerColeccion();
    const filtro = decision ? { decision } : {};
    const [total, datos] = await Promise.all([
      coleccion.countDocuments(filtro),
      coleccion
        .find(filtro, { projection: { _id: 0 } })
        .sort({ creadoEn: 1, _id: 1 })
        .skip((pagina - 1) * limite)
        .limit(limite)
        .toArray()
    ]);

    return { total, datos };
  }

  return asegurarRegistroAuditoriaRepository({ guardar, buscar });
}

module.exports = {
  NOMBRE_COLECCION,
  crearMongoRegistroAuditoriaRepository
};