import { useState, useEffect } from "react";
import "./teachers.css";
import { FiAward, FiStar, FiBookOpen } from "react-icons/fi";

function Teachers() {
  // Dung state de tracking index giao vien hien tai dang duoc chon
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

  // Tu dong chuyen giao vien moi 5 giay khi o che do Mobile Slider
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setActiveIdx((prevIdx) => (prevIdx + 1) % teacherData.length);
    }, 5000);
    return () => clearInterval(slideTimer);
  }, [teacherData.length]);

  return (
    <section className="teachers">
      <h2>GẶP GỠ GIÁO VIÊN CỦA CHÚNG TÔI</h2>
      <p className="teachers-subtitle">
        Học hỏi từ các nhà giáo dục được chứng nhận, tận tâm,
        tận tụy vì sự thành công của bạn
      </p>

      {/* --- GIAO DIEN DESKTOP (Hien thi toan bo card binh thuong) --- */}
      <div className="teachers-container desktop-only-flex">
        {teacherData.map((teacher, idx) => (
          <div key={idx} className="teacher-card">
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

      {/* --- GIAO DIEN MOBILE SLIDER (Hiển thị từng giáo viên kèm chuyển slide như ảnh mẫu) --- */}
      <div className="teachers-slider-wrapper mobile-only-block">
        <div className="teachers-slider-container">
          {/* Nut chuyen slide trai */}
          <button 
            className="slider-arrow arrow-left" 
            onClick={() => setActiveIdx((prev) => (prev === 0 ? teacherData.length - 1 : prev - 1))}
            aria-label="Previous Slide"
          >
            &#10094;
          </button>

          {/* Teacher Card hien tai */}
          <div className="teacher-card active-slide">
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

          {/* Nut chuyen slide phai */}
          <button 
            className="slider-arrow arrow-right" 
            onClick={() => setActiveIdx((prev) => (prev + 1) % teacherData.length)}
            aria-label="Next Slide"
          >
            &#10095;
          </button>
        </div>

        {/* Cac nut tron nho (indicator dots) duoi anh */}
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
  );
}

export default Teachers;