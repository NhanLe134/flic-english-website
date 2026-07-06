import NavTuDong from "../../components/NavTuDong/NavTuDong";
import Footer from "../../components/Footer/Footer";
import "./DSKhoaHoc.css";
import "./DSKhoaHoc_TuongThich.css"; // Import file css tuong thich rieng
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://14.225.192.252:5000";

const getCourseImage = (title?: string, trinhDo?: string) => {
  const t = (title || "").toLowerCase();
  const td = (trinhDo || "").toLowerCase();
  if (t.includes("toeic") || td.includes("toeic")) return "/image(17).png";
  if (t.includes("ielts") || td.includes("ielts")) return "/image(18).png";
  if (t.includes("vstep") || td.includes("vstep")) return "/image(19).png";
  return "/image(20).png";
};

const DSKhoaHoc = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API}/courses`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCourses(data);
        }
      })
      .catch((err) => console.error("Error fetching courses:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <NavTuDong />

      <div className="courses-page-wrapper">
        <div className="courses-container">
          <h1 className="courses-title">CÁC KHÓA HỌC</h1>

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
                      <img 
                        src={`${import.meta.env.BASE_URL}${imgPath.substring(1)}`} 
                        alt={course.TenKhoaHoc} 
                      />

                      <div className="course-content">
                        <h2>{course.TenKhoaHoc}</h2>
                        <p>{course.MoTa || "Khóa học chất lượng cao tại FLIC Language Center."}</p>

                        <div className="course-buttons">
                          <button onClick={() => navigate(`/coursehome/${course.MaKhoaHoc}`)}>
                            Xem chi tiết & Đăng ký
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
};

export default DSKhoaHoc;
