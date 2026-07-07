import "./Footer.css";
import { FiFacebook, FiYoutube, FiMessageSquare, FiMapPin, FiPhone, FiMail } from "react-icons/fi";

export default function Footer() {
  // Ẩn footer khi đã đăng nhập
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  if (user?.MaNguoiDung) return null;

  return (
    <footer className="footer">
      <div className="footer-container">

        <div className="footer-grid">

          {/* Cột 1 */}
          <div>
            <h3>TRUNG TÂM NGOẠI NGỮ – TIN HỌC FLIC</h3>
            <p>
              Xây dựng kỹ năng tiếng Anh từ nền tảng. Đối tác đáng tin cậy
              của bạn cho thành công trong kỳ thi TOEIC, IELTS & VSTEP.
            </p>
            <div className="socials">
              <a href="https://www.facebook.com/FLIC.DUE.UDN.VN" target="_blank" rel="noopener noreferrer" className="social-link">
                <FiFacebook />
              </a>
              <a href="https://www.youtube.com/@FLIC-DUE" target="_blank" rel="noopener noreferrer" className="social-link">
                <FiYoutube />
              </a>
              <a href="https://zalo.me/flicdue" target="_blank" rel="noopener noreferrer" className="social-link">
                <FiMessageSquare />
              </a>
            </div>
          </div>
          
          {/* Cột 2 */}
          <div>
            <h4>THÔNG TIN LIÊN HỆ</h4>
            <ul className="contact-info">
              <li>
                <FiMapPin className="contact-icon" />
                <span>71 Ngũ Hành Sơn, TP. Đà Nẵng</span>
              </li>
              <li>
                <FiPhone className="contact-icon" />
                <span>0901 95 16 16</span>
              </li>
              <li>
                <FiMail className="contact-icon" />
                <a href="mailto:flic@due.udn.vn">flic@due.udn.vn</a>
              </li>
            </ul>
          </div>

        </div>

        <div className="footer-bottom">
          <p>Designed &copy;2020 by Foreign Languages – Informatics Centre (FLIC)</p>
          <p>The University Of Danang - University Of Economics</p>
        </div>

      </div>
    </footer>
  );
}
