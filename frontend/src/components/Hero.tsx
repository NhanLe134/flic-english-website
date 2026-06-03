import "./hero.css"
import { useNavigate } from "react-router-dom"

const Hero = () => {
  const navigate = useNavigate()

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
            Học thông minh hơn với các bài học được cá nhân hóa và tiến bộ thực sự.
            Tham gia cùng hơn 10.000 học viên thành công đã thay đổi kỹ năng tiếng Anh của mình.
          </p>

          <div className="hero-stats">
            <div>
              <h3>10,000+</h3>
              <span>Người học thành công</span>
            </div>
            <div>
              <h3>15+</h3>
              <span>Giáo viên chuyên gia</span>
            </div>
            <div>
              <h3>98%</h3>
              <span>Tỷ lệ thành công</span>
            </div>
          </div>

          <div className="hero-buttons">
            <button className="btn-login" onClick={() => navigate("/login")}>
              Đăng nhập
            </button>
            <button className="btn-register" onClick={() => navigate("/register")}>
              Đăng ký
            </button>
          </div>
        </div>

        <div className="hero-right">
          <img src={`${import.meta.env.BASE_URL}image.png`} alt="FLIC" />
        </div>
      </div>
    </section>
  )
}

export default Hero