import "./LessonDetailSV.css";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FiPlay, FiPause, FiVolume2, FiVolumeX, FiSettings, FiMaximize, FiMinimize } from "react-icons/fi";

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

const formatTime = (timeInSeconds: number) => {
  if (isNaN(timeInSeconds)) return "00:00";
  const mins = Math.floor(timeInSeconds / 60);
  const secs = Math.floor(timeInSeconds % 60);
  return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
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

  // Video Ref & Control states
  const videoRef = useRef<HTMLVideoElement>(null);
  const prevTimeRef = useRef<number>(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<any>(null);

  // Mock Minitest Data Helper
  const useMockMinitest = () => {
    const mockQuestions = [
      {
        question: "Theo bài giảng video, quy tắc cơ bản nhất để ghi nhớ từ vựng lâu dài là gì?",
        answers: [
          "Lặp lại ngắt quãng (Spaced Repetition) và áp dụng vào ngữ cảnh thực tế",
          "Học thuộc lòng cả danh sách từ vựng trong một ngày",
          "Viết đi viết lại từ vựng đó 100 lần",
          "Chỉ tra nghĩa tiếng Việt mà không cần thực hành đặt câu"
        ],
        correct: "A"
      },
      {
        question: "Khi luyện nghe tiếng Anh giao tiếp qua video, bạn nên ưu tiên điều gì trước?",
        answers: [
          "Nghe hiểu ý chính và ngữ điệu trước khi đi sâu vào từng từ đơn lẻ",
          "Ghi chép lại từng từ nghe được và tra từ điển ngay lập tức",
          "Bật phụ đề tiếng Việt để dịch trực tiếp",
          "Chỉ nghe những bài cực khó vượt quá trình độ bản thân"
        ],
        correct: "A"
      },
      {
        question: "Nút điều chỉnh tốc độ (Playback Speed) hữu ích như thế nào khi luyện nghe?",
        answers: [
          "Giúp giảm tốc độ khi gặp đoạn khó nghe và tăng tốc độ để luyện phản xạ nghe nhanh",
          "Giúp hoàn thành bài học nhanh hơn mà không cần hiểu nội dung",
          "Chỉ có tác dụng giải trí, không hỗ trợ quá trình học tập",
          "Bắt buộc luôn phải nghe ở tốc độ 2.0x"
        ],
        correct: "A"
      }
    ];
    setMinitest({
      MaMinitest: 999,
      TieuDe: "Bài kiểm tra nhanh (Minitest Mock)"
    });
    setMinitestQuestions(mockQuestions);
  };

  // Fetch student info
  useEffect(() => {
    if (!maNguoiDung || (user.VaiTro !== "Sinh Viên" && user.VaiTro !== "Học Viên")) return;
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
    fetch(`${API}/minitest/baigiang/${id}?role=student`)
      .then(res => res.json())
      .then(data => {
        if (data && data.MaMinitest) {
          setMinitest(data);
          try {
            if (data.CauHoi) {
              setMinitestQuestions(JSON.parse(data.CauHoi));
            } else {
              useMockMinitest();
            }
          } catch (e) {
            console.error("Error parsing minitest questions:", e);
            useMockMinitest();
          }
        } else {
          useMockMinitest();
        }
      })
      .catch(err => {
        console.error("Error fetching minitest:", err);
        useMockMinitest();
      });
  }, [id]);

  // Update playbackRate on the video element
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch(err => console.error("Error playing video:", err));
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    const nextMute = !isMuted;
    video.muted = nextMute;
    setIsMuted(nextMute);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const val = parseFloat(e.target.value);
    video.volume = val;
    setVolume(val);
    if (val > 0 && isMuted) {
      video.muted = false;
      setIsMuted(false);
    }
  };

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const targetTime = parseFloat(e.target.value);
    
    if (progress.DaXemVideo === 0) {
      if (targetTime < prevTimeRef.current) {
        return;
      }
    }
    video.currentTime = targetTime;
    setCurrentTime(targetTime);
    prevTimeRef.current = targetTime;
  };

  const toggleFullscreen = () => {
    const container = videoRef.current?.parentElement;
    if (!container) return;
    
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(err => {
        console.error("Error attempting to enable fullscreen:", err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) {
        setShowControls(false);
      }
    }, 2500);
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (showSettings) {
        const settingsContainer = document.querySelector(".video-settings-container");
        if (settingsContainer && !settingsContainer.contains(e.target as Node)) {
          setShowSettings(false);
        }
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [showSettings]);

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
    }
    setIsPlaying(true);
  };

  const handleTimeUpdate = (e: any) => {
    const video = e.target;
    const currTime = video.currentTime;
    
    // Only block backward seek if video is not completed yet
    if (progress.DaXemVideo === 0) {
      // Allow a small margin of 1.5 seconds to handle normal playback fluctuations
      if (currTime < prevTimeRef.current - 1.5) {
        video.currentTime = prevTimeRef.current;
        setCurrentTime(prevTimeRef.current);
        return;
      }
    }
    setCurrentTime(currTime);
    prevTimeRef.current = currTime;
  };

  const handleSeeking = (e: any) => {
    const video = e.target;
    if (progress.DaXemVideo === 0) {
      if (video.currentTime < prevTimeRef.current - 1.5) {
        video.currentTime = prevTimeRef.current;
      }
    }
  };

  const handleMarkVideoComplete = async () => {
    // Optimistically update local state to unlock Minitest immediately
    setProgress(prev => ({ ...prev, DaXemVideo: 1 }));
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

    // Optimistically handle student feedback and mock environment
    if (passed) {
      alert("Chúc mừng! Bạn đã vượt qua bài Minitest.");
      setProgress(prev => ({ ...prev, DaDatMinitest: 1 }));
    } else {
      alert("Bạn chưa đạt yêu cầu của Minitest! Hệ thống sẽ khóa lại bài giảng và bạn cần xem lại video để làm lại.");
      setSelectedAnswers({});
      setProgress({ DaXemVideo: 0, DaDatMinitest: 0 });
      // Reset video playback position to 0
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
      }
      prevTimeRef.current = 0;
    }

    if (!id || !maSinhVien) return;
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
      fetchProgress();
    } catch (err) {
      console.error("Lỗi khi nộp bài Minitest:", err);
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



  return (
        <div className="ld2-content">

          {/* Quay lại — trên đầu */}
          <span
            className="ld2-link"
            style={{ display: "inline-block", marginBottom: 20, cursor: "pointer", color: "#F95800", fontWeight: 700, fontSize: "14px" }}
            onClick={() => navigate(-1)}
          >
            ← Quay lại
          </span>

          {/* Tiêu đề (Không có khung chứa và không có icon) */}
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: "24px", fontWeight: 800, color: "#000080", margin: "0 0 6px 0" }}>
              {baiGiang.TieuDe}
            </h2>
            <p style={{ fontSize: "14px", color: "#64748b", margin: 0, fontWeight: 600 }}>
              {baiGiang.LoaiBaiHoc} • {baiGiang.ThoiLuong}
            </p>
          </div>

          {/* NỘI DUNG MARKDOWN (Không dùng khung chứa) */}
          {noiDung && (
            <div style={{ marginBottom: 24, lineHeight: 1.8, color: "#334155" }}>
              {noiDung.trimStart().startsWith("<") ? (
                <div dangerouslySetInnerHTML={{ __html: noiDung }} />
              ) : (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {unescapeMarkdown(noiDung)}
                </ReactMarkdown>
              )}
            </div>
          )}

          {/* VIDEO PLAYER SECTION (Always shown with mock fallback) */}
          {(() => {
            // Determine if the actual file is a video, otherwise use the high quality mock video
            const finalFileUrl = (fileUrl && /\.(mp4|webm|ogg)$/i.test(fileUrl) && !fileUrl.includes("drive.google.com"))
              ? fileUrl
              : "https://www.w3schools.com/html/mov_bbb.mp4"; // Premium sample video for mock purposes

            return (
              <div
                className="custom-video-wrapper"
                onMouseMove={handleMouseMove}
                onMouseLeave={() => isPlaying && setShowControls(false)}
              >
                <video
                  key={finalFileUrl}
                  ref={videoRef}
                  width="100%"
                  style={{
                    display: "block",
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    background: "#000"
                  }}
                  onClick={togglePlay}
                  onPlay={handlePlay}
                  onPause={() => setIsPlaying(false)}
                  onTimeUpdate={handleTimeUpdate}
                  onSeeking={handleSeeking}
                  onEnded={handleMarkVideoComplete}
                  onLoadedMetadata={(e: any) => setDuration(e.target.duration || 0)}
                >
                  <source src={finalFileUrl} type="video/mp4" />
                  Trình duyệt không hỗ trợ xem video trực tiếp.
                </video>

                {/* Big Play Overlay Button (only show when paused) */}
                {!isPlaying && (
                  <div
                    onClick={togglePlay}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "rgba(0,0,0,0.3)",
                      cursor: "pointer",
                      zIndex: 2
                    }}
                  >
                    <div
                      style={{
                        width: "72px",
                        height: "72px",
                        borderRadius: "50%",
                        background: "rgba(249, 88, 0, 0.9)",
                        color: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "28px",
                        transition: "all 0.3s ease",
                        boxShadow: "0 0 0 0 rgba(249, 88, 0, 0.4)",
                        paddingLeft: "5px"
                      }}
                    >
                      <FiPlay />
                    </div>
                  </div>
                )}

                {/* Custom Control Bar Overlay */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: "linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.4) 60%, transparent 100%)",
                    padding: "16px 20px 12px 20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    transition: "opacity 0.3s ease, transform 0.3s ease",
                    opacity: showControls || showSettings ? 1 : 0,
                    transform: showControls || showSettings ? "translateY(0)" : "translateY(10px)",
                    pointerEvents: showControls || showSettings ? "auto" : "none",
                    zIndex: 10
                  }}
                >
                  {/* Scrubber / Progress timeline */}
                  <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                    <input
                      type="range"
                      min={0}
                      max={duration || 100}
                      step={0.1}
                      value={currentTime}
                      onChange={handleScrub}
                      className="ld2-video-scrubber"
                      style={{
                        background: `linear-gradient(to right, #F95800 0%, #F95800 ${(currentTime / (duration || 1)) * 100}%, rgba(255, 255, 255, 0.3) ${(currentTime / (duration || 1)) * 100}%, rgba(255, 255, 255, 0.3) 100%)`
                      }}
                    />
                  </div>

                  {/* Buttons row */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    {/* Left controls: Play/Pause and Time */}
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <button
                        onClick={togglePlay}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#fff",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          fontSize: "20px",
                          padding: 0
                        }}
                      >
                        {isPlaying ? <FiPause /> : <FiPlay />}
                      </button>

                      <span style={{ color: "#fff", fontSize: "13px", fontWeight: 500, fontFamily: "monospace" }}>
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>

                    {/* Right controls: Mute, Settings Gear, and Fullscreen */}
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      {/* Speaker / Mute Button */}
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <button
                          onClick={toggleMute}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#fff",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            fontSize: "20px",
                            padding: 0
                          }}
                          title={isMuted ? "Unmute" : "Mute"}
                        >
                          {isMuted || volume === 0 ? <FiVolumeX /> : <FiVolume2 />}
                        </button>
                        
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.05}
                          value={isMuted ? 0 : volume}
                          onChange={handleVolumeChange}
                          className="ld2-volume-slider"
                          style={{
                            background: `linear-gradient(to right, #F95800 0%, #F95800 ${(isMuted ? 0 : volume) * 100}%, rgba(255, 255, 255, 0.3) ${(isMuted ? 0 : volume) * 100}%, rgba(255, 255, 255, 0.3) 100%)`
                          }}
                        />
                      </div>

                      {/* Playback speed Gear Button */}
                      <div className="video-settings-container" style={{ position: "relative" }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowSettings(!showSettings);
                          }}
                          style={{
                            background: "none",
                            border: "none",
                            color: showSettings ? "#F95800" : "#fff",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            fontSize: "20px",
                            padding: 0,
                            transition: "color 0.2s"
                          }}
                          title="Tốc độ phát"
                        >
                          <FiSettings />
                        </button>

                        {/* Translucent / Glassmorphism Settings Dropdown */}
                        {showSettings && (
                          <div className="ld2-translucent-dropdown">
                            <div style={{ fontSize: "11px", fontWeight: 800, color: "rgba(255, 255, 255, 0.6)", marginBottom: "4px", textAlign: "center", textTransform: "uppercase", letterSpacing: "0.05em" }}>Tốc độ phát</div>
                            {[1, 1.25, 1.5, 1.75, 2].map((rate) => {
                              const isSelected = playbackRate === rate;
                              return (
                                <button
                                  key={rate}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPlaybackRate(rate);
                                    setShowSettings(false);
                                  }}
                                  style={{
                                    background: isSelected ? "#F95800" : "transparent",
                                    color: "#ffffff",
                                    border: "none",
                                    padding: "6px 10px",
                                    borderRadius: "6px",
                                    fontSize: "13px",
                                    fontWeight: 700,
                                    cursor: "pointer",
                                    textAlign: "left",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    transition: "all 0.15s ease"
                                  }}
                                  onMouseEnter={(e) => {
                                    if (!isSelected) {
                                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    if (!isSelected) {
                                      e.currentTarget.style.background = "transparent";
                                    }
                                  }}
                                >
                                  <span>{rate}x</span>
                                  {isSelected && <span style={{ fontSize: "11px" }}>✓</span>}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Fullscreen Button */}
                      <button
                        onClick={toggleFullscreen}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#fff",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          fontSize: "20px",
                          padding: 0
                        }}
                        title="Toàn màn hình"
                      >
                        {isFullscreen ? <FiMinimize /> : <FiMaximize />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ────────────────── MINITEST & BÀI TẬP (CHỈ HIỂN THỊ VỚI SINH VIÊN) ────────────────── */}
          {(user.VaiTro === "Sinh Viên" || user.VaiTro === "Học Viên") && (
            <div style={{ marginTop: 40, borderTop: "2px solid #e2e8f0", paddingTop: 30 }}>
              
              {progress.DaXemVideo === 0 ? (
                /* Locked placeholder when video is not finished */
                <div style={{
                  background: "#f8fafc",
                  border: "1.5px dashed #cbd5e1",
                  padding: "40px 20px",
                  borderRadius: 16,
                  textAlign: "center",
                  color: "#64748b",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.01)"
                }}>
                  <h4 style={{ margin: "0 0 8px 0", color: "#000080", fontWeight: 700, fontSize: 16 }}>Nội dung bài kiểm tra Minitest</h4>
                  <p style={{ fontSize: 13, color: "#64748b", maxWidth: "500px", margin: "0 auto" }}>
                    Bài trắc nghiệm nhanh (Minitest) sẽ tự động hiển thị tại đây ngay sau khi bạn xem hết video bài giảng ở trên.
                  </p>
                </div>
              ) : (
                /* Unlocked Minitest & Practice block when video is finished */
                <>
                  {minitest && minitestQuestions.length > 0 && (
                    <div style={{
                      background: "#ffffff",
                      borderRadius: 16,
                      padding: 30,
                      boxShadow: "0 10px 30px rgba(0, 0, 80, 0.04)",
                      border: "1px solid #e2e8f0",
                      marginBottom: 30
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9", paddingBottom: 15, marginBottom: 20 }}>
                        <div>
                          <h4 style={{ color: "#000080", margin: 0, fontSize: "18px", fontWeight: 800 }}>Bài trắc nghiệm nhanh (Minitest)</h4>
                          <p style={{ color: "#64748b", fontSize: "13px", margin: "4px 0 0 0" }}>
                            Trả lời đúng 100% câu hỏi để hoàn thành và mở khóa các bài tập tự luyện.
                          </p>
                        </div>
                        {progress.DaDatMinitest === 1 && (
                          <span style={{
                            background: "#ecfdf5",
                            color: "#059669",
                            padding: "6px 14px",
                            borderRadius: "30px",
                            fontSize: "13px",
                            fontWeight: 700,
                            border: "1px solid #a7f3d0"
                          }}>
                            Đã Đạt Yêu Cầu
                          </span>
                        )}
                      </div>

                      {progress.DaDatMinitest === 1 ? (
                        <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#065f46", padding: "16px 20px", borderRadius: 12 }}>
                          <span style={{ fontSize: 14, fontWeight: 600 }}>Chúc mừng! Bạn đã vượt qua bài Minitest thành công. Hãy ôn tập qua các bài tập tự luyện dưới đây.</span>
                        </div>
                      ) : (
                        <div>
                          {minitestQuestions.map((q, qIdx) => (
                            <div key={qIdx} style={{ marginBottom: 25, borderBottom: qIdx < minitestQuestions.length - 1 ? "1px dashed #e2e8f0" : "none", paddingBottom: 25 }}>
                              <p style={{ fontWeight: 700, color: "#000080", fontSize: 15, margin: "0 0 16px 0" }}>
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
                                        padding: "14px 18px",
                                        borderRadius: 10,
                                        border: `1.5px solid ${isSelected ? "#F95800" : "#e2e8f0"}`,
                                        background: isSelected ? "#fff7ed" : "#fff",
                                        color: isSelected ? "#F95800" : "#334155",
                                        fontSize: 14,
                                        fontWeight: isSelected ? 700 : 500,
                                        cursor: "pointer",
                                        transition: "all 0.15s ease",
                                        boxShadow: isSelected ? "0 4px 12px rgba(249, 88, 0, 0.05)" : "none"
                                      }}
                                    >
                                      <span style={{ fontWeight: 800, marginRight: 8, color: isSelected ? "#F95800" : "#64748b" }}>{label}.</span>
                                      {text}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}

                          <div style={{ textAlign: "right", marginTop: 20 }}>
                            <button
                              onClick={handleQuizSubmit}
                              style={{
                                background: "linear-gradient(135deg, #F95800, #ff7e40)",
                                color: "#fff",
                                border: "none",
                                padding: "12px 32px",
                                borderRadius: "30px",
                                fontSize: "15px",
                                fontWeight: 700,
                                cursor: "pointer",
                                boxShadow: "0 4px 15px rgba(249, 88, 0, 0.25)",
                                transition: "all 0.2s ease"
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
                  <div style={{ background: "#fff", borderRadius: 16, padding: 30, boxShadow: "0 10px 30px rgba(0, 0, 80, 0.04)", border: "1px solid #e2e8f0", marginBottom: 30 }}>
                    <h4 style={{ color: "#000080", margin: "0 0 15px 0", fontSize: "18px", fontWeight: 800 }}>Bài Tập Tự Luyện</h4>
                    
                    {assignments.length === 0 ? (
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
                              <h5 style={{ margin: 0, fontSize: 16, color: "#000080", fontWeight: 700 }}>{ex.Title}</h5>
                            </div>
                            <span style={{
                              color: "#F95800",
                              fontWeight: 600,
                              fontSize: 14,
                              display: "flex",
                              alignItems: "center",
                              gap: 5
                            }}>
                              Làm bài tập
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

        </div>
  );
}

export default BaiGiangSV;
