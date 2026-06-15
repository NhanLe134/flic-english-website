const { poolPromise } = require("./config/db.js");

async function checkKhoahoc() {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT MaKhoaHoc, TenKhoaHoc, TrangThai FROM KHOAHOC");
    console.log("KHOAHOC status:", result.recordset);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkKhoahoc();
