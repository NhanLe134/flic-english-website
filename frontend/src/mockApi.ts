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
            HoTen: "Học viên Nguyễn Văn C",
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
    if (urlStr.includes("/lesson/") && method === "GET") {
      const parts = urlStr.split("/");
      const id = parseInt(parts[parts.length - 1]);
      return new Response(
        JSON.stringify({
          MaBuoiHoc: id,
          TenBuoiHoc: `Buổi ${id}: Chuyên đề ngữ pháp & luyện đề`,
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
    if (urlStr.includes("/baitap/") && !urlStr.includes("/create") && method === "GET") {
      const match = urlStr.match(/\/baitap\/(\d+)/);
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
      return new Response(
        JSON.stringify([
          { TenBaiTap: "Bài tập 1: Ngữ pháp", NgayNop: "2026-03-05T08:00:00Z", Diem: 8.5 },
          { TenBaiTap: "Bài tập 2: Reading", NgayNop: "2026-03-06T09:00:00Z", Diem: null }
        ]),
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
      const id = parts[parts.length - 1];
      return new Response(
        JSON.stringify({
          MaBaiTap: parseInt(id) || 1,
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
