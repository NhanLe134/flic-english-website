// Mock API Interceptor for FLIC English Website Frontend
// Overrides window.fetch to support standalone frontend development

const originalFetch = window.fetch;

// Helper to simulate network latency
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock database that gets reset on full page load, but supports basic in-memory mutations
const db = {
  submissions: [
    {
      MaBaiNop: 1001,
      MaBaiTap: 1,
      HoTen: "Nguyễn Văn An",
      MaSinhVien: "SV01",
      FileUrl: "",
      LinkUrl: "",
      NoiDungBaiNop: "Dear Sir,\n\nI am writing to inquire about the schedule of the upcoming TOEIC intensive course. Please let me know the starting date and fee structure.\n\nBest regards,\nAn",
      Diem: 8.5,
      NhanXet: "Bài viết tốt, sử dụng đúng ngữ pháp và từ vựng phong phú.",
      NgayNop: "2026-03-05T08:00:00.000Z",
      TenLop: "TOEIC-01"
    },
    {
      MaBaiNop: 1002,
      MaBaiTap: 1,
      HoTen: "Trần Thị Bích",
      MaSinhVien: "SV02",
      FileUrl: "",
      LinkUrl: "",
      NoiDungBaiNop: "The charts show the average daily water consumption in three different households over a six-month period. In general, household A consumed the most water...",
      Diem: null,
      NhanXet: "",
      NgayNop: "2026-03-06T09:00:00.000Z",
      TenLop: "TOEIC-01"
    },
    {
      MaBaiNop: 1003,
      MaBaiTap: 1,
      HoTen: "Lê Hoàng Nam",
      MaSinhVien: "SV03",
      FileUrl: "",
      LinkUrl: "",
      NoiDungBaiNop: "Here is my response to the essay writing prompt. I have discussed both views and given my opinion...",
      Diem: null,
      NhanXet: "",
      NgayNop: "2026-03-07T10:15:00.000Z",
      TenLop: "TOEIC-02"
    },
    {
      MaBaiNop: 1004,
      MaBaiTap: 2,
      HoTen: "Phạm Minh Tuấn",
      MaSinhVien: "SV04",
      FileUrl: "",
      LinkUrl: "",
      NoiDungBaiNop: "Describe a book you have recently read. My favorite book is 'To Kill a Mockingbird' by Harper Lee...",
      Diem: null,
      NhanXet: "",
      NgayNop: "2026-03-08T14:20:00.000Z",
      TenLop: "IELTS-SP-01"
    },
    {
      MaBaiNop: 9999,
      MaBaiTap: 1,
      HoTen: "Học Viên Giả Định",
      MaSinhVien: "SV_MOCK_TEST",
      FileUrl: "",
      LinkUrl: "",
      NoiDungBaiNop: "This is a mock homework submission.",
      Diem: 8.5,
      NhanXet: "Bài làm tốt",
      NgayNop: "2026-03-09T08:00:00.000Z",
      TenLop: "TOEIC-01"
    }
  ],
  documents: [
    {
      MaTaiLieu: 1,
      TieuDe: "TOEIC Vocab Booster Part 5 & 6",
      NoiDung: "File: /documents/toeic_part5_vocab.pdf\n\nTổng hợp 200 từ vựng cốt lõi thường xuất hiện trong đề thi TOEIC Part 5 & 6.",
      CreatedDate: "2026-03-02T10:00:00.000Z",
      FileUrl: "/job-interview.mp3" // Dùng file âm thanh có sẵn làm mock URL
    },
    {
      MaTaiLieu: 2,
      TieuDe: "Academic Essay Writing Structures",
      NoiDung: "Dàn bài viết luận học thuật chuẩn IELTS Band 7+.",
      CreatedDate: "2026-03-04T14:30:00.000Z",
      FileUrl: ""
    }
  ],
  lectures: [
    {
      MaBaiGiang: 1,
      TieuDe: "Bài giảng buổi 1: Ngữ pháp cơ bản - Thì hiện tại",
      NoiDung: "Video hướng dẫn chi tiết cách sử dụng các thì hiện tại đơn, tiếp diễn, hoàn thành.",
      FileUrl: "/coffee-shop.mp3",
      TrangThai: "published"
    }
  ],
  approvals: {
    baigiang: [
      {
        id: 1,
        MaBaiHoc: 1,
        TieuDe: "Ngữ pháp IELTS Writing Task 2 - Coherence & Cohesion",
        LoaiBaiHoc: "Lý thuyết",
        ThoiLuong: "45 phút",
        TrangThai: "Chờ duyệt",
        NoiDung: "Bài giảng hướng dẫn cách liên kết ý tưởng và đoạn văn mạch lạc trong bài viết luận.",
        FileUrl: "",
        MaKhoaHoc: 2,
        MaGiangVien: 1,
        MaBuoiHoc: 1,
        TenGiangVien: "Nguyễn Văn A",
        TenKhoaHoc: "IELTS Speaking Band 7",
        CapDo: "IELTS 6.5+",
        NgayGui: "2026-03-04T12:00:00.000Z"
      }
    ],
    baihocmo: [
      {
        id: 1,
        MaBaiHocMo: 101,
        TieuDe: "Kỹ năng Giao tiếp Công sở (Business Meeting)",
        MoTa: "Luyện hội thoại đàm phán trong các cuộc họp thương mại.",
        KyNang: "Speaking",
        CapDo: "Intermediate",
        LoaiBaiHoc: "Thực hành",
        NoiDung: "Các mẫu đàm phán, đóng vai đối thoại và từ vựng chủ đề Meeting.",
        FileUrl: "",
        LinkUrl: "",
        TrangThai: "Chờ duyệt",
        TenNguoiTao: "Trần Thị B",
        NgayTao: "2026-03-05T09:15:00.000Z"
      }
    ],
    exercises: [
      {
        id: 1,
        MaBaiTap: 10,
        TieuDe: "Bài tập tự luận: Trình bày quan điểm cá nhân về Fast Food",
        Title: "Bài tập tự luận: Trình bày quan điểm cá nhân về Fast Food",
        Type: "Writing",
        KyNang: "Writing",
        DangBai: "Essay",
        TrangThai: "Chờ duyệt",
        TenGiangVien: "Lê Văn C",
        TenKhoaHoc: "Everyday Conversation Skills",
        CapDo: "Intermediate",
        NgayGui: "2026-03-05T10:30:00.000Z",
        Content: "Some people think that fast food is convenient but harmful. Write an essay expressing your opinion.",
        Questions: "Write 150-200 words."
      }
    ],
    tailieu: [
      {
        id: 1,
        MaTaiLieu: 201,
        TieuDe: "Bộ đề dự đoán Speaking Quý 2 năm 2026",
        Title: "Bộ đề dự đoán Speaking Quý 2 năm 2026",
        TrangThai: "Chờ duyệt",
        TenGiangVien: "Nguyễn Văn A",
        TenKhoaHoc: "IELTS Speaking Band 7",
        CapDo: "IELTS 7.0",
        NgayGui: "2026-03-05T11:00:00.000Z",
        MoTa: "Tổng hợp các chủ đề nói IELTS Speaking Part 1, 2, 3 dự kiến ra mắt trong quý này."
      }
    ]
  },
  exercisesList: [
    {
      MaBaiTap: 1,
      Title: "Bài tập 1: Ngữ pháp cơ bản",
      Type: "Writing",
      TrangThai: "published",
      CreatedDate: "2026-03-02T10:00:00.000Z",
      MaBuoiHoc: 1
    },
    {
      MaBaiTap: 2,
      Title: "Bài tập 2: Luyện kỹ năng đọc TOEIC Part 5",
      Type: "Reading",
      TrangThai: "published",
      CreatedDate: "2026-03-04T12:00:00.000Z",
      MaBuoiHoc: 1
    },
    {
      MaBaiTap: 10,
      Title: "Bài tập 1: Nghe trắc nghiệm (Multiple Choice - MCQ)",
      Type: "listening-mcq",
      TrangThai: "published",
      CreatedDate: "2026-03-05T08:00:00.000Z",
      MaBuoiHoc: 1
    },
    {
      MaBaiTap: 11,
      Title: "Bài tập 2: Trắc nghiệm chia thì (writing-tense-mcq)",
      Type: "writing-tense-mcq",
      TrangThai: "published",
      CreatedDate: "2026-03-05T09:00:00.000Z",
      MaBuoiHoc: 1
    },
    {
      MaBaiTap: 12,
      Title: "Bài tập 3: Trắc nghiệm từ vựng đọc hiểu (reading-vocab-mcq)",
      Type: "reading-vocab-mcq",
      TrangThai: "published",
      CreatedDate: "2026-03-05T10:00:00.000Z",
      MaBuoiHoc: 1
    },
    {
      MaBaiTap: 13,
      Title: "Bài tập 4: Trắc nghiệm Tổng hợp (multiple)",
      Type: "multiple",
      TrangThai: "published",
      CreatedDate: "2026-03-05T11:00:00.000Z",
      MaBuoiHoc: 1
    },
    {
      MaBaiTap: 14,
      Title: "Bài tập 5: Nghe và chọn theo ảnh (Listening & Image Choice)",
      Type: "listening-image",
      TrangThai: "published",
      CreatedDate: "2026-03-05T12:00:00.000Z",
      MaBuoiHoc: 1
    },
    {
      MaBaiTap: 15,
      Title: "Bài tập 6: Nghe chép chính tả (Dictation)",
      Type: "listening-dictation",
      TrangThai: "published",
      CreatedDate: "2026-03-05T13:00:00.000Z",
      MaBuoiHoc: 1
    },
    {
      MaBaiTap: 16,
      Title: "Bài tập 7: Nghe điền từ vào đoạn văn (Cloze Test)",
      Type: "listening-fill-in",
      TrangThai: "published",
      CreatedDate: "2026-03-05T14:00:00.000Z",
      MaBuoiHoc: 1
    }
  ]
};

window.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const urlStr = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

  // Check if target is backend API
  if (urlStr.includes("http://localhost:5000") || urlStr.startsWith("/flic-english-website/api")) {
    await sleep(200); // Add a small delay to simulate server response time

    const method = init?.method?.toUpperCase() || "GET";
    const bodyObj = init?.body ? JSON.parse(init.body as string) : null;

    // 1. LOGIN
    if (urlStr.endsWith("/login") && method === "POST") {
      const { username, password } = bodyObj || {};
      if (username === "teacher" && password === "123456") {
        return new Response(
          JSON.stringify({
            MaNguoiDung: 1,
            HoTen: "Nguyễn Văn A",
            TenDangNhap: "teacher",
            Email: "teacher@flic.edu.vn"
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      } else if (username === "quantri" && password === "123456") {
        return new Response(
          JSON.stringify({
            MaNguoiDung: 99,
            HoTen: "Quản trị nội dung B",
            TenDangNhap: "quantri",
            Email: "quantri@flic.edu.vn"
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      } else if (username === "admin" && password === "123456") {
        return new Response(
          JSON.stringify({
            MaNguoiDung: 999,
            HoTen: "Quản trị viên Admin",
            TenDangNhap: "admin",
            Email: "admin@flic.edu.vn"
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      } else if (username === "student" && password === "123456") {
        return new Response(
          JSON.stringify({
            MaNguoiDung: 100,
            HoTen: "Lê Nhàn",
            TenDangNhap: "student",
            Email: "student@flic.edu.vn"
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      } else {
        return new Response(
          JSON.stringify({ message: "Sai tên đăng nhập hoặc mật khẩu!" }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // 1.1 GET STUDENT PROFILE BY USER ID
    if (urlStr.includes("/students/by-user/") && method === "GET") {
      return new Response(
        JSON.stringify({
          MaSinhVien: "SV_MOCK_TEST",
          HoTen: "Lê Nhàn",
          Email: "student@flic.edu.vn",
          MaNguoiDung: 100
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 1.2 GET STUDENT DETAIL BY MA SV
    if (urlStr.includes("/students/") && (urlStr.endsWith("/SV_MOCK_TEST") || urlStr.includes("/SV_MOCK_TEST/")) && method === "GET") {
      return new Response(
        JSON.stringify({
          MaSinhVien: "SV_MOCK_TEST",
          HoTen: "Lê Nhàn",
          Email: "student@flic.edu.vn",
          GioiTinh: "Nữ",
          NgaySinh: "2002-12-12T00:00:00.000Z",
          SDT: "0912345678"
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 1.3 GET STUDENT CLASSES
    if (urlStr.includes("/student/my-classes/") && method === "GET") {
      return new Response(
        JSON.stringify([
          {
            MaLopHoc: 101,
            TenLop: "TOEIC-01",
            TenKhoaHoc: "TOEIC 650+ Intensive",
            LichHoc: "Thứ 2 & 4, 18:00-20:00",
            TienDo: 68
          }
        ]),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 1.4 GET LESSONS FOR CLASS
    if (urlStr.includes("/classes/") && urlStr.endsWith("/lessons") && method === "GET") {
      return new Response(
        JSON.stringify([
          {
            MaLesson: 1,
            TenLesson: "Buổi 1: Ngữ pháp cơ bản - Thì hiện tại",
            MoTa: "Ôn tập các thì hiện tại đơn, hiện tại tiếp diễn và hoàn thành.",
            ThuTu: 1
          }
        ]),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 1.5 GET EXERCISES FOR CLASS
    if (urlStr.includes("/classes/") && urlStr.endsWith("/baitap") && method === "GET") {
      const list = db.exercisesList.filter(ex => ex.MaBuoiHoc === 1);
      return new Response(
        JSON.stringify(list),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 1.6 GET DOCUMENTS FOR CLASS
    if (urlStr.includes("/classes/") && urlStr.endsWith("/tailieu") && method === "GET") {
      return new Response(
        JSON.stringify([
          {
            MaTaiLieu: 201,
            TieuDe: "Tài liệu học tập Buổi 1",
            MoTa: "Tài liệu ngữ pháp các thì hiện tại",
            FileUrl: "/job-interview.mp3",
            MaLesson: 1
          }
        ]),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 2. GET USER ROLE
    if (urlStr.includes("/users/role/")) {
      const parts = urlStr.split("/");
      const id = parts[parts.length - 1];
      let vaiTro = "Học Viên";
      if (id === "1") vaiTro = "Giảng Viên";
      if (id === "99") vaiTro = "Quản Trị Nội Dung";
      if (id === "999") vaiTro = "Quản Trị Viên";
      if (id === "100") vaiTro = "Học Viên";

      return new Response(
        JSON.stringify({ VaiTro: vaiTro }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 3. GET TEACHER PROFILE
    if (urlStr.includes("/giangvien/") && method === "GET") {
      const parts = urlStr.split("/");
      const id = parseInt(parts[parts.length - 1]);
      return new Response(
        JSON.stringify({
          MaGiangVien: 1,
          HoTen: "Nguyễn Văn A",
          Email: "teacher@flic.edu.vn",
          SoDienThoai: "0912345678",
          BoMon: "Tiếng Anh TOEIC & IELTS",
          HocVi: "Thạc sĩ ngôn ngữ Anh",
          MaNguoiDung: id
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // UPDATE TEACHER PROFILE
    if (urlStr.includes("/giangvien/") && method === "PUT") {
      return new Response(
        JSON.stringify({ message: "Cập nhật thông tin giảng viên thành công!" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // CHANGE PASSWORD
    if (urlStr.endsWith("/doi-mat-khau") && method === "POST") {
      return new Response(
        JSON.stringify({ message: "Đổi mật khẩu thành công!" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // GET PENDING SUBMISSIONS COUNT
    if (urlStr.includes("/teacher/submissions/pending-count")) {
      const count = db.submissions.filter(s => s.Diem === null).length;
      return new Response(
        JSON.stringify({ count }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 4. GET COURSES FOR TEACHER
    if (urlStr.includes("/teacher/courses/")) {
      return new Response(
        JSON.stringify([
          { MaKhoaHoc: 1, TenKhoaHoc: "TOEIC 650+ Intensive", SoHocVien: 45 },
          { MaKhoaHoc: 2, TenKhoaHoc: "IELTS Speaking Band 7", SoHocVien: 32 }
        ]),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 5. GET CLASSES FOR COURSE
    if (urlStr.includes("/course-detail/") && urlStr.includes("/classes/")) {
      const parts = urlStr.split("/");
      const courseId = parts[parts.indexOf("course-detail") + 1];
      if (courseId === "1") {
        return new Response(
          JSON.stringify([
            { MaLopHoc: 101, TenLop: "TOEIC-01", LichHoc: "Thứ 2 & 4, 18:00-20:00", TienDo: 68 },
            { MaLopHoc: 102, TenLop: "TOEIC-02", LichHoc: "Thứ 3 & 5, 18:00-20:00", TienDo: 45 }
          ]),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      } else {
        return new Response(
          JSON.stringify([
            { MaLopHoc: 201, TenLop: "IELTS-SP-01", LichHoc: "Thứ 7, 08:00-11:00", TienDo: 88 }
          ]),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // 6. GET STUDENT COUNT
    if (urlStr.includes("/students/count") || urlStr.endsWith("/students/count")) {
      return new Response(
        JSON.stringify({ SoLuongHocVien: 12 }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 7. GET LESSONS FOR CLASS
    if (urlStr.includes("/classes/") && urlStr.endsWith("/buoihoc")) {
      return new Response(
        JSON.stringify([
          {
            MaBuoiHoc: 1,
            TenBuoiHoc: "Buổi 1: Ngữ pháp cơ bản - Thì hiện tại",
            MoTa: "Ôn tập các thì hiện tại đơn, hiện tại tiếp diễn và hoàn thành.",
            NgayBatDau: "2026-03-01T00:00:00.000Z",
            NgayKetThuc: "2026-03-07T00:00:00.000Z",
            ThuTu: 1
          },
          {
            MaBuoiHoc: 2,
            TenBuoiHoc: "Buổi 2: Từ vựng TOEIC Part 5 & 6",
            MoTa: "Cung cấp hơn 50 từ vựng cốt lõi về chủ đề kinh doanh và công sở.",
            NgayBatDau: "2026-03-08T00:00:00.000Z",
            NgayKetThuc: "2026-03-14T00:00:00.000Z",
            ThuTu: 2
          },
          {
            MaBuoiHoc: 3,
            TenBuoiHoc: "Buổi 3: Luyện nghe Part 1 & 2",
            MoTa: "Kỹ năng làm bài trắc nghiệm nghe hình ảnh và hội thoại ngắn.",
            NgayBatDau: "2026-03-15T00:00:00.000Z",
            NgayKetThuc: "2026-03-21T00:00:00.000Z",
            ThuTu: 3
          }
        ]),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 8. GET LESSON DETAIL
    if ((urlStr.includes("/lesson/") || urlStr.includes("/buoihoc/")) && method === "GET") {
      const parts = urlStr.split("/");
      const id = parseInt(parts[parts.length - 1]);
      return new Response(
        JSON.stringify({
          MaBuoiHoc: id,
          TenBuoiHoc: `Buổi ${id}: Chuyên đề ngữ pháp & luyện đề`,
          TenLop: "Lớp 2 - TOEIC Foundation",
          MoTa: `Mô tả nội dung học chi tiết cho buổi học số ${id}`,
          ActiveBuoiHocId: 1,
          ThuTu: id,
          MaLopHoc: 101,
          NgayBatDau: "2026-03-01T00:00:00.000Z",
          NgayKetThuc: "2026-03-07T00:00:00.000Z",
          LichHoc: "Thứ 2 & 4, 18:00-20:00"
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 8.1 GET BAITAPS BY LESSON ID
    if (urlStr.includes("/baitap/buoihoc/") && method === "GET") {
      const match = urlStr.match(/\/baitap\/buoihoc\/(\d+)/);
      const buoiHocId = match ? Number(match[1]) : 1;
      const list = db.exercisesList.filter(ex => ex.MaBuoiHoc === buoiHocId);
      return new Response(
        JSON.stringify(list),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 8.1b CREATE BAITAP
    if (urlStr.includes("/baitap/create") && method === "POST") {
      const newEx = {
        MaBaiTap: db.exercisesList.length + 100,
        Title: bodyObj?.Title || "Không có tiêu đề",
        Type: bodyObj?.Type || "Writing",
        TrangThai: bodyObj?.TrangThai || "published",
        CreatedDate: bodyObj?.CreatedDate || new Date().toISOString(),
        MaBuoiHoc: Number(bodyObj?.MaBuoiHoc) || 1
      };
      db.exercisesList.push(newEx);

      // If status is pending, also add it to approvals for QTV
      if (newEx.TrangThai === "pending") {
        db.approvals.exercises.push({
          id: db.approvals.exercises.length + 1,
          MaBaiTap: newEx.MaBaiTap,
          TieuDe: newEx.Title,
          Title: newEx.Title,
          Type: newEx.Type,
          KyNang: bodyObj?.KyNang || "Writing",
          DangBai: bodyObj?.DangBai || "Essay",
          TrangThai: "Chờ duyệt",
          TenGiangVien: "Nguyễn Văn A",
          TenKhoaHoc: "Everyday Conversation Skills",
          CapDo: "Intermediate",
          NgayGui: newEx.CreatedDate,
          Content: bodyObj?.Content || "",
          Questions: bodyObj?.Questions || ""
        });
      }

      return new Response(
        JSON.stringify({ success: true, message: "Tạo bài tập thành công" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 8.2 GET LECTURES BY LESSON ID
    if (urlStr.includes("/baigiang/") && !urlStr.includes("/detail") && !urlStr.includes("/status") && !urlStr.includes("/lesson/") && method === "GET") {
      return new Response(
        JSON.stringify([
          {
            MaBaiHoc: 1,
            TieuDe: "Bài giảng lý thuyết thì hiện tại đơn",
            LoaiBaiHoc: "Video",
            ThoiLuong: "15 phút",
            TrangThai: "published"
          },
          {
            MaBaiHoc: 2,
            TieuDe: "Giáo trình ngữ pháp nâng cao",
            LoaiBaiHoc: "PDF",
            ThoiLuong: "30 phút",
            TrangThai: "published"
          }
        ]),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 8.3 GET LECTURE DETAIL
    if (urlStr.includes("/baigiang/detail/") && method === "GET") {
      const parts = urlStr.split("/");
      const id = parseInt(parts[parts.length - 1]);
      return new Response(
        JSON.stringify({
          MaBaiHoc: id,
          TieuDe: id === 2 ? "Giáo trình ngữ pháp nâng cao" : "Bài giảng lý thuyết thì hiện tại đơn",
          LoaiBaiHoc: id === 2 ? "PDF" : "Video",
          ThoiLuong: id === 2 ? "30 phút" : "15 phút",
          TrangThai: "published",
          NoiDung: id === 2
            ? "### Tài liệu đọc hiểu Ngữ pháp nâng cao\n\nHọc viên tải tệp đính kèm bên dưới để đọc tài liệu chi tiết.\n\n* Nội dung ôn tập:\n  - Các dạng câu điều kiện (Conditional Sentences)\n  - Mệnh đề quan hệ (Relative Clauses)\n  - Câu bị động (Passive Voice)\n\nChúc các em ôn tập đạt kết quả tốt!"
            : "### Video Bài giảng lý thuyết về các thì hiện tại\n\nHọc viên chú ý theo dõi video bài học dưới đây và chép bài đầy đủ vào vở bài tập.\n\n* Nội dung gồm:\n  - Công thức & Cách dùng thì Hiện tại đơn (Present Simple)\n  - Hiện tại tiếp diễn (Present Continuous)\n  - Hiện tại hoàn thành (Present Perfect)\n\n* Tệp đính kèm bên dưới là audio tóm tắt bài giảng.",
          FileUrl: id === 2 ? "/job-interview.mp3" : "/coffee-shop.mp3"
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 9. GET STUDENTS FOR TEACHER OR CLASS
    if (urlStr.includes("/teacher/students/") || (urlStr.includes("/lophoc/") && (urlStr.endsWith("/students") || urlStr.endsWith("/sinhvien")))) {
      return new Response(
        JSON.stringify([
          { MaSinhVien: "SV01", HoTen: "Nguyễn Văn An", GioiTinh: "Nam", TenKhoaHoc: "TOEIC 650+ Intensive", Lop: "TOEIC-01", NgayGhiDanh: "2026-03-01", TrangThai: "Đang học" },
          { MaSinhVien: "SV02", HoTen: "Trần Thị Bích", GioiTinh: "Nữ", TenKhoaHoc: "TOEIC 650+ Intensive", Lop: "TOEIC-01", NgayGhiDanh: "2026-03-01", TrangThai: "Đang học" },
          { MaSinhVien: "SV03", HoTen: "Lê Minh Cường", GioiTinh: "Nam", TenKhoaHoc: "IELTS Speaking Band 7", Lop: "IELTS-SP-01", NgayGhiDanh: "2026-03-01", TrangThai: "Đang học" },
          { MaSinhVien: "SV_MOCK_TEST", HoTen: "Học Viên Giả Định", GioiTinh: "Nam", TenKhoaHoc: "TOEIC 650+ Intensive", Lop: "TOEIC-01", NgayGhiDanh: "2026-03-01", TrangThai: "Đang học" }
        ]),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 10. GET SINGLE STUDENT DATA
    if (urlStr.includes("/students/") && method === "GET" && !urlStr.includes("/tiendo/")) {
      const parts = urlStr.split("/");
      const id = parts[parts.length - 1];
      return new Response(
        JSON.stringify({
          MaSinhVien: id,
          HoTen: id === "SV01" ? "Nguyễn Văn An" : id === "SV02" ? "Trần Thị Bích" : "Lê Minh Cường",
          MaNguoiDung: id === "SV01" ? 101 : id === "SV02" ? 102 : 103,
          Lop: "TOEIC-01",
          GioiTinh: id === "SV02" ? "Nữ" : "Nam"
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 11. GET STUDENT PROGRESS FOR LESSON
    if (urlStr.includes("/students/") && urlStr.includes("/tiendo/")) {
      return new Response(
        JSON.stringify({ TienDo: 78 }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 12. GET STUDENT SUBMISSIONS BY USER ID
    if (urlStr.includes("/student/bainop/")) {
      const parts = urlStr.split("/");
      const userId = parts[parts.length - 1]; // e.g. "100"
      
      const list = db.submissions.filter(s => 
        s.MaSinhVien === "SV_MOCK_TEST" || 
        s.MaSinhVien === "SV01" || 
        String(s.MaSinhVien) === String(userId)
      ).map(s => ({
        MaBaiTap: s.MaBaiTap,
        TenBaiTap: (s as any).TenBaiTap || `Bài tập #${s.MaBaiTap}`,
        NgayNop: s.NgayNop,
        Diem: s.Diem
      }));

      // Fallback/Ensure mock values exist for testing if list is empty
      if (list.length === 0) {
        list.push(
          { MaBaiTap: 1, TenBaiTap: "Bài tập 1: Ngữ pháp", NgayNop: "2026-03-05T08:00:00Z", Diem: 8.5 },
          { MaBaiTap: 2, TenBaiTap: "Bài tập 2: Reading", NgayNop: "2026-03-06T09:00:00Z", Diem: null }
        );
      }

      return new Response(
        JSON.stringify(list),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 12.1 POST STUDENT SUBMISSION
    if (urlStr.includes("/bainop") && method === "POST" && !urlStr.endsWith("/cham")) {
      const newSub = {
        MaBaiNop: db.submissions.length + 1001,
        MaBaiTap: bodyObj?.MaExercise || bodyObj?.MaBaiTap || 1,
        HoTen: "Lê Nhàn",
        MaSinhVien: String(bodyObj?.MaSinhVien || "100"),
        FileUrl: bodyObj?.FileUrl || "",
        LinkUrl: bodyObj?.LinkUrl || "",
        NoiDungBaiNop: bodyObj?.NoiDung || "",
        Diem: bodyObj?.Diem !== undefined ? bodyObj.Diem : null,
        NhanXet: "",
        NgayNop: new Date().toISOString(),
        TenLop: "TOEIC-01",
        TenBaiTap: db.exercisesList.find(ex => ex.MaBaiTap === (bodyObj?.MaExercise || bodyObj?.MaBaiTap))?.Title || "Bài tập mới nộp"
      };
      db.submissions.push(newSub);
      return new Response(
        JSON.stringify({ success: true, message: "Nộp bài thành công!" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 12.5 GET FREE CONTENT FOR STUDENT TRIAL
    if (urlStr.includes("/student/free-content")) {
      return new Response(
        JSON.stringify({
          lectures: [
            {
              MaBaiHoc: 1,
              TieuDe: "Học thử: Tiếng Anh giao tiếp cơ bản",
              LoaiBaiHoc: "Video",
              ThoiLuong: "20 phút",
              NoiDung: "Chào mừng bạn đến với bài học thử giao tiếp cơ bản. Trong bài học này, bạn sẽ học cách chào hỏi và giới thiệu bản thân bằng tiếng Anh.",
              FileUrl: "/coffee-shop.mp3"
            },
            {
              MaBaiHoc: 2,
              TieuDe: "Học thử: Từ vựng TOEIC thông dụng",
              LoaiBaiHoc: "PDF",
              ThoiLuong: "15 phút",
              NoiDung: "### Tài liệu đọc hiểu Ngữ pháp nâng cao\n\nHọc viên tải tệp đính kèm bên dưới để đọc tài liệu chi tiết.\n\n* Nội dung ôn tập:\n  - Các dạng câu điều kiện (Conditional Sentences)\n  - Mệnh đề quan hệ (Relative Clauses)\n  - Câu bị động (Passive Voice)\n\nChúc các em ôn tập đạt kết quả tốt!",
              FileUrl: "/job-interview.mp3"
            }
          ],
          exercises: [
            {
              MaBaiTap: 1,
              Title: "Bài tập thử: Trắc nghiệm ngữ pháp",
              Type: "Reading",
              KyNang: "Reading",
              Content: "Chọn đáp án đúng nhất để hoàn thành câu.",
              Questions: "### She ___ to school everyday.||A. go|B. goes|C. going|D. gone|Đáp án đúng: B"
            },
            {
              MaBaiTap: 2,
              Title: "Bài tập thử: Viết câu giao tiếp",
              Type: "Writing",
              KyNang: "Writing",
              Content: "Dịch câu sau sang tiếng Anh: 'Tôi rất vui được gặp bạn ngày hôm nay.'",
              Questions: ""
            }
          ]
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 13. GET BAITAP DETAILS
    if (urlStr.includes("/baitap/") && method === "GET") {
      const parts = urlStr.split("/");
      const id = parseInt(parts[parts.length - 1]) || 1;

      if (id === 10) {
        return new Response(
          JSON.stringify({
            MaBaiTap: 10,
            TenBai: "Bài tập 1: Nghe trắc nghiệm (Multiple Choice - MCQ)",
            Title: "Bài tập 1: Nghe trắc nghiệm (Multiple Choice - MCQ)",
            Type: "listening-mcq",
            LoaiBaiHoc: "Trắc nghiệm",
            Content: "Nghe đoạn hội thoại sau và chọn đáp án chính xác nhất cho các câu hỏi.",
            Questions: JSON.stringify([
              {
                question: "What is the main topic of the conversation?",
                answers: [
                  "Scheduling a meeting",
                  "Discussing a project budget",
                  "Hiring a new assistant",
                  "Planning an office party"
                ],
                correct: "A",
                explanation: "Người nói đề cập: 'Let's set up a time to meet next week to review the timeline.' -> Scheduling a meeting."
              },
              {
                question: "Where does the conversation most likely take place?",
                answers: [
                  "At a coffee shop",
                  "In an office",
                  "At a bank",
                  "At a train station"
                ],
                correct: "B",
                explanation: "Trong audio nhắc đến 'office', 'conference room', 'desk'."
              },
              {
                question: "What does the woman suggest doing?",
                answers: [
                  "Rescheduling the presentation",
                  "Inviting more colleagues",
                  "Ordering lunch for the group",
                  "Sending an email confirmation"
                ],
                correct: "D",
                explanation: "Người phụ nữ nói: 'I will send out an email to confirm the time with everyone.'"
              }
            ]),
            AudioUrl: "/uploads/toeic-office.mp3",
            FileUrl: "/uploads/toeic-office.mp3",
            Vocabulary: "schedule, budget, presentation, confirmation",
            TenBuoiHoc: "Buổi 1: Ngữ pháp cơ bản - Thì hiện tại",
            ThuTu: 1
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      if (id === 11) {
        return new Response(
          JSON.stringify({
            MaBaiTap: 11,
            TenBai: "Bài tập 2: Trắc nghiệm chia thì",
            Title: "Bài tập 2: Trắc nghiệm chia thì",
            Type: "writing-tense-mcq",
            LoaiBaiHoc: "Trắc nghiệm",
            Content: "Chọn đáp án đúng nhất để hoàn thành các câu sau.",
            Questions: JSON.stringify([
              {
                question: "She ___ to the library every Wednesday afternoon.",
                answers: ["go", "goes", "going", "gone"],
                correct: "B",
                explanation: "Thì hiện tại đơn với chủ ngữ số ít 'She'."
              },
              {
                question: "They ___ English since they were in primary school.",
                answers: ["have studied", "studied", "are studying", "will study"],
                correct: "A",
                explanation: "Dấu hiệu 'since' chỉ thì hiện tại hoàn thành."
              }
            ]),
            AudioUrl: "",
            Vocabulary: "tense, library, primary school",
            TenBuoiHoc: "Buổi 1: Ngữ pháp cơ bản - Thì hiện tại",
            ThuTu: 2
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      if (id === 12) {
        return new Response(
          JSON.stringify({
            MaBaiTap: 12,
            TenBai: "Bài tập 3: Trắc nghiệm từ vựng đọc hiểu",
            Title: "Bài tập 3: Trắc nghiệm từ vựng đọc hiểu",
            Type: "reading-vocab-mcq",
            LoaiBaiHoc: "Trắc nghiệm",
            Content: "Đọc kỹ câu và chọn từ vựng thích hợp nhất.",
            Questions: JSON.stringify([
              {
                question: "The company decided to ___ the product launch due to technical issues.",
                answers: ["postpone", "accelerate", "promote", "celebrate"],
                correct: "A",
                explanation: "postpone (hoãn lại) phù hợp nghĩa ngữ cảnh 'due to technical issues' (do sự cố kỹ thuật)."
              },
              {
                question: "He has a very ___ attitude towards his colleagues, always helping them.",
                answers: ["supportive", "aggressive", "passive", "negligent"],
                correct: "A",
                explanation: "supportive (hỗ trợ/giúp đỡ) phù hợp nghĩa 'always helping them' (luôn giúp đỡ họ)."
              }
            ]),
            AudioUrl: "",
            Vocabulary: "postpone, attitude, supportive, colleague",
            TenBuoiHoc: "Buổi 1: Ngữ pháp cơ bản - Thì hiện tại",
            ThuTu: 3
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      if (id === 13) {
        return new Response(
          JSON.stringify({
            MaBaiTap: 13,
            TenBai: "Bài tập 4: Trắc nghiệm Tổng hợp",
            Title: "Bài tập 4: Trắc nghiệm Tổng hợp",
            Type: "multiple",
            LoaiBaiHoc: "Trắc nghiệm",
            Content: "Bài tập trắc nghiệm tổng hợp kiến thức ngữ pháp và từ vựng.",
            Questions: JSON.stringify([
              {
                question: "If it ___ tomorrow, we will cancel the picnic.",
                answers: ["rain", "rains", "will rain", "rained"],
                correct: "B",
                explanation: "Câu điều kiện loại 1: Mệnh đề If chia ở hiện tại đơn."
              },
              {
                question: "She is the student ___ got the highest score in the final exam.",
                answers: ["who", "whom", "which", "whose"],
                correct: "A",
                explanation: "Mệnh đề quan hệ: 'who' làm chủ ngữ thay thế cho danh từ chỉ người 'the student'."
              }
            ]),
            AudioUrl: "",
            Vocabulary: "cancel, picnic, final exam",
            TenBuoiHoc: "Buổi 1: Ngữ pháp cơ bản - Thì hiện tại",
            ThuTu: 4
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }
      if (id === 14) {
        return new Response(
          JSON.stringify({
            MaBaiTap: 14,
            TenBai: "Bài tập 5: Nghe và chọn theo ảnh (Listening & Image Choice)",
            Title: "Bài tập 5: Nghe và chọn theo ảnh (Listening & Image Choice)",
            Type: "listening-image",
            LoaiBaiHoc: "Trắc nghiệm nghe",
            Content: "Nghe băng và quan sát hình ảnh để chọn phương án mô tả chính xác nhất.",
            Questions: JSON.stringify([
              {
                question: "Câu hỏi 1: Quan sát hình ảnh và chọn đáp án mô tả đúng nhất:",
                correct: "A",
                answers: ["A", "B", "C", "D"],
                imageUrl: "/uploads/image(5).png",
                audioUrl: "/uploads/toeic-office.mp3",
                explanation: "Phương án A là đáp án chính xác nhất mô tả hành động trong hình ảnh thứ nhất."
              },
              {
                question: "Câu hỏi 2: Quan sát hình ảnh và chọn đáp án mô tả đúng nhất:",
                correct: "C",
                answers: ["A", "B", "C", "D"],
                imageUrl: "/uploads/image(6).png",
                audioUrl: "/uploads/toeic-office.mp3",
                explanation: "Phương án C là đáp án chính xác nhất mô tả hành động trong hình ảnh thứ hai."
              }
            ]),
            AudioUrl: "/uploads/toeic-office.mp3",
            FileDinhKem: "/uploads/image(5).png",
            Vocabulary: "observe, visual, description",
            TenBuoiHoc: "Buổi 1: Ngữ pháp cơ bản - Thì hiện tại",
            ThuTu: 5
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      if (id === 15) {
        return new Response(
          JSON.stringify({
            MaBaiTap: 15,
            TenBai: "Bài tập 6: Nghe chép chính tả (Dictation)",
            Title: "Bài tập 6: Nghe chép chính tả (Dictation)",
            Type: "listening-dictation",
            LoaiBaiHoc: "Chép chính tả",
            Content: "The presentation will begin in the conference room in ten minutes.",
            Questions: "",
            AudioUrl: "/uploads/toeic-office.mp3",
            Vocabulary: "presentation, conference room",
            TenBuoiHoc: "Buổi 1: Ngữ pháp cơ bản - Thì hiện tại",
            ThuTu: 6
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      if (id === 16) {
        return new Response(
          JSON.stringify({
            MaBaiTap: 16,
            TenBai: "Bài tập 7: Nghe điền từ vào đoạn văn (Cloze Test)",
            Title: "Bài tập 7: Nghe điền từ vào đoạn văn (Cloze Test)",
            Type: "listening-fill-in",
            LoaiBaiHoc: "Điền khuyết",
            Content: "Yesterday, I went to the [1] and bought some [2] to eat. The weather was so nice, so I sat on a [3] in the [4] to enjoy my afternoon snack.",
            Questions: "supermarket | apples | bench | park",
            AudioUrl: "/uploads/toeic-office.mp3",
            Vocabulary: "supermarket, bench, park, snack",
            TenBuoiHoc: "Buổi 1: Ngữ pháp cơ bản - Thì hiện tại",
            ThuTu: 7
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      // Default/Fallback
      return new Response(
        JSON.stringify({
          MaBaiTap: id,
          TenBai: `Bài tập thực hành TOEIC #${id}`,
          LoaiBaiHoc: "Tự luận",
          Content: "Hãy viết một đoạn văn ngắn (150 từ) kể về kỳ nghỉ hè đáng nhớ nhất của bạn.",
          Questions: "1. Kể lại thời gian và địa điểm của kỳ nghỉ?\n2. Có những hoạt động thú vị nào đã diễn ra?",
          Type: "Writing",
          KyNang: "Writing",
          DangBai: "Essay",
          FileUrl: "",
          Vocabulary: "vacation, memory, beach, travel",
          TenBuoiHoc: "Buổi 1: Ngữ pháp cơ bản",
          ThuTu: 1
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 14. GET SUBMISSIONS FOR BAITAP
    if (urlStr.includes("/bainop/baitap/")) {
      const parts = urlStr.split("/");
      const id = parseInt(parts[parts.length - 1]);
      return new Response(
        JSON.stringify(db.submissions.filter((s) => s.MaBaiTap === id || id === 1)),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 15. GET SUBMISSION DETAIL
    if (urlStr.includes("/bainop/") && method === "GET" && !urlStr.includes("/baitap/")) {
      const parts = urlStr.split("/");
      const id = parseInt(parts[parts.length - 1]);
      const sub = db.submissions.find((s) => s.MaBaiNop === id) || db.submissions[0];
      return new Response(
        JSON.stringify(sub),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 16. SUBMIT GRADE FOR STUDENT
    if (urlStr.includes("/bainop/") && urlStr.endsWith("/cham") && (method === "PUT" || method === "POST")) {
      const parts = urlStr.split("/");
      const id = parseInt(parts[parts.indexOf("bainop") + 1]);
      const idx = db.submissions.findIndex((s) => s.MaBaiNop === id);
      if (idx !== -1 && bodyObj) {
        db.submissions[idx].Diem = bodyObj.Diem;
        db.submissions[idx].NhanXet = bodyObj.NhanXet || "";
      }
      return new Response(
        JSON.stringify({ success: true, message: "Lưu điểm thành công!" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 17. DOCUMENTS MANAGEMENT
    if (urlStr.includes("/tailieu/") && method === "GET" && !urlStr.includes("/detail/")) {
      return new Response(
        JSON.stringify(db.documents),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // GET SINGLE DOCUMENT DETAILS
    if (urlStr.includes("/tailieu/detail/")) {
      const parts = urlStr.split("/");
      const id = parseInt(parts[parts.length - 1]);
      const doc = db.documents.find((d) => d.MaTaiLieu === id) || db.documents[0];
      return new Response(
        JSON.stringify(doc),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 18. LECTURES BY LESSON
    if (urlStr.includes("/baigiang/lesson/")) {
      return new Response(
        JSON.stringify(db.lectures),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 19. TEACHER CLASSES RESULTS
    if (urlStr.includes("/teacher/classes/")) {
      return new Response(
        JSON.stringify([
          { MaLopHoc: 101, TenLop: "TOEIC-01", TenKhoaHoc: "TOEIC 650+ Intensive", LichHoc: "Thứ 2 & 4, 18:00-20:00", TienDo: 68 },
          { MaLopHoc: 201, TenLop: "IELTS-SP-01", TenKhoaHoc: "IELTS Speaking Band 7", LichHoc: "Thứ 7, 08:00-11:00", TienDo: 88 }
        ]),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 20. ACTIVE LESSON
    if (urlStr.includes("/active-lesson")) {
      return new Response(
        JSON.stringify({ ActiveBuoiHocId: 1 }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 21. CLASS INFO
    if (urlStr.endsWith("/info") || urlStr.includes("/info")) {
      return new Response(
        JSON.stringify({ TenLop: "TOEIC-01", TenKhoaHoc: "TOEIC 650+ Intensive" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // ════════════════════════════════════════
    // QTV - CONTENT ADMIN ENDPOINTS
    // ════════════════════════════════════════

    // QTV REPORTS (BẢNG ĐIỂM)
    if (urlStr.includes("/baocao/hocvien")) {
      return new Response(
        JSON.stringify([
          { MaNguoiDung: 101, MaSinhVien: "SV01", HoTen: "Nguyễn Văn An", GioiTinh: "Nam", NgaySinh: "2002-03-12T00:00:00.000Z", TenLop: "TOEIC-01", TenKhoaHoc: "TOEIC 650+ Intensive", TrangThai: "Đang học", baiTaps: { 1: 8.5 } },
          { MaNguoiDung: 102, MaSinhVien: "SV02", HoTen: "Trần Thị Bích", GioiTinh: "Nữ", NgaySinh: "2001-11-02T00:00:00.000Z", TenLop: "TOEIC-01", TenKhoaHoc: "TOEIC 650+ Intensive", TrangThai: "Đang học", baiTaps: { 1: 9.0 } },
          { MaNguoiDung: 103, MaSinhVien: "SV03", HoTen: "Lê Minh Cường", GioiTinh: "Nam", NgaySinh: "2000-08-20T00:00:00.000Z", TenLop: "IELTS-SP-01", TenKhoaHoc: "IELTS Speaking Band 7", TrangThai: "Đang học", baiTaps: { 1: 8.0 } },
          { MaNguoiDung: 9999, MaSinhVien: "SV_MOCK_TEST", HoTen: "Học Viên Giả Định", GioiTinh: "Nam", NgaySinh: "2002-05-15T00:00:00.000Z", TenLop: "TOEIC-01", TenKhoaHoc: "TOEIC 650+ Intensive", TrangThai: "Đang học", baiTaps: { 1: 8.5 } }
        ]),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    if (urlStr.includes("/baocao/baitap-headers")) {
      return new Response(
        JSON.stringify([
          { MaBaiTap: 1, TenBai: "Bài tập 1: Ngữ pháp", TenBuoiHoc: "Buổi 1: Ngữ pháp - Thì hiện tại", ThuTu: 1, MaBuoiHoc: 1, MaLopHoc: 101, TenLop: "TOEIC-01" },
          { MaBaiTap: 2, TenBai: "Bài tập 2: Reading", TenBuoiHoc: "Buổi 2: Ngữ pháp - Thì quá khứ", ThuTu: 2, MaBuoiHoc: 2, MaLopHoc: 101, TenLop: "TOEIC-01" }
        ]),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    if (urlStr.includes("/baocao/buoihoc")) {
      return new Response(
        JSON.stringify([
          { MaBuoiHoc: 1, TenBuoiHoc: "Buổi 1", ThuTu: 1, MaLopHoc: 101, TenLop: "TOEIC-01", ActiveBuoiHocId: 1 },
          { MaBuoiHoc: 2, TenBuoiHoc: "Buổi 2", ThuTu: 2, MaLopHoc: 101, TenLop: "TOEIC-01", ActiveBuoiHocId: 1 }
        ]),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    if (urlStr.includes("/baocao/diem-all")) {
      return new Response(
        JSON.stringify(db.submissions.map(s => ({
          MaBaiNop: s.MaBaiNop,
          MaSinhVien: s.MaSinhVien,
          MaBaiTap: s.MaBaiTap,
          Diem: s.Diem,
          NgayNop: s.NgayNop
        }))),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // DUYỆT BÀI QTV (APPROVALS)
    if (urlStr.includes("/qtv/baigiang") && method === "GET") {
      return new Response(
        JSON.stringify(db.approvals.baigiang),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    if (urlStr.includes("/baihocmo") && method === "GET") {
      return new Response(
        JSON.stringify(db.approvals.baihocmo),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    if (urlStr.includes("/qtv/baitap") && method === "GET") {
      return new Response(
        JSON.stringify(db.approvals.exercises),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    if (urlStr.includes("/qtv/tailieu") && method === "GET") {
      return new Response(
        JSON.stringify(db.approvals.tailieu),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // UPDATE APPROVAL STATUS
    if (
      (urlStr.includes("/baigiang/") && urlStr.includes("/status")) ||
      (urlStr.includes("/baihocmo/") && urlStr.includes("/duyet")) ||
      (urlStr.includes("/baitap/") && urlStr.includes("/status")) ||
      (urlStr.includes("/tailieu/") && urlStr.includes("/status"))
    ) {
      // Find and update item status in db
      const isApprove = bodyObj?.TrangThai?.toLowerCase() === "published" || bodyObj?.TrangThai?.toLowerCase() === "hoạt động";
      const newStatus = isApprove ? "Đã duyệt" : "Từ chối";

      if (urlStr.includes("/baigiang/")) {
        db.approvals.baigiang.forEach(item => item.TrangThai = newStatus);
      } else if (urlStr.includes("/baihocmo/")) {
        db.approvals.baihocmo.forEach(item => item.TrangThai = newStatus);
      } else if (urlStr.includes("/baitap/")) {
        db.approvals.exercises.forEach(item => item.TrangThai = newStatus);
      } else if (urlStr.includes("/tailieu/")) {
        db.approvals.tailieu.forEach(item => item.TrangThai = newStatus);
      }

      return new Response(
        JSON.stringify({ success: true, message: "Cập nhật trạng thái kiểm duyệt thành công!" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // ADMIN STATISTICS
    if (urlStr === `${new URL(urlStr).origin}/admin/stats` && method === "GET") {
      return new Response(
        JSON.stringify({
          tongNguoiDung: 125,
          sinhVien: 78,
          giangVien: 12,
          quanTriVien: 2,
          khoaHoc: 5,
          dangKy: 45
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    if (urlStr.includes("/admin/stats/dangky-thang") && method === "GET") {
      return new Response(
        JSON.stringify([
          { Thang: 1, SoLuong: 5 },
          { Thang: 2, SoLuong: 8 },
          { Thang: 3, SoLuong: 12 },
          { Thang: 4, SoLuong: 15 },
          { Thang: 5, SoLuong: 10 },
          { Thang: 6, SoLuong: 3 }
        ]),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // ADMIN USERS MANAGEMENT
    if (urlStr.includes("/admin/users") && !urlStr.includes("/permissions") && method === "GET") {
      return new Response(
        JSON.stringify([
          { MaNguoiDung: 1, TenDangNhap: "admin", HoTen: "Nguyễn Văn Admin", Email: "admin@flic.com", TrangThai: "Active", NgayTao: "2025-01-01", VaiTro: "Quản Trị Viên" },
          { MaNguoiDung: 2, TenDangNhap: "teacher1", HoTen: "Trần Văn Giảng", Email: "teacher@flic.com", TrangThai: "Active", NgayTao: "2025-01-05", VaiTro: "Giảng Viên" },
          { MaNguoiDung: 3, TenDangNhap: "student1", HoTen: "Lê Minh Học", Email: "student@flic.com", TrangThai: "Active", NgayTao: "2025-01-10", VaiTro: "Học Viên" },
          { MaNguoiDung: 4, TenDangNhap: "qtv", HoTen: "Phạm Quản Trị", Email: "qtv@flic.com", TrangThai: "Active", NgayTao: "2025-01-15", VaiTro: "Quản Trị Nội Dung" }
        ]),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    if (urlStr.includes("/admin/users") && urlStr.includes("/permissions") && method === "GET") {
      return new Response(
        JSON.stringify([
          { MaQuyen: 1, TenQuyen: "Xem thống kê", MaNguoiDung: 1 },
          { MaQuyen: 2, TenQuyen: "Quản lý khóa học", MaNguoiDung: 1 },
          { MaQuyen: 3, TenQuyen: "Quản lý người dùng", MaNguoiDung: 1 }
        ]),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // COURSES MANAGEMENT
    if (urlStr.includes("/admin/khoahoc") && method === "GET") {
      return new Response(
        JSON.stringify([
          { id: 1, title: 'TOEIC 650+ Intensive', level: 'TOEIC', category: 'Luyện thi', students: 45, status: 'Hoạt động', created: '10/01/2025' },
          { id: 2, title: 'IELTS Speaking Band 7', level: 'IELTS', category: 'Luyện thi', students: 32, status: 'Hoạt động', created: '15/01/2025' }
        ]),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    if (urlStr.includes("/qtv/giangvien") && method === "GET") {
      return new Response(
        JSON.stringify([
          { MaGiangVien: 1, MaNguoiDung: 1, HoTen: "Nguyễn Văn A" },
          { MaGiangVien: 2, MaNguoiDung: 2, HoTen: "Trần Thị B" }
        ]),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    if (urlStr.includes("/students") && method === "GET" && !urlStr.includes("/teacher/") && !urlStr.includes("/lophoc/")) {
      return new Response(
        JSON.stringify([
          { MaNguoiDung: 101, MaSinhVien: "SV01", HoTen: "Nguyễn Văn An" },
          { MaNguoiDung: 102, MaSinhVien: "SV02", HoTen: "Trần Thị Bích" },
          { MaNguoiDung: 103, MaSinhVien: "SV03", HoTen: "Lê Minh Cường" }
        ]),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    if (urlStr.includes("/dangky/pending") && method === "GET") {
      return new Response(
        JSON.stringify([]),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    if ((urlStr.endsWith("/khoahoc") || urlStr.includes("/khoahoc?")) && method === "GET") {
      return new Response(
        JSON.stringify([
          { MaKhoaHoc: 1, TenKhoaHoc: "TOEIC 650+ Intensive" },
          { MaKhoaHoc: 2, TenKhoaHoc: "IELTS Speaking Band 7" }
        ]),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    if (urlStr.includes("/course-detail/") && urlStr.endsWith("/classes") && method === "GET") {
      return new Response(
        JSON.stringify([
          { MaLopHoc: 101, TenLop: "TOEIC-01", LichHoc: "Thứ 2 & 4, 18:00-20:00", SiSoToiDa: 30, SiSoThucTe: 3, TenGiangVien: "Nguyễn Văn A", MaGiangVien: 1, GiangVienKyNang: [{ KyNang: "Nghe", MaGiangVien: 1, TenGiangVien: "Nguyễn Văn A" }] }
        ]),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    if (urlStr.includes("/qtv/khoahoc/") && urlStr.endsWith("/giangvien") && method === "GET") {
      return new Response(
        JSON.stringify([{ MaGiangVien: 1, HoTen: "Nguyễn Văn A" }]),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // TEST EXAM - GET LIST OF TESTS
    if (urlStr.includes("/tests") && !urlStr.includes("/tests/") && method === "GET") {
      return new Response(
        JSON.stringify([
          {
            MaBaiTest: 1,
            TieuDe: "VSTEP B1 - Đề thi mẫu số 1",
            MoTa: "Đề thi thử VSTEP trình độ B1 bao gồm đầy đủ 4 kỹ năng: Nghe, Đọc, Viết và Nói.",
            TongThoiGian: 177,
            CapDo: "B1",
            LoaiBai: "VSTEP",
            NgayTao: "2026-01-10T00:00:00.000Z",
            TrangThai: "published"
          },
          {
            MaBaiTest: 2,
            TieuDe: "VSTEP B2 - Đề thi mẫu số 2",
            MoTa: "Đề thi thử VSTEP trình độ B2 với câu hỏi nâng cao hơn cho cả 4 kỹ năng.",
            TongThoiGian: 177,
            CapDo: "B2",
            LoaiBai: "VSTEP",
            NgayTao: "2026-02-15T00:00:00.000Z",
            TrangThai: "published"
          },
          {
            MaBaiTest: 3,
            TieuDe: "TOEIC Practice Test - Full Exam",
            MoTa: "Đề thi thử TOEIC đầy đủ với phần Listening và Reading chuẩn format quốc tế.",
            TongThoiGian: 120,
            CapDo: "Intermediate",
            LoaiBai: "TOEIC",
            NgayTao: "2026-03-01T00:00:00.000Z",
            TrangThai: "published"
          }
        ]),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // TEST EXAM - GET TEST DETAIL WITH QUESTIONS
    if (urlStr.includes("/tests/") && method === "GET") {
      const parts = urlStr.split("/");
      const testId = parseInt(parts[parts.length - 1]);
      return new Response(
        JSON.stringify({
          MaBaiTest: testId,
          TieuDe: testId === 1 ? "VSTEP B1 - Đề thi mẫu số 1" : testId === 2 ? "VSTEP B2 - Đề thi mẫu số 2" : "TOEIC Practice Test",
          CapDo: testId === 3 ? "Intermediate" : testId === 1 ? "B1" : "B2",
          kyNang: {
            listening: {
              thoiGian: 45 * 60,
              parts: [
                {
                  soPhan: 1,
                  tieuDe: "Part 1: Short Conversations",
                  huongDan: "In this part, you will hear EIGHT short recordings. The recordings will be played ONCE only. There is one question following each recording. For each question, choose the right answer A, B, C or D.",
                  audioUrl: "/coffee-shop.mp3",
                  cauHois: [
                    { id: 1, noiDung: "What music will they have at the party?", luaChon: ["A. guitar", "B. cello", "C. CDs", "D. piano"], dapAn: "D" },
                    { id: 2, noiDung: "What is the man's problem?", luaChon: ["A. He lost his wallet", "B. He missed his flight", "C. He forgot his passport", "D. He is late for work"], dapAn: "B" },
                    { id: 3, noiDung: "Where does this conversation take place?", luaChon: ["A. At a hospital", "B. At a bank", "C. At a restaurant", "D. At a school"], dapAn: "C" },
                    { id: 4, noiDung: "What will the woman do next?", luaChon: ["A. Call a taxi", "B. Take the bus", "C. Walk home", "D. Drive her car"], dapAn: "A" },
                    { id: 5, noiDung: "What is being discussed?", luaChon: ["A. A job promotion", "B. A business trip", "C. A company meeting", "D. A new project"], dapAn: "D" },
                    { id: 6, noiDung: "How does the man feel about the news?", luaChon: ["A. Excited", "B. Disappointed", "C. Confused", "D. Worried"], dapAn: "A" },
                    { id: 7, noiDung: "What time does the train depart?", luaChon: ["A. 8:00 AM", "B. 9:30 AM", "C. 10:00 AM", "D. 11:15 AM"], dapAn: "C" },
                    { id: 8, noiDung: "What does the woman suggest?", luaChon: ["A. Buying a new phone", "B. Visiting a doctor", "C. Going on vacation", "D. Starting a business"], dapAn: "B" }
                  ]
                },
                {
                  soPhan: 2,
                  tieuDe: "Part 2: Longer Conversations",
                  huongDan: "In this part, you will hear TWO longer conversations. Answer the questions that follow each conversation.",
                  audioUrl: "/job-interview.mp3",
                  cauHois: [
                    { id: 9, noiDung: "What is the main topic of the conversation?", luaChon: ["A. Travel planning", "B. Job application", "C. Business meeting", "D. School project"], dapAn: "B" },
                    { id: 10, noiDung: "What position is being discussed?", luaChon: ["A. Manager", "B. Engineer", "C. Teacher", "D. Accountant"], dapAn: "A" },
                    { id: 11, noiDung: "How long has the applicant worked in the field?", luaChon: ["A. 2 years", "B. 5 years", "C. 7 years", "D. 10 years"], dapAn: "C" },
                    { id: 12, noiDung: "What will happen next?", luaChon: ["A. A second interview", "B. A written test", "C. A training session", "D. A contract signing"], dapAn: "A" },
                    { id: 13, noiDung: "What does the interviewer say about the company?", luaChon: ["A. It is expanding rapidly", "B. It is facing financial difficulties", "C. It is looking for interns", "D. It recently merged"], dapAn: "A" }
                  ]
                },
                {
                  soPhan: 3,
                  tieuDe: "Part 3: Talks and Announcements",
                  huongDan: "In this part, you will hear THREE short talks. Answer the questions based on what you hear.",
                  audioUrl: "/weather-forecast.mp3",
                  cauHois: [
                    { id: 14, noiDung: "What is the purpose of this announcement?", luaChon: ["A. To warn about bad weather", "B. To advertise a product", "C. To announce a schedule change", "D. To introduce new staff"], dapAn: "A" },
                    { id: 15, noiDung: "According to the forecast, what will happen tomorrow?", luaChon: ["A. Heavy rain", "B. Strong winds", "C. Clear skies", "D. Thunderstorms"], dapAn: "D" },
                    { id: 16, noiDung: "What advice is given to listeners?", luaChon: ["A. Stay indoors", "B. Drive carefully", "C. Carry an umbrella", "D. Avoid the beach"], dapAn: "C" },
                    { id: 17, noiDung: "When will the weather improve?", luaChon: ["A. Tonight", "B. Tomorrow morning", "C. This weekend", "D. Next week"], dapAn: "C" },
                    { id: 18, noiDung: "What temperature is expected?", luaChon: ["A. 15°C", "B. 20°C", "C. 25°C", "D. 30°C"], dapAn: "B" },
                    { id: 19, noiDung: "Which area will be most affected?", luaChon: ["A. Northern region", "B. Southern region", "C. Coastal areas", "D. Mountain areas"], dapAn: "C" },
                    { id: 20, noiDung: "What should people prepare for the storm?", luaChon: ["A. Emergency supplies", "B. Rain boots", "C. Sun cream", "D. Extra clothing"], dapAn: "A" }
                  ]
                }
              ]
            },
            reading: {
              thoiGian: 60 * 60,
              parts: [
                {
                  soPhan: 1,
                  tieuDe: "Part 1: Reading Comprehension",
                  huongDan: "Directions: In this section, you will read several passages. Each one is followed by several questions about it. For questions 1-40, you are to choose the one best answer A, B, C or D to each question. Answer all questions following a passage on the basis of what is stated or implied in that passage.",
                  doanVan: "(A) It is estimated that over 99 percent of all species that ever existed have become extinct. What causes extinction? When a species is no longer adapted to a changed environment, it may perish. The exact causes of a species' death vary from situation to situation. Rapid ecological change may render an environment hostile to a species. For example, temperatures may change and a species may not be able to adapt. Food resources may be affected by environmental changes, which will then cause problems for a species requiring these resources. Other species may become better adapted to an environment, resulting in competition and, ultimately, in the death of a species. The fossil record reveals that extinction has occurred throughout the history of Earth. Recent analyses have also revealed that on some occasions many species became extinct at the same time—a mass extinction. One of the best-known examples of mass extinction occurred 65 million years ago with the demise of dinosaurs and many other forms of life.\n\n(B) Perhaps the largest mass extinction was the one that occurred 225 million years ago, when approximately 95 percent of all species died. Mass extinctions can be caused by a relatively rapid change in the environment and can be worsened by the close interrelationship of many species. If, for example, something was to happen to destroy much of the plankton in the oceans, then the oxygen content of Earth would drop, affecting even organisms not living in the oceans. Such a change would probably lead to a mass extinction.",
                  cauHois: [
                    { id: 1, noiDung: "The word 'it' in paragraph (A) refers to", luaChon: ["A. extinction", "B. species", "C. environment", "D. 99 percent"], dapAn: "A" },
                    { id: 2, noiDung: "The word 'ultimately' in paragraph (A) is closest in meaning to", luaChon: ["A. unfortunately", "B. eventually", "C. exceptionally", "D. dramatically"], dapAn: "B" },
                    { id: 3, noiDung: "What does the author say in paragraph (A) regarding most species in Earth's history?", luaChon: ["A. They have caused rapid change in the environment.", "B. They are no longer in existence.", "C. They have remained basically unchanged from their original forms.", "D. They have been able to adapt to ecological changes."], dapAn: "B" },
                    { id: 4, noiDung: "Which of the following is NOT mentioned in paragraph (A) as resulting from rapid ecological change?", luaChon: ["A. Temperature changes", "B. Competition among species", "C. Availability of food resources", "D. Introduction of new species"], dapAn: "D" },
                    { id: 5, noiDung: "The word 'demise' in paragraph (A) is closest in meaning to", luaChon: ["A. change", "B. recovery", "C. death", "D. escape"], dapAn: "C" },
                    { id: 6, noiDung: "According to paragraph (B), what happened 225 million years ago?", luaChon: ["A. A new species evolved", "B. 95% of all species went extinct", "C. Plankton disappeared from oceans", "D. Dinosaurs first appeared"], dapAn: "B" },
                    { id: 7, noiDung: "What role does plankton play according to paragraph (B)?", luaChon: ["A. It produces food for fish", "B. It contributes to Earth's oxygen content", "C. It prevents ocean pollution", "D. It regulates temperature"], dapAn: "B" },
                    { id: 8, noiDung: "The word 'worsened' in paragraph (B) is closest in meaning to", luaChon: ["A. improved", "B. interrupted", "C. made more severe", "D. prevented"], dapAn: "C" },
                    { id: 9, noiDung: "What is the main idea of this passage?", luaChon: ["A. Dinosaurs dominated Earth for millions of years", "B. Extinction is a natural process that has occurred throughout Earth's history", "C. Human activity is the main cause of extinction", "D. Most species alive today evolved from ancient organisms"], dapAn: "B" },
                    { id: 10, noiDung: "Which is the best title for this passage?", luaChon: ["A. The Age of Dinosaurs", "B. Environmental Changes on Earth", "C. Extinction: Causes and Examples", "D. Marine Life and Oxygen"], dapAn: "C" }
                  ]
                },
                {
                  soPhan: 2,
                  tieuDe: "Part 2: Vocabulary in Context",
                  huongDan: "Read the passage and answer the vocabulary questions.",
                  doanVan: "The Industrial Revolution, which began in Britain in the mid-18th century, fundamentally transformed society and the economy. Factories replaced cottage industries, urbanization accelerated as workers moved to cities, and new technologies like the steam engine dramatically increased productivity. However, these changes also brought significant social challenges, including harsh working conditions, child labor, and growing inequality between factory owners and workers. The era also sparked important social movements that eventually led to labor reforms and improvements in workers' rights.",
                  cauHois: [
                    { id: 11, noiDung: "The word 'fundamentally' in the passage is closest in meaning to", luaChon: ["A. temporarily", "B. basically/completely", "C. gradually", "D. partially"], dapAn: "B" },
                    { id: 12, noiDung: "What does 'urbanization' refer to?", luaChon: ["A. The growth of rural areas", "B. The movement of people to cities", "C. Industrial development", "D. Agricultural expansion"], dapAn: "B" },
                    { id: 13, noiDung: "Which best describes the 'cottage industries' mentioned in the passage?", luaChon: ["A. Large factory-based production", "B. Small-scale home-based production", "C. Agricultural activities", "D. International trade"], dapAn: "B" },
                    { id: 14, noiDung: "According to the passage, what was a major social problem of the Industrial Revolution?", luaChon: ["A. Lack of new technology", "B. Decreasing productivity", "C. Harsh working conditions", "D. Rural overpopulation"], dapAn: "C" },
                    { id: 15, noiDung: "What eventually resulted from social movements of that era?", luaChon: ["A. End of industrialization", "B. Return to cottage industries", "C. Labor reforms and workers' rights improvements", "D. Factory closures"], dapAn: "C" }
                  ]
                },
                {
                  soPhan: 3,
                  tieuDe: "Part 3: Text Completion",
                  huongDan: "Choose the best answer to complete each sentence based on the context.",
                  doanVan: "Climate change is one of the most pressing issues of our time. Scientists have warned that without significant reductions in greenhouse gas emissions, global temperatures could rise by more than 2 degrees Celsius above pre-industrial levels by the end of this century. Such a rise would have devastating consequences for ecosystems, weather patterns, sea levels, and human societies. International agreements like the Paris Accord aim to coordinate global efforts to limit warming and transition to cleaner energy sources.",
                  cauHois: [
                    { id: 16, noiDung: "The word 'pressing' in the passage is closest in meaning to", luaChon: ["A. easy", "B. urgent", "C. minor", "D. outdated"], dapAn: "B" },
                    { id: 17, noiDung: "What do scientists warn will happen without emission reductions?", luaChon: ["A. Sea levels will drop", "B. Temperatures will fall", "C. Global temperatures will rise significantly", "D. Weather will improve"], dapAn: "C" },
                    { id: 18, noiDung: "What is the purpose of the Paris Accord according to the passage?", luaChon: ["A. To ban fossil fuels entirely", "B. To coordinate global efforts to limit warming", "C. To increase greenhouse gas emissions", "D. To fund new technologies"], dapAn: "B" },
                    { id: 19, noiDung: "The word 'devastating' is closest in meaning to", luaChon: ["A. beneficial", "B. minor", "C. destructive", "D. temporary"], dapAn: "C" },
                    { id: 20, noiDung: "What areas would be affected by a temperature rise above 2°C?", luaChon: ["A. Only polar regions", "B. Ecosystems and weather patterns", "C. Only human societies", "D. Only sea levels"], dapAn: "B" }
                  ]
                },
                {
                  soPhan: 4,
                  tieuDe: "Part 4: Long Reading",
                  huongDan: "Read the following passage carefully and answer all questions.",
                  doanVan: "The continents may have first risen high above the oceans of the world about 3 billion years ago, researchers say. That is about a billion years earlier than geoscientists had suspected for the emergence of a good chunk of the continents.\n\nEarth is the only known planet whose surface is divided into continents and oceans. Currently, the continents rise an average of about 2.5 miles (4 kilometers) above the seafloor.\n\nThe continents are composed of a thick, buoyant crust that is about 21 miles (35 km) deep, on average, whereas the comparatively thin, dense crust of the ocean floor is only about 4 miles (7 km) thick. Because the continents are so thick and buoyant, they are less likely than oceanic crust to sink into Earth's interior, which is why so many ancient continental rocks have survived in the Earth's crust. Details of how the continents formed, when and how they formed, remains hotly contested.",
                  cauHois: [
                    { id: 21, noiDung: "According to the geoscientists, when were the continents assumed to first rise above the oceans?", luaChon: ["A. 2 billion years ago", "B. 3 billion years ago", "C. 4 billion years ago", "D. 1 billion years ago"], dapAn: "B" },
                    { id: 22, noiDung: "What is true about the continents?", luaChon: ["A. They are thinner than oceanic crust", "B. They have a dense crust", "C. They are made of buoyant crust", "D. They sink frequently"], dapAn: "C" },
                    { id: 23, noiDung: "What is Earth unique in having?", luaChon: ["A. A surface divided into continents and oceans", "B. Water on its surface", "C. A thick atmosphere", "D. Volcanic activity"], dapAn: "A" },
                    { id: 24, noiDung: "The phrase 'To shed light on' means", luaChon: ["A. To ignite", "B. To clarify", "C. To illustrate", "D. To release"], dapAn: "B" },
                    { id: 25, noiDung: "According to the passage, how was the crust of the seafloor formed?", luaChon: ["A. Through tectonic compression", "B. Through silica deposition", "C. Through volcanic activity on land", "D. Through erosion of continents"], dapAn: "A" },
                    { id: 26, noiDung: "What is the average depth of continental crust?", luaChon: ["A. 4 km", "B. 7 km", "C. 35 km", "D. 21 miles"], dapAn: "C" },
                    { id: 27, noiDung: "Why have ancient continental rocks survived in Earth's crust?", luaChon: ["A. They are harder than ocean rocks", "B. They are less likely to sink into Earth's interior", "C. They were protected by glaciers", "D. They formed recently"], dapAn: "B" },
                    { id: 28, noiDung: "What remains 'hotly contested' according to the passage?", luaChon: ["A. The age of the oceans", "B. The formation of continents", "C. The depth of the seafloor", "D. The composition of rocks"], dapAn: "B" },
                    { id: 29, noiDung: "How far do continents rise above the seafloor on average?", luaChon: ["A. 1.5 miles", "B. 2 miles", "C. 2.5 miles", "D. 3 miles"], dapAn: "C" },
                    { id: 30, noiDung: "The passage is mainly about", luaChon: ["A. Ocean floor formation", "B. The origin and nature of continents", "C. Volcanic activity", "D. Erosion processes"], dapAn: "B" }
                  ]
                }
              ]
            },
            writing: {
              thoiGian: 60 * 60,
              parts: [
                {
                  soPhan: 1,
                  tieuDe: "Part 1: Letter Writing",
                  huongDan: "You should spend about 20 minutes on this task. You have received this email from an English-speaking pen friend.",
                  noiDung: "I'm a rock fan. I can listen to rock all day.\n\nWhat about you?\nWhat kind of music do you like?\nWhat is your favourite song and artist?\nPlease write to tell me more about your music taste.",
                  yeuCau: "Write an email to your friend responding to their questions and sharing your music preferences.\n\nYou should write at least 120 words. Do not include your name. Your response will be evaluated in terms of Task Fulfillment, Organization, Vocabulary and Grammar.",
                  soTuToiThieu: 120
                },
                {
                  soPhan: 2,
                  tieuDe: "Part 2: Essay Writing",
                  huongDan: "You should spend about 40 minutes on this task. Write about the following topic.",
                  noiDung: "Some people believe that technology has made our lives easier and more convenient. Others think it has made life more complicated and stressful.\n\nDiscuss both views and give your own opinion.",
                  yeuCau: "Give reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nYou should write at least 250 words. Your response will be evaluated in terms of Task Fulfillment, Coherence and Cohesion, Lexical Resource, and Grammatical Range and Accuracy.",
                  soTuToiThieu: 250
                }
              ]
            },
            speaking: {
              thoiGian: 12 * 60,
              parts: [
                {
                  soPhan: 1,
                  tieuDe: "Part 1: Social Interaction",
                  moTa: "Question 1: Social Interaction (3 minutes)",
                  audioUrl: "/coffee-shop.mp3",
                  noiDung: "The examiner will ask you some questions about yourself and your life. Please answer naturally and in full sentences. Topic: Your daily routine and hobbies.\n\nSample questions:\n- What do you usually do in the morning?\n- What are your hobbies and why do you enjoy them?\n- How do you spend your weekends?",
                  thoiGianNoi: 3 * 60
                },
                {
                  soPhan: 2,
                  tieuDe: "Part 2: Solution Discussion",
                  moTa: "Question 2: Solution Discussion (4 minutes)",
                  audioUrl: "/job-interview.mp3",
                  noiDung: "Situation: If you won a lottery of 1 billion VND, what would you do with the money? Three options are suggested: buying a new house, starting a business, and depositing the money in the bank. Which option do you think is the best choice? Why?",
                  thoiGianNoi: 4 * 60
                },
                {
                  soPhan: 3,
                  tieuDe: "Part 3: Topic Development",
                  moTa: "Question 3: Topic Development (5 minutes)",
                  audioUrl: "/weather-forecast.mp3",
                  noiDung: "Topic: The impact of social media on modern society.\n\nDiscuss the following points:\n- How has social media changed the way people communicate?\n- What are the positive and negative effects of social media?\n- Do you think the benefits of social media outweigh the disadvantages? Give your reasons.",
                  thoiGianNoi: 5 * 60
                }
              ]
            }
          }
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // TEST EXAM - SUBMIT EXAM
    if (urlStr.includes("/tests/") && urlStr.includes("/submit") && method === "POST") {
      return new Response(
        JSON.stringify({ success: true, message: "Bài thi đã được nộp thành công!" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // TEST EXAM - SAVE PARTIAL ANSWERS
    if (urlStr.includes("/tests/") && urlStr.includes("/save") && method === "POST") {
      return new Response(
        JSON.stringify({ success: true, message: "Bài làm đã được lưu vào hệ thống." }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // UPLOAD / FALLBACK FILE RESPONSE
    if (urlStr.includes("/upload") && method === "POST") {
      return new Response(
        JSON.stringify({ success: true, url: "/job-interview.mp3", message: "Tải tệp tin lên thành công!" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // FALLBACK FOR OTHER API CALLS TO PREVENT UI CRASHES
    return new Response(
      JSON.stringify({ success: true, message: "Thao tác thành công (Mock API)" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  // Pass through any other URL (e.g. static assets, public resources, etc.)
  return originalFetch(input, init);
};

console.log("Mock API interceptor initialized successfully!");

