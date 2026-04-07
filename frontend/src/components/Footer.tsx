import "./cta-footer.css"

export default function Footer() {
  // Ẩn footer khi đã đăng nhập
  const user = JSON.parse(sessionStorage.getItem("user") || "{}")
  if (user?.MaNguoiDung) return null

  return (
    <footer className="footer">
      <div className="footer-container">

        <div className="footer-grid">

          {/* Cột 1 */}
          <div>
            <h3>Trung tâm Ngoại ngữ - Tin học FLIC</h3>
            <p>
              Xây dựng kỹ năng tiếng Anh từ nền tảng. Đối tác đáng tin cậy
              của bạn cho thành công trong kỳ thi TOEIC, IELTS & VSTEP.
            </p>
            <div className="socials">
              <span>f</span>
              <span>▶</span>
              <span>💬</span>
            </div>
          </div>

          {/* Cột 2 */}
          <div>
            <h4>Liên kết</h4>
            <ul>
              <li>Các khóa học</li>
              <li>Lịch học</li>
              <li>Giáo viên</li>
              <li>Q&A</li>
            </ul>
          </div>

          {/* Cột 3 */}
          <div>
            <h4>Thông tin liên hệ</h4>
            <ul className="contact-info">
              <li>📍 71 Ngũ Hành Sơn, TP. Đà Nẵng</li>
              <li>📞 0901 95 16 16</li>
              <li>✉ flic@due.udn.vn</li>
            </ul>
          </div>

        </div>

        <div className="footer-bottom">
          <p>Designed ©2020 by Foreign Languages – Informatics Centre (FLIC)</p>
          <p>The University Of Danang - University Of Economics</p>
        </div>

      </div>
    </footer>
  )
}