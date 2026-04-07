import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { students } from "../data/students";
import "./ketQuaHocTapHocVien.css";

const SuaKetQuaHocTapHocVien = () => {

  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const student = students.find((s) => s.id === id);
  const [test1, setTest1] = useState(student?.test1 || 0);
const [test2, setTest2] = useState(student?.test2 || 0);
const [midterm, setMidterm] = useState(student?.midterm || 0);
  const [showPopup, setShowPopup] = useState(false);

useEffect(() => {
  if (showPopup) {
    setTimeout(() => {
      navigate(-1); // quay lại trang trước
    }, 1500); // 1.5 giây
  }
}, [showPopup, navigate]);

  return (
    <div className="layout">

      {/* HEADER */}
      <header className="top-header">
        <img src="/image.png" alt="logo" className="logo" />
        <div className="top-avatar">👨‍🏫</div>
      </header>

      <div className="main-layout">

        {/* SIDEBAR */}
        <aside className="sidebar">

          <div className="teacher-row">
            <div className="avatar-small">👨‍🏫</div>
            <div>
              <h4>Mr. Linh</h4>
              <p>Senior Teacher</p>
            </div>
          </div>

          <div className="sidebar-menu">

            <div
              onClick={() => navigate("/quan-ly-khoa-hoc")}
              className="sidebar-item"
            >
              Quản lý khóa học
            </div>

            <div
              onClick={() => navigate("/thong-tin-ca-nhan")}
              className="sidebar-item"
            >
              Thông tin cá nhân
            </div>

            <div
              onClick={() => navigate("/danh-sach-hoc-vien")}
              className="sidebar-item"
            >
              Danh sách học viên
            </div>

            <div onClick={() => navigate("/quan-ly-ket-qua")} className="sidebar-item active">
              Quản lý kết quả học tập
            </div>

            <div onClick={() => navigate("/cai-dat")} className="sidebar-item">Cài đặt</div>
            <div onClick={() => navigate("/")} className="sidebar-item">Đăng xuất</div>

          </div>

        </aside>

        {/* CONTENT */}
        <div className="content">

          <div className="ketqua-page-header">
            <h2>Lesson 1</h2>
            <h3>Lớp 1 - Khóa B1</h3>
            <h1>Sửa kết quả học tập</h1>
          </div>

          <button
            className="back-btn"
            onClick={() => navigate(-1)}
          >
            ←
          </button>

          <div className="ketqua-card">

            {/* STUDENT */}
            <div className="student-header">

              <div className="avatar">👤</div>

              <div>
                <h3>{student?.name}</h3>
                <span className="badge">Đang học</span>
              </div>

            </div>

            <hr />

            {/* KẾT QUẢ */}
            <h3 className="section-title">Kết quả học tập</h3>

            <div className="ketqua-stats">

              <div className="stat-box">
                <p>Điểm trung bình</p>
                <h2 className="avg-score">90</h2>
              </div>

              <div className="stat-box">
                <p>Chuyên cần</p>
                <h2 className="attend-score">98%</h2>
              </div>

            </div>

            <hr />

            {/* DANH SÁCH BÀI */}
            <h3 className="section-title">
              Điểm các bài kiểm tra
            </h3>

            <div className="test-list">

              <div className="test-item">
                <div>
                  <div className="test-name">
                    Bài kiểm tra 1
                  </div>
                  <div className="test-date">
                    15/03/2024
                  </div>
                </div>

                <input
  className="score-input"
  value={test1}
  onChange={(e) => setTest1(Number(e.target.value))}
/>
              </div>

              <div className="test-item">
                <div>
                  <div className="test-name">
                    Bài kiểm tra 2
                  </div>
                  <div className="test-date">
                    22/03/2024
                  </div>
                </div>

                <input
  className="score-input"
  value={test2}
  onChange={(e) => setTest2(Number(e.target.value))}
/>
              </div>

              <div className="test-item">
                <div>
                  <div className="test-name">
                    Kiểm tra giữa kỳ
                  </div>
                  <div className="test-date">
                    05/04/2024
                  </div>
                </div>

                <input
  className="score-input"
  value={midterm}
  onChange={(e) => setMidterm(Number(e.target.value))}
/>
              </div>

            </div>

            <button className="save-btn" 
                onClick={() => {

  const index = students.findIndex((s) => s.id === id);

  const finalScore = Math.round((test1 + test2 + midterm) / 3);

  students[index] = {
    ...students[index],
    test1,
    test2,
    midterm,
    score: finalScore
  };

  setShowPopup(true);

}}>
                Lưu Kết quả học tập
            </button>

          </div>

        </div>
        {showPopup && (
  <div className="popup-overlay">
    <div className="popup-box">

      <div className="popup-icon">✔</div>

      <p>Lưu kết quả thành công</p>

    </div>
  </div>
)}
      </div>

    </div>
  );
};

export default SuaKetQuaHocTapHocVien;