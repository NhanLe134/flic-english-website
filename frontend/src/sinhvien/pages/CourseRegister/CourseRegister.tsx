import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import "../../../home_pages/DSKhoaHoc/DSKhoaHoc.css";
import "../../../home_pages/DSKhoaHoc/DSKhoaHoc_TuongThich.css";
import Footer from "../../../components/Footer/Footer";

const API = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.startsWith("192.168.") || window.location.hostname.startsWith("172.") || window.location.hostname.startsWith("10.") ? "http://" + window.location.hostname + ":5004" : "http://14.225.192.252:5004") + "";

const getCourseImage = (title?: string, trinhDo?: string) => {
  const t = (title || "").toLowerCase();
  const td = (trinhDo || "").toLowerCase();
  if (t.includes("toeic") || td.includes("toeic")) return "/image(17).png";
  if (t.includes("vstep") || td.includes("vstep")) return "/image(19).png";
  return "/image(20).png";
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
    <>
      <div className="courses-header-banner">
        <div className="courses-banner-content">
          <h1>CHƯƠNG TRÌNH ĐÀO TẠO</h1>
          <p>Lộ trình tối ưu – Cam kết chất lượng đầu ra bằng văn bản</p>
        </div>
      </div>

      <div className="courses-page-wrapper">
        <div className="courses-container">

          {loading ? (
            <div style={{ textAlign: "center", padding: "80px 0", color: "#64748b" }}>
              Đang tải danh sách khóa học...
            </div>
          ) : courses.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0", color: "#64748b" }}>
              Hiện chưa có khóa học nào.
            </div>
          ) : (
            <div className="courses-list-layout">
              {courses.map((course) => {
                const imgPath = getCourseImage(course.TenKhoaHoc, course.TrinhDo);
                return (
                  <div className="course-item-container" key={course.MaKhoaHoc}>
                    <div className="course-item">
                      <div className="course-img-wrapper">
                        <img
                          src={course.HinhAnh ? `${API}${course.HinhAnh}` : `${import.meta.env.BASE_URL}${imgPath.substring(1)}`}
                          alt={course.TenKhoaHoc}
                        />
                        {course.TrinhDo && <span className="course-level-badge">{course.TrinhDo}</span>}
                      </div>

                      <div className="course-content">
                        <h2>{course.TenKhoaHoc}</h2>
                        <div className="course-desc-markdown">
                          <ReactMarkdown>{course.MoTa || "Khóa học chất lượng cao tại FLIC Language Center."}</ReactMarkdown>
                        </div>

                        <div className="course-buttons">
                          <button onClick={() => window.open("https://flic.due.udn.vn/ngoai_ngu/", "_blank", "noopener,noreferrer")}>
                            Đăng ký khóa học
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
