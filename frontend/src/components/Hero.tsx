import "./hero.css"

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-container">
        <div className="hero-left">
          <span className="hero-subtitle">
            TOEIC, IELTS & VSTEP – bắt đầu từ gốc
          </span>

          <h1>
            Nâng điểm TOEIC,
            IELTS & VSTEP từ
            gốc – Học vững
            nền, tiến xa hơn!
          </h1>

          <p>
            Học tiếng Anh bài bản với lộ trình rõ ràng,
            giúp bạn đạt mục tiêu nhanh chóng.
          </p>

          <div className="hero-stats">
            <div>
              <h3>10,000+</h3>
              <span>Học viên tin tưởng</span>
            </div>
            <div>
              <h3>15+</h3>
              <span>Giảng viên kinh nghiệm</span>
            </div>
            <div>
              <h3>98%</h3>
              <span>Tỷ lệ đạt mục tiêu</span>
            </div>
          </div>
        </div>

        <div className="hero-right">
          <img src="/image.png" alt="FLIC" />
        </div>
      </div>
    </section>
  )
}

export default Hero