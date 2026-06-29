import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavbarAuto from "../../components/NavbarAuto";
import Footer from "../../components/Footer";
import TestThuSV from "../../sinhvien/pages/TestThuSV";

const TestThuPublic = () => {
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const user = JSON.parse(sessionStorage.getItem("user") || localStorage.getItem("user") || "{}");
      if (user && user.VaiTro === "Học Viên") {
        navigate("/test-thu-sv", { replace: true });
      }
    } catch (e) {
      console.error("Error checking user in TestThuPublic", e);
    }
  }, [navigate]);

  return (
    <>
      <NavbarAuto />
      <div style={{ padding: "40px 20px", minHeight: "80vh", background: "#f8fafc" }}>
        <TestThuSV />
      </div>
      <Footer />
    </>
  );
};

export default TestThuPublic;
