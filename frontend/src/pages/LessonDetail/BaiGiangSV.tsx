import "./LessonDetailSV.css";
import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const API = "http://localhost:5000";

const unescapeMarkdown = (str: string) => {
  return str
    .replace(/\\#/g, "#")
    .replace(/\\-/g, "-")
    .replace(/\\\|/g, "|")
    .replace(/\\>/g, ">")
    .replace(/\\\*/g, "*")
    .replace(/\\_/g, "_")
    .replace(/\\\./g, ".")
    .replace(/\\!/g, "!")
    .replace(/^# /m, "")
    .replace(/(\|[^\n]+\|)\n\n(?=\|)/g, "$1\n")
    .replace(/(-[^\n]+)\n\n(?=-)/g, "$1\n");
};

function BaiGiangSV() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { maLopHoc, maLesson } = location.state || {};

  const [baiGiang, setBaiGiang] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`${API}/baigiang/detail/${id}`)
      .then(res => res.json())
      .then(data => setBaiGiang(data))
      .catch(err => console.log(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
        <div className="ld2-content" style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "#999" }}>
          Đang tải...
        </div>
  );

  if (!baiGiang) return (
        <div className="ld2-content" style={{ color: "#999", padding: 24 }}>
          Không tìm thấy bài giảng.
        </div>
  );

  const fileUrl = baiGiang.FileUrl || null;
  const noiDung = baiGiang.NoiDung || "";

  const isImage = fileUrl && /\.(png|jpg|jpeg|gif|webp)$/i.test(fileUrl);
  const isPdf   = fileUrl && /\.pdf$/i.test(fileUrl);
  const isVideo = fileUrl && /\.(mp4|webm|ogg)$/i.test(fileUrl);
  const isAudio = fileUrl && /\.(mp3|wav|m4a)$/i.test(fileUrl);

  return (
        <div className="ld2-content">

          {/* Quay lại — trên đầu */}
          <span
            className="ld2-link"
            style={{ display: "inline-block", marginBottom: 12, cursor: "pointer", color: "#e87722", fontWeight: 500 }}
            onClick={() => navigate(-1)}
          >
            ← Quay lại
          </span>

          {/* Breadcrumb */}
          <nav className="ld2-breadcrumb">
            <span className="ld2-link" onClick={() => navigate(`/course-detail/${maLopHoc}`)}>
              Lớp học
            </span>
            <span>›</span>
            <span className="ld2-link" onClick={() => navigate(-1)}>
              Buổi học
            </span>
            <span>›</span>
            <span className="ld2-active">{baiGiang.TieuDe}</span>
          </nav>

          {/* Tiêu đề */}
          <div className="ld2-lesson-info">
            <div className="ld2-lesson-icon">📖</div>
            <div>
              <p className="ld2-lesson-title">{baiGiang.TieuDe}</p>
              <p className="ld2-lesson-date">
                {baiGiang.LoaiBaiHoc} • {baiGiang.ThoiLuong}
              </p>
            </div>
          </div>

          {/* NỘI DUNG MARKDOWN */}
          {/* NỘI DUNG */}
          {noiDung && (
            <div style={{ background: "#fff", borderRadius: 12, padding: 20, marginBottom: 20, lineHeight: 1.8 }}>
              {noiDung.trimStart().startsWith("<") ? (
                <div dangerouslySetInnerHTML={{ __html: noiDung }} />
              ) : (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {unescapeMarkdown(noiDung)}
                </ReactMarkdown>
              )}
            </div>
          )}

          {/* ẢNH */}
          {isImage && (
            <div style={{ marginBottom: 20 }}>
              <img src={fileUrl!} alt="lesson" style={{ width: "100%", borderRadius: 12 }} />
            </div>
          )}

          {/* PDF */}
          {isPdf && (
            <div style={{ marginBottom: 20 }}>
              <iframe
                src={fileUrl!}
                width="100%"
                height="700px"
                title="PDF viewer"
                style={{ borderRadius: 12, border: "1px solid #e0d4c3" }}
              />
            </div>
          )}

          {/* VIDEO */}
          {isVideo && (
            <div style={{ marginBottom: 20 }}>
              <video controls width="100%" style={{ borderRadius: 12, maxWidth: "720px", display: "block", margin: "0 auto" }}>
                <source src={fileUrl!} />
                Trình duyệt không hỗ trợ video.
              </video>
            </div>
          )}

          {/* AUDIO */}
          {isAudio && (
            <div style={{ marginBottom: 20 }}>
              <audio controls style={{ width: "100%" }}>
                <source src={fileUrl!} />
                Trình duyệt không hỗ trợ audio.
              </audio>
            </div>
          )}

          {/* FILE KHÁC */}
          {fileUrl && !isImage && !isPdf && !isVideo && !isAudio && (
            <div style={{ marginBottom: 20 }}>
              <a href={fileUrl} target="_blank" rel="noreferrer"
                style={{ color: "#e87722", fontWeight: 600 }}>
                📄 Tải file đính kèm
              </a>
            </div>
          )}

        </div>
  );
}

export default BaiGiangSV;