-- =========================================================================
-- 1. CẬP NHẬT BẢNG BAITAP (CHUYỂN TỪ BUOIHOC SANG BAIHOCKHOAHOC)
-- =========================================================================
-- Xóa khóa ngoại cũ trỏ tới BUOIHOC (nếu có tên constraint cụ thể)
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Exercise_BuoiHoc' OR name = 'FK_BaiTap_BuoiHoc')
BEGIN
    ALTER TABLE [dbo].[BAITAP] DROP CONSTRAINT [FK_Exercise_BuoiHoc];
END
GO

-- Thêm cột MaBaiHoc vào bảng BAITAP
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.BAITAP') AND name = 'MaBaiHoc')
BEGIN
    ALTER TABLE [dbo].[BAITAP] ADD [MaBaiHoc] INT NULL;
END
GO

-- Tạo ràng buộc khóa ngoại mới trỏ tới BAIHOCKHOAHOC
ALTER TABLE [dbo].[BAITAP] WITH CHECK ADD CONSTRAINT [FK_BaiTap_BaiHocKhoaHoc] FOREIGN KEY([MaBaiHoc])
REFERENCES [dbo].[BAIHOCKHOAHOC] ([MaBaiHoc])
GO
ALTER TABLE [dbo].[BAITAP] CHECK CONSTRAINT [FK_BaiTap_BaiHocKhoaHoc]
GO

-- Dọn dẹp cột cũ MaBuoiHoc trong bảng BAITAP (sau khi đã ánh xạ dữ liệu hoặc chạy sạch)
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.BAITAP') AND name = 'MaBuoiHoc')
BEGIN
    ALTER TABLE [dbo].[BAITAP] DROP COLUMN [MaBuoiHoc];
END
GO


-- =========================================================================
-- 2. CẬP NHẬT BẢNG BAIKIEMTRA (CHUYỂN TỪ BAIHOCKHOAHOC SANG BUOIHOC)
-- =========================================================================
-- Tìm và xóa khóa ngoại cũ của BAIKIEMTRA trỏ tới BAIHOCKHOAHOC
DECLARE @ConstraintName NVARCHAR(255)
SELECT @ConstraintName = obj.name
FROM sys.foreign_keys fk
INNER JOIN sys.objects obj ON fk.object_id = obj.object_id
WHERE fk.parent_object_id = OBJECT_ID('dbo.BAIKIEMTRA')
  AND fk.referenced_object_id = OBJECT_ID('dbo.BAIHOCKHOAHOC')

IF @ConstraintName IS NOT NULL
BEGIN
    EXEC('ALTER TABLE [dbo].[BAIKIEMTRA] DROP CONSTRAINT ' + @ConstraintName);
END
GO

-- Thêm cột MaBuoiHoc vào bảng BAIKIEMTRA
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.BAIKIEMTRA') AND name = 'MaBuoiHoc')
BEGIN
    ALTER TABLE [dbo].[BAIKIEMTRA] ADD [MaBuoiHoc] INT NULL;
END
GO

-- Tạo ràng buộc khóa ngoại mới trỏ tới BUOIHOC
ALTER TABLE [dbo].[BAIKIEMTRA] WITH CHECK ADD CONSTRAINT [FK_BaiKiemTra_BuoiHoc] FOREIGN KEY([MaBuoiHoc])
REFERENCES [dbo].[BUOIHOC] ([MaBuoiHoc])
GO
ALTER TABLE [dbo].[BAIKIEMTRA] CHECK CONSTRAINT [FK_BaiKiemTra_BuoiHoc]
GO

-- Xóa cột cũ MaBaiHoc trong bảng BAIKIEMTRA
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.BAIKIEMTRA') AND name = 'MaBaiHoc')
BEGIN
    ALTER TABLE [dbo].[BAIKIEMTRA] DROP COLUMN [MaBaiHoc];
END
GO


-- =========================================================================
-- 3. CẬP NHẬT BẢNG LUYENTAPTHEM (CHỨA TRONG BUOIHOC)
-- =========================================================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID('dbo.LUYENTAPTHEM') AND type = 'U')
BEGIN
    -- Thêm cột MaBuoiHoc vào LUYENTAPTHEM nếu chưa có
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.LUYENTAPTHEM') AND name = 'MaBuoiHoc')
    BEGIN
        ALTER TABLE [dbo].[LUYENTAPTHEM] ADD [MaBuoiHoc] INT NULL;
    END
    
    -- Tạo ràng buộc khóa ngoại
    IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_LuyenTapThem_BuoiHoc')
    BEGIN
        ALTER TABLE [dbo].[LUYENTAPTHEM] WITH CHECK ADD CONSTRAINT [FK_LuyenTapThem_BuoiHoc] FOREIGN KEY([MaBuoiHoc])
        REFERENCES [dbo].[BUOIHOC] ([MaBuoiHoc])
        
        ALTER TABLE [dbo].[LUYENTAPTHEM] CHECK CONSTRAINT [FK_LuyenTapThem_BuoiHoc]
    END
END
GO