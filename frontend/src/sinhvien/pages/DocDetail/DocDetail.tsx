import "./DocDetail.css";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import dailyImg from "../../../assets/daily.png";

const API = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.startsWith("192.168.") || window.location.hostname.startsWith("172.") || window.location.hostname.startsWith("10.") ? "http://" + window.location.hostname + ":5004" : "http://14.225.192.252:5004") + "";

function DocDetail() {
  const navigate      = useNavigate()
  const { id }        = useParams() // MaTaiLieu
  const [doc, setDoc] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    fetch(`${API}/tailieu/detail/${id}`)
      .then(r => r.json())
      .then(data => setDoc(data))
      .catch(() => setDoc(null))
      .finally(() => setLoading(false))
  }, [id])

  // Parse nội dung — có thể là text thuần hoặc HTML
  const renderContent = (noiDung: string) => {
    if (!noiDung) return null

    // Nếu là HTML (có thẻ <h2>, <table>, <ul>...)
    if (noiDung.includes("<") && noiDung.includes(">")) {
      return (
        <div
          className="dd-html-content"
          dangerouslySetInnerHTML={{ __html: noiDung }}
        />
      )
    }

    // Nếu là text thuần → parse từng dòng
    const lines = noiDung.split("\n").filter(l => l.trim())
    return (
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {lines.map((line, i) => {
          const parts = line.split(":")
          if (parts.length >= 2) {
            const word    = parts[0].trim()
            const rest    = parts.slice(1).join(":").trim()
            const example = rest.includes("Ex:") ? rest : ""
            const meaning = rest.includes("Ex:") ? rest.split("Ex:")[0].trim() : rest
            return (
              <li key={i}>
                <p className="dd-word">{word}{meaning ? `: ${meaning}` : ""}</p>
                {example && <p className="dd-example">{example.includes("Ex:") ? example : `Ex: ${example}`}</p>}
              </li>
            )
          }
          return <li key={i}><p className="dd-word">{line}</p></li>
        })}
      </ul>
    )
  }

  return (
        <div className="dd-content">

          <button className="dd-back" onClick={() => navigate(-1)}>← Quay lại</button>

          {loading ? (
            <div style={{ padding:40, textAlign:"center", color:"#999" }}>Đang tải...</div>
          ) : !doc ? (
            <div style={{ padding:40, textAlign:"center", color:"#999" }}>Không tìm thấy tài liệu.</div>
          ) : (
            <>
              <h1 className="dd-title">{doc.TieuDe}</h1>
              {doc.MoTa && <p className="dd-subtitle">{doc.MoTa}</p>}

              {/* Thông tin tài liệu */}
              <div style={{ display:"flex", gap:16, flexWrap:"wrap", marginBottom:20 }}>
                {doc.TenBuoiHoc && (
                  <span style={{ background:"#fff3e0", color:"#e87722", padding:"4px 12px", borderRadius:20, fontSize:13, fontWeight:600 }}>
                    📅 {doc.TenBuoiHoc}
                  </span>
                )}
                {doc.NgayCapNhat && (
                  <span style={{ background:"#f0f4ff", color:"#3b4cca", padding:"4px 12px", borderRadius:20, fontSize:13 }}>
                    🕐 Cập nhật: {new Date(doc.NgayCapNhat).toLocaleDateString("vi-VN")}
                  </span>
                )}
                {doc.FileUrl && (
                  <a
                    href={doc.FileUrl.startsWith("http") ? doc.FileUrl : `${API}${doc.FileUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ background:"#e8f5e9", color:"#2e7d32", padding:"4px 12px", borderRadius:20, fontSize:13, textDecoration:"none", fontWeight:600 }}
                  >
                    📎 Tải file
                  </a>
                )}
              </div>

              {/* Nội dung */}
              <div className="dd-card">
                <div className="dd-card-inner">
                  <div className="dd-word-list">
                    {doc.NoiDung
                      ? renderContent(doc.NoiDung)
                      : <p style={{ color:"#999" }}>Tài liệu chưa có nội dung.</p>
                    }
                  </div>
                  <div className="dd-illustration">
                    <img src={dailyImg} alt="minh họa" className="dd-illus-img" />
                  </div>
                </div>
              </div>
            </>
          )}

        </div>
  )
}

export default DocDetail;
