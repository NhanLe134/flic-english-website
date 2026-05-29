import "./teachers.css";
import { FiAward, FiStar, FiBookOpen } from "react-icons/fi";

function Teachers() {
  return (
    <section className="teachers">

      <h2>GẶP GỠ GIÁO VIÊN CỦA CHÚNG TÔI</h2>
      <p className="teachers-subtitle">
        Học hỏi từ các nhà giáo dục được chứng nhận, tận tâm,
        tận tụy vì sự thành công của bạn
      </p>

      <div className="teachers-container">

        {/* Ms. Linh */}
        <div className="teacher-card">
          <div className="teacher-card-top gradient-orange">
            <div className="teacher-circle-img">
              <img src="/image.png" alt="Ms. Linh" />
            </div>
          </div>
          <div className="teacher-card-bottom">
            <h3>Ms. Linh</h3>
            <span className="teacher-role">Chuyên gia TOEIC</span>

            <div className="teacher-highlights-box">
              <div className="highlight-item">
                <FiAward className="teacher-icon" />
                <span className="highlight-text">TOEIC 990/990</span>
              </div>
              <div className="highlight-item">
                <FiStar className="teacher-icon" />
                <span className="highlight-text">5 năm kinh nghiệm</span>
              </div>
            </div>

            <div className="teacher-specialty">
              <h4>
                <FiBookOpen className="teacher-icon" /> Chuyên ngành:
              </h4>
              <ul>
                <li>Chiến lược TOEIC</li>
                <li>Kỹ năng làm bài kiểm tra</li>
                <li>Tối ưu hóa điểm số</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Mr. David */}
        <div className="teacher-card">
          <div className="teacher-card-top gradient-green">
            <div className="teacher-circle-img">
              <img src="/image.png" alt="Mr. David" />
            </div>
          </div>
          <div className="teacher-card-bottom">
            <h3>Mr. David</h3>
            <span className="teacher-role">Communication Specialist</span>

            <div className="teacher-highlights-box">
              <div className="highlight-item">
                <FiAward className="teacher-icon" />
                <span className="highlight-text">Giáo viên tiếng Anh bản ngữ</span>
              </div>
              <div className="highlight-item">
                <FiStar className="teacher-icon" />
                <span className="highlight-text">Chuyên gia về kỹ năng giao tiếp</span>
              </div>
            </div>

            <div className="teacher-specialty">
              <h4>
                <FiBookOpen className="teacher-icon" /> Chuyên ngành:
              </h4>
              <ul>
                <li>Nói lưu loát</li>
                <li>Cách phát âm</li>
                <li>Tiếng Anh thương mại</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Ms. Hương */}
        <div className="teacher-card">
          <div className="teacher-card-top gradient-red">
            <div className="teacher-circle-img">
              <img src="/image.png" alt="Ms. Hương" />
            </div>
          </div>
          <div className="teacher-card-bottom">
            <h3>Ms. Hương</h3>
            <span className="teacher-role">Chuyên gia VSTEP</span>

            <div className="teacher-highlights-box">
              <div className="highlight-item">
                <FiAward className="teacher-icon" />
                <span className="highlight-text">Chứng nhận VSTEP C1</span>
              </div>
              <div className="highlight-item">
                <FiStar className="teacher-icon" />
                <span className="highlight-text">7 năm kinh nghiệm giảng dạy</span>
              </div>
            </div>

            <div className="teacher-specialty">
              <h4>
                <FiBookOpen className="teacher-icon" /> Chuyên ngành:
              </h4>
              <ul>
                <li>Chuẩn bị VSTEP</li>
                <li>Viết học thuật</li>
                <li>Kỹ năng toàn diện</li>
              </ul>
            </div>
          </div>
        </div>

      </div>

    </section>
  );
}

export default Teachers;