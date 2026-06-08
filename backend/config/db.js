const sql = require("mssql/msnodesqlv8");

const config = {
  connectionString: "Driver={ODBC Driver 17 for SQL Server};Server=WINDOWS-10\\SQLEXPRESS;Database=Website;Trusted_Connection=yes;",
  
  options: {
    enableArithAbort: true,
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