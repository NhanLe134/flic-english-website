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

async function run() {
  try {
    const pool = await sql.connect(config);
    console.log("Connected to SQL Server");
    
    // Check columns of TAILIEU
    let result = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'TAILIEU'
    `);
    console.log("TAILIEU columns:", result.recordset);

    // Let's find lessons (buoihoc) and corresponding tailieu
    result = await pool.request().query(`
      SELECT TOP 10 * FROM BUOIHOC
    `);
    console.log("BUOIHOC list:", result.recordset);

    result = await pool.request().query(`
      SELECT TOP 10 * FROM TAILIEU
    `);
    console.log("TAILIEU rows:", result.recordset);

    await sql.close();
  } catch (err) {
    console.error(err);
  }
}

run();
