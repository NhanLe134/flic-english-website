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
    
    // Check columns of LOPHOC
    let result = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'LOPHOC'
    `);
    console.log("LOPHOC columns:", result.recordset);

    // Check columns of KHOAHOC
    result = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'KHOAHOC'
    `);
    console.log("KHOAHOC columns:", result.recordset);

    // Let's also check if there are other columns, or search the whole database schema for columns containing 'HocThu'
    result = await pool.request().query(`
      SELECT TABLE_NAME, COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE COLUMN_NAME LIKE '%HocThu%' OR COLUMN_NAME LIKE '%Free%' OR COLUMN_NAME LIKE '%Trial%'
    `);
    console.log("Matching columns across all tables:", result.recordset);

    await sql.close();
  } catch (err) {
    console.error(err);
  }
}

run();
