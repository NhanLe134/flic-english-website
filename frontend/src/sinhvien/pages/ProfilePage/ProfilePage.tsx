import { useState, useEffect, useRef } from "react";
import "./ProfilePage.css";
import { 
  FiMail, 
  FiCalendar, 
  FiUser, 
  FiHome, 
  FiCamera, 
  FiEdit3, 
  FiX, 
  FiAward,
  FiHash
} from "react-icons/fi";

const API = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.startsWith("192.168.") || window.location.hostname.startsWith("172.") || window.location.hostname.startsWith("10.") ? "http://" + window.location.hostname + ":5004" : "http://14.225.192.252:5004") + "";

interface StudentProfile {
  MaSinhVien: string;
  MaNguoiDung: number;
  HoTen: string;
  Email: string;
  GioiTinh: string;
  NgaySinh: string | null;
  Lop: string | null;
  MSSV: string | null;
  TenKhoaHoc: string | null;
  NgayDangKy: string | null;
  AnhDaiDien?: string | null;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  
  // State form khi sửa
  const [editForm, setEditForm] = useState({
    HoTen: "",
    Email: "",
    GioiTinh: "",
    NgaySinh: "",
    Lop: "",
    MSSV: ""
  });

  const [avatar, setAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lấy user đang đăng nhập
  let currentUser: any = {};
  try {
    currentUser = JSON.parse(sessionStorage.getItem("user") || "{}") || {};
  } catch (e) {
    console.error("Error parsing user", e);
  }

  const loadProfile = async () => {
    if (!currentUser.MaNguoiDung) {
      setLoading(false);
      return;
    }

    try {
      // 1. Lấy MaSinhVien từ MaNguoiDung
      const svRes = await fetch(`${API}/students/by-user/${currentUser.MaNguoiDung}`);
      const svData = await svRes.json();

      if (svData && svData.MaSinhVien) {
        // 2. Lấy chi tiết thông tin sinh viên
        const detailRes = await fetch(`${API}/students/${svData.MaSinhVien}`);
        const detailData = await detailRes.json();

        // 3. Lấy thêm thông tin đăng ký khóa học để lấy ngày đăng ký mới nhất
        let NgayDangKy = null;
        try {
          const coursesRes = await fetch(`${API}/my-courses/${svData.MaSinhVien}`);
          const coursesData = await coursesRes.json();
          if (Array.isArray(coursesData) && coursesData.length > 0) {
            NgayDangKy = coursesData[0].NgayDangKy;
          }
        } catch (err) {
          console.error("Error fetching my-courses for registration date", err);
        }

        const fullProfile: StudentProfile = {
          MaSinhVien: detailData.MaSinhVien || svData.MaSinhVien,
          MaNguoiDung: detailData.MaNguoiDung || currentUser.MaNguoiDung,
          HoTen: detailData.HoTen || currentUser.HoTen || "Sinh Viên",
          Email: detailData.Email || currentUser.Email || "",
          GioiTinh: detailData.GioiTinh || "",
          NgaySinh: detailData.NgaySinh || null,
          Lop: detailData.Lop || "",
          MSSV: detailData.MSSV || "",
          TenKhoaHoc: detailData.TenKhoaHoc || null,
          NgayDangKy: NgayDangKy,
          AnhDaiDien: detailData.AnhDaiDien || currentUser.AnhDaiDien || null
        };

        setProfile(fullProfile);
        setEditForm({
          HoTen: fullProfile.HoTen,
          Email: fullProfile.Email,
          GioiTinh: fullProfile.GioiTinh,
          NgaySinh: fullProfile.NgaySinh ? new Date(fullProfile.NgaySinh).toISOString().split("T")[0] : "",
          Lop: fullProfile.Lop || "",
          MSSV: fullProfile.MSSV || ""
        });

        // Load avatar từ database/sessionStorage
        const savedAvatar = fullProfile.AnhDaiDien;
        if (savedAvatar) {
          setAvatar(savedAvatar.startsWith("http") ? savedAvatar : `${API}${savedAvatar}`);
        }
      }
    } catch (err) {
      console.error("Error loading student profile", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // 1. Upload file vật lý lên server backend
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch(`${API}/upload`, {
        method: "POST",
        body: formData
      });
      if (!uploadRes.ok) throw new Error("Upload thất bại");

      const uploadData = await uploadRes.json();
      const relativeUrl = uploadData.url; // e.g. /uploads/filename.png
      const absoluteUrl = `${API}${relativeUrl}`;

      // 2. Cập nhật state avatar
      setAvatar(absoluteUrl);

      // 3. Cập nhật sessionStorage user
      const userStr = sessionStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        user.AnhDaiDien = relativeUrl;
        sessionStorage.setItem("user", JSON.stringify(user));
      }

      // 4. Lưu link relative URL vào database cột AnhDaiDien
      await fetch(`${API}/users/${currentUser.MaNguoiDung}/anh-dai-dien`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ AnhDaiDien: relativeUrl })
      });

      // Kích hoạt event custom để StudentNavbar cập nhật ngay lập tức
      window.dispatchEvent(new Event("avatarChanged"));
    } catch (err) {
      console.error("Lỗi cập nhật ảnh đại diện:", err);
      alert("Lỗi khi tải ảnh đại diện lên máy chủ");
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Hủy bỏ sửa đổi
      if (profile) {
        setEditForm({
          HoTen: profile.HoTen,
          Email: profile.Email,
          GioiTinh: profile.GioiTinh,
          NgaySinh: profile.NgaySinh ? new Date(profile.NgaySinh).toISOString().split("T")[0] : "",
          Lop: profile.Lop || "",
          MSSV: profile.MSSV || ""
        });
      }
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const res = await fetch(`${API}/users/${profile.MaNguoiDung}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm)
      });
      const data = await res.json();
      if (res.ok) {
        // Cập nhật lại sessionStorage để đồng bộ ngay lập tức
        const updatedUser = { ...currentUser, HoTen: editForm.HoTen, Email: editForm.Email };
        sessionStorage.setItem("user", JSON.stringify(updatedUser));
        window.dispatchEvent(new Event("avatarChanged")); // Kích hoạt sự kiện đổi tên luôn

        setProfile({
          ...profile,
          HoTen: editForm.HoTen,
          Email: editForm.Email,
          GioiTinh: editForm.GioiTinh,
          NgaySinh: editForm.NgaySinh ? editForm.NgaySinh : null,
          Lop: editForm.Lop,
          MSSV: editForm.MSSV
        });
        setIsEditing(false);
      } else {
        alert(data.message || "Lỗi khi lưu thông tin");
      }
    } catch (err) {
      console.error("Error saving profile", err);
      alert("Lỗi kết nối đến server");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("vi-VN", {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="premium-profile-viewport">
        <div className="profile-loading-spinner-container">
          <div className="premium-spinner"></div>
          <p>Đang tải dữ liệu hồ sơ học viên...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="premium-profile-viewport">
        <div className="profile-error-alert">
          <FiX size={40} className="error-icon" />
          <p>Vui lòng đăng nhập với tài khoản học viên để xem trang này.</p>
        </div>
      </div>
    );
  }

  const nameInitial = profile.HoTen
    ? profile.HoTen.split(" ").pop()?.charAt(0).toUpperCase()
    : "S";

  return (
    <div className="premium-profile-viewport">
      <div className="premium-profile-dashboard">
        
        {/* CỘT TRÁI: THẺ TÀI KHOẢN (IDENTITY SIDEBAR) */}
        <div className="profile-sidebar-card">
          <div className="avatar-section">
            <div className="avatar-ring" onClick={() => setShowLightbox(true)}>
              {avatar ? (
                <img src={avatar} alt="avatar" className="avatar-img" />
              ) : (
                <div className="avatar-placeholder-gradient">
                  {nameInitial}
                </div>
              )}
            </div>
            
            <button className="change-photo-btn" onClick={handleAvatarClick}>
              <FiCamera size={14} /> Thay đổi ảnh
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/*"
              style={{ display: "none" }}
            />
          </div>

          <div className="user-identity-details">
            <h2 className="user-fullname">{profile.HoTen}</h2>
            <div className="user-role-badge">
              <FiAward size={14} /> Học Viên FLIC
            </div>
            <div className="user-status-row">
              <span className="status-dot active"></span>
              <span className="status-text">Đang hoạt động</span>
            </div>
          </div>

          <div className="student-card-footer">
            <div className="footer-meta-item">
              <span className="meta-label">Mã học viên</span>
              <span className="meta-value font-code">{profile.MaSinhVien}</span>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: BẢNG CHI TIẾT THÔNG TIN (DETAILS CONTENT) */}
        <div className="profile-main-content">
          
          {/* Header & Nút Thao Tác */}
          <div className="details-header-row">
            <div className="title-area">
              <h1>Hồ sơ cá nhân</h1>
              <p>Quản lý và cập nhật thông tin cá nhân của bạn</p>
            </div>
            
            <div className="action-buttons-area">
              <button className="premium-btn edit-btn" onClick={handleEditToggle}>
                <FiEdit3 size={16} /> Chỉnh sửa hồ sơ
              </button>
            </div>
          </div>

          {/* Card 1: Thông tin liên hệ & cá nhân */}
          <div className="info-group-card">
            <div className="card-subheader">
              <FiUser size={18} />
              <h3>Thông tin cơ bản</h3>
            </div>
            
            <div className="fields-grid-layout">
              {/* Mã học viên (hệ thống) */}
              <div className="form-field-wrapper">
                <span className="field-meta-label">Mã học viên (Hệ thống tạo)</span>
                <span className="field-display-value font-code bold-text color-navy">
                  <FiHash className="inline-icon" /> {profile.MaSinhVien}
                </span>
              </div>

              {/* Mã sinh viên (trường) */}
              <div className="form-field-wrapper">
                <span className="field-meta-label">Mã số sinh viên (Trường)</span>
                <span className="field-display-value bold-text">
                  <FiHash className="inline-icon" /> {profile.MSSV || "—"}
                </span>
              </div>

              {/* Họ tên */}
              <div className="form-field-wrapper">
                <span className="field-meta-label">Họ và tên</span>
                <span className="field-display-value bold-text">{profile.HoTen}</span>
              </div>

              {/* Email */}
              <div className="form-field-wrapper">
                <span className="field-meta-label">Email liên hệ</span>
                <span className="field-display-value">
                  <FiMail className="inline-icon" /> {profile.Email || "—"}
                </span>
              </div>

              {/* Giới tính */}
              <div className="form-field-wrapper">
                <span className="field-meta-label">Giới tính</span>
                <span className="field-display-value">{profile.GioiTinh || "—"}</span>
              </div>

              {/* Ngày sinh */}
              <div className="form-field-wrapper">
                <span className="field-meta-label">Ngày sinh</span>
                <span className="field-display-value">
                  <FiCalendar className="inline-icon" /> {formatDate(profile.NgaySinh)}
                </span>
              </div>

              {/* Lớp / Trường */}
              <div className="form-field-wrapper span-2">
                <span className="field-meta-label">Lớp / Trường đang theo học</span>
                <span className="field-display-value">
                  <FiHome className="inline-icon" /> {profile.Lop || "—"}
                </span>
              </div>
            </div>
          </div>


        </div>

      </div>

      {/* POPUP MODAL CHỈNH SỬA THÔNG TIN (TƯƠNG TỰ FORM ADMIN) */}
      {isEditing && (
        <div className="modal-backdrop-blur">
          <div className="course-form-modal w-520">
            <div className="modal-header-section">
              <h3>Chỉnh sửa thông tin cá nhân</h3>
              <button 
                className="modal-close-icon-btn" 
                onClick={handleEditToggle} 
                disabled={saving}
              >
                <FiX size={20} />
              </button>
            </div>
            
            <div className="modal-scrollable-body">
              {/* Mã học viên (chỉ đọc) */}
              <div className="modal-form-group">
                <label className="modal-form-label">Mã học viên (FLIC - Hệ thống tạo)</label>
                <input
                  type="text"
                  value={profile.MaSinhVien}
                  disabled
                  className="modal-form-input input-readonly"
                />
              </div>

              {/* Mã số sinh viên (trường) (sửa được) */}
              <div className="modal-form-group">
                <label className="modal-form-label">Mã số sinh viên (Trường)</label>
                <input
                  type="text"
                  name="MSSV"
                  value={editForm.MSSV}
                  onChange={handleInputChange}
                  className="modal-form-input"
                  placeholder="Nhập mã số sinh viên trường học của bạn"
                />
              </div>

              <div className="modal-form-group">
                <label className="modal-form-label">Họ và tên</label>
                <input
                  type="text"
                  name="HoTen"
                  value={editForm.HoTen}
                  onChange={handleInputChange}
                  className="modal-form-input"
                  placeholder="Nhập họ và tên học viên"
                />
              </div>

              <div className="modal-form-group">
                <label className="modal-form-label">Email liên hệ</label>
                <input
                  type="email"
                  name="Email"
                  value={editForm.Email}
                  onChange={handleInputChange}
                  className="modal-form-input"
                  placeholder="Nhập email liên hệ"
                />
              </div>

              <div className="modal-form-group">
                <label className="modal-form-label">Ngày sinh</label>
                <div className="modal-date-input-wrapper">
                  <input
                    type="text"
                    readOnly
                    value={editForm.NgaySinh ? editForm.NgaySinh.split('-').reverse().join('/') : ""}
                    className="modal-form-input"
                    placeholder="Chọn ngày sinh"
                    onClick={(e) => {
                      const dateInput = e.currentTarget.nextElementSibling as HTMLInputElement;
                      if (dateInput) {
                        try {
                          dateInput.showPicker();
                        } catch (err) {
                          dateInput.focus();
                        }
                      }
                    }}
                  />
                  <input
                    type="date"
                    name="NgaySinh"
                    value={editForm.NgaySinh}
                    onChange={handleInputChange}
                    className="modal-date-hidden-input"
                  />
                </div>
              </div>

              <div className="modal-form-group">
                <label className="modal-form-label">Giới tính</label>
                <select
                  name="GioiTinh"
                  value={editForm.GioiTinh}
                  onChange={handleInputChange}
                  className="modal-form-select"
                >
                  <option value="">— Chọn giới tính —</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>

              <div className="modal-form-group">
                <label className="modal-form-label">Lớp / Trường đang theo học</label>
                <input
                  type="text"
                  name="Lop"
                  value={editForm.Lop}
                  onChange={handleInputChange}
                  className="modal-form-input"
                  placeholder="Nhập lớp học hoặc trường đại học"
                />
              </div>
            </div>

            <div className="modal-footer-section">
              <button 
                className="footer-cancel-btn" 
                onClick={handleEditToggle} 
                disabled={saving}
              >
                Hủy bỏ
              </button>
              <button 
                className="footer-save-btn" 
                onClick={handleSave} 
                disabled={saving}
              >
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showLightbox && (
        <div className="avatar-lightbox-overlay" onClick={() => setShowLightbox(false)}>
          {avatar ? (
            <img src={avatar} alt="avatar large" className="avatar-lightbox-img" />
          ) : (
            <div className="avatar-lightbox-placeholder">
              {nameInitial}
            </div>
          )}
        </div>
      )}

    </div>
  );
}

