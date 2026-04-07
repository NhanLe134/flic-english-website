import NavbarAuto from "../components/NavbarAuto";
import Footer from "../components/Footer";
import "./courseshome.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5000";

const courseImages: Record<string, string> = {
  TOEIC:   "/image(17).png",
  IELTS:   "/image(18).png",
  VSTEP:   "/image(19).png",
  General: "/image(20).png",
  "A1":    "/image(20).png",
  "A2":    "/image(20).png",
  "B1":    "/image(18).png",
  "B2":    "/image(18).png",
}

const getImage = (trinhDo: string) =>
  courseImages[trinhDo] || "/image(17).png"

const CoursesPageHome = () => {
  const navigate = useNavigate()
  const [courses, setCourses]   = useState<any[]>([])
  const [loading, setLoading]   = useState(true)
  const [toast, setToast]       = useState("")
  const [toastType, setToastType] = useState<"success" | "error">("success")

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast(msg); setToastType(type)
    setTimeout(() => setToast(""), 3000)
  }

  useEffect(() => {
    fetch(`${API}/courses/public`)
      .then(r => r.json())
      .then(data => setCourses(Array.isArray(data) ? data : []))
      .catch(() => {
        // fallback: load tất cả khóa đã duyệt
        fetch(`${API}/admin/khoahoc`)
          .then(r => r.json())
          .then(data => setCourses(
            Array.isArray(data) ? data.filter((c: any) => c.TrangThai === "Đã duyệt") : []
          ))
          .catch(() => setCourses([]))
      })
      .finally(() => setLoading(false))
  }, [])

  const handleRegister = async (course: any) => {
    const user = JSON.parse(sessionStorage.getItem("user") || "{}")
    if (!user.MaNguoiDung) {
      showToast("Vui lòng đăng nhập để đăng ký khóa học!", "error")
      setTimeout(() => navigate("/login"), 1500)
      return
    }

    // Lấy MaSinhVien từ MaNguoiDung
    try {
      const svRes = await fetch(`${API}/students/by-user/${user.MaNguoiDung}`)
      const svData = await svRes.json()
      if (!svData?.MaSinhVien) {
        showToast("Tài khoản này không phải sinh viên!", "error"); return
      }

      const res = await fetch(`${API}/register-course`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          maKhoaHoc: course.MaKhoaHoc,
          maSinhVien: svData.MaSinhVien
        })
      })
      const data = await res.json()
      if (data.message?.includes("đã đăng ký")) {
        showToast("Bạn đã đăng ký khóa học này rồi!", "error")
      } else {
        showToast(`Đăng ký "${course.TenKhoaHoc}" thành công!`)
      }
    } catch {
      showToast("Lỗi khi đăng ký!", "error")
    }
  }

  return (
    <>
      <NavbarAuto />

      <div className="courses-container">
        <h1 className="courses-title">CÁC KHÓA HỌC</h1>

        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "#999", fontSize: 16 }}>
            Đang tải khóa học...
          </div>
        ) : courses.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, color: "#999" }}>
            Chưa có khóa học nào.
          </div>
        ) : (
          courses.map((course: any) => (
            <div className="course-item" key={course.MaKhoaHoc}>
              <img src={getImage(course.TrinhDo)} alt={course.TenKhoaHoc} />

              <div className="course-content">
                <h2>{course.TenKhoaHoc}</h2>

                {/* Badge trình độ */}
                <div style={{ marginBottom: 10 }}>
                  <span style={{
                    background: "#fff3e0", color: "#e87722",
                    padding: "3px 12px", borderRadius: 20,
                    fontSize: 12, fontWeight: 600
                  }}>
                    {course.TrinhDo}
                  </span>
                  {course.HoTen && (
                    <span style={{
                      marginLeft: 8, background: "#e8f5e9", color: "#2e7d32",
                      padding: "3px 12px", borderRadius: 20,
                      fontSize: 12, fontWeight: 600
                    }}>
                      GV: {course.HoTen}
                    </span>
                  )}
                </div>

                <p>{course.MoTa || "Khóa học chất lượng cao tại FLIC Language Center."}</p>

                <div className="course-buttons">
                  <a href={`/coursehome/${course.MaKhoaHoc}`}>Xem Thêm →</a>
                  <button onClick={() => handleRegister(course)}>
                    Đăng ký khóa học
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Footer />

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
    </>
  );
};

export default CoursesPageHome;