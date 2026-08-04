const { poolPromise } = require("./config/db");
const bcrypt = require("bcryptjs");

async function run() {
  try {
    console.log("Connecting to Database...");
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT MaNguoiDung, TenDangNhap, MatKhau FROM NGUOIDUNG");
    console.log(`Found ${result.recordset.length} users in NGUOIDUNG.`);
    
    let count = 0;
    for (const user of result.recordset) {
      if (user.MatKhau && !user.MatKhau.startsWith("$2a$") && !user.MatKhau.startsWith("$2b$")) {
        const hashed = bcrypt.hashSync(user.MatKhau, 10);
        await pool.request()
          .input("id", user.MaNguoiDung)
          .input("hashed", hashed)
          .query("UPDATE NGUOIDUNG SET MatKhau = @hashed WHERE MaNguoiDung = @id");
        console.log(`Migrated user [${user.TenDangNhap}] (ID: ${user.MaNguoiDung})`);
        count++;
      }
    }
    console.log(`SUCCESS: Migrated ${count} unhashed password(s) to bcrypt hash!`);
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

run();
