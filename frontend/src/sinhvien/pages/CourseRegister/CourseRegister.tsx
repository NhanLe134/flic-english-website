import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import "../../../home_pages/DSKhoaHoc/DSKhoaHoc.css";

const API = "http://localhost:5000";

const getCourseImage = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes("toeic")) return import.meta.env.BASE_URL + "image(17).png";
  if (lower.includes("ielts")) return import.meta.env.BASE_URL + "image(18).png";
  if (lower.includes("vstep")) return import.meta.env.BASE_URL + "image(19).png";
  return import.meta.env.BASE_URL + "image(20).png";
};

export default function CourseRegister() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
                      <button onClick={() => window.open("https://flic.due.udn.vn/ngoai_ngu/", "_blank")}>
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
    </div>
  );
}
