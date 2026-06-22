import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import "../../../home_pages/CoursesPageHome/CoursesPageHome.css";

const API = "http://localhost:5000";

const getCourseImage = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes("toeic")) return import.meta.env.BASE_URL + "image(17).png";
  if (lower.includes("ielts")) return import.meta.env.BASE_URL + "image(18).png";
  if (lower.includes("vstep")) return import.meta.env.BASE_URL + "image(19).png";
  return import.meta.env.BASE_URL + "image(20).png";
};

export default function CourseRegister() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast(msg);
    setToastType(type);
    setTimeout(() => setToast(""), 3000);
  };

  useEffect(() => {
    fetch(`${API}/courses`)
      .then((res) => res.json())
      .then((data) => {
        setCourses(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Error fetching courses:", err);
        setCourses([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleRegister = async (course: any) => {
    let user: any = {};
    try {
      user = JSON.parse(sessionStorage.getItem("user") || "{}") || {};
    } catch (e) {
      console.error("Error parsing user in handleRegister", e);
    }
    if (!user?.MaNguoiDung) {
      showToast("Vui lòng đăng nhập để đăng ký khóa học!", "error");
      setTimeout(() => navigate("/login"), 1500);
      return;
    }

    try {
      const svRes = await fetch(`${API}/students/by-user/${user.MaNguoiDung}`);
      const svData = await svRes.json();
      if (!svData?.MaSinhVien) {
        showToast("Tài khoản này không phải sinh viên!", "error");
        return;
      }

      const res = await fetch(`${API}/register-course`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          maKhoaHoc: course.MaKhoaHoc,
          maSinhVien: svData.MaSinhVien
        })
      });
      const data = await res.json();
      if (data.message?.includes("đã đăng ký")) {
        showToast("Bạn đã đăng ký khóa học này rồi!", "error");
      } else {
        showToast(`Đăng ký "${course.TenKhoaHoc}" thành công!`);
      }
    } catch {
      showToast("Lỗi khi đăng ký!", "error");
    }
  };

  const handleNavigateDetail = (courseId: number) => {
    navigate(`/coursehome/${courseId}`);
  };

  return (
    <div className="courses-page-wrapper" style={{ minHeight: 'auto', padding: '0 0 40px 0' }}>
      <div className="courses-container" style={{ maxWidth: '1000px', margin: '0 auto' }}>

        {/* Breadcrumb ẩn văn bản giữ khoảng trống */}
        <nav className="courses-breadcrumb" style={{ visibility: 'hidden' }}>
          <Link to="/profile">Trang chủ</Link>
          <span className="sep">›</span>
          <span className="active">Các khóa học FLIC</span>
        </nav>

        <h1 className="courses-title">CÁC KHÓA HỌC HIỆN TẠI CỦA FLIC</h1>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>Đang tải danh sách khóa học...</div>
        ) : courses.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>Hiện chưa có khóa học nào.</div>
        ) : (
          <div className="courses-list-layout">
            {courses.map((course) => (
              <div className="course-item-container" key={course.MaKhoaHoc}>
                <div className="course-item">
                  <img src={getCourseImage(course.TenKhoaHoc)} alt={course.TenKhoaHoc} />

                  <div className="course-content">
                    <h2>{course.TenKhoaHoc}</h2>
                    <p>{course.MoTa || "Chưa có mô tả chi tiết cho khóa học này."}</p>

                    <div className="course-buttons">
                      <span className="btn-xem-them" onClick={() => handleNavigateDetail(course.MaKhoaHoc)}>
                        Xem Thêm &rarr;
                      </span>
                      <button onClick={() => handleRegister(course)}>
                        Đăng ký khóa học
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 28, right: 28, zIndex: 9999,
          background: toastType === "success" ? "#2e7d32" : "#c62828",
          color: "#fff", padding: "14px 22px", borderRadius: 12,
          fontSize: 14, fontWeight: 500, boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
          display: "flex", alignItems: "center", gap: 8
        }}>
          {toastType === "success" ? "✓" : "✕"} {toast}
        </div>
      )}
    </div>
  );
}
