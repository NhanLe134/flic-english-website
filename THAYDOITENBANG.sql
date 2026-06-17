-- 1. Đổi tên bảng LESSON thành BUOIHOC
EXEC sp_rename 'dbo.LESSON', 'BUOIHOC';

-- 2. Đổi tên cột MaLesson thành MaBuoiHoc
EXEC sp_rename 'dbo.BUOIHOC.MaLesson', 'MaBuoiHoc', 'COLUMN';

-- 3. Đổi tên cột TenLesson thành TenBuoiHoc
EXEC sp_rename 'dbo.BUOIHOC.TenLesson', 'TenBuoiHoc', 'COLUMN';

-- 1. Đổi cột MaLesson thành MaBuoiHoc trong bảng BAIHOCKHOAHOC
EXEC sp_rename 'dbo.BAIHOCKHOAHOC.MaLesson', 'MaBuoiHoc', 'COLUMN';

-- 2. Đổi cột MaLesson thành MaBuoiHoc trong bảng EXERCISE
EXEC sp_rename 'dbo.EXERCISE.MaLesson', 'MaBuoiHoc', 'COLUMN';

-- 3. Đổi cột MaLesson thành MaBuoiHoc trong bảng TAILIEU
EXEC sp_rename 'dbo.TAILIEU.MaLesson', 'MaBuoiHoc', 'COLUMN';

-- 4. Đổi cột ActiveLessonId thành ActiveBuoiHocId trong bảng LOPHOC
EXEC sp_rename 'dbo.LOPHOC.ActiveLessonId', 'ActiveBuoiHocId', 'COLUMN';


-- 1. Đổi tên bảng EXERCISE thành BAITAP
EXEC sp_rename 'dbo.EXERCISE', 'BAITAP';

-- 2. Đổi tên cột MaExercise thành MaBaiTap trong bảng BAITAP vừa đổi tên
EXEC sp_rename 'dbo.BAITAP.MaExercise', 'MaBaiTap', 'COLUMN';

-- 3. Đổi tên cột khóa ngoại MaExercise thành MaBaiTap trong bảng BAINOP
EXEC sp_rename 'dbo.BAINOP.MaExercise', 'MaBaiTap', 'COLUMN';