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
    
    // Check LOPHOC rows
    let result = await pool.request().query(`
      SELECT * FROM LOPHOC
    `);
    console.log("LOPHOC rows:", result.recordset);

    await sql.close();
  } catch (err) {
    console.error(err);
  }
}

run();
