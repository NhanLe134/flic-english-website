-- Tạo bảng NGUOIDUNG_QUYENHAN để lưu quyền riêng cho từng cá nhân
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='NGUOIDUNG_QUYENHAN' and xtype='U')
BEGIN
    CREATE TABLE [dbo].[NGUOIDUNG_QUYENHAN] (
        [MaNguoiDung] [int] NOT NULL,
        [MaQuyenHan] [int] NOT NULL,
        PRIMARY KEY CLUSTERED 
        (
            [MaNguoiDung] ASC,
            [MaQuyenHan] ASC
        )
    ) ON [PRIMARY]
    PRINT 'Table NGUOIDUNG_QUYENHAN created.'
END
ELSE
BEGIN
    PRINT 'Table NGUOIDUNG_QUYENHAN already exists.'
END
GO