import "./about.css";
import { useNavigate } from "react-router-dom";

const About = () => {
  const navigate = useNavigate();

  return (
    <section className="about">
      <div className="about-inner-container">

        <div className="about-left">
          <div className="about-left-card">
            <div className="card-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="cap-svg">
                <path d="M12 2L1 8l11 6 11-6-11-6z" fill="#1e293b" />
                <path d="M5 11.5v3.5c0 3.3 3.1 6 7 6s7-2.7 7-6v-3.5l-7 3.8-7-3.8z" fill="#1e293b" />
                <path d="M19 9v7.5c0 .8.7 1.5 1.5 1.5s1.5-.7 1.5-1.5V9l-3 0z" fill="#F95800" />
              </svg>
            </div>
            <h3 className="card-title">Expert-Led Learning</h3>
            <p className="card-subtitle">Personalized for Your Success</p>
          </div>
        </div>

        <div className="about-right">
          <h2>Về FLIC</h2>
          <div className="about-title-underline"></div>

          <p>
            FLIC là trung tâm Anh ngữ chuyên đào tạo tiếng Anh cho học viên và người đi làm,
            hướng đến việc xây dựng nền tảng vững chắc và phát triển kỹ năng sử dụng tiếng Anh
            một cách thực tế. Trung tâm áp dụng mô hình học tập cá nhân hóa, tập trung vào
            khả năng hiểu bài, giao tiếp và ứng dụng tiếng Anh trong học tập, công việc.
            Đồng thời, FLIC hỗ trợ học viên luyện thi các chứng chỉ như TOEIC, IELTS & VSTEP
            trong môi trường học tập thân thiện, hiệu quả.
          </p>

          <div className="about-stats">
            <div className="about-stat-item">
              <span className="stat-number">7+</span>
              <span className="stat-label">năm kinh nghiệm</span>
            </div>
            <div className="about-stat-item">
              <span className="stat-number">500</span>
              <span className="stat-label">khóa học thành công</span>
            </div>
          </div>

          <button className="btn-about" onClick={() => navigate("/about")}>
            VỀ CHÚNG TÔI &rarr;
          </button>
        </div>

      </div>
    </section>
  );
};

export default About;