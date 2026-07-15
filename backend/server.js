const express = require("express");
const cors = require("cors");
const { poolPromise } = require("./config/db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer")

const app = express();

// Helper functions to convert between integer MaSinhVien in Database and string SV000000xx on UI
function parseStudentId(maSVStr) {
  if (!maSVStr) return null;
  if (typeof maSVStr === "string" && maSVStr.startsWith("SV")) {
    return parseInt(maSVStr.replace("SV", ""), 10);
  }
  const val = parseInt(maSVStr, 10);
  return isNaN(val) ? null : val;
}

function formatStudentId(maSVInt) {
  if (maSVInt === undefined || maSVInt === null) return "";
  return "SV" + String(maSVInt).padStart(8, '0');
}

function normalizeTrangThai(status) {
  const s = (status || "").toLowerCase().trim();
  if (s === "published" || s === "đã duyệt" || s === "hoạt động") return "Đã duyệt";
  if (s === "rejected" || s === "từ chối" || s === "ẩn") return "Từ chối";
  if (s === "pending" || s === "chờ duyệt") return "Chờ duyệt";
  return "Lưu nháp";
}

function normalizeDeadline(value) {
  if (!value || value === "null" || value === "undefined") return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === "number") return new Date(value);
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  const candidate = trimmed.includes("T") || trimmed.includes(" ")
    ? trimmed.replace(" ", "T")
    : `${trimmed}T00:00:00`;

  const date = new Date(candidate);
  return Number.isNaN(date.getTime()) ? null : date;
}

async function isClassCompletedByBuoiHoc(pool, maBuoiHoc) {
  if (!maBuoiHoc) return false;
  const res = await pool.request()
    .input("maBuoiHoc", maBuoiHoc)
    .query(`
      SELECT lh.TrangThai 
      FROM BUOIHOC bh 
      JOIN LOPHOC lh ON bh.MaLopHoc = lh.MaLopHoc 
      WHERE bh.MaBuoiHoc = @maBuoiHoc
    `);
  if (res.recordset.length > 0) {
    return res.recordset[0].TrangThai === "Đã hoàn thành";
  }
  return false;
}

async function isBuoiHocCompleted(pool, maBuoiHoc) {
  if (!maBuoiHoc) return false;
  const res = await pool.request()
    .input("maBuoiHoc", maBuoiHoc)
    .query(`
      SELECT TrangThai 
      FROM BUOIHOC 
      WHERE MaBuoiHoc = @maBuoiHoc
    `);
  if (res.recordset.length > 0) {
    return res.recordset[0].TrangThai === 'Đã hoàn thành';
  }
  return false;
}

async function isClassCompletedByBaiTap(pool, maBaiTap) {
  if (!maBaiTap) return false;
  let targetId = maBaiTap;
  let isExam = false;
  let isPractice = false;
  if (typeof maBaiTap === "string") {
    if (maBaiTap.startsWith("exam-")) {
      targetId = parseInt(maBaiTap.replace("exam-", ""), 10);
      isExam = true;
    } else if (maBaiTap.startsWith("practice-")) {
      targetId = parseInt(maBaiTap.replace("practice-", ""), 10);
      isPractice = true;
    } else {
      const parsed = parseInt(maBaiTap, 10);
      if (!isNaN(parsed)) targetId = parsed;
    }
  }

  if (isExam) {
    const resExam = await pool.request()
      .input("maBaiKiemTra", targetId)
      .query(`
        SELECT lh.TrangThai 
        FROM BAIKIEMTRA bk
        JOIN BUOIHOC bh ON bk.MaBuoiHoc = bh.MaBuoiHoc 
        JOIN LOPHOC lh ON bh.MaLopHoc = lh.MaLopHoc 
        WHERE bk.MaBaiKiemTra = @maBaiKiemTra
      `);
    if (resExam.recordset.length > 0) {
      return resExam.recordset[0].TrangThai === "Đã hoàn thành";
    }
    return false;
  }

  if (isPractice) {
    const resPractice = await pool.request()
      .input("maLuyenTapThem", targetId)
      .query(`
        SELECT lh.TrangThai 
        FROM LUYENTAPTHEM lt
        JOIN BUOIHOC bh ON lt.MaBuoiHoc = bh.MaBuoiHoc 
        JOIN LOPHOC lh ON bh.MaLopHoc = lh.MaLopHoc 
        WHERE lt.MaLuyenTapThem = @maLuyenTapThem
      `);
    if (resPractice.recordset.length > 0) {
      return resPractice.recordset[0].TrangThai === "Đã hoàn thành";
    }
    return false;
  }

  const res = await pool.request()
    .input("maBaiTap", targetId)
    .query(`
      SELECT lh.TrangThai 
      FROM BAITAP bt
      JOIN BUOIHOC bh ON bt.MaBaiHoc = bh.MaBuoiHoc 
      JOIN LOPHOC lh ON bh.MaLopHoc = lh.MaLopHoc 
      WHERE bt.MaBaiTap = @maBaiTap
    `);
  if (res.recordset.length > 0) {
    return res.recordset[0].TrangThai === "Đã hoàn thành";
  }

  const resExam = await pool.request()
    .input("maBaiKiemTra", targetId)
    .query(`
      SELECT lh.TrangThai 
      FROM BAIKIEMTRA bk
      JOIN BUOIHOC bh ON bk.MaBuoiHoc = bh.MaBuoiHoc 
      JOIN LOPHOC lh ON bh.MaLopHoc = lh.MaLopHoc 
      WHERE bk.MaBaiKiemTra = @maBaiKiemTra
    `);
  if (resExam.recordset.length > 0) {
    return resExam.recordset[0].TrangThai === "Đã hoàn thành";
  }

  const resPractice = await pool.request()
    .input("maLuyenTapThem", targetId)
    .query(`
      SELECT lh.TrangThai 
      FROM LUYENTAPTHEM lt
      JOIN BUOIHOC bh ON lt.MaBuoiHoc = bh.MaBuoiHoc 
      JOIN LOPHOC lh ON bh.MaLopHoc = lh.MaLopHoc 
      WHERE lt.MaLuyenTapThem = @maLuyenTapThem
    `);
  if (resPractice.recordset.length > 0) {
    return resPractice.recordset[0].TrangThai === "Đã hoàn thành";
  }

  return false;
}

async function isClassCompletedByBaiHoc(pool, maBaiHoc) {
  if (!maBaiHoc) return false;
  const res = await pool.request()
    .input("maBaiHoc", maBaiHoc)
    .query(`
      SELECT lh.TrangThai 
      FROM BAIHOCKHOAHOC bhk
      JOIN BUOIHOC bh ON bhk.MaBuoiHoc = bh.MaBuoiHoc 
      JOIN LOPHOC lh ON bh.MaLopHoc = lh.MaLopHoc 
      WHERE bhk.MaBaiHoc = @maBaiHoc
    `);
  if (res.recordset.length > 0) {
    return res.recordset[0].TrangThai === "Đã hoàn thành";
  }
  return false;
}

async function isClassCompletedByTaiLieu(pool, maTaiLieu) {
  if (!maTaiLieu) return false;
  const res = await pool.request()
    .input("maTaiLieu", maTaiLieu)
    .query(`
      SELECT lh.TrangThai 
      FROM TAILIEU tl
      JOIN BUOIHOC bh ON tl.MaBuoiHoc = bh.MaBuoiHoc 
      JOIN LOPHOC lh ON bh.MaLopHoc = lh.MaLopHoc 
      WHERE tl.MaTaiLieu = @maTaiLieu
    `);
  if (res.recordset.length > 0) {
    return res.recordset[0].TrangThai === "Đã hoàn thành";
  }
  return false;
}

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const allowedOrigins = ["http://localhost:5173", "http://14.225.192.252:8082"];
    const isLocal = origin.startsWith("http://localhost:") || 
                    origin.startsWith("http://127.0.0.1:") ||
                    /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$/.test(origin) ||
                    /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$/.test(origin) ||
                    /^http:\/\/172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}(:\d+)?$/.test(origin);
    if (allowedOrigins.includes(origin) || isLocal) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));
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
      "audio/mpeg", "audio/wav", "audio/mp4", "audio/x-m4a", "audio/webm", "audio/ogg", "audio/webm;codecs=opus", "audio/ogg;codecs=opus",
      "video/mp4", "video/webm", "video/ogg", "video/quicktime",
      "application/octet-stream"
    ];
    if (allowed.includes(file.mimetype) || file.mimetype.startsWith("audio/")) cb(null, true);
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
      .input("ngaySinh", ngaySinh || null)
      .query(`INSERT INTO NGUOIDUNG (TenDangNhap, MatKhau, HoTen, Email, NgaySinh, TrangThai, NgayTao, MaVaiTro)
              VALUES (@username, @password, @name, @email, @ngaySinh, 'active', GETDATE(), 5)`);
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
            WHEN n.MaVaiTro = 1 THEN N'Quản Trị Viên'
            WHEN n.MaVaiTro = 2 THEN N'Giảng Viên'
            WHEN n.MaVaiTro = 4 THEN N'Quản Trị Nội Dung'
            WHEN n.MaVaiTro = 3 OR n.MaVaiTro = 5 THEN N'Học Viên'
            ELSE N'Học Viên'
          END AS VaiTro
        FROM NGUOIDUNG n
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
    
    const user = result.recordset[0];
    if (user.TrangThai && (user.TrangThai.toLowerCase() === "khóa" || user.TrangThai.toLowerCase() === "locked")) {
      return res.status(403).json({ message: "Tài khoản của bạn đã bị khóa" });
    }

    res.json(user);
  } catch (err) { res.status(500).send(err.message); }
});

app.get("/courses", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`SELECT MaKhoaHoc, TenKhoaHoc, MoTa, TrinhDo, TrangThai FROM KHOAHOC WHERE TrangThai = N'Hiển thị' ORDER BY NgayTao DESC`);
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

// Tạo khóa học mới
app.post("/qtv/khoahoc", async (req, res) => {
  const { TenKhoaHoc, MoTa, TrinhDo, MaNguoiDung, Listening, Reading, Speaking, Writing } = req.body
  try {
    const pool = await poolPromise
    const result = await pool.request()
      .input("TenKhoaHoc", TenKhoaHoc)
      .input("MoTa", MoTa || "")
      .input("TrinhDo", TrinhDo || "")
      .input("Listening", Listening !== undefined ? Number(Listening) : 0)
      .input("Reading", Reading !== undefined ? Number(Reading) : 0)
      .input("Speaking", Speaking !== undefined ? Number(Speaking) : 0)
      .input("Writing", Writing !== undefined ? Number(Writing) : 0)
      .input("MaNguoiDung", MaNguoiDung)
      .query(`
        INSERT INTO KHOAHOC (TenKhoaHoc, MoTa, TrinhDo, Listening, Reading, Speaking, Writing, TrangThai, MaNguoiDung, NgayTao)
        OUTPUT INSERTED.MaKhoaHoc
        VALUES (@TenKhoaHoc, @MoTa, @TrinhDo, @Listening, @Reading, @Speaking, @Writing, N'Ẩn', @MaNguoiDung, GETDATE())
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
            .input("MaNguoiDung", oldLecture.MaNguoiDung || null)
            .input("TieuDe", oldLecture.TieuDe)
            .input("NoiDung", oldLecture.NoiDung || "")
            .input("ThuTu", oldLecture.ThuTu || 1)
            .input("LoaiBaiHoc", oldLecture.LoaiBaiHoc)
            .input("ThoiLuong", oldLecture.ThoiLuong)
            .input("TrangThai", oldLecture.TrangThai || "draft")
            .input("NewMaBuoiHoc", newMaBuoiHoc)
            .input("FileUrl", oldLecture.FileUrl || null)
            .query(`
              INSERT INTO BAIHOCKHOAHOC (MaKhoaHoc, MaNguoiDung, TieuDe, NoiDung, ThuTu, LoaiBaiHoc, ThoiLuong, TrangThai, MaBuoiHoc, FileUrl)
              VALUES (@MaKhoaHoc, @MaNguoiDung, @TieuDe, @NoiDung, @ThuTu, @LoaiBaiHoc, @ThoiLuong, @TrangThai, @NewMaBuoiHoc, @FileUrl);
              SELECT SCOPE_IDENTITY() AS MaBaiHoc;
            `)

          const newMaBaiHoc = newLectureResult.recordset[0].MaBaiHoc

          // Sao chép bài tập (BAITAP) thuộc bài giảng cũ
          const oldBaiTapsResult = await pool.request()
            .input("OldMaBaiHoc", oldLecture.MaBaiHoc)
            .query(`
              SELECT 
                TieuDe, NgayTao, NoiDung, CauHoi, LinkAmThanh, HienThiDapAn,
                HocThuMienPhi, LaBaiKiemTra, TrangThai, TrangThaiDuyet, KyNang, DangBai, MaGiangVien, FileDinhKem
              FROM BAITAP 
              WHERE MaBaiHoc = @OldMaBaiHoc
            `)

          for (const oldBaiTap of oldBaiTapsResult.recordset) {
            await pool.request()
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
              .input("TrangThaiDuyet", oldBaiTap.TrangThaiDuyet || "Chờ duyệt")
              .input("KyNang", oldBaiTap.KyNang || null)
              .input("DangBai", oldBaiTap.DangBai || null)
              .input("MaNguoiDung", oldBaiTap.MaNguoiDung || null)
              .input("FileDinhKem", oldBaiTap.FileDinhKem || null)
              .query(`
                INSERT INTO BAITAP (TieuDe, NgayTao, MaBaiHoc, NoiDung, CauHoi, LinkAmThanh, HienThiDapAn, HocThuMienPhi, LaBaiKiemTra, TrangThai, TrangThaiDuyet, KyNang, DangBai, MaNguoiDung, FileDinhKem)
                VALUES (@TieuDe, @NgayTao, @NewMaBaiHoc, @NoiDung, @CauHoi, @LinkAmThanh, @HienThiDapAn, @HocThuMienPhi, @LaBaiKiemTra, @TrangThai, @TrangThaiDuyet, @KyNang, @DangBai, @MaNguoiDung, @FileDinhKem)
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
            .input("MaGiangVien", oldExam.MaGiangVien || null)
            .input("MaNguoiDung", oldExam.MaNguoiDung || null)
            .input("TenBai", oldExam.TenBai)
            .input("ThoiGian", oldExam.ThoiGian)
            .input("TongDiem", oldExam.TongDiem)
            .query(`
              INSERT INTO BAIKIEMTRA (MaBuoiHoc, MaGiangVien, TenBai, ThoiGian, TongDiem, MaNguoiDung)
              VALUES (@NewMaBuoiHoc, @MaGiangVien, @TenBai, @ThoiGian, @TongDiem, @MaNguoiDung);
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
      SELECT b.MaBaiHoc, b.TieuDe, b.LoaiBaiHoc, b.ThoiLuong, b.TrangThai, b.NoiDung, b.FileUrl, b.MaKhoaHoc, b.MaBuoiHoc,
             n.HoTen AS TenGiangVien, k.TenKhoaHoc, k.TrinhDo AS CapDo,
             ISNULL(b.NgayTao, k.NgayTao) AS NgayGui,
             l.TenLop
      FROM BAIHOCKHOAHOC b
      LEFT JOIN NGUOIDUNG n ON b.MaNguoiDung = n.MaNguoiDung
      LEFT JOIN KHOAHOC k ON b.MaKhoaHoc = k.MaKhoaHoc
      LEFT JOIN BUOIHOC ls ON b.MaBuoiHoc = ls.MaBuoiHoc
      LEFT JOIN LOPHOC l ON ls.MaLopHoc = l.MaLopHoc
      WHERE b.TrangThai IS NULL OR b.TrangThai NOT IN ('draft', N'Nháp', N'Lưu nháp')
      ORDER BY b.MaBaiHoc DESC
    `);
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
          l.MaLopHoc, l.TenLop, l.LichHoc, l.TrangThai, l.MaLop,
          kc.TenLop AS TenTrinhDo,
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
        GROUP BY l.MaLopHoc, l.TenLop, l.LichHoc, l.TrangThai, l.SoLuongHocVien,
                 l.ActiveBuoiHocId, l.MaLop, kc.TenLop
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

        -- 2. Xóa phân công kỹ năng
        DELETE FROM PHANCONG_LOP_KYNANG WHERE MaLopHoc = @id;

        -- 3. Xóa ghi danh học viên lớp học
        DELETE FROM SINHVIEN_LOPHOC WHERE MaLopHoc = @id;

        -- 4. Nullify ActiveBuoiHocId in LOPHOC (to break foreign key cycle)
        UPDATE LOPHOC SET ActiveBuoiHocId = NULL WHERE MaLopHoc = @id;

        -- 5. Xóa TIENDO_MINITEST của các bài học trong các buổi của lớp
        DELETE FROM TIENDO_MINITEST 
        WHERE MaBaiHoc IN (
          SELECT MaBaiHoc FROM BAIHOCKHOAHOC WHERE MaBuoiHoc IN (
            SELECT MaBuoiHoc FROM BUOIHOC WHERE MaLopHoc = @id
          )
        );

        -- 6. Xóa MINITEST của các bài học trong các buổi của lớp
        DELETE FROM MINITEST 
        WHERE MaBaiHoc IN (
          SELECT MaBaiHoc FROM BAIHOCKHOAHOC WHERE MaBuoiHoc IN (
            SELECT MaBuoiHoc FROM BUOIHOC WHERE MaLopHoc = @id
          )
        );

        -- 8. Xóa TIENDOHOCTAP trong các bài học của lớp
        DELETE FROM TIENDOHOCTAP 
        WHERE MaBaiHoc IN (
          SELECT MaBaiHoc FROM BAIHOCKHOAHOC WHERE MaBuoiHoc IN (
            SELECT MaBuoiHoc FROM BUOIHOC WHERE MaLopHoc = @id
          )
        );

        -- 9. Xóa bài nộp luyện tập thêm (bài tập phụ)
        DELETE FROM BAINOPTHEM
        WHERE MaLuyenTapThem IN (
          SELECT MaLuyenTapThem FROM LUYENTAPTHEM
          WHERE MaBuoiHoc IN (SELECT MaBuoiHoc FROM BUOIHOC WHERE MaLopHoc = @id)
             OR MaBaiHoc IN (SELECT MaBaiHoc FROM BAIHOCKHOAHOC WHERE MaBuoiHoc IN (SELECT MaBuoiHoc FROM BUOIHOC WHERE MaLopHoc = @id))
        );

        -- 10. Xóa các bài luyện tập thêm
        DELETE FROM LUYENTAPTHEM
        WHERE MaBuoiHoc IN (SELECT MaBuoiHoc FROM BUOIHOC WHERE MaLopHoc = @id)
           OR MaBaiHoc IN (SELECT MaBaiHoc FROM BAIHOCKHOAHOC WHERE MaBuoiHoc IN (SELECT MaBuoiHoc FROM BUOIHOC WHERE MaLopHoc = @id));

        -- 11. Xóa bài nộp của học viên trong lớp (bài tập chính)
        DELETE FROM BAINOP 
        WHERE MaBaiTap IN (
          SELECT MaBaiTap FROM BAITAP 
          WHERE MaBaiHoc IN (
            SELECT MaBaiHoc FROM BAIHOCKHOAHOC WHERE MaBuoiHoc IN (
              SELECT MaBuoiHoc FROM BUOIHOC WHERE MaLopHoc = @id
            )
          )
        );

        -- 12. Xóa bài tập chính
        DELETE FROM BAITAP 
        WHERE MaBaiHoc IN (
          SELECT MaBaiHoc FROM BAIHOCKHOAHOC WHERE MaBuoiHoc IN (
            SELECT MaBuoiHoc FROM BUOIHOC WHERE MaLopHoc = @id
          )
        );

        -- 13. Xóa các bài học (BAIHOCKHOAHOC)
        DELETE FROM BAIHOCKHOAHOC
        WHERE MaBuoiHoc IN (
          SELECT MaBuoiHoc FROM BUOIHOC WHERE MaLopHoc = @id
        );

        -- 14. Xóa tài liệu bài học đính kèm
        DELETE FROM TAILIEU
        WHERE MaBuoiHoc IN (
          SELECT MaBuoiHoc FROM BUOIHOC WHERE MaLopHoc = @id
        );

        -- 15. Xóa đáp án bài kiểm tra thuộc buổi học trong lớp
        DELETE FROM DAPAN WHERE MaCauHoi IN (
          SELECT MaCauHoi FROM CAUHOI WHERE MaBaiKiemTra IN (
            SELECT MaBaiKiemTra FROM BAIKIEMTRA WHERE MaBuoiHoc IN (
              SELECT MaBuoiHoc FROM BUOIHOC WHERE MaLopHoc = @id
            ) OR MaLesson IN (
              SELECT MaBuoiHoc FROM BUOIHOC WHERE MaLopHoc = @id
            )
          )
        );

        -- 16. Xóa câu hỏi bài kiểm tra thuộc buổi học trong lớp
        DELETE FROM CAUHOI WHERE MaBaiKiemTra IN (
          SELECT MaBaiKiemTra FROM BAIKIEMTRA WHERE MaBuoiHoc IN (
            SELECT MaBuoiHoc FROM BUOIHOC WHERE MaLopHoc = @id
          ) OR MaLesson IN (
            SELECT MaBuoiHoc FROM BUOIHOC WHERE MaLopHoc = @id
          )
        );

        -- 17. Xóa kết quả bài kiểm tra thuộc buổi học trong lớp
        DELETE FROM KETQUABAIKIEMTRA WHERE MaBaiKiemTra IN (
          SELECT MaBaiKiemTra FROM BAIKIEMTRA WHERE MaBuoiHoc IN (
            SELECT MaBuoiHoc FROM BUOIHOC WHERE MaLopHoc = @id
          ) OR MaLesson IN (
            SELECT MaBuoiHoc FROM BUOIHOC WHERE MaLopHoc = @id
          )
        );

        -- 18. Xóa bài kiểm tra thuộc buổi học trong lớp
        DELETE FROM BAIKIEMTRA WHERE MaBuoiHoc IN (
          SELECT MaBuoiHoc FROM BUOIHOC WHERE MaLopHoc = @id
        ) OR MaLesson IN (
          SELECT MaBuoiHoc FROM BUOIHOC WHERE MaLopHoc = @id
        );

        -- 19. Xóa các buổi học (BUOIHOC)
        DELETE FROM BUOIHOC WHERE MaLopHoc = @id;

        -- 20. Xóa chính lớp học (LOPHOC)
        DELETE FROM LOPHOC WHERE MaLopHoc = @id;
      `)
    res.json({ message: "Đã xóa lớp học" })
  } catch (err) { res.status(500).send(err.message) }
})

// Cập nhật lớp học
app.put("/qtv/lophoc/:id", async (req, res) => {
  try {
    const { TenLop, LichHoc, SoLuongHocVien, TrangThai, MaLop, teachers } = req.body
    const pool = await poolPromise

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
    if (TrangThai !== undefined) {
      updateRequest.input("TrangThai", TrangThai);
      fieldsToUpdate.push("TrangThai = @TrangThai");
    }

    if (fieldsToUpdate.length > 0) {
      const query = `
        UPDATE LOPHOC 
        SET ${fieldsToUpdate.join(", ")}
        WHERE MaLopHoc = @id
      `;
      await updateRequest.query(query);

      // Nếu trạng thái lớp học được cập nhật thành "Đã hoàn thành", tự động chuyển trạng thái sinh viên của lớp đó sang "Hoàn thành"
      if (TrangThai === "Đã hoàn thành") {
        await pool.request()
          .input("id", req.params.id)
          .query(`
            UPDATE SINHVIEN_LOPHOC 
            SET TrangThai = N'Hoàn thành' 
            WHERE MaLopHoc = @id AND TrangThai = N'Đang học'
          `);
      } else if (TrangThai === "Đang diễn ra") {
        await pool.request()
          .input("id", req.params.id)
          .query(`
            UPDATE SINHVIEN_LOPHOC 
            SET TrangThai = N'Đang học' 
            WHERE MaLopHoc = @id AND TrangThai = N'Hoàn thành'
          `);
      }
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
        SELECT pc.MaKyNang, pc.MaGiangVien, n.HoTen AS TenGiangVien, n.HoTen AS HoTen
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
    const pool = await poolPromise;
    await pool.request()
      .input("id", req.params.id)
      .query(`
        -- 1. Nullify ActiveBuoiHocId in LOPHOC
        UPDATE LOPHOC SET ActiveBuoiHocId = NULL WHERE ActiveBuoiHocId = @id;

        -- 2. Delete TIENDO_MINITEST
        DELETE FROM TIENDO_MINITEST WHERE MaBaiHoc IN (SELECT MaBaiHoc FROM BAIHOCKHOAHOC WHERE MaBuoiHoc = @id);

        -- 3. Delete MINITEST
        DELETE FROM MINITEST WHERE MaBaiHoc IN (SELECT MaBaiHoc FROM BAIHOCKHOAHOC WHERE MaBuoiHoc = @id);

        -- 5. Delete TIENDOHOCTAP
        DELETE FROM TIENDOHOCTAP WHERE MaBaiHoc IN (SELECT MaBaiHoc FROM BAIHOCKHOAHOC WHERE MaBuoiHoc = @id);

        -- 6. Delete BAINOPTHEM
        DELETE FROM BAINOPTHEM WHERE MaLuyenTapThem IN (
          SELECT MaLuyenTapThem FROM LUYENTAPTHEM 
          WHERE MaBuoiHoc = @id OR MaBaiHoc IN (SELECT MaBaiHoc FROM BAIHOCKHOAHOC WHERE MaBuoiHoc = @id)
        );

        -- 7. Delete LUYENTAPTHEM
        DELETE FROM LUYENTAPTHEM WHERE MaBuoiHoc = @id OR MaBaiHoc IN (SELECT MaBaiHoc FROM BAIHOCKHOAHOC WHERE MaBuoiHoc = @id);

        -- 8. Delete BAINOP
        DELETE FROM BAINOP WHERE MaBaiTap IN (
          SELECT MaBaiTap FROM BAITAP WHERE MaBaiHoc IN (
            SELECT MaBaiHoc FROM BAIHOCKHOAHOC WHERE MaBuoiHoc = @id
          )
        );

        -- 9. Delete BAITAP
        DELETE FROM BAITAP WHERE MaBaiHoc IN (SELECT MaBaiHoc FROM BAIHOCKHOAHOC WHERE MaBuoiHoc = @id);

        -- 10. Delete BAIHOCKHOAHOC
        DELETE FROM BAIHOCKHOAHOC WHERE MaBuoiHoc = @id;

        -- 11. Delete TAILIEU
        DELETE FROM TAILIEU WHERE MaBuoiHoc = @id;

        -- 12. Delete DAPAN
        DELETE FROM DAPAN WHERE MaCauHoi IN (
          SELECT MaCauHoi FROM CAUHOI WHERE MaBaiKiemTra IN (
            SELECT MaBaiKiemTra FROM BAIKIEMTRA WHERE MaBuoiHoc = @id OR MaLesson = @id
          )
        );

        -- 13. Delete CAUHOI
        DELETE FROM CAUHOI WHERE MaBaiKiemTra IN (
          SELECT MaBaiKiemTra FROM BAIKIEMTRA WHERE MaBuoiHoc = @id OR MaLesson = @id
        );

        -- 14. Delete KETQUABAIKIEMTRA
        DELETE FROM KETQUABAIKIEMTRA WHERE MaBaiKiemTra IN (
          SELECT MaBaiKiemTra FROM BAIKIEMTRA WHERE MaBuoiHoc = @id OR MaLesson = @id
        );

        -- 15. Delete BAIKIEMTRA
        DELETE FROM BAIKIEMTRA WHERE MaBuoiHoc = @id OR MaLesson = @id;

        -- 16. Delete BUOIHOC
        DELETE FROM BUOIHOC WHERE MaBuoiHoc = @id;
      `);
    res.json({ message: "Đã xóa buổi học và toàn bộ dữ liệu liên quan" });
  } catch (err) {
    res.status(500).send(err.message);
  }
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


app.get("/buoihoc/:id", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("id", req.params.id)
      .query(`
        SELECT l.*, lh.LichHoc, lh.SoLuongHocVien, lh.TrangThai AS TrangThaiLopHoc
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
        SELECT e.MaBaiTap, e.TieuDe AS Title, e.DangBai AS Type, 
               CAST(e.LaBaiKiemTra AS INT) AS IsExam,
               e.NgayTao AS CreatedDate, e.TrangThai, e.TrangThaiDuyet,
               e.MaBaiHoc, e.HocThuMienPhi, e.NoiDung AS Content, e.HanNop,
               (
                 SELECT ROUND(AVG(CAST(b.Diem AS FLOAT)), 1)
                 FROM BAINOP b
                 JOIN SINHVIEN s ON b.MaSinhVien = s.MaSinhVien OR b.MaSinhVien = CAST(s.MaNguoiDung AS NVARCHAR(50))
                 JOIN SINHVIEN_LOPHOC sl ON s.MaSinhVien = sl.MaSinhVien
                 WHERE b.MaBaiTap = e.MaBaiTap
                   AND sl.MaLopHoc = (SELECT MaLopHoc FROM BUOIHOC WHERE MaBuoiHoc = @buoiHocId)
                   AND b.Diem IS NOT NULL
               ) AS DiemTB,
               ISNULL(CAST(ROUND(
                 CAST((
                   SELECT COUNT(DISTINCT s2.MaSinhVien)
                   FROM BAINOP b2
                   JOIN SINHVIEN s2 ON b2.MaSinhVien = s2.MaSinhVien OR b2.MaSinhVien = CAST(s2.MaNguoiDung AS NVARCHAR(50))
                   JOIN SINHVIEN_LOPHOC sl2 ON s2.MaSinhVien = sl2.MaSinhVien
                   WHERE b2.MaBaiTap = e.MaBaiTap
                     AND sl2.MaLopHoc = (SELECT MaLopHoc FROM BUOIHOC WHERE MaBuoiHoc = @buoiHocId)
                 ) AS FLOAT) * 100.0 / NULLIF(
                   (
                     SELECT COUNT(*) 
                     FROM SINHVIEN_LOPHOC 
                     WHERE MaLopHoc = (SELECT MaLopHoc FROM BUOIHOC WHERE MaBuoiHoc = @buoiHocId) 
                       AND (TrangThai = N'Đang học' OR TrangThai = N'Hoàn thành' OR TrangThai = N'Đã hoàn thành')
                   ), 0
                 ), 0
               ) AS INT), 0) AS TiLeNop
        FROM BAITAP e
        JOIN BAIHOCKHOAHOC bh ON e.MaBaiHoc = bh.MaBaiHoc
        WHERE bh.MaBuoiHoc = @buoiHocId

        UNION ALL

        SELECT k.MaBaiKiemTra AS MaBaiTap, k.TenBai AS Title, 'exam' AS Type, 
               1 AS IsExam,
               NULL AS CreatedDate, k.TrangThai,
               CASE WHEN k.TrangThai = 'published' THEN N'Đã duyệt' WHEN k.TrangThai = 'rejected' THEN N'Từ chối' ELSE N'Chờ duyệt' END AS TrangThaiDuyet,
               NULL AS MaBaiHoc, 0 AS HocThuMienPhi, k.NoiDung AS Content, NULL AS HanNop,
               (
                 SELECT ROUND(AVG(CAST(kq.Diem AS FLOAT)), 1)
                 FROM KETQUABAIKIEMTRA kq
                 JOIN SINHVIEN s ON kq.MaSinhVien = s.MaSinhVien
                 JOIN SINHVIEN_LOPHOC sl ON s.MaSinhVien = sl.MaSinhVien
                 WHERE kq.MaBaiKiemTra = k.MaBaiKiemTra
                   AND sl.MaLopHoc = (SELECT MaLopHoc FROM BUOIHOC WHERE MaBuoiHoc = @buoiHocId)
                   AND kq.Diem IS NOT NULL
               ) AS DiemTB,
               ISNULL(CAST(ROUND(
                 CAST((
                   SELECT COUNT(DISTINCT s3.MaSinhVien)
                   FROM KETQUABAIKIEMTRA kq3
                   JOIN SINHVIEN s3 ON kq3.MaSinhVien = s3.MaSinhVien
                   JOIN SINHVIEN_LOPHOC sl3 ON s3.MaSinhVien = sl3.MaSinhVien
                   WHERE kq3.MaBaiKiemTra = k.MaBaiKiemTra
                     AND sl3.MaLopHoc = (SELECT MaLopHoc FROM BUOIHOC WHERE MaBuoiHoc = @buoiHocId)
                 ) AS FLOAT) * 100.0 / NULLIF(
                   (
                     SELECT COUNT(*) 
                     FROM SINHVIEN_LOPHOC 
                     WHERE MaLopHoc = (SELECT MaLopHoc FROM BUOIHOC WHERE MaBuoiHoc = @buoiHocId) 
                       AND (TrangThai = N'Đang học' OR TrangThai = N'Hoàn thành' OR TrangThai = N'Đã hoàn thành')
                   ), 0
                 ), 0
               ) AS INT), 0) AS TiLeNop
        FROM BAIKIEMTRA k
        WHERE k.MaBuoiHoc = @buoiHocId
      `);
    res.json(result.recordset);
  } catch (err) { res.status(500).send("Lỗi server"); }
});

app.get("/luyentapthem/buoihoc/:buoiHocId", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("buoiHocId", parseInt(req.params.buoiHocId))
      .query(`
        SELECT MaLuyenTapThem AS MaBaiTap, Title, Type, 
               CAST(0 AS INT) AS IsExam,
               CreatedDate, N'published' AS TrangThai, N'Đã duyệt' AS TrangThaiDuyet,
               MaBuoiHoc, CAST(1 AS INT) AS HocThuMienPhi, Content
        FROM LUYENTAPTHEM
        WHERE MaBuoiHoc = @buoiHocId
      `);
    res.json(result.recordset);
  } catch (err) { res.status(500).send("Lỗi server"); }
});

app.get("/baitap/:id", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("id", parseInt(req.params.id))
      .query(`
        SELECT MaBaiTap, TieuDe AS Title, DangBai AS Type, 
               CAST(LaBaiKiemTra AS INT) AS IsExam,
               NgayTao AS CreatedDate, NoiDung AS Content, CauHoi AS Questions,
               TrangThai, TrangThaiDuyet, FileDinhKem, LinkAmThanh AS AudioUrl,
               MaBaiHoc
        FROM BAITAP 
        WHERE MaBaiTap = @id
      `);
    if (result.recordset.length > 0) {
      return res.json(result.recordset[0]);
    }

    // Try finding in BAIKIEMTRA
    const examResult = await pool.request()
      .input("id", parseInt(req.params.id))
      .query(`
        SELECT MaBaiKiemTra AS MaBaiTap, TenBai AS Title, 'exam' AS Type, 
               1 AS IsExam,
               NULL AS CreatedDate, NoiDung AS Content, CauHoi AS Questions,
               TrangThai,
               CASE WHEN TrangThai = 'published' THEN N'Đã duyệt' WHEN TrangThai = 'rejected' THEN N'Từ chối' ELSE N'Chờ duyệt' END AS TrangThaiDuyet,
               NULL AS FileDinhKem, NULL AS AudioUrl,
               NULL AS MaBaiHoc
        FROM BAIKIEMTRA 
        WHERE MaBaiKiemTra = @id
      `);
    if (examResult.recordset.length > 0) {
      return res.json(examResult.recordset[0]);
    }

    // Try finding in LUYENTAPTHEM
    const practiceResult = await pool.request()
      .input("id", parseInt(req.params.id))
      .query(`
        SELECT MaLuyenTapThem AS MaBaiTap, Title, Type, 
               CAST(0 AS INT) AS IsExam,
               CreatedDate, Content, Questions,
               N'published' AS TrangThai, N'Đã duyệt' AS TrangThaiDuyet,
               NULL AS FileDinhKem, AudioUrl,
               NULL AS MaBaiHoc
        FROM LUYENTAPTHEM 
        WHERE MaLuyenTapThem = @id
      `);
    if (practiceResult.recordset.length > 0) {
      return res.json(practiceResult.recordset[0]);
    }

    res.status(404).json({ message: "Không tìm thấy nội dung" });
  } catch (err) { res.status(500).send("Lỗi server"); }
});

app.put("/baitap/:id", async (req, res) => {
  try {
    const { Title, Type, Content, Questions, Vocabulary, AudioUrl, ShowAnswer, IsFree, IsExam, TrangThai, KyNang, DangBai } = req.body;
    const pool = await poolPromise;
    if (await isClassCompletedByBaiTap(pool, req.params.id)) {
      return res.status(400).json({ message: "Lớp học đã hoàn thành, không thể chỉnh sửa bài tập!" });
    }
    if (Title !== undefined || Content !== undefined) {
      await pool.request()
        .input("id", parseInt(req.params.id))
        .input("TieuDe", Title || "")
        .input("DangBai", DangBai || Type || "")
        .input("Content", Content || "")
        .input("CauHoi", Questions || "")
        .input("TuVung", Vocabulary || "")
        .input("AudioUrl", AudioUrl || "")
        .input("ShowAnswer", ShowAnswer !== undefined ? ShowAnswer : 0)
        .input("IsFree", IsFree !== undefined ? IsFree : 0)
        .input("IsExam", IsExam !== undefined ? IsExam : 0)
        .input("TrangThai", TrangThai || "draft")
        .input("KyNang", KyNang || "Tổng hợp")
        .query(`
          UPDATE BAITAP 
          SET TieuDe = @TieuDe,
              DangBai = @DangBai,
              Content = @Content,
              CauHoi = @CauHoi,
              TuVung = @TuVung,
              AudioUrl = @AudioUrl,
              ShowAnswer = @ShowAnswer,
              IsFree = @IsFree,
              IsExam = @IsExam,
              TrangThai = @TrangThai,
              KyNang = @KyNang
          WHERE MaBaiTap = @id
        `);
    } else {
      await pool.request()
        .input("id", parseInt(req.params.id))
        .input("CauHoi", Questions)
        .query(`UPDATE BAITAP SET CauHoi = @CauHoi WHERE MaBaiTap = @id`);
    }
    res.json({ success: true, message: "Cập nhật thành công" });
  } catch (err) { 
    console.error("Lỗi PUT /baitap/:id:", err);
    res.status(500).send("Lỗi server: " + err.message); 
  }
});
app.delete("/baitap/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;
    if (await isClassCompletedByBaiTap(pool, id)) {
      return res.status(400).json({ message: "Lớp học đã hoàn thành, không thể xóa bài tập!" });
    }

    let targetId = id;
    let isExam = false;
    let identified = false;

    if (typeof id === "string") {
      if (id.startsWith("exam-")) {
        targetId = parseInt(id.replace("exam-", ""), 10);
        isExam = true;
        identified = true;
      } else if (id.startsWith("baitap-")) {
        targetId = parseInt(id.replace("baitap-", ""), 10);
        isExam = false;
        identified = true;
      }
    }

    if (!identified) {
      targetId = parseInt(id, 10);
      const examCheck = await pool.request()
        .input("id", targetId)
        .query(`SELECT MaBaiKiemTra FROM BAIKIEMTRA WHERE MaBaiKiemTra = @id`);
      if (examCheck.recordset.length > 0) {
        isExam = true;
      }
    }

    if (isExam) {
      // Delete answers, questions, results, and the exam itself
      await pool.request()
        .input("id", targetId)
        .query(`DELETE FROM DAPAN WHERE MaCauHoi IN (SELECT MaCauHoi FROM CAUHOI WHERE MaBaiKiemTra = @id)`);
      
      await pool.request()
        .input("id", targetId)
        .query(`DELETE FROM CAUHOI WHERE MaBaiKiemTra = @id`);
      
      await pool.request()
        .input("id", targetId)
        .query(`DELETE FROM KETQUABAIKIEMTRA WHERE MaBaiKiemTra = @id`);
      
      await pool.request()
        .input("id", targetId)
        .query(`DELETE FROM BAIKIEMTRA WHERE MaBaiKiemTra = @id`);
    } else {
      // Delete submissions and the exercise
      await pool.request()
        .input("id", targetId)
        .query(`DELETE FROM BAINOP WHERE MaBaiTap = @id`);
      
      await pool.request()
        .input("id", targetId)
        .query(`DELETE FROM BAITAP WHERE MaBaiTap = @id`);
    }

    res.json({ message: "Xóa thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Lỗi server: " + err.message);
  }
});
/* ===== BÀI GIẢNG ===== */
app.get("/baigiang/detail/:id", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("id", req.params.id)
      .query(`SELECT MaBaiHoc, TieuDe, LoaiBaiHoc, ThoiLuong, TrangThai, NoiDung, FileUrl, MaBuoiHoc, IsFree FROM BAIHOCKHOAHOC WHERE MaBaiHoc = @id`); // ← thêm FileUrl
    res.json(result.recordset[0]);
  } catch (err) { res.status(500).send(err.message); }
});

app.get("/baigiang/:buoiHocId", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("buoiHocId", req.params.buoiHocId)
      .query(`SELECT MaBaiHoc, TieuDe, LoaiBaiHoc, ThoiLuong, TrangThai, ThuTu, IsFree FROM BAIHOCKHOAHOC WHERE MaBuoiHoc = @buoiHocId ORDER BY ThuTu`);
    res.json(result.recordset);
  } catch (err) { res.status(500).send(err.message); }
});

app.post("/baigiang", async (req, res) => {
  try {
    const { TieuDe, NoiDung, FileUrl, LoaiBaiHoc, ThoiLuong, TrangThai, ThuTu, MaKhoaHoc, MaGiangVien, MaBuoiHoc, IsFree } = req.body;
    const pool = await poolPromise;
    if (await isClassCompletedByBuoiHoc(pool, MaBuoiHoc)) {
      return res.status(400).json({ message: "Lớp học đã hoàn thành, không thể tạo bài giảng mới!" });
    }
    if (await isBuoiHocCompleted(pool, MaBuoiHoc)) {
      return res.status(400).json({ message: "Buổi học đã hoàn thành, không thể tạo bài giảng mới!" });
    }

    let resolvedMaGiangVien = null;
    let isQTV = true;
    if (MaGiangVien) {
      // Map MaNguoiDung from frontend to MaGiangVien in database
      const gvResult = await pool.request()
        .input("maNguoiDung", MaGiangVien)
        .query(`SELECT MaGiangVien FROM GIANGVIEN WHERE MaNguoiDung = @maNguoiDung`);
      if (gvResult.recordset.length > 0) {
        resolvedMaGiangVien = gvResult.recordset[0].MaGiangVien;
        isQTV = false;
      }
    }

    if (!isQTV) {
      if (!resolvedMaGiangVien && MaBuoiHoc) {
        const classTeacherResult = await pool.request()
          .input("buoiHocId", MaBuoiHoc)
          .query(`
            SELECT TOP 1 pc.MaGiangVien 
            FROM BUOIHOC b
            LEFT JOIN PHANCONGGIANGVIEN pc ON b.MaLopHoc = pc.MaLopHoc
            WHERE b.MaBuoiHoc = @buoiHocId
          `);
        if (classTeacherResult.recordset.length > 0) {
          resolvedMaGiangVien = classTeacherResult.recordset[0].MaGiangVien;
        }
      }
    }

    const finalTrangThai = isQTV ? "Đã duyệt" : normalizeTrangThai(TrangThai);
    const finalTrangThaiDuyet = finalTrangThai;

    const result = await pool.request()
      .input("TieuDe", TieuDe)
      .input("NoiDung", NoiDung || "")
      .input("FileUrl", FileUrl || "")
      .input("LoaiBaiHoc", LoaiBaiHoc)
      .input("ThoiLuong", ThoiLuong)
      .input("TrangThai", finalTrangThai)
      .input("TrangThaiDuyet", finalTrangThaiDuyet)
      .input("ThuTu", ThuTu || 1)
      .input("MaKhoaHoc", MaKhoaHoc || 1)
      .input("MaBuoiHoc", MaBuoiHoc)
      .input("IsFree", IsFree !== undefined ? IsFree : 0)
      .input("MaNguoiDung", MaGiangVien || null)
      .query(`INSERT INTO BAIHOCKHOAHOC (TieuDe, NoiDung, FileUrl, LoaiBaiHoc, ThoiLuong, TrangThai, TrangThaiDuyet, ThuTu, MaKhoaHoc, MaBuoiHoc, IsFree, MaNguoiDung) 
              OUTPUT INSERTED.MaBaiHoc
              VALUES (@TieuDe, @NoiDung, @FileUrl, @LoaiBaiHoc, @ThoiLuong, @TrangThai, @TrangThaiDuyet, @ThuTu, @MaKhoaHoc, @MaBuoiHoc, @IsFree, @MaNguoiDung)`);
    const newMaBaiHoc = result.recordset[0].MaBaiHoc;
    res.json({ message: "Thêm bài giảng thành công", MaBaiHoc: newMaBaiHoc });
  } catch (err) { res.status(500).send(err.message); }
});

app.delete("/baigiang/:id", async (req, res) => {
  try {
    const pool = await poolPromise;
    if (await isClassCompletedByBaiHoc(pool, req.params.id)) {
      return res.status(400).json({ message: "Lớp học đã hoàn thành, không thể xóa bài giảng!" });
    }
    const id = req.params.id;

    // 1. Set MaBaiHoc = NULL in BAITAP and LUYENTAPTHEM
    await pool.request().input("id", id).query("UPDATE BAITAP SET MaBaiHoc = NULL WHERE MaBaiHoc = @id");
    await pool.request().input("id", id).query("UPDATE LUYENTAPTHEM SET MaBaiHoc = NULL WHERE MaBaiHoc = @id");

    // 2. Delete from TIENDO_MINITEST, MINITEST, TIENDOHOCTAP
    await pool.request().input("id", id).query("DELETE FROM TIENDO_MINITEST WHERE MaBaiHoc = @id");
    await pool.request().input("id", id).query("DELETE FROM MINITEST WHERE MaBaiHoc = @id");
    await pool.request().input("id", id).query("DELETE FROM TIENDOHOCTAP WHERE MaBaiHoc = @id");

    // 3. Delete from BAIHOCKHOAHOC
    await pool.request()
      .input("id", id)
      .query("DELETE FROM BAIHOCKHOAHOC WHERE MaBaiHoc = @id");

    res.json({ message: "Xóa thành công" });
  } catch (err) { res.status(500).send(err.message); }
});

// ── PUT /baigiang/:id ──
app.put("/baigiang/:id", async (req, res) => {
  try {
    const pool = await poolPromise;
    const { TieuDe, NoiDung, FileUrl, LoaiBaiHoc, ThoiLuong, TrangThai, TrangThaiDuyet, ThuTu, MaKhoaHoc, MaBuoiHoc, IsFree } = req.body;
    const id = req.params.id;

    await pool.request()
      .input("id", id)
      .input("TieuDe", TieuDe)
      .input("NoiDung", NoiDung || "")
      .input("FileUrl", FileUrl || "")
      .input("LoaiBaiHoc", LoaiBaiHoc)
      .input("ThoiLuong", ThoiLuong)
      .input("TrangThai", TrangThai)
      .input("TrangThaiDuyet", TrangThaiDuyet || "Đã duyệt")
      .input("ThuTu", ThuTu || 1)
      .input("MaKhoaHoc", MaKhoaHoc || 1)
      .input("MaBuoiHoc", MaBuoiHoc)
      .input("IsFree", IsFree !== undefined ? IsFree : 0)
      .query(`
        UPDATE BAIHOCKHOAHOC
        SET TieuDe = @TieuDe,
            NoiDung = @NoiDung,
            FileUrl = @FileUrl,
            LoaiBaiHoc = @LoaiBaiHoc,
            ThoiLuong = @ThoiLuong,
            TrangThai = @TrangThai,
            TrangThaiDuyet = @TrangThaiDuyet,
            ThuTu = @ThuTu,
            MaKhoaHoc = @MaKhoaHoc,
            MaBuoiHoc = @MaBuoiHoc,
            IsFree = @IsFree
        WHERE MaBaiHoc = @id
      `);

    res.json({ message: "Cập nhật bài giảng thành công" });
  } catch (err) { res.status(500).send(err.message); }
});

app.put("/baigiang/:id/status", async (req, res) => {
  try {
    const { TrangThai } = req.body;
    const pool = await poolPromise;
    if (await isClassCompletedByBaiHoc(pool, req.params.id)) {
      return res.status(400).json({ message: "Lớp học đã hoàn thành, không thể thay đổi trạng thái duyệt bài giảng!" });
    }
    const normalized = normalizeTrangThai(TrangThai);
    await pool.request()
      .input("id", req.params.id)
      .input("TrangThai", normalized)
      .input("TrangThaiDuyet", normalized)
      .query(`UPDATE BAIHOCKHOAHOC SET TrangThai = @TrangThai, TrangThaiDuyet = @TrangThaiDuyet WHERE MaBaiHoc = @id`);
    res.json({ message: "Cập nhật thành công" });
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
      .query(`SELECT MaTaiLieu, TieuDe, MoTa, NoiDung, FileUrl, NgayCapNhat FROM TAILIEU WHERE MaBuoiHoc = @buoiHocId ORDER BY NgayCapNhat DESC`);
    res.json(result.recordset);
  } catch (err) { res.status(500).send(err.message); }
});

app.delete("/tailieu/:id", async (req, res) => {
  try {
    const pool = await poolPromise;
    if (await isClassCompletedByTaiLieu(pool, req.params.id)) {
      return res.status(400).json({ message: "Lớp học đã hoàn thành, không thể xóa tài liệu!" });
    }
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
    if (await isClassCompletedByBuoiHoc(pool, MaBuoiHoc)) {
      return res.status(400).json({ message: "Lớp học đã hoàn thành, không thể thêm tài liệu mới!" });
    }
    if (await isBuoiHocCompleted(pool, MaBuoiHoc)) {
      return res.status(400).json({ message: "Buổi học đã hoàn thành, không thể thêm tài liệu mới!" });
    }
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

// Lấy danh sách bản nháp của giảng viên
app.get("/teacher/:maNguoiDung/drafts", async (req, res) => {
  try {
    const { maNguoiDung } = req.params;
    const pool = await poolPromise;

    // Tự động xóa các bản nháp sau 30 ngày kể từ ngày tạo
    try {
      await pool.request().query(`
        DELETE FROM BAIHOCKHOAHOC
        WHERE (TrangThai = 'draft' OR TrangThai = N'Nháp' OR TrangThai = N'Lưu nháp')
          AND NgayTao < DATEADD(day, -30, GETDATE())
      `);
      await pool.request().query(`
        DELETE FROM BAITAP
        WHERE (TrangThai = 'draft' OR TrangThai = N'Nháp' OR TrangThai = N'Lưu nháp')
          AND NgayTao < DATEADD(day, -30, GETDATE())
      `);
      await pool.request().query(`
        DELETE FROM BAIKIEMTRA
        WHERE (TrangThai = 'draft' OR TrangThai = N'Nháp' OR TrangThai = N'Lưu nháp' OR TrangThaiDuyet = N'Nháp' OR TrangThaiDuyet = N'Lưu nháp')
          AND NgayBatDau < DATEADD(day, -30, GETDATE())
      `);
    } catch (cleanErr) {
      console.error("Lỗi khi tự động dọn dẹp bản nháp cũ:", cleanErr);
    }

    // 2. Lấy danh sách bài giảng bản nháp (lessons)
    const lessonsResult = await pool.request()
      .input("maNguoiDung", maNguoiDung)
      .query(`
        SELECT 
          b.MaBaiHoc, b.TieuDe, b.LoaiBaiHoc, b.ThoiLuong, b.TrangThai, b.MaBuoiHoc,
          bh.TenBuoiHoc, lh.TenLop, COALESCE(kh.TenKhoaHoc, kh2.TenKhoaHoc) AS TenKhoaHoc
        FROM BAIHOCKHOAHOC b
        LEFT JOIN BUOIHOC bh ON b.MaBuoiHoc = bh.MaBuoiHoc
        LEFT JOIN LOPHOC lh ON bh.MaLopHoc = lh.MaLopHoc
        LEFT JOIN KHOAHOC kh ON b.MaKhoaHoc = kh.MaKhoaHoc
        LEFT JOIN KHOAHOCCHITIET khct ON lh.MaLop = khct.MaLop
        LEFT JOIN KHOAHOC kh2 ON khct.MaKhoaHoc = kh2.MaKhoaHoc
        WHERE b.MaNguoiDung = @maNguoiDung AND (b.TrangThai = 'draft' OR b.TrangThai = N'Nháp' OR b.TrangThai = N'Lưu nháp')
        ORDER BY b.MaBaiHoc DESC
      `);

    // 3. Lấy danh sách bài tập bản nháp (exercises)
    const exercisesResult = await pool.request()
      .input("maNguoiDung", maNguoiDung)
      .query(`
        SELECT 
          bt.MaBaiTap, bt.TieuDe AS Title, bt.DangBai AS Type, 
          CONVERT(varchar, bt.NgayTao, 103) AS CreatedDate, bt.TrangThai,
          bh.TenBuoiHoc, lh.TenLop, kh2.TenKhoaHoc, bt.MaBuoiHoc
        FROM BAITAP bt
        LEFT JOIN BAIHOCKHOAHOC b ON bt.MaBaiHoc = b.MaBaiHoc
        LEFT JOIN BUOIHOC bh ON b.MaBuoiHoc = bh.MaBuoiHoc
        LEFT JOIN LOPHOC lh ON bh.MaLopHoc = lh.MaLopHoc
        LEFT JOIN KHOAHOCCHITIET khct ON lh.MaLop = khct.MaLop
        LEFT JOIN KHOAHOC kh2 ON khct.MaKhoaHoc = kh2.MaKhoaHoc
        WHERE bt.MaNguoiDung = @maNguoiDung AND (bt.TrangThai = 'draft' OR bt.TrangThai = N'Nháp' OR bt.TrangThai = N'Lưu nháp')
        ORDER BY bt.MaBaiTap DESC
      `);

    // 4. Lấy danh sách bài kiểm tra bản nháp (exams)
    const examsResult = await pool.request()
      .input("maNguoiDung", maNguoiDung)
      .query(`
        SELECT 
          bk.MaBaiKiemTra AS MaBaiTap, bk.TenBai AS Title, 'Exam' AS Type, 
          CONVERT(varchar, bk.NgayBatDau, 103) AS CreatedDate, bk.TrangThai,
          bh.TenBuoiHoc, lh.TenLop, kh2.TenKhoaHoc, bk.MaBuoiHoc
        FROM BAIKIEMTRA bk
        LEFT JOIN BUOIHOC bh ON bk.MaBuoiHoc = bh.MaBuoiHoc
        LEFT JOIN LOPHOC lh ON bh.MaLopHoc = lh.MaLopHoc
        LEFT JOIN KHOAHOCCHITIET khct ON lh.MaLop = khct.MaLop
        LEFT JOIN KHOAHOC kh2 ON khct.MaKhoaHoc = kh2.MaKhoaHoc
        WHERE bk.MaNguoiDung = @maNguoiDung AND (bk.TrangThai = 'draft' OR bk.TrangThai = N'Nháp' OR bk.TrangThai = N'Lưu nháp' OR bk.TrangThaiDuyet = N'Nháp' OR bk.TrangThaiDuyet = N'Lưu nháp')
        ORDER BY bk.MaBaiKiemTra DESC
      `);

    res.json({
      lessons: lessonsResult.recordset,
      exercises: exercisesResult.recordset,
      exams: examsResult.recordset
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Cập nhật trạng thái bài tập / bài kiểm tra
app.put("/baitap/:id/status", async (req, res) => {
  try {
    const { TrangThai } = req.body;
    const { id } = req.params;
    const pool = await poolPromise;
    if (await isClassCompletedByBaiTap(pool, id)) {
      return res.status(400).json({ message: "Lớp học đã hoàn thành, không thể thay đổi trạng thái duyệt bài tập!" });
    }

    const normalized = normalizeTrangThai(TrangThai);

    let targetId = id;
    let isExam = false;
    let identified = false;

    if (typeof id === "string") {
      if (id.startsWith("exam-")) {
        targetId = parseInt(id.replace("exam-", ""), 10);
        isExam = true;
        identified = true;
      } else if (id.startsWith("baitap-")) {
        targetId = parseInt(id.replace("baitap-", ""), 10);
        isExam = false;
        identified = true;
      }
    }

    if (!identified) {
      const examCheck = await pool.request()
        .input("id", targetId)
        .query(`SELECT MaBaiKiemTra FROM BAIKIEMTRA WHERE MaBaiKiemTra = @id`);
      if (examCheck.recordset.length > 0) {
        isExam = true;
      }
    }

    if (isExam) {
      await pool.request()
        .input("id", targetId)
        .input("TrangThai", normalized)
        .input("TrangThaiDuyet", normalized)
        .query(`UPDATE BAIKIEMTRA SET TrangThai = @TrangThai, TrangThaiDuyet = @TrangThaiDuyet WHERE MaBaiKiemTra = @id`);
    } else {
      await pool.request()
        .input("id", targetId)
        .input("TrangThai", normalized)
        .input("TrangThaiDuyet", normalized)
        .query(`UPDATE BAITAP SET TrangThai = @TrangThai, TrangThaiDuyet = @TrangThaiDuyet WHERE MaBaiTap = @id`);
    }

    res.json({ message: "Cập nhật thành công" });
  } catch (err) {
    res.status(500).send(err.message);
  }
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
        s.MSSV,
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
    const formatted = result.recordset.map(row => ({
      ...row,
      MaSinhVien: formatStudentId(row.MaSinhVien)
    }));
    res.json(formatted);
  } catch (err) { res.status(500).send(err.message); }
});
app.get("/students/:maSinhVien", async (req, res) => {
  try {
    const pool = await poolPromise;
    const parsedSV = parseStudentId(req.params.maSinhVien);
    const result = await pool.request()
      .input("maSinhVien", parsedSV)
      .query(`
        SELECT
          s.MaSinhVien,
          n.MaNguoiDung,
          n.HoTen,
          n.Email,
          n.GioiTinh,
          n.NgaySinh,
          n.AnhDaiDien,
          s.Lop,
          s.MSSV,
          s.BietDanh,
          k.TenKhoaHoc
        FROM SINHVIEN s
        JOIN NGUOIDUNG n ON s.MaNguoiDung = n.MaNguoiDung
        LEFT JOIN DANGKYKHOAHOC d ON s.MaSinhVien = d.MaSinhVien
        LEFT JOIN KHOAHOC k ON d.MaKhoaHoc = k.MaKhoaHoc
        WHERE s.MaSinhVien = @maSinhVien
      `);
    if (result.recordset[0]) {
      result.recordset[0].MaSinhVien = formatStudentId(result.recordset[0].MaSinhVien);
    }
    res.json(result.recordset[0] || null);
  } catch (err) { res.status(500).send(err.message); }
});

app.put("/students/:maSinhVien", async (req, res) => {
  try {
    const parsedSV = parseStudentId(req.params.maSinhVien);
    if (parsedSV === null) return res.status(400).json({ message: "Mã sinh viên không hợp lệ" });

    const { HoTen, Email, GioiTinh, NgaySinh, Lop, MSSV, BietDanh } = req.body;
    const pool = await poolPromise;

    // 1. Lấy MaNguoiDung từ MaSinhVien
    const svRes = await pool.request()
      .input("maSinhVien", parsedSV)
      .query("SELECT MaNguoiDung FROM SINHVIEN WHERE MaSinhVien = @maSinhVien");
    
    if (svRes.recordset.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy học viên" });
    }
    const maNguoiDung = svRes.recordset[0].MaNguoiDung;

    // 2. Cập nhật NGUOIDUNG
    await pool.request()
      .input("maNguoiDung", maNguoiDung)
      .input("HoTen", HoTen || "")
      .input("Email", Email || "")
      .input("GioiTinh", GioiTinh || "")
      .input("NgaySinh", NgaySinh || null)
      .query(`
        UPDATE NGUOIDUNG 
        SET HoTen = @HoTen, Email = @Email, GioiTinh = @GioiTinh, NgaySinh = @NgaySinh 
        WHERE MaNguoiDung = @maNguoiDung
      `);

    // 3. Cập nhật SINHVIEN (Lop, MSSV, BietDanh)
    let setClauses = [];
    const request = pool.request().input("maSinhVien", parsedSV);
    if (Lop !== undefined) {
      request.input("Lop", Lop || null);
      setClauses.push("Lop = @Lop");
    }
    if (MSSV !== undefined) {
      request.input("MSSV", MSSV || null);
      setClauses.push("MSSV = @MSSV");
    }
    if (BietDanh !== undefined) {
      request.input("BietDanh", BietDanh || null);
      setClauses.push("BietDanh = @BietDanh");
    }

    if (setClauses.length > 0) {
      await request.query(`
        UPDATE SINHVIEN 
        SET ${setClauses.join(", ")} 
        WHERE MaSinhVien = @maSinhVien
      `);
    }

    res.json({ message: "Cập nhật thông tin học viên thành công" });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get("/classes/:id/info", async (req, res) => {
  try {
    const pool = await poolPromise
    const result = await pool.request()
      .input("id", req.params.id)
      .query(`
        SELECT 
          l.MaLopHoc, l.TenLop, l.LichHoc,
          (SELECT COUNT(*) FROM SINHVIEN_LOPHOC WHERE MaLopHoc = l.MaLopHoc AND (TrangThai = N'Đang học' OR TrangThai = N'Hoàn thành' OR TrangThai = N'Đã hoàn thành')) AS SoLuongHocVien,
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
          s.MSSV,
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
        LEFT JOIN KETQUABAIKIEMTRA k ON (k.MaSinhVien = n.MaNguoiDung OR CAST(k.MaSinhVien AS NVARCHAR(50)) = s.MaSinhVien)
          AND k.MaBaiKiemTra IN (
            SELECT bkt.MaBaiKiemTra 
            FROM BAIKIEMTRA bkt
            WHERE bkt.MaBuoiHoc = @id
          )
        GROUP BY s.MaSinhVien, s.MSSV, n.HoTen, total.TongBai
        ORDER BY s.MaSinhVien
      `);
    const formatted = result.recordset.map(row => ({
      ...row,
      MaSinhVien: formatStudentId(row.MaSinhVien)
    }));
    res.json(formatted);
  } catch (err) { res.status(500).send(err.message); }
});


// Tiến độ học tập của sinh viên
app.get("/students/:maSinhVien/tiendo", async (req, res) => {
  try {
    const pool = await poolPromise;
    const parsedSV = parseStudentId(req.params.maSinhVien);
    const result = await pool.request()
      .input("maSinhVien", parsedSV)
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
    const parsedSV = parseStudentId(req.params.maSinhVien);
    const result = await pool.request()
      .input("maSinhVien", parsedSV)
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
          JOIN SINHVIEN sv ON (bn.MaSinhVien = sv.MaSinhVien OR bn.MaSinhVien = CAST(sv.MaNguoiDung AS NVARCHAR(50)))
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
    const rawMaBaiTap = req.params.maBaiTap.trim();
    const pool = await poolPromise;
    const maBaiTap = parseInt(rawMaBaiTap);
    
    // Kiểm tra xem ID này có thuộc BAIKIEMTRA hay không
    const examCheck = await pool.request()
      .input("MaBaiKiemTra", maBaiTap)
      .query("SELECT MaBaiKiemTra FROM BAIKIEMTRA WHERE MaBaiKiemTra = @MaBaiKiemTra");
      
    const isExam = examCheck.recordset.length > 0;
    
    let result;
    if (isExam) {
      result = await pool.request()
        .input("maBaiTap", maBaiTap)
        .query(`
          SELECT 
            k.MaKetQua AS MaBaiNop, CAST(NULL AS NVARCHAR(MAX)) AS NoiDung, k.ThoiGianLamBai AS NgayNop,
            k.Diem, CAST(N'' AS NVARCHAR(MAX)) AS NhanXet, N'Đã chấm' AS TrangThai,
            s.MaSinhVien, s.MSSV, n.HoTen, k.SoLanLamBai, CAST(0 AS INT) AS DaXemGiaiThich
          FROM KETQUABAIKIEMTRA k
          JOIN SINHVIEN s ON k.MaSinhVien = s.MaNguoiDung OR CAST(k.MaSinhVien AS NVARCHAR(50)) = s.MaSinhVien
          JOIN NGUOIDUNG n ON s.MaNguoiDung = n.MaNguoiDung
          WHERE k.MaBaiKiemTra = @maBaiTap
          ORDER BY k.ThoiGianLamBai DESC
        `);
    } else {
      result = await pool.request()
        .input("maBaiTap", maBaiTap)
        .query(`
          SELECT 
            b.MaBaiNop, b.NoiDung, b.NgayNop,
            b.Diem, b.NhanXet, b.TrangThai,
            s.MaSinhVien, s.MSSV, n.HoTen, b.SoLanLamBai, b.DaXemGiaiThich
          FROM BAINOP b
          JOIN SINHVIEN s ON b.MaSinhVien = s.MaSinhVien OR b.MaSinhVien = CAST(s.MaNguoiDung AS NVARCHAR(50))
          JOIN NGUOIDUNG n ON s.MaNguoiDung = n.MaNguoiDung
          WHERE b.MaBaiTap = @maBaiTap
          ORDER BY b.NgayNop DESC
        `);
    }
    
    const formatted = result.recordset.map(row => ({
      ...row,
      MaSinhVien: formatStudentId(row.MaSinhVien)
    }));
    res.json(formatted);
  } catch (err) { res.status(500).send(err.message); }
});

app.get("/bainop/:maBaiNop", async (req, res) => {
  try {
    const pool = await poolPromise;
    const maBaiNop = req.params.maBaiNop;
    
    // 1. Thử tìm trong BAINOP trước
    let result = await pool.request()
      .input("maBaiNop", maBaiNop)
      .query(`
        SELECT 
          b.MaBaiNop, b.MaBaiTap, b.NoiDung,
          b.NgayNop, b.Diem, b.NhanXet, b.TrangThai,
          s.MaSinhVien, s.MSSV, n.HoTen, b.DaXemGiaiThich
        FROM BAINOP b
        JOIN SINHVIEN s ON b.MaSinhVien = s.MaSinhVien OR b.MaSinhVien = CAST(s.MaNguoiDung AS NVARCHAR(50))
        JOIN NGUOIDUNG n ON s.MaNguoiDung = n.MaNguoiDung
        WHERE b.MaBaiNop = @maBaiNop
      `);
      
    if (result.recordset.length > 0) {
      const record = result.recordset[0];
      record.MaSinhVien = formatStudentId(record.MaSinhVien);
      return res.json(record);
    }
    
    // 2. Thử tìm trong KETQUABAIKIEMTRA nếu không thấy
    result = await pool.request()
      .input("maBaiNop", maBaiNop)
      .query(`
        SELECT 
          k.MaKetQua AS MaBaiNop, k.MaBaiKiemTra AS MaBaiTap, CAST(NULL AS NVARCHAR(MAX)) AS NoiDung,
          k.ThoiGianLamBai AS NgayNop, k.Diem, CAST(N'' AS NVARCHAR(MAX)) AS NhanXet, N'Đã chấm' AS TrangThai,
          s.MaSinhVien, s.MSSV, n.HoTen, CAST(0 AS INT) AS DaXemGiaiThich
        FROM KETQUABAIKIEMTRA k
        JOIN SINHVIEN s ON k.MaSinhVien = s.MaNguoiDung OR CAST(k.MaSinhVien AS NVARCHAR(50)) = s.MaSinhVien
        JOIN NGUOIDUNG n ON s.MaNguoiDung = n.MaNguoiDung
        WHERE k.MaKetQua = @maBaiNop
      `);
      
    if (result.recordset.length > 0) {
      const record = result.recordset[0];
      record.MaSinhVien = formatStudentId(record.MaSinhVien);
      return res.json(record);
    }
    
    res.status(404).json({ message: "Không tìm thấy bài nộp" });
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

// Đánh dấu đã xem giải thích/đáp án
app.put("/bainop/xem-giai-thich", async (req, res) => {
  try {
    const { MaSinhVien, MaBaiTap } = req.body;
    const parsedSV = parseStudentId(MaSinhVien);
    const sql = require("mssql");
    const pool = await poolPromise;

    // Phân giải MaSinhVien từ MaSinhVien hoặc MaNguoiDung
    const svRes = await pool.request()
      .input("id", sql.Int, parsedSV)
      .query(`
        SELECT MaSinhVien 
        FROM SINHVIEN 
        WHERE MaSinhVien = @id OR MaNguoiDung = @id
      `);
    
    let studentIdInt = parsedSV;
    if (svRes.recordset.length > 0) {
      studentIdInt = svRes.recordset[0].MaSinhVien;
    }

    await pool.request()
      .input("MaBaiTap", sql.Int, MaBaiTap)
      .input("ParsedSV", sql.Int, studentIdInt)
      .query(`
        UPDATE BAINOP 
        SET DaXemGiaiThich = 1 
        WHERE MaBaiTap=@MaBaiTap 
          AND MaSinhVien=@ParsedSV
      `);
    res.json({ message: "Đã đánh dấu đã xem giải thích thành công" });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Nộp bài
// Nộp bài
app.post("/bainop", async (req, res) => {
  try {
    const { MaSinhVien, NoiDung, Diem, TrangThai } = req.body;
    const MaBaiTap = req.body.MaBaiTap || req.body.MaExercise;
    const pool = await poolPromise;
    if (await isClassCompletedByBaiTap(pool, MaBaiTap)) {
      return res.status(400).json({ message: "Lớp học đã hoàn thành, không thể nộp bài hoặc làm lại bài kiểm tra!" });
    }
    const parsedSV = parseStudentId(MaSinhVien);

    // 1. Kiểm tra xem MaBaiTap này thuộc bảng BAIKIEMTRA hay BAITAP
    const examCheck = await pool.request()
      .input("MaBaiKiemTra", MaBaiTap)
      .query(`SELECT MaBaiKiemTra FROM BAIKIEMTRA WHERE MaBaiKiemTra = @MaBaiKiemTra`);

    const isExam = examCheck.recordset.length > 0;

    if (isExam) {
      // Tính số lần làm bài mới
      const countRes = await pool.request()
        .input("MaBaiKiemTra", MaBaiTap)
        .input("MaSinhVien", parsedSV)
        .query(`SELECT ISNULL(MAX(SoLanLamBai), 0) AS MaxAttempt FROM KETQUABAIKIEMTRA WHERE MaBaiKiemTra = @MaBaiKiemTra AND MaSinhVien = @MaSinhVien`);
      
      const newAttempt = countRes.recordset[0].MaxAttempt + 1;

      await pool.request()
        .input("MaBaiKiemTra", MaBaiTap)
        .input("MaSinhVien", parsedSV)
        .input("Diem", Diem ?? null)
        .input("SoLanLamBai", newAttempt)
        .query(`
          INSERT INTO KETQUABAIKIEMTRA (MaBaiKiemTra, MaSinhVien, Diem, ThoiGianLamBai, SoLanLamBai)
          VALUES (@MaBaiKiemTra, @MaSinhVien, @Diem, GETDATE(), @SoLanLamBai)
        `);

      res.json({ message: "Nộp bài kiểm tra thành công", attempt: newAttempt });
    } else {
      // Tính số lần làm bài mới và xem giải thích
      const countRes = await pool.request()
        .input("MaBaiTap", MaBaiTap)
        .input("MaSinhVien", MaSinhVien)
        .query(`
          SELECT 
            ISNULL(MAX(SoLanLamBai), 0) AS MaxAttempt,
            ISNULL(MAX(DaXemGiaiThich), 0) AS HasReviewed
          FROM BAINOP 
          WHERE MaBaiTap=@MaBaiTap AND MaSinhVien=@MaSinhVien
        `);
      
      const maxAttempt = countRes.recordset[0].MaxAttempt;
      const hasReviewed = countRes.recordset[0].HasReviewed;

      if (maxAttempt >= 3) {
        return res.status(400).json({ message: "Bạn đã làm bài tập này tối đa 3 lần!" });
      }

      if (hasReviewed === 1) {
        return res.status(400).json({ message: "Bạn đã xem giải thích/đáp án, không thể làm lại bài tập này!" });
      }

      const newAttempt = maxAttempt + 1;



      await pool.request()
        .input("MaBaiTap", MaBaiTap)
        .input("MaSinhVien", MaSinhVien)
        .input("NoiDung", NoiDung || "")
        .input("Diem", Diem ?? null)
        .input("TrangThai", TrangThai || "Chờ chấm")
        .input("SoLanLamBai", newAttempt)
        .query(`
          INSERT INTO BAINOP (MaBaiTap, MaSinhVien, NoiDung, Diem, TrangThai, SoLanLamBai, DaXemGiaiThich)
          VALUES (@MaBaiTap, @MaSinhVien, @NoiDung, @Diem, @TrangThai, @SoLanLamBai, 0)
        `);

      res.json({ message: "Nộp bài thành công", attempt: newAttempt });
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Đánh dấu đã xem giải thích/đáp án
app.put("/bainop/xem-giai-thich", async (req, res) => {
  try {
    const { MaSinhVien, MaBaiTap } = req.body;
    const pool = await poolPromise;
    await pool.request()
      .input("MaBaiTap", MaBaiTap)
      .input("MaSinhVien", MaSinhVien)
      .query(`UPDATE BAINOP SET DaXemGiaiThich = 1 WHERE MaBaiTap=@MaBaiTap AND MaSinhVien=@MaSinhVien`);
    res.json({ message: "Đã đánh dấu đã xem giải thích thành công" });
  } catch (err) {
    res.status(500).send(err.message);
  }
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
      .query(`SELECT COUNT(*) AS total FROM SINHVIEN_LOPHOC`);

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
app.get("/admin/khoahoc", async (req, res) => {
  try {
    const showAll = req.query.all !== "false" && req.query.all !== false;
    const pool = await poolPromise;
    let queryStr = `
      SELECT 
        kh.MaKhoaHoc,
        kh.TenKhoaHoc,
        kh.MoTa,
        kh.TrinhDo,
        kh.Listening,
        kh.Reading,
        kh.Writing,
        kh.Speaking,
        kh.TrangThai,
        kh.NgayTao,
        kh.NgayDuyet,
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
    `;
    
    if (!showAll) {
      queryStr += ` WHERE kh.TrangThai = N'Hiển thị'`;
    }
    
    const result = await pool.request().query(queryStr);
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
    if (await isClassCompletedByBuoiHoc(pool, MaBuoiHoc)) {
      return res.status(400).json({ message: "Lớp học đã hoàn thành, không thể tạo bài tập mới!" });
    }
    if (await isBuoiHocCompleted(pool, MaBuoiHoc)) {
      return res.status(400).json({ message: "Buổi học đã hoàn thành, không thể tạo bài tập mới!" });
    }
    let resolvedMaGiangVien = null;
    let isQTV = true;
    if (MaGiangVien) {
      // Map MaNguoiDung from frontend to MaGiangVien in database
      const gvResult = await pool.request()
        .input("maNguoiDung", MaGiangVien)
        .query(`SELECT MaGiangVien FROM GIANGVIEN WHERE MaNguoiDung = @maNguoiDung`);
      if (gvResult.recordset.length > 0) {
        resolvedMaGiangVien = gvResult.recordset[0].MaGiangVien;
        isQTV = false;
      }
    }

    if (!isQTV) {
      if (!resolvedMaGiangVien && MaBuoiHoc) {
        const classTeacherResult = await pool.request()
          .input("buoiHocId", MaBuoiHoc)
          .query(`
            SELECT TOP 1 pc.MaGiangVien 
            FROM BUOIHOC b
            LEFT JOIN PHANCONGGIANGVIEN pc ON b.MaLopHoc = pc.MaLopHoc
            WHERE b.MaBuoiHoc = @buoiHocId
          `);
        if (classTeacherResult.recordset.length > 0) {
          resolvedMaGiangVien = classTeacherResult.recordset[0].MaGiangVien;
        }
      }
    }

    const finalTrangThaiCreate = isQTV ? "Đã duyệt" : normalizeTrangThai(TrangThai);
    const finalTrangThaiDuyetCreate = finalTrangThaiCreate;

    const isExamMode = (Type === "exam" || IsExam === 1 || IsExam === true || req.body.LaBaiKiemTra === 1 || req.body.LaBaiKiemTra === true);

    if (isExamMode) {
      // Parse timing details from Content JSON
      let durationVal = 45;
      let startTimeVal = null;
      let deadlineVal = null;
      try {
        if (Content) {
          const parsedContent = JSON.parse(Content);
          durationVal = parsedContent.duration || durationVal;
          startTimeVal = parsedContent.startTime ? normalizeDeadline(parsedContent.startTime) : null;
          deadlineVal = normalizeDeadline(parsedContent.deadline || parsedContent.deadlineDate || null);
        }
      } catch (err) {
        console.error("Error parsing exam content JSON:", err);
      }

      await pool.request()
        .input("TenBai", Title)
        .input("ThoiGian", durationVal)
        .input("NgayBatDau", startTimeVal)
        .input("HanNop", deadlineVal)
        .input("MaBuoiHoc", MaBuoiHoc)
        .input("MaGiangVien", resolvedMaGiangVien || null)
        .input("TongDiem", 10.0)
        .input("ShowAnswer", ShowAnswer ? 1 : 0)
        .input("TrangThai", finalTrangThaiCreate)
        .input("TrangThaiDuyet", finalTrangThaiDuyetCreate)
        .input("NoiDung", Content || "")
        .input("CauHoi", Questions || "")
        .input("MaNguoiDung", MaGiangVien || null)
        .query(`
          INSERT INTO BAIKIEMTRA 
            (TenBai, ThoiGian, NgayBatDau, HanNop, MaBuoiHoc, MaGiangVien, TongDiem, ShowAnswer, TrangThai, TrangThaiDuyet, NoiDung, CauHoi, NgayTao, MaNguoiDung)
          VALUES 
            (@TenBai, @ThoiGian, @NgayBatDau, @HanNop, @MaBuoiHoc, @MaGiangVien, @TongDiem, @ShowAnswer, @TrangThai, @TrangThaiDuyet, @NoiDung, @CauHoi, GETDATE(), @MaNguoiDung)
        `);

      res.json({ message: "Thêm bài kiểm tra thành công" });
    } else {
      let targetMaBaiHoc = MaBaiHoc;

      if (!targetMaBaiHoc && MaBuoiHoc) {
        const bhResult = await pool.request()
          .input("buoiHocId", MaBuoiHoc)
          .query(`SELECT TOP 1 MaBaiHoc FROM BAIHOCKHOAHOC WHERE MaBuoiHoc = @buoiHocId ORDER BY ThuTu ASC`);
        if (bhResult.recordset.length > 0) {
          targetMaBaiHoc = bhResult.recordset[0].MaBaiHoc;
        } else {
          const insertBh = await pool.request()
            .input("buoiHocId", MaBuoiHoc)
            .input("MaNguoiDung", MaGiangVien || null)
            .input("TrangThai", isQTV ? "published" : "published")
            .query(`
              INSERT INTO BAIHOCKHOAHOC (MaKhoaHoc, TieuDe, NoiDung, TrangThai, MaBuoiHoc, MaNguoiDung)
              VALUES (1, N'Bài giảng mặc định', '', @TrangThai, @buoiHocId, @MaNguoiDung);
              SELECT SCOPE_IDENTITY() AS MaBaiHoc;
            `);
          targetMaBaiHoc = insertBh.recordset[0].MaBaiHoc;
        }
      }

      if (!targetMaBaiHoc) {
        return res.status(400).json({ message: "Thiếu thông tin bài giảng (MaBaiHoc)" });
      }

      let deadlineVal = null;
      if (Content && typeof Content === "string" && Content.trim().startsWith("{")) {
        try {
          const parsed = JSON.parse(Content);
          deadlineVal = normalizeDeadline(parsed.deadline || parsed.deadlineDate || null);
        } catch (e) {
          console.error("Error parsing content for deadline in create:", e);
        }
      }

      await pool.request()
        .input("TieuDe",        Title)
        .input("DangBai",       DangBai || Type || null)
        .input("NoiDung",       Content     || "")
        .input("CauHoi",        Questions   || "")
        .input("NgayTao",       CreatedDate || new Date().toISOString().split('T')[0])
        .input("MaBaiHoc",      targetMaBaiHoc)
        .input("LinkAmThanh",   AudioUrl    || "")
        .input("HienThiDapAn",  ShowAnswer  ? 1 : 0)
        .input("HocThuMienPhi", IsFree      ? 1 : 0)
        .input("LaBaiKiemTra",  0)
        .input("TrangThai",     finalTrangThaiCreate)
        .input("TrangThaiDuyet", finalTrangThaiDuyetCreate)
        .input("KyNang",        KyNang      || null)
        .input("FileDinhKem",   FileDinhKem || null)
        .input("MaNguoiDung",   MaGiangVien || null)
        .input("HanNop",        deadlineVal)
        .query(`
          INSERT INTO BAITAP
            (TieuDe, DangBai, NoiDung, CauHoi, NgayTao, MaBaiHoc, LinkAmThanh, HienThiDapAn, HocThuMienPhi, LaBaiKiemTra, TrangThai, TrangThaiDuyet, KyNang, FileDinhKem, MaNguoiDung, HanNop)
          VALUES
            (@TieuDe, @DangBai, @NoiDung, @CauHoi, @NgayTao, @MaBaiHoc, @LinkAmThanh, @HienThiDapAn, @HocThuMienPhi, @LaBaiKiemTra, @TrangThai, @TrangThaiDuyet, @KyNang, @FileDinhKem, @MaNguoiDung, @HanNop)
        `);

      res.json({ message: "Thêm bài tập thành công" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Lỗi server");
  }
});

// ── Học viên gửi yêu cầu ghi danh vào lớp ──
app.post("/student/lophoc/request-ghidanh", async (req, res) => {
  try {
    const { MaLopHoc, MaSinhVien } = req.body
    const pool = await poolPromise
    const parsedSV = parseStudentId(MaSinhVien);

    // 1. Kiểm tra lớp học có tồn tại không
    const classCheck = await pool.request()
      .input("MaLopHoc", MaLopHoc)
      .query(`SELECT TenLop FROM LOPHOC WHERE MaLopHoc = @MaLopHoc`)
    if (classCheck.recordset.length === 0) {
      return res.status(400).json({ message: "Mã lớp học không tồn tại trên hệ thống." })
    }

    // 2. Kiểm tra học viên đã được ghi danh vào lớp này chưa
    const checkEnrolled = await pool.request()
      .input("MaLopHoc", MaLopHoc)
      .input("MaSinhVien", parsedSV)
      .query(`SELECT TrangThai FROM SINHVIEN_LOPHOC WHERE MaLopHoc=@MaLopHoc AND MaSinhVien=@MaSinhVien`)
    if (checkEnrolled.recordset.length > 0) {
      const status = checkEnrolled.recordset[0].TrangThai;
      if (status === "Đang học") {
        return res.status(400).json({ message: "Bạn đang học lớp này rồi." })
      } else if (status === "Chờ ghi danh") {
        return res.status(400).json({ message: "Yêu cầu ghi danh vào lớp này đang chờ phê duyệt." })
      } else if (status === "Hoàn thành") {
        return res.status(400).json({ message: "Bạn đã hoàn thành lớp học này trước đó." })
      }
    }

    // 3. Kiểm tra xem sinh viên có đang học lớp nào khác hoặc có yêu cầu chờ duyệt nào không
    const activeClassCheck = await pool.request()
      .input("MaSinhVien", parsedSV)
      .query(`
        SELECT l.TenLop, sl.TrangThai 
        FROM SINHVIEN_LOPHOC sl
        JOIN LOPHOC l ON sl.MaLopHoc = l.MaLopHoc
        WHERE sl.MaSinhVien = @MaSinhVien AND sl.TrangThai IN (N'Đang học', N'Chờ ghi danh')
      `)
    if (activeClassCheck.recordset.length > 0) {
      const row = activeClassCheck.recordset[0];
      if (row.TrangThai === "Đang học") {
        return res.status(400).json({ 
          message: `Bạn đang học lớp '${row.TenLop}'. Mỗi sinh viên chỉ được ghi danh và học 1 lớp tại một thời điểm.` 
        });
      } else if (row.TrangThai === "Chờ ghi danh") {
        return res.status(400).json({ 
          message: `Bạn đã gửi yêu cầu ghi danh vào lớp '${row.TenLop}' và đang chờ phê duyệt. Vui lòng đợi kết quả.` 
        });
      }
    }

    // 4. Nếu có bản ghi 'Từ chối' trước đó, cập nhật lại trạng thái thành 'Chờ ghi danh' và cập nhật ngày ghi danh
    const checkRejected = await pool.request()
      .input("MaLopHoc", MaLopHoc)
      .input("MaSinhVien", parsedSV)
      .query(`SELECT MaGhiDanh FROM SINHVIEN_LOPHOC WHERE MaLopHoc=@MaLopHoc AND MaSinhVien=@MaSinhVien AND TrangThai = N'Từ chối'`)

    if (checkRejected.recordset.length > 0) {
      await pool.request()
        .input("MaLopHoc", MaLopHoc)
        .input("MaSinhVien", parsedSV)
        .query(`UPDATE SINHVIEN_LOPHOC SET TrangThai = N'Chờ ghi danh', NgayGhiDanh = GETDATE() WHERE MaLopHoc=@MaLopHoc AND MaSinhVien=@MaSinhVien`)
    } else {
      await pool.request()
        .input("MaLopHoc", MaLopHoc)
        .input("MaSinhVien", parsedSV)
        .query(`INSERT INTO SINHVIEN_LOPHOC (MaLopHoc, MaSinhVien, NgayGhiDanh, TrangThai)
                VALUES (@MaLopHoc, @MaSinhVien, GETDATE(), N'Chờ ghi danh')`)
    }

    res.json({ message: "Gửi yêu cầu ghi danh thành công! Vui lòng chờ Quản trị viên phê duyệt." })
  } catch (err) { res.status(500).send(err.message) }
})

// ── Lấy danh sách yêu cầu ghi danh đang chờ phê duyệt (cho QTV) ──
app.get("/dangky/pending", async (req, res) => {
  try {
    const pool = await poolPromise
    const result = await pool.request().query(`
      SELECT 
        sl.MaGhiDanh AS MaDangKy,
        k.MaKhoaHoc,
        sl.MaSinhVien,
        s.MSSV,
        sl.NgayGhiDanh AS NgayDangKy,
        sl.TrangThai,
        n.HoTen,
        k.TenKhoaHoc,
        lh.MaLopHoc,
        lh.TenLop
      FROM SINHVIEN_LOPHOC sl
      JOIN SINHVIEN s ON sl.MaSinhVien = s.MaSinhVien
      JOIN NGUOIDUNG n ON s.MaNguoiDung = n.MaNguoiDung
      JOIN LOPHOC lh ON sl.MaLopHoc = lh.MaLopHoc
      JOIN KHOAHOCCHITIET khct ON lh.MaLop = khct.MaLop
      JOIN KHOAHOC k ON khct.MaKhoaHoc = k.MaKhoaHoc
      WHERE sl.TrangThai IN (N'Chờ ghi danh', N'Đang học', N'Từ chối', N'Đã ghi danh')
      ORDER BY sl.NgayGhiDanh DESC
    `)
    const formatted = result.recordset.map(row => ({
      ...row,
      MaSinhVien: formatStudentId(row.MaSinhVien),
      TrangThai: (row.TrangThai === 'Đang học' || row.TrangThai === 'Đã ghi danh') ? 'Đã ghi danh' : row.TrangThai
    }));
    res.json(formatted)
  } catch (err) { res.status(500).send(err.message) }
})

// ── Lấy danh sách học viên có yêu cầu chờ ghi danh vào một lớp học cụ thể ──
app.get("/students/pending-enroll/:classId", async (req, res) => {
  try {
    const pool = await poolPromise
    const result = await pool.request()
      .input("classId", req.params.classId)
      .query(`
        SELECT 
          sl.MaGhiDanh,
          s.MaSinhVien,
          n.HoTen,
          n.GioiTinh,
          s.Lop,
          sl.NgayGhiDanh,
          sl.TrangThai
        FROM SINHVIEN_LOPHOC sl
        JOIN SINHVIEN s ON sl.MaSinhVien = s.MaSinhVien
        JOIN NGUOIDUNG n ON s.MaNguoiDung = n.MaNguoiDung
        WHERE sl.MaLopHoc = @classId AND sl.TrangThai = N'Chờ ghi danh'
        ORDER BY sl.NgayGhiDanh DESC
      `)
    
    const formatted = result.recordset.map(row => ({
      ...row,
      MaSinhVien: formatStudentId(row.MaSinhVien)
    }));
    res.json(formatted)
  } catch (err) { res.status(500).send(err.message) }
})

// ── Lấy danh sách toàn bộ học viên đã ghi danh thành công (cho QTV) ──
app.get("/qtv/students/enrolled", async (req, res) => {
  try {
    const pool = await poolPromise
    const result = await pool.request().query(`
      SELECT DISTINCT
        s.MaSinhVien,
        s.MSSV,
        n.HoTen,
        s.BietDanh,
        n.GioiTinh,
        sl.NgayGhiDanh,
        sl.TrangThai,
        lh.MaLopHoc,
        lh.TenLop,
        k.TenKhoaHoc,
        k.MaKhoaHoc
      FROM SINHVIEN_LOPHOC sl
      JOIN SINHVIEN s ON sl.MaSinhVien = s.MaSinhVien
      JOIN NGUOIDUNG n ON s.MaNguoiDung = n.MaNguoiDung
      JOIN LOPHOC lh ON sl.MaLopHoc = lh.MaLopHoc
      JOIN KHOAHOCCHITIET kc ON lh.MaLop = kc.MaLop
      JOIN KHOAHOC k ON kc.MaKhoaHoc = k.MaKhoaHoc
      WHERE sl.TrangThai = N'Đang học' OR sl.TrangThai = N'Hoàn thành' OR sl.TrangThai = N'Đã hoàn thành'
      ORDER BY sl.NgayGhiDanh DESC
    `);
    const formatted = result.recordset.map(row => ({
      ...row,
      MaSinhVien: formatStudentId(row.MaSinhVien)
    }));
    res.json(formatted)
  } catch (err) { res.status(500).send(err.message) }
})

// ── QTV phê duyệt ghi danh học viên vào lớp ──
app.post("/qtv/lophoc/:id/ghidanh", async (req, res) => {
  try {
    const { MaSinhVien } = req.body
    const pool = await poolPromise
    const parsedSV = parseStudentId(MaSinhVien);
    const targetClassId = req.params.id;

    // 1. Kiểm tra xem học viên có đang trong một lớp học khác không
    const activeClassCheck = await pool.request()
      .input("MaSinhVien", parsedSV)
      .input("TargetClassId", targetClassId)
      .query(`
        SELECT l.TenLop 
        FROM SINHVIEN_LOPHOC sl
        JOIN LOPHOC l ON sl.MaLopHoc = l.MaLopHoc
        WHERE sl.MaSinhVien = @MaSinhVien AND sl.TrangThai = N'Đang học' AND sl.MaLopHoc <> @TargetClassId
      `)
    if (activeClassCheck.recordset.length > 0) {
      const currentClass = activeClassCheck.recordset[0].TenLop;
      return res.status(400).json({ 
        message: `Học viên đang học lớp '${currentClass}'. Không thể duyệt vào lớp mới.` 
      });
    }

    // 2. Tìm yêu cầu ghi danh của học viên này
    const requestCheck = await pool.request()
      .input("MaSinhVien", parsedSV)
      .query(`
        SELECT MaGhiDanh, MaLopHoc 
        FROM SINHVIEN_LOPHOC 
        WHERE MaSinhVien = @MaSinhVien AND TrangThai = N'Chờ ghi danh'
      `)
    
    if (requestCheck.recordset.length > 0) {
      const pendingRecord = requestCheck.recordset[0];
      await pool.request()
        .input("MaGhiDanh", pendingRecord.MaGhiDanh)
        .input("MaLopHoc", targetClassId)
        .query(`
          UPDATE SINHVIEN_LOPHOC 
          SET TrangThai = N'Đang học', MaLopHoc = @MaLopHoc, NgayGhiDanh = GETDATE()
          WHERE MaGhiDanh = @MaGhiDanh
        `)
    } else {
      const existsCheck = await pool.request()
        .input("MaLopHoc", targetClassId)
        .input("MaSinhVien", parsedSV)
        .query(`SELECT TrangThai FROM SINHVIEN_LOPHOC WHERE MaLopHoc=@MaLopHoc AND MaSinhVien=@MaSinhVien`)

      if (existsCheck.recordset.length > 0) {
        await pool.request()
          .input("MaLopHoc", targetClassId)
          .input("MaSinhVien", parsedSV)
          .query(`UPDATE SINHVIEN_LOPHOC SET TrangThai = N'Đang học', NgayGhiDanh = GETDATE() WHERE MaLopHoc=@MaLopHoc AND MaSinhVien=@MaSinhVien`)
      } else {
        await pool.request()
          .input("MaLopHoc", targetClassId)
          .input("MaSinhVien", parsedSV)
          .query(`INSERT INTO SINHVIEN_LOPHOC (MaLopHoc, MaSinhVien, NgayGhiDanh, TrangThai)
                  VALUES (@MaLopHoc, @MaSinhVien, GETDATE(), N'Đang học')`)
      }
    }

    // 3. Tự động cập nhật MaVaiTro = 3 (Học viên đã vào lớp) trong bảng NGUOIDUNG
    await pool.request()
      .input("MaSinhVien", parsedSV)
      .query(`
        UPDATE NGUOIDUNG
        SET MaVaiTro = 3
        WHERE MaNguoiDung = (SELECT MaNguoiDung FROM SINHVIEN WHERE MaSinhVien = @MaSinhVien)
      `)

    res.json({ message: "Duyệt học viên vào lớp thành công" })
  } catch (err) { res.status(500).send(err.message) }
})

// ── QTV từ chối yêu cầu ghi danh của học viên ──
app.put("/dangky/:id/status", async (req, res) => {
  try {
    const { TrangThai } = req.body
    const pool = await poolPromise
    
    await pool.request()
      .input("id", req.params.id)
      .input("TrangThai", TrangThai || "Từ chối")
      .query(`UPDATE SINHVIEN_LOPHOC SET TrangThai = @TrangThai WHERE MaGhiDanh = @id`)
      
    res.json({ message: "Cập nhật trạng thái yêu cầu thành công" })
  } catch (err) { res.status(500).send(err.message) }
})

// ── QTV hủy ghi danh học viên ra khỏi lớp ──
app.delete("/qtv/lophoc/:id/ghidanh/:maSinhVien", async (req, res) => {
  try {
    const pool = await poolPromise
    const parsedSV = parseStudentId(req.params.maSinhVien);
    const classId = req.params.id;

    await pool.request()
      .input("MaLopHoc", classId)
      .input("MaSinhVien", parsedSV)
      .query(`DELETE FROM SINHVIEN_LOPHOC WHERE MaLopHoc=@MaLopHoc AND MaSinhVien=@MaSinhVien`)

    await pool.request()
      .input("MaSinhVien", parsedSV)
      .query(`
        UPDATE NGUOIDUNG
        SET MaVaiTro = CASE 
          WHEN EXISTS (
              SELECT 1 
              FROM SINHVIEN_LOPHOC sl
              WHERE sl.MaSinhVien = @MaSinhVien AND sl.TrangThai = N'Đang học'
          ) THEN 3
          ELSE 5
        END
        WHERE MaNguoiDung = (SELECT MaNguoiDung FROM SINHVIEN WHERE MaSinhVien = @MaSinhVien)
      `)

    res.json({ message: "Đã hủy ghi danh thành công" })
  } catch (err) { res.status(500).send(err.message) }
})

// ── Lấy sinh viên trong lớp (cho QTV) ──
app.get("/lophoc/:id/sinhvien", async (req, res) => {
  try {
    const pool = await poolPromise
    const result = await pool.request()
      .input("id", req.params.id)
      .query(`
        SELECT sl.MaSinhVien, s.MSSV, n.HoTen, s.BietDanh, n.GioiTinh,
               sl.NgayGhiDanh, sl.TrangThai
        FROM SINHVIEN_LOPHOC sl
        JOIN SINHVIEN s ON sl.MaSinhVien = s.MaSinhVien
        JOIN NGUOIDUNG n ON s.MaNguoiDung = n.MaNguoiDung
        WHERE sl.MaLopHoc = @id AND sl.TrangThai <> N'Chờ ghi danh' AND sl.TrangThai <> N'Từ chối'
      `)
    const formatted = result.recordset.map(row => ({
      ...row,
      MaSinhVien: formatStudentId(row.MaSinhVien)
    }));
    res.json(formatted)
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
        SELECT sl.MaSinhVien, s.MSSV, n.HoTen, s.BietDanh, n.GioiTinh,
               sl.NgayGhiDanh, sl.TrangThai, s.MaNguoiDung
        FROM SINHVIEN_LOPHOC sl
        JOIN SINHVIEN s ON sl.MaSinhVien = s.MaSinhVien
        JOIN NGUOIDUNG n ON s.MaNguoiDung = n.MaNguoiDung
        WHERE sl.MaLopHoc = @id AND sl.TrangThai <> N'Chờ ghi danh' AND sl.TrangThai <> N'Từ chối'
      `)
    const formatted = result.recordset.map(row => ({
      ...row,
      MaSinhVien: formatStudentId(row.MaSinhVien)
    }));
    res.json(formatted)
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
    const { TenKhoaHoc, MoTa, TrinhDo, Listening, Reading, Speaking, Writing } = req.body
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
        .query(`SELECT Listening, Reading, Speaking, Writing FROM KHOAHOC WHERE MaKhoaHoc=@id`);
      const row = currentCourse.recordset[0];
      const currentL = row?.Listening ? 1 : 0;
      const currentR = row?.Reading ? 1 : 0;
      const currentS = row?.Speaking ? 1 : 0;
      const currentW = row?.Writing ? 1 : 0;
      
      const newL = Listening !== undefined ? Number(Listening) : currentL;
      const newR = Reading !== undefined ? Number(Reading) : currentR;
      const newS = Speaking !== undefined ? Number(Speaking) : currentS;
      const newW = Writing !== undefined ? Number(Writing) : currentW;

      if ((Listening !== undefined && newL !== currentL) ||
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
      .input("Listening", Listening !== undefined ? Number(Listening) : null)
      .input("Reading", Reading !== undefined ? Number(Reading) : null)
      .input("Speaking", Speaking !== undefined ? Number(Speaking) : null)
      .input("Writing", Writing !== undefined ? Number(Writing) : null)
      .query(`
        UPDATE KHOAHOC 
        SET TenKhoaHoc=@TenKhoaHoc, MoTa=@MoTa, TrinhDo=@TrinhDo, 
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
          s.MSSV,
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
    const formatted = result.recordset.map(row => ({
      ...row,
      MaSinhVien: formatStudentId(row.MaSinhVien)
    }));
    res.json(formatted)
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
          (SELECT COUNT(*) FROM SINHVIEN_LOPHOC WHERE MaLopHoc = l.MaLopHoc AND (TrangThai = N'Đang học' OR TrangThai = N'Hoàn thành' OR TrangThai = N'Đã hoàn thành')) AS SoLuongHocVien,
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
          s.MSSV,
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
        GROUP BY s.MaSinhVien, s.MSSV, n.HoTen, total.TongBai
        ORDER BY s.MaSinhVien
      `);
    const formatted = result.recordset.map(row => ({
      ...row,
      MaSinhVien: formatStudentId(row.MaSinhVien)
    }));
    res.json(formatted);
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
      LEFT JOIN NGUOIDUNG n ON e.MaNguoiDung = n.MaNguoiDung
      LEFT JOIN BAIHOCKHOAHOC bh ON e.MaBaiHoc = bh.MaBaiHoc
      LEFT JOIN KHOAHOC k ON bh.MaKhoaHoc = k.MaKhoaHoc
      LEFT JOIN BUOIHOC ls ON bh.MaBuoiHoc = ls.MaBuoiHoc
      LEFT JOIN LOPHOC l ON ls.MaLopHoc = l.MaLopHoc
      WHERE e.TrangThai IS NULL OR e.TrangThai NOT IN ('draft', N'Nháp', N'Lưu nháp')

      UNION ALL

      -- Lấy danh sách Bài kiểm tra
      SELECT DISTINCT 'exam-' + CAST(e.MaBaiKiemTra AS VARCHAR) AS MaBaiTap, 
             e.TenBai AS Title, 
             N'Bài kiểm tra' AS Type, 
             ISNULL(e.NgayTao, k.NgayTao) AS CreatedDate,
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
      LEFT JOIN NGUOIDUNG n ON e.MaNguoiDung = n.MaNguoiDung
      LEFT JOIN BUOIHOC ls ON e.MaBuoiHoc = ls.MaBuoiHoc
      LEFT JOIN LOPHOC l ON ls.MaLopHoc = l.MaLopHoc
      LEFT JOIN KHOAHOC k ON l.MaLop = k.MaKhoaHoc
      WHERE (e.TrangThai IS NULL OR e.TrangThai NOT IN ('draft', N'Nháp', N'Lưu nháp')) AND (e.TrangThaiDuyet IS NULL OR e.TrangThaiDuyet NOT IN ('draft', N'Nháp', N'Lưu nháp'))
      ORDER BY MaBaiTap DESC
    `);
    res.json(result.recordset);
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
        s.MaSinhVien, s.MSSV, s.MaNguoiDung,
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
      ORDER BY b.MaBaiNop ASC
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
      MaSinhVien: formatStudentId(sinhVien.MaSinhVien),
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
          WHEN n.MaVaiTro = 1 THEN N'Quản Trị Viên'
          WHEN n.MaVaiTro = 2 THEN N'Giảng Viên'
          WHEN n.MaVaiTro = 4 THEN N'Quản Trị Nội Dung'
          WHEN n.MaVaiTro = 3 OR n.MaVaiTro = 5 THEN N'Học Viên'
          ELSE N'Học Viên'
        END AS VaiTro
      FROM NGUOIDUNG n
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

    // 1. Kiểm tra Tên đăng nhập tồn tại
    const checkUsername = await pool.request()
      .input("username", TenDangNhap)
      .query("SELECT MaNguoiDung FROM NGUOIDUNG WHERE TenDangNhap = @username");
    if (checkUsername.recordset.length > 0) {
      return res.status(400).json({ errorType: "username", message: "Tên đăng nhập đã tồn tại!" });
    }

    // 2. Kiểm tra Email tồn tại
    const checkEmail = await pool.request()
      .input("email", Email)
      .query("SELECT MaNguoiDung FROM NGUOIDUNG WHERE Email = @email");
    if (checkEmail.recordset.length > 0) {
      return res.status(400).json({ errorType: "email", message: "Email đã tồn tại!" });
    }

    let maVaiTro = 5; // Mặc định: Học viên chưa có lớp học
    if (VaiTro === "Giảng Viên") maVaiTro = 2;
    else if (VaiTro === "Quản Trị Nội Dung") maVaiTro = 4;
    else if (VaiTro === "Quản Trị Viên") maVaiTro = 1;

    // Tạo NGUOIDUNG
    const result = await pool.request()
      .input("TenDangNhap", TenDangNhap)
      .input("HoTen", HoTen)
      .input("Email", Email)
      .input("MatKhau", MatKhau || "123456")
      .input("MaVaiTro", maVaiTro)
      .query(`INSERT INTO NGUOIDUNG (TenDangNhap,HoTen,Email,MatKhau,TrangThai,NgayTao,MaVaiTro)
              OUTPUT INSERTED.MaNguoiDung
              VALUES (@TenDangNhap,@HoTen,@Email,@MatKhau,N'Active',GETDATE(),@MaVaiTro)`)
    const newId = result.recordset[0].MaNguoiDung
    // Gán vai trò vào các bảng con để lưu trữ thuộc tính đặc thù
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
      // Học Viên — cần MaSinhVien (IDENTITY)
      await pool.request().input("id", newId)
        .query(`INSERT INTO SINHVIEN (MaNguoiDung) VALUES (@id)`)
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


// Đăng ký theo tháng
app.get("/admin/stats/dangky-thang", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT MONTH(NgayGhiDanh) AS Thang, COUNT(*) AS SoLuong
      FROM SINHVIEN_LOPHOC
      WHERE NgayGhiDanh IS NOT NULL
      GROUP BY MONTH(NgayGhiDanh)
    `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send(err.message);
  }
});


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
      WHERE k.TrangThai = N'Hiển thị'
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
      const svResult = await pool.request()
        .input("maNguoiDung", req.params.maNguoiDung)
        .query(`INSERT INTO SINHVIEN (MaNguoiDung) OUTPUT INSERTED.MaSinhVien VALUES (@maNguoiDung)`);
      const maSVInt = svResult.recordset[0].MaSinhVien;
      const maSVStr = formatStudentId(maSVInt);
      
      return res.json({ MaSinhVien: maSVStr });
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
        WHERE k.MaKhoaHoc = @id AND k.TrangThai = N'Hiển thị'
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
          n.NgaySinh, n.GioiTinh, n.TrangThai, n.AnhDaiDien,
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
    const pool = await poolPromise;
    const maNguoiDung = req.params.maNguoiDung;

    // 1. Lấy MaSinhVien của học viên
    const studentRes = await pool.request()
      .input("maNguoiDung", maNguoiDung)
      .query("SELECT MaSinhVien FROM SINHVIEN WHERE MaNguoiDung = @maNguoiDung");
    
    if (studentRes.recordset.length === 0) {
      return res.json([]);
    }
    const maSinhVien = studentRes.recordset[0].MaSinhVien;
    const maSinhVienCode = "SV" + String(maSinhVien).padStart(8, '0');

    // 2. Lấy danh sách lớp học đang tham gia của sinh viên
    const classesRes = await pool.request()
      .input("maSinhVien", maSinhVien)
      .query(`
        SELECT 
          l.MaLopHoc, l.TenLop, l.LichHoc,
          (SELECT COUNT(*) FROM SINHVIEN_LOPHOC WHERE MaLopHoc = l.MaLopHoc AND (TrangThai = N'Đang học' OR TrangThai = N'Hoàn thành' OR TrangThai = N'Đã hoàn thành')) AS SoLuongHocVien,
          k.TenKhoaHoc,
          sl.TrangThai, sl.NgayGhiDanh
        FROM SINHVIEN_LOPHOC sl
        JOIN LOPHOC l ON sl.MaLopHoc = l.MaLopHoc
        JOIN KHOAHOCCHITIET kc ON l.MaLop = kc.MaLop
        JOIN KHOAHOC k ON kc.MaKhoaHoc = k.MaKhoaHoc
        WHERE sl.MaSinhVien = @maSinhVien AND (sl.TrangThai = N'Đang học' OR sl.TrangThai = N'Hoàn thành' OR sl.TrangThai = N'Đã hoàn thành') AND (l.TrangThai IS NULL OR l.TrangThai != N'Chưa bắt đầu')
        ORDER BY sl.NgayGhiDanh DESC
      `);

    const classesList = [];

    for (const cls of classesRes.recordset) {
      const classId = cls.MaLopHoc;

      // A. Lấy tất cả bài giảng của lớp này
      const lecturesRes = await pool.request()
        .input("classId", classId)
        .query(`
          SELECT bh.MaBaiHoc
          FROM BAIHOCKHOAHOC bh
          JOIN BUOIHOC b ON bh.MaBuoiHoc = b.MaBuoiHoc
          WHERE b.MaLopHoc = @classId AND bh.TrangThai = 'published'
        `);
      const lectureIds = lecturesRes.recordset.map(r => r.MaBaiHoc);

      // B. Lấy tất cả bài tập của lớp này
      const exercisesRes = await pool.request()
        .input("classId", classId)
        .query(`
          SELECT e.MaBaiTap
          FROM BAITAP e
          JOIN BAIHOCKHOAHOC bh ON e.MaBaiHoc = bh.MaBaiHoc
          JOIN BUOIHOC b ON bh.MaBuoiHoc = b.MaBuoiHoc
          WHERE b.MaLopHoc = @classId AND (e.TrangThai = 'published' OR e.TrangThai = N'Đã duyệt')
        `);
      const exerciseIds = exercisesRes.recordset.map(r => r.MaBaiTap);

      // C. Lấy tất cả bài kiểm tra của lớp này
      const testsRes = await pool.request()
        .input("classId", classId)
        .query(`
          SELECT k.MaBaiKiemTra
          FROM BAIKIEMTRA k
          JOIN BUOIHOC b ON k.MaBuoiHoc = b.MaBuoiHoc
          WHERE b.MaLopHoc = @classId AND (k.TrangThai = 'published' OR k.TrangThai = N'Đã duyệt' OR k.TrangThaiDuyet = N'Đã duyệt')
        `);
      const testIds = testsRes.recordset.map(r => r.MaBaiKiemTra);

      // D. Lấy tất cả bài luyện tập thêm của lớp này
      const practicesRes = await pool.request()
        .input("classId", classId)
        .query(`
          SELECT p.MaLuyenTapThem
          FROM LUYENTAPTHEM p
          JOIN BUOIHOC b ON p.MaBuoiHoc = b.MaBuoiHoc
          WHERE b.MaLopHoc = @classId
        `);
      const practiceIds = practicesRes.recordset.map(r => r.MaLuyenTapThem);

      // Tính số lượng bài giảng đã hoàn thành
      let completedLectures = 0;
      if (lectureIds.length > 0) {
        const completedLecturesRes = await pool.request()
          .input("maSinhVien", maNguoiDung)
          .input("maSinhVienCode", maSinhVien)
          .query(`
            SELECT tm.MaBaiHoc
            FROM TIENDO_MINITEST tm
            WHERE (tm.MaSinhVien = CAST(@maSinhVien AS NVARCHAR(50)) OR tm.MaSinhVien = @maSinhVienCode)
              AND tm.MaBaiHoc IN (${lectureIds.join(",")})
              AND tm.DaXemVideo = 1
              AND (
                NOT EXISTS (SELECT 1 FROM MINITEST WHERE MaBaiHoc = tm.MaBaiHoc)
                OR tm.DaDatMinitest = 1
              )
          `);
        completedLectures = completedLecturesRes.recordset.length;
      }

      // Tính số lượng bài tập đã nộp
      let completedExercises = 0;
      if (exerciseIds.length > 0) {
        const completedExercisesRes = await pool.request()
          .input("maSinhVien", maNguoiDung)
          .input("maSinhVienCode", maSinhVien)
          .query(`
            SELECT DISTINCT MaBaiTap FROM BAINOP
            WHERE (MaSinhVien = CAST(@maSinhVien AS NVARCHAR(50)) OR MaSinhVien = @maSinhVienCode)
              AND MaBaiTap IN (${exerciseIds.join(",")})
          `);
        completedExercises = completedExercisesRes.recordset.length;
      }

      // Tính số lượng bài kiểm tra đã hoàn thành
      let completedTests = 0;
      if (testIds.length > 0) {
        const completedTestsRes = await pool.request()
          .input("maSinhVien", maNguoiDung)
          .input("maSinhVienCode", maSinhVien)
          .query(`
            SELECT DISTINCT MaBaiKiemTra FROM KETQUABAIKIEMTRA
            WHERE (MaSinhVien = @maSinhVien OR CAST(MaSinhVien AS NVARCHAR(50)) = @maSinhVienCode)
              AND MaBaiKiemTra IN (${testIds.join(",")})
          `);
        completedTests = completedTestsRes.recordset.length;
      }

      // Tính số lượng bài luyện tập thêm đã làm
      let completedPractices = 0;
      if (practiceIds.length > 0) {
        const completedPracticesRes = await pool.request()
          .input("maSinhVien", maNguoiDung)
          .input("maSinhVienCode", maSinhVien)
          .query(`
            SELECT DISTINCT MaLuyenTapThem FROM BAINOPTHEM
            WHERE (MaSinhVien = CAST(@maSinhVien AS NVARCHAR(50)) OR MaSinhVien = @maSinhVienCode)
              AND MaLuyenTapThem IN (${practiceIds.join(",")})
          `);
        completedPractices = completedPracticesRes.recordset.length;
      }

      const totalItems = lectureIds.length + exerciseIds.length + testIds.length + practiceIds.length;
      const completedItems = completedLectures + completedExercises + completedTests + completedPractices;
      const TienDo = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

      classesList.push({
        MaLopHoc: cls.MaLopHoc,
        TenLop: cls.TenLop,
        LichHoc: cls.LichHoc,
        SoLuongHocVien: cls.SoLuongHocVien,
        TienDo: TienDo,
        TenKhoaHoc: cls.TenKhoaHoc,
        TrangThai: cls.TrangThai,
        NgayGhiDanh: cls.NgayGhiDanh
      });
    }

    res.json(classesList);
  } catch (err) {
    console.error("Lỗi lấy danh sách lớp học và tiến độ của sinh viên:", err.message);
    res.status(500).send(err.message);
  }
});

// Lấy danh sách ID các bài giảng đã hoàn thành của sinh viên
app.get("/student/completed-lectures/:maNguoiDung", async (req, res) => {
  try {
    const pool = await poolPromise;
    const maNguoiDung = req.params.maNguoiDung;

    // Lấy MaSinhVien
    const studentRes = await pool.request()
      .input("maNguoiDung", maNguoiDung)
      .query("SELECT MaSinhVien FROM SINHVIEN WHERE MaNguoiDung = @maNguoiDung");
    
    if (studentRes.recordset.length === 0) {
      return res.json([]);
    }
    const maSinhVien = studentRes.recordset[0].MaSinhVien;
    const maSinhVienCode = "SV" + String(maSinhVien).padStart(8, '0');

    // Query các bài học đã hoàn thành
    const completedLecturesRes = await pool.request()
      .input("maSinhVien", maNguoiDung)
      .input("maSinhVienCode", maSinhVien)
      .query(`
        SELECT tm.MaBaiHoc
        FROM TIENDO_MINITEST tm
        WHERE (tm.MaSinhVien = CAST(@maSinhVien AS NVARCHAR(50)) OR tm.MaSinhVien = @maSinhVienCode)
          AND tm.DaXemVideo = 1
          AND (
            NOT EXISTS (SELECT 1 FROM MINITEST WHERE MaBaiHoc = tm.MaBaiHoc)
            OR tm.DaDatMinitest = 1
          )
      `);

    const completedIds = completedLecturesRes.recordset.map(r => r.MaBaiHoc);
    res.json(completedIds);
  } catch (err) {
    console.error("Lỗi lấy danh sách bài học đã hoàn thành:", err.message);
    res.status(500).send(err.message);
  }
});

// Lấy danh sách lớp học thử (trial classes)
app.get("/student/trial-classes", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT DISTINCT lh.MaLopHoc, lh.TenLop, kh.TenKhoaHoc 
      FROM LOPHOC lh
      JOIN KHOAHOCCHITIET khct ON lh.MaLop = khct.MaLop
      JOIN KHOAHOC kh ON khct.MaKhoaHoc = kh.MaKhoaHoc
      WHERE (
        -- Có bài giảng học thử miễn phí
        EXISTS (
          SELECT 1 
          FROM BUOIHOC b
          JOIN BAIHOCKHOAHOC bh ON b.MaBuoiHoc = bh.MaBuoiHoc
          WHERE b.MaLopHoc = lh.MaLopHoc 
            AND bh.IsFree = 1
            AND bh.TrangThai = 'published'
        )
        -- Hoặc có bài tập học thử miễn phí
        OR EXISTS (
          SELECT 1 
          FROM BUOIHOC b
          JOIN BAIHOCKHOAHOC bh ON b.MaBuoiHoc = bh.MaBuoiHoc
          JOIN BAITAP bt ON bh.MaBaiHoc = bt.MaBaiHoc
          WHERE b.MaLopHoc = lh.MaLopHoc 
            AND bt.HocThuMienPhi = 1
            AND bt.TrangThai = 'published'
        )
      )
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error("Lỗi lấy danh sách lớp học thử:", err.message);
    res.status(500).send(err.message);
  }
})


// Bài tập của lớp
app.get("/classes/:id/baitap", async (req, res) => {
  try {
    const pool = await poolPromise
    const result = await pool.request()
      .input("id", req.params.id)
      .query(`
        SELECT e.MaBaiTap, e.TieuDe AS Title, e.DangBai AS Type, 
               CAST(e.LaBaiKiemTra AS INT) AS IsExam,
               bh.MaBuoiHoc, l.ThuTu AS ThuTuBuoiHoc, e.TrangThai, e.NoiDung AS Content, e.HanNop
        FROM BAITAP e
        JOIN BAIHOCKHOAHOC bh ON e.MaBaiHoc = bh.MaBaiHoc
        JOIN BUOIHOC l ON bh.MaBuoiHoc = l.MaBuoiHoc
        WHERE l.MaLopHoc = @id AND (e.TrangThai = 'published' OR e.TrangThai = 'Đã duyệt' OR e.TrangThai IS NULL)

        UNION ALL

        SELECT k.MaBaiKiemTra AS MaBaiTap, k.TenBai AS Title, 'exam' AS Type, 
               1 AS IsExam,
               k.MaBuoiHoc, l.ThuTu AS ThuTuBuoiHoc, k.TrangThai, k.NoiDung AS Content, NULL AS HanNop
        FROM BAIKIEMTRA k
        JOIN BUOIHOC l ON k.MaBuoiHoc = l.MaBuoiHoc
        WHERE l.MaLopHoc = @id AND (k.TrangThai = 'published' OR k.TrangThai = 'Đã duyệt' OR k.TrangThaiDuyet = 'Đã duyệt' OR k.TrangThai IS NULL)
        ORDER BY ThuTuBuoiHoc
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
             ISNULL(e.TieuDe, p.Title) AS TenBaiTap, 
             ISNULL(bg.MaBuoiHoc, p.MaBuoiHoc) AS MaBuoiHoc,
             CAST(0 AS INT) AS IsExam, b.SoLanLamBai, b.DaXemGiaiThich, b.MaSinhVien
      FROM BAINOP b
      JOIN SINHVIEN s ON b.MaSinhVien = s.MaSinhVien OR b.MaSinhVien = CAST(s.MaNguoiDung AS NVARCHAR(50))
      LEFT JOIN BAITAP e ON b.MaBaiTap = e.MaBaiTap
      LEFT JOIN BAIHOCKHOAHOC bg ON e.MaBaiHoc = bg.MaBaiHoc
      LEFT JOIN LUYENTAPTHEM p ON b.MaBaiTap = p.MaLuyenTapThem
      WHERE s.MaNguoiDung = @id
      ${buoiHocId ? " AND (bg.MaBuoiHoc = @buoiHocId OR p.MaBuoiHoc = @buoiHocId)" : ""}

      UNION ALL

      SELECT k.MaKetQua AS MaBaiNop, k.MaBaiKiemTra AS MaBaiTap, k.Diem, k.ThoiGianLamBai AS NgayNop, N'Đã chấm' AS TrangThai,
             kt.TenBai AS TenBaiTap, kt.MaBuoiHoc AS MaBuoiHoc,
             CAST(1 AS INT) AS IsExam, k.SoLanLamBai, CAST(0 AS INT) AS DaXemGiaiThich, CAST(k.MaSinhVien AS NVARCHAR(50)) AS MaSinhVien
      FROM KETQUABAIKIEMTRA k
      JOIN SINHVIEN s ON k.MaSinhVien = s.MaNguoiDung OR CAST(k.MaSinhVien AS NVARCHAR(50)) = s.MaSinhVien
      JOIN BAIKIEMTRA kt ON k.MaBaiKiemTra = kt.MaBaiKiemTra
      WHERE s.MaNguoiDung = @id
      ${buoiHocId ? " AND kt.MaBuoiHoc = @buoiHocId" : ""}
    `
    
    const request = pool.request().input("id", req.params.maNguoiDung)
    if (buoiHocId) request.input("buoiHocId", buoiHocId)
    
    const result = await request.query(query)
    res.json(result.recordset);
  } catch (err) { res.status(500).send(err.message) }
})

// Lấy tiến độ chi tiết các lớp của học viên
app.get("/student/progress/classes/:maNguoiDung", async (req, res) => {
  try {
    const pool = await poolPromise;
    const maNguoiDung = parseInt(req.params.maNguoiDung);

    // 1. Lấy thông tin học viên
    const studentRes = await pool.request()
      .input("maNguoiDung", maNguoiDung)
      .query(`SELECT MaSinhVien, MaNguoiDung FROM SINHVIEN WHERE MaNguoiDung = @maNguoiDung`);
    
    if (studentRes.recordset.length === 0) {
      return res.json([]);
    }
    const student = studentRes.recordset[0];
    const maSinhVien = student.MaSinhVien;

    // 2. Lấy danh sách các lớp học đang tham gia của sinh viên
    const classesRes = await pool.request()
      .input("maSinhVien", maSinhVien)
      .query(`
        SELECT lh.MaLopHoc AS id, lh.TenLop AS className, kh.TenKhoaHoc AS courseName, 
               lh.LichHoc AS schedule,
               (SELECT COUNT(*) FROM SINHVIEN_LOPHOC sl2 WHERE sl2.MaLopHoc = lh.MaLopHoc) AS totalStudents,
               nd.HoTen AS teacherName
        FROM SINHVIEN_LOPHOC sl
        JOIN LOPHOC lh ON sl.MaLopHoc = lh.MaLopHoc
        JOIN KHOAHOCCHITIET khct ON lh.MaLop = khct.MaLop
        JOIN KHOAHOC kh ON khct.MaKhoaHoc = kh.MaKhoaHoc
        LEFT JOIN PHANCONGGIANGVIEN pc ON lh.MaLopHoc = pc.MaLopHoc
        LEFT JOIN GIANGVIEN gv ON pc.MaGiangVien = gv.MaGiangVien
        LEFT JOIN NGUOIDUNG nd ON gv.MaNguoiDung = nd.MaNguoiDung
        WHERE sl.MaSinhVien = @maSinhVien AND (sl.TrangThai = N'Đang học' OR sl.TrangThai = N'Hoàn thành' OR sl.TrangThai = N'Đã hoàn thành') AND (lh.TrangThai IS NULL OR lh.TrangThai != N'Chưa bắt đầu')
      `);

    const classesMap = {};
    for (const row of classesRes.recordset) {
      if (!classesMap[row.id]) {
        classesMap[row.id] = {
          id: row.id,
          className: row.className,
          courseName: row.courseName,
          schedule: row.schedule || "Chưa xếp lịch",
          totalStudents: row.totalStudents || 0,
          teachersList: [],
          sessions: []
        };
      }
      if (row.teacherName && !classesMap[row.id].teachersList.includes(row.teacherName)) {
        classesMap[row.id].teachersList.push(row.teacherName);
      }
    }

    const classesList = Object.values(classesMap);

    for (const cls of classesList) {
      cls.teacherName = cls.teachersList.join(", ") || "Chưa phân công";
      delete cls.teachersList;

      // Lấy danh sách buổi học
      const sessionsRes = await pool.request()
        .input("maLopHoc", cls.id)
        .query(`
          SELECT MaBuoiHoc, TenBuoiHoc, ThuTu, NgayBatDau AS NgayHoc
          FROM BUOIHOC
          WHERE MaLopHoc = @maLopHoc
          ORDER BY ThuTu
        `);

      const sessionsList = [];

      for (const sess of sessionsRes.recordset) {
        // A. Lấy bài giảng thuộc buổi học
        const lecturesRes = await pool.request()
          .input("maBuoiHoc", sess.MaBuoiHoc)
          .query(`
            SELECT MaBaiHoc, TieuDe, LoaiBaiHoc, ThoiLuong
            FROM BAIHOCKHOAHOC
            WHERE MaBuoiHoc = @maBuoiHoc AND TrangThai = 'published'
            ORDER BY ThuTu
          `);

        let sessionLecture = null;

        if (lecturesRes.recordset.length > 0) {
          const lec = lecturesRes.recordset[0];

          // Lấy tiến độ học bài giảng
          const progRes = await pool.request()
            .input("maBaiHoc", lec.MaBaiHoc)
            .input("maSinhVien", maNguoiDung)
            .input("maSinhVienCode", maSinhVien)
            .query(`
              SELECT DaXemVideo, DaDatMinitest
              FROM TIENDO_MINITEST
              WHERE MaBaiHoc = @maBaiHoc 
                AND (MaSinhVien = CAST(@maSinhVien AS NVARCHAR(50)) OR MaSinhVien = @maSinhVienCode)
            `);

          const progressRecord = progRes.recordset[0] || { DaXemVideo: 0, DaDatMinitest: 0 };

          // Lấy danh sách bài tập của bài giảng này
          const exercisesRes = await pool.request()
            .input("maBaiHoc", lec.MaBaiHoc)
            .query(`
              SELECT MaBaiTap, TieuDe, DangBai
              FROM BAITAP
              WHERE MaBaiHoc = @maBaiHoc AND (TrangThai = 'published' OR TrangThai = N'Đã duyệt')
            `);

          const exercisesList = [];
          for (const ex of exercisesRes.recordset) {
            // Kiểm tra kết quả làm bài tập trong BAINOP
            const subRes = await pool.request()
              .input("maBaiTap", ex.MaBaiTap)
              .input("maSinhVien", maNguoiDung)
              .input("maSinhVienCode", maSinhVien)
              .query(`
                SELECT Diem, TrangThai FROM BAINOP 
                WHERE MaBaiTap = @maBaiTap 
                  AND (MaSinhVien = CAST(@maSinhVien AS NVARCHAR(50)) OR MaSinhVien = @maSinhVienCode)
              `);

            const submission = subRes.recordset[0];
            exercisesList.push({
              id: ex.MaBaiTap,
              name: ex.TieuDe,
              completed: !!submission,
              score: submission && submission.Diem !== null ? `${submission.Diem}/10` : undefined
            });
          }

          // Kiểm tra xem bài giảng này có minitest đính kèm hay không
          const hasMinitestRes = await pool.request()
            .input("maBaiHoc", lec.MaBaiHoc)
            .query("SELECT 1 FROM MINITEST WHERE MaBaiHoc = @maBaiHoc");
          const hasMinitest = hasMinitestRes.recordset.length > 0;

          // Hỗ trợ cả kiểu dữ liệu bit (boolean) và int (1/0) trả về từ SQL Server driver
          const isVideoWatched = progressRecord.DaXemVideo === 1 || progressRecord.DaXemVideo === true || progressRecord.DaXemVideo === 'true';
          const isMinitestPassed = progressRecord.DaDatMinitest === 1 || progressRecord.DaDatMinitest === true || progressRecord.DaDatMinitest === 'true';

          // Quy tắc hoàn thành bài giảng:
          // - Nếu bài giảng có Minitest: cần Xem Video và Đạt Minitest.
          // - Nếu bài giảng không có Minitest: chỉ cần Xem Video.
          const isLectureCompleted = hasMinitest ? (isVideoWatched && isMinitestPassed) : isVideoWatched;

          sessionLecture = {
            id: lec.MaBaiHoc,
            name: lec.TieuDe,
            videoWatched: isVideoWatched,
            completed: isLectureCompleted,
            exercises: exercisesList
          };
        }

        // B. Lấy bài kiểm tra thuộc buổi học
        const testsRes = await pool.request()
          .input("maBuoiHoc", sess.MaBuoiHoc)
          .query(`
            SELECT MaBaiKiemTra, TenBai, TongDiem
            FROM BAIKIEMTRA
            WHERE MaBuoiHoc = @maBuoiHoc AND (TrangThai = 'published' OR TrangThai = N'Đã duyệt' OR TrangThaiDuyet = N'Đã duyệt')
          `);

        let sessionTest = null;
        if (testsRes.recordset.length > 0) {
          const test = testsRes.recordset[0];

          // Kiểm tra kết quả trong KETQUABAIKIEMTRA
          const kqbktRes = await pool.request()
            .input("maBaiKiemTra", test.MaBaiKiemTra)
            .input("maSinhVien", maNguoiDung)
            .input("maSinhVienCode", maSinhVien)
            .query(`
              SELECT Diem FROM KETQUABAIKIEMTRA
              WHERE MaBaiKiemTra = @maBaiKiemTra 
                AND (MaSinhVien = @maSinhVien OR CAST(MaSinhVien AS NVARCHAR(50)) = @maSinhVienCode)
            `);

          const resultRecord = kqbktRes.recordset[0];
          sessionTest = {
            id: test.MaBaiKiemTra,
            name: test.TenBai,
            completed: !!resultRecord,
            score: resultRecord ? `${resultRecord.Diem}/${test.TongDiem || 10}` : undefined
          };
        }

        // B2. Lấy bài luyện tập thêm (LUYENTAPTHEM) thuộc buổi học
        const practicesRes = await pool.request()
          .input("maBuoiHoc", sess.MaBuoiHoc)
          .query(`
            SELECT MaLuyenTapThem, Title
            FROM LUYENTAPTHEM
            WHERE MaBuoiHoc = @maBuoiHoc
          `);

        let sessionPractice = null;
        if (practicesRes.recordset.length > 0) {
          const prac = practicesRes.recordset[0];

          // Kiểm tra kết quả trong BAINOPTHEM
          const bntRes = await pool.request()
            .input("maLuyenTapThem", prac.MaLuyenTapThem)
            .input("maSinhVien", maNguoiDung)
            .input("maSinhVienCode", maSinhVien)
            .query(`
              SELECT Diem FROM BAINOPTHEM
              WHERE MaLuyenTapThem = @maLuyenTapThem 
                AND (MaSinhVien = CAST(@maSinhVien AS NVARCHAR(50)) OR MaSinhVien = @maSinhVienCode)
            `);

          const resultRecord = bntRes.recordset[0];
          sessionPractice = {
            id: prac.MaLuyenTapThem,
            name: prac.Title,
            completed: !!resultRecord,
            score: resultRecord ? `${resultRecord.Diem}/10` : undefined
          };
        }

        // C. Lấy tài liệu ôn tập của buổi học
        const docsRes = await pool.request()
          .input("maBuoiHoc", sess.MaBuoiHoc)
          .query(`
            SELECT MaTaiLieu, TieuDe
            FROM TAILIEU
            WHERE MaBuoiHoc = @maBuoiHoc
          `);

        let sessionDoc = null;
        if (docsRes.recordset.length > 0) {
          const doc = docsRes.recordset[0];
          sessionDoc = {
            id: doc.MaTaiLieu,
            name: doc.TieuDe,
            completed: false // Được quản lý đồng bộ với localStorage ở frontend
          };
        }

        sessionsList.push({
          id: sess.MaBuoiHoc,
          title: `Buổi ${sess.ThuTu || sessionsList.length + 1}: ${sess.TenBuoiHoc}`,
          date: sess.NgayHoc ? new Date(sess.NgayHoc).toLocaleDateString("vi-VN") : "Chưa xếp lịch",
          lecture: sessionLecture || { id: 0, name: "Chưa có bài giảng", videoWatched: false, completed: false, exercises: [] },
          test: sessionTest || { id: 0, name: "Chưa có bài kiểm tra", completed: false },
          practice: sessionPractice || { id: 0, name: "Chưa có bài luyện tập thêm", completed: false },
          document: sessionDoc || { id: 0, name: "Chưa có tài liệu", completed: false }
        });
      }

      cls.sessions = sessionsList;
    }

    res.json(classesList);
  } catch (err) {
    console.error("Lỗi khi lấy tiến độ lớp học sinh viên:", err);
    res.status(500).send(err.message);
  }
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
        WHERE MaLopHoc = @classId;

        IF @activeBuoiHocId IS NOT NULL
        BEGIN
            DECLARE @activeThuTu INT;
            SELECT @activeThuTu = ThuTu FROM BUOIHOC WHERE MaBuoiHoc = @activeBuoiHocId;

            -- Buổi học đang được chọn sẽ ở trạng thái 'Đang học'
            UPDATE BUOIHOC
            SET TrangThai = N'Đang học'
            WHERE MaBuoiHoc = @activeBuoiHocId;

            -- Các buổi trước đó (tự động chuyển thành 'Đã hoàn thành')
            UPDATE BUOIHOC
            SET TrangThai = N'Đã hoàn thành'
            WHERE MaLopHoc = @classId AND ThuTu < @activeThuTu;

            -- Các buổi sau đó sẽ là 'Chưa mở'
            UPDATE BUOIHOC
            SET TrangThai = N'Chưa mở'
            WHERE MaLopHoc = @classId AND ThuTu > @activeThuTu;
        END
        ELSE
        BEGIN
            UPDATE BUOIHOC
            SET TrangThai = N'Chưa mở'
            WHERE MaLopHoc = @classId;
        END
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
      WITH AllExercises AS (
        SELECT DISTINCT e.MaBaiTap, e.TieuDe AS Title, e.DangBai AS Type, 
                        CAST(e.LaBaiKiemTra AS INT) AS IsExam,
                        e.NgayTao AS CreatedDate, l.TenLop, ls.TenBuoiHoc, ls.MaBuoiHoc, l.MaLopHoc, l.MaLopHoc AS FilterMaLopHoc
        FROM BAITAP e
        JOIN BAIHOCKHOAHOC bh ON e.MaBaiHoc = bh.MaBaiHoc
        JOIN BUOIHOC ls ON bh.MaBuoiHoc = ls.MaBuoiHoc
        JOIN LOPHOC l ON ls.MaLopHoc = l.MaLopHoc

        UNION ALL

        SELECT DISTINCT k.MaBaiKiemTra AS MaBaiTap, k.TenBai AS Title, 'exam' AS Type, 
                        1 AS IsExam,
                        k.NgayTao AS CreatedDate, l.TenLop, ls.TenBuoiHoc, ls.MaBuoiHoc, l.MaLopHoc, l.MaLopHoc AS FilterMaLopHoc
        FROM BAIKIEMTRA k
        JOIN BUOIHOC ls ON k.MaBuoiHoc = ls.MaBuoiHoc
        JOIN LOPHOC l ON ls.MaLopHoc = l.MaLopHoc

        UNION ALL

        SELECT DISTINCT lt.MaLuyenTapThem AS MaBaiTap, lt.Title AS Title, 'luyen-tap-them' AS Type, 
                        0 AS IsExam,
                        lt.CreatedDate, l.TenLop, ls.TenBuoiHoc, ls.MaBuoiHoc, l.MaLopHoc, l.MaLopHoc AS FilterMaLopHoc
        FROM LUYENTAPTHEM lt
        JOIN BUOIHOC ls ON lt.MaBuoiHoc = ls.MaBuoiHoc
        JOIN LOPHOC l ON ls.MaLopHoc = l.MaLopHoc
      )
      SELECT DISTINCT MaBaiTap, Title, Type, IsExam, CreatedDate, TenLop, TenBuoiHoc, MaBuoiHoc, MaLopHoc 
      FROM AllExercises
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
          JOIN PHANCONGGIANGVIEN pc ON FilterMaLopHoc = pc.MaLopHoc
          JOIN GIANGVIEN gv ON pc.MaGiangVien = gv.MaGiangVien
          WHERE gv.MaNguoiDung = @maNguoiDung
        `;
      }
    }
    
    const request = pool.request();
    if (maNguoiDung) request.input("maNguoiDung", maNguoiDung);
    
    const result = await request.query(query + " ORDER BY MaBaiTap DESC");
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
      SELECT DISTINCT t.MaTaiLieu, t.TieuDe, t.MoTa, t.NgayCapNhat, l.TenLop, ls.TenBuoiHoc, ls.MaBuoiHoc, l.MaLopHoc
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
      SELECT DISTINCT b.MaBaiHoc, b.TieuDe, b.LoaiBaiHoc, b.ThoiLuong, l.TenLop, ls.TenBuoiHoc, ls.MaBuoiHoc, l.MaLopHoc
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
    const { MaBuoiHoc, MaBaiHoc, MaNguoiDung } = req.body;
    if (!MaBuoiHoc) return res.status(400).json({ message: "Thiếu MaBuoiHoc" });
    const pool = await poolPromise;
    if (await isClassCompletedByBuoiHoc(pool, MaBuoiHoc)) {
      return res.status(400).json({ message: "Lớp học đã hoàn thành, không thể thêm bài tập!" });
    }
    if (await isBuoiHocCompleted(pool, MaBuoiHoc)) {
      return res.status(400).json({ message: "Buổi học đã hoàn thành, không thể thêm bài tập!" });
    }
    
    const orig = await pool.request()
      .input("id", req.params.id)
      .query("SELECT * FROM BAITAP WHERE MaBaiTap = @id");
    
    if (orig.recordset.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy bài tập gốc" });
    }
    
    const ex = orig.recordset[0];
    const today = new Date().toISOString().split('T')[0];

    // Determine the cloner user
    const clonerMaNguoiDung = MaNguoiDung || ex.MaNguoiDung || null;
    let isQTV = true;
    if (clonerMaNguoiDung) {
      const gvResult = await pool.request()
        .input("maNguoiDung", clonerMaNguoiDung)
        .query("SELECT MaGiangVien FROM GIANGVIEN WHERE MaNguoiDung = @maNguoiDung");
      if (gvResult.recordset.length > 0) {
        isQTV = false;
      }
    }

    let targetMaBaiHoc = MaBaiHoc ? parseInt(MaBaiHoc) : null;
    if (!targetMaBaiHoc) {
      const bhResult = await pool.request()
        .input("buoiHocId", MaBuoiHoc)
        .query("SELECT TOP 1 MaBaiHoc FROM BAIHOCKHOAHOC WHERE MaBuoiHoc = @buoiHocId ORDER BY ThuTu ASC");
      if (bhResult.recordset.length > 0) {
        targetMaBaiHoc = bhResult.recordset[0].MaBaiHoc;
      } else {
        const insertBh = await pool.request()
          .input("buoiHocId", MaBuoiHoc)
          .input("MaNguoiDung", clonerMaNguoiDung)
          .query(`
            INSERT INTO BAIHOCKHOAHOC (MaKhoaHoc, TieuDe, NoiDung, TrangThai, MaBuoiHoc, MaNguoiDung)
            VALUES (1, N'Bài giảng mặc định', '', 'published', @buoiHocId, @MaNguoiDung);
            SELECT SCOPE_IDENTITY() AS MaBaiHoc;
          `);
        targetMaBaiHoc = insertBh.recordset[0].MaBaiHoc;
      }
    }

    const finalTrangThai = isQTV ? "published" : (ex.TrangThai || "draft");
    const finalTrangThaiDuyet = 
      finalTrangThai === "published" ? 'Đã duyệt' : 
      (finalTrangThai === "rejected" ? 'Từ chối' : 
      (finalTrangThai === "draft" ? 'Nháp' : 'Chờ duyệt'));
    
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
      .input("TrangThai", finalTrangThai)
      .input("TrangThaiDuyet", finalTrangThaiDuyet)
      .input("KyNang", ex.KyNang || "")
      .input("FileDinhKem", ex.FileDinhKem || null)
      .input("MaNguoiDung", clonerMaNguoiDung)
      .input("HanNop", normalizeDeadline(ex.HanNop))
      .query(`
        INSERT INTO BAITAP 
          (TieuDe, DangBai, NoiDung, CauHoi, NgayTao, MaBaiHoc, LinkAmThanh, HienThiDapAn, HocThuMienPhi, LaBaiKiemTra, TrangThai, TrangThaiDuyet, KyNang, FileDinhKem, MaNguoiDung, HanNop)
        VALUES 
          (@TieuDe, @DangBai, @NoiDung, @CauHoi, @CreatedDate, @MaBaiHoc, @LinkAmThanh, @HienThiDapAn, @HocThuMienPhi, @LaBaiKiemTra, @TrangThai, @TrangThaiDuyet, @KyNang, @FileDinhKem, @MaNguoiDung, @HanNop)
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
    if (await isClassCompletedByBuoiHoc(pool, MaBuoiHoc)) {
      return res.status(400).json({ message: "Lớp học đã hoàn thành, không thể thêm tài liệu!" });
    }
    if (await isBuoiHocCompleted(pool, MaBuoiHoc)) {
      return res.status(400).json({ message: "Buổi học đã hoàn thành, không thể thêm tài liệu!" });
    }
    
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
    if (await isClassCompletedByBuoiHoc(pool, MaBuoiHoc)) {
      return res.status(400).json({ message: "Lớp học đã hoàn thành, không thể thêm bài giảng!" });
    }
    if (await isBuoiHocCompleted(pool, MaBuoiHoc)) {
      return res.status(400).json({ message: "Buổi học đã hoàn thành, không thể thêm bài giảng!" });
    }
    
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
      .input("MaNguoiDung", bg.MaNguoiDung)
      .input("MaBuoiHoc", MaBuoiHoc)
      .query(`
        INSERT INTO BAIHOCKHOAHOC (TieuDe, NoiDung, FileUrl, LoaiBaiHoc, ThoiLuong, TrangThai, ThuTu, MaKhoaHoc, MaNguoiDung, MaBuoiHoc)
        VALUES (@TieuDe, @NoiDung, @FileUrl, @LoaiBaiHoc, @ThoiLuong, @TrangThai, @ThuTu, @MaKhoaHoc, @MaNguoiDung, @MaBuoiHoc)
      `);
      
    res.json({ message: "Sao chép bài giảng thành công" });
  } catch (err) {
    res.status(500).send(err.message);
  }
});



// ===== MINITEST & STUDENT PROGRESS ROUTES =====

// 1. Tạo hoặc Cập nhật Minitest của Bài giảng
app.post("/minitest/create", async (req, res) => {
  try {
    const { MaBaiHoc, CauHoi, DiemDat, TrangThai } = req.body;
    if (!MaBaiHoc) return res.status(400).json({ message: "Thiếu MaBaiHoc" });

    const pool = await poolPromise;
    // Kiểm tra đã có minitest cho bài giảng này chưa
    const check = await pool.request()
      .input("MaBaiHoc", MaBaiHoc)
      .query(`SELECT MaMinitest FROM MINITEST WHERE MaBaiHoc = @MaBaiHoc`);

    if (check.recordset.length > 0) {
      // Cập nhật
      await pool.request()
        .input("MaBaiHoc", MaBaiHoc)
        .input("CauHoi", CauHoi || "")
        .input("DiemDat", DiemDat ?? 100)
        .input("TrangThai", TrangThai || "published")
        .query(`UPDATE MINITEST SET CauHoi = @CauHoi, DiemDat = @DiemDat, TrangThai = @TrangThai WHERE MaBaiHoc = @MaBaiHoc`);
      res.json({ message: "Cập nhật Minitest thành công" });
    } else {
      // Tạo mới
      await pool.request()
        .input("MaBaiHoc", MaBaiHoc)
        .input("CauHoi", CauHoi || "")
        .input("DiemDat", DiemDat ?? 100)
        .input("TrangThai", TrangThai || "published")
        .query(`INSERT INTO MINITEST (MaBaiHoc, CauHoi, DiemDat, TrangThai) VALUES (@MaBaiHoc, @CauHoi, @DiemDat, @TrangThai)`);
      res.json({ message: "Tạo Minitest thành công" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Lỗi server");
  }
});

// 2. Lấy đề bài Minitest của Bài giảng
app.get("/minitest/baigiang/:maBaiHoc", async (req, res) => {
  try {
    const { role } = req.query;
    const pool = await poolPromise;
    const result = await pool.request()
      .input("MaBaiHoc", parseInt(req.params.maBaiHoc))
      .query(`SELECT MaMinitest, MaBaiHoc, CauHoi, DiemDat, TrangThai FROM MINITEST WHERE MaBaiHoc = @MaBaiHoc`);
    const minitest = result.recordset[0] || null;
    if (minitest && role === "student" && minitest.TrangThai === "draft") {
      return res.json(null);
    }
    res.json(minitest);
  } catch (err) {
    console.error(err);
    res.status(500).send("Lỗi server");
  }
});

// 2b. Xóa Minitest của Bài giảng
app.delete("/minitest/baigiang/:maBaiHoc", async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input("MaBaiHoc", parseInt(req.params.maBaiHoc))
      .query("DELETE FROM MINITEST WHERE MaBaiHoc = @MaBaiHoc");
    res.json({ message: "Xóa Minitest thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Lỗi server");
  }
});

// 3. Lấy tiến độ học tập (Video & Minitest) của sinh viên
app.get("/student/progress/minitest/:maBaiHoc/:maSinhVien", async (req, res) => {
  try {
    const pool = await poolPromise;
    const parsedSV = parseStudentId(req.params.maSinhVien);
    const result = await pool.request()
      .input("MaBaiHoc", parseInt(req.params.maBaiHoc))
      .input("MaSinhVien", parsedSV)
      .query(`SELECT DaXemVideo, DaDatMinitest FROM TIENDO_MINITEST WHERE MaBaiHoc = @MaBaiHoc AND MaSinhVien = @MaSinhVien`);

    if (result.recordset.length > 0) {
      const record = result.recordset[0];
      res.json({
        DaXemVideo: record.DaXemVideo ? 1 : 0,
        DaDatMinitest: record.DaDatMinitest ? 1 : 0
      });
    } else {
      // Trả về tiến độ mặc định (chưa bắt đầu)
      res.json({ DaXemVideo: 0, DaDatMinitest: 0 });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Lỗi server");
  }
});

// 4. Đánh dấu xem hết video bài giảng
app.post("/student/progress/video/complete", async (req, res) => {
  try {
    const { MaBaiHoc, MaSinhVien } = req.body;
    if (!MaBaiHoc || !MaSinhVien) return res.status(400).json({ message: "Thiếu thông tin" });

    const pool = await poolPromise;
    const parsedSV = parseStudentId(MaSinhVien);

    const check = await pool.request()
      .input("MaBaiHoc", MaBaiHoc)
      .input("MaSinhVien", parsedSV)
      .query(`SELECT MaTienDo FROM TIENDO_MINITEST WHERE MaBaiHoc = @MaBaiHoc AND MaSinhVien = @MaSinhVien`);

    if (check.recordset.length > 0) {
      await pool.request()
        .input("MaBaiHoc", MaBaiHoc)
        .input("MaSinhVien", parsedSV)
        .query(`UPDATE TIENDO_MINITEST SET DaXemVideo = 1, NgayCapNhat = GETDATE() WHERE MaBaiHoc = @MaBaiHoc AND MaSinhVien = @MaSinhVien`);
    } else {
      await pool.request()
        .input("MaBaiHoc", MaBaiHoc)
        .input("MaSinhVien", parsedSV)
        .query(`INSERT INTO TIENDO_MINITEST (MaBaiHoc, MaSinhVien, DaXemVideo, DaDatMinitest, NgayCapNhat) VALUES (@MaBaiHoc, @MaSinhVien, 1, 0, GETDATE())`);
    }
    res.json({ message: "Đã ghi nhận hoàn thành xem video" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Lỗi server");
  }
});

// 5. Nộp kết quả làm Minitest
app.post("/student/progress/minitest/submit", async (req, res) => {
  try {
    const { MaBaiHoc, MaSinhVien, Passed } = req.body;
    if (!MaBaiHoc || !MaSinhVien) return res.status(400).json({ message: "Thiếu thông tin" });

    const pool = await poolPromise;
    const parsedSV = parseStudentId(MaSinhVien);

    const check = await pool.request()
      .input("MaBaiHoc", MaBaiHoc)
      .input("MaSinhVien", parsedSV)
      .query(`SELECT MaTienDo FROM TIENDO_MINITEST WHERE MaBaiHoc = @MaBaiHoc AND MaSinhVien = @MaSinhVien`);

    const finalDaXemVideo = Passed ? 1 : 0;
    const finalDaDatMinitest = Passed ? 1 : 0;

    if (check.recordset.length > 0) {
      await pool.request()
        .input("MaBaiHoc", MaBaiHoc)
        .input("MaSinhVien", parsedSV)
        .input("DaXemVideo", finalDaXemVideo)
        .input("DaDatMinitest", finalDaDatMinitest)
        .query(`UPDATE TIENDO_MINITEST SET DaXemVideo = @DaXemVideo, DaDatMinitest = @DaDatMinitest, NgayCapNhat = GETDATE() WHERE MaBaiHoc = @MaBaiHoc AND MaSinhVien = @MaSinhVien`);
    } else {
      await pool.request()
        .input("MaBaiHoc", MaBaiHoc)
        .input("MaSinhVien", parsedSV)
        .input("DaXemVideo", finalDaXemVideo)
        .input("DaDatMinitest", finalDaDatMinitest)
        .query(`INSERT INTO TIENDO_MINITEST (MaBaiHoc, MaSinhVien, DaXemVideo, DaDatMinitest, NgayCapNhat) VALUES (@MaBaiHoc, @MaSinhVien, @DaXemVideo, @DaDatMinitest, GETDATE())`);
    }
    res.json({ message: "Đã nộp kết quả Minitest", Passed: !!Passed });
  } catch (err) {
    console.error(err);
  }
});

// =========================================================================
// HỆ THỐNG APIS QUẢN LÝ ĐỀ THI THỬ (DETHI) & KIỂM DUYỆT THEO VAI TRÒ
// =========================================================================

// 1. Lấy danh sách toàn bộ đề thi thử
app.get("/dethi", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT d.MaDeThi, d.TieuDe, d.MoTa, d.ThoiGian, d.CapDo, d.LoaiBai, d.NoiDungDeThi, d.TrangThai, d.TrangThaiDuyet, d.NgayTao, d.MaNguoiDung,
             n.HoTen AS TenNguoiTao
      FROM DETHI d
      JOIN NGUOIDUNG n ON d.MaNguoiDung = n.MaNguoiDung
      ORDER BY d.NgayTao DESC
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error("Lỗi lấy danh sách đề thi:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// ── ĐỀ THI SUBMISSIONS & GRADING ENDPOINTS ──
// ==========================================

// 1. Sinh viên nộp bài thi
app.post("/dethi/submit", async (req, res) => {
  try {
    const {
      MaDeThi,
      MaNguoiDung,
      diemNghe,
      diemDoc,
      baiLamViet,
      baiLamNoi,
      yeuCauChamViet,
      yeuCauChamNoi
    } = req.body;

    const pool = await poolPromise;

    // Lấy MaSinhVien từ MaNguoiDung
    const svResult = await pool.request()
      .input("MaNguoiDung", MaNguoiDung)
      .query("SELECT MaSinhVien FROM SINHVIEN WHERE MaNguoiDung = @MaNguoiDung");

    if (svResult.recordset.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy thông tin sinh viên tương ứng." });
    }

    const MaSinhVien = svResult.recordset[0].MaSinhVien;

    // Convert arrays/objects to JSON strings for database
    const baiLamWritingStr = JSON.stringify(baiLamViet || []);
    const baiLamSpeakingStr = JSON.stringify(baiLamNoi || []);

    // Insert submission
    await pool.request()
      .input("MaDeThi", MaDeThi)
      .input("MaSinhVien", MaSinhVien)
      .input("DiemListening", diemNghe)
      .input("DiemReading", diemDoc)
      .input("BaiLamWriting", baiLamWritingStr)
      .input("BaiLamSpeaking", baiLamSpeakingStr)
      .input("YeuCauChamWriting", yeuCauChamViet ? 1 : 0)
      .input("YeuCauChamSpeaking", yeuCauChamNoi ? 1 : 0)
      .query(`
        INSERT INTO DETHI_SUBMISSIONS (
          MaDeThi, MaSinhVien, NgayNop, DiemListening, DiemReading, 
          BaiLamWriting, BaiLamSpeaking, YeuCauChamWriting, YeuCauChamSpeaking,
          DiemWriting, DiemSpeaking, DiemTong, TrangThai
        ) VALUES (
          @MaDeThi, @MaSinhVien, GETDATE(), @DiemListening, @DiemReading,
          @BaiLamWriting, @BaiLamSpeaking, @YeuCauChamWriting, @YeuCauChamSpeaking,
          NULL, NULL, NULL, N'Đợi chấm'
        )
      `);

    res.json({ message: "Nộp bài thi thành công" });
  } catch (err) {
    console.error("Lỗi khi nộp bài thi:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// 2. Giảng viên lấy toàn bộ bài thi thử đã nộp
app.get("/dethi/submissions", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
        ds.MaSubmission AS id,
        ds.MaSinhVien,
        n.HoTen AS hoTen,
        d.TieuDe AS tenDeThi,
        ds.NgayNop AS ngayNop,
        ds.DiemListening AS diemNghe,
        ds.DiemReading AS diemDoc,
        ds.DiemWriting AS diemViet,
        ds.DiemSpeaking AS diemNoi,
        ds.NhanXetWriting AS nhanXetViet,
        ds.NhanXetSpeaking AS nhanXetNoi,
        ds.YeuCauChamWriting AS yeuCauChamViet,
        ds.YeuCauChamSpeaking AS yeuCauChamNoi,
        ds.BaiLamWriting AS baiLamVietRaw,
        ds.BaiLamSpeaking AS baiLamNoiRaw
      FROM DETHI_SUBMISSIONS ds
      JOIN SINHVIEN s ON ds.MaSinhVien = s.MaSinhVien
      JOIN NGUOIDUNG n ON s.MaNguoiDung = n.MaNguoiDung
      JOIN DETHI d ON ds.MaDeThi = d.MaDeThi
      ORDER BY ds.NgayNop DESC
    `);

    const formatted = result.recordset.map(row => {
      let baiLamViet = [];
      try {
        baiLamViet = JSON.parse(row.baiLamVietRaw || "[]");
      } catch (e) {
        baiLamViet = row.baiLamVietRaw ? [row.baiLamVietRaw] : [];
      }

      let baiLamNoi = [];
      try {
        baiLamNoi = JSON.parse(row.baiLamNoiRaw || "[]");
      } catch (e) {
        baiLamNoi = row.baiLamNoiRaw ? [row.baiLamNoiRaw] : [];
      }

      return {
        id: row.id,
        hoTen: row.hoTen,
        maSinhVien: formatStudentId(row.MaSinhVien),
        tenDeThi: row.tenDeThi,
        ngayNop: row.ngayNop,
        diemNghe: row.diemNghe,
        diemDoc: row.diemDoc,
        diemViet: row.diemViet,
        diemNoi: row.diemNoi,
        nhanXetViet: row.nhanXetViet || "",
        nhanXetNoi: row.nhanXetNoi || "",
        yeuCauChamViet: !!row.yeuCauChamViet,
        yeuCauChamNoi: !!row.yeuCauChamNoi,
        baiLamViet,
        baiLamNoi
      };
    });

    res.json(formatted);
  } catch (err) {
    console.error("Lỗi lấy danh sách bài nộp thi thử:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// 3. Giảng viên chấm điểm bài thi thử
app.put("/dethi/submissions/:id/grade", async (req, res) => {
  try {
    const { diemViet, nhanXetViet, diemNoi, nhanXetNoi } = req.body;
    const submissionId = req.params.id;
    const pool = await poolPromise;

    // Lấy thông tin bài thi hiện tại để lấy điểm Listening/Reading phục vụ tính DiemTong
    const subRes = await pool.request()
      .input("id", submissionId)
      .query("SELECT DiemListening, DiemReading FROM DETHI_SUBMISSIONS WHERE MaSubmission = @id");

    if (subRes.recordset.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy bài nộp." });
    }

    const { DiemListening, DiemReading } = subRes.recordset[0];

    // Cập nhật điểm, nhận xét
    await pool.request()
      .input("id", submissionId)
      .input("DiemWriting", diemViet === undefined ? null : diemViet)
      .input("DiemSpeaking", diemNoi === undefined ? null : diemNoi)
      .input("NhanXetWriting", nhanXetViet || null)
      .input("NhanXetSpeaking", nhanXetNoi || null)
      .query(`
        UPDATE DETHI_SUBMISSIONS
        SET DiemWriting = @DiemWriting,
            DiemSpeaking = @DiemSpeaking,
            NhanXetWriting = @NhanXetWriting,
            NhanXetSpeaking = @NhanXetSpeaking
        WHERE MaSubmission = @id
      `);

    // Tính DiemTong và TrangThai
    // Cập nhật TrangThai = N'Đã chấm' nếu cả DiemWriting và DiemSpeaking đều không NULL, ngược lại N'Đợi chấm'
    const isGraded = (diemViet !== null && diemViet !== undefined) && (diemNoi !== null && diemNoi !== undefined);
    const trangThai = isGraded ? 'Đã chấm' : 'Đợi chấm';

    let diemTong = null;
    if (diemViet !== null && diemViet !== undefined && diemNoi !== null && diemNoi !== undefined) {
      diemTong = (DiemListening + DiemReading + Number(diemViet) + Number(diemNoi)) / 4;
    }

    await pool.request()
      .input("id", submissionId)
      .input("DiemTong", diemTong)
      .input("TrangThai", trangThai)
      .query(`
        UPDATE DETHI_SUBMISSIONS
        SET DiemTong = @DiemTong,
            TrangThai = @TrangThai
        WHERE MaSubmission = @id
      `);

    res.json({ message: "Chấm điểm thành công" });
  } catch (err) {
    console.error("Lỗi khi chấm điểm bài thi:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// 2. Lấy chi tiết một đề thi thử
app.get("/dethi/:id", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("id", req.params.id)
      .query(`
        SELECT d.*, n.HoTen AS TenNguoiTao
        FROM DETHI d
        JOIN NGUOIDUNG n ON d.MaNguoiDung = n.MaNguoiDung
        WHERE d.MaDeThi = @id
      `);
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy đề thi" });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    console.error("Lỗi lấy chi tiết đề thi:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// 3. Tạo mới một đề thi thử
app.post("/dethi", async (req, res) => {
  try {
    const { TieuDe, MoTa, ThoiGian, CapDo, LoaiBai, NoiDungDeThi, TrangThai, MaNguoiDung } = req.body;
    const pool = await poolPromise;

    // Kiểm tra vai trò của người tạo đề thi
    const userRoleResult = await pool.request()
      .input("MaNguoiDung", MaNguoiDung)
      .query("SELECT MaVaiTro FROM NGUOIDUNG WHERE MaNguoiDung = @MaNguoiDung");

    if (userRoleResult.recordset.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy người tạo" });
    }

    const maVaiTro = userRoleResult.recordset[0].MaVaiTro;
    // Nếu người tạo là Quản trị nội dung (MaVaiTro = 4), TrangThaiDuyet là "Đã duyệt"
    // Nếu người tạo là Giảng viên (MaVaiTro = 2) hoặc vai trò khác, TrangThaiDuyet là "Chờ duyệt"
    const finalTrangThai = normalizeTrangThai(TrangThai || "Lưu nháp");
    const finalTrangThaiDuyet = (finalTrangThai === "Lưu nháp") ? "Lưu nháp" : ((maVaiTro === 4) ? 'Đã duyệt' : 'Chờ duyệt');

    const contentStr = typeof NoiDungDeThi === "object" ? JSON.stringify(NoiDungDeThi) : NoiDungDeThi;

    const insertResult = await pool.request()
      .input("TieuDe", TieuDe)
      .input("MoTa", MoTa || null)
      .input("ThoiGian", ThoiGian || 120)
      .input("CapDo", CapDo || null)
      .input("LoaiBai", LoaiBai || null)
      .input("NoiDungDeThi", contentStr)
      .input("TrangThai", finalTrangThai)
      .input("TrangThaiDuyet", finalTrangThaiDuyet)
      .input("MaNguoiDung", MaNguoiDung)
      .query(`
        INSERT INTO DETHI (TieuDe, MoTa, ThoiGian, CapDo, LoaiBai, NoiDungDeThi, TrangThai, TrangThaiDuyet, MaNguoiDung, NgayTao)
        OUTPUT INSERTED.MaDeThi
        VALUES (@TieuDe, @MoTa, @ThoiGian, @CapDo, @LoaiBai, @NoiDungDeThi, @TrangThai, @TrangThaiDuyet, @MaNguoiDung, GETDATE())
      `);

    const newId = insertResult.recordset[0].MaDeThi;
    res.json({
      message: "Tạo đề thi thành công",
      MaDeThi: newId,
      TrangThaiDuyet: finalTrangThaiDuyet
    });
  } catch (err) {
    console.error("Lỗi tạo đề thi:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// 4. Cập nhật một đề thi thử
app.put("/dethi/:id", async (req, res) => {
  try {
    const { TieuDe, MoTa, ThoiGian, CapDo, LoaiBai, NoiDungDeThi, TrangThai, MaNguoiDung } = req.body;
    const pool = await poolPromise;

    // Kiểm tra vai trò của người chỉnh sửa đề thi
    const userRoleResult = await pool.request()
      .input("MaNguoiDung", MaNguoiDung)
      .query("SELECT MaVaiTro FROM NGUOIDUNG WHERE MaNguoiDung = @MaNguoiDung");

    if (userRoleResult.recordset.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy người dùng chỉnh sửa" });
    }

    const maVaiTro = userRoleResult.recordset[0].MaVaiTro;
    // Tương tự, nếu Quản trị nội dung sửa thì duyệt luôn, Giảng viên sửa thì bắt đầu duyệt lại
    const trangThaiDuyet = (maVaiTro === 4) ? 'Đã duyệt' : 'Chờ duyệt';

    const contentStr = typeof NoiDungDeThi === "object" ? JSON.stringify(NoiDungDeThi) : NoiDungDeThi;

    await pool.request()
      .input("id", req.params.id)
      .input("TieuDe", TieuDe)
      .input("MoTa", MoTa || null)
      .input("ThoiGian", ThoiGian || 120)
      .input("CapDo", CapDo || null)
      .input("LoaiBai", LoaiBai || null)
      .input("NoiDungDeThi", contentStr)
      .input("TrangThai", TrangThai || "draft")
      .input("TrangThaiDuyet", trangThaiDuyet)
      .query(`
        UPDATE DETHI
        SET TieuDe = @TieuDe,
            MoTa = @MoTa,
            ThoiGian = @ThoiGian,
            CapDo = @CapDo,
            LoaiBai = @LoaiBai,
            NoiDungDeThi = @NoiDungDeThi,
            TrangThai = @TrangThai,
            TrangThaiDuyet = @TrangThaiDuyet
        WHERE MaDeThi = @id
      `);

    res.json({
      message: "Cập nhật đề thi thành công",
      TrangThaiDuyet: trangThaiDuyet
    });
  } catch (err) {
    console.error("Lỗi cập nhật đề thi:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// 5. Xóa đề thi thử
app.delete("/dethi/:id", async (req, res) => {
  try {
    const pool = await poolPromise;
    // 1. Xóa tất cả các bài nộp liên quan đến đề thi này trước để tránh lỗi ràng buộc khóa ngoại (Foreign Key Constraint)
    await pool.request()
      .input("id", req.params.id)
      .query("DELETE FROM DETHI_SUBMISSIONS WHERE MaDeThi = @id");

    // 2. Xóa đề thi
    await pool.request()
      .input("id", req.params.id)
      .query("DELETE FROM DETHI WHERE MaDeThi = @id");
    res.json({ message: "Xóa đề thi thành công" });
  } catch (err) {
    console.error("Lỗi xóa đề thi:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// 6. Lấy danh sách đề thi phục vụ duyệt bài cho Quản trị nội dung
app.get("/qtv/dethi", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT d.MaDeThi, d.TieuDe, d.MoTa, d.ThoiGian, d.CapDo, d.LoaiBai, d.NoiDungDeThi, d.TrangThai, d.TrangThaiDuyet, d.NgayTao, d.MaNguoiDung,
             n.HoTen AS TenGiangVien
      FROM DETHI d
      LEFT JOIN NGUOIDUNG n ON d.MaNguoiDung = n.MaNguoiDung
      WHERE (d.TrangThai IS NULL OR d.TrangThai NOT IN ('draft', N'Nháp', N'Lưu nháp')) AND (d.TrangThaiDuyet IS NULL OR d.TrangThaiDuyet NOT IN ('draft', N'Nháp', N'Lưu nháp'))
      ORDER BY d.NgayTao DESC
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error("Lỗi lấy danh sách đề thi chờ duyệt:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// 7. Cập nhật trạng thái duyệt đề thi (Duyệt / Từ chối) bởi Quản trị nội dung
app.put("/dethi/:id/status", async (req, res) => {
  try {
    const { TrangThai, MaNguoiDuyet } = req.body; 
    const pool = await poolPromise;

    const normalized = normalizeTrangThai(TrangThai);

    await pool.request()
      .input("id", req.params.id)
      .input("TrangThaiDuyet", normalized)
      .input("TrangThai", normalized)
      .input("MaNguoiDuyet", MaNguoiDuyet || null)
      .query(`
        UPDATE DETHI
        SET TrangThaiDuyet = @TrangThaiDuyet,
            TrangThai = @TrangThai,
            MaNguoiDuyet = @MaNguoiDuyet,
            NgayDuyet = GETDATE()
        WHERE MaDeThi = @id
      `);

    res.json({ message: "Phản hồi duyệt đề thi thành công" });
  } catch (err) {
    console.error("Lỗi duyệt đề thi:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// Endpoints moved up to resolve Express route order precedence.





const initDb = async () => {
  try {
    const pool = await poolPromise
    if (!pool) {
      console.error("Database connection was not established. Skipping initialization queries.");
      return;
    }
    await pool.request().query(`
      IF NOT EXISTS (
          SELECT * FROM sys.columns 
          WHERE object_id = OBJECT_ID('dbo.LOPHOC') AND name = 'ActiveBuoiHocId'
      )
      BEGIN
          ALTER TABLE dbo.LOPHOC ADD ActiveBuoiHocId INT NULL;
      END

      IF NOT EXISTS (
          SELECT * FROM sys.columns 
          WHERE object_id = OBJECT_ID('dbo.MINITEST') AND name = 'TrangThai'
      )
      BEGIN
          ALTER TABLE dbo.MINITEST ADD TrangThai NVARCHAR(50) NULL;
      END

      IF NOT EXISTS (
          SELECT * FROM sys.columns 
          WHERE object_id = OBJECT_ID('dbo.BAINOP') AND name = 'DaXemGiaiThich'
      )
      BEGIN
          ALTER TABLE dbo.BAINOP ADD DaXemGiaiThich INT NOT NULL DEFAULT 0;
      END

      IF NOT EXISTS (
          SELECT * FROM sys.columns 
          WHERE object_id = OBJECT_ID('dbo.BAIHOCKHOAHOC') AND name = 'MaNguoiDung'
      )
      BEGIN
          ALTER TABLE dbo.BAIHOCKHOAHOC ADD MaNguoiDung INT NULL;
      END

      IF NOT EXISTS (
          SELECT * FROM sys.columns 
          WHERE object_id = OBJECT_ID('dbo.BAITAP') AND name = 'MaNguoiDung'
      )
      BEGIN
          ALTER TABLE dbo.BAITAP ADD MaNguoiDung INT NULL;
      END

      IF NOT EXISTS (
          SELECT * FROM sys.columns 
          WHERE object_id = OBJECT_ID('dbo.BAIKIEMTRA') AND name = 'MaNguoiDung'
      )
      BEGIN
          ALTER TABLE dbo.BAIKIEMTRA ADD MaNguoiDung INT NULL;
      END

      -- Cho phép MaGiangVien trong BAIKIEMTRA được NULL khi QTV tạo bài kiểm tra
      IF EXISTS (
          SELECT * FROM sys.columns 
          WHERE object_id = OBJECT_ID('dbo.BAIKIEMTRA') AND name = 'MaGiangVien' AND is_nullable = 0
      )
      BEGIN
          ALTER TABLE dbo.BAIKIEMTRA ALTER COLUMN MaGiangVien INT NULL;
      END

      -- Thêm cột TrangThai vào BUOIHOC và đồng bộ dữ liệu cũ
      IF NOT EXISTS (
          SELECT * FROM sys.columns 
          WHERE object_id = OBJECT_ID('dbo.BUOIHOC') AND name = 'TrangThai'
      )
      BEGIN
          ALTER TABLE dbo.BUOIHOC ADD TrangThai NVARCHAR(50) NOT NULL DEFAULT N'Chờ mở';

          -- Chạy lệnh UPDATE dưới dạng SQL động để tránh lỗi biên dịch của SQL Server khi cột TrangThai chưa tồn tại
          EXEC sp_executesql N'
              UPDATE b 
              SET b.TrangThai = N''Đã mở''
              FROM dbo.BUOIHOC b
              INNER JOIN dbo.LOPHOC l ON b.MaLopHoc = l.MaLopHoc
              WHERE b.ThuTu <= (
                  SELECT active_bh.ThuTu 
                  FROM dbo.BUOIHOC active_bh 
                  WHERE active_bh.MaBuoiHoc = l.ActiveBuoiHocId
              );
          ';
      END
    `)
    console.log("Database initialized successfully (ActiveBuoiHocId, MINITEST TrangThai, BAINOP DaXemGiaiThich, BUOIHOC TrangThai, and MaNguoiDung columns checked/added).")
  } catch (err) {
    console.error("Database initialization error:", err.message)
  }
}

let server;
initDb().then(() => {
  const port = process.env.PORT || 5004;
  server = app.listen(port, '0.0.0.0', () => console.log("Server running on port " + port))
})

const gracefulShutdown = async (signal) => {
  console.log(`Received ${signal}. Shutting down gracefully...`);
  if (server) {
    server.close(() => {
      console.log("HTTP server closed.");
    });
  }
  try {
    const pool = await poolPromise;
    if (pool) {
      await pool.close();
      console.log("Database connection pool closed.");
    }
  } catch (err) {
    console.error("Error closing database connection pool:", err);
  } finally {
    if (signal === "SIGUSR2") {
      process.kill(process.pid, "SIGUSR2");
    } else {
      process.exit(0);
    }
  }
};

process.once("SIGINT", () => gracefulShutdown("SIGINT"));
process.once("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.once("SIGUSR2", () => gracefulShutdown("SIGUSR2"));