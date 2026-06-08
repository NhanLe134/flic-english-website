const sql = require("mssql");

const config = {
  user: 'team3',
  password: 'FLIC@2026!218',
  server: '14.225.192.252',
  database: 'WebHocTiengAnh',
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log("Connected to SQL Server");
    return pool;
  })
  .catch(err => console.log("Database connection failed!", err));

module.exports = { sql, poolPromise };
