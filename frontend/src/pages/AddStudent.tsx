import "./addStudent.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const AddStudent: React.FC = () => {
  const navigate = useNavigate();

  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    course: "",
    class: "",
    gender: "",
    cccd: "",
    phone: "",
    birthday: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = () => {

  const students = JSON.parse(localStorage.getItem("students") || "[]");

  // Tạo mã sinh viên tự tăng
  const newId =
    "B238BIL1H" +
    String(students.length + 1).padStart(2, "0");

  const newStudent = {
    id: newId,
    ...formData,
  };

  const updatedStudents = [...students, newStudent];

  localStorage.setItem("students", JSON.stringify(updatedStudents));

  setShowSuccess(true);

  setTimeout(() => {
    setShowSuccess(false);
    navigate("/danh-sach-hoc-vien");
  }, 2000);
};

  return (
    <div className="layout">

      {/* HEADER */}
      <header className="top-header">
        <img src={`${import.meta.env.BASE_URL}image.png`} alt="logo" className="logo" />
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
            <div onClick={() => navigate("/")} className="sidebar-item">Đăng xuất</div>
          </div>
        </aside>

        {/* CONTENT */}
        <div className="content">
          <div className="add-header">
            <h1>THÊM HỌC VIÊN</h1>
            <span
              onClick={() => navigate("/danh-sach-hoc-vien")}
              className="back-btn"
            >
              ← Quay lại
            </span>
          </div>

          <div className="form-card">
            <h3>Thông tin sinh viên</h3>

            <div className="form-group">
              <label>Tên sinh viên *</label>
              <input
                name="name"
                placeholder="Ví dụ: Nguyễn Văn Nam"
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Khóa học *</label>
              <input
                name="course"
                placeholder="Toeic"
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Lớp *</label>
              <input
                name="class"
                placeholder="Lớp 1"
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Giới tính *</label>
              <input
                name="gender"
                placeholder="Nam"
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>CCCD *</label>
              <input
                name="cccd"
                placeholder="0987654321"
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Số điện thoại *</label>
              <input
                name="phone"
                placeholder="0987654321"
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Ngày sinh</label>
              <input
                type="date"
                name="birthday"
                onChange={handleChange}
              />
            </div>

            <div className="save-wrapper">
              <button className="save-btn" onClick={handleSubmit}>
                Lưu
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ===== POPUP SUCCESS ===== */}
      {showSuccess && (
        <div className="success-overlay">
          <div className="success-modal">
              <span className="check-icon">✔</span>
            <p>Thêm học viên thành công</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddStudent;