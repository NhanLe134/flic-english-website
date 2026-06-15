import NavbarAuto from "../../components/NavbarAuto";
import Footer from "../../components/Footer";
import { FiCpu } from "react-icons/fi";
import "./HocThu.css";

const HocThu = () => {
  return (
    <>
      <NavbarAuto />
      <div className="hoc-thu-container">
        <div className="hoc-thu-card">
          <FiCpu className="hoc-thu-icon" />
          <h1>HỌC THỬ</h1>
          <p className="status-text">Đang triển khai</p>
          <p className="sub-text">Tính năng này đang được phát triển. Vui lòng quay lại sau!</p>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default HocThu;
