import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavTuDong from "../../components/NavTuDong/NavTuDong";
import Footer from "../../components/Footer/Footer";
import HocThuSV from "../../sinhvien/pages/HocThuSV";

const HocThu = () => {
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const user = JSON.parse(sessionStorage.getItem("user") || localStorage.getItem("user") || "{}");
      if (user && user.VaiTro === "Học Viên") {
        navigate("/hoc-thu-sv", { replace: true });
      }
    } catch (e) {
      console.error("Error checking user in HocThu", e);
    }
  }, [navigate]);

  return (
    <>
      <NavTuDong />
      <div style={{ padding: "0", minHeight: "80vh", background: "#f8fafc" }}>
        <HocThuSV />
      </div>
      <Footer />
    </>
  );
};

export default HocThu;
