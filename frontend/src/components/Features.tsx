import "./features.css";
import { useNavigate } from "react-router-dom";

function Tools() {
  const navigate = useNavigate();

  return (
    <section className="tools">

      <h2 className="tools-title">
        Chúng tôi cung cấp cho bạn các công cụ và phương pháp phù hợp,
        giúp bạn tự tin giao tiếp và tương tác hiệu quả trong môi trường thực tế.
      </h2>

      {/* HỌC MIỄN PHÍ */}
      <div className="tool-card">
        <img
          src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d"
          alt="Học miễn phí"
        />
        <div className="tool-content">
          <div className="tool-badge free">Miễn phí</div>
          <h3>Học miễn phí</h3>
          <p>
            Truy cập hàng trăm bài học từ vựng, ngữ pháp và kỹ năng hoàn toàn
            miễn phí — không cần đăng ký tài khoản trả phí.
          </p>
          <ul>
            <li>Từ vựng theo chủ đề thực tế, có phiên âm và ví dụ.</li>
            <li>Ngữ pháp giải thích rõ ràng, bài tập tương tác.</li>
            <li>Luyện nghe, đọc với nội dung đa dạng.</li>
            <li>Trò chơi ngôn ngữ giúp ghi nhớ nhanh hơn.</li>
          </ul>
          <button onClick={() => navigate("/register")}>Bắt đầu học miễn phí →</button>
        </div>
      </div>

      {/* CÁC KHÓA HỌC */}
      <div className="tool-card">
        <img
          src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b"
          alt="Các khóa học"
        />
        <div className="tool-content">
          <div className="tool-badge course">Khóa học</div>
          <h3>Các khóa học</h3>
          <p>
            Tham gia các khóa học bài bản có giáo viên hướng dẫn, lộ trình rõ ràng
            từ cơ bản đến nâng cao — phù hợp với mọi trình độ.
          </p>
          <ul>
            <li>Lộ trình học từ A1 đến C1 theo chuẩn quốc tế.</li>
            <li>Giáo viên giàu kinh nghiệm, lớp học trực tuyến linh hoạt.</li>
            <li>Bài tập, kiểm tra và chứng chỉ hoàn thành khóa học.</li>
            <li>Hỗ trợ luyện thi TOEIC, IELTS và các chứng chỉ quốc tế.</li>
          </ul>
          <button onClick={() => navigate("/courses")}>Khám phá khóa học →</button>
        </div>
      </div>

    </section>
  );
}

export default Tools;