const { poolPromise } = require("./config/db.js");

async function checkExactTeacherQueries() {
  try {
    const pool = await poolPromise;
    const teachers = [4, 9, 33, 37];
    
    for (const uid of teachers) {
      console.log(`\n--- UID: ${uid} ---`);
      
      // 1. Course Query
      const courses = await pool.request()
        .input("maNguoiDung", uid)
        .query(`
          SELECT
            k.MaKhoaHoc,
            k.TenKhoaHoc,
            k.TrinhDo,
            COUNT(DISTINCT d.MaDangKy) AS SoHocVien
          FROM KHOAHOC k
          LEFT JOIN DANGKYKHOAHOC d ON k.MaKhoaHoc = d.MaKhoaHoc
          INNER JOIN KHOAHOCCHITIET kc ON k.MaKhoaHoc = kc.MaKhoaHoc
          INNER JOIN LOPHOC l ON kc.MaLop = l.MaLop
          INNER JOIN PHANCONGGIANGVIEN p ON l.MaLopHoc = p.MaLopHoc
          INNER JOIN GIANGVIEN g ON p.MaGiangVien = g.MaGiangVien
          WHERE g.MaNguoiDung = @maNguoiDung
            AND k.TrangThai = N'Đã duyệt'
          GROUP BY k.MaKhoaHoc, k.TenKhoaHoc, k.TrinhDo
        `);
      console.log("Courses:", courses.recordset);

      // 2. Class Query
      const classes = await pool.request()
        .input("maNguoiDung", uid)
        .query(`
          SELECT DISTINCT
            l.MaLopHoc, l.TenLop, l.LichHoc,
            l.SoLuongHocVien,
            k.TenKhoaHoc
          FROM LOPHOC l
          JOIN PHANCONGGIANGVIEN pc ON l.MaLopHoc = pc.MaLopHoc
          JOIN GIANGVIEN g ON pc.MaGiangVien = g.MaGiangVien
          JOIN KHOAHOCCHITIET kc ON l.MaLop = kc.MaLop
          JOIN KHOAHOC k ON kc.MaKhoaHoc = k.MaKhoaHoc
          WHERE g.MaNguoiDung = @maNguoiDung
            AND k.TrangThai = N'Đã duyệt'
        `);
      console.log("Classes:", classes.recordset);
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkExactTeacherQueries();
