const sql = require("mssql");

const dbConfig = {
  user: "team3",
  password: "FLIC@2026!218",
  server: "14.225.192.252",
  database: "WebHocTiengAnh",
  port: 1433,
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

const poolPromise = new sql.ConnectionPool(dbConfig)
  .connect()
  .then(pool => {
    console.log("Connected to SQL Server");
    return pool;
  })
  .catch(err => {
    console.error("Database connection failed!", err);
    throw err;
  });

module.exports = {
  sql,
  poolPromise
};