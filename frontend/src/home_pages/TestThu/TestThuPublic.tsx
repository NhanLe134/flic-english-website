import NavbarAuto from "../../components/NavbarAuto";
import Footer from "../../components/Footer";
import TestThuSV from "../../sinhvien/pages/TestThuSV";

const TestThuPublic = () => {
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
