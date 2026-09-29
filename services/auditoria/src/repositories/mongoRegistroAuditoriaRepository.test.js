const {
  NOMBRE_COLECCION,
  crearMongoRegistroAuditoriaRepository
} = require("./mongoRegistroAuditoriaRepository");

function crearRepositorioMongoPrueba({ total = 0, datos = [] } = {}) {
  const cursor = {
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    toArray: jest.fn().mockResolvedValue(datos)
  };
  const coleccion = {
    insertOne: jest.fn().mockResolvedValue({ acknowledged: true }),
    countDocuments: jest.fn().mockResolvedValue(total),
    find: jest.fn().mockReturnValue(cursor)
  };
  const db = { collection: jest.fn().mockReturnValue(coleccion) };
  const connectDB = jest.fn().mockResolvedValue(db);

  return {
    repositorio: crearMongoRegistroAuditoriaRepository({ connectDB }),
    connectDB,
    db,
    coleccion,
    cursor
  };
}

describe("MongoRegistroAuditoriaRepository", () => {
  it("guarda cada registro en la coleccion de auditoria", async () => {
    const { repositorio, connectDB, db, coleccion } = crearRepositorioMongoPrueba();
    const registro = { idEvaluacion: "eval-1", decision: "APROBADO" };

    await repositorio.guardar(registro);

    expect(connectDB).toHaveBeenCalledTimes(1);
    expect(db.collection).toHaveBeenCalledWith(NOMBRE_COLECCION);
    expect(coleccion.insertOne).toHaveBeenCalledWith(registro);
  });

  it("filtra por decision y devuelve el total y la pagina solicitada", async () => {
    const datos = [{ idEvaluacion: "eval-2", decision: "APROBADO" }];
    const { repositorio, coleccion, cursor } = crearRepositorioMongoPrueba({ total: 3, datos });

    const resultado = await repositorio.buscar({ decision: "APROBADO", pagina: 2, limite: 2 });

    expect(coleccion.countDocuments).toHaveBeenCalledWith({ decision: "APROBADO" });
    expect(coleccion.find).toHaveBeenCalledWith(
      { decision: "APROBADO" },
      { projection: { _id: 0 } }
    );
    expect(cursor.skip).toHaveBeenCalledWith(2);
    expect(cursor.limit).toHaveBeenCalledWith(2);
    expect(resultado).toEqual({ total: 3, datos });
  });
});