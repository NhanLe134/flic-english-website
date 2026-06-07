const sql = require("mssql");

const config = {
  user: "sa",
  password: "123456Aa",
  server: "14.225.192.252:1433",
  database: "WebHocTiengAnh",
  authentication: {
    type: "default"
  },
  options: {
    encrypt: true,
    trustServerCertificate: true,
    enableKeepAlive: true,
    trustServerCertificateCA: undefined
  }
};

async function testDelete() {
  try {
    const pool = new sql.ConnectionPool(config);
    await pool.connect();
    console.log("✓ Kết nối database thành công");

    // Tìm Võ Minh Phúc
    const result = await pool.request()
      .query(`SELECT * FROM NGUOIDUNG WHERE HoTen = N'Võ Minh Phúc'`);
    
    if (result.recordset.length === 0) {
      console.log("✗ Không tìm thấy người dùng 'Võ Minh Phúc'");
      await pool.close();
      return;
    }

    const user = result.recordset[0];
    const id = user.MaNguoiDung;
    console.log(`\nTìm thấy: ${user.HoTen} (ID: ${id})`);
    console.log(`Trạng thái: ${user.TrangThai}`);

    // Lấy MaSinhVien
    const svResult = await pool.request().input("id", id)
      .query(`SELECT * FROM SINHVIEN WHERE MaNguoiDung=@id`);
    
    if (svResult.recordset.length > 0) {
      const maSinhVien = svResult.recordset[0].MaSinhVien;
      console.log(`\n✓ Là sinh viên: ${maSinhVien}`);

      // Kiểm tra SINHVIEN_LOPHOC
      const slResult = await pool.request().input("maSinhVien", maSinhVien)
        .query(`SELECT COUNT(*) as cnt FROM SINHVIEN_LOPHOC WHERE MaSinhVien=@maSinhVien`);
      console.log(`  - SINHVIEN_LOPHOC: ${slResult.recordset[0].cnt} bản ghi`);

      // Kiểm tra BAINOP
      const baResult = await pool.request().input("maSinhVien", maSinhVien)
        .query(`SELECT COUNT(*) as cnt FROM BAINOP WHERE MaSinhVien=@maSinhVien`);
      console.log(`  - BAINOP: ${baResult.recordset[0].cnt} bản ghi`);

      // Thử xóa
      console.log("\n[TEST] Bắt đầu xóa...");
      
      try {
        await pool.request().input("maSinhVien", maSinhVien)
          .query(`DELETE FROM SINHVIEN_LOPHOC WHERE MaSinhVien=@maSinhVien`);
        console.log("✓ Xóa SINHVIEN_LOPHOC thành công");
      } catch (e) {
        console.log(`✗ Lỗi xóa SINHVIEN_LOPHOC: ${e.message}`);
      }

      try {
        await pool.request().input("maSinhVien", maSinhVien)
          .query(`DELETE FROM BAINOP WHERE MaSinhVien=@maSinhVien`);
        console.log("✓ Xóa BAINOP thành công");
      } catch (e) {
        console.log(`✗ Lỗi xóa BAINOP: ${e.message}`);
      }

      try {
        await pool.request().input("id", id)
          .query(`DELETE FROM SINHVIEN WHERE MaNguoiDung=@id`);
        console.log("✓ Xóa SINHVIEN thành công");
      } catch (e) {
        console.log(`✗ Lỗi xóa SINHVIEN: ${e.message}`);
      }
    }

    // Xóa người dùng
    try {
      await pool.request().input("id", id)
        .query(`DELETE FROM NGUOIDUNG WHERE MaNguoiDung=@id`);
      console.log("✓ Xóa NGUOIDUNG thành công");

      // Kiểm tra xem còn không
      const check = await pool.request().input("id", id)
        .query(`SELECT COUNT(*) as cnt FROM NGUOIDUNG WHERE MaNguoiDung=@id`);
      if (check.recordset[0].cnt === 0) {
        console.log("\n✓✓✓ Xóa hoàn toàn thành công!");
      }
    } catch (e) {
      console.log(`✗ Lỗi xóa NGUOIDUNG: ${e.message}`);
    }

    await pool.close();
  } catch (err) {
    console.error("Lỗi:", err.message);
  }
}

testDelete();
