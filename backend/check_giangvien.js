const { poolPromise } = require("./config/db.js");

async function checkTeacherQueries() {
  try {
    const pool = await poolPromise;
    
    // 1. Check if there are any users with role Lecturer (Giảng viên)
    const teachers = await pool.request().query(`
      SELECT n.MaNguoiDung, n.HoTen, n.TenDangNhap, g.MaGiangVien
      FROM NGUOIDUNG n
      JOIN GIANGVIEN g ON n.MaNguoiDung = g.MaNguoiDung
    `);
    console.log("Teachers in DB:", teachers.recordset);
    
    for (const teacher of teachers.recordset) {
      const maNguoiDung = teacher.MaNguoiDung;
      console.log(`\nTesting course query for ${teacher.HoTen} (MaNguoiDung = ${maNguoiDung}):`);
      
      const courses = await pool.request()
        .input("maNguoiDung", maNguoiDung)
        .query(`
          SELECT
            k.MaKhoaHoc,
            k.TenKhoaHoc,
            k.TrinhDo
          FROM KHOAHOC k
          INNER JOIN KHOAHOCCHITIET kc ON k.MaKhoaHoc = kc.MaKhoaHoc
          INNER JOIN LOPHOC l ON kc.MaLop = l.MaLop
          INNER JOIN PHANCONGGIANGVIEN p ON l.MaLopHoc = p.MaLopHoc
          INNER JOIN GIANGVIEN g ON p.MaGiangVien = g.MaGiangVien
          WHERE g.MaNguoiDung = @maNguoiDung
        `);
      console.log("Courses found:", courses.recordset);
    }
    
    // Let's see what tables exist and check their records
    const lh = await pool.request().query("SELECT TOP 5 * FROM LOPHOC");
    console.log("\nSample LOPHOC:", lh.recordset);
    
    const kc = await pool.request().query("SELECT TOP 5 * FROM KHOAHOCCHITIET");
    console.log("\nSample KHOAHOCCHITIET:", kc.recordset);
    
    const pc = await pool.request().query("SELECT TOP 5 * FROM PHANCONGGIANGVIEN");
    console.log("\nSample PHANCONGGIANGVIEN:", pc.recordset);

    process.exit(0);
  } catch (err) {
    console.error("Error running check:", err.message);
    process.exit(1);
  }
}

checkTeacherQueries();
