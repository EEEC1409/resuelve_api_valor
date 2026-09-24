const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST || "postgres",
  port: parseInt(process.env.DB_PORT || "5432", 10),
  user: process.env.DB_USER || "resuelve_user",
  password: process.env.DB_PASSWORD || "resuelve_pass",
  database: process.env.DB_NAME || "resuelve_db"
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
