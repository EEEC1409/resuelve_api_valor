const { MongoClient } = require("mongodb");

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://edisonenc80_db_user:ZUp7WDWVpTMlTwdq@cluster0.ce0hfi3.mongodb.net/";
const DB_NAME = process.env.DB_NAME || "auditoria_db";

let client = null;
let db = null;

async function connectDB() {
  if (db) {
    return db;
  }

  const nuevoCliente = new MongoClient(MONGO_URI);
  await nuevoCliente.connect();
  client = nuevoCliente;
  db = client.db(DB_NAME);
  console.log("[Auditoria] Conectado a MongoDB");
  return db;
}

async function closeDB() {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

module.exports = {
  connectDB,
  closeDB,
  getDb: () => db
};
