import "./ViewStudent.css";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { FiArrowLeft } from "react-icons/fi";

const ViewStudent = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [student, setStudent] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (!id) return;

    const trimmedId = id.trim();
    // Fetch student data
    const fetchStudent = fetch(`http://localhost:5000/students/${trimmedId}`).then(res => res.json());
    // Fetch courses data
    const fetchCourses = fetch("http://localhost:5000/khoahoc").then(res => res.json());

    Promise.all([fetchStudent, fetchCourses])
      .then(([studentData, coursesData]) => {
        setStudent(studentData);
        setCourses(coursesData || []);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (field: string, value: any) => {
    setStudent((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student.HoTen?.trim()) {
      alert("Vui lòng nhập tên học viên");
      return;
    }

    try {
      setSaving(true);
      const trimmedId = (id || "").trim();
      const res = await fetch(`http://localhost:5000/students/${trimmedId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          HoTen: student.HoTen,
          Email: student.Email,
          GioiTinh: student.GioiTinh,
          NgaySinh: student.NgaySinh,
          Lop: student.Lop,
          MSSV: student.MSSV,
          MaKhoaHoc: student.MaKhoaHoc
        })
      });

      if (res.ok) {
        setShowPopup(true);
        setTimeout(() => {
          setShowPopup(false);
          navigate("/danh-sach-hoc-vien");
        }, 1500);
      } else {
        alert("Lưu thông tin thất bại!");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi khi kết nối đến server");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ textAlign: "center", padding: "50px", color: "#666" }}>Đang tải dữ liệu học viên...</div>;
  if (!student) return <div style={{ textAlign: "center", padding: "50px", color: "#666" }}>Không tìm thấy học viên!</div>;

  // Format date for type="date"
  const formattedBirthDate = student.NgaySinh ? student.NgaySinh.split("T")[0] : "";

  return (
    <div className="vs-wrapper">
      <div className="header-row">
        <span className="back-btn" onClick={() => navigate("/danh-sach-hoc-vien")}>
          <FiArrowLeft size={16} style={{ marginRight: 6, verticalAlign: "middle" }} />
          Quay lại
        </span>
        <h1>Chi tiết học viên</h1>
      </div>

      <form className="form-box" onSubmit={handleSave}>
        <h3>Chỉnh sửa thông tin học viên</h3>

        <div className="form-grid">
          <div className="form-group">
            <label>Mã học viên (Hệ thống)</label>
            <input value={student.MaSinhVien || ""} disabled className="input-disabled" />
          </div>

          <div className="form-group">
            <label>Mã số sinh viên (Trường)</label>
            <input
              value={student.MSSV || ""}
              onChange={(e) => handleChange("MSSV", e.target.value)}
              placeholder="Nhập mã số sinh viên (MSSV)"
            />
          </div>

          <div className="form-group">
            <label>Tên học viên *</label>
            <input
              value={student.HoTen || ""}
              onChange={(e) => handleChange("HoTen", e.target.value)}
              placeholder="Nhập tên học viên"
            />
          </div>

          <div className="form-group">
            <label>Khóa học</label>
            <select
              value={student.MaKhoaHoc || ""}
              onChange={(e) => handleChange("MaKhoaHoc", e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">Chọn khóa học</option>
              {courses.map((c) => (
                <option key={c.MaKhoaHoc} value={c.MaKhoaHoc}>
                  {c.TenKhoaHoc}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Lớp</label>
            <input
              value={student.Lop || ""}
              onChange={(e) => handleChange("Lop", e.target.value)}
              placeholder="Ví dụ: TOEIC-01"
            />
          </div>

          <div className="form-group">
            <label>Giới tính</label>
            <select
              value={student.GioiTinh || ""}
              onChange={(e) => handleChange("GioiTinh", e.target.value)}
            >
              <option value="">Chọn giới tính</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={student.Email || ""}
              onChange={(e) => handleChange("Email", e.target.value)}
              placeholder="example@flic.edu.vn"
            />
          </div>

          <div className="form-group">
            <label>Ngày sinh</label>
            <input
              type="date"
              value={formattedBirthDate}
              onChange={(e) => handleChange("NgaySinh", e.target.value)}
            />
          </div>
        </div>

        <button type="submit" className="save-btn" disabled={saving}>
          {saving ? "Đang lưu..." : "Lưu thông tin"}
        </button>
      </form>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <div className="popup-icon">✓</div>
            <p>Lưu kết quả thành công</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewStudent;

