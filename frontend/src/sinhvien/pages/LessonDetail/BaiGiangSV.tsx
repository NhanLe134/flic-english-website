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
  const { maLopHoc } = location.state || {};

  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  const maNguoiDung = user.MaNguoiDung;

  const [maSinhVien, setMaSinhVien] = useState<number | null>(null);
  const [baiGiang, setBaiGiang] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Minitest & Progress states
  const [progress, setProgress] = useState<{ DaXemVideo: number; DaDatMinitest: number }>({ DaXemVideo: 0, DaDatMinitest: 0 });
  const [minitest, setMinitest] = useState<any>(null);
  const [minitestQuestions, setMinitestQuestions] = useState<any[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [assignments, setAssignments] = useState<any[]>([]);

  // Fetch student info
  useEffect(() => {
    if (!maNguoiDung || user.VaiTro !== "Sinh Viên") return;
    fetch(`${API}/students/by-user/${maNguoiDung}`)
      .then(r => r.json())
      .then(data => {
        if (data && data.MaSinhVien) {
          setMaSinhVien(data.MaSinhVien);
        }
      })
      .catch(err => console.error("Error fetching student info:", err));
  }, [maNguoiDung, user.VaiTro]);

  // Fetch student progress
  const fetchProgress = () => {
    if (!id || !maSinhVien) return;
    fetch(`${API}/student/progress/minitest/${id}/${maSinhVien}`)
      .then(res => res.json())
      .then(data => {
        setProgress(data);
      })
      .catch(err => console.error("Error fetching progress:", err));
  };

  useEffect(() => {
    if (id && maSinhVien) {
      fetchProgress();
    }
  }, [id, maSinhVien]);

  // Fetch lecture detail, minitest & assignments
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    
    // Fetch lecture detail
    fetch(`${API}/baigiang/detail/${id}`)
      .then(res => res.json())
      .then(data => {
        setBaiGiang(data);
        if (data && data.MaBuoiHoc) {
          // Fetch assignments for this lesson
          fetch(`${API}/baitap/buoihoc/${data.MaBuoiHoc}`)
            .then(res => res.json())
            .then(btData => {
              if (Array.isArray(btData)) {
                // Filter assignments for this specific lecture
                const list = btData.filter((ex: any) => ex.MaBaiHoc === Number(id));
                setAssignments(list);
              }
            })
            .catch(err => console.error("Error fetching assignments:", err));
        }
        try {
          const userId = user.MaNguoiDung;
          if (userId) {
            localStorage.setItem(`completed_lecture_${userId}_${id}`, "true");
          }
        } catch (e) {
          console.error("Error setting completed lecture in localStorage", e);
        }
      })
      .catch(err => console.log(err))
      .finally(() => setLoading(false));

    // Fetch minitest for this lecture
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

  const handleMarkVideoComplete = async () => {
    if (!id || !maSinhVien) return;
    try {
      await fetch(`${API}/student/progress/video/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ MaBaiHoc: Number(id), MaSinhVien: maSinhVien })
      });
      fetchProgress();
    } catch (err) {
      console.error("Lỗi khi đánh dấu xem video:", err);
    }
  };

  const handleQuizSubmit = async () => {
    if (minitestQuestions.length === 0) return;
    
    const unanswered = minitestQuestions.some((_, idx) => !selectedAnswers[idx]);
    if (unanswered) {
      alert("Vui lòng trả lời đầy đủ các câu hỏi của bài Minitest.");
      return;
    }

    const correctCount = minitestQuestions.reduce((acc, q, idx) => {
      const isCorrect = selectedAnswers[idx] === q.correct;
      return acc + (isCorrect ? 1 : 0);
    }, 0);

    const passed = correctCount === minitestQuestions.length;

      try {
        await fetch(`${API}/student/progress/minitest/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            MaBaiHoc: Number(id),
            MaSinhVien: maSinhVien,
            Passed: passed
          })
        });
        
        if (passed) {
          alert("Chúc mừng! Bạn đã vượt qua bài Minitest.");
          setProgress(prev => ({ ...prev, DaDatMinitest: 1 }));
        } else {
          alert("Bạn chưa đạt yêu cầu của Minitest! Hệ thống sẽ khóa lại bài giảng và bạn cần xem lại video để làm lại.");
          setSelectedAnswers({});
          setProgress({ DaXemVideo: 0, DaDatMinitest: 0 });
        }
      } catch (err) {
      console.error("Lỗi khi nộp bài Minitest:", err);
      alert("Có lỗi xảy ra khi nộp bài.");
    }
  };

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

  const rawFileUrl = baiGiang.FileUrl || null;
  const fileUrl = rawFileUrl ? (rawFileUrl.startsWith("http") ? rawFileUrl : `${API}${rawFileUrl}`) : null;
  const noiDung = baiGiang.NoiDung || "";

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
            {maLopHoc ? (
              <>
                <span className="ld2-link" onClick={() => navigate(`/class-detail/${maLopHoc}`)}>
                  Lớp học
                </span>
                <span>›</span>
                <span className="ld2-link" onClick={() => navigate(-1)}>
                  Buổi học
                </span>
              </>
            ) : (
              <span className="ld2-link" onClick={() => navigate("/MyCourses")}>
                Lớp học của tôi
              </span>
            )}
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
              <video controls width="100%" style={{ borderRadius: 12, maxWidth: "720px", display: "block", margin: "0 auto" }} onEnded={handleMarkVideoComplete}>
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

          {isYoutube && (
            <div style={{ marginBottom: 20, position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden", borderRadius: 12 }}>
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
            <div style={{ marginBottom: 20 }}>
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

          {/* FILE KHÁC */}
          {fileUrl && !isImage && !isPdf && !isVideo && !isAudio && !isYoutube && !isGoogleDrive && (
            <div style={{ marginBottom: 20 }}>
              <a href={fileUrl} target="_blank" rel="noreferrer"
                style={{ color: "#e87722", fontWeight: 600 }}>
                📄 Tải file đính kèm
              </a>
            </div>
          )}

          {/* ────────────────── TIẾN ĐỘ HỌC TẬP & MINITEST (CHỈ HIỂN THỊ VỚI SINH VIÊN) ────────────────── */}
          {user.VaiTro === "Sinh Viên" && (
            <div style={{ marginTop: 40, borderTop: "2px solid #e2e8f0", paddingTop: 30 }}>
              <h3 style={{ color: "#1e3a8a", fontSize: "20px", fontWeight: 700, marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
                🎯 Tiến Độ Học Tập
              </h3>

              {/* Progress Summary cards */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 30 }}>
                <div style={{
                  background: progress.DaXemVideo ? "#f0fdf4" : "#fef2f2",
                  border: `1px solid ${progress.DaXemVideo ? "#bbf7d0" : "#fecaca"}`,
                  padding: "16px 20px",
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 15
                }}>
                  <span style={{ fontSize: 24 }}>{progress.DaXemVideo ? "✅" : "❌"}</span>
                  <div>
                    <h4 style={{ margin: 0, fontWeight: 700, fontSize: 15, color: progress.DaXemVideo ? "#15803d" : "#991b1b" }}>Xem bài giảng</h4>
                    <p style={{ margin: "4px 0 0 0", fontSize: 13, color: "#6b7280" }}>
                      {progress.DaXemVideo ? "Hoàn thành" : "Chưa hoàn thành"}
                    </p>
                  </div>
                </div>

                {minitest && (
                  <div style={{
                    background: progress.DaDatMinitest ? "#f0fdf4" : "#fef2f2",
                    border: `1px solid ${progress.DaDatMinitest ? "#bbf7d0" : "#fecaca"}`,
                    padding: "16px 20px",
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 15
                  }}>
                    <span style={{ fontSize: 24 }}>{progress.DaDatMinitest ? "✅" : "❌"}</span>
                    <div>
                      <h4 style={{ margin: 0, fontWeight: 700, fontSize: 15, color: progress.DaDatMinitest ? "#15803d" : "#991b1b" }}>Vượt qua Minitest</h4>
                      <p style={{ margin: "4px 0 0 0", fontSize: 13, color: "#6b7280" }}>
                        {progress.DaDatMinitest ? "Đạt yêu cầu" : "Chưa đạt yêu cầu"}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Manual complete button (only show when DaXemVideo === 0) */}
              {progress.DaXemVideo === 0 && (
                <div style={{ textAlign: "center", background: "#f8fafc", padding: 20, borderRadius: 12, border: "1px solid #e2e8f0", marginBottom: 30 }}>
                  <p style={{ margin: "0 0 12px 0", color: "#475569", fontSize: 14, fontWeight: 500 }}>
                    Sau khi hoàn thành xem video hoặc đọc tài liệu bài học, vui lòng nhấn nút dưới đây để xác nhận học xong.
                  </p>
                  <button
                    onClick={handleMarkVideoComplete}
                    style={{
                      background: "linear-gradient(135deg, #1e3a8a, #3b82f6)",
                      color: "#fff",
                      border: "none",
                      padding: "12px 24px",
                      borderRadius: "30px",
                      fontSize: "14px",
                      fontWeight: 600,
                      cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(30, 58, 138, 0.2)",
                      transition: "all 0.2s"
                    }}
                  >
                    ✔️ Xác nhận đã hoàn thành bài giảng
                  </button>
                </div>
              )}

              {/* MINITEST QUIZ BLOCK */}
              {minitest && minitestQuestions.length > 0 && (
                <div style={{ background: "#fff", borderRadius: 16, padding: 30, boxShadow: "0 4px 20px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0", marginBottom: 30 }}>
                  <h4 style={{ color: "#1e3a8a", margin: "0 0 8px 0", fontSize: "18px", fontWeight: 700 }}>📝 Bài trắc nghiệm nhanh (Minitest)</h4>
                  <p style={{ color: "#64748b", fontSize: "13px", margin: "0 0 20px 0" }}>
                    Trả lời đúng 100% câu hỏi để mở khóa bài tập tự luyện. Nếu làm sai, bạn sẽ phải xem lại bài giảng để làm lại.
                  </p>

                  {progress.DaXemVideo === 0 ? (
                    <div style={{ background: "#fffbeb", border: "1px solid #fde68a", color: "#b45309", padding: "16px 20px", borderRadius: 10, display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 20 }}>🔒</span>
                      <span style={{ fontSize: 14, fontWeight: 500 }}>Bài Minitest sẽ mở khóa sau khi bạn xác nhận hoàn thành xem bài giảng ở trên.</span>
                    </div>
                  ) : progress.DaDatMinitest === 1 ? (
                    <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#065f46", padding: "16px 20px", borderRadius: 10, display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 20 }}>🎉</span>
                      <span style={{ fontSize: 14, fontWeight: 600 }}>Bạn đã vượt qua bài Minitest! Hãy làm các bài tập tự luyện bên dưới.</span>
                    </div>
                  ) : (
                    <div>
                      {minitestQuestions.map((q, qIdx) => (
                        <div key={qIdx} style={{ marginBottom: 25, borderBottom: qIdx < minitestQuestions.length - 1 ? "1px dashed #e2e8f0" : "none", paddingBottom: 20 }}>
                          <p style={{ fontWeight: 700, color: "#1e3a8a", fontSize: 15, margin: "0 0 12px 0" }}>
                            Câu {qIdx + 1}: {q.question}
                          </p>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                            {q.answers?.map((text: string, aIdx: number) => {
                              const label = ["A", "B", "C", "D"][aIdx];
                              const isSelected = selectedAnswers[qIdx] === label;
                              return (
                                <button
                                  key={label}
                                  onClick={() => setSelectedAnswers(prev => ({ ...prev, [qIdx]: label }))}
                                  style={{
                                    textAlign: "left",
                                    padding: "12px 16px",
                                    borderRadius: 8,
                                    border: `1.5px solid ${isSelected ? "#f95800" : "#e2e8f0"}`,
                                    background: isSelected ? "#fff7ed" : "#fff",
                                    color: isSelected ? "#ea580c" : "#334155",
                                    fontSize: 14,
                                    fontWeight: isSelected ? 600 : 500,
                                    cursor: "pointer",
                                    transition: "all 0.15s"
                                  }}
                                >
                                  <span style={{ fontWeight: 700, marginRight: 8 }}>{label}.</span>
                                  {text}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}

                      <div style={{ textAlign: "right" }}>
                        <button
                          onClick={handleQuizSubmit}
                          style={{
                            background: "linear-gradient(135deg, #f95800, #ff7e40)",
                            color: "#fff",
                            border: "none",
                            padding: "12px 28px",
                            borderRadius: "30px",
                            fontSize: "15px",
                            fontWeight: 600,
                            cursor: "pointer",
                            boxShadow: "0 4px 15px rgba(249, 88, 0, 0.3)",
                            transition: "all 0.2s"
                          }}
                        >
                          Nộp bài Minitest
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ASSIGNMENTS / HOMEWORK LIST SECTION */}
              <div style={{ background: "#fff", borderRadius: 16, padding: 30, boxShadow: "0 4px 20px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0", marginBottom: 30 }}>
                <h4 style={{ color: "#1e3a8a", margin: "0 0 15px 0", fontSize: "18px", fontWeight: 700 }}>📝 Bài Tập Tự Luyện</h4>
                
                {(!progress.DaXemVideo || (minitest && !progress.DaDatMinitest)) ? (
                  <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "20px", borderRadius: 10, textAlign: "center", color: "#64748b" }}>
                    <span style={{ fontSize: 32, display: "block", marginBottom: 10 }}>🔒</span>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>
                      Bạn cần hoàn thành xem bài giảng và vượt qua Minitest (nếu có) để mở khóa danh sách bài tập tự luyện.
                    </p>
                  </div>
                ) : assignments.length === 0 ? (
                  <p style={{ color: "#64748b", margin: 0, fontSize: 14 }}>Không có bài tập tự luyện nào cho bài giảng này.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
                    {assignments.map((ex) => (
                      <div key={ex.MaBaiTap} style={{
                        border: "1px solid #e2e8f0",
                        borderRadius: 12,
                        padding: "16px 20px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        background: "#fff",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                        transition: "all 0.2s",
                        cursor: "pointer"
                      }}
                      onClick={() => navigate(`/baitap/${ex.MaBaiTap}`, { state: { maLopHoc } })}
                      >
                        <div>
                          <span style={{
                            display: "inline-block",
                            background: "#eff6ff",
                            color: "#1d4ed8",
                            padding: "3px 8px",
                            borderRadius: 6,
                            fontSize: 11,
                            fontWeight: 700,
                            textTransform: "uppercase",
                            marginBottom: 8
                          }}>
                            {ex.Type === "listening-mcq" ? "Listening" : 
                             ex.Type === "reading-split" ? "Reading" : 
                             ex.Type === "writing-essay" ? "Writing" : "Practice"}
                          </span>
                          <h5 style={{ margin: 0, fontSize: 16, color: "#1e3a8a", fontWeight: 700 }}>{ex.Title}</h5>
                        </div>
                        <span style={{
                          color: "#f95800",
                          fontWeight: 600,
                          fontSize: 14,
                          display: "flex",
                          alignItems: "center",
                          gap: 5
                        }}>
                          Làm bài tập ➔
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
  );
}

export default BaiGiangSV;
