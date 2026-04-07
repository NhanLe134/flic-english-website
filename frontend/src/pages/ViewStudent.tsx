import "./viewStudent.css";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";

const ViewStudent = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [student, setStudent] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`http://localhost:5000/students/${id}`)
      .then(res => res.json())
      .then(data => setStudent(data))
      .catch(err => console.log(err));
  }, [id]);

  if (!student) return <p>Đang tải...</p>;

  return (
    <div className="vs-wrapper">

      <div className="header-row">
        <h1>XEM HỌC VIÊN</h1>
        <span className="back-btn" onClick={() => navigate("/danh-sach-hoc-vien")}>
          ← Quay lại
        </span>
      </div>

      <div className="form-box">
        <h3>Thông tin học viên</h3>

        <label>Mã sinh viên</label>
        <input value={student.MaSinhVien || "—"} disabled />

        <label>Tên học viên</label>
        <input value={student.HoTen || "—"} disabled />

        <label>Khóa học</label>
        <input value={student.TenKhoaHoc || "—"} disabled />

        <label>Lớp</label>
        <input value={student.Lop || "—"} disabled />

        <label>Giới tính</label>
        <input value={student.GioiTinh || "—"} disabled />

        <label>Email</label>
        <input value={student.Email || "—"} disabled />

        <label>Ngày sinh</label>
        <input value={student.NgaySinh ? new Date(student.NgaySinh).toLocaleDateString("vi-VN") : "—"} disabled />

      </div>

    </div>
  );
};

export default ViewStudent;