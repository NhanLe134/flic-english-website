const sql = require("mssql/msnodesqlv8");

const config = {
  server: "ThanhNhan",
  database: "Website",
  driver: "msnodesqlv8",
  options: {
    trustedConnection: true
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