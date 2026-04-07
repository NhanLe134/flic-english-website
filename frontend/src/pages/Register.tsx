import "./register.css";
import banner from "../assets/register.png";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const API = "http://localhost:5000";

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    name: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate mật khẩu khớp nhau
    if (form.password !== form.confirmPassword) {
      setError("Mật khẩu nhập lại không khớp!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          password: form.password,
          name: form.name,
          email: form.username, // dùng email/sdt làm username
        }),
      });

      if (!res.ok) {
        const msg = await res.text();
        setError(msg || "Đăng ký thất bại!");
        return;
      }

      setSuccess("Đăng ký thành công! Đang chuyển sang trang đăng nhập...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError("Không thể kết nối đến server!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />

      <div className="register-page">
        <div className="form">
          <h2>ĐĂNG KÝ TÀI KHOẢN</h2>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit}>
            <p>Email hoặc Số điện thoại *</p>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
            />

            <p>Họ và tên *</p>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />

            <p>Mật khẩu *</p>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />

            <p>Nhập lại mật khẩu *</p>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />

            <button type="submit" disabled={loading}>
              {loading ? "Đang đăng ký..." : "Đăng ký"}
            </button>
          </form>
        </div>

        <div className="image">
          <img src={banner} alt="banner" />
        </div>
      </div>
    </div>
  );
};

export default Register;