import NavbarAuto from "../../components/NavbarAuto";
import Footer from "../../components/Footer";
import "./CoursesCategoryPage.css";
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

const API = "http://14.225.192.252:5000";

const categoryMeta: Record<string, { title: string; image: string; breadcrumb: string }> = {
  toeic: {
    title: "TOEIC 2 kỹ năng: nghe - đọc",
    image: "/image(17).png",
    breadcrumb: "Khóa học Luyện thi TOEIC"
  },
  ielts: {
    title: "Khóa học Luyện thi IELTS",
    image: "/image(18).png",
    breadcrumb: "Khóa học Luyện thi IELTS"
  },
  vstep: {
    title: "Khóa học Luyện thi VSTEP",
    image: "/image(19).png",
    breadcrumb: "Khóa học Luyện thi VSTEP"
  },
  general: {
    title: "Khóa học Tiếng anh tổng quát",
    image: "/image(20).png",
    breadcrumb: "Khóa học Tiếng anh tổng quát"
  }
};

const CoursesCategoryPage = () => {
  const { categoryKey } = useParams<{ categoryKey: string }>();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const meta = categoryMeta[categoryKey || "toeic"] || categoryMeta.toeic;

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast(msg);
    setToastType(type);
    setTimeout(() => setToast(""), 3000);
  };

  useEffect(() => {
    fetch(`${API}/courses/public`)
      .then(r => r.json())
      .then(data => setCourses(Array.isArray(data) ? data : []))
      .catch(() => {
        fetch(`${API}/admin/khoahoc`)
          .then(r => r.json())
          .then(data => setCourses(
            Array.isArray(data) ? data.filter((c: any) => c.TrangThai === "Đã duyệt") : []
          ))
          .catch(() => setCourses([]))
      })
      .finally(() => setLoading(false));
  }, []);

  const getFilteredCourses = () => {
    const key = categoryKey || "toeic";
    return courses.filter((c: any) => {
      if (!c) return false;
      const name = (c.TenKhoaHoc || "").toLowerCase();
      const trinhDo = (c.TrinhDo || "").toLowerCase();
      if (key === "toeic") {
        return trinhDo === "toeic" || name.includes("toeic");
      }
      if (key === "ielts") {
        return trinhDo === "ielts" || name.includes("ielts");
      }
      if (key === "vstep") {
        return trinhDo === "vstep" || name.includes("vstep");
      }
      if (key === "general") {
        return (
          trinhDo === "general" ||
          trinhDo === "a1" ||
          trinhDo === "a2" ||
          trinhDo === "b1" ||
          trinhDo === "b2" ||
          name.includes("tổng quát") ||
          name.includes("beginner") ||
          name.includes("elementary") ||
          name.includes("intermediate") ||
          name.includes("advanced") ||
          (!trinhDo.includes("toeic") && !trinhDo.includes("ielts") && !trinhDo.includes("vstep") &&
            !name.includes("toeic") && !name.includes("ielts") && !name.includes("vstep"))
        );
      }
      return false;
    });
  };

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

  const formatHocPhi = (fee: any) => {
    if (fee === null || fee === undefined || fee === "") return "Không có trong dtb";
    const num = Number(fee);
    if (isNaN(num)) return fee;
    return `${num.toLocaleString("vi-VN")} VNĐ`;
  };

  const formatThoiGian = (time: any) => {
    if (time === null || time === undefined || time === "") return "Không có trong dtb";
    return time;
  };

  const filteredCourses = getFilteredCourses();

  return (
    <>
      <NavbarAuto />

      <div className="cat-page-wrapper">
        <div className="cat-container">
          {/* Breadcrumb */}
          <nav className="cat-breadcrumb">
            <Link to="/">Trang chủ</Link>
            <span className="sep">›</span>
            <Link to="/courses">Các khóa học</Link>
            <span className="sep">›</span>
            <span className="active">{meta.breadcrumb}</span>
          </nav>

          <h1 className="cat-page-title">{meta.title}</h1>

          {loading ? (
            <div className="cat-loading">Đang tải danh sách khóa học...</div>
          ) : filteredCourses.length === 0 ? (
            <div className="cat-empty-msg">
              Hiện tại trung tâm chưa có lớp học nào đang mở tuyển sinh cho danh mục này. Vui lòng quay lại sau!
            </div>
          ) : (
            <div className="cat-grid-layout">
              {filteredCourses.map((c) => (
                <div className="cat-course-card" key={c.MaKhoaHoc}>
                  <img src={`${import.meta.env.BASE_URL}${meta.image.substring(1)}`} alt={c.TenKhoaHoc} />

                  <div className="cat-card-content">
                    <h2>{c.TenKhoaHoc}</h2>
                    <p className="cat-desc">{c.MoTa || "Không có trong dtb"}</p>

                    <div className="cat-details">
                      <div className="detail-row">
                        <span className="detail-icon">💰</span>
                        <span className="detail-label">Học phí:</span>
                        <span className="detail-value">
                          {formatHocPhi(c.HocPhi)}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-icon">⏳</span>
                        <span className="detail-label">Thời gian học:</span>
                        <span className="detail-value">
                          {formatThoiGian(c.ThoiGianHoc || c.ThoiLuong)}
                        </span>
                      </div>
                    </div>

                    <div className="cat-action-btn-row">
                      <button className="btn-cat-register" onClick={() => handleRegister(c)}>
                        Đăng ký khóa học
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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

export default CoursesCategoryPage;

