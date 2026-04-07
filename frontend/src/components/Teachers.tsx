import "./teachers.css";

import teacher1 from "../assets/teacher1.jpg";
import teacher2 from "../assets/teacher2.jpg";
import teacher3 from "../assets/teacher3.jpg";

function Teachers() {
  return (
    <section className="teachers">

      <h2>GẶP GỠ GIÁO VIÊN CỦA CHÚNG TÔI</h2>
      <p className="teachers-subtitle">
        Học hỏi từ các nhà giáo dục được chứng nhận, tận tâm,
        tận tuỵ vì sự thành công của bạn
      </p>

      <div className="teachers-container">

        {/* Teacher 1 */}
        <div className="teacher-card orange">

          <div className="teacher-img">
            <img src={teacher1} alt="teacher" />
          </div>

          <div className="teacher-info">
            <h3>Ms. Linh</h3>
            <span>Chuyên gia TOEIC</span>

            <div className="teacher-highlight">
              <p>🏅 TOEIC 990/990</p>
              <p>⭐ 5 năm kinh nghiệm</p>
            </div>

            <div className="teacher-skill">
              <b>Chuyên ngành:</b>
              <ul>
                <li>Chiến lược TOEIC</li>
                <li>Kỹ năng làm bài kiểm tra</li>
                <li>Tối ưu hóa điểm số</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Teacher 2 */}
        <div className="teacher-card green">

          <div className="teacher-img">
            <img src={teacher2} alt="teacher" />
          </div>

          <div className="teacher-info">
            <h3>Mr. David</h3>
            <span>Communication Specialist</span>

            <div className="teacher-highlight">
              <p>🏅 Giáo viên bản ngữ</p>
              <p>⭐ Chuyên gia giao tiếp</p>
            </div>

            <div className="teacher-skill">
              <b>Chuyên ngành:</b>
              <ul>
                <li>Nói lưu loát</li>
                <li>Cách phát âm</li>
                <li>Tiếng Anh thương mại</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Teacher 3 */}
        <div className="teacher-card red">

          <div className="teacher-img">
            <img src={teacher3} alt="teacher" />
          </div>

          <div className="teacher-info">
            <h3>Ms. Hương</h3>
            <span>Chuyên gia VSTEP</span>

            <div className="teacher-highlight">
              <p>🏅 Chứng nhận VSTEP C1</p>
              <p>⭐ 7 năm kinh nghiệm</p>
            </div>

            <div className="teacher-skill">
              <b>Chuyên ngành:</b>
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