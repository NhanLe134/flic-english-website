import "./courseDetailhome.css";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import NavbarAuto from "../components/NavbarAuto";
import Footer from "../components/Footer";

const API = "http://localhost:5000";

const courseImages: Record<string, string> = {
  TOEIC:   "/image(17).png",
  IELTS:   "/image(18).png",
  VSTEP:   "/image(19).png",
  General: "/image(20).png",
}
const getImage = (trinhDo: string) => courseImages[trinhDo] || "/image(17).png"

function CourseDetail() {
  const navigate  = useNavigate()
  const { id }    = useParams()
  const [course, setCourse]       = useState<any>(null)
  const [classes, setClasses]     = useState<any[]>([])
  const [loading, setLoading]     = useState(true)
  const [toast, setToast]         = useState("")
  const [toastType, setToastType] = useState<"success"|"error">("success")

  const showToast = (msg: string, type: "success"|"error" = "success") => {
    setToast(msg); setToastType(type)
    setTimeout(() => setToast(""), 3000)
  }

  useEffect(() => {
    if (!id) return
    setLoading(true)
    Promise.all([
      fetch(`${API}/courses/${id}/detail`).then(r => r.json()),
      fetch(`${API}/courses/${id}/details`).then(r => r.json()),
    ])
      .then(([courseData, classData]) => {
        setCourse(courseData)
        setClasses(Array.isArray(classData) ? classData : [])
      })
      .catch(() => setCourse(null))
      .finally(() => setLoading(false))
  }, [id])

  const handleRegister = async () => {
    const user = JSON.parse(sessionStorage.getItem("user") || "{}")

    // Chưa đăng nhập → chuyển sang trang đăng ký tài khoản
    if (!user.MaNguoiDung) {
      navigate("/course-register")
      return
    }

    // Đã đăng nhập → kiểm tra có phải sinh viên không
    try {
      const svRes = await fetch(`${API}/students/by-user/${user.MaNguoiDung}`)
      const svData = await svRes.json()

      if (!svData?.MaSinhVien) {
        showToast("Vui lòng đăng nhập bằng tài khoản sinh viên!", "error")
        sessionStorage.removeItem("user")
        setTimeout(() => navigate("/login"), 1500)
        return
      }

      const res = await fetch(`${API}/register-course`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maKhoaHoc: id, maSinhVien: svData.MaSinhVien })
      })
      const data = await res.json()
      if (data.message?.includes("đã đăng ký")) {
        showToast("Bạn đã đăng ký khóa học này rồi!", "error")
      } else {
        showToast("Đăng ký thành công! Chờ ghi danh vào lớp.")
      }
    } catch {
      showToast("Lỗi khi đăng ký!", "error")
    }
  }

  if (loading) return (
    <><NavbarAuto /><div style={{ textAlign:"center", padding:80, color:"#999" }}>Đang tải...</div><Footer /></>
  )
  if (!course) return (
    <><NavbarAuto /><div style={{ textAlign:"center", padding:80, color:"#999" }}>Không tìm thấy khóa học.</div><Footer /></>
  )

  return (
    <>
      <NavbarAuto />
      <div className="toeic-page">
        <nav className="toeic-breadcrumb">
          <Link to="/">Trang chủ</Link>
          <span className="sep">›</span>
          <Link to="/courses">Các khóa học</Link>
          <span className="sep">›</span>
          <span className="active">{course.TenKhoaHoc}</span>
        </nav>

        <div className="toeic-container">

          {/* Thông tin khóa học */}
          <section className="toeic-group">
            <div className="toeic-card">
              <img src={getImage(course.TrinhDo)} alt={course.TenKhoaHoc} />
              <div className="toeic-card-content">
                <h3>{course.TenKhoaHoc}</h3>
                <div style={{ display:"flex", gap:8, marginBottom:12, flexWrap:"wrap" }}>
                  <span style={{ background:"#fff3e0", color:"#e87722", padding:"3px 12px", borderRadius:20, fontSize:12, fontWeight:600 }}>
                    {course.TrinhDo}
                  </span>
                  {course.HoTen && (
                    <span style={{ background:"#e8f5e9", color:"#2e7d32", padding:"3px 12px", borderRadius:20, fontSize:12, fontWeight:600 }}>
                      GV: {course.HoTen}
                    </span>
                  )}
                </div>
                <p>{course.MoTa || "Khóa học chất lượng cao tại FLIC Language Center."}</p>
                <button className="toeic-register-btn" onClick={handleRegister}>
                  Đăng ký khóa học
                </button>
              </div>
            </div>
          </section>

          {/* Danh sách lớp */}
          {classes.length > 0 && (
            <section className="toeic-group">
              <h2 className="toeic-group-title">Các lớp học</h2>
              {classes.map((cls: any) => (
                <div className="toeic-card" key={cls.MaLop} style={{ alignItems:"flex-start" }}>
                  <div className="toeic-card-content" style={{ flex:1 }}>
                    <h3>{cls.TenLop}</h3>
                    {cls.MoTa && <p>{cls.MoTa}</p>}
                    <div className="toeic-meta">
                      {cls.HocPhi && (
                        <div className="toeic-meta-item">
                          <span className="toeic-meta-icon">💰</span>
                          Học phí: <strong>{Number(cls.HocPhi).toLocaleString("vi-VN")} VNĐ</strong>
                        </div>
                      )}
                      {cls.ThoiLuong && (
                        <div className="toeic-meta-item">
                          <span className="toeic-meta-icon">🕐</span>
                          Thời gian: <strong>{cls.ThoiLuong}</strong>
                        </div>
                      )}
                      {cls.TrangThai && (
                        <div className="toeic-meta-item">
                          <span className="toeic-meta-icon">📌</span>
                          Trạng thái:{" "}
                          <strong style={{ color: cls.TrangThai === "Đang mở" ? "#2e7d32" : "#e87722" }}>
                            {cls.TrangThai}
                          </strong>
                        </div>
                      )}
                    </div>
                    <button className="toeic-register-btn" onClick={handleRegister}>
                      Đăng ký lớp này
                    </button>
                  </div>
                </div>
              ))}
            </section>
          )}

        </div>
      </div>
      <Footer />

      {toast && (
        <div style={{
          position:"fixed", bottom:28, right:28, zIndex:9999,
          background: toastType === "success" ? "#2e7d32" : "#c62828",
          color:"#fff", padding:"14px 22px", borderRadius:12,
          fontSize:14, fontWeight:500, boxShadow:"0 4px 16px rgba(0,0,0,0.2)",
          display:"flex", alignItems:"center", gap:8
        }}>
          {toastType === "success" ? "✓" : "✕"} {toast}
        </div>
      )}
    </>
  )
}

export default CourseDetail;