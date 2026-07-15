-- FLIC DATABASE COMPREHENSIVE DUMP
-- Generated on: 2026-07-15T08:45:09.888Z
-- Database: WebHocTiengAnh

USE [WebHocTiengAnh];
GO

-- 1. Disable constraints
EXEC sp_MSforeachtable "ALTER TABLE ? NOCHECK CONSTRAINT all";
GO

-- Table Structure for [dbo].[ADMIN]
IF OBJECT_ID('dbo.ADMIN', 'U') IS NOT NULL DROP TABLE [dbo].[ADMIN];
CREATE TABLE [dbo].[ADMIN] (
  [MaAdmin] [int] IDENTITY(1,1) NOT NULL,
  [MaNguoiDung] [int] NOT NULL,
  PRIMARY KEY CLUSTERED ([MaAdmin])
);
GO

-- Table Structure for [dbo].[BAIHOCKHOAHOC]
IF OBJECT_ID('dbo.BAIHOCKHOAHOC', 'U') IS NOT NULL DROP TABLE [dbo].[BAIHOCKHOAHOC];
CREATE TABLE [dbo].[BAIHOCKHOAHOC] (
  [MaBaiHoc] [int] IDENTITY(1,1) NOT NULL,
  [MaKhoaHoc] [int] NOT NULL,
  [TieuDe] [nvarchar](255) NOT NULL,
  [NoiDung] [nvarchar](MAX) NULL,
  [ThuTu] [int] NULL,
  [LoaiBaiHoc] [nvarchar](50) NULL,
  [ThoiLuong] [nvarchar](50) NULL,
  [TrangThai] [nvarchar](20) NULL,
  [MaBuoiHoc] [int] NULL,
  [FileUrl] [nvarchar](500) NULL,
  [TrangThaiDuyet] [nvarchar](30) NOT NULL DEFAULT (N'Chờ duyệt'),
  [IsFree] [int] NULL DEFAULT ((0)),
  [NgayTao] [datetime] NULL DEFAULT (getdate()),
  [MaNguoiDung] [int] NULL,
  PRIMARY KEY CLUSTERED ([MaBaiHoc])
);
GO

-- Table Structure for [dbo].[BAIKIEMTRA]
IF OBJECT_ID('dbo.BAIKIEMTRA', 'U') IS NOT NULL DROP TABLE [dbo].[BAIKIEMTRA];
CREATE TABLE [dbo].[BAIKIEMTRA] (
  [MaBaiKiemTra] [int] IDENTITY(1,1) NOT NULL,
  [TenBai] [nvarchar](255) NOT NULL,
  [ThoiGian] [int] NULL,
  [TongDiem] [float] NULL,
  [MaLesson] [int] NULL,
  [TrangThaiDuyet] [nvarchar](30) NOT NULL DEFAULT (N'Chờ duyệt'),
  [MaBuoiHoc] [int] NULL,
  [NgayBatDau] [datetime] NULL,
  [HanNop] [datetime] NULL,
  [ShowAnswer] [bit] NULL DEFAULT ((0)),
  [TrangThai] [nvarchar](20) NULL DEFAULT ('pending'),
  [NoiDung] [nvarchar](MAX) NULL,
  [CauHoi] [nvarchar](MAX) NULL,
  [NgayTao] [datetime] NULL DEFAULT (getdate()),
  [MaNguoiDung] [int] NULL,
  [MaGiangVien] [int] NULL,
  PRIMARY KEY CLUSTERED ([MaBaiKiemTra])
);
GO

-- Table Structure for [dbo].[BAINOP]
IF OBJECT_ID('dbo.BAINOP', 'U') IS NOT NULL DROP TABLE [dbo].[BAINOP];
CREATE TABLE [dbo].[BAINOP] (
  [MaBaiNop] [int] IDENTITY(1,1) NOT NULL,
  [MaBaiTap] [int] NOT NULL,
  [NoiDung] [nvarchar](MAX) NULL,
  [NgayNop] [datetime] NULL DEFAULT (getdate()),
  [Diem] [float] NULL,
  [NhanXet] [nvarchar](MAX) NULL,
  [TrangThai] [nvarchar](50) NULL DEFAULT (N'Chờ chấm'),
  [MaSinhVien] [int] NULL,
  [SoLanLamBai] [int] NULL,
  [DaXemGiaiThich] [int] NOT NULL DEFAULT ((0)),
  PRIMARY KEY CLUSTERED ([MaBaiNop])
);
GO

-- Table Structure for [dbo].[BAINOPTHEM]
IF OBJECT_ID('dbo.BAINOPTHEM', 'U') IS NOT NULL DROP TABLE [dbo].[BAINOPTHEM];
CREATE TABLE [dbo].[BAINOPTHEM] (
  [MaBaiNopThem] [int] IDENTITY(1,1) NOT NULL,
  [MaSinhVien] [nvarchar](20) NOT NULL,
  [MaLuyenTapThem] [int] NOT NULL,
  [NoiDung] [nvarchar](MAX) NULL,
  [NgayNop] [datetime] NULL DEFAULT (getdate()),
  [Diem] [float] NULL,
  [NhanXet] [nvarchar](MAX) NULL,
  [TrangThai] [nvarchar](50) NULL,
  PRIMARY KEY CLUSTERED ([MaBaiNopThem])
);
GO

-- Table Structure for [dbo].[BAITAP]
IF OBJECT_ID('dbo.BAITAP', 'U') IS NOT NULL DROP TABLE [dbo].[BAITAP];
CREATE TABLE [dbo].[BAITAP] (
  [MaBaiTap] [int] IDENTITY(1,1) NOT NULL,
  [TieuDe] [nvarchar](255) NULL,
  [NgayTao] [nvarchar](50) NULL,
  [NoiDung] [nvarchar](MAX) NULL,
  [CauHoi] [nvarchar](MAX) NULL,
  [LinkAmThanh] [nvarchar](500) NULL,
  [HienThiDapAn] [bit] NULL DEFAULT ((0)),
  [MaBaiHoc] [int] NULL,
  [TrangThaiDuyet] [nvarchar](30) NOT NULL DEFAULT (N'Chờ duyệt'),
  [HocThuMienPhi] [bit] NULL DEFAULT ((0)),
  [LaBaiKiemTra] [bit] NULL DEFAULT ((0)),
  [TrangThai] [nvarchar](50) NULL DEFAULT ('published'),
  [KyNang] [nvarchar](50) NULL,
  [DangBai] [nvarchar](50) NULL,
  [FileDinhKem] [nvarchar](MAX) NULL,
  [MaNguoiDung] [int] NULL,
  [HanNop] [datetime] NULL,
  PRIMARY KEY CLUSTERED ([MaBaiTap])
);
GO

-- Table Structure for [dbo].[BUOIHOC]
IF OBJECT_ID('dbo.BUOIHOC', 'U') IS NOT NULL DROP TABLE [dbo].[BUOIHOC];
CREATE TABLE [dbo].[BUOIHOC] (
  [MaBuoiHoc] [int] IDENTITY(1,1) NOT NULL,
  [TenBuoiHoc] [nvarchar](255) NULL,
  [MaLopHoc] [int] NULL,
  [MoTa] [nvarchar](500) NULL,
  [NgayBatDau] [date] NULL,
  [NgayKetThuc] [date] NULL,
  [ThuTu] [int] NULL,
  [TrangThai] [nvarchar](50) NOT NULL DEFAULT (N'Chờ mở'),
  PRIMARY KEY CLUSTERED ([MaBuoiHoc])
);
GO

-- Table Structure for [dbo].[DANGKYKHOAHOC]
IF OBJECT_ID('dbo.DANGKYKHOAHOC', 'U') IS NOT NULL DROP TABLE [dbo].[DANGKYKHOAHOC];
CREATE TABLE [dbo].[DANGKYKHOAHOC] (
  [MaDangKy] [int] IDENTITY(1,1) NOT NULL,
  [MaKhoaHoc] [int] NOT NULL,
  [NgayDangKy] [datetime] NULL DEFAULT (getdate()),
  [TrangThai] [nvarchar](20) NULL DEFAULT ('Active'),
  [MaSinhVien] [int] NULL,
  PRIMARY KEY CLUSTERED ([MaDangKy])
);
GO

-- Table Structure for [dbo].[DETHI]
IF OBJECT_ID('dbo.DETHI', 'U') IS NOT NULL DROP TABLE [dbo].[DETHI];
CREATE TABLE [dbo].[DETHI] (
  [MaDeThi] [int] IDENTITY(1,1) NOT NULL,
  [TieuDe] [nvarchar](255) NOT NULL,
  [MoTa] [nvarchar](MAX) NULL,
  [ThoiGian] [int] NOT NULL,
  [CapDo] [nvarchar](50) NULL,
  [LoaiBai] [nvarchar](50) NULL,
  [NoiDungDeThi] [nvarchar](MAX) NOT NULL,
  [TrangThai] [nvarchar](50) NOT NULL DEFAULT ('draft'),
  [TrangThaiDuyet] [nvarchar](50) NOT NULL DEFAULT (N'Chờ duyệt'),
  [MaNguoiDung] [int] NOT NULL,
  [NgayTao] [datetime] NOT NULL DEFAULT (getdate()),
  [NgayDuyet] [datetime] NULL,
  [MaNguoiDuyet] [int] NULL,
  PRIMARY KEY CLUSTERED ([MaDeThi])
);
GO

-- Table Structure for [dbo].[DETHI_SUBMISSIONS]
IF OBJECT_ID('dbo.DETHI_SUBMISSIONS', 'U') IS NOT NULL DROP TABLE [dbo].[DETHI_SUBMISSIONS];
CREATE TABLE [dbo].[DETHI_SUBMISSIONS] (
  [MaSubmission] [int] IDENTITY(1,1) NOT NULL,
  [MaDeThi] [int] NOT NULL,
  [MaSinhVien] [int] NOT NULL,
  [NgayNop] [datetime] NOT NULL DEFAULT (getdate()),
  [DiemListening] [float] NULL,
  [DiemReading] [float] NULL,
  [DiemWriting] [float] NULL,
  [DiemSpeaking] [float] NULL,
  [NhanXetWriting] [nvarchar](MAX) NULL,
  [NhanXetSpeaking] [nvarchar](MAX) NULL,
  [YeuCauChamWriting] [bit] NOT NULL DEFAULT ((1)),
  [YeuCauChamSpeaking] [bit] NOT NULL DEFAULT ((1)),
  [BaiLamWriting] [nvarchar](MAX) NULL,
  [BaiLamSpeaking] [nvarchar](MAX) NULL,
  [DiemTong] [float] NULL,
  [TrangThai] [nvarchar](20) NOT NULL DEFAULT (N'Đợi chấm'),
  PRIMARY KEY CLUSTERED ([MaSubmission])
);
GO

-- Table Structure for [dbo].[GIANGVIEN]
IF OBJECT_ID('dbo.GIANGVIEN', 'U') IS NOT NULL DROP TABLE [dbo].[GIANGVIEN];
CREATE TABLE [dbo].[GIANGVIEN] (
  [MaGiangVien] [int] IDENTITY(1,1) NOT NULL,
  [MaNguoiDung] [int] NOT NULL,
  [HocVi] [nvarchar](50) NULL,
  [ChuyenMon] [nvarchar](100) NULL,
  [SoDienThoai] [nvarchar](20) NULL,
  [KinhNghiem] [nvarchar](100) NULL,
  [GioiThieu] [nvarchar](MAX) NULL,
  PRIMARY KEY CLUSTERED ([MaGiangVien])
);
GO

-- Table Structure for [dbo].[KETQUABAIKIEMTRA]
IF OBJECT_ID('dbo.KETQUABAIKIEMTRA', 'U') IS NOT NULL DROP TABLE [dbo].[KETQUABAIKIEMTRA];
CREATE TABLE [dbo].[KETQUABAIKIEMTRA] (
  [MaKetQua] [int] IDENTITY(1,1) NOT NULL,
  [MaBaiKiemTra] [int] NOT NULL,
  [MaSinhVien] [int] NOT NULL,
  [Diem] [float] NULL,
  [ThoiGianLamBai] [datetime] NULL DEFAULT (getdate()),
  [SoLanLamBai] [int] NULL,
  PRIMARY KEY CLUSTERED ([MaKetQua])
);
GO

-- Table Structure for [dbo].[KHOAHOC]
IF OBJECT_ID('dbo.KHOAHOC', 'U') IS NOT NULL DROP TABLE [dbo].[KHOAHOC];
CREATE TABLE [dbo].[KHOAHOC] (
  [MaKhoaHoc] [int] IDENTITY(1,1) NOT NULL,
  [TenKhoaHoc] [nvarchar](255) NOT NULL,
  [MoTa] [nvarchar](MAX) NULL,
  [TrinhDo] [nvarchar](50) NULL,
  [TrangThai] [nvarchar](20) NULL DEFAULT ('Pending'),
  [MaNguoiDung] [int] NOT NULL,
  [NgayTao] [datetime] NULL DEFAULT (getdate()),
  [NgayDuyet] [datetime] NULL,
  [Listening] [bit] NULL,
  [Reading] [bit] NULL,
  [Writing] [bit] NULL,
  [Speaking] [bit] NULL,
  PRIMARY KEY CLUSTERED ([MaKhoaHoc])
);
GO

-- Table Structure for [dbo].[KHOAHOCCHITIET]
IF OBJECT_ID('dbo.KHOAHOCCHITIET', 'U') IS NOT NULL DROP TABLE [dbo].[KHOAHOCCHITIET];
CREATE TABLE [dbo].[KHOAHOCCHITIET] (
  [MaLop] [int] IDENTITY(1,1) NOT NULL,
  [TenLop] [nvarchar](255) NOT NULL,
  [MoTa] [nvarchar](MAX) NULL,
  [HocPhi] [int] NULL,
  [ThoiLuong] [nvarchar](100) NULL,
  [MaKhoaHoc] [int] NULL,
  [TrangThai] [nvarchar](50) NULL,
  PRIMARY KEY CLUSTERED ([MaLop])
);
GO

-- Table Structure for [dbo].[KYNANG]
IF OBJECT_ID('dbo.KYNANG', 'U') IS NOT NULL DROP TABLE [dbo].[KYNANG];
CREATE TABLE [dbo].[KYNANG] (
  [MaKyNang] [int] IDENTITY(1,1) NOT NULL,
  [TenKyNang] [nvarchar](50) NULL,
  [NoiDung] [nvarchar](MAX) NULL,
  PRIMARY KEY CLUSTERED ([MaKyNang])
);
GO

-- Table Structure for [dbo].[LOPHOC]
IF OBJECT_ID('dbo.LOPHOC', 'U') IS NOT NULL DROP TABLE [dbo].[LOPHOC];
CREATE TABLE [dbo].[LOPHOC] (
  [MaLopHoc] [int] IDENTITY(1,1) NOT NULL,
  [TenLop] [nvarchar](255) NOT NULL,
  [MaLop] [int] NOT NULL,
  [LichHoc] [nvarchar](255) NULL,
  [SoLuongHocVien] [int] NULL,
  [TienDo] [int] NULL,
  [ActiveBuoiHocId] [int] NULL,
  [TrangThai] [nvarchar](50) NOT NULL DEFAULT (N'Chưa bắt đầu'),
  [ActiveLessonId] [int] NULL,
  [ChoPhepHocThu] [bit] NOT NULL DEFAULT ((0)),
  PRIMARY KEY CLUSTERED ([MaLopHoc])
);
GO

-- Table Structure for [dbo].[LUYENTAPTHEM]
IF OBJECT_ID('dbo.LUYENTAPTHEM', 'U') IS NOT NULL DROP TABLE [dbo].[LUYENTAPTHEM];
CREATE TABLE [dbo].[LUYENTAPTHEM] (
  [MaLuyenTapThem] [int] IDENTITY(1,1) NOT NULL,
  [Title] [nvarchar](255) NULL,
  [Type] [nvarchar](100) NULL,
  [CreatedDate] [nvarchar](50) NULL,
  [MaBaiHoc] [int] NULL,
  [Content] [nvarchar](MAX) NULL,
  [Questions] [nvarchar](MAX) NULL,
  [Vocabulary] [nvarchar](MAX) NULL,
  [AudioUrl] [nvarchar](500) NULL,
  [ShowAnswer] [bit] NULL,
  [MaBuoiHoc] [int] NULL,
  [MaNguoiDung] [int] NULL,
  PRIMARY KEY CLUSTERED ([MaLuyenTapThem])
);
GO

-- Table Structure for [dbo].[MINITEST]
IF OBJECT_ID('dbo.MINITEST', 'U') IS NOT NULL DROP TABLE [dbo].[MINITEST];
CREATE TABLE [dbo].[MINITEST] (
  [MaMinitest] [int] IDENTITY(1,1) NOT NULL,
  [MaBaiHoc] [int] NOT NULL,
  [CauHoi] [nvarchar](MAX) NULL,
  [DiemDat] [float] NULL,
  [TrangThai] [nvarchar](50) NULL,
  PRIMARY KEY CLUSTERED ([MaMinitest])
);
GO

-- Table Structure for [dbo].[NGUOIDUNG]
IF OBJECT_ID('dbo.NGUOIDUNG', 'U') IS NOT NULL DROP TABLE [dbo].[NGUOIDUNG];
CREATE TABLE [dbo].[NGUOIDUNG] (
  [MaNguoiDung] [int] IDENTITY(1,1) NOT NULL,
  [TenDangNhap] [nvarchar](50) NOT NULL,
  [MatKhau] [nvarchar](255) NOT NULL,
  [HoTen] [nvarchar](100) NOT NULL,
  [Email] [nvarchar](100) NOT NULL,
  [NgaySinh] [date] NULL,
  [GioiTinh] [nvarchar](10) NULL,
  [TrangThai] [nvarchar](20) NULL DEFAULT ('Active'),
  [NgayTao] [datetime] NULL DEFAULT (getdate()),
  [MaVaiTro] [int] NULL,
  [AnhDaiDien] [nvarchar](500) NULL,
  PRIMARY KEY CLUSTERED ([MaNguoiDung])
);
GO

-- Table Structure for [dbo].[NGUOIDUNG_QUYENHAN]
IF OBJECT_ID('dbo.NGUOIDUNG_QUYENHAN', 'U') IS NOT NULL DROP TABLE [dbo].[NGUOIDUNG_QUYENHAN];
CREATE TABLE [dbo].[NGUOIDUNG_QUYENHAN] (
  [MaNguoiDung] [int] NOT NULL,
  [MaQuyenHan] [int] NOT NULL,
  PRIMARY KEY CLUSTERED ([MaNguoiDung], [MaQuyenHan])
);
GO

-- Table Structure for [dbo].[PHANCONG_LOP_KYNANG]
IF OBJECT_ID('dbo.PHANCONG_LOP_KYNANG', 'U') IS NOT NULL DROP TABLE [dbo].[PHANCONG_LOP_KYNANG];
CREATE TABLE [dbo].[PHANCONG_LOP_KYNANG] (
  [MaPhanCongKN] [int] IDENTITY(1,1) NOT NULL,
  [MaLopHoc] [int] NOT NULL,
  [MaGiangVien] [int] NOT NULL,
  [KyNang] [nvarchar](50) NOT NULL,
  PRIMARY KEY CLUSTERED ([MaPhanCongKN])
);
GO

-- Table Structure for [dbo].[PHANCONGGIANGVIEN]
IF OBJECT_ID('dbo.PHANCONGGIANGVIEN', 'U') IS NOT NULL DROP TABLE [dbo].[PHANCONGGIANGVIEN];
CREATE TABLE [dbo].[PHANCONGGIANGVIEN] (
  [MaPhanCong] [int] IDENTITY(1,1) NOT NULL,
  [MaLopHoc] [int] NOT NULL,
  [MaGiangVien] [int] NOT NULL,
  [MaKyNang] [int] NOT NULL,
  [NgayPhanCong] [datetime] NULL DEFAULT (getdate()),
  PRIMARY KEY CLUSTERED ([MaPhanCong])
);
GO

-- Table Structure for [dbo].[QUANTRIVIENNOIDUNG]
IF OBJECT_ID('dbo.QUANTRIVIENNOIDUNG', 'U') IS NOT NULL DROP TABLE [dbo].[QUANTRIVIENNOIDUNG];
CREATE TABLE [dbo].[QUANTRIVIENNOIDUNG] (
  [MaQTVND] [int] IDENTITY(1,1) NOT NULL,
  [MaNguoiDung] [int] NOT NULL,
  PRIMARY KEY CLUSTERED ([MaQTVND])
);
GO

-- Table Structure for [dbo].[QUYENHAN]
IF OBJECT_ID('dbo.QUYENHAN', 'U') IS NOT NULL DROP TABLE [dbo].[QUYENHAN];
CREATE TABLE [dbo].[QUYENHAN] (
  [MaQuyenHan] [int] IDENTITY(1,1) NOT NULL,
  [TenQuyenHan] [nvarchar](100) NOT NULL,
  PRIMARY KEY CLUSTERED ([MaQuyenHan])
);
GO

-- Table Structure for [dbo].[SINHVIEN]
IF OBJECT_ID('dbo.SINHVIEN', 'U') IS NOT NULL DROP TABLE [dbo].[SINHVIEN];
CREATE TABLE [dbo].[SINHVIEN] (
  [MaSinhVien] [int] IDENTITY(1,1) NOT NULL,
  [MaNguoiDung] [int] NOT NULL,
  [Lop] [nvarchar](50) NULL,
  [BietDanh] [nvarchar](100) NULL,
  [MSSV] [nvarchar](50) NULL,
  PRIMARY KEY CLUSTERED ([MaSinhVien])
);
GO

-- Table Structure for [dbo].[SINHVIEN_LOPHOC]
IF OBJECT_ID('dbo.SINHVIEN_LOPHOC', 'U') IS NOT NULL DROP TABLE [dbo].[SINHVIEN_LOPHOC];
CREATE TABLE [dbo].[SINHVIEN_LOPHOC] (
  [MaGhiDanh] [int] IDENTITY(1,1) NOT NULL,
  [MaLopHoc] [int] NOT NULL,
  [NgayGhiDanh] [datetime] NULL DEFAULT (getdate()),
  [TrangThai] [nvarchar](20) NULL DEFAULT (N'Đang học'),
  [MaSinhVien] [int] NOT NULL,
  PRIMARY KEY CLUSTERED ([MaGhiDanh])
);
GO

-- Table Structure for [dbo].[TAILIEU]
IF OBJECT_ID('dbo.TAILIEU', 'U') IS NOT NULL DROP TABLE [dbo].[TAILIEU];
CREATE TABLE [dbo].[TAILIEU] (
  [MaTaiLieu] [int] IDENTITY(1,1) NOT NULL,
  [TieuDe] [nvarchar](255) NOT NULL,
  [MoTa] [nvarchar](MAX) NULL,
  [NgayCapNhat] [datetime] NULL DEFAULT (getdate()),
  [MaBuoiHoc] [int] NULL,
  [NoiDung] [nvarchar](MAX) NULL,
  [FileUrl] [nvarchar](500) NULL,
  [TrangThai] [nvarchar](50) NULL DEFAULT ('published'),
  [MaGiangVien] [int] NULL,
  PRIMARY KEY CLUSTERED ([MaTaiLieu])
);
GO

-- Table Structure for [dbo].[TIENDO_MINITEST]
IF OBJECT_ID('dbo.TIENDO_MINITEST', 'U') IS NOT NULL DROP TABLE [dbo].[TIENDO_MINITEST];
CREATE TABLE [dbo].[TIENDO_MINITEST] (
  [MaTienDo] [int] IDENTITY(1,1) NOT NULL,
  [MaSinhVien] [nvarchar](20) NOT NULL,
  [MaBaiHoc] [int] NOT NULL,
  [DaXemVideo] [bit] NULL DEFAULT ((0)),
  [DaDatMinitest] [bit] NULL DEFAULT ((0)),
  [NgayCapNhat] [datetime] NULL DEFAULT (getdate()),
  PRIMARY KEY CLUSTERED ([MaTienDo])
);
GO

-- Table Structure for [dbo].[TIENDOHOCTAP]
IF OBJECT_ID('dbo.TIENDOHOCTAP', 'U') IS NOT NULL DROP TABLE [dbo].[TIENDOHOCTAP];
CREATE TABLE [dbo].[TIENDOHOCTAP] (
  [MaTienDo] [int] IDENTITY(1,1) NOT NULL,
  [MaSinhVien] [int] NOT NULL,
  [MaBaiHoc] [int] NOT NULL,
  [TrangThai] [nvarchar](20) NULL,
  PRIMARY KEY CLUSTERED ([MaTienDo])
);
GO

-- Table Structure for [dbo].[TONGKETKHOAHOC]
IF OBJECT_ID('dbo.TONGKETKHOAHOC', 'U') IS NOT NULL DROP TABLE [dbo].[TONGKETKHOAHOC];
CREATE TABLE [dbo].[TONGKETKHOAHOC] (
  [MaTongKet] [int] IDENTITY(1,1) NOT NULL,
  [MaSinhVien] [int] NOT NULL,
  [MaKhoaHoc] [int] NOT NULL,
  [DiemTrungBinh] [float] NULL,
  PRIMARY KEY CLUSTERED ([MaTongKet])
);
GO

-- Table Structure for [dbo].[VAITRO]
IF OBJECT_ID('dbo.VAITRO', 'U') IS NOT NULL DROP TABLE [dbo].[VAITRO];
CREATE TABLE [dbo].[VAITRO] (
  [MaVaiTro] [int] IDENTITY(1,1) NOT NULL,
  [TenVaiTro] [nvarchar](50) NOT NULL,
  PRIMARY KEY CLUSTERED ([MaVaiTro])
);
GO

-- Table Structure for [dbo].[VAITRO_QUYENHAN]
IF OBJECT_ID('dbo.VAITRO_QUYENHAN', 'U') IS NOT NULL DROP TABLE [dbo].[VAITRO_QUYENHAN];
CREATE TABLE [dbo].[VAITRO_QUYENHAN] (
  [MaVaiTro] [int] NOT NULL,
  [MaQuyenHan] [int] NOT NULL,
  PRIMARY KEY CLUSTERED ([MaQuyenHan], [MaVaiTro])
);
GO

-- Dumping Data for [dbo].[ADMIN]
SET IDENTITY_INSERT [dbo].[ADMIN] ON;
INSERT [dbo].[ADMIN] ([MaAdmin], [MaNguoiDung]) VALUES (1, 3);
SET IDENTITY_INSERT [dbo].[ADMIN] OFF;
GO

-- Dumping Data for [dbo].[BAIHOCKHOAHOC]
SET IDENTITY_INSERT [dbo].[BAIHOCKHOAHOC] ON;
INSERT [dbo].[BAIHOCKHOAHOC] ([MaBaiHoc], [MaKhoaHoc], [TieuDe], [NoiDung], [ThuTu], [LoaiBaiHoc], [ThoiLuong], [TrangThai], [MaBuoiHoc], [FileUrl], [TrangThaiDuyet], [IsFree], [NgayTao], [MaNguoiDung]) VALUES (41, 1, N'Tài liệu buổi 1', N'Nội dung tài liệu', 1, N'PDF', N'45 phút', N'published', NULL, NULL, N'Đã duyệt', 1, NULL, NULL);
INSERT [dbo].[BAIHOCKHOAHOC] ([MaBaiHoc], [MaKhoaHoc], [TieuDe], [NoiDung], [ThuTu], [LoaiBaiHoc], [ThoiLuong], [TrangThai], [MaBuoiHoc], [FileUrl], [TrangThaiDuyet], [IsFree], [NgayTao], [MaNguoiDung]) VALUES (42, 1, N'Tài liệu buổi 2', N'Nội dung tài liệu', 2, N'PDF', N'45 phút', N'published', NULL, NULL, N'Đã duyệt', 1, NULL, NULL);
INSERT [dbo].[BAIHOCKHOAHOC] ([MaBaiHoc], [MaKhoaHoc], [TieuDe], [NoiDung], [ThuTu], [LoaiBaiHoc], [ThoiLuong], [TrangThai], [MaBuoiHoc], [FileUrl], [TrangThaiDuyet], [IsFree], [NgayTao], [MaNguoiDung]) VALUES (43, 1, N'Tài liệu buổi 1', N'Nội dung tài liệu', 1, N'PDF', N'45 phút', N'published', NULL, NULL, N'Đã duyệt', 0, NULL, NULL);
INSERT [dbo].[BAIHOCKHOAHOC] ([MaBaiHoc], [MaKhoaHoc], [TieuDe], [NoiDung], [ThuTu], [LoaiBaiHoc], [ThoiLuong], [TrangThai], [MaBuoiHoc], [FileUrl], [TrangThaiDuyet], [IsFree], [NgayTao], [MaNguoiDung]) VALUES (44, 1, N'Tài liệu buổi 2', N'Nội dung tài liệu', 2, N'PDF', N'45 phút', N'published', NULL, NULL, N'Đã duyệt', 0, NULL, NULL);
INSERT [dbo].[BAIHOCKHOAHOC] ([MaBaiHoc], [MaKhoaHoc], [TieuDe], [NoiDung], [ThuTu], [LoaiBaiHoc], [ThoiLuong], [TrangThai], [MaBuoiHoc], [FileUrl], [TrangThaiDuyet], [IsFree], [NgayTao], [MaNguoiDung]) VALUES (45, 1, N'Tài liệu buổi 1', N'Nội dung tài liệu', 1, N'PDF', N'45 phút', N'published', NULL, NULL, N'Đã duyệt', 0, NULL, NULL);
INSERT [dbo].[BAIHOCKHOAHOC] ([MaBaiHoc], [MaKhoaHoc], [TieuDe], [NoiDung], [ThuTu], [LoaiBaiHoc], [ThoiLuong], [TrangThai], [MaBuoiHoc], [FileUrl], [TrangThaiDuyet], [IsFree], [NgayTao], [MaNguoiDung]) VALUES (46, 1, N'Tài liệu buổi 2', N'Nội dung tài liệu', 2, N'PDF', N'45 phút', N'published', NULL, NULL, N'Đã duyệt', 0, NULL, NULL);
INSERT [dbo].[BAIHOCKHOAHOC] ([MaBaiHoc], [MaKhoaHoc], [TieuDe], [NoiDung], [ThuTu], [LoaiBaiHoc], [ThoiLuong], [TrangThai], [MaBuoiHoc], [FileUrl], [TrangThaiDuyet], [IsFree], [NgayTao], [MaNguoiDung]) VALUES (49, 1, N'Tài liệu buổi 1', N'Nội dung tài liệu', 1, N'PDF', N'45 phút', N'published', NULL, N'', N'Chờ duyệt', 0, NULL, NULL);
INSERT [dbo].[BAIHOCKHOAHOC] ([MaBaiHoc], [MaKhoaHoc], [TieuDe], [NoiDung], [ThuTu], [LoaiBaiHoc], [ThoiLuong], [TrangThai], [MaBuoiHoc], [FileUrl], [TrangThaiDuyet], [IsFree], [NgayTao], [MaNguoiDung]) VALUES (50, 1, N'Tài liệu buổi 1', N'Nội dung tài liệu', 1, N'PDF', N'45 phút', N'published', NULL, N'', N'Chờ duyệt', 0, NULL, NULL);
INSERT [dbo].[BAIHOCKHOAHOC] ([MaBaiHoc], [MaKhoaHoc], [TieuDe], [NoiDung], [ThuTu], [LoaiBaiHoc], [ThoiLuong], [TrangThai], [MaBuoiHoc], [FileUrl], [TrangThaiDuyet], [IsFree], [NgayTao], [MaNguoiDung]) VALUES (52, 1, N'Bài giảng của thầy Nguyên', N'các bạn luyện tập các mẫu câu đối thoại thông dụng trong video hướng dẫn', 1, N'Video', N'5 phút', N'published', 36, N'https://youtu.be/OvLRybrkoaE?si=-Vbk2L0L4UvQygw4', N'Chờ duyệt', 0, NULL, NULL);
INSERT [dbo].[BAIHOCKHOAHOC] ([MaBaiHoc], [MaKhoaHoc], [TieuDe], [NoiDung], [ThuTu], [LoaiBaiHoc], [ThoiLuong], [TrangThai], [MaBuoiHoc], [FileUrl], [TrangThaiDuyet], [IsFree], [NgayTao], [MaNguoiDung]) VALUES (54, 1, N'd', N'', 1, N'Video', N'30 phút', N'published', NULL, N'', N'Chờ duyệt', 0, NULL, NULL);
INSERT [dbo].[BAIHOCKHOAHOC] ([MaBaiHoc], [MaKhoaHoc], [TieuDe], [NoiDung], [ThuTu], [LoaiBaiHoc], [ThoiLuong], [TrangThai], [MaBuoiHoc], [FileUrl], [TrangThaiDuyet], [IsFree], [NgayTao], [MaNguoiDung]) VALUES (57, 1, N'Bài học từ vựng', N'Bài học cung cấp từ vựng liên quan tới chương này', 1, N'Video', N'45 phút', N'published', NULL, N'/uploads/1782704836197-Tráº§n-Thanh-NhÃ£_Äá»-cÆ°Æ¡ng-chi-tiáº¿t_TTNN2026.docx', N'Đã duyệt', 0, NULL, NULL);
INSERT [dbo].[BAIHOCKHOAHOC] ([MaBaiHoc], [MaKhoaHoc], [TieuDe], [NoiDung], [ThuTu], [LoaiBaiHoc], [ThoiLuong], [TrangThai], [MaBuoiHoc], [FileUrl], [TrangThaiDuyet], [IsFree], [NgayTao], [MaNguoiDung]) VALUES (59, 1, N'zxc', N'zxcv ', 1, N'Video', N'30 phút', N'published', NULL, N'sdfv', N'Chờ duyệt', 0, NULL, NULL);
INSERT [dbo].[BAIHOCKHOAHOC] ([MaBaiHoc], [MaKhoaHoc], [TieuDe], [NoiDung], [ThuTu], [LoaiBaiHoc], [ThoiLuong], [TrangThai], [MaBuoiHoc], [FileUrl], [TrangThaiDuyet], [IsFree], [NgayTao], [MaNguoiDung]) VALUES (60, 1, N'cvb  ', N'', 1, N'Video', N'30 phút', N'published', NULL, N'', N'Chờ duyệt', 0, NULL, NULL);
INSERT [dbo].[BAIHOCKHOAHOC] ([MaBaiHoc], [MaKhoaHoc], [TieuDe], [NoiDung], [ThuTu], [LoaiBaiHoc], [ThoiLuong], [TrangThai], [MaBuoiHoc], [FileUrl], [TrangThaiDuyet], [IsFree], [NgayTao], [MaNguoiDung]) VALUES (61, 1, N'x cv', N'', 1, N'Video', N'30 phút', N'published', NULL, N'', N'Chờ duyệt', 0, NULL, NULL);
INSERT [dbo].[BAIHOCKHOAHOC] ([MaBaiHoc], [MaKhoaHoc], [TieuDe], [NoiDung], [ThuTu], [LoaiBaiHoc], [ThoiLuong], [TrangThai], [MaBuoiHoc], [FileUrl], [TrangThaiDuyet], [IsFree], [NgayTao], [MaNguoiDung]) VALUES (62, 1, N'Bài học từ vựng', N'Bài học cung cấp từ vựng liên quan tới chương này', 1, N'Video', N'45 phút', N'published', NULL, N'/uploads/1782704836197-Tráº§n-Thanh-NhÃ£_Äá»-cÆ°Æ¡ng-chi-tiáº¿t_TTNN2026.docx', N'Chờ duyệt', 0, NULL, NULL);
INSERT [dbo].[BAIHOCKHOAHOC] ([MaBaiHoc], [MaKhoaHoc], [TieuDe], [NoiDung], [ThuTu], [LoaiBaiHoc], [ThoiLuong], [TrangThai], [MaBuoiHoc], [FileUrl], [TrangThaiDuyet], [IsFree], [NgayTao], [MaNguoiDung]) VALUES (80, 1, N'The Cuppy Cake Song Original 2D Animation', N'mô tả bài giảng 3/7', 1, N'Video', N'0 phút', N'published', NULL, N'https://www.youtube.com/watch?v=wAgZVLk6J4M&list=RDwAgZVLk6J4M&start_radio=1', N'Chờ duyệt', 0, '2026-07-03T09:58:03.947Z', NULL);
INSERT [dbo].[BAIHOCKHOAHOC] ([MaBaiHoc], [MaKhoaHoc], [TieuDe], [NoiDung], [ThuTu], [LoaiBaiHoc], [ThoiLuong], [TrangThai], [MaBuoiHoc], [FileUrl], [TrangThaiDuyet], [IsFree], [NgayTao], [MaNguoiDung]) VALUES (83, 1, N'ten', N'', 1, N'Video', N'0 phút', N'published', NULL, N'https://www.youtube.com/watch?v=xuP4g7IDgDM&list=RDxuP4g7IDgDM&start_radio=1', N'Chờ duyệt', 0, '2026-07-03T15:21:11.540Z', NULL);
INSERT [dbo].[BAIHOCKHOAHOC] ([MaBaiHoc], [MaKhoaHoc], [TieuDe], [NoiDung], [ThuTu], [LoaiBaiHoc], [ThoiLuong], [TrangThai], [MaBuoiHoc], [FileUrl], [TrangThaiDuyet], [IsFree], [NgayTao], [MaNguoiDung]) VALUES (84, 1, N'ten', N'', 1, N'Video', N'0 phút', N'published', NULL, N'https://www.youtube.com/watch?v=xuP4g7IDgDM&list=RDxuP4g7IDgDM&start_radio=1', N'Chờ duyệt', 0, '2026-07-03T15:25:48.443Z', NULL);
INSERT [dbo].[BAIHOCKHOAHOC] ([MaBaiHoc], [MaKhoaHoc], [TieuDe], [NoiDung], [ThuTu], [LoaiBaiHoc], [ThoiLuong], [TrangThai], [MaBuoiHoc], [FileUrl], [TrangThaiDuyet], [IsFree], [NgayTao], [MaNguoiDung]) VALUES (138, 1, N'BG NHÃ TẠO', N'TÌM EM', 1, N'Video', N'0 phút', N'published', 42, N'https://youtu.be/gJAbDSse5WM?si=6uuRoT-9P2oenv5H', N'Đã duyệt', 0, '2026-07-13T15:28:50.257Z', 6);
INSERT [dbo].[BAIHOCKHOAHOC] ([MaBaiHoc], [MaKhoaHoc], [TieuDe], [NoiDung], [ThuTu], [LoaiBaiHoc], [ThoiLuong], [TrangThai], [MaBuoiHoc], [FileUrl], [TrangThaiDuyet], [IsFree], [NgayTao], [MaNguoiDung]) VALUES (139, 1, N'Bài n - Demo XN', N'Quay về', 1, N'Video', N'0 phút', N'published', 37, N'https://youtu.be/EvjZ7ckgYTg?si=oYa', N'Đã duyệt', 0, '2026-07-13T16:12:33.067Z', 1);
INSERT [dbo].[BAIHOCKHOAHOC] ([MaBaiHoc], [MaKhoaHoc], [TieuDe], [NoiDung], [ThuTu], [LoaiBaiHoc], [ThoiLuong], [TrangThai], [MaBuoiHoc], [FileUrl], [TrangThaiDuyet], [IsFree], [NgayTao], [MaNguoiDung]) VALUES (140, 1, N'Bài demo xn', N'quay về quay về', 1, N'Video', N'0 phút', N'draft', 37, N'https://youtu.be/EvjZ7ckgYTg?si=OYamowlmxCX1HigG', N'Chờ duyệt', 0, '2026-07-13T16:28:10.390Z', 4);
INSERT [dbo].[BAIHOCKHOAHOC] ([MaBaiHoc], [MaKhoaHoc], [TieuDe], [NoiDung], [ThuTu], [LoaiBaiHoc], [ThoiLuong], [TrangThai], [MaBuoiHoc], [FileUrl], [TrangThaiDuyet], [IsFree], [NgayTao], [MaNguoiDung]) VALUES (141, 1, N'BG ni là Nhã làm để test', N'', 1, N'Video', N'0 phút', N'draft', 42, N'https://youtu.be/gJAbDSse5WM?si=hSSM7oovrEecWsU-', N'Chờ duyệt', 0, '2026-07-14T00:15:47.607Z', 4);
INSERT [dbo].[BAIHOCKHOAHOC] ([MaBaiHoc], [MaKhoaHoc], [TieuDe], [NoiDung], [ThuTu], [LoaiBaiHoc], [ThoiLuong], [TrangThai], [MaBuoiHoc], [FileUrl], [TrangThaiDuyet], [IsFree], [NgayTao], [MaNguoiDung]) VALUES (142, 1, N'14/7 1', N'lý thuyết
nội dung bài blala', 3, N'Video', N'0 phút', N'published', 42, N'https://www.youtube.com/watch?v=gJAbDSse5WM&list=RDGMEMCMFH2exzjBeE_zAHHJOdxgVMOmfG5jX1f3g&index=6', N'Đã duyệt', 0, '2026-07-14T09:31:19.727Z', 6);
INSERT [dbo].[BAIHOCKHOAHOC] ([MaBaiHoc], [MaKhoaHoc], [TieuDe], [NoiDung], [ThuTu], [LoaiBaiHoc], [ThoiLuong], [TrangThai], [MaBuoiHoc], [FileUrl], [TrangThaiDuyet], [IsFree], [NgayTao], [MaNguoiDung]) VALUES (143, 1, N'Lesson 1.1 - Vocab ', N'Vocabulary topic "Education" ', 1, N'Video', N'0 phút', N'published', 46, N'https://youtu.be/Iy6QKtoxsnc?si=b7ah-jqYIt4BMf33', N'Đã duyệt', 0, '2026-07-14T10:13:40.930Z', 6);
INSERT [dbo].[BAIHOCKHOAHOC] ([MaBaiHoc], [MaKhoaHoc], [TieuDe], [NoiDung], [ThuTu], [LoaiBaiHoc], [ThoiLuong], [TrangThai], [MaBuoiHoc], [FileUrl], [TrangThaiDuyet], [IsFree], [NgayTao], [MaNguoiDung]) VALUES (145, 1, N'Demo xn', N'[Nhóm 1]
Ngữ cảnh: Dialogue between a student and a teacher. (tùy chọn)
Câu 1: What does the student need help with?
A. Homework
B. Registration
C. Examination
D. Dormitory
Đáp án đúng: B
Giải thích: Học viên cần giúp đăng ký môn học (tùy chọn)


Câu 2: When is the deadline?
A. Today
B. Tomorrow
C. Friday
D. Next week
Đáp án đúng: C
Giải thích: Hạn cuối nộp bài là vào thứ 6 (tùy chọn)


[Nhóm 2]
Ngữ cảnh: Announcement in the railway station. (tùy chọn)
Câu 3: Why is the train delayed?
A. At 6:00
B. At 4:00
C. At 5:00
D. At 4:00
Đáp án đúng: B
Giải thích: Tàu hoãn do sự cố kỹ thuật đường ray (tùy chọn)', 2, N'Video', N'0 phút', N'published', 36, N'https://youtu.be/zKTNXUA7lWI?si=w6etlNoeEksD2Rp2', N'Chờ duyệt', 0, '2026-07-14T10:30:32.160Z', 6);
INSERT [dbo].[BAIHOCKHOAHOC] ([MaBaiHoc], [MaKhoaHoc], [TieuDe], [NoiDung], [ThuTu], [LoaiBaiHoc], [ThoiLuong], [TrangThai], [MaBuoiHoc], [FileUrl], [TrangThaiDuyet], [IsFree], [NgayTao], [MaNguoiDung]) VALUES (146, 1, N'Lesson 1.2 -Pronunciation', N'Pronunciation: Vowels (Nguyên âm)', 2, N'Video', N'0 phút', N'Đã duyệt', 46, N'https://youtu.be/7GgRMfT-UMI?si=f-YTT65pICaXHyz5', N'Đã duyệt', 0, '2026-07-15T08:16:19.663Z', 6);
SET IDENTITY_INSERT [dbo].[BAIHOCKHOAHOC] OFF;
GO

-- Dumping Data for [dbo].[BAIKIEMTRA]
SET IDENTITY_INSERT [dbo].[BAIKIEMTRA] ON;
INSERT [dbo].[BAIKIEMTRA] ([MaBaiKiemTra], [TenBai], [ThoiGian], [TongDiem], [MaLesson], [TrangThaiDuyet], [MaBuoiHoc], [NgayBatDau], [HanNop], [ShowAnswer], [TrangThai], [NoiDung], [CauHoi], [NgayTao], [MaNguoiDung], [MaGiangVien]) VALUES (13, N'BÀI KIỂM TRA NHÃ TẠO', 50, 10, NULL, N'Đã duyệt', 42, NULL, NULL, 0, N'published', N'{"isExam":true,"duration":50,"startTime":null,"deadline":null,"openingMode":"manual","isOpened":false,"sections":[{"type":"listening-mcq","title":"Phần 1: Nghe trắc nghiệm","audioUrl":"/uploads/1783396069031-ÄoaÌ£n-8.m4a","questions":[{"question":"","answers":["","","",""],"correct":"A","explanation":"","subQuestions":[{"question":"NHK","answers":["FE","ET","ET","RÊT"],"correct":"A","explanation":""},{"question":"RTDGSDBDFB","answers":["DFG","DFG","DF","FDY"],"correct":"A","explanation":""},{"question":"ƯERTEGDFG","answers":["SDF","SD","56","S4"],"correct":"A","explanation":""}]}]},{"type":"reading-split","title":"Phần 2","audioUrl":"","questions":[{"question":"","answers":["","","",""],"correct":"A","explanation":"","audioUrl":"","imageUrl":"","text":"HDYFUEYURHJASHJDERUWHSJDBFSDTUYISDSFNMDGDFTYERUHFSJNBVNGDHFGTYVBNCVBHDGFEYURYFS","prompt":"","vocabPairs":[{"word":"","meaning":""}],"fillInAnswers":[],"sentences":[""],"subQuestions":[{"question":"NSDGHFWTYETRYSHFBBSGD","answers":["SDFSDG","SFSDGG","ẺYER","FSWER"],"correct":"A","explanation":""},{"question":"GREY4RYFDGFHRETYEEW","answers":["SDFSF","SDF","STEE","TYEY"],"correct":"A","explanation":""}]}],"content":""},{"type":"speaking-pronounce","title":"Phần 3","audioUrl":"","questions":[{"question":"","answers":["","","",""],"correct":"A","explanation":"","audioUrl":"","imageUrl":"","text":"Hello","prompt":"","vocabPairs":[{"word":"","meaning":""}],"fillInAnswers":[],"sentences":[""]},{"question":"","answers":["","","",""],"correct":"A","explanation":"","audioUrl":"","imageUrl":"","text":"World cup","prompt":"","vocabPairs":[{"word":"","meaning":""}],"fillInAnswers":[],"sentences":[""],"correctSentence":"","subQuestions":[{"question":"","answers":["","","",""],"correct":"A","explanation":""}]},{"question":"","answers":["","","",""],"correct":"A","explanation":"","audioUrl":"","imageUrl":"","text":"football","prompt":"","vocabPairs":[{"word":"","meaning":""}],"fillInAnswers":[],"sentences":[""],"correctSentence":"","subQuestions":[{"question":"","answers":["","","",""],"correct":"A","explanation":""}]}],"content":""},{"type":"writing-order-sentences","title":"Phần 4","audioUrl":"","questions":[{"question":"","answers":["","","",""],"correct":"A","explanation":"","audioUrl":"","imageUrl":"","text":"","prompt":"","vocabPairs":[{"word":"","meaning":""}],"fillInAnswers":[],"sentences":["bướm kia ai vẽ mà nghệ","nhà kia ai sơn mà đẹp"]}],"content":""}]}', N'', '2026-07-07T10:51:05.047Z', NULL, NULL);
INSERT [dbo].[BAIKIEMTRA] ([MaBaiKiemTra], [TenBai], [ThoiGian], [TongDiem], [MaLesson], [TrangThaiDuyet], [MaBuoiHoc], [NgayBatDau], [HanNop], [ShowAnswer], [TrangThai], [NoiDung], [CauHoi], [NgayTao], [MaNguoiDung], [MaGiangVien]) VALUES (20, N'Demo XN BKT', 50, 10, NULL, N'Đã duyệt', 36, NULL, NULL, 0, N'published', N'{"isExam":true,"duration":50,"startTime":null,"deadline":null,"openingMode":"manual","isOpened":false,"sections":[{"type":"Nối từ","title":"Phần 1: Nối từ sao đúng","audioUrl":"","questions":[{"question":"","answers":["","","",""],"correct":"A","explanation":"","audioUrl":"","imageUrl":"","text":"","prompt":"","vocabPairs":[{"word":"bello","meaning":"minions"},{"word":"what cha do in","meaning":"finies and ferb"},{"word":"vui lòng","meaning":"plesure"}],"fillInAnswers":[],"sentences":[""]}],"content":""}]}', N'', '2026-07-08T15:19:29.200Z', 6, NULL);
INSERT [dbo].[BAIKIEMTRA] ([MaBaiKiemTra], [TenBai], [ThoiGian], [TongDiem], [MaLesson], [TrangThaiDuyet], [MaBuoiHoc], [NgayBatDau], [HanNop], [ShowAnswer], [TrangThai], [NoiDung], [CauHoi], [NgayTao], [MaNguoiDung], [MaGiangVien]) VALUES (21, N'Test Exam', 45, 10, NULL, N'Chờ duyệt', 37, NULL, NULL, 0, N'Đã duyệt', N'{}', N'[]', '2026-07-09T20:42:24.127Z', NULL, NULL);
INSERT [dbo].[BAIKIEMTRA] ([MaBaiKiemTra], [TenBai], [ThoiGian], [TongDiem], [MaLesson], [TrangThaiDuyet], [MaBuoiHoc], [NgayBatDau], [HanNop], [ShowAnswer], [TrangThai], [NoiDung], [CauHoi], [NgayTao], [MaNguoiDung], [MaGiangVien]) VALUES (22, N'bài kiểm tra nhã tạo để test', 50, 10, NULL, N'Đã duyệt', 36, '2026-07-10T09:35:00.000Z', '2026-07-13T09:33:00.000Z', 0, N'published', N'{"isExam":true,"duration":50,"startTime":"2026-07-10T16:35","deadline":"2026-07-13T16:33","openingMode":"scheduled","isOpened":true,"sections":[{"type":"Nghe audio trắc nghiệm","title":"Phần 1: Nghe trắc nghiệm","audioUrl":"","questions":[{"question":"","answers":["","","",""],"correct":"A","explanation":"","audioUrl":"/uploads/1783675985626-ÄoaÌ£n-8.m4a","subQuestions":[{"question":"adasf","answers":["á","sdfs","ưer","eds"],"correct":"B","explanation":""}]}]}]}', N'', '2026-07-10T16:39:38.723Z', 6, NULL);
INSERT [dbo].[BAIKIEMTRA] ([MaBaiKiemTra], [TenBai], [ThoiGian], [TongDiem], [MaLesson], [TrangThaiDuyet], [MaBuoiHoc], [NgayBatDau], [HanNop], [ShowAnswer], [TrangThai], [NoiDung], [CauHoi], [NgayTao], [MaNguoiDung], [MaGiangVien]) VALUES (23, N'hmj', 50, 10, NULL, N'Chờ duyệt', 36, NULL, NULL, 0, N'pending', N'{"isExam":true,"duration":50,"startTime":"","deadline":null,"openingMode":"scheduled","isOpened":true,"sections":[{"type":"Nghe audio trắc nghiệm","title":"Phần 1","audioUrl":"","questions":[{"question":"","answers":["","","",""],"correct":"A","explanation":""},{"question":"","answers":["","","",""],"correct":"A","explanation":""}]}]}', N'', '2026-07-12T19:08:45.787Z', 4, 1);
INSERT [dbo].[BAIKIEMTRA] ([MaBaiKiemTra], [TenBai], [ThoiGian], [TongDiem], [MaLesson], [TrangThaiDuyet], [MaBuoiHoc], [NgayBatDau], [HanNop], [ShowAnswer], [TrangThai], [NoiDung], [CauHoi], [NgayTao], [MaNguoiDung], [MaGiangVien]) VALUES (24, N'tt', 50, 10, NULL, N'Đã duyệt', 36, NULL, NULL, 0, N'published', N'{"isExam":true,"duration":50,"startTime":"","deadline":null,"openingMode":"scheduled","isOpened":true,"sections":[{"type":"Nghe audio trắc nghiệm","title":"Phần 1: Nghe trắc nghiệm","audioUrl":"","questions":[{"question":"","answers":["","","",""],"correct":"A","explanation":""}]}]}', N'', '2026-07-12T19:10:15.263Z', 6, NULL);
INSERT [dbo].[BAIKIEMTRA] ([MaBaiKiemTra], [TenBai], [ThoiGian], [TongDiem], [MaLesson], [TrangThaiDuyet], [MaBuoiHoc], [NgayBatDau], [HanNop], [ShowAnswer], [TrangThai], [NoiDung], [CauHoi], [NgayTao], [MaNguoiDung], [MaGiangVien]) VALUES (25, N't', 50, 10, NULL, N'Đã duyệt', 36, NULL, NULL, 0, N'published', N'{"isExam":true,"duration":50,"startTime":"","deadline":null,"openingMode":"scheduled","isOpened":true,"sections":[{"type":"Nghe audio trắc nghiệm","title":"Phần 1: Nghe trắc nghiệm","audioUrl":"","questions":[{"question":"","answers":["","","",""],"correct":"A","explanation":""}]}]}', N'', '2026-07-12T19:11:32.327Z', 6, NULL);
INSERT [dbo].[BAIKIEMTRA] ([MaBaiKiemTra], [TenBai], [ThoiGian], [TongDiem], [MaLesson], [TrangThaiDuyet], [MaBuoiHoc], [NgayBatDau], [HanNop], [ShowAnswer], [TrangThai], [NoiDung], [CauHoi], [NgayTao], [MaNguoiDung], [MaGiangVien]) VALUES (26, N'gh', 50, 10, NULL, N'Đã duyệt', 46, NULL, '2026-07-14T02:08:00.000Z', 0, N'Đã duyệt', N'{"isExam":true,"duration":50,"startTime":"","deadline":"2026-07-14T09:08","openingMode":"scheduled","isOpened":true,"sections":[{"type":"Nghe audio trắc nghiệm","title":"Phần 1: Nghe trắc nghiệm","audioUrl":"","questions":[{"question":"","answers":["","","",""],"correct":"A","explanation":"","subQuestions":[{"question":"What time","answers":["At 6:00","At 7:00","At 7:15","At 7:50"],"correct":"A","explanation":""}]}]}]}', N'', '2026-07-14T09:07:49.810Z', 6, NULL);
SET IDENTITY_INSERT [dbo].[BAIKIEMTRA] OFF;
GO

-- Dumping Data for [dbo].[BAINOP]
SET IDENTITY_INSERT [dbo].[BAINOP] ON;
INSERT [dbo].[BAINOP] ([MaBaiNop], [MaBaiTap], [NoiDung], [NgayNop], [Diem], [NhanXet], [TrangThai], [MaSinhVien], [SoLanLamBai], [DaXemGiaiThich]) VALUES (1, 25, N'{"isExam":true,"sections":[{"sectionIdx":0,"type":"Nối từ","questions":[{"questionIdx":0,"type":"Nối từ","chosenAnswer":"dog|||cat","correctAnswer":"cat|||dog","score":10}]}]}', '2026-07-08T09:35:29.810Z', 10, NULL, N'Đã chấm', 4, 1, 0);
INSERT [dbo].[BAINOP] ([MaBaiNop], [MaBaiTap], [NoiDung], [NgayNop], [Diem], [NhanXet], [TrangThai], [MaSinhVien], [SoLanLamBai], [DaXemGiaiThich]) VALUES (3, 4, N'{"isExam":false,"questions":[{"questionIdx":0,"type":"Nghe audio trắc nghiệm","chosenAnswer":"","correctAnswer":"C","score":0},{"questionIdx":1,"type":"Nghe audio trắc nghiệm","chosenAnswer":"C","correctAnswer":"A","score":0}]}', '2026-07-08T09:49:33.290Z', 0, NULL, N'Đã chấm', 6, 2, 0);
INSERT [dbo].[BAINOP] ([MaBaiNop], [MaBaiTap], [NoiDung], [NgayNop], [Diem], [NhanXet], [TrangThai], [MaSinhVien], [SoLanLamBai], [DaXemGiaiThich]) VALUES (6, 16, N'{"isExam":false,"questions":[{"questionIdx":0,"type":"Sắp xếp câu thành đoạn văn","sentences":["First, I woke up early in the morning.","Then, I brushed my teeth and had a healthy breakfast.","After that, I rode my bicycle to school.","Finally, I attended all my classes and went back home."],"score":10}]}', '2026-07-08T10:13:25.993Z', 10, NULL, N'Đã chấm', 29, 3, 0);
INSERT [dbo].[BAINOP] ([MaBaiNop], [MaBaiTap], [NoiDung], [NgayNop], [Diem], [NhanXet], [TrangThai], [MaSinhVien], [SoLanLamBai], [DaXemGiaiThich]) VALUES (9, 4, N'{"isExam":false,"questions":[{"questionIdx":0,"type":"Nghe audio trắc nghiệm","chosenAnswer":"C","correctAnswer":"C","score":10},{"questionIdx":1,"type":"Nghe audio trắc nghiệm","chosenAnswer":"B","correctAnswer":"A","score":0}]}', '2026-07-08T10:24:17.107Z', 5, NULL, N'Đã chấm', 29, 3, 0);
INSERT [dbo].[BAINOP] ([MaBaiNop], [MaBaiTap], [NoiDung], [NgayNop], [Diem], [NhanXet], [TrangThai], [MaSinhVien], [SoLanLamBai], [DaXemGiaiThich]) VALUES (13, 5, N'{"isExam":false,"questions":[{"questionIdx":0,"type":"Hình ảnh chọn đáp án","chosenAnswer":"C","correctAnswer":"A","score":0}]}', '2026-07-08T11:20:46.120Z', 0, NULL, N'Đã chấm', 29, 3, 1);
INSERT [dbo].[BAINOP] ([MaBaiNop], [MaBaiTap], [NoiDung], [NgayNop], [Diem], [NhanXet], [TrangThai], [MaSinhVien], [SoLanLamBai], [DaXemGiaiThich]) VALUES (14, 6, N'{"isExam":false,"questions":[{"questionIdx":0,"type":"Nghe chép chính tả","essayText":"","correctText":"Practice makes perfect.","score":0}]}', '2026-07-08T11:29:49.847Z', 0, NULL, N'Đã chấm', 29, 1, 1);
INSERT [dbo].[BAINOP] ([MaBaiNop], [MaBaiTap], [NoiDung], [NgayNop], [Diem], [NhanXet], [TrangThai], [MaSinhVien], [SoLanLamBai], [DaXemGiaiThich]) VALUES (16, 7, N'{"isExam":false,"questions":[{"questionIdx":0,"type":"Điền từ vào đoạn văn","fillInAnswers":[],"correctAnswers":["book","pen"],"score":0}]}', '2026-07-08T16:08:18.810Z', 0, NULL, N'Đã chấm', 29, 2, 1);
INSERT [dbo].[BAINOP] ([MaBaiNop], [MaBaiTap], [NoiDung], [NgayNop], [Diem], [NhanXet], [TrangThai], [MaSinhVien], [SoLanLamBai], [DaXemGiaiThich]) VALUES (17, 8, N'{"isExam":false,"questions":[{"questionIdx":0,"type":"Luyện phát âm (check phát âm tự động)","spokenText":"hello","correctText":"Hello, nice to meet you. How are you today?","score":1.1}]}', '2026-07-08T16:21:39.447Z', 1.1, NULL, N'Đã chấm', 29, 1, 1);
SET IDENTITY_INSERT [dbo].[BAINOP] OFF;
GO

-- Dumping Data for [dbo].[BAITAP]
SET IDENTITY_INSERT [dbo].[BAITAP] ON;
INSERT [dbo].[BAITAP] ([MaBaiTap], [TieuDe], [NgayTao], [NoiDung], [CauHoi], [LinkAmThanh], [HienThiDapAn], [MaBaiHoc], [TrangThaiDuyet], [HocThuMienPhi], [LaBaiKiemTra], [TrangThai], [KyNang], [DangBai], [FileDinhKem], [MaNguoiDung], [HanNop]) VALUES (1, N'duyet demo', N'2026-07-07', N'{"isExam":false,"duration":null,"startTime":null,"deadline":null,"openingMode":null,"isOpened":true,"sections":[{"type":"listening-mcq","title":"Phần 1: Nghe trắc nghiệm","audioUrl":"","questions":[{"question":"","answers":["","","",""],"correct":"A","explanation":"","prompt":"lnsdflcbafibaf"}]}]}', N'', N'', 0, NULL, N'Chờ duyệt', 0, 0, N'pending', N'Tổng hợp', N'Tổng hợp', NULL, NULL, NULL);
INSERT [dbo].[BAITAP] ([MaBaiTap], [TieuDe], [NgayTao], [NoiDung], [CauHoi], [LinkAmThanh], [HienThiDapAn], [MaBaiHoc], [TrangThaiDuyet], [HocThuMienPhi], [LaBaiKiemTra], [TrangThai], [KyNang], [DangBai], [FileDinhKem], [MaNguoiDung], [HanNop]) VALUES (4, N'1. Nghe audio trắc nghiệm - TOEIC Part 1', N'2026-07-07', N'{"description":"Nghe đoạn hội thoại và chọn đáp án chính xác nhất.","deadline":"2026-07-20T23:59:00.000Z","imageUrl":"","audioUrl":""}', N'[{"question":"Where is the conversation taking place?","answers":["At an airport","At a train station","At a hotel desk","At a restaurant"],"correct":"C","explanation":"Người nói đề cập đến việc đặt phòng (booking) và nhận chìa khóa phòng."},{"question":"What is the problem?","answers":["The room is not ready","The key is lost","The reservation is cancelled","The price is too high"],"correct":"A","explanation":"Nhân viên lễ tân thông báo phòng vẫn đang được dọn dẹp."}]', N'/uploads/audio_sample.mp3', 0, NULL, N'Đã duyệt', 0, 0, N'Đang sử dụng', N'Listening', N'Nghe audio trắc nghiệm', NULL, NULL, '2026-07-20T23:59:00.000Z');
INSERT [dbo].[BAITAP] ([MaBaiTap], [TieuDe], [NgayTao], [NoiDung], [CauHoi], [LinkAmThanh], [HienThiDapAn], [MaBaiHoc], [TrangThaiDuyet], [HocThuMienPhi], [LaBaiKiemTra], [TrangThai], [KyNang], [DangBai], [FileDinhKem], [MaNguoiDung], [HanNop]) VALUES (5, N'2. Hình ảnh chọn đáp án - Animals', N'2026-07-07', N'{"description":"Nhìn vào ảnh minh họa và chọn tên con vật chính xác.","deadline":"2026-07-20T23:59:00.000Z","imageUrl":"","audioUrl":""}', N'[{"imageUrl":"/uploads/dolphin.jpg","audioUrl":"/uploads/dolphin_sound.mp3","question":"Con vật trong hình là gì?","answers":["Dolphin (Cá heo)","Shark (Cá mập)","Whale (Cá voi)","Octopus (Bạch tuộc)"],"correct":"A","explanation":"Hình ảnh hiển thị một chú cá heo đang bơi."}]', NULL, 0, NULL, N'Đã duyệt', 0, 0, N'Đang sử dụng', N'Listening', N'Hình ảnh chọn đáp án', NULL, NULL, '2026-07-20T23:59:00.000Z');
INSERT [dbo].[BAITAP] ([MaBaiTap], [TieuDe], [NgayTao], [NoiDung], [CauHoi], [LinkAmThanh], [HienThiDapAn], [MaBaiHoc], [TrangThaiDuyet], [HocThuMienPhi], [LaBaiKiemTra], [TrangThai], [KyNang], [DangBai], [FileDinhKem], [MaNguoiDung], [HanNop]) VALUES (6, N'3. Nghe chép chính tả - Sentence dictation', N'2026-07-07', N'{"description":"Nghe file âm thanh và chép lại chính xác câu bạn nghe được.","deadline":"2026-07-20T23:59:00.000Z","imageUrl":"","audioUrl":""}', N'[{"audioUrl":"/uploads/dictation_sample.mp3","text":"Practice makes perfect."}]', N'/uploads/dictation_sample.mp3', 0, NULL, N'Đã duyệt', 0, 0, N'Đang sử dụng', N'Listening', N'Nghe chép chính tả', NULL, NULL, '2026-07-20T23:59:00.000Z');
INSERT [dbo].[BAITAP] ([MaBaiTap], [TieuDe], [NgayTao], [NoiDung], [CauHoi], [LinkAmThanh], [HienThiDapAn], [MaBaiHoc], [TrangThaiDuyet], [HocThuMienPhi], [LaBaiKiemTra], [TrangThai], [KyNang], [DangBai], [FileDinhKem], [MaNguoiDung], [HanNop]) VALUES (7, N'4. Điền từ vào đoạn văn - Short story gap fill', N'2026-07-07', N'{"description":"Nghe và điền các từ còn thiếu vào ô trống.","deadline":"2026-07-20T23:59:00.000Z","imageUrl":"","audioUrl":""}', N'[{"audioUrl":"/uploads/gapfill_sample.mp3","text":"I have a big [1] and a red [2] in my backpack.","fillInAnswers":["book","pen"]}]', N'/uploads/gapfill_sample.mp3', 0, NULL, N'Đã duyệt', 0, 0, N'Đang sử dụng', N'Listening', N'Điền từ vào đoạn văn', NULL, NULL, '2026-07-20T23:59:00.000Z');
INSERT [dbo].[BAITAP] ([MaBaiTap], [TieuDe], [NgayTao], [NoiDung], [CauHoi], [LinkAmThanh], [HienThiDapAn], [MaBaiHoc], [TrangThaiDuyet], [HocThuMienPhi], [LaBaiKiemTra], [TrangThai], [KyNang], [DangBai], [FileDinhKem], [MaNguoiDung], [HanNop]) VALUES (8, N'5. Luyện phát âm - Pronunciation practice', N'2026-07-07', N'{"description":"Hãy nhấn vào nút Micro và đọc to câu dưới đây.","deadline":"2026-07-20T23:59:00.000Z","imageUrl":"","audioUrl":""}', N'[{"text":"Hello, nice to meet you. How are you today?","level":"Đọc theo câu","explanation":"Chú ý phát âm đúng âm đuôi /t/ ở từ ''meet''."}]', NULL, 0, NULL, N'Đã duyệt', 0, 0, N'Đang sử dụng', N'Speaking', N'Luyện phát âm (check phát âm tự động)', NULL, NULL, '2026-07-20T23:59:00.000Z');
INSERT [dbo].[BAITAP] ([MaBaiTap], [TieuDe], [NgayTao], [NoiDung], [CauHoi], [LinkAmThanh], [HienThiDapAn], [MaBaiHoc], [TrangThaiDuyet], [HocThuMienPhi], [LaBaiKiemTra], [TrangThai], [KyNang], [DangBai], [FileDinhKem], [MaNguoiDung], [HanNop]) VALUES (9, N'6. Nói theo chủ đề - Talk about your family', N'2026-07-07', N'{"description":"Hãy ghi âm đoạn nói giới thiệu về gia đình của bạn và gửi cho giáo viên.","deadline":"2026-07-20T23:59:00.000Z","imageUrl":"","audioUrl":""}', N'[{"prompt":"Describe your family members, their ages, and their hobbies.","imageUrl":"/uploads/family.jpg"}]', NULL, 0, NULL, N'Đã duyệt', 0, 0, N'Đang sử dụng', N'Speaking', N'Nói theo chủ đề (ghi âm nộp GV)', NULL, NULL, '2026-07-20T23:59:00.000Z');
INSERT [dbo].[BAITAP] ([MaBaiTap], [TieuDe], [NgayTao], [NoiDung], [CauHoi], [LinkAmThanh], [HienThiDapAn], [MaBaiHoc], [TrangThaiDuyet], [HocThuMienPhi], [LaBaiKiemTra], [TrangThai], [KyNang], [DangBai], [FileDinhKem], [MaNguoiDung], [HanNop]) VALUES (10, N'7. Trắc nghiệm đọc hiểu - Split screen passage', N'2026-07-07', N'{"description":"Đọc kỹ đoạn văn bên trái và trả lời câu hỏi trắc nghiệm bên phải.","deadline":"2026-07-20T23:59:00.000Z","imageUrl":"","audioUrl":""}', N'[{"text":"Computers are very important in modern life. Almost every business, school, and home uses computers to store information and connect to the internet. While computers make life easier, looking at screens for too long can cause eye problems. It is recommended to take breaks every 20 minutes.","subQuestions":[{"question":"Why are computers important?","answers":["They store info and connect to internet","They are cheap","They make people lazy","They do not need power"],"correct":"A"},{"question":"What is a negative effect of using computers?","answers":["They cause eye problems","They are too fast","They have no games","They are heavy"],"correct":"A"}]}]', NULL, 0, NULL, N'Đã duyệt', 0, 0, N'Đang sử dụng', N'Reading', N'Trắc nghiệm đọc hiểu (chia đôi màn hình)', NULL, NULL, '2026-07-20T23:59:00.000Z');
INSERT [dbo].[BAITAP] ([MaBaiTap], [TieuDe], [NgayTao], [NoiDung], [CauHoi], [LinkAmThanh], [HienThiDapAn], [MaBaiHoc], [TrangThaiDuyet], [HocThuMienPhi], [LaBaiKiemTra], [TrangThai], [KyNang], [DangBai], [FileDinhKem], [MaNguoiDung], [HanNop]) VALUES (11, N'8. Nối từ - Vocabulary matching match', N'2026-07-07', N'{"description":"Ghép nối các từ tiếng Anh ở cột trái với nghĩa tiếng Việt tương ứng ở cột phải.","deadline":"2026-07-20T23:59:00.000Z","imageUrl":"","audioUrl":""}', N'[{"vocabPairs":[{"word":"Beautiful","meaning":"Xinh đẹp"},{"word":"Intelligent","meaning":"Thông minh"},{"word":"Courageous","meaning":"Dũng cảm"},{"word":"Generous","meaning":"Hào phóng"}]}]', NULL, 0, NULL, N'Đã duyệt', 0, 0, N'Đang sử dụng', N'Reading', N'Nối từ', NULL, NULL, '2026-07-20T23:59:00.000Z');
INSERT [dbo].[BAITAP] ([MaBaiTap], [TieuDe], [NgayTao], [NoiDung], [CauHoi], [LinkAmThanh], [HienThiDapAn], [MaBaiHoc], [TrangThaiDuyet], [HocThuMienPhi], [LaBaiKiemTra], [TrangThai], [KyNang], [DangBai], [FileDinhKem], [MaNguoiDung], [HanNop]) VALUES (12, N'9. Sắp xếp từ thành câu - Word order builder', N'2026-07-07', N'{"description":"Sắp xếp các từ xáo trộn thành một câu hoàn chỉnh đúng ngữ pháp.","deadline":"2026-07-20T23:59:00.000Z","imageUrl":"","audioUrl":""}', N'[{"text":"she / to / goes / school / early","correctSentence":"She goes to school early"}]', NULL, 0, NULL, N'Đã duyệt', 0, 0, N'Đang sử dụng', N'Writing', N'Sắp xếp từ thành câu', NULL, NULL, '2026-07-20T23:59:00.000Z');
INSERT [dbo].[BAITAP] ([MaBaiTap], [TieuDe], [NgayTao], [NoiDung], [CauHoi], [LinkAmThanh], [HienThiDapAn], [MaBaiHoc], [TrangThaiDuyet], [HocThuMienPhi], [LaBaiKiemTra], [TrangThai], [KyNang], [DangBai], [FileDinhKem], [MaNguoiDung], [HanNop]) VALUES (13, N'10. Trắc nghiệm - Grammar multiple choice', N'2026-07-07', N'{"description":"Chọn đáp án đúng nhất cho các câu hỏi ngữ pháp sau.","deadline":"2026-07-20T23:59:00.000Z","imageUrl":"","audioUrl":""}', N'[{"question":"She ___ playing tennis at this time yesterday.","answers":["is","was","were","been"],"correct":"B","explanation":"Thì quá khứ tiếp diễn diễn tả hành động đang diễn ra tại một thời điểm xác định trong quá khứ."}]', NULL, 0, NULL, N'Đã duyệt', 0, 0, N'Đang sử dụng', N'Grammar', N'Trắc nghiệm', NULL, NULL, '2026-07-20T23:59:00.000Z');
INSERT [dbo].[BAITAP] ([MaBaiTap], [TieuDe], [NgayTao], [NoiDung], [CauHoi], [LinkAmThanh], [HienThiDapAn], [MaBaiHoc], [TrangThaiDuyet], [HocThuMienPhi], [LaBaiKiemTra], [TrangThai], [KyNang], [DangBai], [FileDinhKem], [MaNguoiDung], [HanNop]) VALUES (14, N'11. Tìm lỗi sai - Error correction quiz', N'2026-07-07', N'{"description":"Xác định phần gạch chân chứa lỗi sai ngữ pháp và đưa ra phương án sửa lại đúng.","deadline":"2026-07-20T23:59:00.000Z","imageUrl":"","audioUrl":""}', N'[{"question":"She  go  to  school  yesterday.","correct":"go","correctSentence":"went"}]', NULL, 0, NULL, N'Đã duyệt', 0, 0, N'Đang sử dụng', N'Writing', N'Tìm lỗi sai', NULL, NULL, '2026-07-20T23:59:00.000Z');
INSERT [dbo].[BAITAP] ([MaBaiTap], [TieuDe], [NgayTao], [NoiDung], [CauHoi], [LinkAmThanh], [HienThiDapAn], [MaBaiHoc], [TrangThaiDuyet], [HocThuMienPhi], [LaBaiKiemTra], [TrangThai], [KyNang], [DangBai], [FileDinhKem], [MaNguoiDung], [HanNop]) VALUES (15, N'12. Viết đoạn văn ngắn - Paragraph essay writing', N'2026-07-07', N'{"description":"Viết một đoạn văn ngắn khoảng 50-80 từ để trả lời câu hỏi dưới đây.","deadline":"2026-07-20T23:59:00.000Z","imageUrl":"","audioUrl":""}', N'[{"prompt":"What is your favorite hobby and why do you like it?"}]', NULL, 0, NULL, N'Đã duyệt', 0, 0, N'Đang sử dụng', N'Writing', N'Viết đoạn văn ngắn', NULL, NULL, '2026-07-20T23:59:00.000Z');
INSERT [dbo].[BAITAP] ([MaBaiTap], [TieuDe], [NgayTao], [NoiDung], [CauHoi], [LinkAmThanh], [HienThiDapAn], [MaBaiHoc], [TrangThaiDuyet], [HocThuMienPhi], [LaBaiKiemTra], [TrangThai], [KyNang], [DangBai], [FileDinhKem], [MaNguoiDung], [HanNop]) VALUES (16, N'13. Sắp xếp câu thành đoạn văn - Sentence sequencing', N'2026-07-07', N'{"description":"Hãy kéo thả các câu dưới đây vào đúng thứ tự để tạo nên một câu chuyện logic.","deadline":"2026-07-20T23:59:00.000Z","imageUrl":"","audioUrl":""}', N'[{"sentences":["First, I woke up early in the morning.","Then, I brushed my teeth and had a healthy breakfast.","After that, I rode my bicycle to school.","Finally, I attended all my classes and went back home."]}]', NULL, 0, NULL, N'Đã duyệt', 0, 0, N'Đang sử dụng', N'Writing', N'Sắp xếp câu thành đoạn văn', NULL, NULL, '2026-07-20T23:59:00.000Z');
INSERT [dbo].[BAITAP] ([MaBaiTap], [TieuDe], [NgayTao], [NoiDung], [CauHoi], [LinkAmThanh], [HienThiDapAn], [MaBaiHoc], [TrangThaiDuyet], [HocThuMienPhi], [LaBaiKiemTra], [TrangThai], [KyNang], [DangBai], [FileDinhKem], [MaNguoiDung], [HanNop]) VALUES (25, N'Demo Anh X n', N'2026-07-07', N'{"isExam":false,"duration":null,"startTime":null,"deadline":null,"openingMode":null,"isOpened":true,"sections":[{"type":"Nối từ","title":"Nối","audioUrl":"","questions":[{"question":"","answers":["","","",""],"correct":"A","explanation":"","audioUrl":"","imageUrl":"","text":"","prompt":"","vocabPairs":[{"word":"cat","meaning":"mèo meo"},{"word":"dog","meaning":"nà ná"}],"fillInAnswers":[],"sentences":[""]}],"content":""}]}', N'', N'', 0, NULL, N'Đã duyệt', 0, 0, N'published', N'Tổng hợp', N'Tổng hợp', NULL, 6, NULL);
INSERT [dbo].[BAITAP] ([MaBaiTap], [TieuDe], [NgayTao], [NoiDung], [CauHoi], [LinkAmThanh], [HienThiDapAn], [MaBaiHoc], [TrangThaiDuyet], [HocThuMienPhi], [LaBaiKiemTra], [TrangThai], [KyNang], [DangBai], [FileDinhKem], [MaNguoiDung], [HanNop]) VALUES (29, N'Demo Luyện âm', N'2026-07-07', N'{"isExam":false,"duration":null,"startTime":null,"deadline":null,"openingMode":null,"isOpened":true,"sections":[{"type":"Luyện phát âm (check phát âm tự động)","title":"Luyện âm","audioUrl":"","questions":[{"question":"","answers":["","","",""],"correct":"A","explanation":"","audioUrl":"","imageUrl":"","text":"Hello every body","prompt":"","vocabPairs":[{"word":"","meaning":""}],"fillInAnswers":[],"sentences":[""]},{"question":"","answers":["","","",""],"correct":"A","explanation":"","audioUrl":"","imageUrl":"","text":"Xin chao cac bạn","prompt":"","vocabPairs":[{"word":"","meaning":""}],"fillInAnswers":[],"sentences":[""],"correctSentence":"","subQuestions":[{"question":"","answers":["","","",""],"correct":"A","explanation":""}]}],"content":""}]}', N'', N'', 0, NULL, N'Đã duyệt', 0, 0, N'published', N'Tổng hợp', N'Tổng hợp', NULL, 6, NULL);
INSERT [dbo].[BAITAP] ([MaBaiTap], [TieuDe], [NgayTao], [NoiDung], [CauHoi], [LinkAmThanh], [HienThiDapAn], [MaBaiHoc], [TrangThaiDuyet], [HocThuMienPhi], [LaBaiKiemTra], [TrangThai], [KyNang], [DangBai], [FileDinhKem], [MaNguoiDung], [HanNop]) VALUES (30, N'Demo XN điền từ', N'2026-07-07', N'{"isExam":false,"duration":null,"startTime":null,"deadline":null,"openingMode":null,"isOpened":true,"sections":[{"type":"Điền từ vào đoạn văn","title":"Điền từ","audioUrl":"","questions":[{"question":"","answers":["","","",""],"correct":"A","explanation":"","audioUrl":"","imageUrl":"","text":"<span style=\"font-family: &quot;Courier New&quot;, monospace; font-size: 11px;\">Yesterday I went to the [1] and bought some [2] to eat</span>","prompt":"","vocabPairs":[{"word":"","meaning":""}],"fillInAnswers":["supermarket","apples"],"sentences":[""]}],"content":""}]}', N'', N'', 0, NULL, N'Đã duyệt', 0, 0, N'published', N'Tổng hợp', N'Tổng hợp', NULL, 6, NULL);
INSERT [dbo].[BAITAP] ([MaBaiTap], [TieuDe], [NgayTao], [NoiDung], [CauHoi], [LinkAmThanh], [HienThiDapAn], [MaBaiHoc], [TrangThaiDuyet], [HocThuMienPhi], [LaBaiKiemTra], [TrangThai], [KyNang], [DangBai], [FileDinhKem], [MaNguoiDung], [HanNop]) VALUES (31, N'Demo XN Trắc nghiệm đọc hiểu', N'2026-07-07', N'{"isExam":false,"duration":null,"startTime":null,"deadline":null,"openingMode":null,"isOpened":true,"sections":[{"type":"Trắc nghiệm đọc hiểu (chia đôi màn hình)","title":"Phần 1: Nghe trắc nghiệm","audioUrl":"","questions":[{"question":"","answers":["","","",""],"correct":"A","explanation":"","audioUrl":"","imageUrl":"","text":"<span style=\"font-family: &quot;Courier New&quot;, monospace; font-size: 11px;\">This is the reading passage text. You can write paragraphs here...</span>","prompt":"","vocabPairs":[{"word":"","meaning":""}],"fillInAnswers":[],"sentences":[""],"subQuestions":[{"question":"What is this passage about?","answers":["a dakd","b slkf","c msf","d fkmafpa"],"correct":"A","explanation":""}]}],"content":""}]}', N'', N'', 0, NULL, N'Đã duyệt', 0, 0, N'published', N'Tổng hợp', N'Tổng hợp', NULL, 6, NULL);
INSERT [dbo].[BAITAP] ([MaBaiTap], [TieuDe], [NgayTao], [NoiDung], [CauHoi], [LinkAmThanh], [HienThiDapAn], [MaBaiHoc], [TrangThaiDuyet], [HocThuMienPhi], [LaBaiKiemTra], [TrangThai], [KyNang], [DangBai], [FileDinhKem], [MaNguoiDung], [HanNop]) VALUES (32, N'Demo XN tìm lỗi sai', N'2026-07-07', N'{"isExam":false,"duration":null,"startTime":null,"deadline":null,"openingMode":null,"isOpened":true,"sections":[{"type":"Tìm lỗi sai","title":"Tìm lỗi sai","audioUrl":"","questions":[{"question":"Câu 1: By the time  you  will arrive  I''ll have already left.","answers":["Câu 1: By the time","you","will arrive","I''ll have already left."],"correct":"will arrive","explanation":"","audioUrl":"","imageUrl":"","text":"","prompt":"","vocabPairs":[{"word":"","meaning":""}],"fillInAnswers":[],"sentences":[""],"correctSentence":"arrive"}],"content":""}]}', N'', N'', 0, NULL, N'Đã duyệt', 0, 0, N'published', N'Tổng hợp', N'Tổng hợp', NULL, 6, NULL);
INSERT [dbo].[BAITAP] ([MaBaiTap], [TieuDe], [NgayTao], [NoiDung], [CauHoi], [LinkAmThanh], [HienThiDapAn], [MaBaiHoc], [TrangThaiDuyet], [HocThuMienPhi], [LaBaiKiemTra], [TrangThai], [KyNang], [DangBai], [FileDinhKem], [MaNguoiDung], [HanNop]) VALUES (38, N'Demo XN Nối 2', N'2026-07-08', N'{"isExam":false,"duration":null,"startTime":null,"deadline":null,"openingMode":null,"isOpened":true,"sections":[{"type":"Nối từ","title":"Phần 1: Nghe trắc nghiệm","audioUrl":"","questions":[{"question":"","answers":["","","",""],"correct":"A","explanation":"","audioUrl":"","imageUrl":"","text":"","prompt":"","vocabPairs":[{"word":"a dép","meaning":"haha"},{"word":"a city","meaning":"binz"}],"fillInAnswers":[],"sentences":[""]}],"content":""}]}', N'', N'', 0, NULL, N'Đã duyệt', 0, 0, N'published', N'Tổng hợp', N'Tổng hợp', NULL, 6, NULL);
INSERT [dbo].[BAITAP] ([MaBaiTap], [TieuDe], [NgayTao], [NoiDung], [CauHoi], [LinkAmThanh], [HienThiDapAn], [MaBaiHoc], [TrangThaiDuyet], [HocThuMienPhi], [LaBaiKiemTra], [TrangThai], [KyNang], [DangBai], [FileDinhKem], [MaNguoiDung], [HanNop]) VALUES (43, N'Demo XN Nghe TN', N'2026-07-08', N'{"isExam":false,"duration":null,"startTime":null,"deadline":null,"openingMode":null,"isOpened":true,"sections":[{"type":"Nghe audio trắc nghiệm","title":"Nghe audio trắc nghiệm","audioUrl":"/uploads/1783480132857-desifreemusic-cheerful-trombone-and-trumpet-march-432177.mp3","questions":[{"question":"","answers":["","","",""],"correct":"A","explanation":"","prompt":"<span style=\"font-family: &quot;Courier New&quot;, monospace; font-size: 11px;\">Ngữ cảnh: Dialogue between a student and a teacher.</span>","subQuestions":[{"question":"Câu 1: What does the student need help with?","answers":["Homework","an d","andad","jadkjabda"],"correct":"A","explanation":""},{"question":"When is the deadline?","answers":["Today","knadlkand","a đa ạkd","ưbdwbdwdb"],"correct":"A","explanation":""}]}]}]}', N'', N'/uploads/1783480132857-desifreemusic-cheerful-trombone-and-trumpet-march-432177.mp3', 0, NULL, N'Đã duyệt', 0, 0, N'published', N'Tổng hợp', N'Tổng hợp', NULL, 6, NULL);
INSERT [dbo].[BAITAP] ([MaBaiTap], [TieuDe], [NgayTao], [NoiDung], [CauHoi], [LinkAmThanh], [HienThiDapAn], [MaBaiHoc], [TrangThaiDuyet], [HocThuMienPhi], [LaBaiKiemTra], [TrangThai], [KyNang], [DangBai], [FileDinhKem], [MaNguoiDung], [HanNop]) VALUES (46, N'Demo XN 2 dạng', N'2026-07-08', N'{"isExam":false,"duration":null,"startTime":null,"deadline":null,"openingMode":null,"isOpened":true,"sections":[{"type":"Nghe audio trắc nghiệm","title":"Phần 1: Nghe trắc nghiệm","audioUrl":"","questions":[{"question":"","answers":["","","",""],"correct":"A","explanation":"","audioUrl":"/uploads/1783480297496-desifreemusic-cheerful-trombone-and-trumpet-march-432177.mp3","prompt":"abcdifg","subQuestions":[{"question":"What wrong with you","answers":["adknaldkad",",a đan","bưdwbd","skjbdkj"],"correct":"A","explanation":""}]}]},{"type":"Hình ảnh chọn đáp án","title":"Chọn đáp án với hình ","audioUrl":"","questions":[{"question":"","answers":["","","",""],"correct":"A","explanation":"","audioUrl":"/uploads/1783480287556-desifreemusic-cheerful-trombone-and-trumpet-march-432177.mp3"}]}]}', N'', N'', 0, NULL, N'Đã duyệt', 0, 0, N'published', N'Tổng hợp', N'Tổng hợp', NULL, 6, NULL);
INSERT [dbo].[BAITAP] ([MaBaiTap], [TieuDe], [NgayTao], [NoiDung], [CauHoi], [LinkAmThanh], [HienThiDapAn], [MaBaiHoc], [TrangThaiDuyet], [HocThuMienPhi], [LaBaiKiemTra], [TrangThai], [KyNang], [DangBai], [FileDinhKem], [MaNguoiDung], [HanNop]) VALUES (61, N'Test Exercise from Script', N'2026-07-09', N'{}', N'[]', N'', 1, NULL, N'Đã duyệt', 0, 0, N'published', N'Tổng hợp', N'Tổng hợp', NULL, NULL, NULL);
INSERT [dbo].[BAITAP] ([MaBaiTap], [TieuDe], [NgayTao], [NoiDung], [CauHoi], [LinkAmThanh], [HienThiDapAn], [MaBaiHoc], [TrangThaiDuyet], [HocThuMienPhi], [LaBaiKiemTra], [TrangThai], [KyNang], [DangBai], [FileDinhKem], [MaNguoiDung], [HanNop]) VALUES (62, N'Test Exercise from script via fetch', N'2026-07-09', N'{"isExam":false,"duration":null,"startTime":null,"deadline":null,"openingMode":null,"isOpened":true,"sections":[{"type":"Nghe audio trắc nghiệm","title":"Phần 1: Nghe trắc nghiệm","audioUrl":"","questions":[{"question":"nshadjyuyqubdasdasd","answers":["ae","ét","ertert",""],"correct":"A","explanation":""}]}]}', N'', N'', 0, NULL, N'Đã duyệt', 0, 0, N'published', N'Tổng hợp', N'Tổng hợp', NULL, 3, NULL);
INSERT [dbo].[BAITAP] ([MaBaiTap], [TieuDe], [NgayTao], [NoiDung], [CauHoi], [LinkAmThanh], [HienThiDapAn], [MaBaiHoc], [TrangThaiDuyet], [HocThuMienPhi], [LaBaiKiemTra], [TrangThai], [KyNang], [DangBai], [FileDinhKem], [MaNguoiDung], [HanNop]) VALUES (63, N'Test Exercise with MaGiangVien null', N'2026-07-09', N'{"isExam":false,"duration":null,"startTime":null,"deadline":null,"openingMode":null,"isOpened":true,"sections":[{"type":"Nghe audio trắc nghiệm","title":"Phần 1: Nghe trắc nghiệm","audioUrl":"","questions":[{"question":"nshadjyuyqubdasdasd","answers":["ae","ét","ertert",""],"correct":"A","explanation":""}]}]}', N'', N'', 0, NULL, N'Đã duyệt', 0, 0, N'published', N'Tổng hợp', N'Tổng hợp', NULL, NULL, NULL);
INSERT [dbo].[BAITAP] ([MaBaiTap], [TieuDe], [NgayTao], [NoiDung], [CauHoi], [LinkAmThanh], [HienThiDapAn], [MaBaiHoc], [TrangThaiDuyet], [HocThuMienPhi], [LaBaiKiemTra], [TrangThai], [KyNang], [DangBai], [FileDinhKem], [MaNguoiDung], [HanNop]) VALUES (64, N'Test Exercise with GiangVien MaNguoiDung = 37', N'2026-07-09', N'{"isExam":false,"duration":null,"startTime":null,"deadline":null,"openingMode":null,"isOpened":true,"sections":[{"type":"Nghe audio trắc nghiệm","title":"Phần 1: Nghe trắc nghiệm","audioUrl":"","questions":[{"question":"nshadjyuyqubdasdasd","answers":["ae","ét","ertert",""],"correct":"A","explanation":""}]}]}', N'', N'', 0, NULL, N'Chờ duyệt', 0, 0, N'pending', N'Tổng hợp', N'Tổng hợp', NULL, 37, NULL);
INSERT [dbo].[BAITAP] ([MaBaiTap], [TieuDe], [NgayTao], [NoiDung], [CauHoi], [LinkAmThanh], [HienThiDapAn], [MaBaiHoc], [TrangThaiDuyet], [HocThuMienPhi], [LaBaiKiemTra], [TrangThai], [KyNang], [DangBai], [FileDinhKem], [MaNguoiDung], [HanNop]) VALUES (65, N'Test Exercise with QTV MaNguoiDung = 6', N'2026-07-09', N'{"isExam":false,"duration":null,"startTime":null,"deadline":null,"openingMode":null,"isOpened":true,"sections":[{"type":"Nghe audio trắc nghiệm","title":"Phần 1: Nghe trắc nghiệm","audioUrl":"","questions":[{"question":"nshadjyuyqubdasdasd","answers":["ae","ét","ertert",""],"correct":"A","explanation":""}]}]}', N'', N'', 0, NULL, N'Đã duyệt', 0, 0, N'published', N'Tổng hợp', N'Tổng hợp', NULL, 6, NULL);
INSERT [dbo].[BAITAP] ([MaBaiTap], [TieuDe], [NgayTao], [NoiDung], [CauHoi], [LinkAmThanh], [HienThiDapAn], [MaBaiHoc], [TrangThaiDuyet], [HocThuMienPhi], [LaBaiKiemTra], [TrangThai], [KyNang], [DangBai], [FileDinhKem], [MaNguoiDung], [HanNop]) VALUES (68, N'Bài tập nhã tạo để test', N'2026-07-10', N'{"isExam":false,"duration":null,"startTime":null,"deadline":"2026-07-12T14:34","openingMode":null,"isOpened":true,"sections":[{"type":"Nghe audio trắc nghiệm","title":"Phần 1: Nghe trắc nghiệm","audioUrl":"/uploads/1783668835211-ÄoaÌ£n-8.m4a","questions":[{"question":"","answers":["","","",""],"correct":"A","explanation":"","subQuestions":[{"question":"ai là người tốt bụng","answers":["a","b","c","d"],"correct":"A","explanation":""}]}]}]}', N'', N'/uploads/1783668835211-ÄoaÌ£n-8.m4a', 0, 52, N'Đã duyệt', 0, 0, N'published', N'Tổng hợp', N'Tổng hợp', NULL, 6, '2026-07-12T07:34:00.000Z');
INSERT [dbo].[BAITAP] ([MaBaiTap], [TieuDe], [NgayTao], [NoiDung], [CauHoi], [LinkAmThanh], [HienThiDapAn], [MaBaiHoc], [TrangThaiDuyet], [HocThuMienPhi], [LaBaiKiemTra], [TrangThai], [KyNang], [DangBai], [FileDinhKem], [MaNguoiDung], [HanNop]) VALUES (76, N'Bài nhã không tạo', N'2026-07-13', N'{"isExam":false,"duration":null,"startTime":null,"deadline":"2026-07-30T00:19","openingMode":null,"isOpened":true,"sections":[{"type":"Nghe audio trắc nghiệm","title":"Phần 1: Nghe trắc nghiệm","audioUrl":"/uploads/1783962926554-ÄoaÌ£n-8.m4a","questions":[{"question":"","answers":["","","",""],"correct":"A","explanation":"","subQuestions":[{"question":"ai là ai","answers":["A","B","C","D"],"correct":"A","explanation":""}]}]}]}', N'', N'/uploads/1783962926554-ÄoaÌ£n-8.m4a', 0, 52, N'Nháp', 0, 0, N'draft', N'Tổng hợp', N'Tổng hợp', NULL, 4, '2026-07-29T17:19:00.000Z');
INSERT [dbo].[BAITAP] ([MaBaiTap], [TieuDe], [NgayTao], [NoiDung], [CauHoi], [LinkAmThanh], [HienThiDapAn], [MaBaiHoc], [TrangThaiDuyet], [HocThuMienPhi], [LaBaiKiemTra], [TrangThai], [KyNang], [DangBai], [FileDinhKem], [MaNguoiDung], [HanNop]) VALUES (77, N'tet 14/7 1', N'2026-07-14', N'{"isExam":false,"duration":null,"startTime":null,"deadline":"2026-07-24T09:19","openingMode":null,"isOpened":true,"sections":[{"type":"Nghe audio trắc nghiệm","title":"Phần 1: Nghe trắc nghiệm","audioUrl":"","questions":[{"question":"","answers":["","","",""],"correct":"A","explanation":"","audioUrl":"/uploads/1783995411392-Audio_2.m4a","prompt":"mô tả","subQuestions":[{"question":"What does the student need help with?","answers":["1","2","3","4"],"correct":"A","explanation":"ko"},{"question":"What does the student need help with?","answers":["5","6","7","8"],"correct":"A","explanation":"ko"}]},{"question":"","answers":["","","",""],"correct":"A","explanation":"","audioUrl":"/uploads/1783995541557-Audio_2.m4a","imageUrl":"","text":"","prompt":"<span style=\"font-family: &quot;Courier New&quot;, monospace; font-size: 11px;\">What does the student need help with?</span>","vocabPairs":[{"word":"","meaning":""}],"fillInAnswers":[],"sentences":[""],"correctSentence":"","subQuestions":[{"question":"12","answers":["13","14","15","16"],"correct":"A","explanation":"ko"},{"question":"What does the student need help with?","answers":["22","26","23","21"],"correct":"A","explanation":""}]}]}]}', N'', N'', 0, 139, N'Đã duyệt', 0, 0, N'Đã duyệt', N'Tổng hợp', N'Tổng hợp', NULL, 6, '2026-07-24T02:19:00.000Z');
SET IDENTITY_INSERT [dbo].[BAITAP] OFF;
GO

-- Dumping Data for [dbo].[BUOIHOC]
SET IDENTITY_INSERT [dbo].[BUOIHOC] ON;
INSERT [dbo].[BUOIHOC] ([MaBuoiHoc], [TenBuoiHoc], [MaLopHoc], [MoTa], [NgayBatDau], [NgayKetThuc], [ThuTu], [TrangThai]) VALUES (36, N'Buổi 1: Ngữ pháp căn bản', 18, N'Học viên bắt đầu học các ngữ pháp cơ bản', '2026-07-01T00:00:00.000Z', '2026-07-01T00:00:00.000Z', 1, N'Đã mở');
INSERT [dbo].[BUOIHOC] ([MaBuoiHoc], [TenBuoiHoc], [MaLopHoc], [MoTa], [NgayBatDau], [NgayKetThuc], [ThuTu], [TrangThai]) VALUES (37, N'Buổi 2: Ngữ pháp nâng cao', 18, N'', NULL, NULL, 2, N'Đã mở');
INSERT [dbo].[BUOIHOC] ([MaBuoiHoc], [TenBuoiHoc], [MaLopHoc], [MoTa], [NgayBatDau], [NgayKetThuc], [ThuTu], [TrangThai]) VALUES (42, N'Buổi 6', 18, N'test để coi có bài giảng mặc định không
', NULL, NULL, 6, N'Đã mở');
INSERT [dbo].[BUOIHOC] ([MaBuoiHoc], [TenBuoiHoc], [MaLopHoc], [MoTa], [NgayBatDau], [NgayKetThuc], [ThuTu], [TrangThai]) VALUES (45, N'Buổi demo xn', 18, N'', NULL, NULL, 4, N'Đã mở');
INSERT [dbo].[BUOIHOC] ([MaBuoiHoc], [TenBuoiHoc], [MaLopHoc], [MoTa], [NgayBatDau], [NgayKetThuc], [ThuTu], [TrangThai]) VALUES (46, N'Buổi 1 - Lesson 1: Ngày ...', 21, N'LESSON OBJECTIVES
1.	Phần I: Vocabulary & Vocab Booster: 
- Vocabulary: Từ vựng theo chủ đề chung - Topic "Education"
- Vocab Booster: Bài tập về nhà - Từ vựng theo chủ đề Học thuật
2.	Phần II: Pronunciation - Học phát âm các nguyên âm ngắn (Short vowels)
3.	Phần III: Overview of VSTEP - Cấu trúc và cách tính điểm bài thi VSTEP
4.	Phần IV: VSTEP Skill Strategy 
- Kỹ năng Nghe - Part 1 (Dạng bài thông báo ngắn)', NULL, NULL, 1, N'Chờ mở');
INSERT [dbo].[BUOIHOC] ([MaBuoiHoc], [TenBuoiHoc], [MaLopHoc], [MoTa], [NgayBatDau], [NgayKetThuc], [ThuTu], [TrangThai]) VALUES (47, N'Buổi 1: Làm quen', 23, N'Trao đổi thông tin', NULL, NULL, 1, N'Chờ mở');
SET IDENTITY_INSERT [dbo].[BUOIHOC] OFF;
GO

-- Dumping Data for [dbo].[DANGKYKHOAHOC]
SET IDENTITY_INSERT [dbo].[DANGKYKHOAHOC] ON;
INSERT [dbo].[DANGKYKHOAHOC] ([MaDangKy], [MaKhoaHoc], [NgayDangKy], [TrangThai], [MaSinhVien]) VALUES (5, 1, '2026-03-17T09:44:49.613Z', N'Đã đăng ký', 21);
INSERT [dbo].[DANGKYKHOAHOC] ([MaDangKy], [MaKhoaHoc], [NgayDangKy], [TrangThai], [MaSinhVien]) VALUES (8, 1, '2026-03-19T11:22:43.910Z', N'Đã ghi danh', 1);
INSERT [dbo].[DANGKYKHOAHOC] ([MaDangKy], [MaKhoaHoc], [NgayDangKy], [TrangThai], [MaSinhVien]) VALUES (9, 1, '2026-03-19T11:22:43.910Z', N'Đã ghi danh', 2);
INSERT [dbo].[DANGKYKHOAHOC] ([MaDangKy], [MaKhoaHoc], [NgayDangKy], [TrangThai], [MaSinhVien]) VALUES (10, 1, '2026-03-19T11:22:43.910Z', N'Đã ghi danh', 3);
INSERT [dbo].[DANGKYKHOAHOC] ([MaDangKy], [MaKhoaHoc], [NgayDangKy], [TrangThai], [MaSinhVien]) VALUES (11, 1, '2026-03-19T11:22:43.910Z', N'Đã ghi danh', 4);
INSERT [dbo].[DANGKYKHOAHOC] ([MaDangKy], [MaKhoaHoc], [NgayDangKy], [TrangThai], [MaSinhVien]) VALUES (12, 1, '2026-03-19T11:22:43.910Z', N'Đã ghi danh', 5);
INSERT [dbo].[DANGKYKHOAHOC] ([MaDangKy], [MaKhoaHoc], [NgayDangKy], [TrangThai], [MaSinhVien]) VALUES (13, 1, '2026-03-19T11:22:43.910Z', N'Đã ghi danh', 6);
INSERT [dbo].[DANGKYKHOAHOC] ([MaDangKy], [MaKhoaHoc], [NgayDangKy], [TrangThai], [MaSinhVien]) VALUES (14, 1, '2026-03-19T11:22:43.910Z', N'Đã ghi danh', 7);
INSERT [dbo].[DANGKYKHOAHOC] ([MaDangKy], [MaKhoaHoc], [NgayDangKy], [TrangThai], [MaSinhVien]) VALUES (15, 1, '2026-03-19T11:22:43.910Z', N'Đã ghi danh', 8);
INSERT [dbo].[DANGKYKHOAHOC] ([MaDangKy], [MaKhoaHoc], [NgayDangKy], [TrangThai], [MaSinhVien]) VALUES (16, 1, '2026-03-19T11:22:43.910Z', N'Đã ghi danh', 9);
INSERT [dbo].[DANGKYKHOAHOC] ([MaDangKy], [MaKhoaHoc], [NgayDangKy], [TrangThai], [MaSinhVien]) VALUES (17, 1, '2026-03-19T11:22:43.910Z', N'Đã ghi danh', 10);
INSERT [dbo].[DANGKYKHOAHOC] ([MaDangKy], [MaKhoaHoc], [NgayDangKy], [TrangThai], [MaSinhVien]) VALUES (18, 1, '2026-03-19T11:22:43.910Z', N'Đã ghi danh', 11);
INSERT [dbo].[DANGKYKHOAHOC] ([MaDangKy], [MaKhoaHoc], [NgayDangKy], [TrangThai], [MaSinhVien]) VALUES (19, 1, '2026-03-19T11:22:43.910Z', N'Đã ghi danh', 12);
INSERT [dbo].[DANGKYKHOAHOC] ([MaDangKy], [MaKhoaHoc], [NgayDangKy], [TrangThai], [MaSinhVien]) VALUES (20, 1, '2026-03-19T11:22:43.910Z', N'Đã ghi danh', 13);
INSERT [dbo].[DANGKYKHOAHOC] ([MaDangKy], [MaKhoaHoc], [NgayDangKy], [TrangThai], [MaSinhVien]) VALUES (21, 1, '2026-03-19T11:22:43.910Z', N'Đã ghi danh', 14);
INSERT [dbo].[DANGKYKHOAHOC] ([MaDangKy], [MaKhoaHoc], [NgayDangKy], [TrangThai], [MaSinhVien]) VALUES (22, 1, '2026-03-19T11:22:43.910Z', N'Đã ghi danh', 15);
INSERT [dbo].[DANGKYKHOAHOC] ([MaDangKy], [MaKhoaHoc], [NgayDangKy], [TrangThai], [MaSinhVien]) VALUES (23, 1, '2026-03-19T11:22:43.910Z', N'Đã ghi danh', 16);
INSERT [dbo].[DANGKYKHOAHOC] ([MaDangKy], [MaKhoaHoc], [NgayDangKy], [TrangThai], [MaSinhVien]) VALUES (24, 1, '2026-03-19T11:22:43.910Z', N'Đã ghi danh', 17);
INSERT [dbo].[DANGKYKHOAHOC] ([MaDangKy], [MaKhoaHoc], [NgayDangKy], [TrangThai], [MaSinhVien]) VALUES (25, 1, '2026-03-19T11:22:43.910Z', N'Đã ghi danh', 18);
INSERT [dbo].[DANGKYKHOAHOC] ([MaDangKy], [MaKhoaHoc], [NgayDangKy], [TrangThai], [MaSinhVien]) VALUES (26, 1, '2026-03-19T11:22:43.910Z', N'Đã ghi danh', 19);
INSERT [dbo].[DANGKYKHOAHOC] ([MaDangKy], [MaKhoaHoc], [NgayDangKy], [TrangThai], [MaSinhVien]) VALUES (27, 1, '2026-03-19T11:22:43.910Z', N'Đã ghi danh', 20);
INSERT [dbo].[DANGKYKHOAHOC] ([MaDangKy], [MaKhoaHoc], [NgayDangKy], [TrangThai], [MaSinhVien]) VALUES (28, 1, '2026-06-22T15:53:47.557Z', N'Đã đăng ký', 23);
SET IDENTITY_INSERT [dbo].[DANGKYKHOAHOC] OFF;
GO

-- Dumping Data for [dbo].[DETHI]
SET IDENTITY_INSERT [dbo].[DETHI] ON;
INSERT [dbo].[DETHI] ([MaDeThi], [TieuDe], [MoTa], [ThoiGian], [CapDo], [LoaiBai], [NoiDungDeThi], [TrangThai], [TrangThaiDuyet], [MaNguoiDung], [NgayTao], [NgayDuyet], [MaNguoiDuyet]) VALUES (22, N'Đề thi thử Nhã tạo', N'đề thi để test', 177, N'B1', N'VSTEP', N'{"listening":{"thoiGian":2700,"parts":[{"soPhan":1,"tieuDe":"Listening Part 1","huongDan":"Listen and choose the best answers.","audioUrl":"/uploads/1783497014716-ÄoaÌ£n-8.m4a","cauHois":[{"id":1,"noiDung":"ạnhery","luaChon":["A. ádasfa","B. qr","C. ảe","D. àew"],"dapAn":"B"},{"id":2,"noiDung":"ưerwrw","luaChon":["A. sfsdfs","B. ẻ","C. sfs","D. sfw"],"dapAn":"A"}],"audioName":"đoạn 8.m4a"}]},"reading":{"thoiGian":3600,"parts":[{"soPhan":1,"tieuDe":"Reading Part 1","huongDan":"Read the passage and choose the best answers.","doanVan":"Unrequited love is perhaps the most bittersweet of all human experiences. It is a quiet, solitary journey, where you become a spectator to a life you desperately want to be a part of, yet know you never will. You find yourself memorizing their laughter, cataloging their habits, and finding meaning in brief glances that they likely give without a second thought. It is a persistent ache—a feeling of being deeply connected to someone who is essentially a stranger to your inner world. You build a cathedral of hopes in your mind, meticulously decorating it with dreams of \"what if,\" all while bracing for the inevitable realization that the door will never open. Ultimately, unrequited love is an act of profound courage and silent sacrifice; you choose to hold onto a flickering flame, knowing that it provides warmth only to you, while the one you love remains completely unaware of the light you have carried for them.","cauHois":[{"id":1,"noiDung":"mjiwurhf","luaChon":["A. f","B. ẻ","C. ád","D. ewr"],"dapAn":"A"},{"id":2,"noiDung":"ưtegdvdhtdhrty","luaChon":["A. 4","B. ừ","C. 46","D. 43543"],"dapAn":"A"}]}]},"writing":{"thoiGian":3600,"parts":[{"soPhan":1,"tieuDe":"Writing Part 1","huongDan":"You should spend about 20 minutes on this task.","yeuCau":"Email","noiDung":"viết email cho người yêu cũ xin quay lại","soTuToiThieu":120}]},"speaking":{"thoiGian":720,"parts":[{"soPhan":1,"tieuDe":"Speaking Part 1","moTa":"Speaking practice","audioUrl":"","noiDung":"nói lời quay lại với người yêu cũ vì bạn là một con bò","thoiGianChuanBi":60,"thoiGianNoi":720,"imageUrl":"/uploads/1783497188715-z7309130782389_0b10197d6ba7b83e92f7a1813f607755.jpg","imageName":"z7309130782389_0b10197d6ba7b83e92f7a1813f607755.jpg"}]}}', N'draft', N'Đã duyệt', 4, '2026-07-10T11:10:00.137Z', NULL, NULL);
INSERT [dbo].[DETHI] ([MaDeThi], [TieuDe], [MoTa], [ThoiGian], [CapDo], [LoaiBai], [NoiDungDeThi], [TrangThai], [TrangThaiDuyet], [MaNguoiDung], [NgayTao], [NgayDuyet], [MaNguoiDuyet]) VALUES (23, N'Test 1 (by Hang)', N'abc', 177, N'B1', N'VSTEP', N'{"listening":{"thoiGian":2700,"parts":[{"soPhan":1,"tieuDe":"Listening Part 1","huongDan":"Listen and choose the best answers.","audioUrl":"/uploads/1784078768859-Task-1.mp3","cauHois":[],"audioName":"Task 1.mp3"},{"soPhan":2,"tieuDe":"Listening Part 2","huongDan":"Nghe đoạn băng và trả lời các câu hỏi.","audioUrl":"","cauHois":[]}]},"reading":{"thoiGian":3600,"parts":[{"soPhan":1,"tieuDe":"Reading Part 1","huongDan":"<b>Read the passage and choose the best answers.</b>","doanVan":"<p class=\"MsoNormal\"><span lang=\"VI\">Basic to any understanding of Canada in 20 years after the Second World\nWar is the country''s impressive population growth. For every three Canadians in\n1945, there were over <u>five</u> in 1996. In September 1966 Canada''s\npopulation passed the 20 million mark. Most of this <b><u>surging</u> </b>growth\ncame from natural increase. The depression of the 1930''s and the war had held\nback marriages and the catching – up process began after 1945. The baby boom\ncontinued through the decade of the 1950''s, producing a population increase of\nnearly fifteen percent in the five years from 1951 to 1956. This rate of\nincrease had been exceeded only once before in Canada''s history, in the decade\nbefore 1911, when the prairies were being settled. Undoubtedly, the good\neconomic conditions of the 1950''s supported a growth in the population, but the\nexpansion also derived from a <u>trend</u> toward earlier marriages\nand an increase in the average size of families. In 1957 the Canadian birth\nrate stood at 28 per thousand, one of the highest in the world.<o:p></o:p></span></p>\n\n<p class=\"MsoNormal\"><span lang=\"VI\">After the <u>peak</u> year of 1957, the birth rate in Canada\nbegan to decline. It continued falling until in 1966 it stood at the lowest\nlevel in 25 years. Partly this decline reflected the low level of births during\nthe depression and the war, but it was also caused by changes in Canadian\nsociety. Young people were staying at school longer, more women were working,\nyoung married couples were buying automobiles or houses before starting\nfamilies, rising living standards were cutting down the size of families. It\nappeared that Canada was once more falling in step with the trend toward\nsmaller families that had occurred all through the Western world since the time\nof the Industrial Revolution.<o:p></o:p></span></p>\n\n<p class=\"MsoNormal\"><span lang=\"VI\">Although the growth in Canada''s population has slowed down by 1966(the\nincrease in the first half of the 1960''s was only nine percent). Another large\npopulation wave was coming over the horizon. <b><u>It</u> </b>would be\ncomposed of the children of the children who were born during the period of the\nhigh birth rate prior to 1957.<o:p></o:p></span></p>","cauHois":[{"id":1,"noiDung":"<p class=\"MsoNormal\">1. <span lang=\"VI\">What does the\npassage mainly discuss?<o:p></o:p></span></p>","luaChon":["A.  Educational changes in Canadian society","B. Canada during the Second World War","C. Population trends in postwar Canada","D. Standards of living in Canada"],"dapAn":"A"}]}]},"writing":{"thoiGian":3600,"parts":[{"soPhan":1,"tieuDe":"Writing Part 1","huongDan":"You should spend about 20 minutes on this task.","yeuCau":"Email","noiDung":"<p class=\"MsoNormal\">You should spend about 20\nminutes on this task.<o:p></o:p></p>\n\n<p class=\"MsoNormal\">You had arranged to meet a\nfriend next week, but you have realized that you will not be able to go. Write a\nletter to your friend. In your letter:<o:p></o:p></p>\n\n<p class=\"MsoNormal\">- Cancel the meeting with your friend and apologize<o:p></o:p></p>\n\n<p class=\"MsoNormal\">- Explain why you cannot be able to meet your friend<o:p></o:p></p>\n\n<p class=\"MsoNormal\">- Suggest where and when you could see each other instead</p>\n\n<p class=\"MsoNormal\">You should write at least\n120 words. You do not need to include your name or addresses.&nbsp;<o:p></o:p></p>","soTuToiThieu":120},{"soPhan":2,"tieuDe":"Writing Part 2","huongDan":"You should spend about 20 minutes on this task. You have received this email from an English-speaking friend, Alex. Read part of his email below.","yeuCau":"Write an email responding to him, giving advice on travel routes, transportation, and accommodation. You should write at least 120 words. Do not include your name. Your response will be evaluated in terms of Task Fulfillment, Organization, Vocabulary and Grammar.","noiDung":"Write your prompt details here...","soTuToiThieu":150,"loaiBai":"Email"}]},"speaking":{"thoiGian":720,"parts":[{"soPhan":1,"tieuDe":"Speaking Part 1","moTa":"Speaking practice","audioUrl":"","noiDung":"","thoiGianChuanBi":60,"thoiGianNoi":720}]}}', N'published', N'Đã duyệt', 6, '2026-07-15T08:40:10.867Z', NULL, NULL);
SET IDENTITY_INSERT [dbo].[DETHI] OFF;
GO

-- Dumping Data for [dbo].[DETHI_SUBMISSIONS]
SET IDENTITY_INSERT [dbo].[DETHI_SUBMISSIONS] ON;
INSERT [dbo].[DETHI_SUBMISSIONS] ([MaSubmission], [MaDeThi], [MaSinhVien], [NgayNop], [DiemListening], [DiemReading], [DiemWriting], [DiemSpeaking], [NhanXetWriting], [NhanXetSpeaking], [YeuCauChamWriting], [YeuCauChamSpeaking], [BaiLamWriting], [BaiLamSpeaking], [DiemTong], [TrangThai]) VALUES (52, 23, 29, '2026-07-15T08:59:49.800Z', 0, 0, NULL, NULL, NULL, NULL, 1, 1, N'["",""]', N'["Bài nói của học viên đã được hệ thống ghi nhận thành công."]', NULL, N'Đợi chấm');
INSERT [dbo].[DETHI_SUBMISSIONS] ([MaSubmission], [MaDeThi], [MaSinhVien], [NgayNop], [DiemListening], [DiemReading], [DiemWriting], [DiemSpeaking], [NhanXetWriting], [NhanXetSpeaking], [YeuCauChamWriting], [YeuCauChamSpeaking], [BaiLamWriting], [BaiLamSpeaking], [DiemTong], [TrangThai]) VALUES (53, 22, 29, '2026-07-15T15:21:07.600Z', 0, 0, NULL, NULL, NULL, NULL, 1, 1, N'["quay lại hoặc chết"]', N'["/uploads/1784103685188-speaking-part-1-1784103684854.webm"]', NULL, N'Đợi chấm');
SET IDENTITY_INSERT [dbo].[DETHI_SUBMISSIONS] OFF;
GO

-- Dumping Data for [dbo].[GIANGVIEN]
SET IDENTITY_INSERT [dbo].[GIANGVIEN] ON;
INSERT [dbo].[GIANGVIEN] ([MaGiangVien], [MaNguoiDung], [HocVi], [ChuyenMon], [SoDienThoai], [KinhNghiem], [GioiThieu]) VALUES (1, 4, N'', N'', N'', N'', N'');
INSERT [dbo].[GIANGVIEN] ([MaGiangVien], [MaNguoiDung], [HocVi], [ChuyenMon], [SoDienThoai], [KinhNghiem], [GioiThieu]) VALUES (2, 9, N'Cử nhân', N'Tiếng Anh', N'', N'', N'');
INSERT [dbo].[GIANGVIEN] ([MaGiangVien], [MaNguoiDung], [HocVi], [ChuyenMon], [SoDienThoai], [KinhNghiem], [GioiThieu]) VALUES (3, 9, N'Cử nhân', N'Tiếng Anh', N'', N'', N'');
INSERT [dbo].[GIANGVIEN] ([MaGiangVien], [MaNguoiDung], [HocVi], [ChuyenMon], [SoDienThoai], [KinhNghiem], [GioiThieu]) VALUES (5, 33, NULL, NULL, NULL, NULL, NULL);
INSERT [dbo].[GIANGVIEN] ([MaGiangVien], [MaNguoiDung], [HocVi], [ChuyenMon], [SoDienThoai], [KinhNghiem], [GioiThieu]) VALUES (6, 37, NULL, NULL, NULL, NULL, NULL);
INSERT [dbo].[GIANGVIEN] ([MaGiangVien], [MaNguoiDung], [HocVi], [ChuyenMon], [SoDienThoai], [KinhNghiem], [GioiThieu]) VALUES (7, 42, NULL, NULL, NULL, NULL, NULL);
INSERT [dbo].[GIANGVIEN] ([MaGiangVien], [MaNguoiDung], [HocVi], [ChuyenMon], [SoDienThoai], [KinhNghiem], [GioiThieu]) VALUES (8, 62, NULL, NULL, NULL, NULL, NULL);
SET IDENTITY_INSERT [dbo].[GIANGVIEN] OFF;
GO

-- Dumping Data for [dbo].[KHOAHOC]
SET IDENTITY_INSERT [dbo].[KHOAHOC] ON;
INSERT [dbo].[KHOAHOC] ([MaKhoaHoc], [TenKhoaHoc], [MoTa], [TrinhDo], [TrangThai], [MaNguoiDung], [NgayTao], [NgayDuyet], [Listening], [Reading], [Writing], [Speaking]) VALUES (1, N'Khóa học Luyện thi TOEIC', N'Khóa học luyện thi TOEIC giúp học viên nâng cao kỹ năng Listening và Reading.', N'TOEIC FE- FOUNDATION, Khóa học TOEIC 550+', N'Hiển thị', 6, '2026-03-17T08:43:31.410Z', '2026-07-13T10:43:58.283Z', 1, 1, 1, 1);
INSERT [dbo].[KHOAHOC] ([MaKhoaHoc], [TenKhoaHoc], [MoTa], [TrinhDo], [TrangThai], [MaNguoiDung], [NgayTao], [NgayDuyet], [Listening], [Reading], [Writing], [Speaking]) VALUES (17, N'Khóa luyện thi VSTEP', N'Khóa học dành cho sinh viên có nhu cầu ôn thi VSTEP 4 kỹ năng: Nghe, Nói, Đọc, Viết', N'Beginer', N'Ẩn', 3, '2026-07-02T16:35:44.557Z', '2026-07-08T08:50:13.313Z', 1, 1, 1, 1);
INSERT [dbo].[KHOAHOC] ([MaKhoaHoc], [TenKhoaHoc], [MoTa], [TrinhDo], [TrangThai], [MaNguoiDung], [NgayTao], [NgayDuyet], [Listening], [Reading], [Writing], [Speaking]) VALUES (18, N'Khóa luyện thi TOEIC LR', N'Khóa học dành cho sinh viên có nhu cầu thi TOEIC 2 kỹ năng: Nghe, Đọc', N'450+, 650+', N'Ẩn', 3, '2026-07-02T16:37:21.583Z', '2026-07-08T08:50:14.140Z', 1, 1, 0, 0);
INSERT [dbo].[KHOAHOC] ([MaKhoaHoc], [TenKhoaHoc], [MoTa], [TrinhDo], [TrangThai], [MaNguoiDung], [NgayTao], [NgayDuyet], [Listening], [Reading], [Writing], [Speaking]) VALUES (22, N'Khóa IELTS General', N'', N'cb', N'Ẩn', 3, '2026-07-08T10:57:20.857Z', '2026-07-08T08:50:14.923Z', 1, 1, 0, 0);
INSERT [dbo].[KHOAHOC] ([MaKhoaHoc], [TenKhoaHoc], [MoTa], [TrinhDo], [TrangThai], [MaNguoiDung], [NgayTao], [NgayDuyet], [Listening], [Reading], [Writing], [Speaking]) VALUES (23, N'Khóa học B1 Builder', N'', N'B1', N'Hiển thị', 3, '2026-07-13T16:32:06.643Z', '2026-07-13T10:44:01.940Z', 1, 1, 1, 1);
INSERT [dbo].[KHOAHOC] ([MaKhoaHoc], [TenKhoaHoc], [MoTa], [TrinhDo], [TrangThai], [MaNguoiDung], [NgayTao], [NgayDuyet], [Listening], [Reading], [Writing], [Speaking]) VALUES (24, N'Khóa học B1 Exam Preparation', N'', N'B1', N'Hiển thị', 3, '2026-07-13T16:32:45.600Z', '2026-07-13T10:44:04.517Z', 1, 1, 1, 1);
INSERT [dbo].[KHOAHOC] ([MaKhoaHoc], [TenKhoaHoc], [MoTa], [TrinhDo], [TrangThai], [MaNguoiDung], [NgayTao], [NgayDuyet], [Listening], [Reading], [Writing], [Speaking]) VALUES (25, N'Khóa tu luyện võ thuật', N'tu thành 9 quả', N'đồ đệ, sư phụ', N'Hiển thị', 3, '2026-07-14T10:15:03.127Z', '2026-07-14T03:15:52.960Z', 1, 1, 1, 1);
SET IDENTITY_INSERT [dbo].[KHOAHOC] OFF;
GO

-- Dumping Data for [dbo].[KHOAHOCCHITIET]
SET IDENTITY_INSERT [dbo].[KHOAHOCCHITIET] ON;
INSERT [dbo].[KHOAHOCCHITIET] ([MaLop], [TenLop], [MoTa], [HocPhi], [ThoiLuong], [MaKhoaHoc], [TrangThai]) VALUES (1, N'Khóa học TOEIC FE- FOUNDATION', N'Khóa học dành cho người mới bắt đầu, xây nền tảng phát âm và ngữ pháp.', 1610000, N'3 tháng (24 buổi)', 1, N'Đang mở');
INSERT [dbo].[KHOAHOCCHITIET] ([MaLop], [TenLop], [MoTa], [HocPhi], [ThoiLuong], [MaKhoaHoc], [TrangThai]) VALUES (3, N'Khóa học TOEIC 550+', N'Khóa luyện thi chuyên sâu giúp đạt mục tiêu 550+.', 1930000, N'2.5 tháng (20 buổi)', 1, N'Đang mở');
INSERT [dbo].[KHOAHOCCHITIET] ([MaLop], [TenLop], [MoTa], [HocPhi], [ThoiLuong], [MaKhoaHoc], [TrangThai]) VALUES (20, N'Beginer', N'Khóa học dành cho sinh viên có nhu cầu ôn thi VSTEP 4 kỹ năng: Nghe, Nói, Đọc, Viết', NULL, NULL, 17, NULL);
INSERT [dbo].[KHOAHOCCHITIET] ([MaLop], [TenLop], [MoTa], [HocPhi], [ThoiLuong], [MaKhoaHoc], [TrangThai]) VALUES (21, N'450+', N'Khóa học dành cho sinh viên có nhu cầu thi TOEIC 2 kỹ năng: Nghe, Đọc', NULL, NULL, 18, NULL);
INSERT [dbo].[KHOAHOCCHITIET] ([MaLop], [TenLop], [MoTa], [HocPhi], [ThoiLuong], [MaKhoaHoc], [TrangThai]) VALUES (22, N'650+', N'Khóa học dành cho sinh viên có nhu cầu thi TOEIC 2 kỹ năng: Nghe, Đọc', NULL, NULL, 18, NULL);
INSERT [dbo].[KHOAHOCCHITIET] ([MaLop], [TenLop], [MoTa], [HocPhi], [ThoiLuong], [MaKhoaHoc], [TrangThai]) VALUES (29, N'cb', N'', NULL, NULL, 22, NULL);
INSERT [dbo].[KHOAHOCCHITIET] ([MaLop], [TenLop], [MoTa], [HocPhi], [ThoiLuong], [MaKhoaHoc], [TrangThai]) VALUES (30, N'B1', N'', NULL, NULL, 23, NULL);
INSERT [dbo].[KHOAHOCCHITIET] ([MaLop], [TenLop], [MoTa], [HocPhi], [ThoiLuong], [MaKhoaHoc], [TrangThai]) VALUES (31, N'B1', N'', NULL, NULL, 24, NULL);
INSERT [dbo].[KHOAHOCCHITIET] ([MaLop], [TenLop], [MoTa], [HocPhi], [ThoiLuong], [MaKhoaHoc], [TrangThai]) VALUES (32, N'đồ đệ', N'tu thành 9 quả', NULL, NULL, 25, NULL);
INSERT [dbo].[KHOAHOCCHITIET] ([MaLop], [TenLop], [MoTa], [HocPhi], [ThoiLuong], [MaKhoaHoc], [TrangThai]) VALUES (33, N'sư phụ', N'tu thành 9 quả', NULL, NULL, 25, NULL);
SET IDENTITY_INSERT [dbo].[KHOAHOCCHITIET] OFF;
GO

-- Dumping Data for [dbo].[KYNANG]
SET IDENTITY_INSERT [dbo].[KYNANG] ON;
INSERT [dbo].[KYNANG] ([MaKyNang], [TenKyNang], [NoiDung]) VALUES (1, N'Nghe', NULL);
INSERT [dbo].[KYNANG] ([MaKyNang], [TenKyNang], [NoiDung]) VALUES (2, N'Nói', NULL);
INSERT [dbo].[KYNANG] ([MaKyNang], [TenKyNang], [NoiDung]) VALUES (3, N'Đọc', NULL);
INSERT [dbo].[KYNANG] ([MaKyNang], [TenKyNang], [NoiDung]) VALUES (4, N'Viết', NULL);
SET IDENTITY_INSERT [dbo].[KYNANG] OFF;
GO

-- Dumping Data for [dbo].[LOPHOC]
SET IDENTITY_INSERT [dbo].[LOPHOC] ON;
INSERT [dbo].[LOPHOC] ([MaLopHoc], [TenLop], [MaLop], [LichHoc], [SoLuongHocVien], [TienDo], [ActiveBuoiHocId], [TrangThai], [ActiveLessonId], [ChoPhepHocThu]) VALUES (18, N'Lớp demo', 1, N'Thứ 3 (07:00-08:30) · Thứ 5 (07:00-08:30)', NULL, 0, 42, N'Đang diễn ra', NULL, 0);
INSERT [dbo].[LOPHOC] ([MaLopHoc], [TenLop], [MaLop], [LichHoc], [SoLuongHocVien], [TienDo], [ActiveBuoiHocId], [TrangThai], [ActiveLessonId], [ChoPhepHocThu]) VALUES (21, N'B1B26', 30, N'Thứ 2 (07:00-08:30) · Thứ 4 (07:00-08:30) · Thứ 6 (07:00-08:30)', NULL, 0, NULL, N'Chưa bắt đầu', NULL, 0);
INSERT [dbo].[LOPHOC] ([MaLopHoc], [TenLop], [MaLop], [LichHoc], [SoLuongHocVien], [TienDo], [ActiveBuoiHocId], [TrangThai], [ActiveLessonId], [ChoPhepHocThu]) VALUES (22, N'B1E26', 31, N'Thứ 2 (07:00-08:30) · Thứ 4 (07:00-08:30) · Thứ 6 (07:00-08:30)', NULL, 0, NULL, N'Chưa bắt đầu', NULL, 0);
INSERT [dbo].[LOPHOC] ([MaLopHoc], [TenLop], [MaLop], [LichHoc], [SoLuongHocVien], [TienDo], [ActiveBuoiHocId], [TrangThai], [ActiveLessonId], [ChoPhepHocThu]) VALUES (23, N'Lớp người mới', 32, N'Thứ 2 (07:00-08:30) · Thứ 4 (07:00-08:30)', NULL, 0, NULL, N'Chưa bắt đầu', NULL, 0);
INSERT [dbo].[LOPHOC] ([MaLopHoc], [TenLop], [MaLop], [LichHoc], [SoLuongHocVien], [TienDo], [ActiveBuoiHocId], [TrangThai], [ActiveLessonId], [ChoPhepHocThu]) VALUES (24, N'Lớp người có nền tảng', 33, N'Thứ 3 (07:00-08:30) · Thứ 5 (07:00-08:30)', NULL, 0, NULL, N'Chưa bắt đầu', NULL, 0);
SET IDENTITY_INSERT [dbo].[LOPHOC] OFF;
GO

-- Dumping Data for [dbo].[MINITEST]
SET IDENTITY_INSERT [dbo].[MINITEST] ON;
INSERT [dbo].[MINITEST] ([MaMinitest], [MaBaiHoc], [CauHoi], [DiemDat], [TrangThai]) VALUES (2, 57, N'[{"question":"Hello có nghĩa là","answers":["xấu xa","tạm biệt","cảm ơn","xin chào"],"correct":"D","explanation":"","audioUrl":"","imageUrl":"","text":"","prompt":"","vocabPairs":[{"word":"","meaning":""}],"fillInAnswers":[],"sentences":["","","","","",""],"subQuestions":[{"question":"","answers":["","","",""],"correct":"A","explanation":""}]},{"question":"thực phẩm là gì","answers":["food","meal","dish","cusine"],"correct":"A","explanation":"","audioUrl":"","imageUrl":"","text":"","prompt":"","vocabPairs":[{"word":"","meaning":""}],"fillInAnswers":[],"sentences":["","","","","",""],"subQuestions":[{"question":"","answers":["","","",""],"correct":"A","explanation":""}]}]', 100, N'published');
INSERT [dbo].[MINITEST] ([MaMinitest], [MaBaiHoc], [CauHoi], [DiemDat], [TrangThai]) VALUES (9, 140, N'[{"question":"khi nào everything xong","answers":["1","2","3","4"],"correct":"A","explanation":""}]', 100, N'draft');
INSERT [dbo].[MINITEST] ([MaMinitest], [MaBaiHoc], [CauHoi], [DiemDat], [TrangThai]) VALUES (10, 138, N'[{"question":"Bạn là gì?","answers":["A","B","C","B"],"correct":"A","explanation":"Vì....","audioUrl":"","imageUrl":"","text":"","prompt":"","vocabPairs":[{"word":"","meaning":""}],"fillInAnswers":[],"sentences":["","","","","",""],"subQuestions":[{"question":"","answers":["","","",""],"correct":"A","explanation":""}]},{"question":"Bạn là gì","answers":["B","C","V","A"],"correct":"A","explanation":"","audioUrl":"","imageUrl":"","text":"","prompt":"","vocabPairs":[{"word":"","meaning":""}],"fillInAnswers":[],"sentences":["","","","","",""],"correctSentence":"","subQuestions":[{"question":"","answers":["","","",""],"correct":"A","explanation":""}]}]', 100, N'published');
INSERT [dbo].[MINITEST] ([MaMinitest], [MaBaiHoc], [CauHoi], [DiemDat], [TrangThai]) VALUES (11, 141, N'[{"question":"","answers":["","","",""],"correct":"A","explanation":""}]', 100, N'draft');
SET IDENTITY_INSERT [dbo].[MINITEST] OFF;
GO

-- Dumping Data for [dbo].[NGUOIDUNG]
SET IDENTITY_INSERT [dbo].[NGUOIDUNG] ON;
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao], [MaVaiTro], [AnhDaiDien]) VALUES (2, N'na123', N'123456', N'Huyen Na', N'na@gmail.com', NULL, NULL, N'Khóa', '2026-03-16T14:23:55.190Z', NULL, NULL);
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao], [MaVaiTro], [AnhDaiDien]) VALUES (3, N'admin', N'123456', N'Admin', N'admin@gmail.com', NULL, NULL, N'Active', '2026-03-16T14:46:00.610Z', 1, NULL);
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao], [MaVaiTro], [AnhDaiDien]) VALUES (4, N'teacher', N'123456', N'Giảng viên 1 nè', N'', NULL, NULL, N'Active', '2026-03-16T14:46:44.907Z', 2, N'/uploads/1784102444045-TRUONG_6M0A3836.jpg');
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao], [MaVaiTro], [AnhDaiDien]) VALUES (5, N'student', N'123456', N'Lê Nhàn', N'student@gmail.com', '2005-07-13T00:00:00.000Z', N'Nữ', N'Active', '2026-03-16T14:47:28.613Z', 3, N'http://localhost:5000/uploads/1782115047201-IMG_1837.JPG');
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao], [MaVaiTro], [AnhDaiDien]) VALUES (6, N'quantri', N'123456', N'Quan tri', N'quantrivien@gmail.com', NULL, NULL, N'Active', '2026-03-16T14:48:02.427Z', 4, NULL);
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao], [MaVaiTro], [AnhDaiDien]) VALUES (8, N'na124', N'123456', N'Huyen Na', N'na@gmail.com', NULL, NULL, N'Khóa', '2026-03-17T08:23:10.867Z', NULL, NULL);
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao], [MaVaiTro], [AnhDaiDien]) VALUES (9, N'na456@gmail.com', N'123456', N'Huyen Na', N'na456@gmail.com', NULL, NULL, N'Active', '2026-03-17T08:28:15.797Z', 2, NULL);
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao], [MaVaiTro], [AnhDaiDien]) VALUES (10, N'sv101@gmail.com', N'123456', N'Nguyễn Văn An', N'sv101@gmail.com', '2004-03-12T00:00:00.000Z', N'Nam', N'Active', '2026-03-19T11:22:43.863Z', 3, NULL);
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao], [MaVaiTro], [AnhDaiDien]) VALUES (11, N'sv102@gmail.com', N'123456', N'Trần Thị Bích', N'sv102@gmail.com', '2005-11-02T00:00:00.000Z', N'Nữ', N'Active', '2026-03-19T11:22:43.863Z', 3, NULL);
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao], [MaVaiTro], [AnhDaiDien]) VALUES (12, N'sv103@gmail.com', N'123456', N'Lê Minh Cường', N'sv103@gmail.com', '2006-08-20T00:00:00.000Z', N'Nam', N'Khóa', '2026-03-19T11:22:43.863Z', 3, NULL);
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao], [MaVaiTro], [AnhDaiDien]) VALUES (13, N'sv104@gmail.com', N'123456', N'Phạm Thị Dung', N'sv104@gmail.com', '2007-05-14T00:00:00.000Z', N'Nữ', N'Active', '2026-03-19T11:22:43.863Z', 3, NULL);
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao], [MaVaiTro], [AnhDaiDien]) VALUES (14, N'sv105@gmail.com', N'123456', N'Hoàng Quốc Huy', N'sv105@gmail.com', '2004-09-22T00:00:00.000Z', N'Nam', N'Active', '2026-03-19T11:22:43.863Z', 3, NULL);
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao], [MaVaiTro], [AnhDaiDien]) VALUES (15, N'sv106@gmail.com', N'123456', N'Đặng Thị Lan', N'sv106@gmail.com', '2005-01-18T00:00:00.000Z', N'Nữ', N'Active', '2026-03-19T11:22:43.863Z', 3, NULL);
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao], [MaVaiTro], [AnhDaiDien]) VALUES (16, N'sv107@gmail.com', N'123456', N'Nguyễn Thành Nam', N'sv107@gmail.com', '2006-12-01T00:00:00.000Z', N'Nam', N'Active', '2026-03-19T11:22:43.863Z', 3, NULL);
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao], [MaVaiTro], [AnhDaiDien]) VALUES (17, N'sv108@gmail.com', N'123456', N'Phan Thị Oanh', N'sv108@gmail.com', '2007-06-09T00:00:00.000Z', N'Nữ', N'Active', '2026-03-19T11:22:43.863Z', 3, NULL);
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao], [MaVaiTro], [AnhDaiDien]) VALUES (18, N'sv109@gmail.com', N'123456', N'Võ Minh Phúc', N'sv109@gmail.com', '2004-07-30T00:00:00.000Z', N'Nam', N'Khóa', '2026-03-19T11:22:43.863Z', 3, NULL);
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao], [MaVaiTro], [AnhDaiDien]) VALUES (19, N'sv110@gmail.com', N'123456', N'Huỳnh Thị Quỳnh', N'sv110@gmail.com', '2005-02-11T00:00:00.000Z', N'Nữ', N'Khóa', '2026-03-19T11:22:43.863Z', 3, NULL);
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao], [MaVaiTro], [AnhDaiDien]) VALUES (20, N'sv111@gmail.com', N'123456', N'Lý Quốc Sơn', N'sv111@gmail.com', '2004-04-17T00:00:00.000Z', N'Nam', N'Khóa', '2026-03-19T11:22:43.863Z', 3, NULL);
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao], [MaVaiTro], [AnhDaiDien]) VALUES (21, N'sv112@gmail.com', N'123456', N'Trương Thị Trang', N'sv112@gmail.com', '2005-10-05T00:00:00.000Z', N'Nữ', N'Active', '2026-03-19T11:22:43.863Z', 3, NULL);
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao], [MaVaiTro], [AnhDaiDien]) VALUES (22, N'sv113@gmail.com', N'123456', N'Ngô Văn Tuấn', N'sv113@gmail.com', '2006-01-23T00:00:00.000Z', N'Nam', N'Active', '2026-03-19T11:22:43.863Z', 3, NULL);
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao], [MaVaiTro], [AnhDaiDien]) VALUES (23, N'sv114@gmail.com', N'123456', N'Đỗ Thị Uyên', N'sv114@gmail.com', '2007-03-03T00:00:00.000Z', N'Nữ', N'Active', '2026-03-19T11:22:43.863Z', 3, NULL);
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao], [MaVaiTro], [AnhDaiDien]) VALUES (24, N'sv115@gmail.com', N'123456', N'Bùi Văn Vinh', N'sv115@gmail.com', '2006-09-29T00:00:00.000Z', N'Nam', N'Active', '2026-03-19T11:22:43.863Z', 3, NULL);
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao], [MaVaiTro], [AnhDaiDien]) VALUES (25, N'sv116@gmail.com', N'123456', N'Nguyễn Thị Yến', N'sv116@gmail.com', '2007-12-12T00:00:00.000Z', N'Nữ', N'Active', '2026-03-19T11:22:43.863Z', 3, NULL);
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao], [MaVaiTro], [AnhDaiDien]) VALUES (26, N'sv117@gmail.com', N'123456', N'Trần Văn Anh', N'sv117@gmail.com', '2004-07-21T00:00:00.000Z', N'Nam', N'Active', '2026-03-19T11:22:43.863Z', 3, NULL);
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao], [MaVaiTro], [AnhDaiDien]) VALUES (27, N'sv118@gmail.com', N'123456', N'Phạm Thị Bảo', N'sv118@gmail.com', '2005-11-08T00:00:00.000Z', N'Nữ', N'Active', '2026-03-19T11:22:43.863Z', 3, NULL);
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao], [MaVaiTro], [AnhDaiDien]) VALUES (28, N'sv119@gmail.com', N'123456', N'Hoàng Minh Đức', N'sv119@gmail.com', '2006-05-16T00:00:00.000Z', N'Nam', N'Active', '2026-03-19T11:22:43.863Z', 3, NULL);
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao], [MaVaiTro], [AnhDaiDien]) VALUES (29, N'sv120@gmail.com', N'123456', N'Đặng Thị Hạnh', N'sv120@gmail.com', '2007-08-27T00:00:00.000Z', N'Nữ', N'Active', '2026-03-19T11:22:43.863Z', 3, NULL);
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao], [MaVaiTro], [AnhDaiDien]) VALUES (30, N'huyenna01662182732@gmail.com', N'123456', N'Đỗ Thị Huyền Na', N'huyenna01662182732@gmail.com', '2004-04-25T00:00:00.000Z', N'Nữ', N'active', '2026-03-21T17:57:46.193Z', 3, NULL);
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao], [MaVaiTro], [AnhDaiDien]) VALUES (31, N'be@gmail.com', N'123456', N'Nguyễn Thị Bé', N'be@gmail.com', '2005-05-10T00:00:00.000Z', N'Nữ', N'active', '2026-03-21T18:34:45.583Z', NULL, NULL);
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao], [MaVaiTro], [AnhDaiDien]) VALUES (33, N'LeNhan', N'123456', N'Lê Thị Thanh Nhàn', N'thanhnhan0704@gmail.com', NULL, NULL, N'Active', '2026-06-05T15:51:52.247Z', 2, NULL);
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao], [MaVaiTro], [AnhDaiDien]) VALUES (34, N'test', N'123456', N'Nguyễn Test', N'test@gmail.com', NULL, NULL, N'Active', '2026-06-05T16:39:20.497Z', 4, NULL);
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao], [MaVaiTro], [AnhDaiDien]) VALUES (35, N'a', N'a', N'a', N'a', NULL, NULL, N'active', '2026-06-08T08:43:45.690Z', NULL, NULL);
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao], [MaVaiTro], [AnhDaiDien]) VALUES (36, N'thanhnhadonggiang@gmail.com', N'Nhahun150105', N'Trần Thanh Nhã', N'thanhnhadonggiang@gmail.com', NULL, N'', N'active', '2026-06-08T11:11:11.800Z', NULL, NULL);
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao], [MaVaiTro], [AnhDaiDien]) VALUES (37, N'Nhahun', N'123456', N'Trần Công Nguyên', N'nguyenthienhoang@gmail.com', NULL, NULL, N'Active', '2026-06-08T14:20:29.580Z', 2, NULL);
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao], [MaVaiTro], [AnhDaiDien]) VALUES (38, N'phanlenghi369@gmail.com', N'Pln13579852', N'Phan Lê Nghi', N'phanlenghi369@gmail.com', '2005-05-01T00:00:00.000Z', N'Nữ', N'Khóa', '2026-06-08T16:53:25.490Z', NULL, NULL);
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao], [MaVaiTro], [AnhDaiDien]) VALUES (39, N'student_mock_test', N'123456', N'Học Viên Giả Định', N'mock_test@flic.edu.vn', NULL, NULL, N'active', '2026-06-10T14:11:06.753Z', 3, NULL);
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao], [MaVaiTro], [AnhDaiDien]) VALUES (40, N'dfsdfv', N'123456', N'dfsdv', N'sdfv', NULL, NULL, N'Active', '2026-06-10T14:37:15.837Z', 5, NULL);
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao], [MaVaiTro], [AnhDaiDien]) VALUES (42, N'fnhftf', N'123456', N'', N'sfgh', NULL, NULL, N'Active', '2026-06-10T14:41:06.150Z', 2, NULL);
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao], [MaVaiTro], [AnhDaiDien]) VALUES (45, N'ab', N'123456', N'a', N'test@gmail.com', NULL, NULL, N'Active', '2026-06-10T14:45:05.660Z', 5, NULL);
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao], [MaVaiTro], [AnhDaiDien]) VALUES (46, N'sdf', N'123456', N'df', N'tnhan13042005@gmail.com', NULL, NULL, N'Active', '2026-06-10T14:52:48.710Z', 5, NULL);
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao], [MaVaiTro], [AnhDaiDien]) VALUES (47, N'lykute1601@gmail.com', N'123456', N'Trần Quỳnh Như', N'lykute1601@gmail.com', '2005-01-27T00:00:00.000Z', N'Nữ', N'active', '2026-06-19T16:03:06.877Z', 3, N'/uploads/1781860687875-Thanh-NhÃ£.png');
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao], [MaVaiTro], [AnhDaiDien]) VALUES (48, N'nhan', N'123', N'Nhàn', N'tnhan13042005@gmail.com', NULL, NULL, N'active', '2026-06-22T09:21:32.410Z', 5, NULL);
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao], [MaVaiTro], [AnhDaiDien]) VALUES (49, N'athu', N'123', N'Anh Thư', N'tnhan13042005@gmail.com', '2006-06-13T00:00:00.000Z', N'Nữ', N'Active', '2026-06-29T16:14:43.377Z', 3, N'/uploads/1783010157591-daily-E79SKkrT.png');
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao], [MaVaiTro], [AnhDaiDien]) VALUES (50, N'studenttest', N'Password123!', N'Student Test', N'studenttest@example.com', NULL, NULL, N'active', '2026-06-30T17:01:46.613Z', 5, NULL);
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao], [MaVaiTro], [AnhDaiDien]) VALUES (51, N'thuy', N'123', N'Nguyễn Thị Thu Thúy', N'thuthuy.01t@gmail.com', NULL, N'', N'active', '2026-07-07T15:29:51.103Z', 3, N'/uploads/1783413122232-cat1.jpg');
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao], [MaVaiTro], [AnhDaiDien]) VALUES (52, N'quantri2', N'123', N'Thu Thúy', N'thuthuy.01t@gmail.com', NULL, NULL, N'Khóa', '2026-07-07T16:15:22.007Z', 4, NULL);
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao], [MaVaiTro], [AnhDaiDien]) VALUES (55, N'quantri3', N'123', N'Thu Thúy', N'thuthuy.01t@gmail.com', NULL, NULL, N'Active', '2026-07-07T16:21:02.653Z', 4, NULL);
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao], [MaVaiTro], [AnhDaiDien]) VALUES (56, N'AnnhThu', N'123', N'Anh thư 2', N'anhthudangngoc.2005@gmail.com', NULL, NULL, N'active', '2026-07-08T17:19:29.740Z', 5, NULL);
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao], [MaVaiTro], [AnhDaiDien]) VALUES (57, N'Annhthu3', N'123', N'Anh thư 3', N'anhthudangngoc.2005@gmail.com', NULL, NULL, N'active', '2026-07-08T17:27:02.923Z', 5, NULL);
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao], [MaVaiTro], [AnhDaiDien]) VALUES (62, N'annthu', N'123456', N'Huỳnh B', N'anhthu2005@gmail.com', NULL, NULL, N'Active', '2026-07-10T10:11:23.530Z', 2, NULL);
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao], [MaVaiTro], [AnhDaiDien]) VALUES (66, N'thúy hv', N'123', N'Choi Yeonjun', N'thuthuy.01t@gmail.com', NULL, NULL, N'active', '2026-07-12T21:16:53.270Z', 3, NULL);
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao], [MaVaiTro], [AnhDaiDien]) VALUES (67, N'thúy hv2', N'123', N'Choi Soobin', N'thuthuy.01t@gmail.com', NULL, NULL, N'active', '2026-07-12T21:24:53.900Z', 5, NULL);
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao], [MaVaiTro], [AnhDaiDien]) VALUES (68, N'hocvien1', N'123', N'Thúy Nguyễn', N'thuthuy.01t@gmail.com', NULL, NULL, N'active', '2026-07-14T14:44:54.263Z', 3, NULL);
SET IDENTITY_INSERT [dbo].[NGUOIDUNG] OFF;
GO

-- Dumping Data for [dbo].[NGUOIDUNG_QUYENHAN]
INSERT [dbo].[NGUOIDUNG_QUYENHAN] ([MaNguoiDung], [MaQuyenHan]) VALUES (4, 12);
INSERT [dbo].[NGUOIDUNG_QUYENHAN] ([MaNguoiDung], [MaQuyenHan]) VALUES (4, 13);
INSERT [dbo].[NGUOIDUNG_QUYENHAN] ([MaNguoiDung], [MaQuyenHan]) VALUES (4, 14);
INSERT [dbo].[NGUOIDUNG_QUYENHAN] ([MaNguoiDung], [MaQuyenHan]) VALUES (4, 15);
INSERT [dbo].[NGUOIDUNG_QUYENHAN] ([MaNguoiDung], [MaQuyenHan]) VALUES (4, 16);
INSERT [dbo].[NGUOIDUNG_QUYENHAN] ([MaNguoiDung], [MaQuyenHan]) VALUES (4, 17);
INSERT [dbo].[NGUOIDUNG_QUYENHAN] ([MaNguoiDung], [MaQuyenHan]) VALUES (4, 21);
INSERT [dbo].[NGUOIDUNG_QUYENHAN] ([MaNguoiDung], [MaQuyenHan]) VALUES (4, 22);
INSERT [dbo].[NGUOIDUNG_QUYENHAN] ([MaNguoiDung], [MaQuyenHan]) VALUES (6, 12);
INSERT [dbo].[NGUOIDUNG_QUYENHAN] ([MaNguoiDung], [MaQuyenHan]) VALUES (6, 13);
INSERT [dbo].[NGUOIDUNG_QUYENHAN] ([MaNguoiDung], [MaQuyenHan]) VALUES (6, 14);
INSERT [dbo].[NGUOIDUNG_QUYENHAN] ([MaNguoiDung], [MaQuyenHan]) VALUES (6, 15);
INSERT [dbo].[NGUOIDUNG_QUYENHAN] ([MaNguoiDung], [MaQuyenHan]) VALUES (6, 17);
INSERT [dbo].[NGUOIDUNG_QUYENHAN] ([MaNguoiDung], [MaQuyenHan]) VALUES (6, 18);
INSERT [dbo].[NGUOIDUNG_QUYENHAN] ([MaNguoiDung], [MaQuyenHan]) VALUES (6, 19);
INSERT [dbo].[NGUOIDUNG_QUYENHAN] ([MaNguoiDung], [MaQuyenHan]) VALUES (6, 20);
INSERT [dbo].[NGUOIDUNG_QUYENHAN] ([MaNguoiDung], [MaQuyenHan]) VALUES (6, 21);
INSERT [dbo].[NGUOIDUNG_QUYENHAN] ([MaNguoiDung], [MaQuyenHan]) VALUES (6, 22);
INSERT [dbo].[NGUOIDUNG_QUYENHAN] ([MaNguoiDung], [MaQuyenHan]) VALUES (9, 12);
INSERT [dbo].[NGUOIDUNG_QUYENHAN] ([MaNguoiDung], [MaQuyenHan]) VALUES (9, 13);
INSERT [dbo].[NGUOIDUNG_QUYENHAN] ([MaNguoiDung], [MaQuyenHan]) VALUES (9, 14);
INSERT [dbo].[NGUOIDUNG_QUYENHAN] ([MaNguoiDung], [MaQuyenHan]) VALUES (9, 15);
INSERT [dbo].[NGUOIDUNG_QUYENHAN] ([MaNguoiDung], [MaQuyenHan]) VALUES (9, 17);
INSERT [dbo].[NGUOIDUNG_QUYENHAN] ([MaNguoiDung], [MaQuyenHan]) VALUES (33, 12);
INSERT [dbo].[NGUOIDUNG_QUYENHAN] ([MaNguoiDung], [MaQuyenHan]) VALUES (33, 13);
INSERT [dbo].[NGUOIDUNG_QUYENHAN] ([MaNguoiDung], [MaQuyenHan]) VALUES (33, 14);
INSERT [dbo].[NGUOIDUNG_QUYENHAN] ([MaNguoiDung], [MaQuyenHan]) VALUES (33, 15);
INSERT [dbo].[NGUOIDUNG_QUYENHAN] ([MaNguoiDung], [MaQuyenHan]) VALUES (33, 16);
INSERT [dbo].[NGUOIDUNG_QUYENHAN] ([MaNguoiDung], [MaQuyenHan]) VALUES (33, 17);
INSERT [dbo].[NGUOIDUNG_QUYENHAN] ([MaNguoiDung], [MaQuyenHan]) VALUES (34, 12);
INSERT [dbo].[NGUOIDUNG_QUYENHAN] ([MaNguoiDung], [MaQuyenHan]) VALUES (34, 13);
INSERT [dbo].[NGUOIDUNG_QUYENHAN] ([MaNguoiDung], [MaQuyenHan]) VALUES (34, 15);
INSERT [dbo].[NGUOIDUNG_QUYENHAN] ([MaNguoiDung], [MaQuyenHan]) VALUES (34, 17);
INSERT [dbo].[NGUOIDUNG_QUYENHAN] ([MaNguoiDung], [MaQuyenHan]) VALUES (34, 18);
INSERT [dbo].[NGUOIDUNG_QUYENHAN] ([MaNguoiDung], [MaQuyenHan]) VALUES (34, 19);
INSERT [dbo].[NGUOIDUNG_QUYENHAN] ([MaNguoiDung], [MaQuyenHan]) VALUES (37, 13);
INSERT [dbo].[NGUOIDUNG_QUYENHAN] ([MaNguoiDung], [MaQuyenHan]) VALUES (37, 14);
INSERT [dbo].[NGUOIDUNG_QUYENHAN] ([MaNguoiDung], [MaQuyenHan]) VALUES (37, 15);
INSERT [dbo].[NGUOIDUNG_QUYENHAN] ([MaNguoiDung], [MaQuyenHan]) VALUES (37, 16);
INSERT [dbo].[NGUOIDUNG_QUYENHAN] ([MaNguoiDung], [MaQuyenHan]) VALUES (37, 17);
INSERT [dbo].[NGUOIDUNG_QUYENHAN] ([MaNguoiDung], [MaQuyenHan]) VALUES (37, 22);
INSERT [dbo].[NGUOIDUNG_QUYENHAN] ([MaNguoiDung], [MaQuyenHan]) VALUES (42, 12);
INSERT [dbo].[NGUOIDUNG_QUYENHAN] ([MaNguoiDung], [MaQuyenHan]) VALUES (52, 12);
INSERT [dbo].[NGUOIDUNG_QUYENHAN] ([MaNguoiDung], [MaQuyenHan]) VALUES (52, 13);
INSERT [dbo].[NGUOIDUNG_QUYENHAN] ([MaNguoiDung], [MaQuyenHan]) VALUES (52, 14);
INSERT [dbo].[NGUOIDUNG_QUYENHAN] ([MaNguoiDung], [MaQuyenHan]) VALUES (52, 15);
INSERT [dbo].[NGUOIDUNG_QUYENHAN] ([MaNguoiDung], [MaQuyenHan]) VALUES (52, 17);
INSERT [dbo].[NGUOIDUNG_QUYENHAN] ([MaNguoiDung], [MaQuyenHan]) VALUES (52, 18);
INSERT [dbo].[NGUOIDUNG_QUYENHAN] ([MaNguoiDung], [MaQuyenHan]) VALUES (52, 19);
INSERT [dbo].[NGUOIDUNG_QUYENHAN] ([MaNguoiDung], [MaQuyenHan]) VALUES (52, 20);
INSERT [dbo].[NGUOIDUNG_QUYENHAN] ([MaNguoiDung], [MaQuyenHan]) VALUES (52, 21);
INSERT [dbo].[NGUOIDUNG_QUYENHAN] ([MaNguoiDung], [MaQuyenHan]) VALUES (52, 22);
INSERT [dbo].[NGUOIDUNG_QUYENHAN] ([MaNguoiDung], [MaQuyenHan]) VALUES (55, 18);
INSERT [dbo].[NGUOIDUNG_QUYENHAN] ([MaNguoiDung], [MaQuyenHan]) VALUES (55, 19);
INSERT [dbo].[NGUOIDUNG_QUYENHAN] ([MaNguoiDung], [MaQuyenHan]) VALUES (62, 12);
INSERT [dbo].[NGUOIDUNG_QUYENHAN] ([MaNguoiDung], [MaQuyenHan]) VALUES (62, 13);
INSERT [dbo].[NGUOIDUNG_QUYENHAN] ([MaNguoiDung], [MaQuyenHan]) VALUES (62, 14);
INSERT [dbo].[NGUOIDUNG_QUYENHAN] ([MaNguoiDung], [MaQuyenHan]) VALUES (62, 15);
INSERT [dbo].[NGUOIDUNG_QUYENHAN] ([MaNguoiDung], [MaQuyenHan]) VALUES (62, 16);
INSERT [dbo].[NGUOIDUNG_QUYENHAN] ([MaNguoiDung], [MaQuyenHan]) VALUES (62, 17);
INSERT [dbo].[NGUOIDUNG_QUYENHAN] ([MaNguoiDung], [MaQuyenHan]) VALUES (62, 21);
INSERT [dbo].[NGUOIDUNG_QUYENHAN] ([MaNguoiDung], [MaQuyenHan]) VALUES (62, 22);
GO

-- Dumping Data for [dbo].[PHANCONGGIANGVIEN]
SET IDENTITY_INSERT [dbo].[PHANCONGGIANGVIEN] ON;
INSERT [dbo].[PHANCONGGIANGVIEN] ([MaPhanCong], [MaLopHoc], [MaGiangVien], [MaKyNang], [NgayPhanCong]) VALUES (210, 18, 1, 1, '2026-07-08T10:45:33.160Z');
INSERT [dbo].[PHANCONGGIANGVIEN] ([MaPhanCong], [MaLopHoc], [MaGiangVien], [MaKyNang], [NgayPhanCong]) VALUES (211, 18, 1, 2, '2026-07-08T10:45:33.160Z');
INSERT [dbo].[PHANCONGGIANGVIEN] ([MaPhanCong], [MaLopHoc], [MaGiangVien], [MaKyNang], [NgayPhanCong]) VALUES (212, 18, 1, 3, '2026-07-08T10:45:33.163Z');
INSERT [dbo].[PHANCONGGIANGVIEN] ([MaPhanCong], [MaLopHoc], [MaGiangVien], [MaKyNang], [NgayPhanCong]) VALUES (213, 18, 5, 4, '2026-07-08T10:45:33.167Z');
INSERT [dbo].[PHANCONGGIANGVIEN] ([MaPhanCong], [MaLopHoc], [MaGiangVien], [MaKyNang], [NgayPhanCong]) VALUES (227, 23, 1, 1, '2026-07-14T11:13:13.083Z');
INSERT [dbo].[PHANCONGGIANGVIEN] ([MaPhanCong], [MaLopHoc], [MaGiangVien], [MaKyNang], [NgayPhanCong]) VALUES (228, 23, 1, 2, '2026-07-14T11:13:13.127Z');
INSERT [dbo].[PHANCONGGIANGVIEN] ([MaPhanCong], [MaLopHoc], [MaGiangVien], [MaKyNang], [NgayPhanCong]) VALUES (229, 23, 1, 3, '2026-07-14T11:13:13.163Z');
INSERT [dbo].[PHANCONGGIANGVIEN] ([MaPhanCong], [MaLopHoc], [MaGiangVien], [MaKyNang], [NgayPhanCong]) VALUES (230, 23, 1, 4, '2026-07-14T11:13:13.210Z');
SET IDENTITY_INSERT [dbo].[PHANCONGGIANGVIEN] OFF;
GO

-- Dumping Data for [dbo].[QUANTRIVIENNOIDUNG]
SET IDENTITY_INSERT [dbo].[QUANTRIVIENNOIDUNG] ON;
INSERT [dbo].[QUANTRIVIENNOIDUNG] ([MaQTVND], [MaNguoiDung]) VALUES (1, 6);
INSERT [dbo].[QUANTRIVIENNOIDUNG] ([MaQTVND], [MaNguoiDung]) VALUES (2, 34);
INSERT [dbo].[QUANTRIVIENNOIDUNG] ([MaQTVND], [MaNguoiDung]) VALUES (3, 52);
INSERT [dbo].[QUANTRIVIENNOIDUNG] ([MaQTVND], [MaNguoiDung]) VALUES (4, 55);
SET IDENTITY_INSERT [dbo].[QUANTRIVIENNOIDUNG] OFF;
GO

-- Dumping Data for [dbo].[QUYENHAN]
SET IDENTITY_INSERT [dbo].[QUYENHAN] ON;
INSERT [dbo].[QUYENHAN] ([MaQuyenHan], [TenQuyenHan]) VALUES (17, N'Chấm điểm');
INSERT [dbo].[QUYENHAN] ([MaQuyenHan], [TenQuyenHan]) VALUES (12, N'Đăng bài giảng');
INSERT [dbo].[QUYENHAN] ([MaQuyenHan], [TenQuyenHan]) VALUES (14, N'Đăng bài kiểm tra');
INSERT [dbo].[QUYENHAN] ([MaQuyenHan], [TenQuyenHan]) VALUES (15, N'Đăng bài luyện tập thêm');
INSERT [dbo].[QUYENHAN] ([MaQuyenHan], [TenQuyenHan]) VALUES (13, N'Đăng bài tập');
INSERT [dbo].[QUYENHAN] ([MaQuyenHan], [TenQuyenHan]) VALUES (16, N'Đăng tài liệu');
INSERT [dbo].[QUYENHAN] ([MaQuyenHan], [TenQuyenHan]) VALUES (20, N'Duyệt bài đăng giáo viên');
INSERT [dbo].[QUYENHAN] ([MaQuyenHan], [TenQuyenHan]) VALUES (11, N'Kiểm duyệt nội dung');
INSERT [dbo].[QUYENHAN] ([MaQuyenHan], [TenQuyenHan]) VALUES (19, N'Phân lớp sinh viên');
INSERT [dbo].[QUYENHAN] ([MaQuyenHan], [TenQuyenHan]) VALUES (10, N'Phân quyền');
INSERT [dbo].[QUYENHAN] ([MaQuyenHan], [TenQuyenHan]) VALUES (3, N'Quản lý bài học');
INSERT [dbo].[QUYENHAN] ([MaQuyenHan], [TenQuyenHan]) VALUES (5, N'Quản lý bài kiểm tra');
INSERT [dbo].[QUYENHAN] ([MaQuyenHan], [TenQuyenHan]) VALUES (4, N'Quản lý bài tập');
INSERT [dbo].[QUYENHAN] ([MaQuyenHan], [TenQuyenHan]) VALUES (8, N'Quản lý giảng viên');
INSERT [dbo].[QUYENHAN] ([MaQuyenHan], [TenQuyenHan]) VALUES (7, N'Quản lý học viên');
INSERT [dbo].[QUYENHAN] ([MaQuyenHan], [TenQuyenHan]) VALUES (1, N'Quản lý khóa học');
INSERT [dbo].[QUYENHAN] ([MaQuyenHan], [TenQuyenHan]) VALUES (2, N'Quản lý lớp học');
INSERT [dbo].[QUYENHAN] ([MaQuyenHan], [TenQuyenHan]) VALUES (9, N'Quản lý tài khoản');
INSERT [dbo].[QUYENHAN] ([MaQuyenHan], [TenQuyenHan]) VALUES (6, N'Quản lý tài liệu');
INSERT [dbo].[QUYENHAN] ([MaQuyenHan], [TenQuyenHan]) VALUES (18, N'Tạo lớp trong khóa');
INSERT [dbo].[QUYENHAN] ([MaQuyenHan], [TenQuyenHan]) VALUES (22, N'Xem bài làm học viên');
INSERT [dbo].[QUYENHAN] ([MaQuyenHan], [TenQuyenHan]) VALUES (21, N'Xem điểm');
SET IDENTITY_INSERT [dbo].[QUYENHAN] OFF;
GO

-- Dumping Data for [dbo].[SINHVIEN]
SET IDENTITY_INSERT [dbo].[SINHVIEN] ON;
INSERT [dbo].[SINHVIEN] ([MaSinhVien], [MaNguoiDung], [Lop], [BietDanh], [MSSV]) VALUES (1, 10, N'Lớp 1 - TOEIC Foundation', N'An cục đá', N'221121521101');
INSERT [dbo].[SINHVIEN] ([MaSinhVien], [MaNguoiDung], [Lop], [BietDanh], [MSSV]) VALUES (2, 11, N'Lớp 1 - TOEIC Foundation', NULL, N'221121521102');
INSERT [dbo].[SINHVIEN] ([MaSinhVien], [MaNguoiDung], [Lop], [BietDanh], [MSSV]) VALUES (3, 12, N'Lớp 1 - TOEIC Foundation', NULL, N'221121521103');
INSERT [dbo].[SINHVIEN] ([MaSinhVien], [MaNguoiDung], [Lop], [BietDanh], [MSSV]) VALUES (4, 13, N'Lớp 1 - TOEIC Foundation', NULL, N'221121521104');
INSERT [dbo].[SINHVIEN] ([MaSinhVien], [MaNguoiDung], [Lop], [BietDanh], [MSSV]) VALUES (5, 14, N'Lớp 1 - TOEIC Foundation', NULL, N'221121521105');
INSERT [dbo].[SINHVIEN] ([MaSinhVien], [MaNguoiDung], [Lop], [BietDanh], [MSSV]) VALUES (6, 15, N'Lớp 1 - TOEIC Foundation', NULL, N'221121521106');
INSERT [dbo].[SINHVIEN] ([MaSinhVien], [MaNguoiDung], [Lop], [BietDanh], [MSSV]) VALUES (7, 16, N'Lớp 1 - TOEIC Foundation', NULL, N'221121521107');
INSERT [dbo].[SINHVIEN] ([MaSinhVien], [MaNguoiDung], [Lop], [BietDanh], [MSSV]) VALUES (8, 17, N'Lớp 1 - TOEIC Foundation', NULL, N'221121521108');
INSERT [dbo].[SINHVIEN] ([MaSinhVien], [MaNguoiDung], [Lop], [BietDanh], [MSSV]) VALUES (9, 18, N'Lớp 1 - TOEIC Foundation', NULL, N'221121521109');
INSERT [dbo].[SINHVIEN] ([MaSinhVien], [MaNguoiDung], [Lop], [BietDanh], [MSSV]) VALUES (10, 19, N'Lớp 1 - TOEIC Foundation', NULL, N'221121521110');
INSERT [dbo].[SINHVIEN] ([MaSinhVien], [MaNguoiDung], [Lop], [BietDanh], [MSSV]) VALUES (11, 20, N'Lớp 1 - TOEIC Foundation', NULL, N'221121521111');
INSERT [dbo].[SINHVIEN] ([MaSinhVien], [MaNguoiDung], [Lop], [BietDanh], [MSSV]) VALUES (12, 21, N'Lớp 1 - TOEIC Foundation', NULL, N'221121521112');
INSERT [dbo].[SINHVIEN] ([MaSinhVien], [MaNguoiDung], [Lop], [BietDanh], [MSSV]) VALUES (13, 22, N'Lớp 1 - TOEIC Foundation', NULL, N'221121521113');
INSERT [dbo].[SINHVIEN] ([MaSinhVien], [MaNguoiDung], [Lop], [BietDanh], [MSSV]) VALUES (14, 23, N'Lớp 1 - TOEIC Foundation', NULL, N'221121521114');
INSERT [dbo].[SINHVIEN] ([MaSinhVien], [MaNguoiDung], [Lop], [BietDanh], [MSSV]) VALUES (15, 24, N'Lớp 1 - TOEIC Foundation', NULL, N'221121521115');
INSERT [dbo].[SINHVIEN] ([MaSinhVien], [MaNguoiDung], [Lop], [BietDanh], [MSSV]) VALUES (16, 25, N'Lớp 1 - TOEIC Foundation', NULL, N'221121521116');
INSERT [dbo].[SINHVIEN] ([MaSinhVien], [MaNguoiDung], [Lop], [BietDanh], [MSSV]) VALUES (17, 26, N'Lớp 1 - TOEIC Foundation', NULL, N'221121521117');
INSERT [dbo].[SINHVIEN] ([MaSinhVien], [MaNguoiDung], [Lop], [BietDanh], [MSSV]) VALUES (18, 27, N'Lớp 1 - TOEIC Foundation', NULL, N'221121521118');
INSERT [dbo].[SINHVIEN] ([MaSinhVien], [MaNguoiDung], [Lop], [BietDanh], [MSSV]) VALUES (19, 28, N'Lớp 1 - TOEIC Foundation', NULL, N'221121521119');
INSERT [dbo].[SINHVIEN] ([MaSinhVien], [MaNguoiDung], [Lop], [BietDanh], [MSSV]) VALUES (20, 29, N'Lớp 1 - TOEIC Foundation', NULL, N'221121521120');
INSERT [dbo].[SINHVIEN] ([MaSinhVien], [MaNguoiDung], [Lop], [BietDanh], [MSSV]) VALUES (21, 30, N'Trường Đại học Kinh tế Đà Nẵng', NULL, N'221121521126');
INSERT [dbo].[SINHVIEN] ([MaSinhVien], [MaNguoiDung], [Lop], [BietDanh], [MSSV]) VALUES (22, 39, NULL, NULL, N'SV_MOCK_TEST');
INSERT [dbo].[SINHVIEN] ([MaSinhVien], [MaNguoiDung], [Lop], [BietDanh], [MSSV]) VALUES (23, 5, N'49K14.2 Trường Đại học Kinh tế - ĐHĐN', NULL, N'231121514229');
INSERT [dbo].[SINHVIEN] ([MaSinhVien], [MaNguoiDung], [Lop], [BietDanh], [MSSV]) VALUES (24, 40, NULL, NULL, N'SV77042150');
INSERT [dbo].[SINHVIEN] ([MaSinhVien], [MaNguoiDung], [Lop], [BietDanh], [MSSV]) VALUES (25, 45, NULL, NULL, N'SV77504225');
INSERT [dbo].[SINHVIEN] ([MaSinhVien], [MaNguoiDung], [Lop], [BietDanh], [MSSV]) VALUES (26, 46, NULL, NULL, N'SV77975015');
INSERT [dbo].[SINHVIEN] ([MaSinhVien], [MaNguoiDung], [Lop], [BietDanh], [MSSV]) VALUES (27, 47, N'49K14.2 Trường Đại học Kinh tế - ĐHĐN', NULL, N'231121514228');
INSERT [dbo].[SINHVIEN] ([MaSinhVien], [MaNguoiDung], [Lop], [BietDanh], [MSSV]) VALUES (28, 48, NULL, NULL, NULL);
INSERT [dbo].[SINHVIEN] ([MaSinhVien], [MaNguoiDung], [Lop], [BietDanh], [MSSV]) VALUES (29, 49, N'50K14.2 Trường Đại học Kinh tế - ĐHĐN', N'Xù đại ca', N'241121514256');
INSERT [dbo].[SINHVIEN] ([MaSinhVien], [MaNguoiDung], [Lop], [BietDanh], [MSSV]) VALUES (30, 51, NULL, N'thúi thúi', NULL);
INSERT [dbo].[SINHVIEN] ([MaSinhVien], [MaNguoiDung], [Lop], [BietDanh], [MSSV]) VALUES (31, 56, NULL, NULL, NULL);
INSERT [dbo].[SINHVIEN] ([MaSinhVien], [MaNguoiDung], [Lop], [BietDanh], [MSSV]) VALUES (32, 57, NULL, NULL, N'SV00000032');
INSERT [dbo].[SINHVIEN] ([MaSinhVien], [MaNguoiDung], [Lop], [BietDanh], [MSSV]) VALUES (33, 38, NULL, NULL, N'SV00000033');
INSERT [dbo].[SINHVIEN] ([MaSinhVien], [MaNguoiDung], [Lop], [BietDanh], [MSSV]) VALUES (34, 66, NULL, NULL, NULL);
INSERT [dbo].[SINHVIEN] ([MaSinhVien], [MaNguoiDung], [Lop], [BietDanh], [MSSV]) VALUES (35, 67, NULL, NULL, NULL);
INSERT [dbo].[SINHVIEN] ([MaSinhVien], [MaNguoiDung], [Lop], [BietDanh], [MSSV]) VALUES (36, 68, NULL, NULL, NULL);
SET IDENTITY_INSERT [dbo].[SINHVIEN] OFF;
GO

-- Dumping Data for [dbo].[SINHVIEN_LOPHOC]
SET IDENTITY_INSERT [dbo].[SINHVIEN_LOPHOC] ON;
INSERT [dbo].[SINHVIEN_LOPHOC] ([MaGhiDanh], [MaLopHoc], [NgayGhiDanh], [TrangThai], [MaSinhVien]) VALUES (157, 18, '2026-06-29T16:15:46.947Z', N'Đang học', 29);
INSERT [dbo].[SINHVIEN_LOPHOC] ([MaGhiDanh], [MaLopHoc], [NgayGhiDanh], [TrangThai], [MaSinhVien]) VALUES (162, 18, '2026-07-07T16:01:43.683Z', N'Đang học', 30);
INSERT [dbo].[SINHVIEN_LOPHOC] ([MaGhiDanh], [MaLopHoc], [NgayGhiDanh], [TrangThai], [MaSinhVien]) VALUES (163, 18, '2026-07-12T21:19:55.820Z', N'Đang học', 34);
INSERT [dbo].[SINHVIEN_LOPHOC] ([MaGhiDanh], [MaLopHoc], [NgayGhiDanh], [TrangThai], [MaSinhVien]) VALUES (164, 18, '2026-07-12T21:25:17.063Z', N'Từ chối', 35);
INSERT [dbo].[SINHVIEN_LOPHOC] ([MaGhiDanh], [MaLopHoc], [NgayGhiDanh], [TrangThai], [MaSinhVien]) VALUES (165, 23, '2026-07-14T14:52:28.880Z', N'Đang học', 36);
SET IDENTITY_INSERT [dbo].[SINHVIEN_LOPHOC] OFF;
GO

-- Dumping Data for [dbo].[TAILIEU]
SET IDENTITY_INSERT [dbo].[TAILIEU] ON;
INSERT [dbo].[TAILIEU] ([MaTaiLieu], [TieuDe], [MoTa], [NgayCapNhat], [MaBuoiHoc], [NoiDung], [FileUrl], [TrangThai], [MaGiangVien]) VALUES (15, N'n', N'', '2026-06-28T09:54:38.683Z', NULL, N'', N'', N'published', NULL);
INSERT [dbo].[TAILIEU] ([MaTaiLieu], [TieuDe], [MoTa], [NgayCapNhat], [MaBuoiHoc], [NoiDung], [FileUrl], [TrangThai], [MaGiangVien]) VALUES (16, N'c', N'', '2026-06-28T10:03:03.350Z', NULL, N'', N'', N'published', NULL);
INSERT [dbo].[TAILIEU] ([MaTaiLieu], [TieuDe], [MoTa], [NgayCapNhat], [MaBuoiHoc], [NoiDung], [FileUrl], [TrangThai], [MaGiangVien]) VALUES (17, N'Ôn tập từ vựng demo', N'Tài liệu mới', '2026-07-02T09:49:20.337Z', 36, N'', N'/uploads/1782960559932-BIÃN-Báº¢N-Há»P-ÄIá»U-CHá»NH-Dá»°-ÃN.pdf', N'published', NULL);
INSERT [dbo].[TAILIEU] ([MaTaiLieu], [TieuDe], [MoTa], [NgayCapNhat], [MaBuoiHoc], [NoiDung], [FileUrl], [TrangThai], [MaGiangVien]) VALUES (20, N'tl qtnd tạo', N'', '2026-07-03T15:29:43.040Z', NULL, N'', N'file:///C:/Users/THUY/Downloads/C%C3%A1c%20y%E1%BA%BFu%20t%E1%BB%91%20%E1%BA%A3nh%20h%C6%B0%E1%BB%9Fng%20%C4%91%E1%BA%BFn%20nh%E1%BA%ADn%20th%E1%BB%A9c%20v%E1%BB%81%20c%C3%B4ng%20ngh%E1%BB%87%20th%C3%B4ng%20tin%20xanh%20c%E1%BB%A7a%20sinh%20vi%C3%AAn%20tr%C6%B0%E1%BB%9Dng%20%C4%90%E1%BA%A1i%20h%E1%BB%8Dc%20S%C6%B0%20ph%E1%BA%A1m%20H%C3%A0%20N%E1%BB%99i..pdf', N'published', NULL);
INSERT [dbo].[TAILIEU] ([MaTaiLieu], [TieuDe], [MoTa], [NgayCapNhat], [MaBuoiHoc], [NoiDung], [FileUrl], [TrangThai], [MaGiangVien]) VALUES (22, N'tài liệu 1', N'Tài liệu mới', '2026-07-03T16:22:00.380Z', 37, N'', N'/uploads/1783070520016-CÃ¡c-yáº¿u-tá»-áº£nh-hÆ°á»ng-Äáº¿n-nháº­n-thá»©c-vá»-cÃ´ng-nghá»-thÃ´ng-tin-xanh-cá»§a-sinh-viÃªn-trÆ°á»ng-Äáº¡i-há»c-SÆ°-pháº¡m-HÃ-Ná»i..pdf', N'published', NULL);
INSERT [dbo].[TAILIEU] ([MaTaiLieu], [TieuDe], [MoTa], [NgayCapNhat], [MaBuoiHoc], [NoiDung], [FileUrl], [TrangThai], [MaGiangVien]) VALUES (23, N'tài liệu 2 - qtnd', N'', '2026-07-03T16:22:58.010Z', NULL, N'', N'https://pmc.ncbi.nlm.nih.gov/articles/PMC2610111/', N'published', NULL);
INSERT [dbo].[TAILIEU] ([MaTaiLieu], [TieuDe], [MoTa], [NgayCapNhat], [MaBuoiHoc], [NoiDung], [FileUrl], [TrangThai], [MaGiangVien]) VALUES (24, N'tài liệu 3 - gv', N'Tài liệu mới', '2026-07-03T16:23:41.133Z', 37, N'', N'https://pmc.ncbi.nlm.nih.gov/articles/PMC2610111/', N'published', NULL);
INSERT [dbo].[TAILIEU] ([MaTaiLieu], [TieuDe], [MoTa], [NgayCapNhat], [MaBuoiHoc], [NoiDung], [FileUrl], [TrangThai], [MaGiangVien]) VALUES (29, N'ti lieu nhp', N'Tài liệu mới', '2026-07-12T22:18:21.000Z', 36, N'', N'https://www.youtube.com/watch?v=drkoZsh2CQE&list=RDOmfG5jX1f3g&index=19', N'published', NULL);
INSERT [dbo].[TAILIEU] ([MaTaiLieu], [TieuDe], [MoTa], [NgayCapNhat], [MaBuoiHoc], [NoiDung], [FileUrl], [TrangThai], [MaGiangVien]) VALUES (30, N'Từ vựng đời sống', N'đây là các từ vưng
học kĩ - thực hành', '2026-07-14T14:41:29.520Z', 47, N'', N'/uploads/1784014906461-test-L1.2.docx', N'published', NULL);
INSERT [dbo].[TAILIEU] ([MaTaiLieu], [TieuDe], [MoTa], [NgayCapNhat], [MaBuoiHoc], [NoiDung], [FileUrl], [TrangThai], [MaGiangVien]) VALUES (32, N'â', N'', '2026-07-15T09:40:57.247Z', 46, N'cxfs', N'/uploads/1784083251211-[-CÃ´-VÅ©-Mai-PhÆ°Æ¡ng-]-Äá»-thi-kháº£o-sÃ¡t-cháº¥t-lÆ°á»£ng-nÄm-há»c-2025-2026_-Sá»-giÃ¡o-dá»¥c-vÃ-ÄÃ-o-táº¡o-Báº¯c-Ninh.pdf', N'published', NULL);
INSERT [dbo].[TAILIEU] ([MaTaiLieu], [TieuDe], [MoTa], [NgayCapNhat], [MaBuoiHoc], [NoiDung], [FileUrl], [TrangThai], [MaGiangVien]) VALUES (33, N'alides', N'', '2026-07-15T09:41:26.750Z', 46, N'abc', N'/uploads/1784083284213-[-CÃ´-VÅ©-Mai-PhÆ°Æ¡ng-]-Äá»-thi-kháº£o-sÃ¡t-cháº¥t-lÆ°á»£ng-nÄm-há»c-2025-2026_-Sá»-giÃ¡o-dá»¥c-vÃ-ÄÃ-o-táº¡o-Báº¯c-Ninh.pdf', N'published', NULL);
INSERT [dbo].[TAILIEU] ([MaTaiLieu], [TieuDe], [MoTa], [NgayCapNhat], [MaBuoiHoc], [NoiDung], [FileUrl], [TrangThai], [MaGiangVien]) VALUES (34, N'Slide demo', N'', '2026-07-15T09:46:01.150Z', 46, N'', N'/uploads/1784083557571-PPT-demo-xn.pptx', N'published', NULL);
SET IDENTITY_INSERT [dbo].[TAILIEU] OFF;
GO

-- Dumping Data for [dbo].[TIENDO_MINITEST]
SET IDENTITY_INSERT [dbo].[TIENDO_MINITEST] ON;
INSERT [dbo].[TIENDO_MINITEST] ([MaTienDo], [MaSinhVien], [MaBaiHoc], [DaXemVideo], [DaDatMinitest], [NgayCapNhat]) VALUES (1, N'23', 44, 0, 0, '2026-06-25T14:26:20.630Z');
INSERT [dbo].[TIENDO_MINITEST] ([MaTienDo], [MaSinhVien], [MaBaiHoc], [DaXemVideo], [DaDatMinitest], [NgayCapNhat]) VALUES (2, N'23', 43, 0, 0, '2026-06-25T11:05:29.800Z');
INSERT [dbo].[TIENDO_MINITEST] ([MaTienDo], [MaSinhVien], [MaBaiHoc], [DaXemVideo], [DaDatMinitest], [NgayCapNhat]) VALUES (3, N'23', 41, 1, 1, '2026-06-26T15:24:22.257Z');
INSERT [dbo].[TIENDO_MINITEST] ([MaTienDo], [MaSinhVien], [MaBaiHoc], [DaXemVideo], [DaDatMinitest], [NgayCapNhat]) VALUES (4, N'23', 49, 1, 1, '2026-06-29T08:45:13.857Z');
INSERT [dbo].[TIENDO_MINITEST] ([MaTienDo], [MaSinhVien], [MaBaiHoc], [DaXemVideo], [DaDatMinitest], [NgayCapNhat]) VALUES (5, N'23', 50, 1, 1, '2026-06-26T11:24:04.973Z');
INSERT [dbo].[TIENDO_MINITEST] ([MaTienDo], [MaSinhVien], [MaBaiHoc], [DaXemVideo], [DaDatMinitest], [NgayCapNhat]) VALUES (6, N'23', 42, 0, 0, '2026-06-29T08:32:30.730Z');
INSERT [dbo].[TIENDO_MINITEST] ([MaTienDo], [MaSinhVien], [MaBaiHoc], [DaXemVideo], [DaDatMinitest], [NgayCapNhat]) VALUES (7, N'23', 57, 1, 1, '2026-06-29T10:49:41.690Z');
INSERT [dbo].[TIENDO_MINITEST] ([MaTienDo], [MaSinhVien], [MaBaiHoc], [DaXemVideo], [DaDatMinitest], [NgayCapNhat]) VALUES (10, N'23', 62, 1, 1, '2026-07-01T00:15:40.390Z');
INSERT [dbo].[TIENDO_MINITEST] ([MaTienDo], [MaSinhVien], [MaBaiHoc], [DaXemVideo], [DaDatMinitest], [NgayCapNhat]) VALUES (12, N'29', 41, 1, 0, '2026-07-01T09:36:40.367Z');
INSERT [dbo].[TIENDO_MINITEST] ([MaTienDo], [MaSinhVien], [MaBaiHoc], [DaXemVideo], [DaDatMinitest], [NgayCapNhat]) VALUES (20, N'29', 52, 1, 0, '2026-07-10T15:57:10.310Z');
INSERT [dbo].[TIENDO_MINITEST] ([MaTienDo], [MaSinhVien], [MaBaiHoc], [DaXemVideo], [DaDatMinitest], [NgayCapNhat]) VALUES (21, N'29', 138, 1, 1, '2026-07-13T16:50:08.060Z');
SET IDENTITY_INSERT [dbo].[TIENDO_MINITEST] OFF;
GO

-- Dumping Data for [dbo].[VAITRO]
SET IDENTITY_INSERT [dbo].[VAITRO] ON;
INSERT [dbo].[VAITRO] ([MaVaiTro], [TenVaiTro]) VALUES (1, N'Admin');
INSERT [dbo].[VAITRO] ([MaVaiTro], [TenVaiTro]) VALUES (2, N'Giảng viên');
INSERT [dbo].[VAITRO] ([MaVaiTro], [TenVaiTro]) VALUES (5, N'Học viên chưa có lớp học');
INSERT [dbo].[VAITRO] ([MaVaiTro], [TenVaiTro]) VALUES (3, N'Học viên đã đăng ký khóa học');
INSERT [dbo].[VAITRO] ([MaVaiTro], [TenVaiTro]) VALUES (4, N'Quản trị nội dung');
SET IDENTITY_INSERT [dbo].[VAITRO] OFF;
GO

-- Dumping Data for [dbo].[VAITRO_QUYENHAN]
INSERT [dbo].[VAITRO_QUYENHAN] ([MaVaiTro], [MaQuyenHan]) VALUES (1, 1);
INSERT [dbo].[VAITRO_QUYENHAN] ([MaVaiTro], [MaQuyenHan]) VALUES (1, 2);
INSERT [dbo].[VAITRO_QUYENHAN] ([MaVaiTro], [MaQuyenHan]) VALUES (1, 3);
INSERT [dbo].[VAITRO_QUYENHAN] ([MaVaiTro], [MaQuyenHan]) VALUES (1, 4);
INSERT [dbo].[VAITRO_QUYENHAN] ([MaVaiTro], [MaQuyenHan]) VALUES (1, 5);
INSERT [dbo].[VAITRO_QUYENHAN] ([MaVaiTro], [MaQuyenHan]) VALUES (1, 6);
INSERT [dbo].[VAITRO_QUYENHAN] ([MaVaiTro], [MaQuyenHan]) VALUES (1, 7);
INSERT [dbo].[VAITRO_QUYENHAN] ([MaVaiTro], [MaQuyenHan]) VALUES (1, 8);
INSERT [dbo].[VAITRO_QUYENHAN] ([MaVaiTro], [MaQuyenHan]) VALUES (1, 9);
INSERT [dbo].[VAITRO_QUYENHAN] ([MaVaiTro], [MaQuyenHan]) VALUES (1, 10);
INSERT [dbo].[VAITRO_QUYENHAN] ([MaVaiTro], [MaQuyenHan]) VALUES (1, 11);
INSERT [dbo].[VAITRO_QUYENHAN] ([MaVaiTro], [MaQuyenHan]) VALUES (1, 12);
INSERT [dbo].[VAITRO_QUYENHAN] ([MaVaiTro], [MaQuyenHan]) VALUES (1, 13);
INSERT [dbo].[VAITRO_QUYENHAN] ([MaVaiTro], [MaQuyenHan]) VALUES (1, 14);
INSERT [dbo].[VAITRO_QUYENHAN] ([MaVaiTro], [MaQuyenHan]) VALUES (1, 15);
INSERT [dbo].[VAITRO_QUYENHAN] ([MaVaiTro], [MaQuyenHan]) VALUES (1, 16);
INSERT [dbo].[VAITRO_QUYENHAN] ([MaVaiTro], [MaQuyenHan]) VALUES (1, 17);
INSERT [dbo].[VAITRO_QUYENHAN] ([MaVaiTro], [MaQuyenHan]) VALUES (1, 18);
INSERT [dbo].[VAITRO_QUYENHAN] ([MaVaiTro], [MaQuyenHan]) VALUES (1, 19);
INSERT [dbo].[VAITRO_QUYENHAN] ([MaVaiTro], [MaQuyenHan]) VALUES (1, 20);
INSERT [dbo].[VAITRO_QUYENHAN] ([MaVaiTro], [MaQuyenHan]) VALUES (1, 21);
INSERT [dbo].[VAITRO_QUYENHAN] ([MaVaiTro], [MaQuyenHan]) VALUES (1, 22);
GO

-- Foreign Key Constraints
ALTER TABLE [dbo].[BAINOPTHEM] ADD CONSTRAINT [FK_BAINOPTHEM_LUYENTAPTHEM] FOREIGN KEY ([MaLuyenTapThem]) REFERENCES [dbo].[LUYENTAPTHEM] ([MaLuyenTapThem]);
ALTER TABLE [dbo].[BAITAP] ADD CONSTRAINT [FK_EXERCISE_BAIHOCKHOAHOC] FOREIGN KEY ([MaBaiHoc]) REFERENCES [dbo].[BAIHOCKHOAHOC] ([MaBaiHoc]);
ALTER TABLE [dbo].[LUYENTAPTHEM] ADD CONSTRAINT [FK_LUYENTAPTHEM_BAIHOCKHOAHOC] FOREIGN KEY ([MaBaiHoc]) REFERENCES [dbo].[BAIHOCKHOAHOC] ([MaBaiHoc]);
ALTER TABLE [dbo].[BAITAP] ADD CONSTRAINT [FK_BaiTap_BaiHocKhoaHoc] FOREIGN KEY ([MaBaiHoc]) REFERENCES [dbo].[BAIHOCKHOAHOC] ([MaBaiHoc]);
ALTER TABLE [dbo].[MINITEST] ADD CONSTRAINT [FK__MINITEST__MaBaiH__5AB9788F] FOREIGN KEY ([MaBaiHoc]) REFERENCES [dbo].[BAIHOCKHOAHOC] ([MaBaiHoc]);
ALTER TABLE [dbo].[TIENDO_MINITEST] ADD CONSTRAINT [FK__TIENDO_MI__MaBai__607251E5] FOREIGN KEY ([MaBaiHoc]) REFERENCES [dbo].[BAIHOCKHOAHOC] ([MaBaiHoc]);
ALTER TABLE [dbo].[TIENDOHOCTAP] ADD CONSTRAINT [FK__TIENDOHOC__MaBai__76969D2E] FOREIGN KEY ([MaBaiHoc]) REFERENCES [dbo].[BAIHOCKHOAHOC] ([MaBaiHoc]);
ALTER TABLE [dbo].[PHANCONGGIANGVIEN] ADD CONSTRAINT [FK_PCGV_GIANGVIEN] FOREIGN KEY ([MaGiangVien]) REFERENCES [dbo].[GIANGVIEN] ([MaGiangVien]);
ALTER TABLE [dbo].[BAIHOCKHOAHOC] ADD CONSTRAINT [FK__BAIHOCKHO__MaKho__59FA5E80] FOREIGN KEY ([MaKhoaHoc]) REFERENCES [dbo].[KHOAHOC] ([MaKhoaHoc]);
ALTER TABLE [dbo].[DANGKYKHOAHOC] ADD CONSTRAINT [FK__DANGKYKHO__MaKho__628FA481] FOREIGN KEY ([MaKhoaHoc]) REFERENCES [dbo].[KHOAHOC] ([MaKhoaHoc]);
ALTER TABLE [dbo].[KHOAHOCCHITIET] ADD CONSTRAINT [FK__KHOAHOCCH__MaKho__6B24EA82] FOREIGN KEY ([MaKhoaHoc]) REFERENCES [dbo].[KHOAHOC] ([MaKhoaHoc]);
ALTER TABLE [dbo].[TONGKETKHOAHOC] ADD CONSTRAINT [FK__TONGKETKH__MaKho__778AC167] FOREIGN KEY ([MaKhoaHoc]) REFERENCES [dbo].[KHOAHOC] ([MaKhoaHoc]);
ALTER TABLE [dbo].[LOPHOC] ADD CONSTRAINT [FK__LOPHOC__MaLop__6E01572D] FOREIGN KEY ([MaLop]) REFERENCES [dbo].[KHOAHOCCHITIET] ([MaLop]);
ALTER TABLE [dbo].[PHANCONGGIANGVIEN] ADD CONSTRAINT [FK_PCGV_KYNANG] FOREIGN KEY ([MaKyNang]) REFERENCES [dbo].[KYNANG] ([MaKyNang]);
ALTER TABLE [dbo].[BAIKIEMTRA] ADD CONSTRAINT [FK_BAIKIEMTRA_LESSON] FOREIGN KEY ([MaLesson]) REFERENCES [dbo].[BUOIHOC] ([MaBuoiHoc]);
ALTER TABLE [dbo].[BAIKIEMTRA] ADD CONSTRAINT [FK_BaiKiemTra_BuoiHoc] FOREIGN KEY ([MaBuoiHoc]) REFERENCES [dbo].[BUOIHOC] ([MaBuoiHoc]);
ALTER TABLE [dbo].[LUYENTAPTHEM] ADD CONSTRAINT [FK_LuyenTapThem_BuoiHoc] FOREIGN KEY ([MaBuoiHoc]) REFERENCES [dbo].[BUOIHOC] ([MaBuoiHoc]);
ALTER TABLE [dbo].[BAIHOCKHOAHOC] ADD CONSTRAINT [FK_BaiHocKhoaHoc_Lesson] FOREIGN KEY ([MaBuoiHoc]) REFERENCES [dbo].[BUOIHOC] ([MaBuoiHoc]);
ALTER TABLE [dbo].[TAILIEU] ADD CONSTRAINT [FK__TAILIEU__MaLesso__75A278F5] FOREIGN KEY ([MaBuoiHoc]) REFERENCES [dbo].[BUOIHOC] ([MaBuoiHoc]);
ALTER TABLE [dbo].[PHANCONGGIANGVIEN] ADD CONSTRAINT [FK_PCGV_LOPHOC] FOREIGN KEY ([MaLopHoc]) REFERENCES [dbo].[LOPHOC] ([MaLopHoc]);
ALTER TABLE [dbo].[BUOIHOC] ADD CONSTRAINT [FK__LESSON__MaLopHoc__6D0D32F4] FOREIGN KEY ([MaLopHoc]) REFERENCES [dbo].[LOPHOC] ([MaLopHoc]);
ALTER TABLE [dbo].[SINHVIEN_LOPHOC] ADD CONSTRAINT [FK__SINHVIEN___MaLop__73BA3083] FOREIGN KEY ([MaLopHoc]) REFERENCES [dbo].[LOPHOC] ([MaLopHoc]);
ALTER TABLE [dbo].[SINHVIEN] ADD CONSTRAINT [FK__SINHVIEN__MaNguo__540C7B00] FOREIGN KEY ([MaNguoiDung]) REFERENCES [dbo].[NGUOIDUNG] ([MaNguoiDung]);
ALTER TABLE [dbo].[ADMIN] ADD CONSTRAINT [FK__ADMIN__MaNguoiDu__571DF1D5] FOREIGN KEY ([MaNguoiDung]) REFERENCES [dbo].[NGUOIDUNG] ([MaNguoiDung]);
ALTER TABLE [dbo].[GIANGVIEN] ADD CONSTRAINT [FK__GIANGVIEN__MaNgu__6754599E] FOREIGN KEY ([MaNguoiDung]) REFERENCES [dbo].[NGUOIDUNG] ([MaNguoiDung]);
ALTER TABLE [dbo].[DETHI] ADD CONSTRAINT [FK_DETHI_NGUOIDUNG] FOREIGN KEY ([MaNguoiDung]) REFERENCES [dbo].[NGUOIDUNG] ([MaNguoiDung]);
ALTER TABLE [dbo].[DETHI] ADD CONSTRAINT [FK_DETHI_NGUOIDUNG_DUYET] FOREIGN KEY ([MaNguoiDuyet]) REFERENCES [dbo].[NGUOIDUNG] ([MaNguoiDung]);
ALTER TABLE [dbo].[KHOAHOC] ADD CONSTRAINT [FK__KHOAHOC__MaNguoi__693CA210] FOREIGN KEY ([MaNguoiDung]) REFERENCES [dbo].[NGUOIDUNG] ([MaNguoiDung]);
ALTER TABLE [dbo].[QUANTRIVIENNOIDUNG] ADD CONSTRAINT [FK__QUANTRIVI__MaNgu__71D1E811] FOREIGN KEY ([MaNguoiDung]) REFERENCES [dbo].[NGUOIDUNG] ([MaNguoiDung]);
ALTER TABLE [dbo].[SINHVIEN_LOPHOC] ADD CONSTRAINT [FK__SINHVIEN___MaSin__55009F39] FOREIGN KEY ([MaSinhVien]) REFERENCES [dbo].[SINHVIEN] ([MaSinhVien]);
ALTER TABLE [dbo].[DANGKYKHOAHOC] ADD CONSTRAINT [FK__DANGKYKHO__MaSin__55F4C372] FOREIGN KEY ([MaSinhVien]) REFERENCES [dbo].[SINHVIEN] ([MaSinhVien]);
ALTER TABLE [dbo].[BAINOP] ADD CONSTRAINT [FK__BAINOP__MaSinhVi__56E8E7AB] FOREIGN KEY ([MaSinhVien]) REFERENCES [dbo].[SINHVIEN] ([MaSinhVien]);
ALTER TABLE [dbo].[DETHI_SUBMISSIONS] ADD CONSTRAINT [FK_DETHI_SUBMISSIONS_SINHVIEN] FOREIGN KEY ([MaSinhVien]) REFERENCES [dbo].[SINHVIEN] ([MaSinhVien]);
ALTER TABLE [dbo].[DETHI_SUBMISSIONS] ADD CONSTRAINT [FK_DETHI_SUBMISSIONS_DETHI] FOREIGN KEY ([MaDeThi]) REFERENCES [dbo].[DETHI] ([MaDeThi]);
ALTER TABLE [dbo].[VAITRO_QUYENHAN] ADD CONSTRAINT [FK_VTQH_VAITRO] FOREIGN KEY ([MaVaiTro]) REFERENCES [dbo].[VAITRO] ([MaVaiTro]);
ALTER TABLE [dbo].[NGUOIDUNG] ADD CONSTRAINT [FK_NGUOIDUNG_VAITRO] FOREIGN KEY ([MaVaiTro]) REFERENCES [dbo].[VAITRO] ([MaVaiTro]);
ALTER TABLE [dbo].[VAITRO_QUYENHAN] ADD CONSTRAINT [FK_VTQH_QUYENHAN] FOREIGN KEY ([MaQuyenHan]) REFERENCES [dbo].[QUYENHAN] ([MaQuyenHan]);
GO

-- Re-enable constraints
EXEC sp_MSforeachtable "ALTER TABLE ? WITH CHECK CHECK CONSTRAINT all";
GO
