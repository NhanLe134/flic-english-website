import "./about.css";

const About = () => {
  return (
    <section className="about">
      <div className="container">

        <div className="about-left">
          <img src="/image(1).png" alt="FLIC" />
        </div>

        <div className="about-right">
          <h2>
            Trung tâm Anh ngữ <span>FLIC</span>
          </h2>

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
              <span className="stat-label">Năm kinh nghiệm</span>
            </div>
            <div className="about-stat-item">
              <span className="stat-number">500+</span>
              <span className="stat-label">Khóa học thành công</span>
            </div>
            <div className="about-stat-item">
              <span className="stat-number">98%</span>
              <span className="stat-label">Học viên hài lòng</span>
            </div>
          </div>

          <button>Về chúng tôi →</button>
        </div>

      </div>
    </section>
  );
};

export default About;