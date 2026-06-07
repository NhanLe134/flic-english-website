import "./results.css"

export default function Results() {
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

        <div className="results-grid">
          {images.map((img, index) => (
            <div key={index} className="result-card">
              <img src={img} alt={`Kết quả ${index + 1}`} />
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}