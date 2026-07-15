import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FiArrowLeft, FiFileText, FiEdit, FiTrash2 } from "react-icons/fi";
import "./LessonDetail.css";

const API = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.startsWith("192.168.") || window.location.hostname.startsWith("10.") ? "http://" + window.location.hostname + ":5004" : "http://14.225.192.252:5004") + "";

const LessonDetail: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id, buoiId, maLop, teacherId } = useParams();
  const isQTV = location.pathname.startsWith("/QTV");
  const [lesson, setLesson] = useState<any>(null);
  const [minitest, setMinitest] = useState<any>(null);
  const [minitestQuestions, setMinitestQuestions] = useState<any[]>([]);

  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean;
    message: string;
    subMessage?: string;
    onConfirm?: () => void;
  }>({
    show: false,
    message: ""
  });

  const unescapeMarkdown = (str: string) => {
    let s = str
      .replace(/^#\s+(#{1,6}\s)/gm, "$1")
      .replace(/^#\s+(?!#)/gm, "")
      .replace(/^\\(#{1,6})/gm, "$1")
      .replace(/^\\-/gm, "-")
      .replace(/\\\|/g, "|")
      .replace(/\\>/g, ">")
      .replace(/\\\*/g, "*")
      .replace(/\\_/g, "_")
      .replace(/\\\./g, ".")
      .replace(/\\!/g, "!")
      .replace(/\n{3,}/g, "\n\n");

    const lines = s.split("\n");
    const out: string[] = [];

    const isListOrTable = (l: string) =>
      /^\s*[-*+] /.test(l) ||
      /^\s*\d+\./.test(l) ||
      /^\|/.test(l.trim());

    for (let i = 0; i < lines.length; i++) {
      const prev = out[out.length - 1] ?? "";
      const cur = lines[i];
      const next = lines[i + 1] ?? "";

      if (cur.trim() === "" && isListOrTable(prev) && isListOrTable(next)) {
        continue;
      }
      if (cur.trim() === "" && !isListOrTable(prev) && prev.trim() !== "" && isListOrTable(next)) {
        continue;
      }

      out.push(cur);
    }

    return out.join("\n");
  };

  useEffect(() => {
    if (!id) return;
    fetch(`${API}/baigiang/detail/${id}`)
      .then(res => res.json())
      .then(data => setLesson(data))
      .catch(err => console.log(err));

    fetch(`${API}/minitest/baigiang/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.MaMinitest) {
          setMinitest(data);
          try {
            if (data.CauHoi) {
              setMinitestQuestions(JSON.parse(data.CauHoi));
            }
          } catch (e) {
            console.error("Error parsing minitest questions:", e);
          }
        }
      })
      .catch(err => console.error("Error fetching minitest:", err));
  }, [id]);

  const handleDeleteMinitest = () => {
    setConfirmDialog({
      show: true,
      message: "Bạn có chắc chắn muốn xóa MiniTest này không?",
      subMessage: "Hành động này sẽ xóa vĩnh viễn MiniTest liên kết với buổi học hiện tại.",
      onConfirm: async () => {
        try {
          const res = await fetch(`${API}/minitest/baigiang/${id}`, {
            method: "DELETE"
          });
          if (res.ok) {
            setMinitest(null);
            setMinitestQuestions([]);
          }
        } catch (e) {
          console.error(e);
        }
      }
    });
  };

  if (!lesson) return <p style={{ padding: 20 }}>Đang tải...</p>;

  const rawFileUrl = lesson.FileUrl || null;
  const fileUrl = rawFileUrl ? (rawFileUrl.startsWith("http") ? rawFileUrl : `${API}${rawFileUrl}`) : null;
  const noiDung = lesson.NoiDung || "";

  const isImage = fileUrl && /\.(png|jpg|jpeg|gif|webp)$/i.test(fileUrl);
  const isPdf   = fileUrl && /\.pdf$/i.test(fileUrl);
  const isVideo = fileUrl && /\.(mp4|webm|ogg)$/i.test(fileUrl);
  const isAudio = fileUrl && /\.(mp3|wav|m4a)$/i.test(fileUrl);

  const getYoutubeEmbedUrl = (url: string) => {
    if (!url) return "";
    let videoId = "";
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      videoId = match[2];
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  const getGoogleDriveEmbedUrl = (url: string) => {
    if (!url) return "";
    if (url.includes("drive.google.com")) {
      return url.replace(/\/view(\?.*)?$/, "/preview");
    }
    return url;
  };

  const isYoutube = fileUrl && (fileUrl.includes("youtube.com") || fileUrl.includes("youtu.be"));
  const isGoogleDrive = fileUrl && fileUrl.includes("drive.google.com");

  const markdownComponents = {
    ul: ({ children }: any) => (
      <ul style={{ paddingLeft: 24, margin: "4px 0" }}>{children}</ul>
    ),
    ol: ({ children }: any) => (
      <ol style={{ paddingLeft: 24, margin: "4px 0" }}>{children}</ol>
    ),
    li: ({ children }: any) => {
      const unwrapped = React.Children.map(children, (child: any) => {
        if (child?.type === "p") return child.props.children;
        return child;
      });
      return (
        <li style={{ margin: "2px 0", padding: 0, lineHeight: 1.6 }}>
          {unwrapped}
        </li>
      );
    },
    p: ({ children }: any) => (
      <p style={{ margin: "6px 0", padding: 0 }}>{children}</p>
    ),
  };

  return (
    <div className="ld-wrapper" style={isQTV ? { maxWidth: "1200px", margin: "0 auto", padding: "24px 32px 32px 32px", boxSizing: "border-box" } : undefined}>

      <div className="back-btn" onClick={() => buoiId ? navigate(`/${teacherId}/lophoc/${maLop}/${buoiId}/bg`) : navigate(-1)}>
        <FiArrowLeft size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
        Quay lại
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: '8px' }}>
        <h1 className="detail-title" style={{ margin: 0, color: isQTV ? "#f95800" : undefined }}>{lesson.TieuDe}</h1>
        <span style={{
          background: lesson.TrangThai === 'published' ? '#e8f5e9' : lesson.TrangThai === 'pending' ? '#fff3e0' : '#ffebee',
          color: lesson.TrangThai === 'published' ? '#2e7d32' : lesson.TrangThai === 'pending' ? '#F95800' : '#c62828',
          padding: "3px 12px",
          borderRadius: 20,
          fontSize: 13,
          fontWeight: 600
        }}>
          {lesson.TrangThai === 'published' ? 'Đã duyệt' : lesson.TrangThai === 'pending' ? 'Chờ duyệt' : 'Từ chối'}
        </span>
        {isQTV && (
          <button
            style={{
              background: "#F95800",
              color: "#ffffff",
              border: "none",
              padding: "6px 14px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginLeft: "auto"
            }}
            onClick={() => {
              navigate(`/QTV/them-bai-giang/${lesson.MaBuoiHoc}?editDraftId=${id}`);
            }}
          >
            <FiEdit size={14} />
            Sửa 
          </button>
        )}
      </div>

      {noiDung && (
        <>
          {noiDung.trimStart().startsWith("<") ? (
            <div
              className="html-content"
              dangerouslySetInnerHTML={{ __html: noiDung }}
            />
          ) : (
            <div className="text-content">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={markdownComponents}
              >
                {unescapeMarkdown(noiDung).trim()}
              </ReactMarkdown>
            </div>
          )}
        </>
      )}

      {isImage && (
        <div className="file-content">
          <img src={fileUrl!} alt="lesson" style={{ width: "100%", borderRadius: 12 }} />
        </div>
      )}

      {isPdf && (
        <div className="file-content">
          <iframe
            src={fileUrl!}
            width="100%"
            height="700px"
            title="PDF viewer"
            style={{ borderRadius: 12, border: "1px solid #e0d4c3" }}
          />
        </div>
      )}

      {isVideo && (
        <div className="file-content">
          <video controls width="100%" style={{ borderRadius: 12, maxWidth: "720px", display: "block", margin: "0 auto" }}>
            <source src={fileUrl!} />
            Trình duyệt không hỗ trợ video.
          </video>
        </div>
      )}

      {isAudio && (
        <div className="file-content">
          <audio controls style={{ width: "100%" }}>
            <source src={fileUrl!} />
            Trình duyệt không hỗ trợ audio.
          </audio>
        </div>
      )}

      {isYoutube && (
        <div className="file-content" style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden", borderRadius: 12, marginBottom: 20 }}>
          <iframe
            src={getYoutubeEmbedUrl(fileUrl)}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", borderRadius: 12, border: "none" }}
          />
        </div>
      )}

      {isGoogleDrive && (
        <div className="file-content" style={{ marginBottom: 20 }}>
          <iframe
            src={getGoogleDriveEmbedUrl(fileUrl)}
            width="100%"
            height="500px"
            title="Google Drive player"
            style={{ borderRadius: 12, border: "1px solid #e0d4c3" }}
            allow="autoplay"
          />
        </div>
      )}

      {fileUrl && !isImage && !isPdf && !isVideo && !isAudio && !isYoutube && !isGoogleDrive && (
        <div className="file-download">
          <a href={fileUrl} target="_blank" rel="noreferrer">
            <FiFileText size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Tải file đính kèm
          </a>
        </div>
      )}

      {/* ────────────────── MINITEST SECTION ────────────────── */}
      <div className="detail-minitest-section" style={{ marginTop: 30, borderTop: "2px solid #eef2f6", paddingTop: 24 }}>
        <h3 style={{ color: "#000080", fontSize: "18px", fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <FiFileText size={20} style={{ color: "#F95800" }} />
          Bài kiểm tra nhanh (MiniTest)
        </h3>

        {minitest ? (
          <div className="minitest-detail-card" style={{
            background: "#ffffff",
            border: "1px solid #eef2f6",
            borderRadius: 12,
            padding: 20,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.02)"
          }}>
             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, borderBottom: "1px solid #f1f5f9", paddingBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "#64748b" }}>Số câu hỏi:</span>
                <strong style={{ fontSize: 14, color: "#1e293b", marginLeft: 6 }}>{minitestQuestions.length} câu</strong>
                {minitest.TrangThai === "draft" && (
                  <span style={{ fontSize: 11, color: "#f59e0b", background: "#fef3c7", padding: "2px 8px", borderRadius: 4, marginLeft: 8, fontWeight: 600 }}>Bản nháp</span>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div>
                  <span style={{ fontSize: 13, color: "#64748b" }}>Yêu cầu đạt:</span>
                  <strong style={{ fontSize: 13, color: "#16a34a", marginLeft: 6, background: "#dcfce7", padding: "2px 8px", borderRadius: 4 }}>100% câu đúng</strong>
                </div>
                <div style={{ display: "flex", gap: "8px", marginLeft: "12px", borderLeft: "1px solid #e2e8f0", paddingLeft: "12px" }}>
                  <button
                    onClick={() => navigate(`/create-exercise/${lesson.MaBuoiHoc}?maBaiHoc=${id}&isMiniTest=true`)}
                    style={{
                      background: "#e0e7ff",
                      border: "1px solid #c7d2fe",
                      color: "#4f46e5",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "30px",
                      height: "30px",
                      borderRadius: "50%",
                      transition: "all 0.2s",
                      flexShrink: 0
                    }}
                    title="Chỉnh sửa MiniTest"
                    onMouseOver={e => {
                      e.currentTarget.style.background = "#c7d2fe";
                      e.currentTarget.style.color = "#3730a3";
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.background = "#e0e7ff";
                      e.currentTarget.style.color = "#4f46e5";
                    }}
                  >
                    <FiEdit size={14} />
                  </button>
                  <button
                    onClick={handleDeleteMinitest}
                    style={{
                      background: "#fee2e2",
                      border: "1px solid #fecaca",
                      color: "#ef4444",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "30px",
                      height: "30px",
                      borderRadius: "50%",
                      transition: "all 0.2s",
                      flexShrink: 0
                    }}
                    title="Xóa MiniTest"
                    onMouseOver={e => {
                      e.currentTarget.style.background = "#fca5a5";
                      e.currentTarget.style.color = "#b91c1c";
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.background = "#fee2e2";
                      e.currentTarget.style.color = "#ef4444";
                    }}
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Questions List */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {minitestQuestions.map((q, qIdx) => (
                <div key={qIdx} style={{ paddingBottom: qIdx < minitestQuestions.length - 1 ? 16 : 0, borderBottom: qIdx < minitestQuestions.length - 1 ? "1px dashed #f1f5f9" : "none" }}>
                  <p style={{ fontWeight: 600, fontSize: 14, color: "#0f172a", margin: "0 0 10px 0" }}>
                    Câu {qIdx + 1}: {q.question}
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {q.answers?.map((text: string, aIdx: number) => {
                      const label = ["A", "B", "C", "D"][aIdx];
                      const isCorrect = label === q.correct;
                      return (
                        <div
                          key={label}
                          style={{
                            padding: "8px 12px",
                            borderRadius: 6,
                            border: `1px solid ${isCorrect ? "#bbf7d0" : "#e2e8f0"}`,
                            background: isCorrect ? "#f0fdf4" : "#ffffff",
                            color: isCorrect ? "#15803d" : "#475569",
                            fontSize: 13,
                            fontWeight: isCorrect ? 600 : 400,
                            display: "flex",
                            alignItems: "center"
                          }}
                        >
                          <span style={{ fontWeight: 700, marginRight: 6 }}>{label}.</span>
                          <span style={{ flex: 1 }}>{text}</span>
                          {isCorrect && <span style={{ marginLeft: 6 }}>✅</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{
            background: "#f8fafc",
            border: "1.5px dashed #cbd5e1",
            borderRadius: 12,
            padding: 24,
            textAlign: "center"
          }}>
            <p style={{ margin: "0 0 12px 0", color: "#64748b", fontSize: 14 }}>
              Bài giảng này chưa được tạo bài kiểm tra nhanh (MiniTest).
            </p>
            <button
              onClick={() => {
                if (lesson.MaBuoiHoc) {
                  navigate(`/create-exercise/${lesson.MaBuoiHoc}?maBaiHoc=${id}&isMiniTest=true`);
                } else {
                  alert("Không tìm thấy thông tin buổi học.");
                }
              }}
              style={{
                background: "#000080",
                color: "#ffffff",
                border: "none",
                padding: "8px 16px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 2px 4px rgba(0,0,128,0.15)",
                transition: "all 0.2s"
              }}
            >
              + Tạo MiniTest ngay
            </button>
          </div>
        )}
      </div>

      {confirmDialog.show && (
        <div className="modal-overlay" style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0, 0, 0, 0.4)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1001,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        }}>
          <div className="modal-container" style={{
            background: "#ffffff",
            padding: "32px 40px",
            borderRadius: "16px",
            width: "90%",
            maxWidth: "480px",
            textAlign: "center",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
          }}>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#1e293b", margin: "0 0 16px 0" }}>
              Xác nhận xóa
            </h3>
            <p style={{ fontSize: "14px", color: "#475569", margin: confirmDialog.subMessage ? "0 0 8px 0" : "0 0 24px 0", lineHeight: "1.5" }}>
              {confirmDialog.message}
            </p>
            {confirmDialog.subMessage && (
              <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 24px 0", lineHeight: "1.5" }}>
                {confirmDialog.subMessage}
              </p>
            )}
            <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
              <button
                type="button"
                onClick={() => setConfirmDialog(p => ({ ...p, show: false }))}
                style={{
                  background: "#f1f5f9",
                  color: "#475569",
                  border: "1px solid #cbd5e1",
                  padding: "10px 24px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                  transition: "all 0.2s"
                }}
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmDialog(p => ({ ...p, show: false }));
                  if (confirmDialog.onConfirm) confirmDialog.onConfirm();
                }}
                style={{
                  background: "#ef4444",
                  color: "#ffffff",
                  border: "none",
                  padding: "10px 24px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                  transition: "all 0.2s"
                }}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default LessonDetail;

