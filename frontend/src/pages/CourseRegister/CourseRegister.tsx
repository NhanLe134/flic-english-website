import "./CourseRegister.css";
import Navbar from "../../components/Navbar";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";


const API = "http://localhost:5000";


type DoiTuong = "sinhvien" | "khac";


function CourseRegister() {
  const navigate = useNavigate();


  const [doiTuong, setDoiTuong]   = useState<DoiTuong>("sinhvien");
  const [truong, setTruong]       = useState("DKT");
  const [tenTruong, setTenTruong] = useState("");
  const [loading, setLoading]     = useState(false);
  const [toast, setToast]         = useState("");
  const [toastType, setToastType] = useState<"success"|"error">("success");
  const [showPassword, setShowPassword] = useState(false);


  const [form, setForm] = useState({
    hoTen: "", mssv: "", ngaySinh: "", soDienThoai: "",
    email: "", ngheNghiep: "", diaChi: "", ghiChu: "",
    matKhau: "123456", gioiTinh: "Nam",
  });


  const showToast = (msg: string, type: "success"|"error" = "success") => {
    setToast(msg); setToastType(type);
    setTimeout(() => setToast(""), 3000);
  };


  const upd = (field: string, val: string) => setForm(p => ({ ...p, [field]: val }));


  const handleSubmit = async () => {
    if (!form.hoTen.trim())       { showToast("Vui lòng nhập họ và tên!", "error"); return; }
    if (!form.email.trim())       { showToast("Vui lòng nhập email!", "error"); return; }
    if (!form.soDienThoai.trim()) { showToast("Vui lòng nhập số điện thoại!", "error"); return; }
    if (doiTuong === "sinhvien" && !form.mssv.trim()) {
      showToast("Vui lòng nhập mã số sinh viên!", "error"); return;
    }


    setLoading(true);
    try {
      const registerRes = await fetch(`${API}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.email, password: form.matKhau,
          name: form.hoTen, email: form.email,
          ngaySinh: form.ngaySinh || null, gioiTinh: form.gioiTinh || null,
        })
      });
      const registerData = await registerRes.json();
      if (!registerRes.ok) { showToast(registerData.message || "Email đã được sử dụng!", "error"); setLoading(false); return; }


      const loginRes = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: form.email, password: form.matKhau })
      });
      const userData = await loginRes.json();
      if (!loginRes.ok || !userData.MaNguoiDung) { showToast("Lỗi khi tạo tài khoản!", "error"); setLoading(false); return; }


      if (doiTuong === "sinhvien") {
        const svRes = await fetch(`${API}/register-student`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            MaNguoiDung: userData.MaNguoiDung,
            MaSinhVien: form.mssv,
            Lop: truong === "DKT" ? "Trường Đại học Kinh tế Đà Nẵng" : tenTruong,
          })
        });
        const svData = await svRes.json();
        if (!svRes.ok) { showToast(svData.message || "Lỗi tạo sinh viên!", "error"); setLoading(false); return; }


        const pending = localStorage.getItem("pendingCourse");
        if (pending) {
          try {
            const { maKhoaHoc } = JSON.parse(pending);
            await fetch(`${API}/register-course`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ maKhoaHoc, maSinhVien: form.mssv })
            });
            localStorage.removeItem("pendingCourse");
          } catch {}
        }
      }


      showToast("Tạo tài khoản thành công!");
      setTimeout(() => navigate("/login"), 1000);
    } catch {
      showToast("Lỗi kết nối server!", "error");
    } finally {
      setLoading(false);
    }
  };


  const PasswordField = ({ label }: { label: string }) => (
    <div className="cr-field">
      <label>{label} <span className="cr-required">*</span></label>
      <div className="cr-password-wrap">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Nhập mật khẩu"
          value={form.matKhau}
          onChange={e => upd("matKhau", e.target.value)}
        />
        <button
          type="button"
          className="cr-eye-btn"
          onClick={() => setShowPassword(!showPassword)}
          tabIndex={-1}
        >
          {showPassword ? "🙈" : "👁"}
        </button>
      </div>
    </div>
  );


  return (
    <>
      <Navbar />


      <div className="cr-page">
        <nav className="cr-breadcrumb">
          <Link to="/">Trang chủ</Link>
          <span className="sep">»</span>
          <Link to="/courses">Các khóa học</Link>
          <span className="sep">»</span>
          <span className="active">Đăng ký tài khoản</span>
        </nav>


        <h1 className="cr-title">THÔNG TIN ĐĂNG KÝ</h1>


        <div className="cr-card">
          <div className="cr-card-header">
            <h2>Tạo tài khoản học viên</h2>
            <p style={{ fontSize: 14, color: "#888", margin: "4px 0 0" }}>
              Điền thông tin để tạo tài khoản và đăng ký khóa học
            </p>
          </div>


          <div className="cr-type-selector">
            <p className="cr-type-label">Bạn là: <span className="cr-required">*</span></p>
            <div className="cr-type-tabs">
              <button className={`cr-type-tab ${doiTuong === "sinhvien" ? "active" : ""}`} onClick={() => setDoiTuong("sinhvien")}>
                🎓 Sinh viên
              </button>
              <button className={`cr-type-tab ${doiTuong === "khac" ? "active" : ""}`} onClick={() => setDoiTuong("khac")}>
                👤 Đối tượng khác
              </button>
            </div>
          </div>


          <div className="cr-form">


            {doiTuong === "sinhvien" && (
              <>
                <div className="cr-row">
                  <div className="cr-field">
                    <label>Họ và tên <span className="cr-required">*</span></label>
                    <input type="text" placeholder="Nguyễn Văn A" value={form.hoTen} onChange={e => upd("hoTen", e.target.value)} />
                  </div>
                  <div className="cr-field">
                    <label>MSSV <span className="cr-required">*</span></label>
                    <input type="text" placeholder="Nhập mã số sinh viên" value={form.mssv} onChange={e => upd("mssv", e.target.value)} />
                  </div>
                </div>


                <div className="cr-row">
                  <div className="cr-field">
                    <label>Ngày sinh</label>
                    <input type="date" value={form.ngaySinh} onChange={e => upd("ngaySinh", e.target.value)} />
                  </div>
                  <div className="cr-field">
                    <label>Số điện thoại <span className="cr-required">*</span></label>
                    <input type="tel" placeholder="0901234567" value={form.soDienThoai} onChange={e => upd("soDienThoai", e.target.value)} />
                  </div>
                </div>


                <div className="cr-field">
                  <label>Email <span className="cr-required">*</span></label>
                  <input type="email" placeholder="example@email.com" value={form.email} onChange={e => upd("email", e.target.value)} />
                </div>


                <PasswordField label="Mật khẩu" />


                <div className="cr-field">
                  <label>Giới tính</label>
                  <select value={form.gioiTinh} onChange={e => upd("gioiTinh", e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14 }}>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>


                <div className="cr-field">
                  <label>Trường <span className="cr-required">*</span></label>
                  <div className="cr-radio-group">
                    <label className={`cr-radio-option ${truong === "DKT" ? "selected" : ""}`}>
                      <input type="radio" name="truong" value="DKT" checked={truong === "DKT"} onChange={() => setTruong("DKT")} />
                      <span>Trường Đại học Kinh tế Đà Nẵng</span>
                    </label>
                    <label className={`cr-radio-option ${truong === "khac" ? "selected" : ""}`}>
                      <input type="radio" name="truong" value="khac" checked={truong === "khac"} onChange={() => setTruong("khac")} />
                      <span>Khác</span>
                    </label>
                  </div>
                  {truong === "khac" && (
                    <input type="text" className="cr-input-other" placeholder="Nhập tên trường..." value={tenTruong} onChange={e => setTenTruong(e.target.value)} />
                  )}
                </div>
              </>
            )}


            {doiTuong === "khac" && (
              <>
                <div className="cr-row">
                  <div className="cr-field">
                    <label>Họ và tên <span className="cr-required">*</span></label>
                    <input type="text" placeholder="Nguyễn Văn A" value={form.hoTen} onChange={e => upd("hoTen", e.target.value)} />
                  </div>
                  <div className="cr-field">
                    <label>Ngày sinh</label>
                    <input type="date" value={form.ngaySinh} onChange={e => upd("ngaySinh", e.target.value)} />
                  </div>
                </div>


                <div className="cr-row">
                  <div className="cr-field">
                    <label>Số điện thoại <span className="cr-required">*</span></label>
                    <input type="tel" placeholder="0901234567" value={form.soDienThoai} onChange={e => upd("soDienThoai", e.target.value)} />
                  </div>
                  <div className="cr-field">
                    <label>Email <span className="cr-required">*</span></label>
                    <input type="email" placeholder="example@email.com" value={form.email} onChange={e => upd("email", e.target.value)} />
                  </div>
                </div>


                <PasswordField label="Mật khẩu" />


                <div className="cr-field">
                  <label>Nghề nghiệp</label>
                  <input type="text" placeholder="VD: Nhân viên văn phòng..." value={form.ngheNghiep} onChange={e => upd("ngheNghiep", e.target.value)} />
                </div>


                <div className="cr-field">
                  <label>Địa chỉ</label>
                  <input type="text" placeholder="Nhập địa chỉ..." value={form.diaChi} onChange={e => upd("diaChi", e.target.value)} />
                </div>
              </>
            )}


            <div className="cr-field">
              <label>Ghi chú</label>
              <input type="text" placeholder="Nhập ghi chú nếu có..." value={form.ghiChu} onChange={e => upd("ghiChu", e.target.value)} />
            </div>


            <div className="cr-submit">
              <button type="button" onClick={handleSubmit} disabled={loading}>
                {loading ? "Đang xử lý..." : "Đăng ký"}
              </button>
            </div>


            <p style={{ textAlign: "center", marginTop: 12, fontSize: 14, color: "#666" }}>
              Đã có tài khoản?{" "}
              <Link to="/login" style={{ color: "#e87722", fontWeight: 600 }}>Đăng nhập</Link>
            </p>
          </div>
        </div>
      </div>


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
}


export default CourseRegister;



