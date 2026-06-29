import { useState } from "react"
import "./results.css"

export default function Results() {
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
  ]

  return (
    <section className="results-section">
      <div className="results-container">

        <h2 className="results-title">
          HỌC VIÊN FLIC - NGƯỜI THẬT, KẾT QUẢ THẬT
        </h2>

        <div className="results-underline"></div>

        <p className="results-subtitle">
          98% học viên đạt hoặc vượt mục tiêu TOEIC, IELTS & VSTEP mong muốn,
          minh chứng rõ ràng cho chất lượng giảng dạy của chúng tôi.
        </p>

        {/* 
          Class "results-grid" chua toan bo hinh anh, style css responsive se dieu khien 
          an cac hinh anh tu index >= 4 tro di tren thiet bi di dong (< 768px).
        */}
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

        {/* Modal phong to anh */}
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
  )
}