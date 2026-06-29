import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavbarAuto from "../../components/NavbarAuto";
import Hero from "../../components/Hero";
import About from "../../components/About";
import Results from "../../components/Results";
import Teachers from "../../components/Teachers";
import CTASection from "../../components/CTASection";
import Footer from "../../components/Footer";

// Import cac file CSS cua trang chu theo yeu cau thiet ke rieng biet
import "./TrangChu.css";
import "./TrangChu_TuongThich.css";

const TrangChu = () => {
  const navigate = useNavigate();

  // Kiem tra phan quyen nguoi dung va dieu huong neu da dang nhap truoc do
  useEffect(() => {
    try {
      const user = JSON.parse(sessionStorage.getItem("user") || "{}");
      if (user && user.VaiTro) {
        if (user.VaiTro === "Quản Trị Viên") {
          navigate("/admin/admin-dashboard", { replace: true });
        } else if (user.VaiTro === "Giảng Viên") {
          navigate("/quan-ly-khoa-hoc", { replace: true });
        } else if (user.VaiTro === "Quản Trị Nội Dung") {
          navigate("/QTV/khoahoc", { replace: true });
        } else if (user.VaiTro === "Học Viên") {
          navigate("/course-register", { replace: true });
        }
      }
    } catch (e) {
      console.error("Lỗi điều hướng người dùng đã đăng nhập ở Trang Chủ", e);
    }
  }, [navigate]);

  return (
    <div className="trang-chu">
      {/* Thanh dieu huong tu dong nhan dien trang thai dang nhap */}
      <NavbarAuto />
      
      {/* Phan dau trang gioi thieu kem thong so noi bat */}
      <Hero />
      
      {/* Gioi thieu ve trung tam Anh ngu FLIC */}
      <About />
      
      {/* Hinh anh ket qua hoc tap thuc te cua hoc vien */}
      <Results />
      
      {/* Doi ngu giao vien giang day tai trung tam */}
      <Teachers />
      
      {/* Keu goi dang ky hoc tap */}
      <CTASection />
      
      {/* Chan trang chua thong tin lien he */}
      <Footer />
    </div>
  );
};

export default TrangChu;
