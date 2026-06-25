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

    // 1. Kiểm tra xem bảng DETHI đã tồn tại chưa
    const checkTable = await pool.request().query(`
      SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'DETHI'
    `);

    if (checkTable.recordset.length > 0) {
      console.log("Bảng DETHI đã tồn tại sẵn trên database.");
    } else {
      console.log("Bảng DETHI chưa tồn tại. Đang tiến hành tạo bảng...");

      // 2. Tạo bảng DETHI và các khóa ngoại
      await pool.request().query(`
        CREATE TABLE [dbo].[DETHI](
            [MaDeThi] [int] IDENTITY(1,1) NOT NULL,
            [TieuDe] [nvarchar](255) NOT NULL,
            [MoTa] [nvarchar](max) NULL,
            [ThoiGian] [int] NOT NULL,
            [CapDo] [nvarchar](50) NULL,
            [LoaiBai] [nvarchar](50) NULL,
            [NoiDungDeThi] [nvarchar](max) NOT NULL,
            [TrangThai] [nvarchar](50) NOT NULL CONSTRAINT [DF_DETHI_TrangThai] DEFAULT ('draft'),
            [TrangThaiDuyet] [nvarchar](50) NOT NULL CONSTRAINT [DF_DETHI_TrangThaiDuyet] DEFAULT (N'Chờ duyệt'),
            [MaNguoiDung] [int] NOT NULL,
            [NgayTao] [datetime] NOT NULL CONSTRAINT [DF_DETHI_NgayTao] DEFAULT (GETDATE()),
            [NgayDuyet] [datetime] NULL,
            [MaNguoiDuyet] [int] NULL,
        PRIMARY KEY CLUSTERED 
        (
            [MaDeThi] ASC
        )
        ) ON [PRIMARY];
      `);
      console.log("Tạo bảng DETHI thành công.");

      // 3. Thêm khóa ngoại
      await pool.request().query(`
        ALTER TABLE [dbo].[DETHI] WITH CHECK ADD CONSTRAINT [FK_DETHI_NGUOIDUNG] FOREIGN KEY([MaNguoiDung])
        REFERENCES [dbo].[NGUOIDUNG] ([MaNguoiDung]);
        
        ALTER TABLE [dbo].[DETHI] WITH CHECK ADD CONSTRAINT [FK_DETHI_NGUOIDUNG_DUYET] FOREIGN KEY([MaNguoiDuyet])
        REFERENCES [dbo].[NGUOIDUNG] ([MaNguoiDung]);
      `);
      console.log("Tạo khóa ngoại cho DETHI thành công.");

      // 4. Chèn dữ liệu hạt giống (seed data)
      console.log("Đang chèn dữ liệu mẫu...");
      await pool.request().query(`
        SET IDENTITY_INSERT [dbo].[DETHI] ON;
        
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
            4, 
            GETDATE()
        );

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
            4, 
            GETDATE()
        );

        SET IDENTITY_INSERT [dbo].[DETHI] OFF;
      `);
      console.log("Chèn dữ liệu mẫu thành công.");
    }

    await sql.close();
  } catch (err) {
    console.error("Lỗi:", err.message);
  }
}

run();
