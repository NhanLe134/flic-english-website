import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiAward, FiStar, FiBookOpen } from "react-icons/fi";
import NavTuDong from "../../components/NavTuDong/NavTuDong";
import Footer from "../../components/Footer/Footer";

// Nhập các tệp CSS của trang chủ
import "./TrangChu.css";
import "./TrangChu_TuongThich.css";

// Thành phần chính Trang Chủ
const TrangChu = () => {
  const navigate = useNavigate();

  // --- TRẠNG THÁI CỦA HỢP PHẦN KẾT QUẢ HỌC VIÊN ---
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const images = [
    "/image(5).png",
    "/image(6).png",
    "/image(7).png",
    "/image(8).png",
    "/image(9).png",
    "/image(10).png",
    "/image(11).png",
    "/image(12).png",
    "/image(13).png",
    "/image(14).png",
  ];

  // --- TRẠNG THÁI CỦA HỢP PHẦN GIÁO VIÊN ---
  const [activeIdx, setActiveIdx] = useState(0);
  const teacherData = [
    {
      name: "Ms. Linh",
      role: "Chuyên gia TOEIC",
      gradient: "gradient-orange",
      highlights: [
        { text: "TOEIC 990/990" },
        { text: "5 năm kinh nghiệm" }
      ],
      specialties: ["Chiến lược TOEIC", "Kỹ năng làm bài kiểm tra", "Tối ưu hóa điểm số"]
    },
    {
      name: "Mr. David",
      role: "Communication Specialist",
      gradient: "gradient-green",
      highlights: [
        { text: "Giáo viên tiếng Anh bản ngữ" },
        { text: "Chuyên gia về kỹ năng giao tiếp" }
      ],
      specialties: ["Nói lưu loát", "Cách phát âm", "Tiếng Anh thương mại"]
    },
    {
      name: "Ms. Hương",
      role: "Chuyên gia VSTEP",
      gradient: "gradient-red",
      highlights: [
        { text: "Chứng nhận VSTEP C1" },
        { text: "7 năm kinh nghiệm giảng dạy" }
      ],
      specialties: ["Chuẩn bị VSTEP", "Viết học thuật", "Kỹ năng toàn diện"]
    }
  ];

  // Tự động chuyển giáo viên mới sau mỗi 5 giây ở chế độ di động
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setActiveIdx((prevIdx) => (prevIdx + 1) % teacherData.length);
    }, 5000);
    return () => clearInterval(slideTimer);
  }, [teacherData.length]);

  // --- KIỂM TRA PHÂN QUYỀN ĐỂ ĐIỀU HƯỚNG NGƯỜI DÙNG ĐÃ ĐĂNG NHẬP ---
  useEffect(() => {
    try {
      const user = JSON.parse(sessionStorage.getItem("user") || "{}");
      if (user && user.VaiTro) {
        if (user.VaiTro === "Quản Trị Viên") {
          navigate("/admin/admin-dashboard", { replace: true });
        } else if (user.VaiTro === "Giảng Viên") {
          navigate(`/teacher${user.MaNguoiDung}/lophoc`, { replace: true });
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

  // Hiệu ứng dịch chuyển khi scroll chuột (Scroll Reveal giống enet)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll(".reveal");
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <div className="trang-chu">
      {/* 1. THANH ĐIỀU HƯỚNG TỰ ĐỘNG */}
      <NavTuDong />
      
      {/* 2. PHẦN ĐẦU TRANG GIỚI THIỆU (HERO) */}
      <section className="hero reveal">
        <div className="hero-container">
          <div className="hero-left">
            <span className="hero-subtitle">
              TOEIC, IELTS & VSTEP – BẮT ĐẦU TỪ GỐC
            </span>

            <h1>
              Nâng điểm TOEIC, <br />
              IELTS & VSTEP từ gốc – <br />
              Học vững nền, tiến xa!
            </h1>

            <p>
              Học thông minh hơn với các bài học được cá nhân hóa và tiến bộ thực sự.
              Tham gia cùng hơn 10.000 học viên thành công đã thay đổi kỹ năng tiếng Anh của mình.
            </p>

            <div className="hero-stats">
              <div className="stat-card">
                <h3>10,000+</h3>
                <span>Học viên thành công</span>
              </div>
              <div className="stat-card">
                <h3>15+</h3>
                <span>Giáo viên chuyên gia</span>
              </div>
              <div className="stat-card">
                <h3>98%</h3>
                <span>Đạt & vượt mục tiêu</span>
              </div>
            </div>

            <div className="hero-buttons">
              <button className="btn-login" onClick={() => navigate("?auth=login")}>
                Đăng nhập
              </button>
              <button className="btn-register" onClick={() => navigate("?auth=register")}>
                Đăng ký
              </button>
            </div>
          </div>

          <div className="hero-right">
            <div className="hero-image-backdrop"></div>
            <img src={`${import.meta.env.BASE_URL}image.png`} alt="FLIC English Center" />
          </div>
        </div>
      </section>
      
      {/* 3. GIỚI THIỆU VỀ TRUNG TÂM (ABOUT) */}
      <section className="about reveal">
        <div className="about-inner-container">
          <div className="about-left">
            <div className="about-left-card">
              <div className="card-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="cap-svg">
                  <path d="M12 2L1 8l11 6 11-6-11-6z" fill="#1e293b" />
                  <path d="M5 11.5v3.5c0 3.3 3.1 6 7 6s7-2.7 7-6v-3.5l-7 3.8-7-3.8z" fill="#1e293b" />
                  <path d="M19 9v7.5c0 .8.7 1.5 1.5 1.5s1.5-.7 1.5-1.5V9l-3 0z" fill="#F95800" />
                </svg>
              </div>
              <h3 className="card-title">Expert-Led Learning</h3>
              <p className="card-subtitle">Personalized for Your Success</p>
            </div>
          </div>

          <div className="about-right">
            <h2>Về FLIC</h2>
            <div className="about-title-underline"></div>

            <p>
              FLIC là trung tâm Anh ngữ chuyên đào tạo tiếng Anh cho học viên và người đi làm,
              hướng đến việc xây dựng nền tảng vững chắc và phát triển kỹ năng sử dụng tiếng Anh
              một cách thực tế. Trung tâm áp dụng mô hình học tập cá nhân hóa, tập trung vào
              khả năng hiểu bài, giao tiếp và ứng dụng tiếng Anh trong học tập, công việc.
              Đồng thời, FLIC hỗ trợ học viên luyện thi các chứng chỉ như TOEIC, IELTS & VSTEP
              trong môi trường học tập thân thiện, hiệu quả.
            </p>

            <div className="about-stats">
              <div className="about-stat-item">
                <span className="stat-number">7+</span>
                <span className="stat-label">năm kinh nghiệm</span>
              </div>
              <div className="about-stat-item">
                <span className="stat-number">500</span>
                <span className="stat-label">khóa học thành công</span>
              </div>
            </div>

            <button className="btn-about" onClick={() => navigate("/about")}>
              VỀ CHÚNG TÔI &rarr;
            </button>
          </div>
        </div>
      </section>
      
      {/* 4. HÌNH ẢNH KẾT QUẢ THỰC TẾ (RESULTS) */}
      <section className="results-section reveal">
        <div className="results-container">
          <h2 className="results-title">
            HỌC VIÊN FLIC - NGƯỜI THẬT, KẾT QUẢ THẬT
          </h2>

          <div className="results-underline"></div>

          <p className="results-subtitle">
            98% học viên đạt hoặc vượt mục tiêu TOEIC, IELTS & VSTEP mong muốn,
            minh chứng rõ ràng cho chất lượng giảng dạy của chúng tôi.
          </p>

          <div className="results-grid">
            {images.map((img, index) => {
              const fullUrl = `${import.meta.env.BASE_URL}${img.substring(1)}`;
              return (
                <div 
                  key={index} 
                  className={`result-card ${index >= 4 ? "hide-on-mobile" : ""}`}
                  onClick={() => setSelectedImage(fullUrl)}
                >
                  <img src={fullUrl} alt={`Kết quả ${index + 1}`} />
                </div>
              );
            })}
          </div>

          {/* Hộp thoại Modal phóng to ảnh */}
          {selectedImage && (
            <div className="results-modal-overlay" onClick={() => setSelectedImage(null)}>
              <div className="results-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="results-modal-close" onClick={() => setSelectedImage(null)}>
                  &times;
                </button>
                <img src={selectedImage} alt="Kết quả học tập lớn" className="results-modal-img" />
              </div>
            </div>
          )}
        </div>
      </section>
      
      {/* 5. ĐỘI NGŨ GIÁO VIÊN GIẢNG DẠY (TEACHERS) */}
      <section className="teachers reveal">
        <h2>GẶP GỠ GIÁO VIÊN CỦA CHÚNG TÔI</h2>
        <p className="teachers-subtitle">
          Học hỏi từ các nhà giáo dục được chứng nhận, tận tâm,
          tận tụy vì sự thành công của bạn
        </p>

        {/* Giao diện trên máy tính (Desktop) */}
        <div className="teachers-container desktop-only-flex">
          {teacherData.map((teacher, idx) => (
            <div key={idx} className={`teacher-card ${teacher.gradient}`}>
              <div className={`teacher-card-top ${teacher.gradient}`}>
                <div className="teacher-circle-img">
                  <img src={`${import.meta.env.BASE_URL}image.png`} alt={teacher.name} />
                </div>
              </div>
              <div className="teacher-card-bottom">
                <h3>{teacher.name}</h3>
                <span className="teacher-role">{teacher.role}</span>

                <div className="teacher-highlights-box">
                  <div className="highlight-item">
                    <FiAward className="teacher-icon" />
                    <span className="highlight-text">{teacher.highlights[0].text}</span>
                  </div>
                  <div className="highlight-item">
                    <FiStar className="teacher-icon" />
                    <span className="highlight-text">{teacher.highlights[1].text}</span>
                  </div>
                </div>

                <div className="teacher-specialty">
                  <h4>
                    <FiBookOpen className="teacher-icon" /> Chuyên ngành:
                  </h4>
                  <ul>
                    {teacher.specialties.map((spec, sIdx) => (
                      <li key={sIdx}>{spec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Giao diện dạng trượt trên thiết bị di động (Mobile Slider) */}
        <div className="teachers-slider-wrapper mobile-only-block">
          <div className="teachers-slider-container">
            {/* Nút chuyển slide trái */}
            <button 
              className="slider-arrow arrow-left" 
              onClick={() => setActiveIdx((prev) => (prev === 0 ? teacherData.length - 1 : prev - 1))}
              aria-label="Previous Slide"
            >
              &#10094;
            </button>

            {/* Thẻ giáo viên hiện tại */}
            <div className={`teacher-card active-slide ${teacherData[activeIdx].gradient}`}>
              <div className={`teacher-card-top ${teacherData[activeIdx].gradient}`}>
                <div className="teacher-circle-img">
                  <img src={`${import.meta.env.BASE_URL}image.png`} alt={teacherData[activeIdx].name} />
                </div>
              </div>
              <div className="teacher-card-bottom">
                <h3>{teacherData[activeIdx].name}</h3>
                <span className="teacher-role">{teacherData[activeIdx].role}</span>

                <div className="teacher-highlights-box">
                  <div className="highlight-item">
                    <FiAward className="teacher-icon" />
                    <span className="highlight-text">{teacherData[activeIdx].highlights[0].text}</span>
                  </div>
                  <div className="highlight-item">
                    <FiStar className="teacher-icon" />
                    <span className="highlight-text">{teacherData[activeIdx].highlights[1].text}</span>
                  </div>
                </div>

                <div className="teacher-specialty">
                  <h4>
                    <FiBookOpen className="teacher-icon" /> Chuyên ngành:
                  </h4>
                  <ul>
                    {teacherData[activeIdx].specialties.map((spec, sIdx) => (
                      <li key={sIdx}>{spec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Nút chuyển slide phải */}
            <button 
              className="slider-arrow arrow-right" 
              onClick={() => setActiveIdx((prev) => (prev + 1) % teacherData.length)}
              aria-label="Next Slide"
            >
              &#10095;
            </button>
          </div>

          {/* Các dấu chấm tròn phân trang */}
          <div className="slider-dots">
            {teacherData.map((_, idx) => (
              <span 
                key={idx} 
                className={`dot ${idx === activeIdx ? "active" : ""}`}
                onClick={() => setActiveIdx(idx)}
              ></span>
            ))}
          </div>
        </div>
      </section>
      
      {/* 6. PHẦN KÊU GỌI HÀNH ĐỘNG (CTA) */}
      <section className="cta-section reveal">
        <div className="cta-container">
          <h2>
            BẠN ĐÃ SẴN SÀNG ĐẠT ĐƯỢC
            <br />
            MỤC TIÊU TIẾNG ANH CỦA MÌNH CHƯA?
          </h2>

          <p className="cta-desc">
            Tham gia cùng hàng ngàn học viên thành công đã thay đổi <br></br>
            kỹ năng tiếng Anh của mình với Trung tâm Anh ngữ Flic
          </p>
        </div>
      </section>
      
      {/* 7. CHÂN TRANG (FOOTER) */}
      <Footer />
    </div>
  );
};

export default TrangChu;
