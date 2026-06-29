import NavbarAuto from "../../components/NavbarAuto";
import Footer from "../../components/Footer";
import "./DSKhoaHoc.css";
import "./DSKhoaHoc_TuongThich.css"; // Import file css tuong thich rieng

const staticCategories = [
  {
    key: "toeic",
    title: "Khóa học Luyện thi TOEIC",
    desc: "TOEIC là chương trình do Viện khảo thí giáo dục Hoa kỳ thiết kế. Là chương trình kiểm tra và xây dựng tiêu chuẩn Anh ngữ trong môi trường giao tiếp và làm việc quốc tế. Kết quả thi TOEIC (hai kỹ năng Listening and Reading gọi là TOEIC paper) sẽ có từ 10 đến 990 điểm. Kết quả điểm đạt được sẽ thể hiện trình độ Tiếng Anh của người thi.",
    image: "/image(17).png"
  },
  {
    key: "ielts",
    title: "Khóa học Luyện thi IELTS",
    desc: "IELTS là viết tắt của cụm từ International English Testing System, nhằm đánh giá độ thông thạo tiếng Anh cho mục đích du học, định cư hoặc làm việc tại những nước sử dụng tiếng Anh làm ngôn ngữ chính. Bài thi IELTS đánh giá toàn diện cả 4 kỹ năng Nghe – Nói – Đọc – Viết, trong đó phần Nghe, Nói giống nhau cho cả 2 hình thức thi, chỉ khác nhau về đề tài và mức độ khó ở phần Đọc Viết",
    image: "/image(18).png"
  },
  {
    key: "vstep",
    title: "Khóa học Luyện thi VSTEP",
    desc: "VSTEP nghĩa là “Kỳ thi đánh giá năng lực tiếng Anh theo Khung năng lực ngoại ngữ (NLNN) 6 bậc dùng cho Việt Nam (từ bậc 1 đến bậc 6) tương đương với trình độ A1 đến C2 của Khung NLNN Châu Âu CEFR”. Bài thi Đọc & Viết đánh giá năng lực đọc hiểu các ký hiệu, văn bản, khả năng ứng phó với những từ và cấu trúc câu mà bạn chưa biết.",
    image: "/image(19).png"
  },
  {
    key: "general",
    title: "Khóa học Tiếng anh tổng quát",
    desc: "Chương trình tiếng Anh tổng quát ôn tập căn bản các điểm ngữ pháp, củng cố và bổ sung từ vựng mới, tạo phản xạ nghe, nói cho các đối tượng học viên muốn lấy lại căn bản tiếng Anh và tạo nền tảng cho các lớp dự bị TOEFL, IELTS, TOEIC. Khóa học này cũng giúp học viên nghe hiểu và trả lời một câu đã được học, có khả năng viết được những câu đơn, tự tin giao tiếp,...",
    image: "/image(20).png"
  }
];

const DSKhoaHoc = () => {
  return (
    <>
      <NavbarAuto />

      <div className="courses-page-wrapper">
        <div className="courses-container">
          {/* Breadcrumb da duoc loai bo theo yeu cau cua ban */}

          <h1 className="courses-title">CÁC KHÓA HỌC</h1>

          <div className="courses-list-layout">
            {staticCategories.map((cat) => (
              <div className="course-item-container" key={cat.key}>
                <div className="course-item">
                  <img src={`${import.meta.env.BASE_URL}${cat.image.substring(1)}`} alt={cat.title} />

                  <div className="course-content">
                    <h2>{cat.title}</h2>
                    <p>{cat.desc}</p>

                    <div className="course-buttons">
                      <button onClick={() => window.open("https://flic.due.udn.vn/ngoai_ngu/", "_blank")}>
                        Đăng ký khóa học
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default DSKhoaHoc;
