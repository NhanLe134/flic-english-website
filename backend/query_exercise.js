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

async function main() {
  try {
    const pool = await sql.connect(config);
    console.log("Connected to DB!");
    
    const result = await pool.request()
      .query("SELECT * FROM BAITAP WHERE MaBaiTap = 26");
    console.log("=== Exercise 26 in BAITAP ===");
    console.log(result.recordset);

    const examResult = await pool.request()
      .query("SELECT * FROM BAIKIEMTRA WHERE MaBaiKiemTra = 26");
    console.log("=== Exercise 26 in BAIKIEMTRA ===");
    console.log(examResult.recordset);

    const practiceResult = await pool.request()
      .query("SELECT * FROM LUYENTAPTHEM WHERE MaLuyenTapThem = 26");
    console.log("=== Exercise 26 in LUYENTAPTHEM ===");
    console.log(practiceResult.recordset);
    
    await sql.close();
  } catch (err) {
    console.error("Error:", err);
  }
}

main();
