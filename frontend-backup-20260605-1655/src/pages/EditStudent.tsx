import "./editStudent.css";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";

const EditStudent = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const savedStudents = JSON.parse(localStorage.getItem("students") || "[]");

const foundStudent = savedStudents.find((s: any) => s.id === id);

const [student, setStudent] = useState<any>(
  foundStudent || {
    id: "",
    name: "",
    course: "",
    class: "",
    gender: "",
    cccd: "",
    phone: "",
    birthday: "",
  }
);
  const [showPopup, setShowPopup] = useState(false);

  const handleChange = (field: string, value: string) => {
    setStudent({ ...student, [field]: value });
  };

  return (
    <div className="layout">

      {/* ===== TOP HEADER ===== */}
      <header className="top-header">
        <img src={`${import.meta.env.BASE_URL}image.png`} alt="logo" className="logo" />
        <div className="top-avatar">👨‍🏫</div>
      </header>

      <div className="main-layout">

        {/* ===== SIDEBAR ===== */}
        <aside className="sidebar">
          <div className="teacher-row">
            <div className="avatar-small">👨‍🏫</div>
            <div>
              <h4>Mr. Linh</h4>
              <p>Senior Teacher</p>
            </div>
          </div>

          <div className="sidebar-menu">
            <div onClick={() => navigate("/quan-ly-khoa-hoc")} className="sidebar-item">
              Quản lý khóa học
            </div>

            <div onClick={() => navigate("/thong-tin-ca-nhan")} className="sidebar-item">
              Thông tin cá nhân
            </div>

            <div onClick={() => navigate("/danh-sach-hoc-vien")} className="sidebar-item active">
              Danh sách học viên
            </div>

            <div onClick={() => navigate("/quan-ly-ket-qua")} className="sidebar-item">Quản lý kết quả học tập</div>
            <div onClick={() => navigate("/cai-dat")} className="sidebar-item">Cài đặt</div>
            <div onClick={() => navigate("/")} className="sidebar-item">Đăng xuất</div>
          </div>
        </aside>

        {/* ===== CONTENT ===== */}
        <div className="content">

          <div className="header-row">
            <h1>SỬA THÔNG TIN HỌC VIÊN</h1>

            <span
              className="back-btn"
              onClick={() => navigate("/danh-sach-hoc-vien")}
            >
              ← Quay lại
            </span>
          </div>

          <div className="form-box">

            <h3>Thông tin học viên</h3>

            <label>Mã sinh viên</label>
            <input value={student.id} disabled />

            <label>Tên học viên</label>
            <input
              value={student.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />

            <label>Khóa học</label>
            <input
              value={student.course}
              onChange={(e) => handleChange("course", e.target.value)}
            />

            <label>Lớp</label>
            <input
              value={student.class}
              onChange={(e) => handleChange("class", e.target.value)}
            />

            <label>Giới tính</label>
            <input
              value={student.gender}
              onChange={(e) => handleChange("gender", e.target.value)}
            />

            <label>CCCD</label>
            <input
              value={student.cccd}
              onChange={(e) => handleChange("cccd", e.target.value)}
            />

            <label>Số điện thoại</label>
            <input
              value={student.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
            />

            <label>Ngày sinh</label>
            <input
              value={student.birthday}
              onChange={(e) => handleChange("birthday", e.target.value)}
            />

            <button
  className="save-btn"
  onClick={() => {
  const students = JSON.parse(localStorage.getItem("students") || "[]");

  const updatedStudents = students.map((s: any) =>
    s.id === student.id ? student : s
  );

  localStorage.setItem("students", JSON.stringify(updatedStudents));

  setShowPopup(true);

  setTimeout(() => {
    navigate("/danh-sach-hoc-vien");
  }, 1500);
}}
>
  Lưu
</button>

          </div>
        </div>

        {showPopup && (
  <div className="popup-overlay">
    <div className="popup-box">
      <div className="popup-icon">✓</div>
      <p>Lưu kết quả thành công</p>
    </div>
  </div>
)}
      </div>
    </div>
  );
};

export default EditStudent;