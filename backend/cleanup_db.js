const { poolPromise } = require("./config/db.js");

async function cleanup() {
  try {
    const pool = await poolPromise;
    console.log("Connected to SQL Server for cleanup...");

    // 1. Delete student submissions related to mock exercises
    const r1 = await pool.request().query(`
      DELETE FROM BAINOP 
      WHERE MaBaiTap IN (
        SELECT MaBaiTap FROM BAITAP WHERE Title LIKE '%[MOCK]%' OR Title LIKE '%Grammar Quiz: Conditional Sentences%'
      )
    `);
    console.log(`Deleted BAINOP records: ${r1.rowsAffected}`);
    
    // 2. Delete mock exercises by title
    const r2 = await pool.request().query(`
      DELETE FROM BAITAP WHERE Title LIKE '%[MOCK]%' OR Title LIKE '%Grammar Quiz: Conditional Sentences%'
    `);
    console.log(`Deleted BAITAP records: ${r2.rowsAffected}`);

    // 3. Resolve mock classes to perform cascading deletes on lessons and lectures
    const mockClassIds = await pool.request().query("SELECT MaLopHoc FROM LOPHOC WHERE TenLop LIKE '%[MOCK]%'");
    const classIds = mockClassIds.recordset.map(r => r.MaLopHoc);
    
    if (classIds.length > 0) {
      const idsStr = classIds.join(",");
      
      // Delete comments, progress, exercises, and lectures that reference the mock lessons
      await pool.request().query(`
        DELETE FROM BINHLUAN 
        WHERE MaBaiHoc IN (
          SELECT MaBaiHoc FROM BAIHOCKHOAHOC 
          WHERE MaBuoiHoc IN (SELECT MaBuoiHoc FROM BUOIHOC WHERE MaLopHoc IN (${idsStr}))
        )
      `);
      
      await pool.request().query(`
        DELETE FROM TIENDOHOCTAP 
        WHERE MaBaiHoc IN (
          SELECT MaBaiHoc FROM BAIHOCKHOAHOC 
          WHERE MaBuoiHoc IN (SELECT MaBuoiHoc FROM BUOIHOC WHERE MaLopHoc IN (${idsStr}))
        )
      `);

      await pool.request().query(`
        DELETE FROM BAINOP 
        WHERE MaBaiTap IN (
          SELECT MaBaiTap FROM BAITAP 
          WHERE MaBaiHoc IN (
            SELECT MaBaiHoc FROM BAIHOCKHOAHOC 
            WHERE MaBuoiHoc IN (SELECT MaBuoiHoc FROM BUOIHOC WHERE MaLopHoc IN (${idsStr}))
          )
        )
      `);

      await pool.request().query(`
        DELETE FROM BAITAP 
        WHERE MaBaiHoc IN (
          SELECT MaBaiHoc FROM BAIHOCKHOAHOC 
          WHERE MaBuoiHoc IN (SELECT MaBuoiHoc FROM BUOIHOC WHERE MaLopHoc IN (${idsStr}))
        )
      `);

      await pool.request().query(`
        DELETE FROM BAIHOCKHOAHOC 
        WHERE MaBuoiHoc IN (SELECT MaBuoiHoc FROM BUOIHOC WHERE MaLopHoc IN (${idsStr}))
      `);

      // Cascading delete mock exams
      await pool.request().query(`
        DELETE FROM DAPAN WHERE MaCauHoi IN (
          SELECT MaCauHoi FROM CAUHOI WHERE MaBaiKiemTra IN (
            SELECT MaBaiKiemTra FROM BAIKIEMTRA WHERE MaBuoiHoc IN (
              SELECT MaBuoiHoc FROM BUOIHOC WHERE MaLopHoc IN (${idsStr})
            )
          )
        )
      `);

      await pool.request().query(`
        DELETE FROM CAUHOI WHERE MaBaiKiemTra IN (
          SELECT MaBaiKiemTra FROM BAIKIEMTRA WHERE MaBuoiHoc IN (
            SELECT MaBuoiHoc FROM BUOIHOC WHERE MaLopHoc IN (${idsStr})
          )
        )
      `);

      await pool.request().query(`
        DELETE FROM KETQUABAIKIEMTRA WHERE MaBaiKiemTra IN (
          SELECT MaBaiKiemTra FROM BAIKIEMTRA WHERE MaBuoiHoc IN (
            SELECT MaBuoiHoc FROM BUOIHOC WHERE MaLopHoc IN (${idsStr})
          )
        )
      `);

      await pool.request().query(`
        DELETE FROM BAIKIEMTRA WHERE MaBuoiHoc IN (
          SELECT MaBuoiHoc FROM BUOIHOC WHERE MaLopHoc IN (${idsStr})
        )
      `);

      await pool.request().query(`DELETE FROM PHANCONGGIANGVIEN WHERE MaLopHoc IN (${idsStr})`);
      await pool.request().query(`DELETE FROM SINHVIEN_LOPHOC WHERE MaLopHoc IN (${idsStr})`);
      await pool.request().query(`DELETE FROM BUOIHOC WHERE MaLopHoc IN (${idsStr})`);
      const rClass = await pool.request().query(`DELETE FROM LOPHOC WHERE MaLopHoc IN (${idsStr})`);
      console.log(`Deleted mock classes and all cascading references: ${rClass.rowsAffected}`);
    }

    // 4. Delete mock lectures by title (fallback)
    await pool.request().query(`
      DELETE FROM BAIHOCKHOAHOC WHERE TieuDe LIKE '%[MOCK]%'
    `);

    // 5. Delete mock courses (KHOAHOC)
    const r4 = await pool.request().query(`
      DELETE FROM KHOAHOC WHERE TenKhoaHoc LIKE '%[MOCK]%'
    `);
    console.log(`Deleted mock courses: ${r4.rowsAffected}`);

    // 6. Clean up mock student account and classroom enrollment if created
    const mockStudentUser = await pool.request().query("SELECT MaNguoiDung FROM NGUOIDUNG WHERE TenDangNhap = 'hocvien_mock'");
    if (mockStudentUser.recordset.length > 0) {
      const studentUid = mockStudentUser.recordset[0].MaNguoiDung;
      await pool.request().input("uid", studentUid).query(`
        DELETE FROM SINHVIEN_LOPHOC WHERE MaSinhVien = 'SV_MOCK_TEST';
        DELETE FROM SINHVIEN WHERE MaNguoiDung = @uid;
        DELETE FROM NGUOIDUNG WHERE MaNguoiDung = @uid;
      `);
      console.log("Cleaned up mock student user account.");
    }

    // 7. Remove custom SV_MOCK_STUDENT mapping if created
    await pool.request().query(`
      DELETE FROM SINHVIEN_LOPHOC WHERE MaSinhVien = 'SV_MOCK_STUDENT';
      DELETE FROM SINHVIEN WHERE MaSinhVien = 'SV_MOCK_STUDENT';
    `);
    console.log("Cleaned up custom SV_MOCK_STUDENT mapping.");

    console.log("✅ Cleanup finished successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Cleanup failed:", err);
    process.exit(1);
  }
}

cleanup();
