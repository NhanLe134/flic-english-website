USE Website;
GO

/* =========================================================
   CAP NHAT PHAN QUYEN MOI THEO YEU CAU KHACH HANG
   SQL Server 2014 compatible

   LUU Y:
   - Chi tao kho quyen trong QUYENHAN
   - KHONG gan mac dinh cho Giang vien / Quan tri noi dung
   - Admin se tick quyen tren giao dien
   - Quyen duoc luu vao VAITRO_QUYENHAN
   ========================================================= */


/* =========================================================
   PHAN 1: DAM BAO CAC BANG PHAN QUYEN TON TAI
   ========================================================= */

IF OBJECT_ID('VAITRO', 'U') IS NULL
BEGIN
    CREATE TABLE VAITRO (
        MaVaiTro INT IDENTITY(1,1) PRIMARY KEY,
        TenVaiTro NVARCHAR(50) NOT NULL UNIQUE
    );
END
GO

IF OBJECT_ID('QUYENHAN', 'U') IS NULL
BEGIN
    CREATE TABLE QUYENHAN (
        MaQuyenHan INT IDENTITY(1,1) PRIMARY KEY,
        TenQuyenHan NVARCHAR(100) NOT NULL UNIQUE
    );
END
GO

IF OBJECT_ID('VAITRO_QUYENHAN', 'U') IS NULL
BEGIN
    CREATE TABLE VAITRO_QUYENHAN (
        MaVaiTro INT NOT NULL,
        MaQuyenHan INT NOT NULL,

        CONSTRAINT PK_VAITRO_QUYENHAN
            PRIMARY KEY (MaVaiTro, MaQuyenHan),

        CONSTRAINT FK_VTQH_VAITRO
            FOREIGN KEY (MaVaiTro)
            REFERENCES VAITRO(MaVaiTro),

        CONSTRAINT FK_VTQH_QUYENHAN
            FOREIGN KEY (MaQuyenHan)
            REFERENCES QUYENHAN(MaQuyenHan)
    );
END
GO


/* =========================================================
   PHAN 2: DAM BAO CAC VAI TRO CO SAN
   ========================================================= */

IF NOT EXISTS (SELECT 1 FROM VAITRO WHERE TenVaiTro = N'Admin')
    INSERT INTO VAITRO (TenVaiTro) VALUES (N'Admin');

IF NOT EXISTS (SELECT 1 FROM VAITRO WHERE TenVaiTro = N'Giảng viên')
    INSERT INTO VAITRO (TenVaiTro) VALUES (N'Giảng viên');

IF NOT EXISTS (SELECT 1 FROM VAITRO WHERE TenVaiTro = N'Học viên')
    INSERT INTO VAITRO (TenVaiTro) VALUES (N'Học viên');

IF NOT EXISTS (SELECT 1 FROM VAITRO WHERE TenVaiTro = N'Quản trị nội dung')
    INSERT INTO VAITRO (TenVaiTro) VALUES (N'Quản trị nội dung');
GO


/* =========================================================
   PHAN 3: THEM MaVaiTro VAO NGUOIDUNG NEU CHUA CO
   ========================================================= */

IF OBJECT_ID('NGUOIDUNG', 'U') IS NOT NULL
   AND COL_LENGTH('NGUOIDUNG', 'MaVaiTro') IS NULL
BEGIN
    ALTER TABLE NGUOIDUNG
    ADD MaVaiTro INT NULL;
END
GO

IF OBJECT_ID('NGUOIDUNG', 'U') IS NOT NULL
   AND NOT EXISTS (
        SELECT 1 
        FROM sys.foreign_keys 
        WHERE name = 'FK_NGUOIDUNG_VAITRO'
   )
BEGIN
    ALTER TABLE NGUOIDUNG
    ADD CONSTRAINT FK_NGUOIDUNG_VAITRO
    FOREIGN KEY (MaVaiTro)
    REFERENCES VAITRO(MaVaiTro);
END
GO


/* =========================================================
   PHAN 4: THEM DANH SACH QUYEN MOI
   Chi them vao kho quyen, chua gan cho vai tro nao
   ========================================================= */

/* Nhom quyen cua giang vien / noi dung hoc tap */
IF NOT EXISTS (SELECT 1 FROM QUYENHAN WHERE TenQuyenHan = N'Đăng bài giảng')
    INSERT INTO QUYENHAN (TenQuyenHan) VALUES (N'Đăng bài giảng');

IF NOT EXISTS (SELECT 1 FROM QUYENHAN WHERE TenQuyenHan = N'Đăng bài tập')
    INSERT INTO QUYENHAN (TenQuyenHan) VALUES (N'Đăng bài tập');

IF NOT EXISTS (SELECT 1 FROM QUYENHAN WHERE TenQuyenHan = N'Đăng bài kiểm tra')
    INSERT INTO QUYENHAN (TenQuyenHan) VALUES (N'Đăng bài kiểm tra');

IF NOT EXISTS (SELECT 1 FROM QUYENHAN WHERE TenQuyenHan = N'Đăng bài luyện tập thêm')
    INSERT INTO QUYENHAN (TenQuyenHan) VALUES (N'Đăng bài luyện tập thêm');

IF NOT EXISTS (SELECT 1 FROM QUYENHAN WHERE TenQuyenHan = N'Đăng tài liệu')
    INSERT INTO QUYENHAN (TenQuyenHan) VALUES (N'Đăng tài liệu');

IF NOT EXISTS (SELECT 1 FROM QUYENHAN WHERE TenQuyenHan = N'Chấm điểm')
    INSERT INTO QUYENHAN (TenQuyenHan) VALUES (N'Chấm điểm');


/* Nhom quyen cua quan tri noi dung */
IF NOT EXISTS (SELECT 1 FROM QUYENHAN WHERE TenQuyenHan = N'Tạo lớp trong khóa')
    INSERT INTO QUYENHAN (TenQuyenHan) VALUES (N'Tạo lớp trong khóa');

IF NOT EXISTS (SELECT 1 FROM QUYENHAN WHERE TenQuyenHan = N'Phân lớp sinh viên')
    INSERT INTO QUYENHAN (TenQuyenHan) VALUES (N'Phân lớp sinh viên');

IF NOT EXISTS (SELECT 1 FROM QUYENHAN WHERE TenQuyenHan = N'Duyệt bài đăng giáo viên')
    INSERT INTO QUYENHAN (TenQuyenHan) VALUES (N'Duyệt bài đăng giáo viên');

IF NOT EXISTS (SELECT 1 FROM QUYENHAN WHERE TenQuyenHan = N'Xem điểm')
    INSERT INTO QUYENHAN (TenQuyenHan) VALUES (N'Xem điểm');

IF NOT EXISTS (SELECT 1 FROM QUYENHAN WHERE TenQuyenHan = N'Xem bài làm học viên')
    INSERT INTO QUYENHAN (TenQuyenHan) VALUES (N'Xem bài làm học viên');
GO


/* =========================================================
   PHAN 5: ADMIN CO TAT CA QUYEN
   Cac vai tro khac KHONG gan mac dinh
   Admin se tick quyen tren giao dien
   ========================================================= */

DECLARE @MaVaiTroAdmin INT;

SELECT @MaVaiTroAdmin = MaVaiTro
FROM VAITRO
WHERE TenVaiTro = N'Admin';

IF @MaVaiTroAdmin IS NOT NULL
BEGIN
    INSERT INTO VAITRO_QUYENHAN (MaVaiTro, MaQuyenHan)
    SELECT @MaVaiTroAdmin, qh.MaQuyenHan
    FROM QUYENHAN qh
    WHERE NOT EXISTS (
        SELECT 1
        FROM VAITRO_QUYENHAN vtqh
        WHERE vtqh.MaVaiTro = @MaVaiTroAdmin
          AND vtqh.MaQuyenHan = qh.MaQuyenHan
    );
END
GO


/* =========================================================
   PHAN 6: PROCEDURE CAP NHAT QUYEN CHO VAI TRO
   Dung khi Admin tick checkbox va bam Luu
   @DanhSachMaQuyen vi du: N'1,2,3,5'
   ========================================================= */

IF OBJECT_ID(N'dbo.sp_CapNhatQuyenChoVaiTro', N'P') IS NOT NULL
    DROP PROCEDURE sp_CapNhatQuyenChoVaiTro;
GO

CREATE PROCEDURE sp_CapNhatQuyenChoVaiTro
    @MaVaiTro INT,
    @DanhSachMaQuyen NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        DELETE FROM VAITRO_QUYENHAN
        WHERE MaVaiTro = @MaVaiTro;

        IF @DanhSachMaQuyen IS NOT NULL 
           AND LTRIM(RTRIM(@DanhSachMaQuyen)) <> N''
        BEGIN
            ;WITH SplitQuyen AS (
                SELECT 
                    CAST('<x>' + REPLACE(@DanhSachMaQuyen, ',', '</x><x>') + '</x>' AS XML) AS DataXml
            ),
            MaQuyen AS (
                SELECT 
                    T.C.value('.', 'INT') AS MaQuyenHan
                FROM SplitQuyen
                CROSS APPLY DataXml.nodes('/x') AS T(C)
                WHERE T.C.value('.', 'NVARCHAR(20)') <> ''
            )
            INSERT INTO VAITRO_QUYENHAN (MaVaiTro, MaQuyenHan)
            SELECT DISTINCT @MaVaiTro, mq.MaQuyenHan
            FROM MaQuyen mq
            JOIN QUYENHAN qh
                ON mq.MaQuyenHan = qh.MaQuyenHan;
        END

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;

        DECLARE @Err NVARCHAR(4000);
        SET @Err = ERROR_MESSAGE();

        RAISERROR(@Err, 16, 1);
    END CATCH
END
GO


/* =========================================================
   PHAN 7: PROCEDURE LAY DANH SACH QUYEN THEO VAI TRO
   Dung de hien thi checkbox trong man hinh phan quyen
   ========================================================= */

IF OBJECT_ID(N'dbo.sp_LayQuyenTheoVaiTro', N'P') IS NOT NULL
    DROP PROCEDURE sp_LayQuyenTheoVaiTro;
GO

CREATE PROCEDURE sp_LayQuyenTheoVaiTro
    @MaVaiTro INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        qh.MaQuyenHan,
        qh.TenQuyenHan,
        CASE 
            WHEN vtqh.MaVaiTro IS NULL THEN 0
            ELSE 1
        END AS DaDuocGan
    FROM QUYENHAN qh
    LEFT JOIN VAITRO_QUYENHAN vtqh
        ON qh.MaQuyenHan = vtqh.MaQuyenHan
       AND vtqh.MaVaiTro = @MaVaiTro
    ORDER BY qh.TenQuyenHan;
END
GO


/* =========================================================
   PHAN 8: KIEM TRA SAU KHI CHAY
   ========================================================= */

SELECT * FROM VAITRO;
SELECT * FROM QUYENHAN;

SELECT 
    vt.TenVaiTro,
    qh.TenQuyenHan
FROM VAITRO vt
JOIN VAITRO_QUYENHAN vtqh
    ON vt.MaVaiTro = vtqh.MaVaiTro
JOIN QUYENHAN qh
    ON vtqh.MaQuyenHan = qh.MaQuyenHan
ORDER BY vt.TenVaiTro, qh.TenQuyenHan;
GO