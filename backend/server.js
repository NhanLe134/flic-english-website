const express = require("express");
const cors = require("cors");
const { poolPromise } = require("./config/db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer")

const app = express();

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
});
// Tạo thư mục uploads nếu chưa có
if (!fs.existsSync("./uploads")) {
  fs.mkdirSync("./uploads");
}
// ===== MULTER - ĐẶT Ở ĐÂY TRƯỚC KHI DÙNG =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, "-");
    cb(null, Date.now() + "-" + safeName);
  }
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = [
      "image/jpeg", "image/png", "image/gif", "image/webp",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "audio/mpeg", "audio/wav", "audio/mp4", "audio/x-m4a",
      "video/mp4", "video/webm", "video/ogg", "video/quicktime"
    ];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("File không hợp lệ"));
  }
});
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Không có file" });
  res.json({ filename: req.file.filename, url: `/uploads/${req.file.filename}` });
});
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.get("/", (req, res) => res.send("Backend running..."));
app.get("/users", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT * FROM NGUOIDUNG");
    res.json(result.recordset);
  } catch (err) { res.status(500).send(err.message); }
});
app.put("/users/:maNguoiDung/anh-dai-dien", async (req, res) => {
  try {
    const { AnhDaiDien } = req.body;
    const pool = await poolPromise;
    await pool.request()
      .input("maNguoiDung", req.params.maNguoiDung)
      .input("AnhDaiDien", AnhDaiDien || null)
      .query("UPDATE NGUOIDUNG SET AnhDaiDien = @AnhDaiDien WHERE MaNguoiDung = @maNguoiDung");
    res.json({ message: "Cập nhật ảnh đại diện thành công" });
  } catch (err) { res.status(500).send(err.message); }
});
app.post("/register", async (req, res) => {
  try {
    const { username, password, name, email, ngaySinh, gioiTinh } = req.body
    const pool = await poolPromise;
    await pool.request()
      .input("username", username)
      .input("password", password)
      .input("name", name)
      .input("email", email)
      .input("ngaySinh", ngaySinh || null)   // ← thêm
      .query(`INSERT INTO NGUOIDUNG (TenDangNhap, MatKhau, HoTen, Email, NgaySinh, TrangThai, NgayTao)
              VALUES (@username, @password, @name, @email, @ngaySinh, 'active', GETDATE())`);
    res.json({ message: "Đăng ký thành công" });
  } catch (err) { res.status(500).send(err.message); }
});
app.get("/users/role/:maNguoiDung", async (req, res) => {
  try {
    const pool = await poolPromise
    const result = await pool.request()
      .input("id", req.params.maNguoiDung)
      .query(`
        SELECT 
          CASE
            WHEN a.MaNguoiDung IS NOT NULL THEN N'Quản Trị Viên'
            WHEN g.MaNguoiDung IS NOT NULL THEN N'Giảng Viên'
            WHEN q.MaNguoiDung IS NOT NULL THEN N'Quản Trị Nội Dung'
            ELSE N'Học Viên'
          END AS VaiTro
        FROM NGUOIDUNG n
        LEFT JOIN ADMIN a ON n.MaNguoiDung = a.MaNguoiDung
        LEFT JOIN GIANGVIEN g ON n.MaNguoiDung = g.MaNguoiDung
        LEFT JOIN QUANTRIVIENNOIDUNG q ON n.MaNguoiDung = q.MaNguoiDung
        WHERE n.MaNguoiDung = @id
      `)
    res.json(result.recordset[0] || { VaiTro: "Học Viên" })
  } catch (err) { res.status(500).send(err.message) }
})

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const pool = await poolPromise;
    const result = await pool.request()
      .input("username", username).input("password", password)
      .query(`SELECT * FROM NGUOIDUNG WHERE TenDangNhap=@username AND MatKhau=@password`);
    if (result.recordset.length === 0)
      return res.status(401).json({ message: "Sai tài khoản hoặc mật khẩu" });
    res.json(result.recordset[0]);
  } catch (err) { res.status(500).send(err.message); }
});

app.get("/courses", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`SELECT MaKhoaHoc, TenKhoaHoc, MoTa, TrinhDo FROM KHOAHOC ORDER BY NgayTao DESC`);
    res.json(result.recordset);
  } catch (err) { res.status(500).send(err.message); }
});

app.get("/courses/:id/details", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("courseId", req.params.id)
      .query(`SELECT MaLop, TenLop, MoTa, HocPhi, ThoiLuong FROM KHOAHOCCHITIET WHERE MaKhoaHoc = @courseId`);
    res.json(result.recordset);
  } catch (err) { res.status(500).send(err.message); }
});

app.post("/register-course", async (req, res) => {
  try {
    const { maKhoaHoc, maSinhVien } = req.body;
    if (!maKhoaHoc || !maSinhVien) return res.status(400).json({ message: "Thiếu dữ liệu" });
    const pool = await poolPromise;
    const check = await pool.request()
      .input("maKhoaHoc", maKhoaHoc).input("maSinhVien", maSinhVien)
      .query(`SELECT * FROM DANGKYKHOAHOC WHERE MaKhoaHoc=@maKhoaHoc AND MaSinhVien=@maSinhVien`);
    if (check.recordset.length > 0) return res.json({ message: "Sinh viên đã đăng ký khóa học này rồi" });
    await pool.request()
      .input("maKhoaHoc", maKhoaHoc).input("maSinhVien", maSinhVien)
      .query(`INSERT INTO DANGKYKHOAHOC (MaKhoaHoc, MaSinhVien, NgayDangKy, TrangThai) VALUES (@maKhoaHoc, @maSinhVien, GETDATE(), N'Đã đăng ký')`);
    res.json({ message: "Đăng ký khóa học thành công" });
  } catch (err) { res.status(500).send(err.message); }
});
// Tạo khóa học mới
app.post("/qtv/khoahoc", async (req, res) => {
  const { TenKhoaHoc, MoTa, TrinhDo, MaNguoiDung, KyNang, Listening, Reading, Speaking, Writing } = req.body
  try {
    const pool = await poolPromise
    const result = await pool.request()
      .input("TenKhoaHoc", TenKhoaHoc)
      .input("MoTa", MoTa || "")
      .input("TrinhDo", TrinhDo || "")
      .input("KyNang", KyNang || null)
      .input("Listening", Listening !== undefined ? Number(Listening) : 0)
      .input("Reading", Reading !== undefined ? Number(Reading) : 0)
      .input("Speaking", Speaking !== undefined ? Number(Speaking) : 0)
      .input("Writing", Writing !== undefined ? Number(Writing) : 0)
      .input("MaNguoiDung", MaNguoiDung)
      .query(`
        INSERT INTO KHOAHOC (TenKhoaHoc, MoTa, TrinhDo, KyNang, Listening, Reading, Speaking, Writing, TrangThai, MaNguoiDung, NgayTao)
        OUTPUT INSERTED.MaKhoaHoc
        VALUES (@TenKhoaHoc, @MoTa, @TrinhDo, @KyNang, @Listening, @Reading, @Speaking, @Writing, 'Pending', @MaNguoiDung, GETDATE())
      `)
    const newId = result.recordset[0].MaKhoaHoc
    res.json({
      message: "Tạo thành công",
      MaKhoaHoc: newId
    })
  } catch (err) {
    console.error("❌ Lỗi tạo khóa học:", err)
    res.status(500).json({ message: "Lỗi server" })
  }
})

// Tạo lớp học và sao chép lộ trình
app.post("/qtv/lophoc", async (req, res) => {
  const { TenLop, MaLop, LichHoc, SoLuongHocVien, CopyFromClassId, teachers } = req.body
  try {
    const pool = await poolPromise
    
    // 1. Tạo lớp học mới và lấy ID vừa tạo
    const classResult = await pool.request()
      .input("TenLop", TenLop)
      .input("MaLop", MaLop)
      .input("LichHoc", LichHoc)
      .input("SoLuongHocVien", (SoLuongHocVien === undefined || SoLuongHocVien === null) ? null : SoLuongHocVien)
      .query(`
        INSERT INTO LOPHOC (TenLop, MaLop, LichHoc, SoLuongHocVien, TienDo) 
        VALUES (@TenLop, @MaLop, @LichHoc, @SoLuongHocVien, 0);
        SELECT SCOPE_IDENTITY() AS MaLopHoc;
      `)
    
    const newMaLopHoc = classResult.recordset[0].MaLopHoc

    // Phân công giáo viên cho từng kỹ năng
    if (teachers && typeof teachers === 'object') {
      for (const skillId in teachers) {
        const teacherId = teachers[skillId];
        if (teacherId) {
          await pool.request()
            .input("MaLopHoc", newMaLopHoc)
            .input("MaGiangVien", teacherId)
            .input("MaKyNang", Number(skillId))
            .query(`
              INSERT INTO PHANCONGGIANGVIEN (MaLopHoc, MaGiangVien, MaKyNang, NgayPhanCong)
              VALUES (@MaLopHoc, @MaGiangVien, @MaKyNang, GETDATE())
            `);
        }
      }
    }

    // 2. Nếu có yêu cầu sao chép lộ trình từ lớp cũ
    if (CopyFromClassId) {
      // Lấy toàn bộ các buổi học của lớp cũ
      const oldBuoiHocsResult = await pool.request()
        .input("CopyFromClassId", CopyFromClassId)
        .query(`SELECT * FROM BUOIHOC WHERE MaLopHoc = @CopyFromClassId`)

      for (const oldBuoiHoc of oldBuoiHocsResult.recordset) {
        // Tạo buổi học mới cho lớp mới
        const newBuoiHocResult = await pool.request()
          .input("TenBuoiHoc", oldBuoiHoc.TenBuoiHoc)
          .input("NewMaLopHoc", newMaLopHoc)
          .input("MoTa", oldBuoiHoc.MoTa || "")
          .input("NgayBatDau", oldBuoiHoc.NgayBatDau || null)
          .input("NgayKetThuc", oldBuoiHoc.NgayKetThuc || null)
          .input("ThuTu", oldBuoiHoc.ThuTu || 1)
          .query(`
            INSERT INTO BUOIHOC (TenBuoiHoc, MaLopHoc, MoTa, NgayBatDau, NgayKetThuc, ThuTu)
            VALUES (@TenBuoiHoc, @NewMaLopHoc, @MoTa, @NgayBatDau, @NgayKetThuc, @ThuTu);
            SELECT SCOPE_IDENTITY() AS MaBuoiHoc;
          `)
        
        const newMaBuoiHoc = newBuoiHocResult.recordset[0].MaBuoiHoc

        // Sao chép các bài giảng (BAIHOCKHOAHOC) thuộc buổi học cũ
        const oldLecturesResult = await pool.request()
          .input("OldMaBuoiHoc", oldBuoiHoc.MaBuoiHoc)
          .query(`SELECT * FROM BAIHOCKHOAHOC WHERE MaBuoiHoc = @OldMaBuoiHoc`)

        for (const oldLecture of oldLecturesResult.recordset) {
          const newLectureResult = await pool.request()
            .input("MaKhoaHoc", oldLecture.MaKhoaHoc)
            .input("MaGiangVien", oldLecture.MaGiangVien)
            .input("TieuDe", oldLecture.TieuDe)
            .input("NoiDung", oldLecture.NoiDung || "")
            .input("ThuTu", oldLecture.ThuTu || 1)
            .input("LoaiBaiHoc", oldLecture.LoaiBaiHoc)
            .input("ThoiLuong", oldLecture.ThoiLuong)
            .input("TrangThai", oldLecture.TrangThai || "draft")
            .input("NewMaBuoiHoc", newMaBuoiHoc)
            .input("FileUrl", oldLecture.FileUrl || null)
            .query(`
              INSERT INTO BAIHOCKHOAHOC (MaKhoaHoc, MaGiangVien, TieuDe, NoiDung, ThuTu, LoaiBaiHoc, ThoiLuong, TrangThai, MaBuoiHoc, FileUrl)
              VALUES (@MaKhoaHoc, @MaGiangVien, @TieuDe, @NoiDung, @ThuTu, @LoaiBaiHoc, @ThoiLuong, @TrangThai, @NewMaBuoiHoc, @FileUrl);
              SELECT SCOPE_IDENTITY() AS MaBaiHoc;
            `)

          const newMaBaiHoc = newLectureResult.recordset[0].MaBaiHoc

          // Sao chép bài tập (BAITAP) thuộc bài giảng cũ
          const oldBaiTapsResult = await pool.request()
            .input("OldMaBaiHoc", oldLecture.MaBaiHoc)
            .query(`
              SELECT 
                MaBaiTap, TieuDe AS Title, LaBaiKiemTra AS Type, NgayTao AS CreatedDate,
                NoiDung AS Content, CauHoi AS Questions, LinkAmThanh AS AudioUrl, HienThiDapAn AS ShowAnswer,
                TrangThai, TrangThaiDuyet, MaGiangVien
              FROM BAITAP 
              WHERE MaBaiHoc = @OldMaBaiHoc
            `)

          for (const oldBaiTap of oldBaiTapsResult.recordset) {
            await pool.request()
<<<<<<< Updated upstream
              .input("TieuDe", oldBaiTap.TieuDe)
              .input("NgayTao", oldBaiTap.NgayTao)
              .input("NewMaBaiHoc", newMaBaiHoc)
              .input("NoiDung", oldBaiTap.NoiDung)
              .input("CauHoi", oldBaiTap.CauHoi)
              .input("LinkAmThanh", oldBaiTap.LinkAmThanh)
              .input("HienThiDapAn", oldBaiTap.HienThiDapAn ? 1 : 0)
              .input("HocThuMienPhi", oldBaiTap.HocThuMienPhi ? 1 : 0)
              .input("LaBaiKiemTra", oldBaiTap.LaBaiKiemTra ? 1 : 0)
              .input("TrangThai", oldBaiTap.TrangThai || "draft")
              .input("KyNang", oldBaiTap.KyNang || null)
              .input("DangBai", oldBaiTap.DangBai || null)
              .input("MaGiangVien", oldBaiTap.MaGiangVien || null)
              .input("FileDinhKem", oldBaiTap.FileDinhKem || null)
              .query(`
                INSERT INTO BAITAP (TieuDe, NgayTao, MaBaiHoc, NoiDung, CauHoi, LinkAmThanh, HienThiDapAn, HocThuMienPhi, LaBaiKiemTra, TrangThai, KyNang, DangBai, MaGiangVien, FileDinhKem)
                VALUES (@TieuDe, @NgayTao, @NewMaBaiHoc, @NoiDung, @CauHoi, @LinkAmThanh, @HienThiDapAn, @HocThuMienPhi, @LaBaiKiemTra, @TrangThai, @KyNang, @DangBai, @MaGiangVien, @FileDinhKem)
=======
              .input("Title", oldBaiTap.Title)
              .input("Type", oldBaiTap.Type ? 1 : 0)
              .input("CreatedDate", oldBaiTap.CreatedDate)
              .input("NewMaBaiHoc", newMaBaiHoc)
              .input("Content", oldBaiTap.Content || "")
              .input("Questions", oldBaiTap.Questions || "")
              .input("AudioUrl", oldBaiTap.AudioUrl || "")
              .input("ShowAnswer", oldBaiTap.ShowAnswer ? 1 : 0)
              .input("TrangThai", oldBaiTap.TrangThai || "published")
              .input("TrangThaiDuyet", oldBaiTap.TrangThaiDuyet || 'Đã duyệt')
              .input("MaGiangVien", oldBaiTap.MaGiangVien || 1)
              .query(`
                INSERT INTO BAITAP (TieuDe, LaBaiKiemTra, NgayTao, MaBaiHoc, NoiDung, CauHoi, LinkAmThanh, HienThiDapAn, TrangThai, TrangThaiDuyet, MaGiangVien)
                VALUES (@Title, @Type, @CreatedDate, @NewMaBaiHoc, @Content, @Questions, @AudioUrl, @ShowAnswer, @TrangThai, @TrangThaiDuyet, @MaGiangVien)
>>>>>>> Stashed changes
              `)
          }
        }

        // Sao chép bài kiểm tra (BAIKIEMTRA) trực tiếp thuộc buổi học cũ
        const oldExamsResult = await pool.request()
          .input("OldMaBuoiHoc", oldBuoiHoc.MaBuoiHoc)
          .query(`SELECT * FROM BAIKIEMTRA WHERE MaBuoiHoc = @OldMaBuoiHoc`)

        for (const oldExam of oldExamsResult.recordset) {
          const newExamResult = await pool.request()
            .input("NewMaBuoiHoc", newMaBuoiHoc)
            .input("MaGiangVien", oldExam.MaGiangVien)
            .input("TenBai", oldExam.TenBai)
            .input("ThoiGian", oldExam.ThoiGian)
            .input("TongDiem", oldExam.TongDiem)
            .query(`
              INSERT INTO BAIKIEMTRA (MaBuoiHoc, MaGiangVien, TenBai, ThoiGian, TongDiem)
              VALUES (@NewMaBuoiHoc, @MaGiangVien, @TenBai, @ThoiGian, @TongDiem);
              SELECT SCOPE_IDENTITY() AS NewMaBaiKiemTra;
            `)
          
          const newMaBaiKiemTra = newExamResult.recordset[0].NewMaBaiKiemTra;

          // Sao chép câu hỏi (CAUHOI) và đáp án (DAPAN) của bài kiểm tra cũ
          const oldQuestionsResult = await pool.request()
            .input("OldMaBaiKiemTra", oldExam.MaBaiKiemTra)
            .query(`SELECT * FROM CAUHOI WHERE MaBaiKiemTra = @OldMaBaiKiemTra`)

          for (const oldQ of oldQuestionsResult.recordset) {
            const newQResult = await pool.request()
              .input("NewMaBaiKiemTra", newMaBaiKiemTra)
              .input("NoiDung", oldQ.NoiDung)
              .input("DapAnDung", oldQ.DapAnDung)
              .input("LoaiCauHoi", oldQ.LoaiCauHoi)
              .query(`
                INSERT INTO CAUHOI (MaBaiKiemTra, NoiDung, DapAnDung, LoaiCauHoi)
                VALUES (@NewMaBaiKiemTra, @NoiDung, @DapAnDung, @LoaiCauHoi);
                SELECT SCOPE_IDENTITY() AS NewMaCauHoi;
              `)
            
            const newMaCauHoi = newQResult.recordset[0].NewMaCauHoi;

            const oldAnswersResult = await pool.request()
              .input("OldMaCauHoi", oldQ.MaCauHoi)
              .query(`SELECT * FROM DAPAN WHERE MaCauHoi = @OldMaCauHoi`)

            for (const oldAns of oldAnswersResult.recordset) {
              await pool.request()
                .input("NewMaCauHoi", newMaCauHoi)
                .input("NoiDung", oldAns.NoiDung)
                .input("LaDapAnDung", oldAns.LaDapAnDung)
                .query(`
                  INSERT INTO DAPAN (MaCauHoi, NoiDung, LaDapAnDung)
                  VALUES (@NewMaCauHoi, @NoiDung, @LaDapAnDung)
                `)
            }
          }
        }
      }
    }

    res.json({ message: "Tạo lớp thành công", MaLopHoc: newMaLopHoc })
  } catch (err) {
    console.error("Lỗi khi tạo và sao chép lớp học:", err)
    res.status(500).send(err.message)
  }
})

// Tạo buổi học
app.post("/qtv/buoihoc", async (req, res) => {
  const { TenBuoiHoc, MaLopHoc, MoTa, NgayBatDau, NgayKetThuc, ThuTu } = req.body
  const pool = await poolPromise
  await pool.request()
    .input("TenBuoiHoc", TenBuoiHoc).input("MaLopHoc", MaLopHoc)
    .input("MoTa", MoTa||"").input("NgayBatDau", NgayBatDau||null)
    .input("NgayKetThuc", NgayKetThuc||null).input("ThuTu", ThuTu||1)
    .query(`INSERT INTO BUOIHOC (TenBuoiHoc,MaLopHoc,MoTa,NgayBatDau,NgayKetThuc,ThuTu) VALUES (@TenBuoiHoc,@MaLopHoc,@MoTa,@NgayBatDau,@NgayKetThuc,@ThuTu)`)
  res.json({ message: "Thêm buổi thành công" })
})
// Lấy toàn bộ bài giảng (BAIHOCKHOAHOC) kèm thông tin giáo viên và khóa học phục vụ duyệt bài
app.get("/qtv/baigiang", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT b.MaBaiHoc, b.TieuDe, b.LoaiBaiHoc, b.ThoiLuong, b.TrangThai, b.NoiDung, b.FileUrl, b.MaKhoaHoc, b.MaGiangVien, b.MaBuoiHoc,
             n.HoTen AS TenGiangVien, k.TenKhoaHoc, k.TrinhDo AS CapDo,
             k.NgayTao AS NgayGui
      FROM BAIHOCKHOAHOC b
      LEFT JOIN GIANGVIEN gv ON b.MaGiangVien = gv.MaGiangVien
      LEFT JOIN NGUOIDUNG n ON gv.MaNguoiDung = n.MaNguoiDung
      LEFT JOIN KHOAHOC k ON b.MaKhoaHoc = k.MaKhoaHoc
      ORDER BY b.MaBaiHoc DESC
    `);
    res.json(result.recordset);
  } catch (err) { res.status(500).send(err.message); }
});
app.get("/my-courses/:maSinhVien", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("maSinhVien", req.params.maSinhVien)
      .query(`SELECT K.TenKhoaHoc, D.NgayDangKy, D.TrangThai FROM DANGKYKHOAHOC D JOIN KHOAHOC K ON D.MaKhoaHoc=K.MaKhoaHoc WHERE D.MaSinhVien=@maSinhVien ORDER BY D.NgayDangKy DESC`);
    res.json(result.recordset);
  } catch (err) { res.status(500).send(err.message); }
});

// Lấy danh sách giảng viên cho dropdown
app.get("/qtv/giangvien", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT g.MaGiangVien, g.MaNguoiDung, n.HoTen
      FROM GIANGVIEN g
      JOIN NGUOIDUNG n ON g.MaNguoiDung = n.MaNguoiDung
      ORDER BY n.HoTen
    `);
    res.json(result.recordset);
  } catch (err) { res.status(500).send(err.message); }
});
// Giảng viên chỉ thấy khóa học: đã duyệt + được assign cho họ
app.get("/teacher/courses/:maNguoiDung", async (req, res) => {
  try {
    const pool = await poolPromise
    const result = await pool.request()
      .input("maNguoiDung", req.params.maNguoiDung)
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
        GROUP BY k.MaKhoaHoc, k.TenKhoaHoc, k.TrinhDo
      `)
    res.json(result.recordset)
  } catch (err) { res.status(500).send(err.message) }
})
// Lấy danh sách GV đã phân công vào khóa học
app.get("/qtv/khoahoc/:id/giangvien", async (req, res) => {
  try {
    const pool = await poolPromise
    const result = await pool.request()
      .input("id", req.params.id)
      .query(`
        SELECT g.MaGiangVien, n.HoTen
        FROM PHANCONGGIANGVIEN p
        JOIN GIANGVIEN g ON p.MaGiangVien = g.MaGiangVien
        JOIN NGUOIDUNG n ON g.MaNguoiDung = n.MaNguoiDung
        WHERE p.MaKhoaHoc = @id
      `)
    res.json(result.recordset)
  } catch (err) { res.status(500).send(err.message) }
})

// Thêm GV vào khóa học
app.post("/qtv/khoahoc/:id/giangvien", async (req, res) => {
  try {
    const { MaGiangVien } = req.body
    const pool = await poolPromise

    // Bước 1: Tìm MaGiangVien thật từ MaNguoiDung
    const gvResult = await pool.request()
      .input("MaNguoiDung", MaGiangVien)
      .query(`SELECT MaGiangVien FROM GIANGVIEN WHERE MaNguoiDung = @MaNguoiDung`)

    console.log("GV found:", gvResult.recordset) // ← debug

    if (gvResult.recordset.length === 0)
      return res.status(404).json({ message: "Không tìm thấy giảng viên" })

    const maGiangVienReal = gvResult.recordset[0].MaGiangVien

    // Bước 2: Kiểm tra đã phân công chưa
    const check = await pool.request()
      .input("MaKhoaHoc", req.params.id)
      .input("MaGiangVien", maGiangVienReal)
      .query(`SELECT MaPhanCong FROM PHANCONGGIANGVIEN 
              WHERE MaKhoaHoc = @MaKhoaHoc AND MaGiangVien = @MaGiangVien`)

    if (check.recordset.length > 0)
      return res.json({ message: "Giảng viên đã được phân công" })

    // Bước 3: Insert
    await pool.request()
      .input("MaKhoaHoc", req.params.id)
      .input("MaGiangVien", maGiangVienReal)
      .query(`INSERT INTO PHANCONGGIANGVIEN (MaKhoaHoc, MaGiangVien, NgayPhanCong)
              VALUES (@MaKhoaHoc, @MaGiangVien, GETDATE())`)

    res.json({ message: "Đã phân công thành công" })
  } catch (err) {
    console.error("Lỗi phân công GV:", err.message) // ← xem lỗi thật ở terminal
    res.status(500).json({ message: err.message })  // ← trả JSON thay vì text
  }
})

// Xóa GV khỏi khóa học
app.delete("/qtv/khoahoc/:id/giangvien/:maGiangVien", async (req, res) => {
  try {
    const pool = await poolPromise
    await pool.request()
      .input("MaKhoaHoc", req.params.id)
      .input("MaGiangVien", req.params.maGiangVien)
      .query(`DELETE FROM PHANCONGGIANGVIEN WHERE MaKhoaHoc=@MaKhoaHoc AND MaGiangVien=@MaGiangVien`)
    res.json({ message: "Đã xóa" })
  } catch (err) { res.status(500).send(err.message) }
})

// Phân công GV vào lớp học
app.put("/qtv/lophoc/:id/giangvien", async (req, res) => {
  try {
    const { MaGiangVien } = req.body
    const pool = await poolPromise
    await pool.request()
      .input("id", req.params.id)
      .input("MaGiangVien", MaGiangVien || null)
      .query(`UPDATE LOPHOC SET MaGiangVien=@MaGiangVien WHERE MaLopHoc=@id`)
    res.json({ message: "Đã cập nhật" })
  } catch (err) { res.status(500).send(err.message) }
})

// Lấy lớp học kèm tên GV
app.get("/course-detail/:id/classes", async (req, res) => {
  try {
    const pool = await poolPromise
    const result = await pool.request()
      .input("id", req.params.id)
      .query(`
        SELECT 
          l.MaLopHoc, l.TenLop, l.LichHoc, l.HoanThanh, l.TrangThai, l.MaLop,
          l.SoLuongHocVien AS SiSoToiDa,
          COALESCE((
            SELECT TOP 1 
              CASE 
                WHEN (SELECT COUNT(*) FROM BUOIHOC WHERE MaLopHoc = l.MaLopHoc) = 0 THEN 0
                ELSE ROUND(CAST(active_bh.ThuTu AS FLOAT) / (SELECT COUNT(*) FROM BUOIHOC WHERE MaLopHoc = l.MaLopHoc) * 100, 0)
              END
            FROM BUOIHOC active_bh 
            WHERE active_bh.MaBuoiHoc = l.ActiveBuoiHocId
          ), 0) AS TienDo,
          COUNT(DISTINCT ls.MaBuoiHoc) AS SoBuoiHoc,
          (
            SELECT COUNT(*) FROM SINHVIEN_LOPHOC sl
            WHERE sl.MaLopHoc = l.MaLopHoc
          ) AS SoLuongHocVien
        FROM LOPHOC l
        JOIN KHOAHOCCHITIET kc ON l.MaLop = kc.MaLop
        LEFT JOIN BUOIHOC ls ON ls.MaLopHoc = l.MaLopHoc
        WHERE kc.MaKhoaHoc = @id
        GROUP BY l.MaLopHoc, l.TenLop, l.LichHoc, l.HoanThanh, l.TrangThai, l.SoLuongHocVien,
                 l.ActiveBuoiHocId, l.MaLop
      `)
    res.json(result.recordset)
  } catch (err) { res.status(500).send(err.message) }
})

app.get("/course-detail/:id/classes/:maNguoiDung", async (req, res) => {
  try {
    const pool = await poolPromise
    const result = await pool.request()
      .input("id", req.params.id)
      .input("maNguoiDung", req.params.maNguoiDung)
      .query(`
        SELECT DISTINCT
          l.MaLopHoc, l.TenLop, l.LichHoc,
          COALESCE((
            SELECT TOP 1 
              CASE 
                WHEN (SELECT COUNT(*) FROM BUOIHOC WHERE MaLopHoc = l.MaLopHoc) = 0 THEN 0
                ELSE ROUND(CAST(active_bh.ThuTu AS FLOAT) / (SELECT COUNT(*) FROM BUOIHOC WHERE MaLopHoc = l.MaLopHoc) * 100, 0)
              END
            FROM BUOIHOC active_bh 
            WHERE active_bh.MaBuoiHoc = l.ActiveBuoiHocId
          ), 0) AS TienDo,
          (
            SELECT COUNT(*) FROM SINHVIEN_LOPHOC sl
            WHERE sl.MaLopHoc = l.MaLopHoc
          ) AS SoLuongHocVien
        FROM LOPHOC l
        JOIN KHOAHOCCHITIET kc ON l.MaLop = kc.MaLop
        JOIN PHANCONGGIANGVIEN pc ON l.MaLopHoc = pc.MaLopHoc
        JOIN GIANGVIEN g ON pc.MaGiangVien = g.MaGiangVien
        WHERE kc.MaKhoaHoc = @id
          AND g.MaNguoiDung = @maNguoiDung
      `)
    res.json(result.recordset)
  } catch (err) { res.status(500).send(err.message) }
})
// Xóa lớp học
app.delete("/qtv/lophoc/:id", async (req, res) => {
  try {
    const pool = await poolPromise
    await pool.request()
      .input("id", req.params.id)
      .query(`
        -- 1. Xóa phân công giảng viên
        DELETE FROM PHANCONGGIANGVIEN WHERE MaLopHoc = @id;

        -- 2. Xóa ghi danh học viên lớp học
        DELETE FROM SINHVIEN_LOPHOC WHERE MaLopHoc = @id;

        -- 3. Xóa bài nộp của học viên trong lớp
        DELETE FROM BAINOP 
        WHERE MaBaiTap IN (
          SELECT MaBaiTap FROM BAITAP 
          WHERE MaBaiHoc IN (
            SELECT MaBaiHoc FROM BAIHOCKHOAHOC WHERE MaBuoiHoc IN (
              SELECT MaBuoiHoc FROM BUOIHOC WHERE MaLopHoc = @id
            )
          )
        );

        -- 4. Xóa bài tập
        DELETE FROM BAITAP 
        WHERE MaBaiHoc IN (
          SELECT MaBaiHoc FROM BAIHOCKHOAHOC WHERE MaBuoiHoc IN (
            SELECT MaBuoiHoc FROM BUOIHOC WHERE MaLopHoc = @id
          )
        );

        -- 5. Xóa đáp án bài kiểm tra thuộc buổi học trong lớp
        DELETE FROM DAPAN WHERE MaCauHoi IN (
          SELECT MaCauHoi FROM CAUHOI WHERE MaBaiKiemTra IN (
            SELECT MaBaiKiemTra FROM BAIKIEMTRA WHERE MaBuoiHoc IN (
              SELECT MaBuoiHoc FROM BUOIHOC WHERE MaLopHoc = @id
            )
          )
        );

        -- 6. Xóa câu hỏi bài kiểm tra thuộc buổi học trong lớp
        DELETE FROM CAUHOI WHERE MaBaiKiemTra IN (
          SELECT MaBaiKiemTra FROM BAIKIEMTRA WHERE MaBuoiHoc IN (
            SELECT MaBuoiHoc FROM BUOIHOC WHERE MaLopHoc = @id
          )
        );

        -- 7. Xóa kết quả bài kiểm tra thuộc buổi học trong lớp
        DELETE FROM KETQUABAIKIEMTRA WHERE MaBaiKiemTra IN (
          SELECT MaBaiKiemTra FROM BAIKIEMTRA WHERE MaBuoiHoc IN (
            SELECT MaBuoiHoc FROM BUOIHOC WHERE MaLopHoc = @id
          )
        );

        -- 8. Xóa bài kiểm tra thuộc buổi học trong lớp
        DELETE FROM BAIKIEMTRA WHERE MaBuoiHoc IN (
          SELECT MaBuoiHoc FROM BUOIHOC WHERE MaLopHoc = @id
        );

        -- 9. Nullify ActiveBuoiHocId in LOPHOC
        UPDATE LOPHOC SET ActiveBuoiHocId = NULL WHERE MaLopHoc = @id;

        -- 10. Nullify MaBuoiHoc in BAIHOCKHOAHOC
        UPDATE BAIHOCKHOAHOC SET MaBuoiHoc = NULL 
        WHERE MaBuoiHoc IN (
          SELECT MaBuoiHoc FROM BUOIHOC WHERE MaLopHoc = @id
        );

        -- 11. Xóa các buổi học (BUOIHOC)
        DELETE FROM BUOIHOC WHERE MaLopHoc = @id;

        -- 12. Xóa chính lớp học (LOPHOC)
        DELETE FROM LOPHOC WHERE MaLopHoc = @id;
      `)
    res.json({ message: "Đã xóa lớp học" })
  } catch (err) { res.status(500).send(err.message) }
})

// Cập nhật lớp học
app.put("/qtv/lophoc/:id", async (req, res) => {
  try {
    const { TenLop, LichHoc, SoLuongHocVien, HoanThanh, TrangThai, MaLop, teachers } = req.body
    const pool = await poolPromise
    
    // Nếu chỉ truyền HoanThanh (chế độ toggle nhanh)
    if (TenLop === undefined && HoanThanh !== undefined && teachers === undefined) {
      const statusStr = HoanThanh ? "Đã hoàn thành" : "Đang diễn ra";
      await pool.request()
        .input("id", req.params.id)
        .input("HoanThanh", HoanThanh ? 1 : 0)
        .input("TrangThai", statusStr)
        .query(`
          UPDATE LOPHOC 
          SET HoanThanh=@HoanThanh, TrangThai=@TrangThai
          WHERE MaLopHoc=@id
        `)
      return res.json({ message: "Cập nhật trạng thái hoàn thành thành công" })
    }

    const fieldsToUpdate = [];
    const updateRequest = pool.request();
    updateRequest.input("id", req.params.id);

    if (TenLop !== undefined) {
      updateRequest.input("TenLop", TenLop);
      fieldsToUpdate.push("TenLop = @TenLop");
    }
    if (LichHoc !== undefined) {
      updateRequest.input("LichHoc", LichHoc);
      fieldsToUpdate.push("LichHoc = @LichHoc");
    }
    if (SoLuongHocVien !== undefined) {
      updateRequest.input("SoLuongHocVien", SoLuongHocVien);
      fieldsToUpdate.push("SoLuongHocVien = @SoLuongHocVien");
    }
    if (MaLop !== undefined) {
      updateRequest.input("MaLop", MaLop);
      fieldsToUpdate.push("MaLop = @MaLop");
    }

    if (HoanThanh !== undefined || TrangThai !== undefined) {
      let finalHoanThanh;
      let finalTrangThai;

      if (TrangThai !== undefined) {
        finalTrangThai = TrangThai;
        finalHoanThanh = (TrangThai === "Đã hoàn thành") ? 1 : 0;
      } else {
        finalHoanThanh = HoanThanh ? 1 : 0;
        finalTrangThai = HoanThanh ? "Đã hoàn thành" : "Đang diễn ra";
      }

      updateRequest.input("HoanThanh", finalHoanThanh);
      updateRequest.input("TrangThai", finalTrangThai);
      fieldsToUpdate.push("HoanThanh = @HoanThanh");
      fieldsToUpdate.push("TrangThai = @TrangThai");
    }

    if (fieldsToUpdate.length > 0) {
      const query = `
        UPDATE LOPHOC 
        SET ${fieldsToUpdate.join(", ")}
        WHERE MaLopHoc = @id
      `;
      await updateRequest.query(query);
    }

    // Cập nhật phân công giảng viên
    if (teachers !== undefined) {
      await pool.request()
        .input("id", req.params.id)
        .query(`DELETE FROM PHANCONGGIANGVIEN WHERE MaLopHoc = @id`);

      if (teachers && typeof teachers === 'object') {
        for (const skillId in teachers) {
          const teacherId = teachers[skillId];
          if (teacherId) {
            await pool.request()
              .input("MaLopHoc", req.params.id)
              .input("MaGiangVien", teacherId)
              .input("MaKyNang", Number(skillId))
              .query(`
                INSERT INTO PHANCONGGIANGVIEN (MaLopHoc, MaGiangVien, MaKyNang, NgayPhanCong)
                VALUES (@MaLopHoc, @MaGiangVien, @MaKyNang, GETDATE())
              `);
          }
        }
      }
    }

    res.json({ message: "Cập nhật lớp học thành công" })
  } catch (err) { res.status(500).send(err.message) }
})

// Lấy phân công giảng viên cho lớp học
app.get("/qtv/lophoc/:id/giangvien", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("id", req.params.id)
      .query(`
        SELECT pc.MaKyNang, pc.MaGiangVien, n.HoTen AS TenGiangVien
        FROM PHANCONGGIANGVIEN pc
        JOIN GIANGVIEN g ON pc.MaGiangVien = g.MaGiangVien
        JOIN NGUOIDUNG n ON g.MaNguoiDung = n.MaNguoiDung
        WHERE pc.MaLopHoc = @id
      `);
    res.json(result.recordset);
  } catch (err) { res.status(500).send(err.message); }
});

// Xóa buổi học
app.delete("/qtv/buoihoc/:id", async (req, res) => {
  try {
    const pool = await poolPromise
    await pool.request()
      .input("id", req.params.id)
      .query(`DELETE FROM BUOIHOC WHERE MaBuoiHoc = @id`)
    res.json({ message: "Đã xóa buổi học" })
  } catch (err) { res.status(500).send(err.message) }
})
app.get("/classes/:id/buoihoc", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("classId", req.params.id)
      .query(`SELECT *, MaBuoiHoc AS MaLesson, TenBuoiHoc AS TenLesson FROM BUOIHOC WHERE MaLopHoc = @classId ORDER BY ThuTu`);
    res.json(result.recordset);
  } catch (err) { res.status(500).send("Lỗi server"); }
});

app.get("/classes/:id/lessons", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("classId", req.params.id)
      .query(`SELECT *, MaBuoiHoc AS MaLesson, TenBuoiHoc AS TenLesson FROM BUOIHOC WHERE MaLopHoc = @classId ORDER BY ThuTu`);
    res.json(result.recordset);
  } catch (err) { res.status(500).send("Lỗi server"); }
});
app.get("/classes/:id/lessons", async (req, res) => {
  // Alias endpoint for /classes/:id/buoihoc to preserve compatibility with older frontend routes
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("classId", req.params.id)
      .query(`SELECT * FROM BUOIHOC WHERE MaLopHoc = @classId ORDER BY ThuTu`);
    res.json(result.recordset);
  } catch (err) { res.status(500).send("Lỗi server"); }
});

app.get("/buoihoc/:id", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("id", req.params.id)
      .query(`
        SELECT l.*, lh.LichHoc, lh.SoLuongHocVien
        FROM BUOIHOC l
        JOIN LOPHOC lh ON l.MaLopHoc = lh.MaLopHoc
        WHERE l.MaBuoiHoc = @id
      `);
    res.json(result.recordset[0]);
  } catch (err) { res.status(500).send("Lỗi server"); }
});

app.get("/baitap/buoihoc/:buoiHocId", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("buoiHocId", parseInt(req.params.buoiHocId))
      .query(`
<<<<<<< Updated upstream
        SELECT e.MaBaiTap, e.TieuDe AS Title, e.DangBai AS Type, e.NgayTao AS CreatedDate, e.TrangThai
=======
        SELECT e.MaBaiTap, e.TieuDe AS Title, 
               CASE WHEN e.LaBaiKiemTra = 1 THEN 'exam' ELSE 'homework' END AS Type, 
               e.NgayTao AS CreatedDate 
>>>>>>> Stashed changes
        FROM BAITAP e
        JOIN BAIHOCKHOAHOC bh ON e.MaBaiHoc = bh.MaBaiHoc
        WHERE bh.MaBuoiHoc = @buoiHocId
      `);
    res.json(result.recordset);
  } catch (err) { res.status(500).send("Lỗi server"); }
});

app.get("/baitap/:id", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("id", parseInt(req.params.id))
<<<<<<< Updated upstream
      .query(`SELECT MaBaiTap, TieuDe AS Title, DangBai AS Type, NgayTao AS CreatedDate, NoiDung AS Content, CauHoi AS Questions, TrangThai, FileDinhKem FROM BAITAP WHERE MaBaiTap = @id`);
=======
      .query(`
        SELECT MaBaiTap, TieuDe AS Title, 
               CASE WHEN LaBaiKiemTra = 1 THEN 'exam' ELSE 'homework' END AS Type, 
               NgayTao AS CreatedDate, NoiDung AS Content, CauHoi AS Questions,
               null AS Vocabulary
        FROM BAITAP 
        WHERE MaBaiTap = @id
      `);
>>>>>>> Stashed changes
    res.json(result.recordset[0]);
  } catch (err) { res.status(500).send("Lỗi server"); }
});

app.post("/baitap", async (req, res) => {
  try {
    const { Title, Type, Content, Questions, CreatedDate, MaBuoiHoc, MaBaiHoc, TrangThai, MaGiangVien, FileDinhKem } = req.body;
    const pool = await poolPromise;
    let targetMaBaiHoc = MaBaiHoc;

    if (!targetMaBaiHoc && MaBuoiHoc) {
      // Tìm bài giảng đầu tiên của buổi học này để gán
      const bhResult = await pool.request()
        .input("buoiHocId", MaBuoiHoc)
        .query(`SELECT TOP 1 MaBaiHoc FROM BAIHOCKHOAHOC WHERE MaBuoiHoc = @buoiHocId ORDER BY ThuTu ASC`);
      if (bhResult.recordset.length > 0) {
        targetMaBaiHoc = bhResult.recordset[0].MaBaiHoc;
      } else {
        // Tạo bài giảng rỗng tạm thời cho buổi học
        const insertBh = await pool.request()
          .input("buoiHocId", MaBuoiHoc)
          .query(`
            INSERT INTO BAIHOCKHOAHOC (MaKhoaHoc, MaGiangVien, TieuDe, NoiDung, TrangThai, MaBuoiHoc)
            VALUES (1, 1, N'Bài giảng mặc định', '', 'published', @buoiHocId);
            SELECT SCOPE_IDENTITY() AS MaBaiHoc;
          `);
        targetMaBaiHoc = insertBh.recordset[0].MaBaiHoc;
      }
    }

    if (!targetMaBaiHoc) {
      return res.status(400).json({ message: "Thiếu thông tin bài giảng (MaBaiHoc)" });
    }

    // Resolve MaGiangVien if not passed or null
    let resolvedMaGiangVien = MaGiangVien;
    if (!resolvedMaGiangVien && MaBuoiHoc) {
      const classTeacherResult = await pool.request()
        .input("buoiHocId", MaBuoiHoc)
        .query(`
          SELECT TOP 1 l.MaGiangVien 
          FROM BUOIHOC b
          JOIN LOPHOC l ON b.MaLopHoc = l.MaLopHoc
          WHERE b.MaBuoiHoc = @buoiHocId
        `);
      if (classTeacherResult.recordset.length > 0) {
        resolvedMaGiangVien = classTeacherResult.recordset[0].MaGiangVien;
      }
    }

    await pool.request()
      .input("TieuDe", Title)
<<<<<<< Updated upstream
      .input("DangBai", Type || null)
      .input("NoiDung", Content || "")
      .input("CauHoi", Questions || "")
      .input("NgayTao", CreatedDate)
      .input("MaBaiHoc", targetMaBaiHoc)
      .input("TrangThai", TrangThai || "pending")
      .input("MaGiangVien", resolvedMaGiangVien || null)
      .input("FileDinhKem", FileDinhKem || null)
      .query(`INSERT INTO BAITAP (TieuDe, DangBai, NoiDung, CauHoi, NgayTao, MaBaiHoc, TrangThai, MaGiangVien, FileDinhKem) VALUES (@TieuDe, @DangBai, @NoiDung, @CauHoi, @NgayTao, @MaBaiHoc, @TrangThai, @MaGiangVien, @FileDinhKem)`);
=======
      .input("LaBaiKiemTra", Type === "exam" ? 1 : 0)
      .input("NoiDung", Content || "")
      .input("CauHoi", Questions || "")
      .input("NgayTao", CreatedDate || new Date().toISOString().split('T')[0])
      .input("MaBaiHoc", targetMaBaiHoc)
      .input("TrangThai", TrangThai || "published")
      .input("TrangThaiDuyet", (TrangThai || "published") === "published" ? 'Đã duyệt' : (TrangThai === "rejected" ? 'Từ chối' : 'Chờ duyệt'))
      .input("MaGiangVien", resolvedMaGiangVien || null)
      .query(`
        INSERT INTO BAITAP (TieuDe, LaBaiKiemTra, NoiDung, CauHoi, NgayTao, MaBaiHoc, TrangThai, TrangThaiDuyet, MaGiangVien) 
        VALUES (@TieuDe, @LaBaiKiemTra, @NoiDung, @CauHoi, @NgayTao, @MaBaiHoc, @TrangThai, @TrangThaiDuyet, @MaGiangVien)
      `);
>>>>>>> Stashed changes
    res.json({ message: "Thêm bài tập thành công" });
  } catch (err) { res.status(500).send("Lỗi server: " + err.message); }
});
app.put("/baitap/:id", async (req, res) => {
  try {
    const { Questions } = req.body;
    const pool = await poolPromise;
    await pool.request()
      .input("id", parseInt(req.params.id))
      .input("CauHoi", Questions)
      .query(`UPDATE BAITAP SET CauHoi = @CauHoi WHERE MaBaiTap = @id`);
    res.json({ message: "Cập nhật thành công" });
  } catch (err) { res.status(500).send("Lỗi server"); }
});
app.delete("/baitap/:id", async (req, res) => {
  try {
    const pool = await poolPromise;
    const id = parseInt(req.params.id);

    // Xóa bài nộp liên quan trước (foreign key)
    await pool.request()
      .input("id", id)
      .query(`DELETE FROM BAINOP WHERE MaBaiTap = @id`);

    // Sau đó mới xóa exercise
    await pool.request()
      .input("id", id)
      .query(`DELETE FROM BAITAP WHERE MaBaiTap = @id`);

    res.json({ message: "Xóa bài tập thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Lỗi server");
  }
});
/* ===== BÀI GIẢNG ===== */
app.get("/baigiang/detail/:id", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("id", req.params.id)
      .query(`SELECT MaBaiHoc, TieuDe, LoaiBaiHoc, ThoiLuong, TrangThai, NoiDung, FileUrl FROM BAIHOCKHOAHOC WHERE MaBaiHoc = @id`); // ← thêm FileUrl
    res.json(result.recordset[0]);
  } catch (err) { res.status(500).send(err.message); }
});

app.get("/baigiang/:buoiHocId", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("buoiHocId", req.params.buoiHocId)
      .query(`SELECT MaBaiHoc, TieuDe, LoaiBaiHoc, ThoiLuong, TrangThai, ThuTu FROM BAIHOCKHOAHOC WHERE MaBuoiHoc = @buoiHocId ORDER BY ThuTu`);
    res.json(result.recordset);
  } catch (err) { res.status(500).send(err.message); }
});

app.post("/baigiang", async (req, res) => {
  try {
    const { TieuDe, NoiDung, FileUrl, LoaiBaiHoc, ThoiLuong, TrangThai, ThuTu, MaKhoaHoc, MaGiangVien, MaBuoiHoc } = req.body;
    const pool = await poolPromise;
    await pool.request()
      .input("TieuDe", TieuDe)
      .input("NoiDung", NoiDung || "")
      .input("FileUrl", FileUrl || "")
      .input("LoaiBaiHoc", LoaiBaiHoc)
      .input("ThoiLuong", ThoiLuong)
      .input("TrangThai", TrangThai || "draft")
      .input("ThuTu", ThuTu || 1)
      .input("MaKhoaHoc", MaKhoaHoc)
      .input("MaGiangVien", MaGiangVien)
      .input("MaBuoiHoc", MaBuoiHoc)
      .query(`INSERT INTO BAIHOCKHOAHOC (TieuDe, NoiDung, FileUrl, LoaiBaiHoc, ThoiLuong, TrangThai, ThuTu, MaKhoaHoc, MaGiangVien, MaBuoiHoc) 
              VALUES (@TieuDe, @NoiDung, @FileUrl, @LoaiBaiHoc, @ThoiLuong, @TrangThai, @ThuTu, @MaKhoaHoc, @MaGiangVien, @MaBuoiHoc)`);
    res.json({ message: "Thêm bài giảng thành công" });
  } catch (err) { res.status(500).send(err.message); }
});

app.delete("/baigiang/:id", async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input("id", req.params.id)
      .query("DELETE FROM BAIHOCKHOAHOC WHERE MaBaiHoc = @id");
    res.json({ message: "Xóa thành công" });
  } catch (err) { res.status(500).send(err.message); }
});
app.put("/baigiang/:id/status", async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input("id", req.params.id)
      .input("TrangThai", req.body.TrangThai)
      .query(`UPDATE BAIHOCKHOAHOC SET TrangThai = @TrangThai WHERE MaBaiHoc = @id`);
    res.json({ message: "Cập nhật thành công" });
  } catch (err) { res.status(500).send(err.message); }
});
// ── Lấy bình luận theo BUOIHOC (buổi học) ──
// Thêm route này vào backend, đặt TRƯỚC route /binhluan/:maBaiHoc
// ── Lấy bình luận theo BUOIHOC ──
app.get("/binhluan/buoihoc/:maBuoiHoc", async (req, res) => {
  try {
    const pool = await poolPromise;

    // Tự convert: nếu truyền vào là MaBaiHoc thì tìm MaBuoiHoc tương ứng
    const buoiHocResult = await pool.request()
      .input("id", req.params.maBuoiHoc)
      .query(`
        SELECT DISTINCT MaBuoiHoc FROM BAIHOCKHOAHOC
        WHERE MaBuoiHoc = @id OR MaBaiHoc = @id
      `);

    if (buoiHocResult.recordset.length === 0) {
      return res.json([]);
    }

    const maBuoiHoc = buoiHocResult.recordset[0].MaBuoiHoc;

    const result = await pool.request()
      .input("id", maBuoiHoc)
      .query(`
        SELECT 
          b.MaBinhLuan, b.NoiDung, b.ThoiGian,
          b.MaBinhLuanCha, b.MaNguoiDung,
          n.HoTen,
          CASE 
            WHEN gv.MaNguoiDung IS NOT NULL THEN N'Giảng Viên'
            ELSE N'Sinh Viên'
          END AS VaiTro
        FROM BINHLUAN b
        JOIN BAIHOCKHOAHOC bg ON b.MaBaiHoc = bg.MaBaiHoc
        JOIN NGUOIDUNG n ON b.MaNguoiDung = n.MaNguoiDung
        LEFT JOIN GIANGVIEN gv ON b.MaNguoiDung = gv.MaNguoiDung
        WHERE bg.MaBuoiHoc = @id
        ORDER BY b.ThoiGian ASC
      `);

    res.json(result.recordset);
  } catch (err) { res.status(500).send(err.message); }
});

// ── Gửi bình luận theo BUOIHOC ──
app.post("/binhluan/buoihoc", async (req, res) => {
  try {
    const { MaBuoiHoc, MaNguoiDung, NoiDung, MaBinhLuanCha } = req.body;
    const pool = await poolPromise;

    // Convert nếu truyền vào là MaBaiHoc
    const buoiHocResult = await pool.request()
      .input("id", MaBuoiHoc)
      .query(`
        SELECT DISTINCT MaBuoiHoc FROM BAIHOCKHOAHOC
        WHERE MaBuoiHoc = @id OR MaBaiHoc = @id
      `);

    if (buoiHocResult.recordset.length === 0) {
      return res.status(400).json({ message: "Không tìm thấy buổi học" });
    }

    const maBuoiHocReal = buoiHocResult.recordset[0].MaBuoiHoc;

    const bgResult = await pool.request()
      .input("MaBuoiHoc", maBuoiHocReal)
      .query(`
        SELECT TOP 1 MaBaiHoc FROM BAIHOCKHOAHOC
        WHERE MaBuoiHoc = @MaBuoiHoc
        ORDER BY MaBaiHoc ASC
      `);

    if (bgResult.recordset.length === 0) {
      return res.status(400).json({ message: "Buổi học chưa có bài giảng nào" });
    }

    const maBaiHoc = bgResult.recordset[0].MaBaiHoc;

    await pool.request()
      .input("MaBaiHoc", maBaiHoc)
      .input("MaNguoiDung", MaNguoiDung)
      .input("NoiDung", NoiDung)
      .input("MaBinhLuanCha", MaBinhLuanCha ?? null)
      .query(`
        INSERT INTO BINHLUAN (MaBaiHoc, MaNguoiDung, NoiDung, MaBinhLuanCha, ThoiGian)
        VALUES (@MaBaiHoc, @MaNguoiDung, @NoiDung, @MaBinhLuanCha, GETDATE())
      `);

    res.json({ message: "Đã gửi bình luận" });
  } catch (err) { res.status(500).send(err.message); }
});
// ── Lấy bình luận theo bài giảng ──
app.get("/binhluan/:maBaiHoc", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("id", req.params.maBaiHoc)
      .query(`
        SELECT b.MaBinhLuan, b.NoiDung, b.ThoiGian,
               b.MaBinhLuanCha, b.MaNguoiDung,
               n.HoTen, v.VaiTro
        FROM BINHLUAN b
        JOIN NGUOIDUNG n ON b.MaNguoiDung = n.MaNguoiDung
        JOIN VAITRO v ON n.MaVaiTro = v.MaVaiTro
        WHERE b.MaBaiHoc = @id
        ORDER BY b.ThoiGian ASC
      `);
    res.json(result.recordset);
  } catch (err) { res.status(500).send(err.message); }
});

// ── Gửi bình luận ──
app.post("/binhluan", async (req, res) => {
  try {
    const { MaBaiHoc, MaNguoiDung, NoiDung, MaBinhLuanCha } = req.body;
    const pool = await poolPromise;
    await pool.request()
      .input("MaBaiHoc", MaBaiHoc)
      .input("MaNguoiDung", MaNguoiDung)
      .input("NoiDung", NoiDung)
      .input("MaBinhLuanCha", MaBinhLuanCha ?? null)
      .query(`
        INSERT INTO BINHLUAN (MaBaiHoc, MaNguoiDung, NoiDung, MaBinhLuanCha, ThoiGian)
        VALUES (@MaBaiHoc, @MaNguoiDung, @NoiDung, @MaBinhLuanCha, GETDATE())
      `);
    res.json({ message: "Đã gửi bình luận" });
  } catch (err) { res.status(500).send(err.message); }
});

// ── Xóa bình luận ──
app.delete("/binhluan/:id", async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input("id", req.params.id)
      .query(`DELETE FROM BINHLUAN WHERE MaBinhLuan = @id`);
    res.json({ message: "Đã xóa" });
  } catch (err) { res.status(500).send(err.message); }
});

/* ===== TÀI LIỆU ===== */
// ⚠️ detail phải đặt TRƯỚC :buoiHocId
app.get("/tailieu/detail/:id", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("id", req.params.id)
      .query(`SELECT MaTaiLieu, TieuDe, MoTa, NoiDung, FileUrl, NgayCapNhat 
              FROM TAILIEU WHERE MaTaiLieu = @id`);
    res.json(result.recordset[0]);
  } catch (err) { res.status(500).send(err.message); }
});

app.get("/tailieu/:buoiHocId", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("buoiHocId", req.params.buoiHocId)
      .query(`SELECT MaTaiLieu, TieuDe, MoTa, NgayCapNhat FROM TAILIEU WHERE MaBuoiHoc = @buoiHocId ORDER BY NgayCapNhat DESC`);
    res.json(result.recordset);
  } catch (err) { res.status(500).send(err.message); }
});

app.delete("/tailieu/:id", async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input("id", req.params.id)
      .query("DELETE FROM TAILIEU WHERE MaTaiLieu = @id");
    res.json({ message: "Xóa thành công" });
  } catch (err) { res.status(500).send(err.message); }
});

app.post("/tailieu", async (req, res) => {
  try {
    const { TieuDe, MoTa, MaBuoiHoc, NoiDung, FileUrl } = req.body;
    const pool = await poolPromise;
    await pool.request()
      .input("TieuDe", TieuDe)
      .input("MoTa", MoTa || "")
      .input("MaBuoiHoc", MaBuoiHoc)
      .input("NoiDung", NoiDung || "")
      .input("FileUrl", FileUrl || "")
      .query(`INSERT INTO TAILIEU (TieuDe, MoTa, MaBuoiHoc, NoiDung, FileUrl) VALUES (@TieuDe, @MoTa, @MaBuoiHoc, @NoiDung, @FileUrl)`);
    res.json({ message: "Thêm tài liệu thành công" });
  } catch (err) { res.status(500).send(err.message); }
});

/* ===== GIẢNG VIÊN ===== */
app.get("/giangvien/:maNguoiDung", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("maNguoiDung", req.params.maNguoiDung)
      .query(`
        SELECT n.HoTen, n.Email, n.NgaySinh, n.GioiTinh, n.AnhDaiDien,
               g.HocVi, g.ChuyenMon, g.MaGiangVien,
               g.SoDienThoai, g.KinhNghiem, g.GioiThieu
        FROM NGUOIDUNG n
        JOIN GIANGVIEN g ON n.MaNguoiDung = g.MaNguoiDung
        WHERE n.MaNguoiDung = @maNguoiDung
      `);
    res.json(result.recordset[0]);
  } catch (err) { res.status(500).send(err.message); }
});

app.put("/giangvien/:maNguoiDung", async (req, res) => {
  try {
    const { HoTen, HocVi, Email, SoDienThoai, ChuyenMon, KinhNghiem, GioiThieu, AnhDaiDien } = req.body;
    const pool = await poolPromise;
    await pool.request()
      .input("maNguoiDung", req.params.maNguoiDung)
      .input("HoTen", HoTen)
      .input("Email", Email)
      .input("AnhDaiDien", AnhDaiDien || null)
      .query(`UPDATE NGUOIDUNG SET HoTen=@HoTen, Email=@Email, AnhDaiDien=@AnhDaiDien WHERE MaNguoiDung=@maNguoiDung`);
    await pool.request()
      .input("maNguoiDung", req.params.maNguoiDung)
      .input("HocVi", HocVi).input("SoDienThoai", SoDienThoai)
      .input("ChuyenMon", ChuyenMon).input("KinhNghiem", KinhNghiem).input("GioiThieu", GioiThieu)
      .query(`UPDATE GIANGVIEN SET HocVi=@HocVi, SoDienThoai=@SoDienThoai, ChuyenMon=@ChuyenMon, KinhNghiem=@KinhNghiem, GioiThieu=@GioiThieu WHERE MaNguoiDung=@maNguoiDung`);
    res.json({ message: "Cập nhật thành công" });
  } catch (err) { res.status(500).send(err.message); }
});
app.get("/students", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
        s.MaSinhVien,
        n.HoTen,
        n.GioiTinh,
        s.Lop,
        k.TenKhoaHoc
      FROM SINHVIEN s
      JOIN NGUOIDUNG n ON s.MaNguoiDung = n.MaNguoiDung
      LEFT JOIN DANGKYKHOAHOC d ON s.MaSinhVien = d.MaSinhVien
      LEFT JOIN KHOAHOC k ON d.MaKhoaHoc = k.MaKhoaHoc
      ORDER BY s.MaSinhVien ASC
    `);
    res.json(result.recordset);
  } catch (err) { res.status(500).send(err.message); }
});
app.get("/students/:maSinhVien", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("maSinhVien", req.params.maSinhVien)
      .query(`
        SELECT
          s.MaSinhVien,
          n.MaNguoiDung,
          n.HoTen,
          n.Email,
          n.GioiTinh,
          n.NgaySinh,
          s.Lop,
          s.MSSV,
          k.TenKhoaHoc
        FROM SINHVIEN s
        JOIN NGUOIDUNG n ON s.MaNguoiDung = n.MaNguoiDung
        LEFT JOIN DANGKYKHOAHOC d ON s.MaSinhVien = d.MaSinhVien
        LEFT JOIN KHOAHOC k ON d.MaKhoaHoc = k.MaKhoaHoc
        WHERE s.MaSinhVien = @maSinhVien
      `);
    res.json(result.recordset[0]);
  } catch (err) { res.status(500).send(err.message); }
});
app.get("/classes/:id/info", async (req, res) => {
  try {
    const pool = await poolPromise
    const result = await pool.request()
      .input("id", req.params.id)
      .query(`
        SELECT 
          l.MaLopHoc, l.TenLop, l.LichHoc, l.SoLuongHocVien,
          COALESCE((
            SELECT TOP 1 
              CASE 
                WHEN (SELECT COUNT(*) FROM BUOIHOC WHERE MaLopHoc = l.MaLopHoc) = 0 THEN 0
                ELSE ROUND(CAST(active_bh.ThuTu AS FLOAT) / (SELECT COUNT(*) FROM BUOIHOC WHERE MaLopHoc = l.MaLopHoc) * 100, 0)
              END
            FROM BUOIHOC active_bh 
            WHERE active_bh.MaBuoiHoc = l.ActiveBuoiHocId
          ), 0) AS TienDo,
          l.MaLop, kc.MoTa,
          k.TenKhoaHoc,
          COALESCE(
            (SELECT TOP 1 nd.HoTen
             FROM PHANCONGGIANGVIEN pc
             JOIN GIANGVIEN gv ON pc.MaGiangVien = gv.MaGiangVien
             JOIN NGUOIDUNG nd ON gv.MaNguoiDung = nd.MaNguoiDung
             WHERE pc.MaLopHoc = l.MaLopHoc),
            N'Chưa phân công'
          ) AS TenGiangVien,
          l.ActiveBuoiHocId AS ActiveBuoiHocId,
          l.ActiveBuoiHocId AS ActiveLessonId,
          kc.TrangThai AS TrangThaiKhoaHoc,
          l.TrangThai AS TrangThaiLopHoc,
          (SELECT MIN(NgayBatDau) FROM BUOIHOC WHERE MaLopHoc = l.MaLopHoc) AS NgayBatDau,
          (SELECT MAX(NgayKetThuc) FROM BUOIHOC WHERE MaLopHoc = l.MaLopHoc) AS NgayKetThuc
        FROM LOPHOC l
        LEFT JOIN KHOAHOCCHITIET kc ON l.MaLop = kc.MaLop
        LEFT JOIN KHOAHOC k ON kc.MaKhoaHoc = k.MaKhoaHoc
        WHERE l.MaLopHoc = @id
      `)
    res.json(result.recordset[0] || null)
  } catch (err) { res.status(500).send(err.message) }
})
app.get("/buoihoc/:id/students", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("id", req.params.id)
      .query(`
        SELECT 
          s.MaSinhVien,
          n.HoTen,
          -- Tiến độ = số bài kiểm tra đã làm / tổng số bài kiểm tra trong buổi học
          CASE 
            WHEN total.TongBai = 0 THEN 0
            ELSE ROUND(CAST(COUNT(DISTINCT k.MaKetQua) AS FLOAT) / total.TongBai * 100, 0)
          END AS TienDo,
          CASE 
            WHEN COUNT(DISTINCT b.MaBaiNop) >= total.TongBai AND total.TongBai > 0 THEN N'Hoàn thành'
            ELSE N'Chưa hoàn thành'
          END AS TrangThai,
          ROUND(AVG(CAST(k.Diem AS FLOAT)), 1) AS DiemTrungBinh,
          COUNT(DISTINCT k.MaKetQua) AS SoBaiDaLam
        FROM SINHVIEN s
        JOIN NGUOIDUNG n ON s.MaNguoiDung = n.MaNguoiDung
        -- Tổng số bài kiểm tra trong buổi học
        CROSS JOIN (
          SELECT COUNT(bkt.MaBaiKiemTra) AS TongBai
          FROM BAIKIEMTRA bkt
          WHERE bkt.MaBuoiHoc = @id
        ) total
        -- Bài kiểm tra sinh viên đã làm trong lesson này
        LEFT JOIN KETQUABAIKIEMTRA k ON n.MaNguoiDung = k.MaSinhVien
          AND k.MaBaiKiemTra IN (
            SELECT bkt.MaBaiKiemTra 
            FROM BAIKIEMTRA bkt
            WHERE bkt.MaBuoiHoc = @id
          )
        GROUP BY s.MaSinhVien, n.HoTen, total.TongBai
        ORDER BY s.MaSinhVien
      `);
    res.json(result.recordset);
  } catch (err) { res.status(500).send(err.message); }
});
// Kết quả bài kiểm tra của sinh viên
app.get("/students/:maSinhVien/ketqua", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("maSinhVien", req.params.maSinhVien)
      .query(`
        SELECT 
          bkt.TenBai,
          k.Diem,
          k.ThoiGianLamBai
        FROM KETQUABAIKIEMTRA k
        JOIN BAIKIEMTRA bkt ON k.MaBaiKiemTra = bkt.MaBaiKiemTra
        JOIN SINHVIEN s ON s.MaNguoiDung = k.MaSinhVien
        WHERE s.MaSinhVien = @maSinhVien
        ORDER BY k.ThoiGianLamBai DESC
      `);
    res.json(result.recordset);
  } catch (err) { res.status(500).send(err.message); }
});

// Tiến độ học tập của sinh viên
app.get("/students/:maSinhVien/tiendo", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("maSinhVien", req.params.maSinhVien)
      .query(`
        SELECT 
          CASE 
            WHEN total.TongBai = 0 THEN 0
            ELSE ROUND(CAST(COUNT(t.MaTienDo) AS FLOAT) / total.TongBai * 100, 0)
          END AS TienDo
        FROM SINHVIEN s
        JOIN NGUOIDUNG n ON s.MaNguoiDung = n.MaNguoiDung
        CROSS JOIN (
          SELECT COUNT(bhk.MaBaiHoc) AS TongBai
          FROM BAIHOCKHOAHOC bhk
          WHERE bhk.MaBuoiHoc = 1  -- chỉ tính buổi học 1
        ) total
        LEFT JOIN TIENDOHOCTAP t ON n.MaNguoiDung = t.MaSinhVien
          AND t.MaBaiHoc IN (
            SELECT MaBaiHoc FROM BAIHOCKHOAHOC WHERE MaBuoiHoc = 1
          )
        WHERE s.MaSinhVien = @maSinhVien
        GROUP BY s.MaSinhVien, total.TongBai
      `);
    res.json(result.recordset[0] || { TienDo: 0 });
  } catch (err) { res.status(500).send(err.message); }
});
app.get("/students/:maSinhVien/tiendo/:buoiHocId", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("maSinhVien", req.params.maSinhVien)
      .input("buoiHocId", req.params.buoiHocId)
      .query(`
        SELECT
          CASE
            WHEN total.TongBai = 0 THEN 0
            ELSE ROUND(CAST(da_nop.SoNop AS FLOAT) / total.TongBai * 100, 0)
          END AS TienDo
        FROM (
          SELECT COUNT(*) AS TongBai
          FROM BAITAP e
          JOIN BAIHOCKHOAHOC bh ON e.MaBaiHoc = bh.MaBaiHoc
          WHERE bh.MaBuoiHoc = @buoiHocId
        ) total
        CROSS JOIN (
          SELECT COUNT(DISTINCT bn.MaBaiTap) AS SoNop
          FROM BAINOP bn
          JOIN BAITAP e ON bn.MaBaiTap = e.MaBaiTap
          JOIN BAIHOCKHOAHOC bh ON e.MaBaiHoc = bh.MaBaiHoc
          JOIN SINHVIEN sv ON bn.MaSinhVien = sv.MaNguoiDung
          WHERE bh.MaBuoiHoc = @buoiHocId
          AND sv.MaSinhVien = @maSinhVien
        ) da_nop
      `);
    res.json(result.recordset[0] || { TienDo: 0 });
  } catch (err) { res.status(500).send(err.message); }
});
app.put("/doi-mat-khau", async (req, res) => {
  try {
    const { maNguoiDung, matKhauCu, matKhauMoi } = req.body;
    const pool = await poolPromise;

    // Kiểm tra mật khẩu cũ
    const check = await pool.request()
      .input("maNguoiDung", maNguoiDung)
      .input("matKhauCu", matKhauCu)
      .query(`SELECT * FROM NGUOIDUNG WHERE MaNguoiDung=@maNguoiDung AND MatKhau=@matKhauCu`);

    if (check.recordset.length === 0)
      return res.status(401).json({ message: "Mật khẩu hiện tại không đúng" });

    // Cập nhật mật khẩu mới
    await pool.request()
      .input("maNguoiDung", maNguoiDung)
      .input("matKhauMoi", matKhauMoi)
      .query(`UPDATE NGUOIDUNG SET MatKhau=@matKhauMoi WHERE MaNguoiDung=@maNguoiDung`);

    res.json({ message: "Đổi mật khẩu thành công" });
  } catch (err) { res.status(500).send(err.message); }
});
// Lấy danh sách bài nộp theo exercise
app.get("/bainop/baitap/:maBaiTap", async (req, res) => {
  try {
    const pool = await poolPromise;
    const maBaiTap = parseInt(req.params.maBaiTap.trim());
    const result = await pool.request()
      .input("maBaiTap", maBaiTap)
      .query(`
        SELECT 
          b.MaBaiNop, b.NoiDung, b.NgayNop,
          b.Diem, b.NhanXet, b.TrangThai,
          s.MaSinhVien, n.HoTen
        FROM BAINOP b
        JOIN NGUOIDUNG n ON b.MaSinhVien = n.MaNguoiDung
        JOIN SINHVIEN s ON n.MaNguoiDung = s.MaNguoiDung
        WHERE b.MaBaiTap = @maBaiTap
        ORDER BY b.NgayNop DESC
      `);
    res.json(result.recordset);
  } catch (err) { res.status(500).send(err.message); }
});

// Lấy chi tiết 1 bài nộp
app.get("/bainop/:maBaiNop", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("maBaiNop", req.params.maBaiNop)
      .query(`
        SELECT 
          b.MaBaiNop, b.MaBaiTap, b.NoiDung,
          b.NgayNop, b.Diem, b.NhanXet, b.TrangThai,
          s.MaSinhVien, n.HoTen
        FROM BAINOP b
        JOIN NGUOIDUNG n ON b.MaSinhVien = n.MaNguoiDung
        JOIN SINHVIEN s ON n.MaNguoiDung = s.MaNguoiDung
        WHERE b.MaBaiNop = @maBaiNop
      `);
    res.json(result.recordset[0]);
  } catch (err) { res.status(500).send(err.message); }
});

// Chấm bài
app.put("/bainop/:maBaiNop/cham", async (req, res) => {
  try {
    const { Diem, NhanXet } = req.body;
    const pool = await poolPromise;
    await pool.request()
      .input("maBaiNop", req.params.maBaiNop)
      .input("Diem", Diem)
      .input("NhanXet", NhanXet || "")
      .query(`UPDATE BAINOP SET Diem=@Diem, NhanXet=@NhanXet, TrangThai=N'Đã chấm'
              WHERE MaBaiNop=@maBaiNop`);
    res.json({ message: "Chấm bài thành công" });
  } catch (err) { res.status(500).send(err.message); }
});

// Nộp bài
app.post("/bainop", async (req, res) => {
  try {
    const { MaSinhVien, NoiDung, Diem, TrangThai } = req.body;
    const MaBaiTap = req.body.MaBaiTap || req.body.MaExercise;
    const pool = await poolPromise
    const check = await pool.request()
      .input("MaBaiTap", MaBaiTap).input("MaSinhVien", MaSinhVien)
      .query(`SELECT * FROM BAINOP WHERE MaBaiTap=@MaBaiTap AND MaSinhVien=@MaSinhVien`)
    if (check.recordset.length > 0)
      return res.json({ message: "Đã nộp bài này rồi" })
    await pool.request()
      .input("MaBaiTap", MaBaiTap).input("MaSinhVien", MaSinhVien)
      .input("NoiDung", NoiDung || "")
      .input("Diem", Diem ?? null)                          // ← thêm
      .input("TrangThai", TrangThai || "Chờ chấm")          // ← thêm
      .query(`INSERT INTO BAINOP (MaBaiTap, MaSinhVien, NoiDung, Diem, TrangThai)
              VALUES (@MaBaiTap, @MaSinhVien, @NoiDung, @Diem, @TrangThai)`)
    res.json({ message: "Nộp bài thành công" })
  } catch (err) { res.status(500).send(err.message) }
})
app.post("/bainop/tracnghiem", async (req, res) => {
  try {
    const { MaSinhVien, DapAnChon } = req.body;
    const MaBaiTap = req.body.MaBaiTap || req.body.MaExercise;
    const pool = await poolPromise;

    // Lấy đáp án đúng từ BAITAP
    const exResult = await pool.request()
      .input("MaBaiTap", MaBaiTap)
      .query(`SELECT Questions FROM BAITAP WHERE MaBaiTap = @MaBaiTap`);

    const questions = exResult.recordset[0]?.Questions || "";

    // Lấy đáp án đúng — phần cuối sau "Đáp án đúng: "
    const parts = questions.split("|");
    const dapAnPart = parts.find(q => q.includes("Đáp án đúng:"));
    const dapAnDung = dapAnPart
      ? dapAnPart.replace("Đáp án đúng:", "").trim()
      : null;

    // Tính điểm: đúng = 10, sai = 0
    const diem = DapAnChon === dapAnDung ? 10 : 0;

    // Kiểm tra đã nộp chưa
    const check = await pool.request()
      .input("MaBaiTap", MaBaiTap)
      .input("MaSinhVien", MaSinhVien)
      .query(`SELECT * FROM BAINOP WHERE MaBaiTap=@MaBaiTap AND MaSinhVien=@MaSinhVien`);

    if (check.recordset.length > 0)
      return res.json({ message: "Đã nộp bài này rồi", Diem: check.recordset[0].Diem });

    // Lưu kết quả
    await pool.request()
      .input("MaBaiTap", MaBaiTap)
      .input("MaSinhVien", MaSinhVien)
      .input("NoiDung", `Đáp án chọn: ${DapAnChon}`)
      .input("Diem", diem)
      .query(`INSERT INTO BAINOP (MaBaiTap, MaSinhVien, NoiDung, Diem, TrangThai)
              VALUES (@MaBaiTap, @MaSinhVien, @NoiDung, @Diem, N'Đã chấm')`);

    res.json({ message: "Nộp bài thành công", Diem: diem, DapAnDung: dapAnDung });
  } catch (err) { res.status(500).send(err.message); }
});

// ADMIN
app.get("/admin/stats", async (req, res) => {
  try {
    const pool = await poolPromise;

    const tongNguoiDung = await pool.request()
      .query(`SELECT COUNT(*) AS total FROM NGUOIDUNG`);

    const sinhVien = await pool.request()
      .query(`SELECT COUNT(*) AS total FROM SINHVIEN`);

    const giangVien = await pool.request()
      .query(`SELECT COUNT(*) AS total FROM GIANGVIEN`);

    const khoaHoc = await pool.request()
      .query(`SELECT COUNT(*) AS total FROM KHOAHOC`);

    const dangKy = await pool.request()
      .query(`SELECT COUNT(*) AS total FROM DANGKYKHOAHOC`);

    res.json({
      tongNguoiDung: tongNguoiDung.recordset[0].total,
      sinhVien: sinhVien.recordset[0].total,
      giangVien: giangVien.recordset[0].total,
      quanTriVien: 1,
      khoaHoc: khoaHoc.recordset[0].total,
      dangKy: dangKy.recordset[0].total
    });
  } catch (err) { res.status(500).send(err.message); }
});
// Lấy danh sách khóa học cho admin
app.get("/admin/khoahoc", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
        kh.MaKhoaHoc,
        kh.TenKhoaHoc,
        kh.MoTa,
        kh.TrinhDo,
        kh.KyNang,
        kh.Listening,
        kh.Reading,
        kh.Writing,
        kh.Speaking,
        kh.TrangThai,
        kh.NgayTao,
        kh.NgayDuyet,
        kh.TrangThaiDuyet,
        (
          SELECT TOP 1 nd.HoTen
          FROM KHOAHOCCHITIET khct
          JOIN LOPHOC lh ON khct.MaLop = lh.MaLop
          JOIN PHANCONGGIANGVIEN pcgv ON lh.MaLopHoc = pcgv.MaLopHoc
          JOIN GIANGVIEN gv ON pcgv.MaGiangVien = gv.MaGiangVien
          JOIN NGUOIDUNG nd ON gv.MaNguoiDung = nd.MaNguoiDung
          WHERE khct.MaKhoaHoc = kh.MaKhoaHoc
        ) AS HoTen,
        (
          SELECT COUNT(*)
          FROM LOPHOC lh
          JOIN KHOAHOCCHITIET khct ON lh.MaLop = khct.MaLop
          WHERE khct.MaKhoaHoc = kh.MaKhoaHoc
        ) AS SoLop
      FROM KHOAHOC kh
    `);
    res.json(result.recordset);
  } catch (err) { res.status(500).send(err.message); }
});

// Duyệt / từ chối khóa học
app.put("/admin/khoahoc/:id/duyet", async (req, res) => {
  try {
    const { TrangThai } = req.body;
    const pool = await poolPromise;
    await pool.request()
      .input("id", req.params.id)
      .input("TrangThai", TrangThai)
      .input("NgayDuyet", new Date())
      .query(`UPDATE KHOAHOC SET TrangThai=@TrangThai, NgayDuyet=@NgayDuyet WHERE MaKhoaHoc=@id`);
    res.json({ message: "Cập nhật thành công" });
  } catch (err) { res.status(500).send(err.message); }
});

// ── POST /baitap/create ────────────────────────────────────────────────
app.post("/baitap/create", async (req, res) => {
  try {
    const {
      Title, Type, Content, Questions,
      CreatedDate, MaBuoiHoc, MaBaiHoc,
      AudioUrl, ShowAnswer, IsFree, IsExam,
      TrangThai, KyNang, DangBai, MaGiangVien, FileDinhKem
    } = req.body;

    const pool = await poolPromise;
    let targetMaBaiHoc = MaBaiHoc;

    if (!targetMaBaiHoc && MaBuoiHoc) {
      // Tìm bài giảng đầu tiên của buổi học này để gán
      const bhResult = await pool.request()
        .input("buoiHocId", MaBuoiHoc)
        .query(`SELECT TOP 1 MaBaiHoc FROM BAIHOCKHOAHOC WHERE MaBuoiHoc = @buoiHocId ORDER BY ThuTu ASC`);
      if (bhResult.recordset.length > 0) {
        targetMaBaiHoc = bhResult.recordset[0].MaBaiHoc;
      } else {
        // Tạo bài giảng rỗng tạm thời cho buổi học
        const insertBh = await pool.request()
          .input("buoiHocId", MaBuoiHoc)
          .query(`
            INSERT INTO BAIHOCKHOAHOC (MaKhoaHoc, MaGiangVien, TieuDe, NoiDung, TrangThai, MaBuoiHoc)
            VALUES (1, 1, N'Bài giảng mặc định', '', 'published', @buoiHocId);
            SELECT SCOPE_IDENTITY() AS MaBaiHoc;
          `);
        targetMaBaiHoc = insertBh.recordset[0].MaBaiHoc;
      }
    }

    if (!targetMaBaiHoc) {
      return res.status(400).json({ message: "Thiếu thông tin bài giảng (MaBaiHoc)" });
    }

    // Resolve MaGiangVien if not passed or null
    let resolvedMaGiangVien = MaGiangVien;
    if (!resolvedMaGiangVien && MaBuoiHoc) {
      const classTeacherResult = await pool.request()
        .input("buoiHocId", MaBuoiHoc)
        .query(`
          SELECT TOP 1 l.MaGiangVien 
          FROM BUOIHOC b
          JOIN LOPHOC l ON b.MaLopHoc = l.MaLopHoc
          WHERE b.MaBuoiHoc = @buoiHocId
        `);
      if (classTeacherResult.recordset.length > 0) {
        resolvedMaGiangVien = classTeacherResult.recordset[0].MaGiangVien;
      }
    }

    await pool.request()
<<<<<<< Updated upstream
      .input("TieuDe",        Title)
      .input("DangBai",       DangBai || Type || null)
      .input("NoiDung",       Content     || "")
      .input("CauHoi",        Questions   || "")
      .input("NgayTao",       CreatedDate)
      .input("MaBaiHoc",      targetMaBaiHoc)
      .input("LinkAmThanh",   AudioUrl    || "")
      .input("HienThiDapAn",  ShowAnswer  ? 1 : 0)
      .input("HocThuMienPhi", IsFree      ? 1 : 0)
      .input("LaBaiKiemTra",  IsExam      ? 1 : 0)
      .input("TrangThai",     TrangThai   || "pending")
      .input("KyNang",        KyNang      || null)
      .input("MaGiangVien",   resolvedMaGiangVien || null)
      .input("FileDinhKem",   FileDinhKem || null)
      .query(`
        INSERT INTO BAITAP
          (TieuDe, DangBai, NoiDung, CauHoi, NgayTao, MaBaiHoc, LinkAmThanh, HienThiDapAn, HocThuMienPhi, LaBaiKiemTra, TrangThai, KyNang, MaGiangVien, FileDinhKem)
        VALUES
          (@TieuDe, @DangBai, @NoiDung, @CauHoi, @NgayTao, @MaBaiHoc, @LinkAmThanh, @HienThiDapAn, @HocThuMienPhi, @LaBaiKiemTra, @TrangThai, @KyNang, @MaGiangVien, @FileDinhKem)
=======
      .input("TieuDe", Title)
      .input("LaBaiKiemTra", (Type === "exam" || IsExam) ? 1 : 0)
      .input("NoiDung", Content || "")
      .input("CauHoi", Questions || "")
      .input("NgayTao", CreatedDate || new Date().toISOString().split('T')[0])
      .input("MaBaiHoc", targetMaBaiHoc)
      .input("LinkAmThanh", AudioUrl || "")
      .input("HienThiDapAn", ShowAnswer ? 1 : 0)
      .input("HocThuMienPhi", IsFree ? 1 : 0)
      .input("TrangThai", TrangThai || "pending")
      .input("TrangThaiDuyet", (TrangThai || "pending") === "published" ? 'Đã duyệt' : ((TrangThai || "pending") === "rejected" ? 'Từ chối' : 'Chờ duyệt'))
      .input("KyNang", KyNang || null)
      .input("DangBai", DangBai || null)
      .input("MaGiangVien", resolvedMaGiangVien || null)
      .query(`
        INSERT INTO BAITAP
          (TieuDe, LaBaiKiemTra, NoiDung, CauHoi, NgayTao, MaBaiHoc, LinkAmThanh, HienThiDapAn, HocThuMienPhi, TrangThai, TrangThaiDuyet, KyNang, DangBai, MaGiangVien)
        VALUES
          (@TieuDe, @LaBaiKiemTra, @NoiDung, @CauHoi, @NgayTao, @MaBaiHoc, @LinkAmThanh, @HienThiDapAn, @HocThuMienPhi, @TrangThai, @TrangThaiDuyet, @KyNang, @DangBai, @MaGiangVien)
>>>>>>> Stashed changes
      `);

    res.json({ message: "Thêm bài tập thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Lỗi server");
  }
});
// ── Lấy danh sách đăng ký chờ ghi danh ──
app.get("/dangky/pending", async (req, res) => {
  try {
    const pool = await poolPromise
    const result = await pool.request().query(`
      SELECT 
        d.MaDangKy, d.MaKhoaHoc, d.MaSinhVien, 
        d.NgayDangKy, d.TrangThai,
        n.HoTen, k.TenKhoaHoc
      FROM DANGKYKHOAHOC d
      JOIN SINHVIEN s ON d.MaSinhVien = s.MaSinhVien
      JOIN NGUOIDUNG n ON s.MaNguoiDung = n.MaNguoiDung
      JOIN KHOAHOC k ON d.MaKhoaHoc = k.MaKhoaHoc
      ORDER BY d.NgayDangKy DESC
    `)
    res.json(result.recordset)
  } catch (err) { res.status(500).send(err.message) }
})

// Cập nhật trạng thái đăng ký học viên (Từ chối, Duyệt,...)
app.put("/dangky/:id/status", async (req, res) => {
  try {
    const { TrangThai } = req.body
    const pool = await poolPromise
    await pool.request()
      .input("id", req.params.id)
      .input("TrangThai", TrangThai)
      .query(`UPDATE DANGKYKHOAHOC SET TrangThai=@TrangThai WHERE MaDangKy=@id`)
    res.json({ message: "Cập nhật trạng thái đăng ký thành công" })
  } catch (err) { res.status(500).send(err.message) }
})

// ── Lấy sinh viên trong lớp (cho QTV) ──
app.get("/lophoc/:id/sinhvien", async (req, res) => {
  try {
    const pool = await poolPromise
    const result = await pool.request()
      .input("id", req.params.id)
      .query(`
        SELECT sl.MaSinhVien, n.HoTen, n.GioiTinh,
               sl.NgayGhiDanh, sl.TrangThai
        FROM SINHVIEN_LOPHOC sl
        JOIN SINHVIEN s ON sl.MaSinhVien = s.MaSinhVien
        JOIN NGUOIDUNG n ON s.MaNguoiDung = n.MaNguoiDung
        WHERE sl.MaLopHoc = @id
      `)
    res.json(result.recordset)
  } catch (err) { res.status(500).send(err.message) }
})

// ── Lấy sinh viên trong lớp (cho GV — có kiểm tra quyền) ──
app.get("/lophoc/:id/sinhvien/:maNguoiDung", async (req, res) => {
  try {
    const pool = await poolPromise
    const check = await pool.request()
      .input("MaLopHoc", req.params.id)
      .input("maNguoiDung", req.params.maNguoiDung)
      .query(`
        SELECT DISTINCT l.MaLopHoc FROM LOPHOC l
        JOIN PHANCONGGIANGVIEN pc ON l.MaLopHoc = pc.MaLopHoc
        JOIN GIANGVIEN g ON pc.MaGiangVien = g.MaGiangVien
        WHERE l.MaLopHoc = @MaLopHoc AND g.MaNguoiDung = @maNguoiDung
      `)
    if (check.recordset.length === 0)
      return res.status(403).json({ message: "Không có quyền xem lớp này" })
    const result = await pool.request()
      .input("id", req.params.id)
      .query(`
        SELECT sl.MaSinhVien, n.HoTen, n.GioiTinh,
               sl.NgayGhiDanh, sl.TrangThai
        FROM SINHVIEN_LOPHOC sl
        JOIN SINHVIEN s ON sl.MaSinhVien = s.MaSinhVien
        JOIN NGUOIDUNG n ON s.MaNguoiDung = n.MaNguoiDung
        WHERE sl.MaLopHoc = @id
      `)
    res.json(result.recordset)
  } catch (err) { res.status(500).send(err.message) }
})

// ── Ghi danh sinh viên vào lớp ──
app.post("/qtv/lophoc/:id/ghidanh", async (req, res) => {
  try {
    const { MaSinhVien } = req.body
    const pool = await poolPromise
    // Kiểm tra đã ghi danh chưa
    const check = await pool.request()
      .input("MaLopHoc", req.params.id)
      .input("MaSinhVien", MaSinhVien)
      .query(`SELECT * FROM SINHVIEN_LOPHOC WHERE MaLopHoc=@MaLopHoc AND MaSinhVien=@MaSinhVien`)
    if (check.recordset.length > 0)
      return res.json({ message: "Sinh viên đã ghi danh rồi" })
    await pool.request()
      .input("MaLopHoc", req.params.id)
      .input("MaSinhVien", MaSinhVien)
      .query(`INSERT INTO SINHVIEN_LOPHOC (MaLopHoc, MaSinhVien, NgayGhiDanh, TrangThai)
              VALUES (@MaLopHoc, @MaSinhVien, GETDATE(), N'Đang học')`)

    // Tự động cập nhật trạng thái đăng ký khóa học tương ứng thành 'Đã ghi danh'
    await pool.request()
      .input("MaLopHoc", req.params.id)
      .input("MaSinhVien", MaSinhVien)
      .query(`
        UPDATE DANGKYKHOAHOC
        SET TrangThai = N'Đã ghi danh'
        WHERE MaSinhVien = @MaSinhVien 
          AND MaKhoaHoc IN (
              SELECT khct.MaKhoaHoc 
              FROM LOPHOC lh
              JOIN KHOAHOCCHITIET khct ON lh.MaLop = khct.MaLop
              WHERE lh.MaLopHoc = @MaLopHoc
          )
      `)

    res.json({ message: "Đã ghi danh thành công" })
  } catch (err) { res.status(500).send(err.message) }
})

// ── Hủy ghi danh ──
app.delete("/qtv/lophoc/:id/ghidanh/:maSinhVien", async (req, res) => {
  try {
    const pool = await poolPromise
    await pool.request()
      .input("MaLopHoc", req.params.id)
      .input("MaSinhVien", req.params.maSinhVien)
      .query(`DELETE FROM SINHVIEN_LOPHOC WHERE MaLopHoc=@MaLopHoc AND MaSinhVien=@MaSinhVien`)

    // Tự động cập nhật lại trạng thái đăng ký khóa học tương ứng thành 'Chờ ghi danh'
    await pool.request()
      .input("MaLopHoc", req.params.id)
      .input("MaSinhVien", req.params.maSinhVien)
      .query(`
        UPDATE DANGKYKHOAHOC
        SET TrangThai = N'Chờ ghi danh'
        WHERE MaSinhVien = @MaSinhVien 
          AND MaKhoaHoc IN (
              SELECT khct.MaKhoaHoc 
              FROM LOPHOC lh
              JOIN KHOAHOCCHITIET khct ON lh.MaLop = khct.MaLop
              WHERE lh.MaLopHoc = @MaLopHoc
          )
      `)

    res.json({ message: "Đã hủy ghi danh" })
  } catch (err) { res.status(500).send(err.message) }
})
// ── Đếm số học viên trong lớp ──
app.get("/lophoc/:id/students/count", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("id", req.params.id)
      .query(`
        SELECT COUNT(*) AS SoLuongHocVien
        FROM SINHVIEN_LOPHOC
        WHERE MaLopHoc = @id
      `);
    res.json(result.recordset[0]);
  } catch (err) { res.status(500).send(err.message); }
});

// ── Sửa khóa học ──
app.put("/admin/khoahoc/:id", async (req, res) => {
  try {
    const { TenKhoaHoc, MoTa, TrinhDo, KyNang, Listening, Reading, Speaking, Writing } = req.body
    const pool = await poolPromise
    
    // Check if course has classes
    const classCheck = await pool.request()
      .input("id", req.params.id)
      .query(`
        SELECT COUNT(*) AS SoLop
        FROM LOPHOC lh
        JOIN KHOAHOCCHITIET khct ON lh.MaLop = khct.MaLop
        WHERE khct.MaKhoaHoc = @id
      `);
    const classCount = classCheck.recordset[0].SoLop;

    if (classCount > 0) {
      // Hạn chế thay đổi kỹ năng khi đã có lớp trong khóa
      const currentCourse = await pool.request()
        .input("id", req.params.id)
        .query(`SELECT KyNang, Listening, Reading, Speaking, Writing FROM KHOAHOC WHERE MaKhoaHoc=@id`);
      const row = currentCourse.recordset[0];
      const currentKyNang = row?.KyNang || "";
      const currentL = row?.Listening ? 1 : 0;
      const currentR = row?.Reading ? 1 : 0;
      const currentS = row?.Speaking ? 1 : 0;
      const currentW = row?.Writing ? 1 : 0;
      
      const newL = Listening !== undefined ? Number(Listening) : currentL;
      const newR = Reading !== undefined ? Number(Reading) : currentR;
      const newS = Speaking !== undefined ? Number(Speaking) : currentS;
      const newW = Writing !== undefined ? Number(Writing) : currentW;

      if ((KyNang !== undefined && KyNang !== currentKyNang) ||
          (Listening !== undefined && newL !== currentL) ||
          (Reading !== undefined && newR !== currentR) ||
          (Speaking !== undefined && newS !== currentS) ||
          (Writing !== undefined && newW !== currentW)) {
        return res.status(400).json({ message: "Không thể thay đổi kỹ năng của khóa khi đã có lớp trong khóa!" });
      }
    }

    await pool.request()
      .input("id", req.params.id)
      .input("TenKhoaHoc", TenKhoaHoc)
      .input("MoTa", MoTa || "")
      .input("TrinhDo", TrinhDo || "")
      .input("KyNang", KyNang === undefined ? null : KyNang)
      .input("Listening", Listening !== undefined ? Number(Listening) : null)
      .input("Reading", Reading !== undefined ? Number(Reading) : null)
      .input("Speaking", Speaking !== undefined ? Number(Speaking) : null)
      .input("Writing", Writing !== undefined ? Number(Writing) : null)
      .query(`
        UPDATE KHOAHOC 
        SET TenKhoaHoc=@TenKhoaHoc, MoTa=@MoTa, TrinhDo=@TrinhDo, 
            KyNang=COALESCE(@KyNang, KyNang),
            Listening=COALESCE(@Listening, Listening),
            Reading=COALESCE(@Reading, Reading),
            Speaking=COALESCE(@Speaking, Speaking),
            Writing=COALESCE(@Writing, Writing)
        WHERE MaKhoaHoc=@id
      `)
    res.json({ message: "Đã cập nhật" })
  } catch (err) { res.status(500).send(err.message) }
})

// ── Tạo KhoaHocChiTiet ──
app.post("/qtv/khoahocchitiet", async (req, res) => {
  try {
    const { TenLop, MoTa, MaKhoaHoc } = req.body
    const pool = await poolPromise
    const result = await pool.request()
      .input("TenLop", TenLop).input("MoTa", MoTa || "").input("MaKhoaHoc", MaKhoaHoc)
      .query(`INSERT INTO KHOAHOCCHITIET (TenLop, MoTa, MaKhoaHoc) 
              OUTPUT INSERTED.MaLop
              VALUES (@TenLop, @MoTa, @MaKhoaHoc)`)
              
    const newMaLop = result.recordset[0].MaLop

    // Đồng bộ lại TrinhDo trong KHOAHOC
    const levelsResult = await pool.request()
      .input("courseId", MaKhoaHoc)
      .query(`SELECT TenLop FROM KHOAHOCCHITIET WHERE MaKhoaHoc = @courseId`)
    const levelsStr = levelsResult.recordset.map(r => r.TenLop.trim()).filter(Boolean).join(", ")
    await pool.request()
      .input("courseId", MaKhoaHoc)
      .input("TrinhDo", levelsStr)
      .query(`UPDATE KHOAHOC SET TrinhDo = @TrinhDo WHERE MaKhoaHoc = @courseId`)

    res.json({ MaLop: newMaLop })
  } catch (err) { res.status(500).send(err.message) }
})

// ── Cập nhật KhoaHocChiTiet (Trình độ) ──
app.put("/qtv/khoahocchitiet/:maLop", async (req, res) => {
  try {
    const { TenLop } = req.body
    const pool = await poolPromise
    
    // Lấy MaKhoaHoc trước để đồng bộ
    const getCourseResult = await pool.request()
      .input("maLop", req.params.maLop)
      .query(`SELECT MaKhoaHoc FROM KHOAHOCCHITIET WHERE MaLop = @maLop`)
      
    if (getCourseResult.recordset.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy trình độ" })
    }
    
    const courseId = getCourseResult.recordset[0].MaKhoaHoc

    await pool.request()
      .input("maLop", req.params.maLop)
      .input("TenLop", TenLop)
      .query(`UPDATE KHOAHOCCHITIET SET TenLop = @TenLop WHERE MaLop = @maLop`)

    // Đồng bộ lại TrinhDo trong KHOAHOC
    const levelsResult = await pool.request()
      .input("courseId", courseId)
      .query(`SELECT TenLop FROM KHOAHOCCHITIET WHERE MaKhoaHoc = @courseId`)
    const levelsStr = levelsResult.recordset.map(r => r.TenLop.trim()).filter(Boolean).join(", ")
    await pool.request()
      .input("courseId", courseId)
      .input("TrinhDo", levelsStr)
      .query(`UPDATE KHOAHOC SET TrinhDo = @TrinhDo WHERE MaKhoaHoc = @courseId`)

    res.json({ message: "Cập nhật thành công" })
  } catch (err) { res.status(500).send(err.message) }
})

// ── Xóa KhoaHocChiTiet (Trình độ) ──
app.delete("/qtv/khoahocchitiet/:maLop", async (req, res) => {
  try {
    const pool = await poolPromise
    
    // Lấy MaKhoaHoc trước để đồng bộ
    const getCourseResult = await pool.request()
      .input("maLop", req.params.maLop)
      .query(`SELECT MaKhoaHoc FROM KHOAHOCCHITIET WHERE MaLop = @maLop`)
      
    if (getCourseResult.recordset.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy trình độ" })
    }
    
    const courseId = getCourseResult.recordset[0].MaKhoaHoc

    // Kiểm tra xem có lớp học (LOPHOC) nào đang trỏ tới MaLop này không
    const classCheck = await pool.request()
      .input("maLop", req.params.maLop)
      .query(`SELECT COUNT(*) AS count FROM LOPHOC WHERE MaLop = @maLop`)
      
    if (classCheck.recordset[0].count > 0) {
      return res.status(400).json({ message: "Không thể xóa trình độ này vì đang có lớp học thuộc trình độ này!" })
    }

    await pool.request()
      .input("maLop", req.params.maLop)
      .query(`DELETE FROM KHOAHOCCHITIET WHERE MaLop = @maLop`)

    // Đồng bộ lại TrinhDo trong KHOAHOC
    const levelsResult = await pool.request()
      .input("courseId", courseId)
      .query(`SELECT TenLop FROM KHOAHOCCHITIET WHERE MaKhoaHoc = @courseId`)
    const levelsStr = levelsResult.recordset.map(r => r.TenLop.trim()).filter(Boolean).join(", ")
    await pool.request()
      .input("courseId", courseId)
      .input("TrinhDo", levelsStr)
      .query(`UPDATE KHOAHOC SET TrinhDo = @TrinhDo WHERE MaKhoaHoc = @courseId`)

    res.json({ message: "Xóa thành công" })
  } catch (err) { res.status(500).send(err.message) }
})
app.get("/teacher/students/:maNguoiDung", async (req, res) => {
  try {
    const pool = await poolPromise
    const result = await pool.request()
      .input("maNguoiDung", req.params.maNguoiDung)
      .query(`
        SELECT DISTINCT
          sl.MaSinhVien,
          n.HoTen,
          n.GioiTinh,
          l.TenLop AS Lop,
          k.TenKhoaHoc,
          sl.NgayGhiDanh,
          sl.TrangThai
        FROM SINHVIEN_LOPHOC sl
        JOIN SINHVIEN s ON sl.MaSinhVien = s.MaSinhVien
        JOIN NGUOIDUNG n ON s.MaNguoiDung = n.MaNguoiDung
        JOIN LOPHOC l ON sl.MaLopHoc = l.MaLopHoc
        JOIN PHANCONGGIANGVIEN pc ON l.MaLopHoc = pc.MaLopHoc
        JOIN GIANGVIEN g ON pc.MaGiangVien = g.MaGiangVien
        JOIN KHOAHOCCHITIET kc ON l.MaLop = kc.MaLop
        JOIN KHOAHOC k ON kc.MaKhoaHoc = k.MaKhoaHoc
        WHERE g.MaNguoiDung = @maNguoiDung
        ORDER BY sl.MaSinhVien
      `)
    res.json(result.recordset)
  } catch (err) { res.status(500).send(err.message) }
})
// Lấy lớp học của giảng viên
app.get("/teacher/classes/:maNguoiDung", async (req, res) => {
  try {
    const pool = await poolPromise
    const result = await pool.request()
      .input("maNguoiDung", req.params.maNguoiDung)
      .query(`
        SELECT DISTINCT
          l.MaLopHoc, l.TenLop, l.LichHoc,
          l.SoLuongHocVien,
          COALESCE((
            SELECT TOP 1 
              CASE 
                WHEN (SELECT COUNT(*) FROM BUOIHOC WHERE MaLopHoc = l.MaLopHoc) = 0 THEN 0
                ELSE ROUND(CAST(active_bh.ThuTu AS FLOAT) / (SELECT COUNT(*) FROM BUOIHOC WHERE MaLopHoc = l.MaLopHoc) * 100, 0)
              END
            FROM BUOIHOC active_bh 
            WHERE active_bh.MaBuoiHoc = l.ActiveBuoiHocId
          ), 0) AS TienDo,
          k.TenKhoaHoc
        FROM LOPHOC l
        JOIN PHANCONGGIANGVIEN pc ON l.MaLopHoc = pc.MaLopHoc
        JOIN GIANGVIEN g ON pc.MaGiangVien = g.MaGiangVien
        JOIN KHOAHOCCHITIET kc ON l.MaLop = kc.MaLop
        JOIN KHOAHOC k ON kc.MaKhoaHoc = k.MaKhoaHoc
        WHERE g.MaNguoiDung = @maNguoiDung
        ORDER BY l.MaLopHoc
      `)
    res.json(result.recordset)
  } catch (err) { res.status(500).send(err.message) }
})
// Kết quả học tập của lesson — chỉ sinh viên trong lớp GV phụ trách
app.get("/buoihoc/:id/students/:maNguoiDung", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("id", req.params.id)
      .input("maNguoiDung", req.params.maNguoiDung)
      .query(`
        SELECT 
          s.MaSinhVien,
          n.HoTen,
          -- Tiến độ = số bài tập (BAITAP) đã nộp / tổng số bài tập trong buổi học
          CASE 
            WHEN total.TongBai = 0 THEN 0
            ELSE ROUND(CAST(COUNT(DISTINCT b.MaBaiNop) AS FLOAT) / total.TongBai * 100, 0)
          END AS TienDo,
          CASE 
            WHEN COUNT(DISTINCT b.MaBaiNop) >= total.TongBai AND total.TongBai > 0 THEN N'Hoàn thành'
            ELSE N'Chưa hoàn thành'
          END AS TrangThai,
          ROUND(AVG(CAST(b.Diem AS FLOAT)), 1) AS DiemTrungBinh,
          COUNT(DISTINCT b.MaBaiNop) AS SoBaiDaLam
        FROM SINHVIEN s
        JOIN NGUOIDUNG n ON s.MaNguoiDung = n.MaNguoiDung
        JOIN DANGKYKHOAHOC d ON s.MaSinhVien = d.MaSinhVien
        JOIN KHOAHOC kh ON d.MaKhoaHoc = kh.MaKhoaHoc
        JOIN KHOAHOCCHITIET kc ON kh.MaKhoaHoc = kc.MaKhoaHoc
        JOIN LOPHOC l ON kc.MaLop = l.MaLop
        JOIN BUOIHOC ls ON ls.MaLopHoc = l.MaLopHoc AND ls.MaBuoiHoc = @id
        JOIN PHANCONGGIANGVIEN pc ON l.MaLopHoc = pc.MaLopHoc
        JOIN GIANGVIEN g ON pc.MaGiangVien = g.MaGiangVien
        -- Tổng số bài tập trong buổi học
        CROSS JOIN (
          SELECT COUNT(e.MaBaiTap) AS TongBai
          FROM BAITAP e
          JOIN BAIHOCKHOAHOC bh ON e.MaBaiHoc = bh.MaBaiHoc
          WHERE bh.MaBuoiHoc = @id
        ) total
        -- Bài tập sinh viên đã nộp trong lesson này
        LEFT JOIN BAINOP b ON b.MaSinhVien = n.MaNguoiDung
          AND b.MaBaiTap IN (
            SELECT e.MaBaiTap 
            FROM BAITAP e
            JOIN BAIHOCKHOAHOC bh ON e.MaBaiHoc = bh.MaBaiHoc
            WHERE bh.MaBuoiHoc = @id
          )
        WHERE g.MaNguoiDung = @maNguoiDung
        GROUP BY s.MaSinhVien, n.HoTen, total.TongBai
        ORDER BY s.MaSinhVien
      `);
    res.json(result.recordset);
  } catch (err) {
    console.error("Lỗi:", err.message);
    res.status(500).json({ message: err.message });
  }
});
// ── Xóa khóa học (kèm dữ liệu liên quan) ──
app.delete("/qtv/khoahoc/:id", async (req, res) => {
  try {
    const pool = await poolPromise
    await pool.request().input("id", req.params.id)
      .query(`
        -- 1. Xóa phân công giảng viên
        DELETE FROM PHANCONGGIANGVIEN 
        WHERE MaLopHoc IN (
          SELECT l.MaLopHoc 
          FROM LOPHOC l
          JOIN KHOAHOCCHITIET kc ON l.MaLop = kc.MaLop
          WHERE kc.MaKhoaHoc = @id
        );

        -- 2. Xóa ghi danh học viên lớp học
        DELETE FROM SINHVIEN_LOPHOC 
        WHERE MaLopHoc IN (
          SELECT l.MaLopHoc 
          FROM LOPHOC l
          JOIN KHOAHOCCHITIET kc ON l.MaLop = kc.MaLop
          WHERE kc.MaKhoaHoc = @id
        );

        -- 3. Xóa bài nộp học viên
        DELETE FROM BAINOP 
        WHERE MaBaiTap IN (
          SELECT e.MaBaiTap 
          FROM BAITAP e 
          WHERE e.MaBaiHoc IN (
            SELECT MaBaiHoc FROM BAIHOCKHOAHOC WHERE MaKhoaHoc = @id
          )
        );

        -- 4. Xóa bài tập
        DELETE FROM BAITAP 
        WHERE MaBaiHoc IN (
          SELECT MaBaiHoc FROM BAIHOCKHOAHOC WHERE MaKhoaHoc = @id
        );

        -- 5. Nullify ActiveBuoiHocId in LOPHOC
        UPDATE LOPHOC 
        SET ActiveBuoiHocId = NULL 
        WHERE MaLop IN (
          SELECT MaLop FROM KHOAHOCCHITIET WHERE MaKhoaHoc = @id
        );

        -- 6. Nullify MaBuoiHoc in BAIHOCKHOAHOC
        UPDATE BAIHOCKHOAHOC 
        SET MaBuoiHoc = NULL 
        WHERE MaBuoiHoc IN (
          SELECT ls.MaBuoiHoc 
          FROM BUOIHOC ls 
          JOIN LOPHOC l ON ls.MaLopHoc = l.MaLopHoc 
          JOIN KHOAHOCCHITIET kc ON l.MaLop = kc.MaLop 
          WHERE kc.MaKhoaHoc = @id
        );

        -- 7. Xóa các buổi học (BUOIHOC)
        DELETE FROM BUOIHOC 
        WHERE MaLopHoc IN (
          SELECT l.MaLopHoc 
          FROM LOPHOC l
          JOIN KHOAHOCCHITIET kc ON l.MaLop = kc.MaLop
          WHERE kc.MaKhoaHoc = @id
        );

        -- 8. Xóa đăng ký khóa học
        DELETE FROM DANGKYKHOAHOC WHERE MaKhoaHoc = @id;

        -- 9. Xóa tổng kết khóa học
        DELETE FROM TONGKETKHOAHOC WHERE MaKhoaHoc = @id;

        -- 10. Xóa các bảng liên quan đến bài thi/bài học trong khóa học
        DELETE FROM DAPAN WHERE MaCauHoi IN (
          SELECT MaCauHoi FROM CAUHOI WHERE MaBaiKiemTra IN (
            SELECT MaBaiKiemTra FROM BAIKIEMTRA WHERE MaBuoiHoc IN (
              SELECT MaBuoiHoc FROM BUOIHOC WHERE MaLopHoc IN (
                SELECT l.MaLopHoc FROM LOPHOC l JOIN KHOAHOCCHITIET kc ON l.MaLop = kc.MaLop WHERE kc.MaKhoaHoc = @id
              )
            )
          )
        );

        DELETE FROM CAUHOI WHERE MaBaiKiemTra IN (
          SELECT MaBaiKiemTra FROM BAIKIEMTRA WHERE MaBuoiHoc IN (
            SELECT MaBuoiHoc FROM BUOIHOC WHERE MaLopHoc IN (
              SELECT l.MaLopHoc FROM LOPHOC l JOIN KHOAHOCCHITIET kc ON l.MaLop = kc.MaLop WHERE kc.MaKhoaHoc = @id
            )
          )
        );

        DELETE FROM KETQUABAIKIEMTRA WHERE MaBaiKiemTra IN (
          SELECT MaBaiKiemTra FROM BAIKIEMTRA WHERE MaBuoiHoc IN (
            SELECT MaBuoiHoc FROM BUOIHOC WHERE MaLopHoc IN (
              SELECT l.MaLopHoc FROM LOPHOC l JOIN KHOAHOCCHITIET kc ON l.MaLop = kc.MaLop WHERE kc.MaKhoaHoc = @id
            )
          )
        );

        DELETE FROM BAIKIEMTRA WHERE MaBuoiHoc IN (
          SELECT MaBuoiHoc FROM BUOIHOC WHERE MaLopHoc IN (
            SELECT l.MaLopHoc FROM LOPHOC l JOIN KHOAHOCCHITIET kc ON l.MaLop = kc.MaLop WHERE kc.MaKhoaHoc = @id
          )
        );

        DELETE FROM TIENDOHOCTAP WHERE MaBaiHoc IN (
          SELECT MaBaiHoc FROM BAIHOCKHOAHOC WHERE MaKhoaHoc = @id
        );

        -- 11. Xóa bài học khóa học
        DELETE FROM BAIHOCKHOAHOC WHERE MaKhoaHoc = @id;

        -- 12. Xóa các lớp học (LOPHOC)
        DELETE FROM LOPHOC 
        WHERE MaLop IN (
          SELECT MaLop FROM KHOAHOCCHITIET WHERE MaKhoaHoc = @id
        );

        -- 13. Xóa chi tiết khóa học (KHOAHOCCHITIET)
        DELETE FROM KHOAHOCCHITIET WHERE MaKhoaHoc = @id;

        -- 14. Xóa chính khóa học (KHOAHOC)
        DELETE FROM KHOAHOC WHERE MaKhoaHoc = @id;
      `)
    res.json({ message: "Đã xóa khóa học" })
  } catch (err) {
    console.error("Lỗi xóa khóa học:", err.message)
    res.status(500).json({ message: err.message })
  }
})
app.get("/lophoc/:maLopHoc/tiendo", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("maLopHoc", req.params.maLopHoc)
      .query(`
        SELECT 
          CASE 
            WHEN total.TongBai = 0 OR sv.SoSinhVien = 0 THEN 0
            ELSE ROUND(
              CAST(COUNT(DISTINCT b.MaBaiNop) AS FLOAT) / 
              (total.TongBai * sv.SoSinhVien) * 100, 0
            )
          END AS TienDo
        FROM LOPHOC lh
        CROSS JOIN (
          SELECT COUNT(e.MaBaiTap) AS TongBai
          FROM BAITAP e
          JOIN BAIHOCKHOAHOC bh ON e.MaBaiHoc = bh.MaBaiHoc
          JOIN BUOIHOC l ON bh.MaBuoiHoc = l.MaBuoiHoc
          WHERE l.MaLopHoc = @maLopHoc
        ) total
        CROSS JOIN (
          SELECT COUNT(DISTINCT sl.MaSinhVien) AS SoSinhVien
          FROM SINHVIEN_LOPHOC sl
          WHERE sl.MaLopHoc = @maLopHoc
        ) sv
        LEFT JOIN BUOIHOC l ON l.MaLopHoc = lh.MaLopHoc
        LEFT JOIN BAIHOCKHOAHOC bh ON bh.MaBuoiHoc = l.MaBuoiHoc
        LEFT JOIN BAITAP e ON e.MaBaiHoc = bh.MaBaiHoc
        LEFT JOIN BAINOP b ON b.MaBaiTap = e.MaBaiTap
        WHERE lh.MaLopHoc = @maLopHoc
        GROUP BY total.TongBai, sv.SoSinhVien
      `);
    res.json(result.recordset[0] || { TienDo: 0 });
  } catch (err) { res.status(500).send(err.message); }
});

// Lấy toàn bộ bài tập và bài kiểm tra phục vụ duyệt bài
app.get("/qtv/baitap", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      -- Lấy danh sách Bài tập
      SELECT DISTINCT 'baitap-' + CAST(e.MaBaiTap AS VARCHAR) AS MaBaiTap, 
             e.TieuDe AS Title, 
             N'Bài tập' AS Type, 
             e.NgayTao AS CreatedDate,
             e.NoiDung AS Content, 
             e.CauHoi AS Questions, 
             NULL AS Vocabulary, 
             e.TrangThai AS TrangThai, 
             e.KyNang AS KyNang, 
             e.DangBai AS DangBai,
             n.HoTen AS TenGiangVien, 
             k.TenKhoaHoc, 
             k.TrinhDo AS CapDo,
             l.TenLop
      FROM BAITAP e
      LEFT JOIN GIANGVIEN gv ON e.MaGiangVien = gv.MaGiangVien
      LEFT JOIN NGUOIDUNG n ON gv.MaNguoiDung = n.MaNguoiDung
      LEFT JOIN BAIHOCKHOAHOC bh ON e.MaBaiHoc = bh.MaBaiHoc
      LEFT JOIN KHOAHOC k ON bh.MaKhoaHoc = k.MaKhoaHoc
      LEFT JOIN BUOIHOC ls ON bh.MaBuoiHoc = ls.MaBuoiHoc
      LEFT JOIN LOPHOC l ON ls.MaLopHoc = l.MaLopHoc

      UNION ALL

      -- Lấy danh sách Bài kiểm tra
      SELECT DISTINCT 'exam-' + CAST(e.MaBaiKiemTra AS VARCHAR) AS MaBaiTap, 
             e.TenBai AS Title, 
             N'Bài kiểm tra' AS Type, 
             NULL AS CreatedDate,
             N'Thời gian làm bài: ' + CAST(e.ThoiGian AS VARCHAR) + N' phút. Tổng điểm: ' + CAST(e.TongDiem AS VARCHAR) AS Content,
             NULL AS Questions, 
             NULL AS Vocabulary, 
             e.TrangThaiDuyet AS TrangThai, 
             NULL AS KyNang, 
             NULL AS DangBai,
             n.HoTen AS TenGiangVien, 
             k.TenKhoaHoc, 
             k.TrinhDo AS CapDo,
             l.TenLop
      FROM BAIKIEMTRA e
      LEFT JOIN GIANGVIEN gv ON e.MaGiangVien = gv.MaGiangVien
      LEFT JOIN NGUOIDUNG n ON gv.MaNguoiDung = n.MaNguoiDung
      LEFT JOIN BUOIHOC ls ON e.MaBuoiHoc = ls.MaBuoiHoc
      LEFT JOIN LOPHOC l ON ls.MaLopHoc = l.MaLopHoc
      LEFT JOIN KHOAHOC k ON l.MaLop = k.MaKhoaHoc
      ORDER BY MaBaiTap DESC
    `);
    res.json(result.recordset);
  } catch (err) { res.status(500).send(err.message); }
});

// Cập nhật trạng thái duyệt bài tập hoặc bài kiểm tra
app.put("/baitap/:id/status", async (req, res) => {
  try {
    const { TrangThai } = req.body;
    const { id } = req.params;
    const pool = await poolPromise;
    
    if (id.startsWith("exam-")) {
      const dbId = parseInt(id.replace("exam-", ""));
      await pool.request()
        .input("id", dbId)
        .input("TrangThai", TrangThai)
        .query(`UPDATE BAIKIEMTRA SET TrangThaiDuyet = @TrangThai WHERE MaBaiKiemTra = @id`);
      res.json({ message: "Đã cập nhật trạng thái bài kiểm tra" });
    } else {
      const dbId = parseInt(id.replace("baitap-", ""));
      await pool.request()
        .input("id", dbId)
        .input("TrangThai", TrangThai)
        .query(`UPDATE BAITAP SET TrangThai = @TrangThai WHERE MaBaiTap = @id`);
      res.json({ message: "Đã cập nhật trạng thái bài tập" });
    }
  } catch (err) { res.status(500).send(err.message); }
});

// Lấy tất cả điểm bài nộp kèm ngày nộp
app.get("/baocao/diem-all", async (req, res) => {
  try {
    const pool = await poolPromise
    const result = await pool.request().query(`
      SELECT 
        b.MaBaiNop, b.MaSinhVien, b.MaBaiTap, b.Diem, b.NgayNop
      FROM BAINOP b
    `)
    res.json(result.recordset)
  } catch (err) { res.status(500).send(err.message) }
})

// Cập nhật baitap-headers để kèm tên buổi học, ThuTu và MaBuoiHoc
app.get("/baocao/baitap-headers", async (req, res) => {
  try {
    const pool = await poolPromise
    const result = await pool.request().query(`
      SELECT 
        e.MaBaiTap, e.TieuDe AS TenBai,
        l.TenBuoiHoc AS TenBuoiHoc,
        l.ThuTu AS ThuTu,
        l.MaBuoiHoc AS MaBuoiHoc,
        l.MaLopHoc AS MaLopHoc,
        lh.TenLop AS TenLop
      FROM BAITAP e
      LEFT JOIN BAIHOCKHOAHOC b ON e.MaBaiHoc = b.MaBaiHoc
      LEFT JOIN BUOIHOC l ON b.MaBuoiHoc = l.MaBuoiHoc
      LEFT JOIN LOPHOC lh ON l.MaLopHoc = lh.MaLopHoc
      ORDER BY e.MaBaiTap
    `)
    res.json(result.recordset)
  } catch (err) { res.status(500).send(err.message) }
})

// Lấy toàn bộ phân công giảng viên cho tất cả các lớp
app.get("/baocao/giangvien-all", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT pc.MaLopHoc, pc.MaGiangVien, n.HoTen AS TenGiangVien
      FROM PHANCONGGIANGVIEN pc
      JOIN GIANGVIEN g ON pc.MaGiangVien = g.MaGiangVien
      JOIN NGUOIDUNG n ON g.MaNguoiDung = n.MaNguoiDung
    `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Lấy học viên + điểm từng bài tập
app.get("/baocao/hocvien", async (req, res) => {
  try {
    const pool = await poolPromise

    const svResult = await pool.request().query(`
      SELECT DISTINCT
        s.MaSinhVien, s.MaNguoiDung,
        n.HoTen, n.GioiTinh, n.NgaySinh,
        l.TenLop, k.TenKhoaHoc,
        sl.TrangThai, l.MaLopHoc
      FROM SINHVIEN s
      JOIN NGUOIDUNG n ON s.MaNguoiDung = n.MaNguoiDung
      LEFT JOIN SINHVIEN_LOPHOC sl ON s.MaSinhVien = sl.MaSinhVien
      LEFT JOIN LOPHOC l ON sl.MaLopHoc = l.MaLopHoc
      LEFT JOIN KHOAHOCCHITIET kc ON l.MaLop = kc.MaLop
      LEFT JOIN KHOAHOC k ON kc.MaKhoaHoc = k.MaKhoaHoc
      ORDER BY s.MaSinhVien
    `)

    const diemResult = await pool.request().query(`
      SELECT b.MaSinhVien, b.MaBaiTap, b.Diem
      FROM BAINOP b
    `)

    // Gom điểm theo MaSinhVien từ BAINOP
    const diemMap = {}
    for (const row of diemResult.recordset) {
      if (!diemMap[row.MaSinhVien]) diemMap[row.MaSinhVien] = {}
      diemMap[row.MaSinhVien][row.MaBaiTap] = row.Diem !== null ? row.Diem : "Cần chấm"
    }

    // Lookup đúng theo MaSinhVien
    const result = svResult.recordset.map((sinhVien) => ({
      ...sinhVien,
      baiTaps: diemMap[sinhVien.MaSinhVien] || {}
    }))

    res.json(result)
  } catch (err) {
    console.error("Lỗi baocao/hocvien:", err.message)
    res.status(500).send(err.message)
  }
})
// Lấy tất cả người dùng + vai trò
app.get("/admin/users", async (req, res) => {
  try {
    const pool = await poolPromise
    const result = await pool.request().query(`
      SELECT 
        n.MaNguoiDung, n.TenDangNhap, n.HoTen, n.Email,
        n.TrangThai, n.NgayTao,
        CASE 
          WHEN a.MaNguoiDung IS NOT NULL THEN N'Quản Trị Viên'
          WHEN g.MaNguoiDung IS NOT NULL THEN N'Giảng Viên'
          WHEN q.MaNguoiDung IS NOT NULL THEN N'Quản Trị Nội Dung'
          WHEN s.MaNguoiDung IS NOT NULL THEN N'Học Viên'
          ELSE N'Học Viên'
        END AS VaiTro
      FROM NGUOIDUNG n
      LEFT JOIN ADMIN a ON n.MaNguoiDung = a.MaNguoiDung
      LEFT JOIN GIANGVIEN g ON n.MaNguoiDung = g.MaNguoiDung
      LEFT JOIN QUANTRIVIENNOIDUNG q ON n.MaNguoiDung = q.MaNguoiDung
      LEFT JOIN SINHVIEN s ON n.MaNguoiDung = s.MaNguoiDung
      ORDER BY n.NgayTao DESC
    `)
    res.json(result.recordset)
  } catch (err) { res.status(500).send(err.message) }
})

// Cập nhật trạng thái / vai trò
app.put("/admin/users/:id", async (req, res) => {
  try {
    const { TrangThai, HoTen, Email, GioiTinh } = req.body
    const pool = await poolPromise
    await pool.request()
      .input("id", req.params.id)
      .input("TrangThai", TrangThai ?? null)
      .input("HoTen", HoTen ?? null)
      .input("Email", Email ?? null)
      .input("GioiTinh", GioiTinh ?? null)
      .query(`
        UPDATE NGUOIDUNG SET
          TrangThai = COALESCE(@TrangThai, TrangThai),
          HoTen     = COALESCE(@HoTen,     HoTen),
          Email     = COALESCE(@Email,      Email),
          GioiTinh  = COALESCE(@GioiTinh,  GioiTinh)
        WHERE MaNguoiDung = @id
      `)
    res.json({ message: "Đã cập nhật" })
  } catch (err) { res.status(500).send(err.message) }
})

// Tạo người dùng mới
app.post("/admin/users", async (req, res) => {
  try {
    const { TenDangNhap, HoTen, Email, MatKhau, VaiTro } = req.body
    const pool = await poolPromise
    // Tạo NGUOIDUNG
    const result = await pool.request()
      .input("TenDangNhap", TenDangNhap)
      .input("HoTen", HoTen)
      .input("Email", Email)
      .input("MatKhau", MatKhau || "123456")
      .query(`INSERT INTO NGUOIDUNG (TenDangNhap,HoTen,Email,MatKhau,TrangThai,NgayTao)
              OUTPUT INSERTED.MaNguoiDung
              VALUES (@TenDangNhap,@HoTen,@Email,@MatKhau,N'Active',GETDATE())`)
    const newId = result.recordset[0].MaNguoiDung
    // Gán vai trò
    if (VaiTro === "Giảng Viên") {
      await pool.request().input("id", newId)
        .query(`INSERT INTO GIANGVIEN (MaNguoiDung) VALUES (@id)`)
    } else if (VaiTro === "Quản Trị Nội Dung") {
      await pool.request().input("id", newId)
        .query(`INSERT INTO QUANTRIVIENNOIDUNG (MaNguoiDung) VALUES (@id)`)
    } else if (VaiTro === "Quản Trị Viên") {
      await pool.request().input("id", newId)
        .query(`INSERT INTO ADMIN (MaNguoiDung) VALUES (@id)`)
    } else {
      // Học Viên — cần MaSinhVien
      const maSV = "SV" + Date.now().toString().slice(-8)
      await pool.request().input("id", newId).input("maSV", maSV)
        .query(`INSERT INTO SINHVIEN (MaNguoiDung, MaSinhVien) VALUES (@id, @maSV)`)
    }
    res.json({ message: "Tạo thành công", MaNguoiDung: newId })
  } catch (err) { res.status(500).send(err.message) }
})

// Xóa người dùng
app.delete("/admin/users/:id", async (req, res) => {
  try {
    const pool = await poolPromise
    await pool.request().input("id", req.params.id)
      .query(`UPDATE NGUOIDUNG SET TrangThai=N'Khóa' WHERE MaNguoiDung=@id`)
    res.json({ message: "Đã khóa tài khoản" })
  } catch (err) { res.status(500).send(err.message) }
})
// Đăng ký theo tháng trong năm hiện tại
app.get("/admin/stats/dangky-thang", async (req, res) => {
  try {
    const pool = await poolPromise
    const result = await pool.request().query(`
      SELECT 
        MONTH(NgayDangKy) AS Thang,
        COUNT(*) AS SoLuong
      FROM DANGKYKHOAHOC
      WHERE YEAR(NgayDangKy) = YEAR(GETDATE())
      GROUP BY MONTH(NgayDangKy)
      ORDER BY Thang
    `)
    res.json(result.recordset)
  } catch (err) { res.status(500).send(err.message) }
})

// Trạng thái khóa học
app.get("/admin/stats/trangthaidangky", async (req, res) => {
  try {
    const pool = await poolPromise
    const result = await pool.request().query(`
      SELECT TrangThai, COUNT(*) AS SoLuong
      FROM KHOAHOC
      GROUP BY TrangThai
    `)
    res.json(result.recordset)
  } catch (err) { res.status(500).send(err.message) }
})

// Khóa học theo trình độ
app.get("/admin/stats/khoahoc", async (req, res) => {
  try {
    const pool = await poolPromise
    const result = await pool.request().query(`
      SELECT TrinhDo, COUNT(*) AS SoLuong
      FROM KHOAHOC
      GROUP BY TrinhDo
      ORDER BY SoLuong DESC
    `)
    res.json(result.recordset)
  } catch (err) { res.status(500).send(err.message) }
})
// Khóa học public (đã duyệt) cho trang chủ
app.get("/courses/public", async (req, res) => {
  try {
    const pool = await poolPromise
    const result = await pool.request().query(`
      SELECT 
        k.MaKhoaHoc, k.TenKhoaHoc, k.MoTa, k.TrinhDo,
        (
          SELECT TOP 1 nd.HoTen
          FROM KHOAHOCCHITIET khct
          JOIN LOPHOC lh ON khct.MaLop = lh.MaLop
          JOIN PHANCONGGIANGVIEN pcgv ON lh.MaLopHoc = pcgv.MaLopHoc
          JOIN GIANGVIEN gv ON pcgv.MaGiangVien = gv.MaGiangVien
          JOIN NGUOIDUNG nd ON gv.MaNguoiDung = nd.MaNguoiDung
          WHERE khct.MaKhoaHoc = k.MaKhoaHoc
        ) AS HoTen
      FROM KHOAHOC k
      WHERE k.TrangThai = N'Đã duyệt'
      ORDER BY k.NgayTao DESC
    `)
    res.json(result.recordset)
  } catch (err) { res.status(500).send(err.message) }
})

// Lấy MaSinhVien từ MaNguoiDung
app.get("/students/by-user/:maNguoiDung", async (req, res) => {
  try {
    const pool = await poolPromise
    const result = await pool.request()
      .input("maNguoiDung", req.params.maNguoiDung)
      .query(`SELECT MaSinhVien FROM SINHVIEN WHERE MaNguoiDung = @maNguoiDung`)
    
    if (result.recordset.length > 0) {
      return res.json(result.recordset[0]);
    }

    // Nếu chưa có record trong SINHVIEN, kiểm tra xem người dùng này có thực sự là học viên không
    const userCheck = await pool.request()
      .input("maNguoiDung", req.params.maNguoiDung)
      .query(`
        SELECT MaNguoiDung FROM NGUOIDUNG WHERE MaNguoiDung = @maNguoiDung
        AND MaNguoiDung NOT IN (SELECT MaNguoiDung FROM GIANGVIEN)
        AND MaNguoiDung NOT IN (SELECT MaNguoiDung FROM ADMIN)
        AND MaNguoiDung NOT IN (SELECT MaNguoiDung FROM QUANTRIVIENNOIDUNG)
      `);

    if (userCheck.recordset.length > 0) {
      // Tự động tạo mã sinh viên nếu thiếu (Ví dụ cho tài khoản seed)
      const maSV = "SV" + Date.now().toString().slice(-8);
      await pool.request()
        .input("maNguoiDung", req.params.maNguoiDung)
        .input("maSV", maSV)
        .query(`INSERT INTO SINHVIEN (MaNguoiDung, MaSinhVien) VALUES (@maNguoiDung, @maSV)`);
      
      return res.json({ MaSinhVien: maSV });
    }

    res.json(null)
  } catch (err) { res.status(500).send(err.message) }
})
// Chi tiết 1 khóa học (public)
app.get("/courses/:id/detail", async (req, res) => {
  try {
    const pool = await poolPromise
    const result = await pool.request()
      .input("id", req.params.id)
      .query(`
        SELECT 
          k.MaKhoaHoc, k.TenKhoaHoc, k.MoTa, k.TrinhDo, k.TrangThai,
          (
            SELECT TOP 1 nd.HoTen
            FROM KHOAHOCCHITIET khct
            JOIN LOPHOC lh ON khct.MaLop = lh.MaLop
            JOIN PHANCONGGIANGVIEN pcgv ON lh.MaLopHoc = pcgv.MaLopHoc
            JOIN GIANGVIEN gv ON pcgv.MaGiangVien = gv.MaGiangVien
            JOIN NGUOIDUNG nd ON gv.MaNguoiDung = nd.MaNguoiDung
            WHERE khct.MaKhoaHoc = k.MaKhoaHoc
          ) AS HoTen
        FROM KHOAHOC k
        WHERE k.MaKhoaHoc = @id AND k.TrangThai = N'Đã duyệt'
      `)
    res.json(result.recordset[0] || null)
  } catch (err) { res.status(500).send(err.message) }
})
// Lấy thông tin profile user
app.get("/users/:id", async (req, res) => {
  try {
    const pool = await poolPromise
    const result = await pool.request()
      .input("id", req.params.id)
      .query(`
        SELECT 
          n.MaNguoiDung, n.TenDangNhap, n.HoTen, n.Email,
          n.NgaySinh, n.GioiTinh, n.TrangThai,
          s.MaSinhVien, s.Lop
        FROM NGUOIDUNG n
        LEFT JOIN SINHVIEN s ON n.MaNguoiDung = s.MaNguoiDung
        WHERE n.MaNguoiDung = @id
      `)
    res.json(result.recordset[0] || null)
  } catch (err) { res.status(500).send(err.message) }
})

// Cập nhật profile
app.put("/users/:id/profile", async (req, res) => {
  try {
    const { HoTen, NgaySinh, Email, GioiTinh, Lop, MSSV } = req.body
    const pool = await poolPromise
    await pool.request()
      .input("id", req.params.id)
      .input("HoTen", HoTen || "")
      .input("NgaySinh", NgaySinh || null)
      .input("Email", Email || "")
      .input("GioiTinh", GioiTinh || "")
      .query(`
        UPDATE NGUOIDUNG 
        SET HoTen=@HoTen, NgaySinh=@NgaySinh, Email=@Email, GioiTinh=@GioiTinh
        WHERE MaNguoiDung=@id
      `)

    if (Lop !== undefined || MSSV !== undefined) {
      const request = pool.request().input("id", req.params.id);
      let setClauses = [];
      if (Lop !== undefined) {
        request.input("Lop", Lop || null);
        setClauses.push("Lop = @Lop");
      }
      if (MSSV !== undefined) {
        request.input("MSSV", MSSV || null);
        setClauses.push("MSSV = @MSSV");
      }
      await request.query(`
        UPDATE SINHVIEN
        SET ${setClauses.join(", ")}
        WHERE MaNguoiDung=@id
      `);
    }

    res.json({ message: "Đã cập nhật" })
  } catch (err) { res.status(500).send(err.message) }
})
// Lấy danh sách khóa học đã đăng ký của user
app.get("/users/:id/courses", async (req, res) => {
  try {
    const pool = await poolPromise
    const result = await pool.request()
      .input("id", req.params.id)
      .query(`
        SELECT k.TenKhoaHoc, d.NgayDangKy, d.TrangThai
        FROM DANGKYKHOAHOC d
        JOIN KHOAHOC k ON d.MaKhoaHoc = k.MaKhoaHoc
        JOIN SINHVIEN s ON d.MaSinhVien = s.MaSinhVien
        WHERE s.MaNguoiDung = @id
        ORDER BY d.NgayDangKy DESC
      `)
    res.json(result.recordset)
  } catch (err) { res.status(500).send(err.message) }
})
// Lấy toàn bộ danh sách lớp học để ghi danh
app.get("/student/all-classes", async (req, res) => {
  try {
    const pool = await poolPromise
    const result = await pool.request().query("SELECT MaLopHoc, TenLop FROM LOPHOC ORDER BY TenLop")
    res.json(result.recordset)
  } catch (err) { res.status(500).send(err.message) }
})

// Lấy danh sách lớp của sinh viên
app.get("/student/my-classes/:maNguoiDung", async (req, res) => {
  try {
    const pool = await poolPromise
    const result = await pool.request()
      .input("id", req.params.maNguoiDung)
      .query(`
        SELECT 
          l.MaLopHoc, l.TenLop, l.LichHoc, l.SoLuongHocVien,
          COALESCE(
            (
              SELECT TOP 1 
                CASE 
                  WHEN (SELECT COUNT(*) FROM BUOIHOC WHERE MaLopHoc = l.MaLopHoc) = 0 THEN 0
                  ELSE ROUND(CAST(active_bh.ThuTu AS FLOAT) / (SELECT COUNT(*) FROM BUOIHOC WHERE MaLopHoc = l.MaLopHoc) * 100, 0)
                END
              FROM BUOIHOC active_bh 
              WHERE active_bh.MaBuoiHoc = l.ActiveBuoiHocId
            ),
            l.TienDo,
            0
          ) AS TienDo,
          k.TenKhoaHoc,
          sl.TrangThai, sl.NgayGhiDanh
        FROM SINHVIEN_LOPHOC sl
        JOIN LOPHOC l ON sl.MaLopHoc = l.MaLopHoc
        JOIN KHOAHOCCHITIET kc ON l.MaLop = kc.MaLop
        JOIN KHOAHOC k ON kc.MaKhoaHoc = k.MaKhoaHoc
        JOIN SINHVIEN s ON sl.MaSinhVien = s.MaSinhVien
        WHERE s.MaNguoiDung = @id
        ORDER BY sl.NgayGhiDanh DESC
      `)
    res.json(result.recordset)
  } catch (err) { res.status(500).send(err.message) }
})

// Lấy bài học và bài tập học thử (free)
app.get("/student/free-content", async (req, res) => {
  try {
    const pool = await poolPromise
    const lectures = await pool.request().query("SELECT MaBaiHoc, TieuDe, LoaiBaiHoc, ThoiLuong, TrangThai, NoiDung, FileUrl FROM BAIHOCKHOAHOC WHERE IsFree = 1")
<<<<<<< Updated upstream
    const exercises = await pool.request().query("SELECT MaBaiTap, TieuDe AS Title, DangBai AS Type, TrangThai, NoiDung AS Content, CauHoi AS Questions FROM BAITAP WHERE HocThuMienPhi = 1")
=======
    const exercises = await pool.request().query(`
      SELECT MaBaiTap, TieuDe AS Title, 
             CASE WHEN LaBaiKiemTra = 1 THEN 'exam' ELSE 'homework' END AS Type, 
             TrangThai, NoiDung AS Content, CauHoi AS Questions 
      FROM BAITAP 
      WHERE HocThuMienPhi = 1
    `)
>>>>>>> Stashed changes
    res.json({ lectures: lectures.recordset, exercises: exercises.recordset })
  } catch (err) { res.status(500).send(err.message) }
})
// Bài tập của lớp
app.get("/classes/:id/baitap", async (req, res) => {
  try {
    const pool = await poolPromise
    const result = await pool.request()
      .input("id", req.params.id)
      .query(`
<<<<<<< Updated upstream
        SELECT e.MaBaiTap, e.TieuDe AS Title, e.DangBai AS Type, bh.MaBuoiHoc, l.ThuTu AS ThuTuBuoiHoc, e.TrangThai
=======
        SELECT e.MaBaiTap, e.TieuDe AS Title, 
               CASE WHEN e.LaBaiKiemTra = 1 THEN 'exam' ELSE 'homework' END AS Type, 
               bh.MaBuoiHoc, l.ThuTu AS ThuTuBuoiHoc, e.TrangThai
>>>>>>> Stashed changes
        FROM BAITAP e
        JOIN BAIHOCKHOAHOC bh ON e.MaBaiHoc = bh.MaBaiHoc
        JOIN BUOIHOC l ON bh.MaBuoiHoc = l.MaBuoiHoc
        WHERE l.MaLopHoc = @id AND (e.TrangThai = 'published' OR e.TrangThai IS NULL)
        ORDER BY l.ThuTu
      `)
    res.json(result.recordset)
  } catch (err) { res.status(500).send(err.message) }
})

// Tài liệu của lớp
app.get("/classes/:id/tailieu", async (req, res) => {
  try {
    const pool = await poolPromise
    const result = await pool.request()
      .input("id", req.params.id)
      .query(`
        SELECT t.MaTaiLieu, t.TieuDe, t.MoTa, t.FileUrl, t.MaBuoiHoc, t.MaBuoiHoc AS MaLesson
        FROM TAILIEU t
        JOIN BUOIHOC l ON t.MaBuoiHoc = l.MaBuoiHoc
        WHERE l.MaLopHoc = @id
        ORDER BY l.ThuTu
      `)
    res.json(result.recordset)
  } catch (err) { res.status(500).send(err.message) }
})

app.get("/student/bainop/:maNguoiDung", async (req, res) => {
  try {
    const { buoiHocId } = req.query  // nhận thêm ?buoiHocId=...
    const pool = await poolPromise
    
    let query = `
      SELECT b.MaBaiNop, b.MaBaiTap, b.Diem, b.NgayNop, b.TrangThai,
             e.TieuDe AS TenBaiTap, bg.MaBuoiHoc AS MaBuoiHoc
      FROM BAINOP b
      JOIN BAITAP e ON b.MaBaiTap = e.MaBaiTap
      LEFT JOIN BAIHOCKHOAHOC bg ON e.MaBaiHoc = bg.MaBaiHoc
      WHERE b.MaSinhVien = @id
    `
    
    // Nếu có buoiHocId thì lọc thêm
    if (buoiHocId) {
      query += ` AND bg.MaBuoiHoc = @buoiHocId`
    }
    
    const request = pool.request().input("id", req.params.maNguoiDung)
    if (buoiHocId) request.input("buoiHocId", buoiHocId)
    
    const result = await request.query(query)
    res.json(result.recordset)
  } catch (err) { res.status(500).send(err.message) }
})

app.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body
    const pool = await poolPromise

    // Kiểm tra email có tồn tại không
    const check = await pool.request()
      .input("email", email)
      .query(`SELECT MaNguoiDung, HoTen FROM NGUOIDUNG WHERE Email = @email`)

    if (check.recordset.length === 0)
      return res.status(404).json({ message: "Email không tồn tại trong hệ thống!" })

    const user = check.recordset[0]

    // Tạo mật khẩu mới ngẫu nhiên
    const newPassword = Math.random().toString(36).slice(-8)

    // Cập nhật mật khẩu mới vào DB
    await pool.request()
      .input("email", email)
      .input("newPassword", newPassword)
      .query(`UPDATE NGUOIDUNG SET MatKhau = @newPassword WHERE Email = @email`)

    // Gửi email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "huyenna01662182732@gmail.com",   // ← email của trường/hệ thống
        pass: "mnfxmfhbjakzqjwu"       // ← App Password (không phải mật khẩu gmail)
      }
    })

    await transporter.sendMail({
      from: '"FLIC Learning" <huyenna01662182732@gmail.com>',
      to: email,
      subject: "Mật khẩu mới của bạn – FLIC",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #eee;border-radius:12px">
          <h2 style="color:#e87722">🔐 FLIC – Đặt lại mật khẩu</h2>
          <p>Xin chào <b>${user.HoTen}</b>,</p>
          <p>Mật khẩu mới của bạn là:</p>
          <div style="background:#f9f5f0;padding:16px;border-radius:8px;text-align:center;font-size:24px;font-weight:700;letter-spacing:4px;color:#e87722">
            ${newPassword}
          </div>
          <p style="margin-top:16px">Vui lòng đăng nhập và đổi mật khẩu ngay sau khi nhận được email này.</p>
          <p style="color:#aaa;font-size:12px">Email này được gửi tự động từ hệ thống FLIC. Vui lòng không trả lời.</p>
        </div>
      `
    })

    res.json({ message: "Đã gửi mật khẩu mới về email của bạn!" })
  } catch (err) {
    console.error("Lỗi forgot password:", err.message)
    res.status(500).json({ message: "Lỗi khi gửi email. Vui lòng thử lại!" })
  }
})

// Cập nhật buổi học đang học của lớp
app.put("/classes/:id/active-buoihoc", async (req, res) => {
  const { activeBuoiHocId } = req.body
  try {
    const pool = await poolPromise
    await pool.request()
      .input("classId", req.params.id)
      .input("activeBuoiHocId", activeBuoiHocId || null)
      .query(`
        UPDATE LOPHOC 
        SET ActiveBuoiHocId = @activeBuoiHocId 
        WHERE MaLopHoc = @classId
      `)
    res.json({ message: "Cập nhật buổi học đang học thành công" })
  } catch (err) { res.status(500).send(err.message) }
})

// Lấy tất cả lộ trình buổi học cho báo cáo kết quả QTV
app.get("/baocao/buoihoc", async (req, res) => {
  try {
    const pool = await poolPromise
    const result = await pool.request().query(`
      SELECT 
        l.MaBuoiHoc, l.TenBuoiHoc, l.ThuTu, l.MaLopHoc, lh.TenLop, lh.ActiveBuoiHocId
      FROM BUOIHOC l
      LEFT JOIN LOPHOC lh ON l.MaLopHoc = lh.MaLopHoc
      ORDER BY l.ThuTu
    `)
    res.json(result.recordset)
  } catch (err) { res.status(500).send(err.message) }
})

/* ========== PHÂN QUYỀN - QUẢN LÝ QUYỀN CHI TIẾT ========== */
// Lấy quyền của người dùng từ database
app.get("/admin/users/:id/permissions", async (req, res) => {
  try {
    const pool = await poolPromise
    const result = await pool.request()
      .input("id", req.params.id)
      .query(`
        SELECT DISTINCT nq.MaQuyenHan, q.TenQuyenHan
        FROM NGUOIDUNG_QUYENHAN nq
        JOIN QUYENHAN q ON nq.MaQuyenHan = q.MaQuyenHan
        WHERE nq.MaNguoiDung = @id
        ORDER BY q.TenQuyenHan
      `)
    // Chuyển đổi sang format mà frontend cần
    const permissionCodes = result.recordset.map(r => {
      const name = r.TenQuyenHan
      // Chuyển tên quyền thành code
      const codeMap = {
        'Đăng bài giảng': 'LECTURE_CREATE',
        'Đăng bài tập': 'BAITAP_CREATE',
        'Đăng bài kiểm tra': 'QUIZ_CREATE',
        'Đăng bài luyện tập thêm': 'EXTRA_PRACTICE_CREATE',
        'Đăng tài liệu': 'DOCUMENT_CREATE_PENDING',
        'Chấm điểm': 'STUDENT_GRADE',
        'Xem điểm': 'GRADEBOOK_VIEW_ALL',
        'Xem bài làm học viên': 'SUBMISSION_VIEW',
        'Tạo lớp trong khóa': 'CLASS_MANAGE',
        'Phân lớp sinh viên': 'STUDENT_ASSIGN',
        'Duyệt bài đăng giáo viên': 'CONTENT_APPROVE'
      }
      return codeMap[name] || name
    })
    res.json({ permissions: permissionCodes })
  } catch (err) { 
    res.json({ permissions: [] })
  }
})

// Lưu quyền cho người dùng vào database
app.post("/admin/users/:id/permissions", async (req, res) => {
  try {
    const { permissions } = req.body // Mảng các TenQuyenHan
    const maNguoiDung = req.params.id
    const pool = await poolPromise
    
    // Xóa các quyền cũ của NGUOIDUNG này
    await pool.request()
      .input("maNguoiDung", maNguoiDung)
      .query(`DELETE FROM NGUOIDUNG_QUYENHAN WHERE MaNguoiDung = @maNguoiDung`)
    
    // Thêm quyền mới
    if (permissions && permissions.length > 0) {
      // Chuyển code sang TenQuyenHan
      const codeToNameMap = {
        'LECTURE_CREATE': 'Đăng bài giảng',
        'BAITAP_CREATE': 'Đăng bài tập',
        'QUIZ_CREATE': 'Đăng bài kiểm tra',
        'EXTRA_PRACTICE_CREATE': 'Đăng bài luyện tập thêm',
        'DOCUMENT_CREATE_PENDING': 'Đăng tài liệu',
        'STUDENT_GRADE': 'Chấm điểm',
        'GRADEBOOK_VIEW_CLASS': 'Xem điểm',
        'GRADEBOOK_VIEW_ALL': 'Xem điểm',
        'SUBMISSION_VIEW': 'Xem bài làm học viên',
        'CLASS_MANAGE': 'Tạo lớp trong khóa',
        'STUDENT_ASSIGN': 'Phân lớp sinh viên',
        'CONTENT_APPROVE': 'Duyệt bài đăng giáo viên'
      }
      
      for (const permCode of permissions) {
        const tenQuyen = codeToNameMap[permCode] || permCode
        const quyenResult = await pool.request()
          .input("ten", tenQuyen)
          .query(`SELECT MaQuyenHan FROM QUYENHAN WHERE TenQuyenHan = @ten`)
        
        if (quyenResult.recordset.length > 0) {
          const maQuyen = quyenResult.recordset[0].MaQuyenHan
          await pool.request()
            .input("maNguoiDung", maNguoiDung)
            .input("maQuyen", maQuyen)
            .query(`
              INSERT INTO NGUOIDUNG_QUYENHAN (MaNguoiDung, MaQuyenHan)
              VALUES (@maNguoiDung, @maQuyen)
            `)
        }
      }
    }
    
    res.json({ message: "Đã cập nhật quyền thành công" })
  } catch (err) { 
    res.status(500).json({ message: "Lỗi: " + err.message }) 
  }
})

// Lấy toàn bộ bài tập (có lọc theo GV nếu truyền maNguoiDung)
app.get("/exercises/list/all", async (req, res) => {
  try {
    const { maNguoiDung } = req.query;
    const pool = await poolPromise;
    let query = `
<<<<<<< Updated upstream
      SELECT DISTINCT e.MaBaiTap, e.TieuDe AS Title, e.DangBai AS Type, e.NgayTao AS CreatedDate, l.TenLop, ls.TenBuoiHoc
=======
      SELECT DISTINCT e.MaBaiTap, e.TieuDe AS Title, 
                      CASE WHEN e.LaBaiKiemTra = 1 THEN 'exam' ELSE 'homework' END AS Type, 
                      e.NgayTao AS CreatedDate, l.TenLop, ls.TenBuoiHoc
>>>>>>> Stashed changes
      FROM BAITAP e
      JOIN BAIHOCKHOAHOC bh ON e.MaBaiHoc = bh.MaBaiHoc
      JOIN BUOIHOC ls ON bh.MaBuoiHoc = ls.MaBuoiHoc
      JOIN LOPHOC l ON ls.MaLopHoc = l.MaLopHoc
    `;
    
    if (maNguoiDung) {
      // Check role
      const roleResult = await pool.request()
        .input("id", maNguoiDung)
        .query(`
          SELECT 
            CASE
              WHEN g.MaNguoiDung IS NOT NULL THEN 'Giảng Viên'
              ELSE 'Khác'
            END AS VaiTro
          FROM NGUOIDUNG n
          LEFT JOIN GIANGVIEN g ON n.MaNguoiDung = g.MaNguoiDung
          WHERE n.MaNguoiDung = @id
        `);
      const vaiTro = roleResult.recordset[0]?.VaiTro;
      if (vaiTro === 'Giảng Viên') {
        query += `
          JOIN PHANCONGGIANGVIEN pc ON l.MaLopHoc = pc.MaLopHoc
          JOIN GIANGVIEN gv ON pc.MaGiangVien = gv.MaGiangVien
          WHERE gv.MaNguoiDung = @maNguoiDung
        `;
      }
    }
    
    const request = pool.request();
    if (maNguoiDung) request.input("maNguoiDung", maNguoiDung);
    
    const result = await request.query(query + " ORDER BY e.MaBaiTap DESC");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Lấy toàn bộ tài liệu (có lọc theo GV nếu truyền maNguoiDung)
app.get("/tailieu/list/all", async (req, res) => {
  try {
    const { maNguoiDung } = req.query;
    const pool = await poolPromise;
    let query = `
      SELECT DISTINCT t.MaTaiLieu, t.TieuDe, t.MoTa, t.NgayCapNhat, l.TenLop, ls.TenBuoiHoc
      FROM TAILIEU t
      JOIN BUOIHOC ls ON t.MaBuoiHoc = ls.MaBuoiHoc
      JOIN LOPHOC l ON ls.MaLopHoc = l.MaLopHoc
    `;
    
    if (maNguoiDung) {
      const roleResult = await pool.request()
        .input("id", maNguoiDung)
        .query(`
          SELECT 
            CASE
              WHEN g.MaNguoiDung IS NOT NULL THEN 'Giảng Viên'
              ELSE 'Khác'
            END AS VaiTro
          FROM NGUOIDUNG n
          LEFT JOIN GIANGVIEN g ON n.MaNguoiDung = g.MaNguoiDung
          WHERE n.MaNguoiDung = @id
        `);
      const vaiTro = roleResult.recordset[0]?.VaiTro;
      if (vaiTro === 'Giảng Viên') {
        query += `
          JOIN PHANCONGGIANGVIEN pc ON l.MaLopHoc = pc.MaLopHoc
          JOIN GIANGVIEN gv ON pc.MaGiangVien = gv.MaGiangVien
          WHERE gv.MaNguoiDung = @maNguoiDung
        `;
      }
    }
    
    const request = pool.request();
    if (maNguoiDung) request.input("maNguoiDung", maNguoiDung);
    
    const result = await request.query(query + " ORDER BY t.MaTaiLieu DESC");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Lấy toàn bộ bài giảng (có lọc theo GV nếu truyền maNguoiDung)
app.get("/baigiang/list/all", async (req, res) => {
  try {
    const { maNguoiDung } = req.query;
    const pool = await poolPromise;
    let query = `
      SELECT DISTINCT b.MaBaiHoc, b.TieuDe, b.LoaiBaiHoc, b.ThoiLuong, l.TenLop, ls.TenBuoiHoc
      FROM BAIHOCKHOAHOC b
      JOIN BUOIHOC ls ON b.MaBuoiHoc = ls.MaBuoiHoc
      JOIN LOPHOC l ON ls.MaLopHoc = l.MaLopHoc
    `;
    
    if (maNguoiDung) {
      const roleResult = await pool.request()
        .input("id", maNguoiDung)
        .query(`
          SELECT 
            CASE
              WHEN g.MaNguoiDung IS NOT NULL THEN 'Giảng Viên'
              ELSE 'Khác'
            END AS VaiTro
          FROM NGUOIDUNG n
          LEFT JOIN GIANGVIEN g ON n.MaNguoiDung = g.MaNguoiDung
          WHERE n.MaNguoiDung = @id
        `);
      const vaiTro = roleResult.recordset[0]?.VaiTro;
      if (vaiTro === 'Giảng Viên') {
        query += `
          JOIN PHANCONGGIANGVIEN pc ON l.MaLopHoc = pc.MaLopHoc
          JOIN GIANGVIEN gv ON pc.MaGiangVien = gv.MaGiangVien
          WHERE gv.MaNguoiDung = @maNguoiDung
        `;
      }
    }
    
    const request = pool.request();
    if (maNguoiDung) request.input("maNguoiDung", maNguoiDung);
    
    const result = await request.query(query + " ORDER BY b.MaBaiHoc DESC");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Clone bài tập
app.post("/exercises/:id/clone", async (req, res) => {
  try {
    const { MaBuoiHoc } = req.body;
    if (!MaBuoiHoc) return res.status(400).json({ message: "Thiếu MaBuoiHoc" });
    const pool = await poolPromise;
    
    const orig = await pool.request()
      .input("id", req.params.id)
      .query("SELECT * FROM BAITAP WHERE MaBaiTap = @id");
    
    if (orig.recordset.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy bài tập gốc" });
    }
    
    const ex = orig.recordset[0];
    const today = new Date().toISOString().split('T')[0];

    let targetMaBaiHoc = null;
    const bhResult = await pool.request()
      .input("buoiHocId", MaBuoiHoc)
      .query(`SELECT TOP 1 MaBaiHoc FROM BAIHOCKHOAHOC WHERE MaBuoiHoc = @buoiHocId ORDER BY ThuTu ASC`);
    if (bhResult.recordset.length > 0) {
      targetMaBaiHoc = bhResult.recordset[0].MaBaiHoc;
    } else {
      const insertBh = await pool.request()
        .input("buoiHocId", MaBuoiHoc)
        .query(`
          INSERT INTO BAIHOCKHOAHOC (MaKhoaHoc, MaGiangVien, TieuDe, NoiDung, TrangThai, MaBuoiHoc)
          VALUES (1, 1, N'Bài giảng mặc định', '', 'published', @buoiHocId);
          SELECT SCOPE_IDENTITY() AS MaBaiHoc;
        `);
      targetMaBaiHoc = insertBh.recordset[0].MaBaiHoc;
    }
    
    await pool.request()
      .input("TieuDe", ex.TieuDe)
      .input("DangBai", ex.DangBai || null)
      .input("NoiDung", ex.NoiDung || "")
      .input("CauHoi", ex.CauHoi || "")
      .input("CreatedDate", today)
      .input("MaBaiHoc", targetMaBaiHoc)
      .input("LinkAmThanh", ex.LinkAmThanh || "")
      .input("HienThiDapAn", ex.HienThiDapAn ? 1 : 0)
      .input("HocThuMienPhi", ex.HocThuMienPhi ? 1 : 0)
      .input("LaBaiKiemTra", ex.LaBaiKiemTra ? 1 : 0)
      .input("TrangThai", ex.TrangThai || "draft")
      .input("KyNang", ex.KyNang || "")
      .input("MaGiangVien", ex.MaGiangVien || null)
      .input("FileDinhKem", ex.FileDinhKem || null)
      .query(`
        INSERT INTO BAITAP 
          (TieuDe, DangBai, NoiDung, CauHoi, NgayTao, MaBaiHoc, LinkAmThanh, HienThiDapAn, HocThuMienPhi, LaBaiKiemTra, TrangThai, KyNang, MaGiangVien, FileDinhKem)
        VALUES 
          (@TieuDe, @DangBai, @NoiDung, @CauHoi, @CreatedDate, @MaBaiHoc, @LinkAmThanh, @HienThiDapAn, @HocThuMienPhi, @LaBaiKiemTra, @TrangThai, @KyNang, @MaGiangVien, @FileDinhKem)
      `);
      
    res.json({ message: "Sao chép bài tập thành công" });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Clone tài liệu
app.post("/tailieu/:id/clone", async (req, res) => {
  try {
    const { MaBuoiHoc } = req.body;
    if (!MaBuoiHoc) return res.status(400).json({ message: "Thiếu MaBuoiHoc" });
    const pool = await poolPromise;
    
    const orig = await pool.request()
      .input("id", req.params.id)
      .query("SELECT * FROM TAILIEU WHERE MaTaiLieu = @id");
      
    if (orig.recordset.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy tài liệu gốc" });
    }
    
    const tl = orig.recordset[0];
    
    await pool.request()
      .input("TieuDe", tl.TieuDe)
      .input("MoTa", tl.MoTa || "")
      .input("MaBuoiHoc", MaBuoiHoc)
      .input("NoiDung", tl.NoiDung || "")
      .input("FileUrl", tl.FileUrl || "")
      .query(`
        INSERT INTO TAILIEU (TieuDe, MoTa, MaBuoiHoc, NoiDung, FileUrl, NgayCapNhat)
        VALUES (@TieuDe, @MoTa, @MaBuoiHoc, @NoiDung, @FileUrl, GETDATE())
      `);
      
    res.json({ message: "Sao chép tài liệu thành công" });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Clone bài giảng
app.post("/baigiang/:id/clone", async (req, res) => {
  try {
    const { MaBuoiHoc } = req.body;
    if (!MaBuoiHoc) return res.status(400).json({ message: "Thiếu MaBuoiHoc" });
    const pool = await poolPromise;
    
    const orig = await pool.request()
      .input("id", req.params.id)
      .query("SELECT * FROM BAIHOCKHOAHOC WHERE MaBaiHoc = @id");
      
    if (orig.recordset.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy bài giảng gốc" });
    }
    
    const bg = orig.recordset[0];
    
    await pool.request()
      .input("TieuDe", bg.TieuDe)
      .input("NoiDung", bg.NoiDung || "")
      .input("FileUrl", bg.FileUrl || "")
      .input("LoaiBaiHoc", bg.LoaiBaiHoc)
      .input("ThoiLuong", bg.ThoiLuong)
      .input("TrangThai", bg.TrangThai || "draft")
      .input("ThuTu", bg.ThuTu || 1)
      .input("MaKhoaHoc", bg.MaKhoaHoc)
      .input("MaGiangVien", bg.MaGiangVien)
      .input("MaBuoiHoc", MaBuoiHoc)
      .query(`
        INSERT INTO BAIHOCKHOAHOC (TieuDe, NoiDung, FileUrl, LoaiBaiHoc, ThoiLuong, TrangThai, ThuTu, MaKhoaHoc, MaGiangVien, MaBuoiHoc)
        VALUES (@TieuDe, @NoiDung, @FileUrl, @LoaiBaiHoc, @ThoiLuong, @TrangThai, @ThuTu, @MaKhoaHoc, @MaGiangVien, @MaBuoiHoc)
      `);
      
    res.json({ message: "Sao chép bài giảng thành công" });
  } catch (err) {
    res.status(500).send(err.message);
  }
});



const initDb = async () => {
  try {
    const pool = await poolPromise
    await pool.request().query(`
      IF NOT EXISTS (
          SELECT * FROM sys.columns 
          WHERE object_id = OBJECT_ID('dbo.LOPHOC') AND name = 'ActiveBuoiHocId'
      )
      BEGIN
          ALTER TABLE dbo.LOPHOC ADD ActiveBuoiHocId INT NULL;
      END
    `)
    console.log("Database initialized successfully (ActiveBuoiHocId checked/added).")
  } catch (err) {
    console.error("Database initialization error:", err.message)
  }
}

initDb().then(() => {
  app.listen(5000, () => console.log("Server running on port 5000"))
})