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

    console.log("--- SUBMISSIONS IN BAINOP TODAY ---");
    const bnRes = await pool.request().query("SELECT * FROM BAINOP WHERE CAST(NgayNop AS DATE) = CAST(GETDATE() AS DATE)");
    console.log(bnRes.recordset);

    console.log("--- SUBMISSIONS IN KETQUABAIKIEMTRA TODAY ---");
    const kqbktRes = await pool.request().query("SELECT * FROM KETQUABAIKIEMTRA WHERE CAST(ThoiGianLamBai AS DATE) = CAST(GETDATE() AS DATE)");
    console.log(kqbktRes.recordset);

    await sql.close();
  } catch (err) {
    console.error(err);
  }
}

run();
