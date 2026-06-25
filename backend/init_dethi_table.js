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
    console.log("Connected to SQL Server remote successfully!");

    await pool.request().query("DELETE FROM DETHI WHERE TieuDe = N'Bài thi thử đầu khóa'");
    console.log("Đã xóa đề thi thử nghiệm rác khỏi database thành công.");

    await sql.close();
  } catch (err) {
    console.error("Lỗi:", err.message);
  }
}

run();
