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

    // Giả lập dữ liệu gửi lên từ frontend
    const TieuDe = "Bài thi thử đầu khóa";
    const MoTa = "đây là bài làm kiểm tra đánh giá năng lực đầu vào của học viên";
    const ThoiGian = 90;
    const CapDo = "B1";
    const LoaiBai = "VSTEP";
    const NoiDungDeThi = JSON.stringify({
      listening: { parts: [] },
      reading: { parts: [] },
      writing: { parts: [] },
      speaking: { parts: [] }
    });
    const TrangThai = "published";
    const MaNguoiDung = 6; // QTV
    
    // Tìm MaVaiTro
    const userRoleResult = await pool.request()
      .input("MaNguoiDung", MaNguoiDung)
      .query("SELECT MaVaiTro FROM NGUOIDUNG WHERE MaNguoiDung = @MaNguoiDung");

    console.log("User role result:", userRoleResult.recordset);

    if (userRoleResult.recordset.length === 0) {
      console.log("Error: Không tìm thấy người tạo");
      await sql.close();
      return;
    }

    const maVaiTro = userRoleResult.recordset[0].MaVaiTro;
    const trangThaiDuyet = (maVaiTro === 4) ? 'Đã duyệt' : 'Chờ duyệt';

    console.log("maVaiTro:", maVaiTro, "trangThaiDuyet:", trangThaiDuyet);

    const insertResult = await pool.request()
      .input("TieuDe", TieuDe)
      .input("MoTa", MoTa)
      .input("ThoiGian", ThoiGian)
      .input("CapDo", CapDo)
      .input("LoaiBai", LoaiBai)
      .input("NoiDungDeThi", NoiDungDeThi)
      .input("TrangThai", TrangThai)
      .input("TrangThaiDuyet", trangThaiDuyet)
      .input("MaNguoiDung", MaNguoiDung)
      .query(`
        INSERT INTO DETHI (TieuDe, MoTa, ThoiGian, CapDo, LoaiBai, NoiDungDeThi, TrangThai, TrangThaiDuyet, MaNguoiDung, NgayTao)
        OUTPUT INSERTED.MaDeThi
        VALUES (@TieuDe, @MoTa, @ThoiGian, @CapDo, @LoaiBai, @NoiDungDeThi, @TrangThai, @TrangThaiDuyet, @MaNguoiDung, GETDATE())
      `);

    console.log("Insert result:", insertResult.recordset);

    await sql.close();
  } catch (err) {
    console.error("LỖI THẬT SỰ CỦA SQL SERVER:", err);
  }
}

run();
