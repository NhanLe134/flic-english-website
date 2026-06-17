import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavbarAuto from "../../components/NavbarAuto";
import Hero from "../../components/Hero";
import About from "../../components/About";
import Results from "../../components/Results";
import Teachers from "../../components/Teachers";
import CTASection from "../../components/CTASection";
import Footer from "../../components/Footer";

const Home = () => {
  const navigate = useNavigate();

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
      console.error("Error redirecting logged-in user on home page", e);
    }
  }, [navigate]);

  return (
    <>
      <NavbarAuto />
      <Hero />
      <About />
      <Results />
      <Teachers />
      <CTASection />
      <Footer />
    </>
  );
};

export default Home;
