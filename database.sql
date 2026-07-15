USE [Website]
GO
/****** Object:  Table [dbo].[ADMIN]    Script Date: 07/04/2026 7:40:09 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ADMIN](
	[MaAdmin] [int] IDENTITY(1,1) NOT NULL,
	[MaNguoiDung] [int] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[MaAdmin] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

/****** Object:  Table [dbo].[BAIHOCKHOAHOC]    Script Date: 07/04/2026 7:40:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[BAIHOCKHOAHOC](
	[MaBaiHoc] [int] IDENTITY(1,1) NOT NULL,
	[MaKhoaHoc] [int] NOT NULL,
	[MaGiangVien] [int] NOT NULL,
	[TieuDe] [nvarchar](255) NOT NULL,
	[NoiDung] [nvarchar](max) NULL,
	[ThuTu] [int] NULL,
	[LoaiBaiHoc] [nvarchar](50) NULL,
	[ThoiLuong] [nvarchar](50) NULL,
	[TrangThai] [nvarchar](20) NULL,
	[MaBuoiHoc] [int] NULL,
	[FileUrl] [nvarchar](500) NULL,
PRIMARY KEY CLUSTERED 
(
	[MaBaiHoc] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

/****** Object:  Table [dbo].[BAIKIEMTRA]    Script Date: 07/04/2026 7:40:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[BAIKIEMTRA](
	[MaBaiKiemTra] [int] IDENTITY(1,1) NOT NULL,
	[MaBuoiHoc] [int] NULL,
	[MaGiangVien] [int] NOT NULL,
	[TenBai] [nvarchar](255) NOT NULL,
	[ThoiGian] [int] NULL,
	[TongDiem] [float] NULL,
PRIMARY KEY CLUSTERED 
(
	[MaBaiKiemTra] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[BAINOP]    Script Date: 07/04/2026 7:40:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[BAINOP](
	[MaBaiNop] [int] IDENTITY(1,1) NOT NULL,
	[MaBaiTap] [int] NOT NULL,
	[MaSinhVien] [nvarchar](50) NULL,
	[NoiDung] [nvarchar](max) NULL,
	[NgayNop] [datetime] NULL,
	[Diem] [float] NULL,
	[NhanXet] [nvarchar](max) NULL,
	[TrangThai] [nvarchar](50) NULL,
PRIMARY KEY CLUSTERED 
(
	[MaBaiNop] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

/****** Object:  Table [dbo].[CAUHOI]    Script Date: 07/04/2026 7:40:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[CAUHOI](
	[MaCauHoi] [int] IDENTITY(1,1) NOT NULL,
	[MaBaiKiemTra] [int] NOT NULL,
	[NoiDung] [nvarchar](max) NOT NULL,
	[LoaiCauHoi] [nvarchar](50) NULL,
	[Diem] [float] NULL,
PRIMARY KEY CLUSTERED 
(
	[MaCauHoi] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[DANGKYKHOAHOC]    Script Date: 07/04/2026 7:40:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[DANGKYKHOAHOC](
	[MaDangKy] [int] IDENTITY(1,1) NOT NULL,
	[MaKhoaHoc] [int] NOT NULL,
	[MaSinhVien] [nvarchar](20) NULL,
	[NgayDangKy] [datetime] NULL,
	[TrangThai] [nvarchar](20) NULL,
PRIMARY KEY CLUSTERED 
(
	[MaDangKy] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[DAPAN]    Script Date: 07/04/2026 7:40:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[DAPAN](
	[MaDapAn] [int] IDENTITY(1,1) NOT NULL,
	[MaCauHoi] [int] NOT NULL,
	[NoiDung] [nvarchar](max) NOT NULL,
	[DungSai] [bit] NULL,
PRIMARY KEY CLUSTERED 
(
	[MaDapAn] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

/****** Object:  Table [dbo].[BAITAP]    Script Date: 07/04/2026 7:40:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[BAITAP](
	[MaBaiTap] [int] IDENTITY(1,1) NOT NULL,
	[Title] [nvarchar](255) NULL,
	[Type] [nvarchar](100) NULL,
	[CreatedDate] [nvarchar](50) NULL,
	[MaBaiHoc] [int] NULL,
	[Content] [nvarchar](max) NULL,
	[Questions] [nvarchar](max) NULL,
	[Vocabulary] [nvarchar](max) NULL,
	[AudioUrl] [nvarchar](500) NULL,
	[ShowAnswer] [bit] NULL,
PRIMARY KEY CLUSTERED 
(
	[MaBaiTap] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[GIANGVIEN]    Script Date: 07/04/2026 7:40:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[GIANGVIEN](
	[MaGiangVien] [int] IDENTITY(1,1) NOT NULL,
	[MaNguoiDung] [int] NOT NULL,
	[HocVi] [nvarchar](50) NULL,
	[ChuyenMon] [nvarchar](100) NULL,
	[SoDienThoai] [nvarchar](20) NULL,
	[KinhNghiem] [nvarchar](100) NULL,
	[GioiThieu] [nvarchar](max) NULL,
PRIMARY KEY CLUSTERED 
(
	[MaGiangVien] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[KETQUABAIKIEMTRA]    Script Date: 07/04/2026 7:40:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[KETQUABAIKIEMTRA](
	[MaKetQua] [int] IDENTITY(1,1) NOT NULL,
	[MaBaiKiemTra] [int] NOT NULL,
	[MaSinhVien] [int] NOT NULL,
	[Diem] [float] NULL,
	[ThoiGianLamBai] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[MaKetQua] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[KHOAHOC]    Script Date: 07/04/2026 7:40:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[KHOAHOC](
	[MaKhoaHoc] [int] IDENTITY(1,1) NOT NULL,
	[TenKhoaHoc] [nvarchar](255) NOT NULL,
	[MoTa] [nvarchar](max) NULL,
	[TrinhDo] [nvarchar](50) NULL,
	[TrangThai] [nvarchar](20) NULL,
	[MaNguoiDung] [int] NOT NULL,
	[NgayTao] [datetime] NULL,
	[NgayDuyet] [datetime] NULL,
	[MaGiaoVien] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[MaKhoaHoc] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[KHOAHOCCHITIET]    Script Date: 07/04/2026 7:40:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[KHOAHOCCHITIET](
	[MaLop] [int] IDENTITY(1,1) NOT NULL,
	[TenLop] [nvarchar](255) NOT NULL,
	[MoTa] [nvarchar](max) NULL,
	[HocPhi] [int] NULL,
	[ThoiLuong] [nvarchar](100) NULL,
	[MaKhoaHoc] [int] NULL,
	[TrangThai] [nvarchar](50) NULL,
PRIMARY KEY CLUSTERED 
(
	[MaLop] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[KYNANG]    Script Date: 07/04/2026 7:40:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[KYNANG](
	[MaKyNang] [int] IDENTITY(1,1) NOT NULL,
	[LoaiKyNang] [nvarchar](50) NULL,
	[NoiDung] [nvarchar](max) NULL,
PRIMARY KEY CLUSTERED 
(
	[MaKyNang] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[BUOIHOC]    Script Date: 07/04/2026 7:40:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[BUOIHOC](
	[MaBuoiHoc] [int] IDENTITY(1,1) NOT NULL,
	[TenBuoiHoc] [nvarchar](255) NULL,
	[MaLopHoc] [int] NULL,
	[MoTa] [nvarchar](500) NULL,
	[NgayBatDau] [date] NULL,
	[NgayKetThuc] [date] NULL,
	[ThuTu] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[MaBuoiHoc] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[LOPHOC]    Script Date: 07/04/2026 7:40:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[LOPHOC](
	[MaLopHoc] [int] IDENTITY(1,1) NOT NULL,
	[TenLop] [nvarchar](255) NOT NULL,
	[MaLop] [int] NOT NULL,
	[LichHoc] [nvarchar](255) NULL,
	[SoLuongHocVien] [int] NULL,
	[TienDo] [int] NULL,
	[MaGiangVien] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[MaLopHoc] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[NGUOIDUNG]    Script Date: 07/04/2026 7:40:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[NGUOIDUNG](
	[MaNguoiDung] [int] IDENTITY(1,1) NOT NULL,
	[TenDangNhap] [nvarchar](50) NOT NULL,
	[MatKhau] [nvarchar](255) NOT NULL,
	[HoTen] [nvarchar](100) NOT NULL,
	[Email] [nvarchar](100) NOT NULL,
	[NgaySinh] [date] NULL,
	[GioiTinh] [nvarchar](10) NULL,
	[TrangThai] [nvarchar](20) NULL,
	[NgayTao] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[MaNguoiDung] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[PHANCONGGIANGVIEN]    Script Date: 07/04/2026 7:40:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[PHANCONGGIANGVIEN](
	[MaPhanCong] [int] IDENTITY(1,1) NOT NULL,
	[MaKhoaHoc] [int] NOT NULL,
	[MaGiangVien] [int] NOT NULL,
	[NgayPhanCong] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[MaPhanCong] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[QUANTRIVIENNOIDUNG]    Script Date: 07/04/2026 7:40:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[QUANTRIVIENNOIDUNG](
	[MaQTVND] [int] IDENTITY(1,1) NOT NULL,
	[MaNguoiDung] [int] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[MaQTVND] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[SINHVIEN]    Script Date: 07/04/2026 7:40:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[SINHVIEN](
	[MaNguoiDung] [int] NOT NULL,
	[Lop] [nvarchar](50) NULL,
	[MaSinhVien] [nvarchar](20) NOT NULL,
	[BietDanh] [nvarchar](100) NULL,
 CONSTRAINT [PK_SINHVIEN] PRIMARY KEY CLUSTERED 
(
	[MaSinhVien] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[SINHVIEN_LOPHOC]    Script Date: 07/04/2026 7:40:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[SINHVIEN_LOPHOC](
	[MaGhiDanh] [int] IDENTITY(1,1) NOT NULL,
	[MaLopHoc] [int] NOT NULL,
	[MaSinhVien] [nvarchar](20) NOT NULL,
	[NgayGhiDanh] [datetime] NULL,
	[TrangThai] [nvarchar](20) NULL,
PRIMARY KEY CLUSTERED 
(
	[MaGhiDanh] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TAILIEU]    Script Date: 07/04/2026 7:40:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TAILIEU](
	[MaTaiLieu] [int] IDENTITY(1,1) NOT NULL,
	[TieuDe] [nvarchar](255) NOT NULL,
	[MoTa] [nvarchar](max) NULL,
	[NgayCapNhat] [datetime] NULL,
	[MaBuoiHoc] [int] NULL,
	[NoiDung] [nvarchar](max) NULL,
	[FileUrl] [nvarchar](500) NULL,
PRIMARY KEY CLUSTERED 
(
	[MaTaiLieu] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TIENDOHOCTAP]    Script Date: 07/04/2026 7:40:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TIENDOHOCTAP](
	[MaTienDo] [int] IDENTITY(1,1) NOT NULL,
	[MaSinhVien] [int] NOT NULL,
	[MaBaiHoc] [int] NOT NULL,
	[TrangThai] [nvarchar](20) NULL,
	[ThoiDiemHoanThanh] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[MaTienDo] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TONGKETKHOAHOC]    Script Date: 07/04/2026 7:40:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TONGKETKHOAHOC](
	[MaTongKet] [int] IDENTITY(1,1) NOT NULL,
	[MaSinhVien] [int] NOT NULL,
	[MaKhoaHoc] [int] NOT NULL,
	[DiemTrungBinh] [float] NULL,
	[TyLeHoanThanh] [float] NULL,
	[NhanXetGiangVien] [nvarchar](max) NULL,
PRIMARY KEY CLUSTERED 
(
	[MaTongKet] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

SET IDENTITY_INSERT [dbo].[ADMIN] ON 
GO
INSERT [dbo].[ADMIN] ([MaAdmin], [MaNguoiDung]) VALUES (1, 3)
GO
SET IDENTITY_INSERT [dbo].[ADMIN] OFF
GO
SET IDENTITY_INSERT [dbo].[BAIHOCKHOAHOC] ON 
GO
INSERT [dbo].[BAIHOCKHOAHOC] ([MaBaiHoc], [MaKhoaHoc], [MaGiangVien], [TieuDe], [NoiDung], [ThuTu], [LoaiBaiHoc], [ThoiLuong], [TrangThai], [MaBuoiHoc], [FileUrl]) VALUES (3, 1, 1, N'Từ vựng TOEIC cơ bản', N'Học 500 từ vựng nền tảng TOEIC', 1, N'Video', N'45 phút', N'published', 1, NULL)
GO
INSERT [dbo].[BAIHOCKHOAHOC] ([MaBaiHoc], [MaKhoaHoc], [MaGiangVien], [TieuDe], [NoiDung], [ThuTu], [LoaiBaiHoc], [ThoiLuong], [TrangThai], [MaBuoiHoc], [FileUrl]) VALUES (4, 1, 1, N'Bài tập từ vựng', N'
<h2>🎯 Learning Objectives</h2>
<p>By the end of this lesson, learners will be able to:</p>
<ul>
  <li>Understand why English has different accents around the world.</li>
  <li>Recognize key differences between American and British accents.</li>
  <li>Identify important keywords even when pronunciation changes.</li>
</ul>

<h2>1) Why Do Different Accents Exist in English?</h2>
<p>English is spoken in many countries. Each region has:</p>
<ul>
  <li>Different cultural influences</li>
  <li>Different speech rhythm</li>
  <li>Different mouth and tongue positioning</li>
</ul>

<h2>2) American vs. British Accent Comparison</h2>
<table>
  <thead>
    <tr><th>Feature</th><th>American Accent</th><th>British Accent</th></tr>
  </thead>
  <tbody>
    <tr><td>Tone & Rhythm</td><td>Relaxed, natural</td><td>Clear, sometimes more formal</td></tr>
    <tr><td>Vowel sounds</td><td>Open and rounded</td><td>Often narrower and more tense</td></tr>
    <tr><td>Pronunciation of r</td><td>Strong r sound: car /kar/</td><td>Usually drops r at the end: car /kaa/</td></tr>
  </tbody>
</table>
', 2, N'PDF', N'30 phút', N'published', 1, NULL)
GO
INSERT [dbo].[BAIHOCKHOAHOC] ([MaBaiHoc], [MaKhoaHoc], [MaGiangVien], [TieuDe], [NoiDung], [ThuTu], [LoaiBaiHoc], [ThoiLuong], [TrangThai], [MaBuoiHoc], [FileUrl]) VALUES (5, 1, 1, N'Thì hiện tại đơn', N'Cấu trúc và cách dùng thì hiện tại đơn', 1, N'Video', N'45 phút', N'published', 2, NULL)
GO
INSERT [dbo].[BAIHOCKHOAHOC] ([MaBaiHoc], [MaKhoaHoc], [MaGiangVien], [TieuDe], [NoiDung], [ThuTu], [LoaiBaiHoc], [ThoiLuong], [TrangThai], [MaBuoiHoc], [FileUrl]) VALUES (6, 1, 1, N'Thì hiện tại tiếp diễn', N'Cấu trúc và cách dùng', 2, N'PDF', N'30 phút', N'draft', 2, NULL)
GO
INSERT [dbo].[BAIHOCKHOAHOC] ([MaBaiHoc], [MaKhoaHoc], [MaGiangVien], [TieuDe], [NoiDung], [ThuTu], [LoaiBaiHoc], [ThoiLuong], [TrangThai], [MaBuoiHoc], [FileUrl]) VALUES (7, 1, 1, N'Listening Part 1 - Hình ảnh', N'Mô tả hình ảnh trong TOEIC', 1, N'Video', N'50 phút', N'published', 3, NULL)
GO
INSERT [dbo].[BAIHOCKHOAHOC] ([MaBaiHoc], [MaKhoaHoc], [MaGiangVien], [TieuDe], [NoiDung], [ThuTu], [LoaiBaiHoc], [ThoiLuong], [TrangThai], [MaBuoiHoc], [FileUrl]) VALUES (8, 1, 1, N'Bài tập Listening Part 1', N'Luyện nghe mô tả tranh', 2, N'Writing', N'40 phút', N'draft', 3, NULL)
GO
INSERT [dbo].[BAIHOCKHOAHOC] ([MaBaiHoc], [MaKhoaHoc], [MaGiangVien], [TieuDe], [NoiDung], [ThuTu], [LoaiBaiHoc], [ThoiLuong], [TrangThai], [MaBuoiHoc], [FileUrl]) VALUES (9, 1, 1, N'Listening Part 2 - Hỏi đáp', N'Các dạng câu hỏi trong Part 2', 1, N'Video', N'45 phút', N'published', 4, NULL)
GO
INSERT [dbo].[BAIHOCKHOAHOC] ([MaBaiHoc], [MaKhoaHoc], [MaGiangVien], [TieuDe], [NoiDung], [ThuTu], [LoaiBaiHoc], [ThoiLuong], [TrangThai], [MaBuoiHoc], [FileUrl]) VALUES (10, 1, 1, N'Bài tập Listening Part 2', N'Luyện tập hỏi đáp ngắn', 2, N'PDF', N'35 phút', N'draft', 4, NULL)
GO
INSERT [dbo].[BAIHOCKHOAHOC] ([MaBaiHoc], [MaKhoaHoc], [MaGiangVien], [TieuDe], [NoiDung], [ThuTu], [LoaiBaiHoc], [ThoiLuong], [TrangThai], [MaBuoiHoc], [FileUrl]) VALUES (11, 1, 1, N'Reading Part 5 - Ngữ pháp', N'Điền từ vào chỗ trống', 1, N'Video', N'50 phút', N'published', 5, NULL)
GO
INSERT [dbo].[BAIHOCKHOAHOC] ([MaBaiHoc], [MaKhoaHoc], [MaGiangVien], [TieuDe], [NoiDung], [ThuTu], [LoaiBaiHoc], [ThoiLuong], [TrangThai], [MaBuoiHoc], [FileUrl]) VALUES (12, 1, 1, N'Bài tập Reading Part 5', N'Luyện tập ngữ pháp', 2, N'PDF', N'40 phút', N'draft', 5, NULL)
GO
INSERT [dbo].[BAIHOCKHOAHOC] ([MaBaiHoc], [MaKhoaHoc], [MaGiangVien], [TieuDe], [NoiDung], [ThuTu], [LoaiBaiHoc], [ThoiLuong], [TrangThai], [MaBuoiHoc], [FileUrl]) VALUES (13, 1, 1, N'Reading Part 6 - Điền đoạn', N'Kỹ thuật điền đoạn văn', 1, N'Video', N'50 phút', N'published', 6, NULL)
GO
INSERT [dbo].[BAIHOCKHOAHOC] ([MaBaiHoc], [MaKhoaHoc], [MaGiangVien], [TieuDe], [NoiDung], [ThuTu], [LoaiBaiHoc], [ThoiLuong], [TrangThai], [MaBuoiHoc], [FileUrl]) VALUES (14, 1, 1, N'Bài tập Reading Part 6', N'Luyện tập điền đoạn', 2, N'Writing', N'40 phút', N'draft', 6, NULL)
GO
INSERT [dbo].[BAIHOCKHOAHOC] ([MaBaiHoc], [MaKhoaHoc], [MaGiangVien], [TieuDe], [NoiDung], [ThuTu], [LoaiBaiHoc], [ThoiLuong], [TrangThai], [MaBuoiHoc], [FileUrl]) VALUES (15, 1, 1, N'Listening Part 3 - Hội thoại', N'Nghe hội thoại và trả lời câu hỏi', 1, N'Video', N'55 phút', N'published', 7, NULL)
GO
INSERT [dbo].[BAIHOCKHOAHOC] ([MaBaiHoc], [MaKhoaHoc], [MaGiangVien], [TieuDe], [NoiDung], [ThuTu], [LoaiBaiHoc], [ThoiLuong], [TrangThai], [MaBuoiHoc], [FileUrl]) VALUES (16, 1, 1, N'Bài tập Listening Part 3', N'Luyện nghe hội thoại', 2, N'PDF', N'40 phút', N'draft', 7, NULL)
GO
INSERT [dbo].[BAIHOCKHOAHOC] ([MaBaiHoc], [MaKhoaHoc], [MaGiangVien], [TieuDe], [NoiDung], [ThuTu], [LoaiBaiHoc], [ThoiLuong], [TrangThai], [MaBuoiHoc], [FileUrl]) VALUES (17, 1, 1, N'Bài nói ngắn', N'Luyện kỹ năng nói ngắn', 1, N'Video', N'45 phút', N'published', 8, NULL)
GO
INSERT [dbo].[BAIHOCKHOAHOC] ([MaBaiHoc], [MaKhoaHoc], [MaGiangVien], [TieuDe], [NoiDung], [ThuTu], [LoaiBaiHoc], [ThoiLuong], [TrangThai], [MaBuoiHoc], [FileUrl]) VALUES (18, 1, 1, N'Bài tập nói', N'Thực hành nói theo chủ đề', 2, N'Writing', N'35 phút', N'draft', 8, NULL)
GO
INSERT [dbo].[BAIHOCKHOAHOC] ([MaBaiHoc], [MaKhoaHoc], [MaGiangVien], [TieuDe], [NoiDung], [ThuTu], [LoaiBaiHoc], [ThoiLuong], [TrangThai], [MaBuoiHoc], [FileUrl]) VALUES (19, 1, 1, N'Reading Part 7 - Đọc hiểu', N'Kỹ thuật đọc hiểu đoạn dài', 1, N'Video', N'60 phút', N'published', 9, NULL)
GO
INSERT [dbo].[BAIHOCKHOAHOC] ([MaBaiHoc], [MaKhoaHoc], [MaGiangVien], [TieuDe], [NoiDung], [ThuTu], [LoaiBaiHoc], [ThoiLuong], [TrangThai], [MaBuoiHoc], [FileUrl]) VALUES (20, 1, 1, N'Bài tập Reading Part 7', N'Luyện đọc hiểu', 2, N'PDF', N'45 phút', N'draft', 9, NULL)
GO
INSERT [dbo].[BAIHOCKHOAHOC] ([MaBaiHoc], [MaKhoaHoc], [MaGiangVien], [TieuDe], [NoiDung], [ThuTu], [LoaiBaiHoc], [ThoiLuong], [TrangThai], [MaBuoiHoc], [FileUrl]) VALUES (21, 1, 1, N'Ôn tập giữa khóa', N'Ôn tập toàn bộ nội dung đã học', 1, N'PDF', N'60 phút', N'published', 10, NULL)
GO
INSERT [dbo].[BAIHOCKHOAHOC] ([MaBaiHoc], [MaKhoaHoc], [MaGiangVien], [TieuDe], [NoiDung], [ThuTu], [LoaiBaiHoc], [ThoiLuong], [TrangThai], [MaBuoiHoc], [FileUrl]) VALUES (22, 1, 1, N'Kiểm tra giữa khóa', N'Bài kiểm tra thực hành', 2, N'Writing', N'60 phút', N'published', 10, NULL)
GO
INSERT [dbo].[BAIHOCKHOAHOC] ([MaBaiHoc], [MaKhoaHoc], [MaGiangVien], [TieuDe], [NoiDung], [ThuTu], [LoaiBaiHoc], [ThoiLuong], [TrangThai], [MaBuoiHoc], [FileUrl]) VALUES (23, 1, 1, N'Luyện đề tổng hợp', N'Làm full bộ đề TOEIC mẫu', 1, N'PDF', N'90 phút', N'published', 11, NULL)
GO
INSERT [dbo].[BAIHOCKHOAHOC] ([MaBaiHoc], [MaKhoaHoc], [MaGiangVien], [TieuDe], [NoiDung], [ThuTu], [LoaiBaiHoc], [ThoiLuong], [TrangThai], [MaBuoiHoc], [FileUrl]) VALUES (24, 1, 1, N'Giải đề và chữa bài', N'Phân tích và sửa lỗi', 2, N'Video', N'60 phút', N'published', 11, NULL)
GO
INSERT [dbo].[BAIHOCKHOAHOC] ([MaBaiHoc], [MaKhoaHoc], [MaGiangVien], [TieuDe], [NoiDung], [ThuTu], [LoaiBaiHoc], [ThoiLuong], [TrangThai], [MaBuoiHoc], [FileUrl]) VALUES (25, 1, 1, N'Final TOEIC Test', N'Bài thi cuối khóa', 1, N'Writing', N'120 phút', N'published', 12, NULL)
GO
INSERT [dbo].[BAIHOCKHOAHOC] ([MaBaiHoc], [MaKhoaHoc], [MaGiangVien], [TieuDe], [NoiDung], [ThuTu], [LoaiBaiHoc], [ThoiLuong], [TrangThai], [MaBuoiHoc], [FileUrl]) VALUES (26, 1, 1, N'Tổng kết khóa học', N'Nhận xét và định hướng tiếp theo', 2, N'Video', N'30 phút', N'published', 12, NULL)
GO
INSERT [dbo].[BAIHOCKHOAHOC] ([MaBaiHoc], [MaKhoaHoc], [MaGiangVien], [TieuDe], [NoiDung], [ThuTu], [LoaiBaiHoc], [ThoiLuong], [TrangThai], [MaBuoiHoc], [FileUrl]) VALUES (27, 1, 1, N'English Listening', N'
<div class="card">
  <h3>🎯 Learning Objectives</h3>
  <p>By the end of this lesson, learners will be able to:</p>
  <ul>
    <li>Understand why English has different accents around the world.</li>
    <li>Recognize key differences between American and British accents.</li>
    <li>Identify important keywords even when pronunciation changes.</li>
    <li>Improve listening comprehension through context-based guessing.</li>
  </ul>
</div>

<div class="card">
  <h3>1) Why Do Different Accents Exist in English?</h3>
  <p>English is spoken in many countries. Each region has:</p>
  <ul>
    <li>Different cultural influences</li>
    <li>Different speech rhythm</li>
    <li>Different mouth and tongue positioning</li>
  </ul>
  <p>There is no "correct" accent. It is not about right or wrong — it is about what you are familiar with.</p>
</div>

<div class="card">
  <h3>2) American vs. British Accent Comparison</h3>
  <table class="detail-table">
    <thead>
      <tr><th>Feature</th><th>American Accent</th><th>British Accent</th></tr>
    </thead>
    <tbody>
      <tr><td>Tone & Rhythm</td><td>Relaxed, natural</td><td>Clear, sometimes more formal</td></tr>
      <tr><td>Vowel sounds</td><td>Open and rounded</td><td>Often narrower and more tense</td></tr>
      <tr><td>Pronunciation of r</td><td>Strong r sound: car /kar/</td><td>Usually drops r at the end: car /kaa/</td></tr>
      <tr><td>Example word: water</td><td>/wo-der/</td><td>/wo-tuh/</td></tr>
    </tbody>
  </table>
</div>

<div class="card">
  <h3>3) Key Vocabulary for Accent Recognition</h3>
  <table class="detail-table">
    <thead>
      <tr><th>Word</th><th>Meaning</th><th>American Pronunciation</th><th>British Pronunciation</th></tr>
    </thead>
    <tbody>
      <tr><td>Water</td><td>Nước</td><td>/wo-der/</td><td>/wo-tuh/</td></tr>
      <tr><td>Better</td><td>Hơn</td><td>/be-der/</td><td>/be-tuh/</td></tr>
      <tr><td>Car</td><td>Ô tô</td><td>/kar/</td><td>/kaa/</td></tr>
      <tr><td>Can''t</td><td>Không thể</td><td>/kaent/</td><td>/ka:nt/</td></tr>
    </tbody>
  </table>
</div>

<div class="card">
  <h3>📝 Quick Check Questions</h3>
  <p>1. What does "car park" mean?</p>
  <ul>
    <li>✔ A parking area</li>
    <li>A marketplace</li>
    <li>A train station</li>
  </ul>
  <p>2. In British English, the final r sound in car is usually:</p>
  <ul>
    <li>Strong and pronounced</li>
    <li>✔ Dropped / not pronounced</li>
  </ul>
</div>

<div class="card">
  <h3>4) Accent Training Sentences</h3>
  <table class="detail-table">
    <thead>
      <tr><th>Sentence</th><th>American Accent</th><th>British Accent</th><th>Listening Tips</th></tr>
    </thead>
    <tbody>
      <tr><td>1</td><td>It is better this way</td><td>It is bettuh this way</td><td>Listen to -er vs -uh ending</td></tr>
      <tr><td>2</td><td>Get the water, please</td><td>Get the watuh, please</td><td>Focus on t and r differences</td></tr>
    </tbody>
  </table>
</div>
', 3, N'PDF', N'20 phút', N'published', 1, NULL)
GO
INSERT [dbo].[BAIHOCKHOAHOC] ([MaBaiHoc], [MaKhoaHoc], [MaGiangVien], [TieuDe], [NoiDung], [ThuTu], [LoaiBaiHoc], [ThoiLuong], [TrangThai], [MaBuoiHoc], [FileUrl]) VALUES (28, 1, 1, N'Conversation Basics', N'Hội thoại cơ bản hằng ngày', 4, N'Video', N'18 phút', N'draft', 1, NULL)
GO
INSERT [dbo].[BAIHOCKHOAHOC] ([MaBaiHoc], [MaKhoaHoc], [MaGiangVien], [TieuDe], [NoiDung], [ThuTu], [LoaiBaiHoc], [ThoiLuong], [TrangThai], [MaBuoiHoc], [FileUrl]) VALUES (37, 1, 1, N'Giới thiệu bản thân', N'', 1, N'Video', N' phút', N'published', 3, N'http://localhost:5000/uploads/1774840374130-f38377f1-acd5-40fa-ac2b-e9a7a75c7271.mp4')
GO
INSERT [dbo].[BAIHOCKHOAHOC] ([MaBaiHoc], [MaKhoaHoc], [MaGiangVien], [TieuDe], [NoiDung], [ThuTu], [LoaiBaiHoc], [ThoiLuong], [TrangThai], [MaBuoiHoc], [FileUrl]) VALUES (40, 1, 1, N'INTRODUCING YOURSELF', N'# ## 🎯 Learning Objectives



By the end of this lesson, learners will be able to:



\- Introduce themselves in English confidently.

\- Talk about personal information (name, age, school, hobbies).

\- Use simple present tense correctly.

\- Write a short paragraph about themselves.



\## I. Warm-up (Khởi động)



👉 Teacher asks:



\- What is your name?

\- How old are you?

\- Where are you from?

\- What do you like to do?



👉 Students answer:



\- My name is ...

\- I am ... years old.

\- I am from ...

\- I like ...



\## II. Key Vocabulary (Từ vựng)



\| Word | Meaning | Example |

\|---|---|---|

\| name | tên | My name is Anna. |

\| age | tuổi | I am 20 years old. |

\| hometown | quê quán | My hometown is Hanoi. |

\| hobby | sở thích | My hobby is reading. |

\| occupation | nghề nghiệp | I am a student. |



\## III. Sample Self-Introduction (Mẫu giới thiệu)



\> Hello! My name is Anna. I am 20 years old. I am from Hanoi, Vietnam. I am a student at FLIC English Center. I love listening to music and reading books. Nice to meet you!



\## IV. Practice (Luyện tập)



👉 Now it''s your turn! Write your own introduction:



1\. Start with: \*\*Hello! My name is ...\*\*

2\. Add your age: \*\*I am ... years old.\*\*

3\. Add your hometown: \*\*I am from ...\*\*

4\. Add your occupation: \*\*I am a ...\*\*

5\. Add your hobbies: \*\*I love ...\*\*

6\. End with: \*\*Nice to meet you!\*\*', 1, N'Writing', N' phút', N'draft', 1, N'')
GO
SET IDENTITY_INSERT [dbo].[BAIHOCKHOAHOC] OFF
GO

SET IDENTITY_INSERT [dbo].[BAIKIEMTRA] ON 
GO
INSERT [dbo].[BAIKIEMTRA] ([MaBaiKiemTra], [MaBuoiHoc], [MaGiangVien], [TenBai], [ThoiGian], [TongDiem]) VALUES (1, 1, 1, N'Kiểm tra từ vựng TOEIC', 30, 10)
GO
INSERT [dbo].[BAIKIEMTRA] ([MaBaiKiemTra], [MaBuoiHoc], [MaGiangVien], [TenBai], [ThoiGian], [TongDiem]) VALUES (2, 1, 1, N'Bài tập từ vựng', 30, 10)
GO
SET IDENTITY_INSERT [dbo].[BAIKIEMTRA] OFF
GO
SET IDENTITY_INSERT [dbo].[BAINOP] ON 
GO
INSERT [dbo].[BAINOP] ([MaBaiNop], [MaBaiTap], [MaSinhVien], [NoiDung], [NgayNop], [Diem], [NhanXet], [TrangThai]) VALUES (1, 1, N'10', N'This summer I went to Da Nang with my family. We visited many beautiful beaches and enjoyed delicious seafood. It was a wonderful experience.', CAST(N'2026-03-20T10:01:38.990' AS DateTime), 6, N'', N'Đã chấm')
GO
INSERT [dbo].[BAINOP] ([MaBaiNop], [MaBaiTap], [MaSinhVien], [NoiDung], [NgayNop], [Diem], [NhanXet], [TrangThai]) VALUES (2, 1, N'11', N'This summer I went to Da Nang with my family. We visited many beautiful beaches and enjoyed delicious seafood. It was a wonderful experience.', CAST(N'2026-03-20T10:01:38.990' AS DateTime), 10, N'', N'Đã chấm')
GO
INSERT [dbo].[BAINOP] ([MaBaiNop], [MaBaiTap], [MaSinhVien], [NoiDung], [NgayNop], [Diem], [NhanXet], [TrangThai]) VALUES (3, 1, N'12', N'This summer I went to Da Nang with my family. We visited many beautiful beaches and enjoyed delicious seafood. It was a wonderful experience.', CAST(N'2026-03-20T10:01:38.990' AS DateTime), NULL, NULL, N'Chờ chấm')
GO
INSERT [dbo].[BAINOP] ([MaBaiNop], [MaBaiTap], [MaSinhVien], [NoiDung], [NgayNop], [Diem], [NhanXet], [TrangThai]) VALUES (4, 1, N'13', N'This summer I went to Da Nang with my family. We visited many beautiful beaches and enjoyed delicious seafood. It was a wonderful experience.', CAST(N'2026-03-20T10:01:38.990' AS DateTime), NULL, NULL, N'Chờ chấm')
GO
INSERT [dbo].[BAINOP] ([MaBaiNop], [MaBaiTap], [MaSinhVien], [NoiDung], [NgayNop], [Diem], [NhanXet], [TrangThai]) VALUES (5, 1, N'14', N'This summer I went to Da Nang with my family. We visited many beautiful beaches and enjoyed delicious seafood. It was a wonderful experience.', CAST(N'2026-03-20T10:01:38.990' AS DateTime), NULL, NULL, N'Chờ chấm')
GO
INSERT [dbo].[BAINOP] ([MaBaiNop], [MaBaiTap], [MaSinhVien], [NoiDung], [NgayNop], [Diem], [NhanXet], [TrangThai]) VALUES (6, 1, N'15', N'This summer I went to Da Nang with my family. We visited many beautiful beaches and enjoyed delicious seafood. It was a wonderful experience.', CAST(N'2026-03-20T10:01:38.990' AS DateTime), NULL, NULL, N'Chờ chấm')
GO
INSERT [dbo].[BAINOP] ([MaBaiNop], [MaBaiTap], [MaSinhVien], [NoiDung], [NgayNop], [Diem], [NhanXet], [TrangThai]) VALUES (7, 1, N'16', N'This summer I went to Da Nang with my family. We visited many beautiful beaches and enjoyed delicious seafood. It was a wonderful experience.', CAST(N'2026-03-20T10:01:38.990' AS DateTime), NULL, NULL, N'Chờ chấm')
GO
INSERT [dbo].[BAINOP] ([MaBaiNop], [MaBaiTap], [MaSinhVien], [NoiDung], [NgayNop], [Diem], [NhanXet], [TrangThai]) VALUES (8, 1, N'17', N'This summer I went to Da Nang with my family. We visited many beautiful beaches and enjoyed delicious seafood. It was a wonderful experience.', CAST(N'2026-03-20T10:01:38.990' AS DateTime), NULL, NULL, N'Chờ chấm')
GO
INSERT [dbo].[BAINOP] ([MaBaiNop], [MaBaiTap], [MaSinhVien], [NoiDung], [NgayNop], [Diem], [NhanXet], [TrangThai]) VALUES (9, 1, N'30', N'1. 1. Bạn đã đi đâu?
Trả lời: uhwd

2. 2. Bạn làm gì?
Trả lời: jshf

3. 3. Bạn thích điều gì nhất?
Trả lời: uehru', CAST(N'2026-03-23T09:26:37.770' AS DateTime), 2.9, N'', N'Đã chấm')
GO
INSERT [dbo].[BAINOP] ([MaBaiNop], [MaBaiTap], [MaSinhVien], [NoiDung], [NgayNop], [Diem], [NhanXet], [TrangThai]) VALUES (10, 9, N'30', N'Câu 1: She ___ to school every day.
Chọn: B | Đúng: B | ✓

Câu 2: He ___ TV when I called.
Chọn: A | Đúng: C | ✗

Câu 3: I ___ here for 5 years.
Chọn: C | Đúng: D | ✗

Câu 4: They ___ the project tomorrow.
Chọn: C | Đúng: C | ✓

Câu 5: By 2030, she ___ her degree.
Chọn: B | Đúng: D | ✗', CAST(N'2026-03-23T09:40:08.073' AS DateTime), 4, NULL, N'Đã chấm')
GO
INSERT [dbo].[BAINOP] ([MaBaiNop], [MaBaiTap], [MaSinhVien], [NoiDung], [NgayNop], [Diem], [NhanXet], [TrangThai]) VALUES (11, 1, N'4', N'1. 1. Bạn đã đi những đâu?
Trả lời: ihioeqe

2. 2. Bạn làm gì?
Trả lời: ìheio

3. 3. Bạn thích điều gì nhất?
Trả lời: ogoprw', CAST(N'2026-03-25T20:00:00.483' AS DateTime), NULL, NULL, N'Chờ chấm')
GO
INSERT [dbo].[BAINOP] ([MaBaiNop], [MaBaiTap], [MaSinhVien], [NoiDung], [NgayNop], [Diem], [NhanXet], [TrangThai]) VALUES (12, 3, N'30', N'1. 1. Who are talking?
Trả lời: teid

2. 2. What is topic?
Trả lời: ru

3. 3. What is result?
Trả lời: ra', CAST(N'2026-03-25T20:02:01.307' AS DateTime), 3, N'uhfufh', N'Đã chấm')
GO
INSERT [dbo].[BAINOP] ([MaBaiNop], [MaBaiTap], [MaSinhVien], [NoiDung], [NgayNop], [Diem], [NhanXet], [TrangThai]) VALUES (13, 10, N'30', N'Câu 1: What is the capital of Vietnam?
Chọn: A | Đúng: A | ✓

Câu 2: Which animal is a mammal?
Chọn: B | Đúng: B | ✓', CAST(N'2026-03-26T14:05:15.217' AS DateTime), 10, NULL, N'Đã chấm')
GO
INSERT [dbo].[BAINOP] ([MaBaiNop], [MaBaiTap], [MaSinhVien], [NoiDung], [NgayNop], [Diem], [NhanXet], [TrangThai]) VALUES (14, 13, N'30', N'mặt trời', CAST(N'2026-03-26T14:30:12.673' AS DateTime), 10, N'', N'Đã chấm')
GO
INSERT [dbo].[BAINOP] ([MaBaiNop], [MaBaiTap], [MaSinhVien], [NoiDung], [NgayNop], [Diem], [NhanXet], [TrangThai]) VALUES (15, 16, N'30', N'gdyad → kjzhcw (Đúng: jbke)
iheafwir → jbke (Đúng: kjzhcw)', CAST(N'2026-03-27T02:22:08.450' AS DateTime), 10, N'', N'Đã chấm')
GO
INSERT [dbo].[BAINOP] ([MaBaiNop], [MaBaiTap], [MaSinhVien], [NoiDung], [NgayNop], [Diem], [NhanXet], [TrangThai]) VALUES (16, 14, N'30', N'1. Câu 1
Trả lời: hyy

2. Câu 2
Trả lời: uqowh', CAST(N'2026-03-27T10:26:46.733' AS DateTime), NULL, NULL, N'Chờ chấm')
GO
INSERT [dbo].[BAINOP] ([MaBaiNop], [MaBaiTap], [MaSinhVien], [NoiDung], [NgayNop], [Diem], [NhanXet], [TrangThai]) VALUES (17, 15, N'30', N'Thứ tự đã sắp xếp: a, b, c, d, e
Thứ tự đúng: a, b, c, d, e', CAST(N'2026-03-27T13:37:18.417' AS DateTime), 10, N'', N'Đã chấm')
GO
SET IDENTITY_INSERT [dbo].[BAINOP] OFF
GO

SET IDENTITY_INSERT [dbo].[DANGKYKHOAHOC] ON 
GO
INSERT [dbo].[DANGKYKHOAHOC] ([MaDangKy], [MaKhoaHoc], [MaSinhVien], [NgayDangKy], [TrangThai]) VALUES (5, 1, N'221121521126', CAST(N'2026-03-17T09:44:49.613' AS DateTime), N'Đã đăng ký')
GO
INSERT [dbo].[DANGKYKHOAHOC] ([MaDangKy], [MaKhoaHoc], [MaSinhVien], [NgayDangKy], [TrangThai]) VALUES (8, 1, N'221121521101', CAST(N'2026-03-19T11:22:43.910' AS DateTime), N'Đã đăng ký')
GO
INSERT [dbo].[DANGKYKHOAHOC] ([MaDangKy], [MaKhoaHoc], [MaSinhVien], [NgayDangKy], [TrangThai]) VALUES (9, 1, N'221121521102', CAST(N'2026-03-19T11:22:43.910' AS DateTime), N'Đã đăng ký')
GO
INSERT [dbo].[DANGKYKHOAHOC] ([MaDangKy], [MaKhoaHoc], [MaSinhVien], [NgayDangKy], [TrangThai]) VALUES (10, 1, N'221121521103', CAST(N'2026-03-19T11:22:43.910' AS DateTime), N'Đã đăng ký')
GO
INSERT [dbo].[DANGKYKHOAHOC] ([MaDangKy], [MaKhoaHoc], [MaSinhVien], [NgayDangKy], [TrangThai]) VALUES (11, 1, N'221121521104', CAST(N'2026-03-19T11:22:43.910' AS DateTime), N'Đã đăng ký')
GO
INSERT [dbo].[DANGKYKHOAHOC] ([MaDangKy], [MaKhoaHoc], [MaSinhVien], [NgayDangKy], [TrangThai]) VALUES (12, 1, N'221121521105', CAST(N'2026-03-19T11:22:43.910' AS DateTime), N'Đã đăng ký')
GO
INSERT [dbo].[DANGKYKHOAHOC] ([MaDangKy], [MaKhoaHoc], [MaSinhVien], [NgayDangKy], [TrangThai]) VALUES (13, 1, N'221121521106', CAST(N'2026-03-19T11:22:43.910' AS DateTime), N'Đã đăng ký')
GO
INSERT [dbo].[DANGKYKHOAHOC] ([MaDangKy], [MaKhoaHoc], [MaSinhVien], [NgayDangKy], [TrangThai]) VALUES (14, 1, N'221121521107', CAST(N'2026-03-19T11:22:43.910' AS DateTime), N'Đã đăng ký')
GO
INSERT [dbo].[DANGKYKHOAHOC] ([MaDangKy], [MaKhoaHoc], [MaSinhVien], [NgayDangKy], [TrangThai]) VALUES (15, 1, N'221121521108', CAST(N'2026-03-19T11:22:43.910' AS DateTime), N'Đã đăng ký')
GO
INSERT [dbo].[DANGKYKHOAHOC] ([MaDangKy], [MaKhoaHoc], [MaSinhVien], [NgayDangKy], [TrangThai]) VALUES (16, 1, N'221121521109', CAST(N'2026-03-19T11:22:43.910' AS DateTime), N'Đã đăng ký')
GO
INSERT [dbo].[DANGKYKHOAHOC] ([MaDangKy], [MaKhoaHoc], [MaSinhVien], [NgayDangKy], [TrangThai]) VALUES (17, 1, N'221121521110', CAST(N'2026-03-19T11:22:43.910' AS DateTime), N'Đã đăng ký')
GO
INSERT [dbo].[DANGKYKHOAHOC] ([MaDangKy], [MaKhoaHoc], [MaSinhVien], [NgayDangKy], [TrangThai]) VALUES (18, 1, N'221121521111', CAST(N'2026-03-19T11:22:43.910' AS DateTime), N'Đã đăng ký')
GO
INSERT [dbo].[DANGKYKHOAHOC] ([MaDangKy], [MaKhoaHoc], [MaSinhVien], [NgayDangKy], [TrangThai]) VALUES (19, 1, N'221121521112', CAST(N'2026-03-19T11:22:43.910' AS DateTime), N'Đã đăng ký')
GO
INSERT [dbo].[DANGKYKHOAHOC] ([MaDangKy], [MaKhoaHoc], [MaSinhVien], [NgayDangKy], [TrangThai]) VALUES (20, 1, N'221121521113', CAST(N'2026-03-19T11:22:43.910' AS DateTime), N'Đã đăng ký')
GO
INSERT [dbo].[DANGKYKHOAHOC] ([MaDangKy], [MaKhoaHoc], [MaSinhVien], [NgayDangKy], [TrangThai]) VALUES (21, 1, N'221121521114', CAST(N'2026-03-19T11:22:43.910' AS DateTime), N'Đã đăng ký')
GO
INSERT [dbo].[DANGKYKHOAHOC] ([MaDangKy], [MaKhoaHoc], [MaSinhVien], [NgayDangKy], [TrangThai]) VALUES (22, 1, N'221121521115', CAST(N'2026-03-19T11:22:43.910' AS DateTime), N'Đã đăng ký')
GO
INSERT [dbo].[DANGKYKHOAHOC] ([MaDangKy], [MaKhoaHoc], [MaSinhVien], [NgayDangKy], [TrangThai]) VALUES (23, 1, N'221121521116', CAST(N'2026-03-19T11:22:43.910' AS DateTime), N'Đã đăng ký')
GO
INSERT [dbo].[DANGKYKHOAHOC] ([MaDangKy], [MaKhoaHoc], [MaSinhVien], [NgayDangKy], [TrangThai]) VALUES (24, 1, N'221121521117', CAST(N'2026-03-19T11:22:43.910' AS DateTime), N'Đã đăng ký')
GO
INSERT [dbo].[DANGKYKHOAHOC] ([MaDangKy], [MaKhoaHoc], [MaSinhVien], [NgayDangKy], [TrangThai]) VALUES (25, 1, N'221121521118', CAST(N'2026-03-19T11:22:43.910' AS DateTime), N'Đã đăng ký')
GO
INSERT [dbo].[DANGKYKHOAHOC] ([MaDangKy], [MaKhoaHoc], [MaSinhVien], [NgayDangKy], [TrangThai]) VALUES (26, 1, N'221121521119', CAST(N'2026-03-19T11:22:43.910' AS DateTime), N'Đã đăng ký')
GO
INSERT [dbo].[DANGKYKHOAHOC] ([MaDangKy], [MaKhoaHoc], [MaSinhVien], [NgayDangKy], [TrangThai]) VALUES (27, 1, N'221121521120', CAST(N'2026-03-19T11:22:43.910' AS DateTime), N'Đã đăng ký')
GO
SET IDENTITY_INSERT [dbo].[DANGKYKHOAHOC] OFF
GO
SET IDENTITY_INSERT [dbo].[BAITAP] ON 
GO
INSERT [dbo].[BAITAP] ([MaBaiTap], [Title], [Type], [CreatedDate], [MaBuoiHoc], [Content], [Questions], [Vocabulary], [AudioUrl], [ShowAnswer]) VALUES (1, N'Essay: My Summer Vacation', N'Writing', N'2025-11-07', 3, N'Hè này bạn đã có những kỷ niệm đáng nhớ không? Hãy viết một đoạn văn ngắn kể về kỳ nghỉ hè của bạn. Bạn đã đi đâu, làm gì và cảm thấy thế nào? Đừng quên chia sẻ những điều thú vị mà bạn đã trải qua trong mùa hè năm nay nhé!', N'1. Bạn đã đi những đâu?|2. Bạn làm gì?|3. Bạn thích điều gì nhất?', N'Memorable::đáng nhớ - worth remembering|Experience::trải nghiệm - something you do or live through|Holiday::kỳ nghỉ - a period of time away from work or school|Adventure::phiêu lưu - an exciting or unusual experience', NULL, NULL)
GO
INSERT [dbo].[BAITAP] ([MaBaiTap], [Title], [Type], [CreatedDate], [MaBuoiHoc], [Content], [Questions], [Vocabulary], [AudioUrl], [ShowAnswer]) VALUES (2, N'Reading: The Ocean World', N'Reading', N'2025-11-05', 3, N'The ocean covers more than 70% of the Earth''s surface and is home to millions of living creatures. From tiny plankton to giant whales, each organism plays an important role in the balance of marine life. Coral reefs are often called the "rainforests of the sea" because they are rich in biodiversity. They provide shelter and food for many species of fish and sea animals. However, pollution, overfishing, and climate change are major threats to ocean life. Protecting our oceans means protecting our planet. By reducing plastic use, saving energy, and supporting clean-up activities, we can help keep the ocean world healthy for future generations.', N'1. What percentage of the Earth''s surface is covered by oceans?|2. Why are coral reefs called "the rainforests of the sea"?|3. What are some threats to ocean life mentioned in the passage?|4. How can people help protect the ocean?|5. What message does the passage want to share?', N'Biodiversity::variety of different living things|Plankton::very small organisms that float in the sea|Pollution::damage caused to the environment|Species::a group of living things that share similar features', NULL, NULL)
GO
INSERT [dbo].[BAITAP] ([MaBaiTap], [Title], [Type], [CreatedDate], [MaBuoiHoc], [Content], [Questions], [Vocabulary], [AudioUrl], [ShowAnswer]) VALUES (3, N'Listening Practice', N'Listening', N'2025-11-04', 3, N'Listen to the conversation and answer questions...', N'1. Who are talking?|2. What is topic?|3. What is result?', N'Conversation::cuộc trò chuyện - a talk between two or more people|Topic::chủ đề - the subject of a discussion|Result::kết quả - the outcome of something|Opinion::ý kiến - a personal view or judgment', NULL, NULL)
GO
INSERT [dbo].[BAITAP] ([MaBaiTap], [Title], [Type], [CreatedDate], [MaBuoiHoc], [Content], [Questions], [Vocabulary], [AudioUrl], [ShowAnswer]) VALUES (4, N'Vocabulary Quiz: Food & Drinks', N'Vocabulary', N'2025-11-02', 3, N'Choose the correct vocabulary about food and drinks...', N'1. Apple is a...?|2. Water is a...?|3. Rice is a...?', N'Fruit::trái cây - the sweet product of a plant|Vegetable::rau củ - a plant used as food|Beverage::đồ uống - any drinkable liquid|Grain::ngũ cốc - seeds used as food like rice and wheat', NULL, NULL)
GO
INSERT [dbo].[BAITAP] ([MaBaiTap], [Title], [Type], [CreatedDate], [MaBuoiHoc], [Content], [Questions], [Vocabulary], [AudioUrl], [ShowAnswer]) VALUES (5, N'Grammar: Present Simple', N'Grammar', N'2025-11-08', 5, NULL, NULL, NULL, NULL, NULL)
GO
INSERT [dbo].[BAITAP] ([MaBaiTap], [Title], [Type], [CreatedDate], [MaBuoiHoc], [Content], [Questions], [Vocabulary], [AudioUrl], [ShowAnswer]) VALUES (6, N'Listening: Daily Conversations', N'Listening', N'2025-11-09', 5, NULL, NULL, NULL, NULL, NULL)
GO
INSERT [dbo].[BAITAP] ([MaBaiTap], [Title], [Type], [CreatedDate], [MaBuoiHoc], [Content], [Questions], [Vocabulary], [AudioUrl], [ShowAnswer]) VALUES (7, N'Reading: Short Stories', N'Reading', N'2025-11-10', 7, NULL, NULL, NULL, NULL, NULL)
GO
INSERT [dbo].[BAITAP] ([MaBaiTap], [Title], [Type], [CreatedDate], [MaBuoiHoc], [Content], [Questions], [Vocabulary], [AudioUrl], [ShowAnswer]) VALUES (8, N'Vocabulary: Travel', N'Vocabulary', N'2025-11-11', 7, NULL, NULL, NULL, NULL, NULL)
GO
INSERT [dbo].[BAITAP] ([MaBaiTap], [Title], [Type], [CreatedDate], [MaBuoiHoc], [Content], [Questions], [Vocabulary], [AudioUrl], [ShowAnswer]) VALUES (9, N'Grammar Quiz: Tenses', N'multiple', N'Mar 23 2026  9:39AM', 5, N'Chọn đáp án đúng cho mỗi câu hỏi về các thì trong tiếng Anh.', N'She ___ to school every day.||A. go|B. goes|C. went|D. going|Đáp án đúng: B###He ___ TV when I called.||A. watched|B. watches|C. was watching|D. is watching|Đáp án đúng: C###I ___ here for 5 years.||A. lived|B. live|C. am living|D. have lived|Đáp án đúng: D###They ___ the project tomorrow.||A. finish|B. finished|C. will finish|D. are finish|Đáp án đúng: C###By 2030, she ___ her degree.||A. will complete|B. completes|C. completed|D. will have completed|Đáp án đúng: D', N'', N'', NULL)
GO
INSERT [dbo].[BAITAP] ([MaBaiTap], [Title], [Type], [CreatedDate], [MaBuoiHoc], [Content], [Questions], [Vocabulary], [AudioUrl], [ShowAnswer]) VALUES (10, N'Basic English Test', N'multiple', N'2026-03-26', 3, N'', N'What is the capital of Vietnam?||A. HaNoi|B. HoChiMinh|C. DaNang|D. Hue|Đáp án đúng: A###Which animal is a mammal?||A. Shark|B. Dolphin|C. Octopus|D. Crab|Đáp án đúng: B', NULL, N'', NULL)
GO
INSERT [dbo].[BAITAP] ([MaBaiTap], [Title], [Type], [CreatedDate], [MaBuoiHoc], [Content], [Questions], [Vocabulary], [AudioUrl], [ShowAnswer]) VALUES (13, N'Mixed Skills Practice', N'connect', N'2026-03-26', 3, N'', N'Sun::mặt trời|moon::mặt trăng', NULL, N'', NULL)
GO
INSERT [dbo].[BAITAP] ([MaBaiTap], [Title], [Type], [CreatedDate], [MaBuoiHoc], [Content], [Questions], [Vocabulary], [AudioUrl], [ShowAnswer]) VALUES (14, N'guegfoewu', N'essay', N'2026-03-26', 1, N'ygihfiejska
---
Câu 1
---
Câu 2', N'', NULL, N'', NULL)
GO
INSERT [dbo].[BAITAP] ([MaBaiTap], [Title], [Type], [CreatedDate], [MaBuoiHoc], [Content], [Questions], [Vocabulary], [AudioUrl], [ShowAnswer]) VALUES (15, N'abc', N'ordering', N'2026-03-26', 3, N'a,b,c,d,e', N'', NULL, N'', NULL)
GO
INSERT [dbo].[BAITAP] ([MaBaiTap], [Title], [Type], [CreatedDate], [MaBuoiHoc], [Content], [Questions], [Vocabulary], [AudioUrl], [ShowAnswer]) VALUES (16, N'acbd', N'matching', N'2026-03-26', 3, N'', N'gdyad::jbke|iheafwir::kjzhcw', NULL, N'', NULL)
GO
INSERT [dbo].[BAITAP] ([MaBaiTap], [Title], [Type], [CreatedDate], [MaBuoiHoc], [Content], [Questions], [Vocabulary], [AudioUrl], [ShowAnswer]) VALUES (18, N'Listening Practice: Daily Life', N'listening', N'Mar 28 2026  7:00PM', 7, N'Listen to the conversation and answer the questions.', N'What are they talking about?||A. Weather|B. Food|C. School|D. Sports|Đáp án đúng: B###Where does the conversation take place?||A. At home|B. At school|C. At a restaurant|D. At a park|Đáp án đúng: C###What does the man order?||A. Coffee|B. Tea|C. Juice|D. Water|Đáp án đúng: A', N'conversation::cuộc hội thoại|order::gọi món|restaurant::nhà hàng', N'', 0)
GO
INSERT [dbo].[BAITAP] ([MaBaiTap], [Title], [Type], [CreatedDate], [MaBuoiHoc], [Content], [Questions], [Vocabulary], [AudioUrl], [ShowAnswer]) VALUES (19, N'Speaking Practice: Introduce Yourself', N'speaking', N'Mar 28 2026  7:00PM', 7, N'Introduce yourself in English', N'My name is John. I am twenty years old. I am a student at a university in Ho Chi Minh City.', N'', N'', 0)
GO
SET IDENTITY_INSERT [dbo].[BAITAP] OFF
GO
SET IDENTITY_INSERT [dbo].[GIANGVIEN] ON 
GO
INSERT [dbo].[GIANGVIEN] ([MaGiangVien], [MaNguoiDung], [HocVi], [ChuyenMon], [SoDienThoai], [KinhNghiem], [GioiThieu]) VALUES (1, 4, NULL, NULL, NULL, NULL, NULL)
GO
INSERT [dbo].[GIANGVIEN] ([MaGiangVien], [MaNguoiDung], [HocVi], [ChuyenMon], [SoDienThoai], [KinhNghiem], [GioiThieu]) VALUES (2, 9, N'Cử nhân', N'Tiếng Anh', N'', N'', N'')
GO
INSERT [dbo].[GIANGVIEN] ([MaGiangVien], [MaNguoiDung], [HocVi], [ChuyenMon], [SoDienThoai], [KinhNghiem], [GioiThieu]) VALUES (3, 9, N'Cử nhân', N'Tiếng Anh', N'', N'', N'')
GO
INSERT [dbo].[GIANGVIEN] ([MaGiangVien], [MaNguoiDung], [HocVi], [ChuyenMon], [SoDienThoai], [KinhNghiem], [GioiThieu]) VALUES (4, 32, NULL, NULL, NULL, NULL, NULL)
GO
SET IDENTITY_INSERT [dbo].[GIANGVIEN] OFF
GO
SET IDENTITY_INSERT [dbo].[KETQUABAIKIEMTRA] ON 
GO
INSERT [dbo].[KETQUABAIKIEMTRA] ([MaKetQua], [MaBaiKiemTra], [MaSinhVien], [Diem], [ThoiGianLamBai]) VALUES (1, 1, 10, 9.8, CAST(N'2026-03-19T11:46:51.410' AS DateTime))
GO
INSERT [dbo].[KETQUABAIKIEMTRA] ([MaKetQua], [MaBaiKiemTra], [MaSinhVien], [Diem], [ThoiGianLamBai]) VALUES (2, 2, 10, 7.1, CAST(N'2026-03-19T11:46:51.410' AS DateTime))
GO
INSERT [dbo].[KETQUABAIKIEMTRA] ([MaKetQua], [MaBaiKiemTra], [MaSinhVien], [Diem], [ThoiGianLamBai]) VALUES (3, 1, 11, 5.5, CAST(N'2026-03-19T11:46:51.410' AS DateTime))
GO
INSERT [dbo].[KETQUABAIKIEMTRA] ([MaKetQua], [MaBaiKiemTra], [MaSinhVien], [Diem], [ThoiGianLamBai]) VALUES (4, 2, 11, 5.2, CAST(N'2026-03-19T11:46:51.410' AS DateTime))
GO
INSERT [dbo].[KETQUABAIKIEMTRA] ([MaKetQua], [MaBaiKiemTra], [MaSinhVien], [Diem], [ThoiGianLamBai]) VALUES (5, 1, 12, 8.9, CAST(N'2026-03-19T11:46:51.410' AS DateTime))
GO
INSERT [dbo].[KETQUABAIKIEMTRA] ([MaKetQua], [MaBaiKiemTra], [MaSinhVien], [Diem], [ThoiGianLamBai]) VALUES (6, 2, 12, 8, CAST(N'2026-03-19T11:46:51.410' AS DateTime))
GO
INSERT [dbo].[KETQUABAIKIEMTRA] ([MaKetQua], [MaBaiKiemTra], [MaSinhVien], [Diem], [ThoiGianLamBai]) VALUES (7, 1, 13, 8.7, CAST(N'2026-03-19T11:46:51.410' AS DateTime))
GO
INSERT [dbo].[KETQUABAIKIEMTRA] ([MaKetQua], [MaBaiKiemTra], [MaSinhVien], [Diem], [ThoiGianLamBai]) VALUES (8, 2, 13, 9.5, CAST(N'2026-03-19T11:46:51.410' AS DateTime))
GO
INSERT [dbo].[KETQUABAIKIEMTRA] ([MaKetQua], [MaBaiKiemTra], [MaSinhVien], [Diem], [ThoiGianLamBai]) VALUES (9, 1, 14, 9.5, CAST(N'2026-03-19T11:46:51.410' AS DateTime))
GO
INSERT [dbo].[KETQUABAIKIEMTRA] ([MaKetQua], [MaBaiKiemTra], [MaSinhVien], [Diem], [ThoiGianLamBai]) VALUES (10, 2, 14, 8.3, CAST(N'2026-03-19T11:46:51.410' AS DateTime))
GO
INSERT [dbo].[KETQUABAIKIEMTRA] ([MaKetQua], [MaBaiKiemTra], [MaSinhVien], [Diem], [ThoiGianLamBai]) VALUES (11, 1, 15, 6.6, CAST(N'2026-03-19T11:46:51.410' AS DateTime))
GO
INSERT [dbo].[KETQUABAIKIEMTRA] ([MaKetQua], [MaBaiKiemTra], [MaSinhVien], [Diem], [ThoiGianLamBai]) VALUES (12, 2, 15, 9.1, CAST(N'2026-03-19T11:46:51.410' AS DateTime))
GO
INSERT [dbo].[KETQUABAIKIEMTRA] ([MaKetQua], [MaBaiKiemTra], [MaSinhVien], [Diem], [ThoiGianLamBai]) VALUES (13, 1, 16, 5.4, CAST(N'2026-03-19T11:46:51.410' AS DateTime))
GO
INSERT [dbo].[KETQUABAIKIEMTRA] ([MaKetQua], [MaBaiKiemTra], [MaSinhVien], [Diem], [ThoiGianLamBai]) VALUES (14, 2, 16, 9.6, CAST(N'2026-03-19T11:46:51.410' AS DateTime))
GO
INSERT [dbo].[KETQUABAIKIEMTRA] ([MaKetQua], [MaBaiKiemTra], [MaSinhVien], [Diem], [ThoiGianLamBai]) VALUES (16, 2, 17, 9.6, CAST(N'2026-03-19T11:46:51.410' AS DateTime))
GO
INSERT [dbo].[KETQUABAIKIEMTRA] ([MaKetQua], [MaBaiKiemTra], [MaSinhVien], [Diem], [ThoiGianLamBai]) VALUES (17, 1, 18, 7.2, CAST(N'2026-03-19T11:46:51.410' AS DateTime))
GO
INSERT [dbo].[KETQUABAIKIEMTRA] ([MaKetQua], [MaBaiKiemTra], [MaSinhVien], [Diem], [ThoiGianLamBai]) VALUES (18, 2, 18, 8.9, CAST(N'2026-03-19T11:46:51.410' AS DateTime))
GO
INSERT [dbo].[KETQUABAIKIEMTRA] ([MaKetQua], [MaBaiKiemTra], [MaSinhVien], [Diem], [ThoiGianLamBai]) VALUES (19, 1, 19, 9, CAST(N'2026-03-19T11:46:51.410' AS DateTime))
GO
INSERT [dbo].[KETQUABAIKIEMTRA] ([MaKetQua], [MaBaiKiemTra], [MaSinhVien], [Diem], [ThoiGianLamBai]) VALUES (20, 2, 19, 9.8, CAST(N'2026-03-19T11:46:51.410' AS DateTime))
GO
INSERT [dbo].[KETQUABAIKIEMTRA] ([MaKetQua], [MaBaiKiemTra], [MaSinhVien], [Diem], [ThoiGianLamBai]) VALUES (21, 1, 20, 8.5, CAST(N'2026-03-19T11:46:51.410' AS DateTime))
GO
INSERT [dbo].[KETQUABAIKIEMTRA] ([MaKetQua], [MaBaiKiemTra], [MaSinhVien], [Diem], [ThoiGianLamBai]) VALUES (22, 2, 20, 8.8, CAST(N'2026-03-19T11:46:51.410' AS DateTime))
GO
INSERT [dbo].[KETQUABAIKIEMTRA] ([MaKetQua], [MaBaiKiemTra], [MaSinhVien], [Diem], [ThoiGianLamBai]) VALUES (23, 1, 21, 9.3, CAST(N'2026-03-19T11:46:51.410' AS DateTime))
GO
INSERT [dbo].[KETQUABAIKIEMTRA] ([MaKetQua], [MaBaiKiemTra], [MaSinhVien], [Diem], [ThoiGianLamBai]) VALUES (24, 2, 21, 9.9, CAST(N'2026-03-19T11:46:51.410' AS DateTime))
GO
INSERT [dbo].[KETQUABAIKIEMTRA] ([MaKetQua], [MaBaiKiemTra], [MaSinhVien], [Diem], [ThoiGianLamBai]) VALUES (25, 1, 22, 8.5, CAST(N'2026-03-19T11:46:51.410' AS DateTime))
GO
INSERT [dbo].[KETQUABAIKIEMTRA] ([MaKetQua], [MaBaiKiemTra], [MaSinhVien], [Diem], [ThoiGianLamBai]) VALUES (26, 2, 22, 7.3, CAST(N'2026-03-19T11:46:51.410' AS DateTime))
GO
SET IDENTITY_INSERT [dbo].[KETQUABAIKIEMTRA] OFF
GO
SET IDENTITY_INSERT [dbo].[KHOAHOC] ON 
GO
INSERT [dbo].[KHOAHOC] ([MaKhoaHoc], [TenKhoaHoc], [MoTa], [TrinhDo], [TrangThai], [MaNguoiDung], [NgayTao], [NgayDuyet], [MaGiaoVien]) VALUES (1, N'Khóa học Luyện thi TOEIC', N'Khóa học luyện thi TOEIC giúp học viên nâng cao kỹ năng Listening và Reading.', N'TOEIC', N'Đã duyệt', 6, CAST(N'2026-03-17T08:43:31.410' AS DateTime), NULL, 4)
GO
INSERT [dbo].[KHOAHOC] ([MaKhoaHoc], [TenKhoaHoc], [MoTa], [TrinhDo], [TrangThai], [MaNguoiDung], [NgayTao], [NgayDuyet], [MaGiaoVien]) VALUES (2, N'Khóa học Luyện thi IELTS', N'Khóa học luyện thi IELTS giúp học viên phát triển đầy đủ 4 kỹ năng Nghe Nói Đọc Viết.', N'IELTS', N'Đã duyệt', 6, CAST(N'2026-03-17T08:43:31.410' AS DateTime), NULL, 4)
GO
INSERT [dbo].[KHOAHOC] ([MaKhoaHoc], [TenKhoaHoc], [MoTa], [TrinhDo], [TrangThai], [MaNguoiDung], [NgayTao], [NgayDuyet], [MaGiaoVien]) VALUES (3, N'Khóa học Luyện thi VSTEP', N'Khóa học luyện thi VSTEP theo khung năng lực ngoại ngữ 6 bậc tại Việt Nam.', N'VSTEP', N'Đã duyệt', 6, CAST(N'2026-03-17T08:43:31.410' AS DateTime), NULL, 4)
GO
INSERT [dbo].[KHOAHOC] ([MaKhoaHoc], [TenKhoaHoc], [MoTa], [TrinhDo], [TrangThai], [MaNguoiDung], [NgayTao], [NgayDuyet], [MaGiaoVien]) VALUES (4, N'Khóa học Tiếng Anh tổng quát', N'Khóa học giúp củng cố ngữ pháp, từ vựng và khả năng giao tiếp tiếng Anh.', N'General', N'Từ chối', 6, CAST(N'2026-03-17T08:43:31.410' AS DateTime), CAST(N'2026-03-21T09:50:49.047' AS DateTime), NULL)
GO
INSERT [dbo].[KHOAHOC] ([MaKhoaHoc], [TenKhoaHoc], [MoTa], [TrinhDo], [TrangThai], [MaNguoiDung], [NgayTao], [NgayDuyet], [MaGiaoVien]) VALUES (5, N'Advanced TOEIC Preparation', N'Khóa học luyện thi TOEIC nâng cao, tập trung vào kỹ năng nghe và đọc.', N'TOEIC', N'Từ chối', 6, CAST(N'2026-03-20T10:21:22.663' AS DateTime), CAST(N'2026-03-21T09:48:32.923' AS DateTime), NULL)
GO
INSERT [dbo].[KHOAHOC] ([MaKhoaHoc], [TenKhoaHoc], [MoTa], [TrinhDo], [TrangThai], [MaNguoiDung], [NgayTao], [NgayDuyet], [MaGiaoVien]) VALUES (6, N'Basic English Summer Day', N'Khóa học tiếng Anh cơ bản dành cho người mới bắt đầu.', N'A1', N'Pending', 6, CAST(N'2026-03-20T10:21:22.663' AS DateTime), NULL, NULL)
GO
INSERT [dbo].[KHOAHOC] ([MaKhoaHoc], [TenKhoaHoc], [MoTa], [TrinhDo], [TrangThai], [MaNguoiDung], [NgayTao], [NgayDuyet], [MaGiaoVien]) VALUES (7, N'IELTS Speaking Masterclass', N'Khóa học luyện kỹ năng nói IELTS chuyên sâu.', N'IELTS', N'Pending', 6, CAST(N'2026-03-20T10:21:22.663' AS DateTime), NULL, NULL)
GO
SET IDENTITY_INSERT [dbo].[KHOAHOC] OFF
GO
SET IDENTITY_INSERT [dbo].[KHOAHOCCHITIET] ON 
GO
INSERT [dbo].[KHOAHOCCHITIET] ([MaLop], [TenLop], [MoTa], [HocPhi], [ThoiLuong], [MaKhoaHoc], [TrangThai]) VALUES (1, N'Khóa học TOEIC FE- FOUNDATION', N'Khóa học dành cho người mới bắt đầu, xây nền tảng phát âm và ngữ pháp.', 1610000, N'3 tháng (24 buổi)', 1, N'Đang mở')
GO
INSERT [dbo].[KHOAHOCCHITIET] ([MaLop], [TenLop], [MoTa], [HocPhi], [ThoiLuong], [MaKhoaHoc], [TrangThai]) VALUES (2, N'Khóa học Pre TOEIC', N'Khóa học củng cố ngữ pháp trọng tâm và 600+ từ vựng TOEIC.', 2040000, N'3.5 tháng (28 buổi)', 1, N'Đang mở')
GO
INSERT [dbo].[KHOAHOCCHITIET] ([MaLop], [TenLop], [MoTa], [HocPhi], [ThoiLuong], [MaKhoaHoc], [TrangThai]) VALUES (3, N'Khóa học TOEIC 550+', N'Khóa luyện thi chuyên sâu giúp đạt mục tiêu 550+.', 1930000, N'2.5 tháng (20 buổi)', 1, N'Đang mở')
GO
INSERT [dbo].[KHOAHOCCHITIET] ([MaLop], [TenLop], [MoTa], [HocPhi], [ThoiLuong], [MaKhoaHoc], [TrangThai]) VALUES (4, N'English For Work', N'Khóa học giao tiếp tiếng Anh trong môi trường công sở.', 1800000, N'2 tháng', 1, N'Đang mở')
GO
INSERT [dbo].[KHOAHOCCHITIET] ([MaLop], [TenLop], [MoTa], [HocPhi], [ThoiLuong], [MaKhoaHoc], [TrangThai]) VALUES (5, N'Khóa học Luyện thi IELTS', N'Khóa học luyện thi IELTS giúp học viên phát triển đầy đủ 4 kỹ năng Nghe Nói Đọc Viết.', NULL, NULL, 2, NULL)
GO
INSERT [dbo].[KHOAHOCCHITIET] ([MaLop], [TenLop], [MoTa], [HocPhi], [ThoiLuong], [MaKhoaHoc], [TrangThai]) VALUES (6, N'IELTS Speaking Masterclass', N'Khóa học luyện kỹ năng nói IELTS chuyên sâu.', NULL, NULL, 7, NULL)
GO
INSERT [dbo].[KHOAHOCCHITIET] ([MaLop], [TenLop], [MoTa], [HocPhi], [ThoiLuong], [MaKhoaHoc], [TrangThai]) VALUES (7, N'Basic English Summer Day', N'Khóa học tiếng Anh cơ bản dành cho người mới bắt đầu.', NULL, NULL, 6, NULL)
GO
SET IDENTITY_INSERT [dbo].[KHOAHOCCHITIET] OFF
GO
SET IDENTITY_INSERT [dbo].[BUOIHOC] ON 
GO
INSERT [dbo].[BUOIHOC] ([MaBuoiHoc], [TenBuoiHoc], [MaLopHoc], [MoTa], [NgayBatDau], [NgayKetThuc], [ThuTu]) VALUES (1, N'Buổi 1: Từ vựng nền tảng', 1, N'Học từ vựng cơ bản TOEIC', CAST(N'2026-03-15' AS Date), CAST(N'2026-03-21' AS Date), 1)
GO
INSERT [dbo].[BUOIHOC] ([MaBuoiHoc], [TenBuoiHoc], [MaLopHoc], [MoTa], [NgayBatDau], [NgayKetThuc], [ThuTu]) VALUES (2, N'Buổi 2: Ngữ pháp - Thì hiện tại', 1, N'Ôn tập thì hiện tại đơn và tiếp diễn', CAST(N'2026-03-22' AS Date), CAST(N'2026-03-23' AS Date), 2)
GO
INSERT [dbo].[BUOIHOC] ([MaBuoiHoc], [TenBuoiHoc], [MaLopHoc], [MoTa], [NgayBatDau], [NgayKetThuc], [ThuTu]) VALUES (3, N'Buổi 3: Listening Part 1', 1, N'Mô tả tranh', CAST(N'2026-03-24' AS Date), CAST(N'2026-03-25' AS Date), 3)
GO
INSERT [dbo].[BUOIHOC] ([MaBuoiHoc], [TenBuoiHoc], [MaLopHoc], [MoTa], [NgayBatDau], [NgayKetThuc], [ThuTu]) VALUES (4, N'Buổi 4: Listening Part 2', 1, N'Hỏi - đáp ngắn', CAST(N'2026-03-26' AS Date), CAST(N'2026-03-27' AS Date), 4)
GO
INSERT [dbo].[BUOIHOC] ([MaBuoiHoc], [TenBuoiHoc], [MaLopHoc], [MoTa], [NgayBatDau], [NgayKetThuc], [ThuTu]) VALUES (5, N'Buổi 5: Reading Part 5', 1, N'Hoàn thành câu', CAST(N'2026-03-28' AS Date), CAST(N'2026-03-29' AS Date), 5)
GO
INSERT [dbo].[BUOIHOC] ([MaBuoiHoc], [TenBuoiHoc], [MaLopHoc], [MoTa], [NgayBatDau], [NgayKetThuc], [ThuTu]) VALUES (6, N'Buổi 6: Reading Part 6', 1, N'Điền đoạn văn', CAST(N'2026-03-30' AS Date), CAST(N'2026-03-31' AS Date), 6)
GO
INSERT [dbo].[BUOIHOC] ([MaBuoiHoc], [TenBuoiHoc], [MaLopHoc], [MoTa], [NgayBatDau], [NgayKetThuc], [ThuTu]) VALUES (7, N'Buổi 7: Listening Part 3', 1, N'Hội thoại', CAST(N'2026-04-01' AS Date), CAST(N'2026-04-02' AS Date), 7)
GO
INSERT [dbo].[BUOIHOC] ([MaBuoiHoc], [TenBuoiHoc], [MaLopHoc], [MoTa], [NgayBatDau], [NgayKetThuc], [ThuTu]) VALUES (8, N'Buổi 8: Listening Part 4', 1, N'Bài nói ngắn', CAST(N'2026-04-03' AS Date), CAST(N'2026-04-04' AS Date), 8)
GO
INSERT [dbo].[BUOIHOC] ([MaBuoiHoc], [TenBuoiHoc], [MaLopHoc], [MoTa], [NgayBatDau], [NgayKetThuc], [ThuTu]) VALUES (9, N'Buổi 9: Reading Part 7', 1, N'Đọc hiểu đoạn dài', CAST(N'2026-04-05' AS Date), CAST(N'2026-04-06' AS Date), 9)
GO
INSERT [dbo].[BUOIHOC] ([MaBuoiHoc], [TenBuoiHoc], [MaLopHoc], [MoTa], [NgayBatDau], [NgayKetThuc], [ThuTu]) VALUES (10, N'Buổi 10: Kiểm tra giữa khóa', 1, N'Test giữa khóa TOEIC', CAST(N'2026-04-07' AS Date), CAST(N'2026-04-08' AS Date), 10)
GO
INSERT [dbo].[BUOIHOC] ([MaBuoiHoc], [TenBuoiHoc], [MaLopHoc], [MoTa], [NgayBatDau], [NgayKetThuc], [ThuTu]) VALUES (11, N'Buổi 11: Luyện đề tổng hợp', 1, N'Practice full test', CAST(N'2026-04-09' AS Date), CAST(N'2026-04-10' AS Date), 11)
GO
INSERT [dbo].[BUOIHOC] ([MaBuoiHoc], [TenBuoiHoc], [MaLopHoc], [MoTa], [NgayBatDau], [NgayKetThuc], [ThuTu]) VALUES (12, N'Buổi 12: Thi cuối khóa', 1, N'Final TOEIC Test', CAST(N'2026-04-11' AS Date), CAST(N'2026-04-12' AS Date), 12)
GO
SET IDENTITY_INSERT [dbo].[BUOIHOC] OFF
GO
SET IDENTITY_INSERT [dbo].[LOPHOC] ON 
GO
INSERT [dbo].[LOPHOC] ([MaLopHoc], [TenLop], [MaLop], [LichHoc], [SoLuongHocVien], [TienDo], [MaGiangVien]) VALUES (1, N'Lớp 1 - TOEIC Foundation', 1, N'Thứ 2,4,6 · 9:00-10:30', 50, 68, 1)
GO
INSERT [dbo].[LOPHOC] ([MaLopHoc], [TenLop], [MaLop], [LichHoc], [SoLuongHocVien], [TienDo], [MaGiangVien]) VALUES (2, N'Lớp 2 - TOEIC Foundation', 1, N'Thứ 3,5,7 · 9:00-10:30', 45, 82, 1)
GO
INSERT [dbo].[LOPHOC] ([MaLopHoc], [TenLop], [MaLop], [LichHoc], [SoLuongHocVien], [TienDo], [MaGiangVien]) VALUES (3, N'Lớp 1 - TOEIC 550+', 3, N'Thứ 3,5,7 · 19:00-20:30', 55, 92, NULL)
GO
SET IDENTITY_INSERT [dbo].[LOPHOC] OFF
GO
SET IDENTITY_INSERT [dbo].[NGUOIDUNG] ON 
GO
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao]) VALUES (2, N'na123', N'123456', N'Huyen Na', N'na@gmail.com', NULL, NULL, N'Khóa', CAST(N'2026-03-16T14:23:55.190' AS DateTime))
GO
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao]) VALUES (3, N'admin', N'123456', N'Admin', N'admin@gmail.com', NULL, NULL, N'Active', CAST(N'2026-03-16T14:46:00.610' AS DateTime))
GO
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao]) VALUES (4, N'teacher', N'123456', N'Teacher', N'teacher@gmail.com', NULL, NULL, N'Active', CAST(N'2026-03-16T14:46:44.907' AS DateTime))
GO
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao]) VALUES (5, N'student', N'123456', N'Student', N'student@gmail.com', NULL, NULL, N'Active', CAST(N'2026-03-16T14:47:28.613' AS DateTime))
GO
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao]) VALUES (6, N'quantri', N'123456', N'Quan tri', N'quantrivien@gmail.com', NULL, NULL, N'Active', CAST(N'2026-03-16T14:48:02.427' AS DateTime))
GO
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao]) VALUES (8, N'na124', N'123456', N'Huyen Na', N'na@gmail.com', NULL, NULL, N'Khóa', CAST(N'2026-03-17T08:23:10.867' AS DateTime))
GO
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao]) VALUES (9, N'na456@gmail.com', N'123456', N'Huyen Na', N'na456@gmail.com', NULL, NULL, N'Active', CAST(N'2026-03-17T08:28:15.797' AS DateTime))
GO
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao]) VALUES (10, N'sv101@gmail.com', N'123456', N'Nguyễn Văn An', N'sv101@gmail.com', CAST(N'2004-03-12' AS Date), N'Nam', N'Active', CAST(N'2026-03-19T11:22:43.863' AS DateTime))
GO
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao]) VALUES (11, N'sv102@gmail.com', N'123456', N'Trần Thị Bích', N'sv102@gmail.com', CAST(N'2005-11-02' AS Date), N'Nữ', N'Active', CAST(N'2026-03-19T11:22:43.863' AS DateTime))
GO
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao]) VALUES (12, N'sv103@gmail.com', N'123456', N'Lê Minh Cường', N'sv103@gmail.com', CAST(N'2006-08-20' AS Date), N'Nam', N'Active', CAST(N'2026-03-19T11:22:43.863' AS DateTime))
GO
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao]) VALUES (13, N'sv104@gmail.com', N'123456', N'Phạm Thị Dung', N'sv104@gmail.com', CAST(N'2007-05-14' AS Date), N'Nữ', N'Active', CAST(N'2026-03-19T11:22:43.863' AS DateTime))
GO
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao]) VALUES (14, N'sv105@gmail.com', N'123456', N'Hoàng Quốc Huy', N'sv105@gmail.com', CAST(N'2004-09-22' AS Date), N'Nam', N'Active', CAST(N'2026-03-19T11:22:43.863' AS DateTime))
GO
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao]) VALUES (15, N'sv106@gmail.com', N'123456', N'Đặng Thị Lan', N'sv106@gmail.com', CAST(N'2005-01-18' AS Date), N'Nữ', N'Active', CAST(N'2026-03-19T11:22:43.863' AS DateTime))
GO
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao]) VALUES (16, N'sv107@gmail.com', N'123456', N'Nguyễn Thành Nam', N'sv107@gmail.com', CAST(N'2006-12-01' AS Date), N'Nam', N'Active', CAST(N'2026-03-19T11:22:43.863' AS DateTime))
GO
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao]) VALUES (17, N'sv108@gmail.com', N'123456', N'Phan Thị Oanh', N'sv108@gmail.com', CAST(N'2007-06-09' AS Date), N'Nữ', N'Active', CAST(N'2026-03-19T11:22:43.863' AS DateTime))
GO
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao]) VALUES (18, N'sv109@gmail.com', N'123456', N'Võ Minh Phúc', N'sv109@gmail.com', CAST(N'2004-07-30' AS Date), N'Nam', N'Active', CAST(N'2026-03-19T11:22:43.863' AS DateTime))
GO
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao]) VALUES (19, N'sv110@gmail.com', N'123456', N'Huỳnh Thị Quỳnh', N'sv110@gmail.com', CAST(N'2005-02-11' AS Date), N'Nữ', N'Active', CAST(N'2026-03-19T11:22:43.863' AS DateTime))
GO
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao]) VALUES (20, N'sv111@gmail.com', N'123456', N'Lý Quốc Sơn', N'sv111@gmail.com', CAST(N'2004-04-17' AS Date), N'Nam', N'Active', CAST(N'2026-03-19T11:22:43.863' AS DateTime))
GO
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao]) VALUES (21, N'sv112@gmail.com', N'123456', N'Trương Thị Trang', N'sv112@gmail.com', CAST(N'2005-10-05' AS Date), N'Nữ', N'Active', CAST(N'2026-03-19T11:22:43.863' AS DateTime))
GO
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao]) VALUES (22, N'sv113@gmail.com', N'123456', N'Ngô Văn Tuấn', N'sv113@gmail.com', CAST(N'2006-01-23' AS Date), N'Nam', N'Active', CAST(N'2026-03-19T11:22:43.863' AS DateTime))
GO
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao]) VALUES (23, N'sv114@gmail.com', N'123456', N'Đỗ Thị Uyên', N'sv114@gmail.com', CAST(N'2007-03-03' AS Date), N'Nữ', N'Active', CAST(N'2026-03-19T11:22:43.863' AS DateTime))
GO
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao]) VALUES (24, N'sv115@gmail.com', N'123456', N'Bùi Văn Vinh', N'sv115@gmail.com', CAST(N'2006-09-29' AS Date), N'Nam', N'Active', CAST(N'2026-03-19T11:22:43.863' AS DateTime))
GO
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao]) VALUES (25, N'sv116@gmail.com', N'123456', N'Nguyễn Thị Yến', N'sv116@gmail.com', CAST(N'2007-12-12' AS Date), N'Nữ', N'Active', CAST(N'2026-03-19T11:22:43.863' AS DateTime))
GO
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao]) VALUES (26, N'sv117@gmail.com', N'123456', N'Trần Văn Anh', N'sv117@gmail.com', CAST(N'2004-07-21' AS Date), N'Nam', N'Active', CAST(N'2026-03-19T11:22:43.863' AS DateTime))
GO
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao]) VALUES (27, N'sv118@gmail.com', N'123456', N'Phạm Thị Bảo', N'sv118@gmail.com', CAST(N'2005-11-08' AS Date), N'Nữ', N'Active', CAST(N'2026-03-19T11:22:43.863' AS DateTime))
GO
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao]) VALUES (28, N'sv119@gmail.com', N'123456', N'Hoàng Minh Đức', N'sv119@gmail.com', CAST(N'2006-05-16' AS Date), N'Nam', N'Active', CAST(N'2026-03-19T11:22:43.863' AS DateTime))
GO
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao]) VALUES (29, N'sv120@gmail.com', N'123456', N'Đặng Thị Hạnh', N'sv120@gmail.com', CAST(N'2007-08-27' AS Date), N'Nữ', N'Active', CAST(N'2026-03-19T11:22:43.863' AS DateTime))
GO
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao]) VALUES (30, N'huyenna01662182732@gmail.com', N'123456', N'Đỗ Thị Huyền Na', N'huyenna01662182732@gmail.com', CAST(N'2004-04-25' AS Date), N'Nữ', N'active', CAST(N'2026-03-21T17:57:46.193' AS DateTime))
GO
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao]) VALUES (31, N'be@gmail.com', N'123456', N'Nguyễn Thị Bé', N'be@gmail.com', CAST(N'2005-05-10' AS Date), N'Nữ', N'active', CAST(N'2026-03-21T18:34:45.583' AS DateTime))
GO
INSERT [dbo].[NGUOIDUNG] ([MaNguoiDung], [TenDangNhap], [MatKhau], [HoTen], [Email], [NgaySinh], [GioiTinh], [TrangThai], [NgayTao]) VALUES (32, N'nam@gmail.com', N'123456', N'Nguyễn Văn Nam', N'nam@gmail.com', NULL, NULL, N'Active', CAST(N'2026-03-25T13:27:04.730' AS DateTime))
GO
SET IDENTITY_INSERT [dbo].[NGUOIDUNG] OFF
GO
SET IDENTITY_INSERT [dbo].[PHANCONGGIANGVIEN] ON 
GO
INSERT [dbo].[PHANCONGGIANGVIEN] ([MaPhanCong], [MaKhoaHoc], [MaGiangVien], [NgayPhanCong]) VALUES (8, 1, 1, CAST(N'2026-03-20T15:33:15.823' AS DateTime))
GO
INSERT [dbo].[PHANCONGGIANGVIEN] ([MaPhanCong], [MaKhoaHoc], [MaGiangVien], [NgayPhanCong]) VALUES (9, 2, 1, CAST(N'2026-03-20T15:33:34.627' AS DateTime))
GO
INSERT [dbo].[PHANCONGGIANGVIEN] ([MaPhanCong], [MaKhoaHoc], [MaGiangVien], [NgayPhanCong]) VALUES (10, 3, 1, CAST(N'2026-03-20T15:33:40.670' AS DateTime))
GO
INSERT [dbo].[PHANCONGGIANGVIEN] ([MaPhanCong], [MaKhoaHoc], [MaGiangVien], [NgayPhanCong]) VALUES (11, 4, 1, CAST(N'2026-03-20T15:33:49.373' AS DateTime))
GO
INSERT [dbo].[PHANCONGGIANGVIEN] ([MaPhanCong], [MaKhoaHoc], [MaGiangVien], [NgayPhanCong]) VALUES (13, 5, 1, CAST(N'2026-03-21T16:47:50.700' AS DateTime))
GO
SET IDENTITY_INSERT [dbo].[PHANCONGGIANGVIEN] OFF
GO
SET IDENTITY_INSERT [dbo].[QUANTRIVIENNOIDUNG] ON 
GO
INSERT [dbo].[QUANTRIVIENNOIDUNG] ([MaQTVND], [MaNguoiDung]) VALUES (1, 6)
GO
SET IDENTITY_INSERT [dbo].[QUANTRIVIENNOIDUNG] OFF
GO
INSERT [dbo].[SINHVIEN] ([MaNguoiDung], [Lop], [MaSinhVien]) VALUES (10, N'Lớp 1 - TOEIC Foundation', N'221121521101')
GO
INSERT [dbo].[SINHVIEN] ([MaNguoiDung], [Lop], [MaSinhVien]) VALUES (11, N'Lớp 1 - TOEIC Foundation', N'221121521102')
GO
INSERT [dbo].[SINHVIEN] ([MaNguoiDung], [Lop], [MaSinhVien]) VALUES (12, N'Lớp 1 - TOEIC Foundation', N'221121521103')
GO
INSERT [dbo].[SINHVIEN] ([MaNguoiDung], [Lop], [MaSinhVien]) VALUES (13, N'Lớp 1 - TOEIC Foundation', N'221121521104')
GO
INSERT [dbo].[SINHVIEN] ([MaNguoiDung], [Lop], [MaSinhVien]) VALUES (14, N'Lớp 1 - TOEIC Foundation', N'221121521105')
GO
INSERT [dbo].[SINHVIEN] ([MaNguoiDung], [Lop], [MaSinhVien]) VALUES (15, N'Lớp 1 - TOEIC Foundation', N'221121521106')
GO
INSERT [dbo].[SINHVIEN] ([MaNguoiDung], [Lop], [MaSinhVien]) VALUES (16, N'Lớp 1 - TOEIC Foundation', N'221121521107')
GO
INSERT [dbo].[SINHVIEN] ([MaNguoiDung], [Lop], [MaSinhVien]) VALUES (17, N'Lớp 1 - TOEIC Foundation', N'221121521108')
GO
INSERT [dbo].[SINHVIEN] ([MaNguoiDung], [Lop], [MaSinhVien]) VALUES (18, N'Lớp 1 - TOEIC Foundation', N'221121521109')
GO
INSERT [dbo].[SINHVIEN] ([MaNguoiDung], [Lop], [MaSinhVien]) VALUES (19, N'Lớp 1 - TOEIC Foundation', N'221121521110')
GO
INSERT [dbo].[SINHVIEN] ([MaNguoiDung], [Lop], [MaSinhVien]) VALUES (20, N'Lớp 1 - TOEIC Foundation', N'221121521111')
GO
INSERT [dbo].[SINHVIEN] ([MaNguoiDung], [Lop], [MaSinhVien]) VALUES (21, N'Lớp 1 - TOEIC Foundation', N'221121521112')
GO
INSERT [dbo].[SINHVIEN] ([MaNguoiDung], [Lop], [MaSinhVien]) VALUES (22, N'Lớp 1 - TOEIC Foundation', N'221121521113')
GO
INSERT [dbo].[SINHVIEN] ([MaNguoiDung], [Lop], [MaSinhVien]) VALUES (23, N'Lớp 1 - TOEIC Foundation', N'221121521114')
GO
INSERT [dbo].[SINHVIEN] ([MaNguoiDung], [Lop], [MaSinhVien]) VALUES (24, N'Lớp 1 - TOEIC Foundation', N'221121521115')
GO
INSERT [dbo].[SINHVIEN] ([MaNguoiDung], [Lop], [MaSinhVien]) VALUES (25, N'Lớp 1 - TOEIC Foundation', N'221121521116')
GO
INSERT [dbo].[SINHVIEN] ([MaNguoiDung], [Lop], [MaSinhVien]) VALUES (26, N'Lớp 1 - TOEIC Foundation', N'221121521117')
GO
INSERT [dbo].[SINHVIEN] ([MaNguoiDung], [Lop], [MaSinhVien]) VALUES (27, N'Lớp 1 - TOEIC Foundation', N'221121521118')
GO
INSERT [dbo].[SINHVIEN] ([MaNguoiDung], [Lop], [MaSinhVien]) VALUES (28, N'Lớp 1 - TOEIC Foundation', N'221121521119')
GO
INSERT [dbo].[SINHVIEN] ([MaNguoiDung], [Lop], [MaSinhVien]) VALUES (29, N'Lớp 1 - TOEIC Foundation', N'221121521120')
GO
INSERT [dbo].[SINHVIEN] ([MaNguoiDung], [Lop], [MaSinhVien]) VALUES (30, N'Trường Đại học Kinh tế Đà Nẵng', N'221121521126')
GO
SET IDENTITY_INSERT [dbo].[SINHVIEN_LOPHOC] ON 
GO
INSERT [dbo].[SINHVIEN_LOPHOC] ([MaGhiDanh], [MaLopHoc], [MaSinhVien], [NgayGhiDanh], [TrangThai]) VALUES (1, 1, N'221121521101', CAST(N'2026-03-20T16:38:33.330' AS DateTime), N'Đang học')
GO
INSERT [dbo].[SINHVIEN_LOPHOC] ([MaGhiDanh], [MaLopHoc], [MaSinhVien], [NgayGhiDanh], [TrangThai]) VALUES (2, 1, N'221121521102', CAST(N'2026-03-20T16:38:33.357' AS DateTime), N'Đang học')
GO
INSERT [dbo].[SINHVIEN_LOPHOC] ([MaGhiDanh], [MaLopHoc], [MaSinhVien], [NgayGhiDanh], [TrangThai]) VALUES (3, 1, N'221121521103', CAST(N'2026-03-20T16:38:33.373' AS DateTime), N'Đang học')
GO
INSERT [dbo].[SINHVIEN_LOPHOC] ([MaGhiDanh], [MaLopHoc], [MaSinhVien], [NgayGhiDanh], [TrangThai]) VALUES (4, 1, N'221121521104', CAST(N'2026-03-20T16:38:33.387' AS DateTime), N'Đang học')
GO
INSERT [dbo].[SINHVIEN_LOPHOC] ([MaGhiDanh], [MaLopHoc], [MaSinhVien], [NgayGhiDanh], [TrangThai]) VALUES (5, 1, N'221121521105', CAST(N'2026-03-20T16:38:33.400' AS DateTime), N'Đang học')
GO
INSERT [dbo].[SINHVIEN_LOPHOC] ([MaGhiDanh], [MaLopHoc], [MaSinhVien], [NgayGhiDanh], [TrangThai]) VALUES (6, 1, N'221121521106', CAST(N'2026-03-20T16:38:33.413' AS DateTime), N'Đang học')
GO
INSERT [dbo].[SINHVIEN_LOPHOC] ([MaGhiDanh], [MaLopHoc], [MaSinhVien], [NgayGhiDanh], [TrangThai]) VALUES (7, 1, N'221121521107', CAST(N'2026-03-20T16:38:33.427' AS DateTime), N'Đang học')
GO
INSERT [dbo].[SINHVIEN_LOPHOC] ([MaGhiDanh], [MaLopHoc], [MaSinhVien], [NgayGhiDanh], [TrangThai]) VALUES (8, 1, N'221121521108', CAST(N'2026-03-20T16:38:33.433' AS DateTime), N'Đang học')
GO
INSERT [dbo].[SINHVIEN_LOPHOC] ([MaGhiDanh], [MaLopHoc], [MaSinhVien], [NgayGhiDanh], [TrangThai]) VALUES (9, 1, N'221121521109', CAST(N'2026-03-20T16:38:33.440' AS DateTime), N'Đang học')
GO
INSERT [dbo].[SINHVIEN_LOPHOC] ([MaGhiDanh], [MaLopHoc], [MaSinhVien], [NgayGhiDanh], [TrangThai]) VALUES (10, 1, N'221121521110', CAST(N'2026-03-20T16:38:33.447' AS DateTime), N'Đang học')
GO
INSERT [dbo].[SINHVIEN_LOPHOC] ([MaGhiDanh], [MaLopHoc], [MaSinhVien], [NgayGhiDanh], [TrangThai]) VALUES (11, 1, N'221121521111', CAST(N'2026-03-20T16:38:33.457' AS DateTime), N'Đang học')
GO
INSERT [dbo].[SINHVIEN_LOPHOC] ([MaGhiDanh], [MaLopHoc], [MaSinhVien], [NgayGhiDanh], [TrangThai]) VALUES (12, 1, N'221121521112', CAST(N'2026-03-20T16:38:33.463' AS DateTime), N'Đang học')
GO
INSERT [dbo].[SINHVIEN_LOPHOC] ([MaGhiDanh], [MaLopHoc], [MaSinhVien], [NgayGhiDanh], [TrangThai]) VALUES (13, 1, N'221121521113', CAST(N'2026-03-20T16:38:33.473' AS DateTime), N'Đang học')
GO
INSERT [dbo].[SINHVIEN_LOPHOC] ([MaGhiDanh], [MaLopHoc], [MaSinhVien], [NgayGhiDanh], [TrangThai]) VALUES (14, 1, N'221121521114', CAST(N'2026-03-20T16:38:33.480' AS DateTime), N'Đang học')
GO
INSERT [dbo].[SINHVIEN_LOPHOC] ([MaGhiDanh], [MaLopHoc], [MaSinhVien], [NgayGhiDanh], [TrangThai]) VALUES (15, 1, N'221121521115', CAST(N'2026-03-20T16:38:33.487' AS DateTime), N'Đang học')
GO
INSERT [dbo].[SINHVIEN_LOPHOC] ([MaGhiDanh], [MaLopHoc], [MaSinhVien], [NgayGhiDanh], [TrangThai]) VALUES (16, 1, N'221121521116', CAST(N'2026-03-20T16:38:33.493' AS DateTime), N'Đang học')
GO
INSERT [dbo].[SINHVIEN_LOPHOC] ([MaGhiDanh], [MaLopHoc], [MaSinhVien], [NgayGhiDanh], [TrangThai]) VALUES (17, 1, N'221121521117', CAST(N'2026-03-20T16:38:33.503' AS DateTime), N'Đang học')
GO
INSERT [dbo].[SINHVIEN_LOPHOC] ([MaGhiDanh], [MaLopHoc], [MaSinhVien], [NgayGhiDanh], [TrangThai]) VALUES (18, 1, N'221121521118', CAST(N'2026-03-20T16:38:33.510' AS DateTime), N'Đang học')
GO
INSERT [dbo].[SINHVIEN_LOPHOC] ([MaGhiDanh], [MaLopHoc], [MaSinhVien], [NgayGhiDanh], [TrangThai]) VALUES (19, 1, N'221121521119', CAST(N'2026-03-20T16:38:33.520' AS DateTime), N'Đang học')
GO
INSERT [dbo].[SINHVIEN_LOPHOC] ([MaGhiDanh], [MaLopHoc], [MaSinhVien], [NgayGhiDanh], [TrangThai]) VALUES (20, 1, N'221121521120', CAST(N'2026-03-20T16:38:33.527' AS DateTime), N'Đang học')
GO
INSERT [dbo].[SINHVIEN_LOPHOC] ([MaGhiDanh], [MaLopHoc], [MaSinhVien], [NgayGhiDanh], [TrangThai]) VALUES (21, 1, N'221121521126', CAST(N'2026-03-21T19:34:23.107' AS DateTime), N'Đang học')
GO
SET IDENTITY_INSERT [dbo].[SINHVIEN_LOPHOC] OFF
GO
SET IDENTITY_INSERT [dbo].[TAILIEU] ON 
GO
INSERT [dbo].[TAILIEU] ([MaTaiLieu], [TieuDe], [MoTa], [NgayCapNhat], [MaBuoiHoc], [NoiDung], [FileUrl]) VALUES (1, N'Grammar Handbook – Level B1', N'Tổng hợp các điểm ngữ pháp quan trọng từ A2–B1', CAST(N'2026-03-18T12:09:06.287' AS DateTime), 1, N'Present Perfect Tense

Structure:
S + have/has + V3

Example:
- I have finished my homework.
- She has lived here for 5 years.

Usage:
- Diễn tả hành động xảy ra trong quá khứ nhưng còn liên quan đến hiện tại.
- Diễn tả kinh nghiệm.', NULL)
GO
INSERT [dbo].[TAILIEU] ([MaTaiLieu], [TieuDe], [MoTa], [NgayCapNhat], [MaBuoiHoc], [NoiDung], [FileUrl]) VALUES (2, N'Vocabulary Builder – Daily Life', N'Ôn tập từ vựng chủ đề cuộc sống hàng ngày kèm ví dụ.', CAST(N'2026-03-18T12:09:06.287' AS DateTime), 1, N'Morning Routine – Thói quen buổi sáng

1. Wake up: thức dậy
Example: I usually wake up at 6 a.m.

2. Get up: ra khỏi giường
Example: She gets up and makes her bed.

3. Brush teeth: đánh răng
Example: He brushes his teeth twice a day.

4. Take a shower: tắm
Example: She takes a shower before breakfast.

5. Have breakfast: ăn sáng
Example: They have breakfast together.', NULL)
GO
INSERT [dbo].[TAILIEU] ([MaTaiLieu], [TieuDe], [MoTa], [NgayCapNhat], [MaBuoiHoc], [NoiDung], [FileUrl]) VALUES (3, N'Listening Practice Guide', N'30 đoạn hội thoại luyện nghe và phân tích từ vựng khó.', CAST(N'2026-03-18T12:09:06.287' AS DateTime), 1, N'Listening Practice

Listen to the dialogue and answer the questions.

Dialogue
A: What time do you wake up?
B: I wake up at 6 a.m. every day.

Questions
1. What time does he wake up?
2. What does he do after waking up?', NULL)
GO
INSERT [dbo].[TAILIEU] ([MaTaiLieu], [TieuDe], [MoTa], [NgayCapNhat], [MaBuoiHoc], [NoiDung], [FileUrl]) VALUES (4, N'Speaking Tips – Confident Conversations', N'15 mẹo giúp nói tiếng Anh tự nhiên và lưu loát hơn.', CAST(N'2026-03-18T12:09:06.287' AS DateTime), 1, N'Tips for Speaking English

- Practice speaking every day.
- Don''t be afraid of making mistakes.
- Think in English.
- Use simple sentences first.

Example Conversation
A: How are you today?
B: I''m fine, thank you.', NULL)
GO
INSERT [dbo].[TAILIEU] ([MaTaiLieu], [TieuDe], [MoTa], [NgayCapNhat], [MaBuoiHoc], [NoiDung], [FileUrl]) VALUES (5, N'Reading Skills Workbook – Intermediate', N'Bài đọc ngắn rèn kỹ năng hiểu ý chính & chi tiết.', CAST(N'2026-03-18T12:09:06.287' AS DateTime), 1, N'Reading Practice

Read the passage and answer the questions.

Anna lives in London. She works in a small company.
Every morning she takes the bus to work.

Questions
1. Where does Anna live?
2. How does she go to work?', NULL)
GO
INSERT [dbo].[TAILIEU] ([MaTaiLieu], [TieuDe], [MoTa], [NgayCapNhat], [MaBuoiHoc], [NoiDung], [FileUrl]) VALUES (6, N'Writing Templates – Academic & General', N'Mẫu viết luận, thư, báo cáo chuẩn TOEIC.', CAST(N'2026-03-18T12:09:06.287' AS DateTime), 1, N'Email Writing Template

Dear Mr. Smith,

I am writing to inform you about the meeting tomorrow.
Please let me know if you can attend.

Best regards,
John', NULL)
GO
SET IDENTITY_INSERT [dbo].[TAILIEU] OFF
GO
SET IDENTITY_INSERT [dbo].[TIENDOHOCTAP] ON 
GO
INSERT [dbo].[TIENDOHOCTAP] ([MaTienDo], [MaSinhVien], [MaBaiHoc], [TrangThai], [ThoiDiemHoanThanh]) VALUES (81, 10, 3, N'Hoàn thành', CAST(N'2026-03-19T11:54:26.843' AS DateTime))
GO
INSERT [dbo].[TIENDOHOCTAP] ([MaTienDo], [MaSinhVien], [MaBaiHoc], [TrangThai], [ThoiDiemHoanThanh]) VALUES (82, 10, 4, N'Hoàn thành', CAST(N'2026-03-19T11:54:26.843' AS DateTime))
GO
INSERT [dbo].[TIENDOHOCTAP] ([MaTienDo], [MaSinhVien], [MaBaiHoc], [TrangThai], [ThoiDiemHoanThanh]) VALUES (83, 10, 27, N'Hoàn thành', CAST(N'2026-03-19T11:54:26.843' AS DateTime))
GO
INSERT [dbo].[TIENDOHOCTAP] ([MaTienDo], [MaSinhVien], [MaBaiHoc], [TrangThai], [ThoiDiemHoanThanh]) VALUES (84, 10, 28, N'Hoàn thành', CAST(N'2026-03-19T11:54:26.843' AS DateTime))
GO
INSERT [dbo].[TIENDOHOCTAP] ([MaTienDo], [MaSinhVien], [MaBaiHoc], [TrangThai], [ThoiDiemHoanThanh]) VALUES (85, 11, 3, N'Hoàn thành', CAST(N'2026-03-19T11:54:26.843' AS DateTime))
GO
INSERT [dbo].[TIENDOHOCTAP] ([MaTienDo], [MaSinhVien], [MaBaiHoc], [TrangThai], [ThoiDiemHoanThanh]) VALUES (86, 11, 4, N'Hoàn thành', CAST(N'2026-03-19T11:54:26.843' AS DateTime))
GO
INSERT [dbo].[TIENDOHOCTAP] ([MaTienDo], [MaSinhVien], [MaBaiHoc], [TrangThai], [ThoiDiemHoanThanh]) VALUES (87, 11, 27, N'Hoàn thành', CAST(N'2026-03-19T11:54:26.843' AS DateTime))
GO
INSERT [dbo].[TIENDOHOCTAP] ([MaTienDo], [MaSinhVien], [MaBaiHoc], [TrangThai], [ThoiDiemHoanThanh]) VALUES (88, 11, 28, N'Hoàn thành', CAST(N'2026-03-19T11:54:26.843' AS DateTime))
GO
INSERT [dbo].[TIENDOHOCTAP] ([MaTienDo], [MaSinhVien], [MaBaiHoc], [TrangThai], [ThoiDiemHoanThanh]) VALUES (89, 12, 3, N'Hoàn thành', CAST(N'2026-03-19T11:54:26.843' AS DateTime))
GO
INSERT [dbo].[TIENDOHOCTAP] ([MaTienDo], [MaSinhVien], [MaBaiHoc], [TrangThai], [ThoiDiemHoanThanh]) VALUES (90, 12, 4, N'Hoàn thành', CAST(N'2026-03-19T11:54:26.843' AS DateTime))
GO
INSERT [dbo].[TIENDOHOCTAP] ([MaTienDo], [MaSinhVien], [MaBaiHoc], [TrangThai], [ThoiDiemHoanThanh]) VALUES (91, 12, 27, N'Hoàn thành', CAST(N'2026-03-19T11:54:26.843' AS DateTime))
GO
INSERT [dbo].[TIENDOHOCTAP] ([MaTienDo], [MaSinhVien], [MaBaiHoc], [TrangThai], [ThoiDiemHoanThanh]) VALUES (92, 12, 28, N'Hoàn thành', CAST(N'2026-03-19T11:54:26.843' AS DateTime))
GO
INSERT [dbo].[TIENDOHOCTAP] ([MaTienDo], [MaSinhVien], [MaBaiHoc], [TrangThai], [ThoiDiemHoanThanh]) VALUES (93, 13, 3, N'Hoàn thành', CAST(N'2026-03-19T11:54:26.843' AS DateTime))
GO
INSERT [dbo].[TIENDOHOCTAP] ([MaTienDo], [MaSinhVien], [MaBaiHoc], [TrangThai], [ThoiDiemHoanThanh]) VALUES (94, 13, 4, N'Hoàn thành', CAST(N'2026-03-19T11:54:26.843' AS DateTime))
GO
INSERT [dbo].[TIENDOHOCTAP] ([MaTienDo], [MaSinhVien], [MaBaiHoc], [TrangThai], [ThoiDiemHoanThanh]) VALUES (95, 13, 27, N'Hoàn thành', CAST(N'2026-03-19T11:54:26.843' AS DateTime))
GO
INSERT [dbo].[TIENDOHOCTAP] ([MaTienDo], [MaSinhVien], [MaBaiHoc], [TrangThai], [ThoiDiemHoanThanh]) VALUES (96, 13, 28, N'Hoàn thành', CAST(N'2026-03-19T11:54:26.843' AS DateTime))
GO
INSERT [dbo].[TIENDOHOCTAP] ([MaTienDo], [MaSinhVien], [MaBaiHoc], [TrangThai], [ThoiDiemHoanThanh]) VALUES (97, 14, 3, N'Hoàn thành', CAST(N'2026-03-19T11:54:26.843' AS DateTime))
GO
INSERT [dbo].[TIENDOHOCTAP] ([MaTienDo], [MaSinhVien], [MaBaiHoc], [TrangThai], [ThoiDiemHoanThanh]) VALUES (98, 14, 4, N'Hoàn thành', CAST(N'2026-03-19T11:54:26.843' AS DateTime))
GO
INSERT [dbo].[TIENDOHOCTAP] ([MaTienDo], [MaSinhVien], [MaBaiHoc], [TrangThai], [ThoiDiemHoanThanh]) VALUES (99, 14, 27, N'Hoàn thành', CAST(N'2026-03-19T11:54:26.843' AS DateTime))
GO
INSERT [dbo].[TIENDOHOCTAP] ([MaTienDo], [MaSinhVien], [MaBaiHoc], [TrangThai], [ThoiDiemHoanThanh]) VALUES (100, 14, 28, N'Hoàn thành', CAST(N'2026-03-19T11:54:26.843' AS DateTime))
GO
INSERT [dbo].[TIENDOHOCTAP] ([MaTienDo], [MaSinhVien], [MaBaiHoc], [TrangThai], [ThoiDiemHoanThanh]) VALUES (101, 15, 3, N'Hoàn thành', CAST(N'2026-03-19T11:54:26.843' AS DateTime))
GO
INSERT [dbo].[TIENDOHOCTAP] ([MaTienDo], [MaSinhVien], [MaBaiHoc], [TrangThai], [ThoiDiemHoanThanh]) VALUES (102, 15, 4, N'Hoàn thành', CAST(N'2026-03-19T11:54:26.843' AS DateTime))
GO
INSERT [dbo].[TIENDOHOCTAP] ([MaTienDo], [MaSinhVien], [MaBaiHoc], [TrangThai], [ThoiDiemHoanThanh]) VALUES (103, 15, 27, N'Hoàn thành', CAST(N'2026-03-19T11:54:26.843' AS DateTime))
GO
INSERT [dbo].[TIENDOHOCTAP] ([MaTienDo], [MaSinhVien], [MaBaiHoc], [TrangThai], [ThoiDiemHoanThanh]) VALUES (104, 15, 28, N'Hoàn thành', CAST(N'2026-03-19T11:54:26.843' AS DateTime))
GO
INSERT [dbo].[TIENDOHOCTAP] ([MaTienDo], [MaSinhVien], [MaBaiHoc], [TrangThai], [ThoiDiemHoanThanh]) VALUES (105, 16, 3, N'Hoàn thành', CAST(N'2026-03-19T11:54:26.843' AS DateTime))
GO
INSERT [dbo].[TIENDOHOCTAP] ([MaTienDo], [MaSinhVien], [MaBaiHoc], [TrangThai], [ThoiDiemHoanThanh]) VALUES (106, 16, 4, N'Hoàn thành', CAST(N'2026-03-19T11:54:26.843' AS DateTime))
GO
INSERT [dbo].[TIENDOHOCTAP] ([MaTienDo], [MaSinhVien], [MaBaiHoc], [TrangThai], [ThoiDiemHoanThanh]) VALUES (107, 16, 27, N'Hoàn thành', CAST(N'2026-03-19T11:54:26.843' AS DateTime))
GO
INSERT [dbo].[TIENDOHOCTAP] ([MaTienDo], [MaSinhVien], [MaBaiHoc], [TrangThai], [ThoiDiemHoanThanh]) VALUES (108, 16, 28, N'Hoàn thành', CAST(N'2026-03-19T11:54:26.843' AS DateTime))
GO
INSERT [dbo].[TIENDOHOCTAP] ([MaTienDo], [MaSinhVien], [MaBaiHoc], [TrangThai], [ThoiDiemHoanThanh]) VALUES (109, 17, 3, N'Hoàn thành', CAST(N'2026-03-19T11:54:26.847' AS DateTime))
GO
INSERT [dbo].[TIENDOHOCTAP] ([MaTienDo], [MaSinhVien], [MaBaiHoc], [TrangThai], [ThoiDiemHoanThanh]) VALUES (110, 18, 3, N'Hoàn thành', CAST(N'2026-03-19T11:54:26.847' AS DateTime))
GO
INSERT [dbo].[TIENDOHOCTAP] ([MaTienDo], [MaSinhVien], [MaBaiHoc], [TrangThai], [ThoiDiemHoanThanh]) VALUES (111, 19, 3, N'Hoàn thành', CAST(N'2026-03-19T11:54:26.847' AS DateTime))
GO
INSERT [dbo].[TIENDOHOCTAP] ([MaTienDo], [MaSinhVien], [MaBaiHoc], [TrangThai], [ThoiDiemHoanThanh]) VALUES (112, 20, 3, N'Hoàn thành', CAST(N'2026-03-19T11:54:26.847' AS DateTime))
GO
INSERT [dbo].[TIENDOHOCTAP] ([MaTienDo], [MaSinhVien], [MaBaiHoc], [TrangThai], [ThoiDiemHoanThanh]) VALUES (113, 21, 3, N'Hoàn thành', CAST(N'2026-03-19T11:54:26.847' AS DateTime))
GO
INSERT [dbo].[TIENDOHOCTAP] ([MaTienDo], [MaSinhVien], [MaBaiHoc], [TrangThai], [ThoiDiemHoanThanh]) VALUES (114, 22, 3, N'Hoàn thành', CAST(N'2026-03-19T11:54:26.847' AS DateTime))
GO
SET IDENTITY_INSERT [dbo].[TIENDOHOCTAP] OFF
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__NGUOIDUN__55F68FC0B62B4965]    Script Date: 07/04/2026 7:40:10 PM ******/
ALTER TABLE [dbo].[NGUOIDUNG] ADD UNIQUE NONCLUSTERED 
(
	[TenDangNhap] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
ALTER TABLE [dbo].[BAINOP] ADD  DEFAULT (getdate()) FOR [NgayNop]
GO
ALTER TABLE [dbo].[BAINOP] ADD  DEFAULT (N'Chờ chấm') FOR [TrangThai]
GO
ALTER TABLE [dbo].[DANGKYKHOAHOC] ADD  DEFAULT (getdate()) FOR [NgayDangKy]
GO
ALTER TABLE [dbo].[DANGKYKHOAHOC] ADD  DEFAULT ('Active') FOR [TrangThai]
GO
ALTER TABLE [dbo].[BAITAP] ADD  DEFAULT ((0)) FOR [ShowAnswer]
GO
ALTER TABLE [dbo].[KETQUABAIKIEMTRA] ADD  DEFAULT (getdate()) FOR [ThoiGianLamBai]
GO
ALTER TABLE [dbo].[KHOAHOC] ADD  DEFAULT ('Pending') FOR [TrangThai]
GO
ALTER TABLE [dbo].[KHOAHOC] ADD  DEFAULT (getdate()) FOR [NgayTao]
GO
ALTER TABLE [dbo].[NGUOIDUNG] ADD  DEFAULT ('Active') FOR [TrangThai]
GO
ALTER TABLE [dbo].[NGUOIDUNG] ADD  DEFAULT (getdate()) FOR [NgayTao]
GO
ALTER TABLE [dbo].[PHANCONGGIANGVIEN] ADD  DEFAULT (getdate()) FOR [NgayPhanCong]
GO
ALTER TABLE [dbo].[SINHVIEN_LOPHOC] ADD  DEFAULT (getdate()) FOR [NgayGhiDanh]
GO
ALTER TABLE [dbo].[SINHVIEN_LOPHOC] ADD  DEFAULT (N'Đang học') FOR [TrangThai]
GO
ALTER TABLE [dbo].[TAILIEU] ADD  DEFAULT (getdate()) FOR [NgayCapNhat]
GO
ALTER TABLE [dbo].[ADMIN]  WITH CHECK ADD FOREIGN KEY([MaNguoiDung])
REFERENCES [dbo].[NGUOIDUNG] ([MaNguoiDung])
GO

ALTER TABLE [dbo].[BAIHOCKHOAHOC]  WITH CHECK ADD FOREIGN KEY([MaGiangVien])
REFERENCES [dbo].[GIANGVIEN] ([MaGiangVien])
GO
ALTER TABLE [dbo].[BAIHOCKHOAHOC]  WITH CHECK ADD FOREIGN KEY([MaKhoaHoc])
REFERENCES [dbo].[KHOAHOC] ([MaKhoaHoc])
GO
ALTER TABLE [dbo].[BAIHOCKHOAHOC]  WITH CHECK ADD  CONSTRAINT [FK_BaiHocKhoaHoc_BuoiHoc] FOREIGN KEY([MaBuoiHoc])
REFERENCES [dbo].[BUOIHOC] ([MaBuoiHoc])
GO
ALTER TABLE [dbo].[BAIHOCKHOAHOC] CHECK CONSTRAINT [FK_BaiHocKhoaHoc_BuoiHoc]
GO

ALTER TABLE [dbo].[BAIKIEMTRA]  WITH CHECK ADD FOREIGN KEY([MaBuoiHoc])
REFERENCES [dbo].[BUOIHOC] ([MaBuoiHoc])
GO
ALTER TABLE [dbo].[BAIKIEMTRA]  WITH CHECK ADD FOREIGN KEY([MaGiangVien])
REFERENCES [dbo].[GIANGVIEN] ([MaGiangVien])
GO
ALTER TABLE [dbo].[BAINOP]  WITH CHECK ADD FOREIGN KEY([MaBaiTap])
REFERENCES [dbo].[BAITAP] ([MaBaiTap])
GO

ALTER TABLE [dbo].[CAUHOI]  WITH CHECK ADD FOREIGN KEY([MaBaiKiemTra])
REFERENCES [dbo].[BAIKIEMTRA] ([MaBaiKiemTra])
GO
ALTER TABLE [dbo].[DANGKYKHOAHOC]  WITH CHECK ADD FOREIGN KEY([MaKhoaHoc])
REFERENCES [dbo].[KHOAHOC] ([MaKhoaHoc])
GO
ALTER TABLE [dbo].[DAPAN]  WITH CHECK ADD FOREIGN KEY([MaCauHoi])
REFERENCES [dbo].[CAUHOI] ([MaCauHoi])
GO

ALTER TABLE [dbo].[BAITAP]  WITH CHECK ADD  CONSTRAINT [FK_BaiTap_BaiHocKhoaHoc] FOREIGN KEY([MaBaiHoc])
REFERENCES [dbo].[BAIHOCKHOAHOC] ([MaBaiHoc])
GO
ALTER TABLE [dbo].[BAITAP] CHECK CONSTRAINT [FK_BaiTap_BaiHocKhoaHoc]
GO
ALTER TABLE [dbo].[GIANGVIEN]  WITH CHECK ADD FOREIGN KEY([MaNguoiDung])
REFERENCES [dbo].[NGUOIDUNG] ([MaNguoiDung])
GO
ALTER TABLE [dbo].[KETQUABAIKIEMTRA]  WITH CHECK ADD FOREIGN KEY([MaBaiKiemTra])
REFERENCES [dbo].[BAIKIEMTRA] ([MaBaiKiemTra])
GO
ALTER TABLE [dbo].[KHOAHOC]  WITH CHECK ADD FOREIGN KEY([MaNguoiDung])
REFERENCES [dbo].[NGUOIDUNG] ([MaNguoiDung])
GO
ALTER TABLE [dbo].[KHOAHOC]  WITH CHECK ADD  CONSTRAINT [FK_KhoaHoc_GiaoVien] FOREIGN KEY([MaGiaoVien])
REFERENCES [dbo].[NGUOIDUNG] ([MaNguoiDung])
GO
ALTER TABLE [dbo].[KHOAHOC] CHECK CONSTRAINT [FK_KhoaHoc_GiaoVien]
GO
ALTER TABLE [dbo].[KHOAHOCCHITIET]  WITH CHECK ADD FOREIGN KEY([MaKhoaHoc])
REFERENCES [dbo].[KHOAHOC] ([MaKhoaHoc])
GO

ALTER TABLE [dbo].[BUOIHOC]  WITH CHECK ADD FOREIGN KEY([MaLopHoc])
REFERENCES [dbo].[LOPHOC] ([MaLopHoc])
GO
ALTER TABLE [dbo].[LOPHOC]  WITH CHECK ADD FOREIGN KEY([MaLop])
REFERENCES [dbo].[KHOAHOCCHITIET] ([MaLop])
GO
ALTER TABLE [dbo].[LOPHOC]  WITH CHECK ADD  CONSTRAINT [FK_LopHoc_GiangVien] FOREIGN KEY([MaGiangVien])
REFERENCES [dbo].[GIANGVIEN] ([MaGiangVien])
GO
ALTER TABLE [dbo].[LOPHOC] CHECK CONSTRAINT [FK_LopHoc_GiangVien]
GO
ALTER TABLE [dbo].[PHANCONGGIANGVIEN]  WITH CHECK ADD FOREIGN KEY([MaGiangVien])
REFERENCES [dbo].[GIANGVIEN] ([MaGiangVien])
GO
ALTER TABLE [dbo].[PHANCONGGIANGVIEN]  WITH CHECK ADD FOREIGN KEY([MaKhoaHoc])
REFERENCES [dbo].[KHOAHOC] ([MaKhoaHoc])
GO
ALTER TABLE [dbo].[QUANTRIVIENNOIDUNG]  WITH CHECK ADD FOREIGN KEY([MaNguoiDung])
REFERENCES [dbo].[NGUOIDUNG] ([MaNguoiDung])
GO
ALTER TABLE [dbo].[SINHVIEN]  WITH CHECK ADD FOREIGN KEY([MaNguoiDung])
REFERENCES [dbo].[NGUOIDUNG] ([MaNguoiDung])
GO
ALTER TABLE [dbo].[SINHVIEN_LOPHOC]  WITH CHECK ADD FOREIGN KEY([MaLopHoc])
REFERENCES [dbo].[LOPHOC] ([MaLopHoc])
GO
ALTER TABLE [dbo].[SINHVIEN_LOPHOC]  WITH CHECK ADD FOREIGN KEY([MaSinhVien])
REFERENCES [dbo].[SINHVIEN] ([MaSinhVien])
GO
ALTER TABLE [dbo].[TAILIEU]  WITH CHECK ADD FOREIGN KEY([MaBuoiHoc])
REFERENCES [dbo].[BUOIHOC] ([MaBuoiHoc])
GO
ALTER TABLE [dbo].[TIENDOHOCTAP]  WITH CHECK ADD FOREIGN KEY([MaBaiHoc])
REFERENCES [dbo].[BAIHOCKHOAHOC] ([MaBaiHoc])
GO
ALTER TABLE [dbo].[TONGKETKHOAHOC]  WITH CHECK ADD FOREIGN KEY([MaKhoaHoc])
REFERENCES [dbo].[KHOAHOC] ([MaKhoaHoc])
GO



  -- Bước 1: Thêm 4 cột mới vào bảng với kiểu dữ liệu BIT (True/False trong SQL Server)
ALTER TABLE [WebHocTiengAnh].[dbo].[KHOAHOC]
ADD 
    [Listening] BIT NULL,
    [Reading] BIT NULL,
    [Writing] BIT NULL,
    [Speaking] BIT NULL;
GO

-- Bước 2: Cập nhật giá trị của cả 4 cột này thành True (số 1 tương đương với True trong kiểu BIT) cho các bản ghi cũ
UPDATE [WebHocTiengAnh].[dbo].[KHOAHOC]
SET 
    [Listening] = 1,
    [Reading] = 1,
    [Writing] = 1,
    [Speaking] = 1;
GO

-- =========================================================================
-- TẠO BẢNG DETHI PHÙ HỢP VỚI GIAO DIỆN THIẾT KẾ ĐỀ THI
-- =========================================================================

CREATE TABLE [dbo].[DETHI](
    [MaDeThi] [int] IDENTITY(1,1) NOT NULL,
    [TieuDe] [nvarchar](255) NOT NULL,
    [MoTa] [nvarchar](max) NULL,
    [ThoiGian] [int] NOT NULL, -- Thời gian làm bài (tính bằng phút, ví dụ: 120)
    [CapDo] [nvarchar](50) NULL, -- Trình độ (ví dụ: B1, B2, C1)
    [LoaiBai] [nvarchar](50) NULL, -- Loại bài thi (ví dụ: VSTEP, IELTS)
    [NoiDungDeThi] [nvarchar](max) NOT NULL, -- Cấu trúc JSON lưu 4 kỹ năng (listening, reading, writing, speaking) kèm phần thi & câu hỏi
    [TrangThai] [nvarchar](50) NOT NULL CONSTRAINT [DF_DETHI_TrangThai] DEFAULT ('draft'), -- 'published' (Đăng lên) | 'draft' (Lưu nháp)
    [TrangThaiDuyet] [nvarchar](50) NOT NULL CONSTRAINT [DF_DETHI_TrangThaiDuyet] DEFAULT (N'Chờ duyệt'), -- N'Chờ duyệt' | N'Đã duyệt' | N'Từ chối'
    [MaNguoiDung] [int] NOT NULL, -- ID của Giáo viên / QTV tạo đề
    [NgayTao] [datetime] NOT NULL CONSTRAINT [DF_DETHI_NgayTao] DEFAULT (GETDATE()),
    [NgayDuyet] [datetime] NULL,
    [MaNguoiDuyet] [int] NULL, -- ID của QTV duyệt đề
PRIMARY KEY CLUSTERED 
(
    [MaDeThi] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

-- Tạo khóa ngoại liên kết với bảng NGUOIDUNG (người tạo đề thi)
ALTER TABLE [dbo].[DETHI] WITH CHECK ADD CONSTRAINT [FK_DETHI_NGUOIDUNG] FOREIGN KEY([MaNguoiDung])
REFERENCES [dbo].[NGUOIDUNG] ([MaNguoiDung])
GO
ALTER TABLE [dbo].[DETHI] CHECK CONSTRAINT [FK_DETHI_NGUOIDUNG]
GO

-- Tạo khóa ngoại liên kết với bảng NGUOIDUNG (người duyệt đề thi)
ALTER TABLE [dbo].[DETHI] WITH CHECK ADD CONSTRAINT [FK_DETHI_NGUOIDUNG_DUYET] FOREIGN KEY([MaNguoiDuyet])
REFERENCES [dbo].[NGUOIDUNG] ([MaNguoiDung])
GO
ALTER TABLE [dbo].[DETHI] CHECK CONSTRAINT [FK_DETHI_NGUOIDUNG_DUYET]
GO

-- =========================================================================
-- CHÈN DỮ LIỆU MẪU ĐỀ THI THỬ (DETHI)
-- =========================================================================

SET IDENTITY_INSERT [dbo].[DETHI] ON 
GO

INSERT INTO [dbo].[DETHI] (
    [MaDeThi], [TieuDe], [MoTa], [ThoiGian], [CapDo], [LoaiBai], [NoiDungDeThi], [TrangThai], [TrangThaiDuyet], [MaNguoiDung], [NgayTao]
) VALUES (
    1, 
    N'VSTEP B1 - Đề thi mẫu số 1', 
    N'Đề thi thử VSTEP trình độ B1 bao gồm đầy đủ 4 kỹ năng: Nghe, Đọc, Viết và Nói.', 
    177, 
    N'B1', 
    N'VSTEP', 
    N'{"listening":{"parts":[{"soPhan":1,"tieuDe":"Part 1: Short Conversations","huongDan":"In this part, you will hear EIGHT short recordings. For each question, choose the correct answer A, B, C or D.","audioUrl":"/coffee-shop.mp3","cauHois":[{"id":1,"noiDung":"What music will they have at the party?","luaChon":["A. guitar","B. cello","C. CDs","D. piano"],"dapAn":"D"},{"id":2,"noiDung":"What is the man''s problem?","luaChon":["A. He lost his wallet","B. He missed his flight","C. He forgot his passport","D. He is late for work"],"dapAn":"B"}]}]},"reading":{"parts":[{"soPhan":1,"tieuDe":"Part 1: Reading Comprehension","huongDan":"Directions: Read the questions below and select the correct answer A, B, C or D.","doanVan":"It is estimated that over 99 percent of all species that ever existed have become extinct. When a species is no longer adapted to a changed environment, it may perish.","cauHois":[{"id":1,"noiDung":"The word ''it'' in the paragraph refers to","luaChon":["A. extinction","B. species","C. environment","D. 99 percent"],"dapAn":"A"},{"id":2,"noiDung":"What causes extinction according to the text?","luaChon":["A. Rapid adaptation","B. Environmental change and lack of adaptation","C. Human conservation","D. Abundant food resources"],"dapAn":"B"}]}]},"writing":{"parts":[{"soPhan":1,"tieuDe":"Writing Part 1","huongDan":"You should spend about 20 minutes on this task.","yeuCau":"Email","noiDung":"I''m a rock fan. What about you? What is your favorite song? Write to tell me more.","soTuToiThieu":120},{"soPhan":2,"tieuDe":"Writing Part 2","huongDan":"You should spend about 40 minutes on this task.","yeuCau":"Essay","noiDung":"Technology makes our lives easier and more convenient. Discuss both sides and give your opinion.","soTuToiThieu":250}]},"speaking":{"parts":[{"soPhan":1,"tieuDe":"Speaking Part 1: Social Interaction","moTa":"Speaking practice for part 1","audioUrl":"/coffee-shop.mp3","noiDung":"What do you usually do in the morning? What are your hobbies and why?","thoiGianChuanBi":60,"thoiGianNoi":180}]}}', 
    'published', 
    N'Đã duyệt', 
    4, -- Mã người dùng "Teacher"
    GETDATE()
)
GO

INSERT INTO [dbo].[DETHI] (
    [MaDeThi], [TieuDe], [MoTa], [ThoiGian], [CapDo], [LoaiBai], [NoiDungDeThi], [TrangThai], [TrangThaiDuyet], [MaNguoiDung], [NgayTao]
) VALUES (
    2, 
    N'VSTEP B2 - Đề thi mẫu số 2', 
    N'Đề thi thử VSTEP trình độ B2 với câu hỏi nâng cao hơn cho cả 4 kỹ năng.', 
    177, 
    N'B2', 
    N'VSTEP', 
    N'{"listening":{"parts":[{"soPhan":1,"tieuDe":"Part 1: News and Reports","huongDan":"Listen to the report and answer the following questions.","audioUrl":"/job-interview.mp3","cauHois":[{"id":1,"noiDung":"How does the reporter feel about the new policy?","luaChon":["A. Skeptical","B. Enthusiastic","C. Neutral","D. Anxious"],"dapAn":"B"}]}]},"reading":{"parts":[{"soPhan":1,"tieuDe":"Part 1: Academic Reading","huongDan":"Read the essay and select correct responses.","doanVan":"The Industrial Revolution fundamentally changed global manufacturing systems, moving production from homes to factories.","cauHois":[{"id":1,"noiDung":"What was the main shift during the Industrial Revolution?","luaChon":["A. Cottage to factories","B. Factories to cottages","C. Cities to farms","D. Manual to solar energy"],"dapAn":"A"}]}]},"writing":{"parts":[{"soPhan":1,"tieuDe":"Writing Part 1","huongDan":"Write an email responding to this request.","yeuCau":"Email","noiDung":"Tell us about your work experience.","soTuToiThieu":120},{"soPhan":2,"tieuDe":"Writing Part 2","huongDan":"Write an essay about environment.","yeuCau":"Essay","noiDung":"Should cars be banned in city centers?","soTuToiThieu":250}]},"speaking":{"parts":[{"soPhan":1,"tieuDe":"Speaking Part 1","moTa":"Speaking practice B2","audioUrl":"/job-interview.mp3","noiDung":"Talk about a recent book you read.","thoiGianChuanBi":60,"thoiGianNoi":180}]}}', 
    'published', 
    N'Đã duyệt', 
    4, -- Mã người dùng "Teacher"
    GETDATE()
)
GO

SET IDENTITY_INSERT [dbo].[DETHI] OFF
GO
