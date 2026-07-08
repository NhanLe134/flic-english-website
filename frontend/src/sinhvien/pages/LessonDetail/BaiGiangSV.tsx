import "./LessonDetailSV.css";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FiPlay, FiPause, FiVolume2, FiVolumeX, FiSettings, FiMaximize, FiMinimize, FiCheckCircle, FiLock, FiXCircle, FiFileText } from "react-icons/fi";

const API = "http://14.225.192.252:5000";

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

const getMediaType = (url: string | null): "youtube" | "drive" | "video" | "document" | "none" => {
  if (!url) return "none";
  const u = url.toLowerCase().trim();
  if (u.includes("youtube.com") || u.includes("youtu.be")) return "youtube";
  if (u.includes("drive.google.com")) return "drive";
  if (/\.(mp4|webm|ogg)$/i.test(u)) return "video";
  return "document";
};

const getYouTubeVideoId = (url: string | null): string | null => {
  if (!url) return null;
  let videoId = "";
  if (url.includes("youtu.be/")) {
    videoId = url.split("youtu.be/")[1]?.split(/[?#]/)[0] || "";
  } else if (url.includes("youtube.com/watch")) {
    const searchParams = new URLSearchParams(url.split("?")[1] || "");
    videoId = searchParams.get("v") || "";
  } else if (url.includes("youtube.com/embed/")) {
    videoId = url.split("youtube.com/embed/")[1]?.split(/[?#]/)[0] || "";
  }
  return videoId || null;
};

function BaiGiangSV() {
  const navigate = useNavigate();
  const { id, classId, lessonId } = useParams<{ id: string; classId?: string; lessonId?: string }>();
  const location = useLocation();
  const stateData = location.state || {};
  const maLopHoc = classId || stateData.maLopHoc;
  const maBuoiHoc = lessonId || stateData.maBuoiHoc;

  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  const maNguoiDung = user.MaNguoiDung;

  const [maSinhVien, setMaSinhVien] = useState<number | null>(null);
  const [baiGiang, setBaiGiang] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Minitest & Progress states
  const [progress, setProgress] = useState<{ DaXemVideo: number; DaDatMinitest: number }>({ DaXemVideo: 0, DaDatMinitest: 0 });
  const [minitest, setMinitest] = useState<any>(null);
  const [minitestQuestions, setMinitestQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [currentAnswer, setCurrentAnswer] = useState<string>("");
  const [showQuizAlert, setShowQuizAlert] = useState<boolean>(false);
  const [quizAlertStatus, setQuizAlertStatus] = useState<'success' | 'error' | null>(null);
  const [quizAlertMessage, setQuizAlertMessage] = useState<string>("");

  // Video Ref & Control states
  const videoRef = useRef<HTMLVideoElement>(null);
  const prevTimeRef = useRef<number>(0);
  const maxTimeWatchedRef = useRef<number>(0);
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

  const rawFileUrl = baiGiang?.FileUrl || null;
  const fileUrl = rawFileUrl ? (rawFileUrl.startsWith("http") ? rawFileUrl : `${API}${rawFileUrl}`) : null;
  const mediaType = getMediaType(fileUrl);
  const ytPlayerRef = useRef<any>(null);



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
        if (data && data.DaXemVideo === 1) {
          maxTimeWatchedRef.current = 999999;
        }
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
              setMinitestQuestions([]);
            }
          } catch (e) {
            console.error("Error parsing minitest questions:", e);
            setMinitestQuestions([]);
          }
        } else {
          setMinitest(null);
          setMinitestQuestions([]);
        }
      })
      .catch(err => {
        console.error("Error fetching minitest:", err);
        setMinitest(null);
        setMinitestQuestions([]);
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
      if (targetTime > maxTimeWatchedRef.current + 0.1) {
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
    
    if (progress.DaXemVideo === 0) {
      if (video.seeking) {
        if (currTime > maxTimeWatchedRef.current + 0.1) {
          video.currentTime = maxTimeWatchedRef.current;
          setCurrentTime(maxTimeWatchedRef.current);
          return;
        }
      }

      if (currTime > maxTimeWatchedRef.current + 1.0) {
        video.currentTime = maxTimeWatchedRef.current;
        setCurrentTime(maxTimeWatchedRef.current);
        return;
      }
      
      if (!video.seeking && currTime > maxTimeWatchedRef.current) {
        if (currTime - maxTimeWatchedRef.current <= 1.0) {
          maxTimeWatchedRef.current = currTime;
        } else {
          video.currentTime = maxTimeWatchedRef.current;
          setCurrentTime(maxTimeWatchedRef.current);
          return;
        }
      }
    }
    setCurrentTime(currTime);
    prevTimeRef.current = currTime;
  };

  const handleSeeking = (e: any) => {
    const video = e.target;
    if (progress.DaXemVideo === 0) {
      if (video.currentTime > maxTimeWatchedRef.current + 0.1) {
        video.currentTime = maxTimeWatchedRef.current;
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

  useEffect(() => {
    if (mediaType !== "youtube" || !fileUrl) return;

    const videoId = getYouTubeVideoId(fileUrl);
    if (!videoId) return;

    // Load the Iframe Player API code asynchronously.
    if (!(window as any).YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      }
    }

    let intervalId: any;

    const createPlayer = () => {
      const container = document.getElementById("youtube-player-container");
      if (container) {
        container.innerHTML = '<div id="youtube-player" style="width: 100%; height: 100%;"></div>';
      }

      ytPlayerRef.current = new (window as any).YT.Player("youtube-player", {
        height: "100%",
        width: "100%",
        videoId: videoId,
        playerVars: {
          controls: 1,
          disablekb: 1,
          fs: 1,
          modestbranding: 1,
          rel: 0,
          showinfo: 0
        },
        events: {
          onStateChange: (event: any) => {
            if (event.data === (window as any).YT.PlayerState.ENDED) {
              handleMarkVideoComplete();
            }
          },
          onReady: () => {
            // Start checking time
            intervalId = setInterval(() => {
              const player = ytPlayerRef.current;
              if (player && typeof player.getCurrentTime === "function" && typeof player.getPlayerState === "function") {
                const state = player.getPlayerState();
                if (state === (window as any).YT.PlayerState.PLAYING) {
                  const currentTime = player.getCurrentTime();
                  if (progress.DaXemVideo === 0) {
                    if (currentTime > maxTimeWatchedRef.current + 1.5) {
                      player.seekTo(maxTimeWatchedRef.current, true);
                    } else if (currentTime > maxTimeWatchedRef.current) {
                      maxTimeWatchedRef.current = currentTime;
                    }
                  }
                }
              }
            }, 250);
          }
        }
      });
    };

    // If API is already ready, call directly. Otherwise, register onYouTubeIframeAPIReady callback.
    if ((window as any).YT && (window as any).YT.Player) {
      createPlayer();
    } else {
      const previousCallback = (window as any).onYouTubeIframeAPIReady;
      (window as any).onYouTubeIframeAPIReady = () => {
        if (previousCallback) previousCallback();
        createPlayer();
      };
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (ytPlayerRef.current && typeof ytPlayerRef.current.destroy === "function") {
        ytPlayerRef.current.destroy();
      }
    };
  }, [mediaType, fileUrl, progress.DaXemVideo]);

  const handleCloseAlert = () => {
    setShowQuizAlert(false);
    if (quizAlertStatus === "error") {
      setCurrentAnswer("");
      setCurrentQuestionIndex(0);
      setProgress({ DaXemVideo: 0, DaDatMinitest: 0 });
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
      }
      prevTimeRef.current = 0;
      maxTimeWatchedRef.current = 0;
    } else if (quizAlertStatus === "success") {
      setProgress(prev => ({ ...prev, DaDatMinitest: 1 }));
      setCurrentAnswer("");
      setCurrentQuestionIndex(0);
      if (maLopHoc && maBuoiHoc) {
        navigate(`/MyCourses/${maLopHoc}/${maBuoiHoc}/lt`);
      } else {
        navigate(-1);
      }
    }
  };

  const handleQuizSubmit = async () => {
    if (minitestQuestions.length === 0) return;
    
    if (!currentAnswer) {
      alert("Vui lòng chọn một đáp án.");
      return;
    }

    const currentQ = minitestQuestions[currentQuestionIndex];
    const isCorrect = currentAnswer === currentQ.correct;

    if (!isCorrect) {
      setQuizAlertStatus("error");
      if (mediaType === "document") {
        setQuizAlertMessage("Bạn đã trả lời sai! Bạn cần xem/tải lại tài liệu để làm lại bài trắc nghiệm.");
      } else {
        setQuizAlertMessage("Bạn đã trả lời sai! Bạn cần xem lại video từ đầu để làm lại bài trắc nghiệm.");
      }
      setShowQuizAlert(true);

      if (!id || !maSinhVien) return;
      try {
        await fetch(`${API}/student/progress/minitest/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            MaBaiHoc: Number(id),
            MaSinhVien: maSinhVien,
            Passed: false
          })
        });
        fetchProgress();
      } catch (err) {
        console.error("Lỗi khi nộp bài Minitest:", err);
      }
      return;
    }

    const isLastQuestion = currentQuestionIndex === minitestQuestions.length - 1;

    if (isLastQuestion) {
      if (id && maSinhVien) {
        try {
          await fetch(`${API}/student/progress/minitest/submit`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              MaBaiHoc: Number(id),
              MaSinhVien: maSinhVien,
              Passed: true
            })
          });
          fetchProgress();
        } catch (err) {
          console.error("Lỗi khi nộp bài Minitest:", err);
        }
      }

      setQuizAlertStatus("success");
      setQuizAlertMessage("Chúc mừng! Các bài tập thực hành của buổi học đã được mở khóa dành cho bạn.");
      setShowQuizAlert(true);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setCurrentAnswer("");
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

  const noiDung = baiGiang.NoiDung || "";

  return (
    <div className="ld2-content anim-fade-in" style={{ backgroundColor: "#f8fafc" }}>
      {/* Nút Quay lại */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
        <span
          className="ld2-link"
          style={{
            cursor: "pointer",
            color: "#F95800",
            fontWeight: 800,
            fontSize: "14px",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            transition: "all 0.2s"
          }}
          onClick={() => {
            if (location.pathname.includes("/hoc-thu-sv/")) {
              navigate(`/hoc-thu-sv/${classId}/${lessonId}/bg`);
            } else if (classId && lessonId) {
              navigate(`/MyCourses/${classId}/${lessonId}/bg`);
            } else {
              navigate(-1);
            }
          }}
        >
          ← Quay lại danh sách bài học
        </span>
      </div>

      {/* Grid Layout 2 Cột */}
      <div className="ld2-layout-grid">
        {/* Cột chính bên trái: Video + Giáo trình lý thuyết + Bài tập tự luyện */}
        <div className="ld2-main-col">
          {/* Khung chứa Video Player */}
          {(() => {
            const getGoogleDrivePreviewUrl = (url: string): string => {
              if (url.includes("/view")) {
                return url.replace("/view", "/preview");
              }
              if (!url.endsWith("/preview") && url.includes("/file/d/")) {
                const parts = url.split("/file/d/");
                const fileId = parts[1]?.split("/")[0] || "";
                return `https://drive.google.com/file/d/${fileId}/preview`;
              }
              return url;
            };

            const renderQuizOverlay = () => {
              return (
                <div className="video-quiz-overlay" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10, background: "rgba(0,0,0,0.4)" }}>
                  <div className="video-quiz-card anim-fade-in" style={{ background: "#fff", padding: "20px", borderRadius: "12px", width: "90%", maxWidth: "450px", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1.5px solid #f1f5f9", paddingBottom: "10px" }}>
                      <h4 style={{ margin: 0, color: "#000080", fontSize: "15px", fontWeight: 800 }}>
                        {minitest?.TieuDe || "Câu hỏi tương tác"} ({currentQuestionIndex + 1}/{minitestQuestions.length})
                      </h4>
                    </div>

                    {(() => {
                      const currentQ = minitestQuestions[currentQuestionIndex];
                      if (!currentQ) return null;
                      return (
                        <div>
                          <p style={{ fontWeight: 700, color: "#1e293b", fontSize: "14px", margin: "0 0 16px 0", lineHeight: 1.5 }}>
                            {currentQ.question}
                          </p>
                          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                            {currentQ.answers?.map((text: string, aIdx: number) => {
                              const label = ["A", "B", "C", "D"][aIdx];
                              const isSelected = currentAnswer === label;
                              return (
                                <button
                                  key={label}
                                  onClick={() => setCurrentAnswer(label)}
                                  style={{
                                    textAlign: "left",
                                    padding: "12px 14px",
                                    borderRadius: "10px",
                                    border: `1.5px solid ${isSelected ? "#F95800" : "#e2e8f0"}`,
                                    background: isSelected ? "#fff7ed" : "#fff",
                                    color: isSelected ? "#F95800" : "#334155",
                                    fontSize: "13px",
                                    fontWeight: isSelected ? 700 : 500,
                                    cursor: "pointer",
                                    transition: "all 0.15s ease",
                                    lineHeight: 1.4
                                  }}
                                >
                                  <span style={{ fontWeight: 800, marginRight: "8px", color: isSelected ? "#F95800" : "#64748b" }}>{label}.</span>
                                  {text}
                                </button>
                              );
                            })}
                          </div>

                          <div style={{ textAlign: "right" }}>
                            <button
                              onClick={handleQuizSubmit}
                              style={{
                                background: "linear-gradient(135deg, #F95800, #ff7e40)",
                                color: "#fff",
                                border: "none",
                                padding: "10px 24px",
                                borderRadius: "30px",
                                fontSize: "13px",
                                fontWeight: 700,
                                cursor: "pointer",
                                boxShadow: "0 4px 12px rgba(249, 88, 0, 0.2)"
                              }}
                            >
                              {currentQuestionIndex === minitestQuestions.length - 1 ? "Nộp bài hoàn thành" : "Nộp câu trả lời"}
                            </button>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              );
            };

            if (mediaType === "youtube") {
              const isQuizActive = progress.DaXemVideo === 1 && progress.DaDatMinitest === 0 && minitestQuestions.length > 0;
              return (
                <div style={{ position: "relative", width: "100%", paddingTop: "56.25%", background: "#000", borderRadius: "12px", overflow: "hidden", marginBottom: "20px" }}>
                  <div
                    id="youtube-player-container"
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      filter: isQuizActive ? "blur(8px) brightness(0.5)" : "none",
                      transition: "filter 0.3s ease"
                    }}
                  >
                    <div id="youtube-player" style={{ width: "100%", height: "100%" }} />
                  </div>
                  {isQuizActive && renderQuizOverlay()}
                </div>
              );
            }

            if (mediaType === "drive") {
              const previewUrl = getGoogleDrivePreviewUrl(fileUrl!);
              const isQuizActive = progress.DaXemVideo === 1 && progress.DaDatMinitest === 0 && minitestQuestions.length > 0;
              return (
                <div style={{ position: "relative", width: "100%", paddingTop: "56.25%", background: "#000", borderRadius: "12px", overflow: "hidden", marginBottom: "20px" }}>
                  <iframe
                    src={previewUrl}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      border: 0,
                      filter: isQuizActive ? "blur(8px) brightness(0.5)" : "none",
                      transition: "filter 0.3s ease"
                    }}
                    allow="autoplay"
                    allowFullScreen
                    title="Google Drive Video"
                  />
                  {isQuizActive && renderQuizOverlay()}
                </div>
              );
            }

            if (mediaType === "document") {
              const isQuizActive = progress.DaXemVideo === 1 && progress.DaDatMinitest === 0 && minitestQuestions.length > 0;
              if (isQuizActive) {
                return (
                  <div className="ld2-premium-card anim-fade-in" style={{ padding: "30px", background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1.5px solid #f1f5f9", paddingBottom: "10px" }}>
                      <h4 style={{ margin: 0, color: "#000080", fontSize: "15px", fontWeight: 800 }}>
                        {minitest?.TieuDe || "Câu hỏi tương tác"} ({currentQuestionIndex + 1}/{minitestQuestions.length})
                      </h4>
                    </div>

                    {(() => {
                      const currentQ = minitestQuestions[currentQuestionIndex];
                      if (!currentQ) return null;
                      return (
                        <div>
                          <p style={{ fontWeight: 700, color: "#1e293b", fontSize: "14px", margin: "0 0 16px 0", lineHeight: 1.5 }}>
                            {currentQ.question}
                          </p>
                          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                            {currentQ.answers?.map((text: string, aIdx: number) => {
                              const label = ["A", "B", "C", "D"][aIdx];
                              const isSelected = currentAnswer === label;
                              return (
                                <button
                                  key={label}
                                  onClick={() => setCurrentAnswer(label)}
                                  style={{
                                    textAlign: "left",
                                    padding: "12px 14px",
                                    borderRadius: "10px",
                                    border: `1.5px solid ${isSelected ? "#F95800" : "#e2e8f0"}`,
                                    background: isSelected ? "#fff7ed" : "#fff",
                                    color: isSelected ? "#F95800" : "#334155",
                                    fontSize: "13px",
                                    fontWeight: isSelected ? 700 : 500,
                                    cursor: "pointer",
                                    transition: "all 0.15s ease",
                                    lineHeight: 1.4
                                  }}
                                >
                                  <span style={{ fontWeight: 800, marginRight: "8px", color: isSelected ? "#F95800" : "#64748b" }}>{label}.</span>
                                  {text}
                                </button>
                              );
                            })}
                          </div>

                          <div style={{ textAlign: "right" }}>
                            <button
                              onClick={handleQuizSubmit}
                              style={{
                                background: "linear-gradient(135deg, #F95800, #ff7e40)",
                                color: "#fff",
                                border: "none",
                                padding: "10px 24px",
                                borderRadius: "30px",
                                fontSize: "13px",
                                fontWeight: 700,
                                cursor: "pointer",
                                boxShadow: "0 4px 12px rgba(249, 88, 0, 0.2)"
                              }}
                            >
                              {currentQuestionIndex === minitestQuestions.length - 1 ? "Nộp bài hoàn thành" : "Nộp câu trả lời"}
                            </button>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                );
              }

              return (
                <div className="ld2-premium-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px", textAlign: "center", background: "#fff", border: "1.5px dashed #cbd5e1", borderRadius: "12px", marginBottom: "20px" }}>
                  <FiFileText size={48} style={{ color: "#3b82f6", marginBottom: "16px" }} />
                  <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#000080", margin: "0 0 8px 0" }}>Tài liệu đính kèm bài giảng</h3>
                  <p style={{ color: "#64748b", maxWidth: "450px", margin: "0 0 24px 0", fontSize: "14px", lineHeight: "1.6" }}>
                    Bài giảng này sử dụng tài liệu học tập đính kèm (PDF, Word hoặc tài liệu nén). Bạn có thể xem trực tuyến hoặc tải về để phục vụ học tập.
                  </p>
                  <a
                    href={fileUrl!}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={async () => {
                      if (progress.DaXemVideo === 0) {
                        await handleMarkVideoComplete();
                      }
                    }}
                    style={{
                      background: "#F95800",
                      color: "#fff",
                      padding: "12px 24px",
                      borderRadius: "8px",
                      fontWeight: 600,
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      boxShadow: "0 4px 6px -1px rgba(249, 88, 0, 0.2)",
                      transition: "all 0.2s",
                      cursor: "pointer"
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.background = "#e36d12")}
                    onMouseOut={(e) => (e.currentTarget.style.background = "#F95800")}
                  >
                    Xem / Tải tài liệu bài học
                  </a>
                </div>
              );
            }

            const finalFileUrl = fileUrl || "https://www.w3schools.com/html/mov_bbb.mp4";

            return (
              <div
                className="custom-video-wrapper"
                onMouseMove={handleMouseMove}
                onMouseLeave={() => isPlaying && setShowControls(false)}
                style={{ width: "100%", maxWidth: "100%", margin: 0, position: "relative" }}
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
                    background: "#000",
                    filter: (progress.DaXemVideo === 1 && progress.DaDatMinitest === 0 && minitestQuestions.length > 0) ? "blur(8px) brightness(0.5)" : "none",
                    transition: "filter 0.3s ease"
                  }}
                  onClick={() => {
                    if (!(progress.DaXemVideo === 1 && progress.DaDatMinitest === 0 && minitestQuestions.length > 0)) {
                      togglePlay();
                    }
                  }}
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

                {/* Big Play Overlay Button (hidden when quiz overlay is shown) */}
                {!isPlaying && !(progress.DaXemVideo === 1 && progress.DaDatMinitest === 0 && minitestQuestions.length > 0) && (
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
                        background: "rgba(249, 88, 0, 0.95)",
                        color: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "28px",
                        transition: "all 0.3s ease",
                        boxShadow: "0 4px 15px rgba(249, 88, 0, 0.3)",
                        paddingLeft: "5px"
                      }}
                    >
                      <FiPlay />
                    </div>
                  </div>
                )}

                {/* Interactive Minitest Question Overlay inside Video Player */}
                {progress.DaXemVideo === 1 && progress.DaDatMinitest === 0 && minitestQuestions.length > 0 && (
                  <div className="video-quiz-overlay">
                    <div className="video-quiz-card anim-fade-in">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1.5px solid #f1f5f9", paddingBottom: "10px" }}>
                        <h4 style={{ margin: 0, color: "#000080", fontSize: "15px", fontWeight: 800 }}>
                          {minitest?.TieuDe || "Câu hỏi tương tác"} ({currentQuestionIndex + 1}/{minitestQuestions.length})
                        </h4>
                      </div>

                      {(() => {
                        const currentQ = minitestQuestions[currentQuestionIndex];
                        if (!currentQ) return null;
                        return (
                          <div>
                            <p style={{ fontWeight: 700, color: "#1e293b", fontSize: "14px", margin: "0 0 16px 0", lineHeight: 1.5 }}>
                              {currentQ.question}
                            </p>
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                              {currentQ.answers?.map((text: string, aIdx: number) => {
                                const label = ["A", "B", "C", "D"][aIdx];
                                const isSelected = currentAnswer === label;
                                return (
                                  <button
                                    key={label}
                                    onClick={() => setCurrentAnswer(label)}
                                    style={{
                                      textAlign: "left",
                                      padding: "12px 14px",
                                      borderRadius: "10px",
                                      border: `1.5px solid ${isSelected ? "#F95800" : "#e2e8f0"}`,
                                      background: isSelected ? "#fff7ed" : "#fff",
                                      color: isSelected ? "#F95800" : "#334155",
                                      fontSize: "13px",
                                      fontWeight: isSelected ? 700 : 500,
                                      cursor: "pointer",
                                      transition: "all 0.15s ease",
                                      lineHeight: 1.4
                                    }}
                                  >
                                    <span style={{ fontWeight: 800, marginRight: "8px", color: isSelected ? "#F95800" : "#64748b" }}>{label}.</span>
                                    {text}
                                  </button>
                                );
                              })}
                            </div>

                            <div style={{ textAlign: "right" }}>
                              <button
                                onClick={handleQuizSubmit}
                                style={{
                                  background: "linear-gradient(135deg, #F95800, #ff7e40)",
                                  color: "#fff",
                                  border: "none",
                                  padding: "10px 24px",
                                  borderRadius: "30px",
                                  fontSize: "13px",
                                  fontWeight: 700,
                                  cursor: "pointer",
                                  boxShadow: "0 4px 12px rgba(249, 88, 0, 0.2)"
                                }}
                              >
                                {currentQuestionIndex === minitestQuestions.length - 1 ? "Nộp bài hoàn thành" : "Nộp câu trả lời"}
                              </button>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* Custom Control Bar Overlay (hidden when quiz overlay is active) */}
                {!(progress.DaXemVideo === 1 && progress.DaDatMinitest === 0 && minitestQuestions.length > 0) && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: "linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.4) 60%, transparent 100%)",
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
                      {/* Left controls */}
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

                      {/* Right controls */}
                      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
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
                              padding: 0
                            }}
                          >
                            <FiSettings />
                          </button>

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
                                      alignItems: "center"
                                    }}
                                  >
                                    <span>{rate}x</span>
                                    {isSelected && <span>✓</span>}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>

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
                        >
                          {isFullscreen ? <FiMinimize /> : <FiMaximize />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Giáo trình lý thuyết */}
          {noiDung && (
            <div className="ld2-premium-card" style={{ marginTop: "10px" }}>
              <h4 style={{ color: "#000080", margin: "0 0 16px 0", fontSize: "16px", fontWeight: 800 }}>
                Lý thuyết & Giáo trình
              </h4>
              <div style={{ lineHeight: 1.8, color: "#334155" }}>
                {noiDung.trimStart().startsWith("<") ? (
                  <div dangerouslySetInnerHTML={{ __html: noiDung }} />
                ) : (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {unescapeMarkdown(noiDung)}
                  </ReactMarkdown>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Cột bên phải: Tiêu đề + Minitest */}
        <div className="ld2-sidebar-col">
          {/* Hộp Tiêu đề Bài giảng */}
          <div className="ld2-premium-card" style={{ padding: "20px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#000080", margin: "0 0 8px 0" }}>
              {baiGiang.TieuDe}
            </h2>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <span style={{
                background: "#FFF2EB",
                color: "#F95800",
                fontSize: "11px",
                fontWeight: 700,
                padding: "4px 8px",
                borderRadius: "6px"
              }}>
                {baiGiang.LoaiBaiHoc}
              </span>
            </div>
          </div>

          {/* Lộ trình học tập (3 Steps timeline progress) */}
          <div className="ld2-journey-box">
            <h4 className="ld2-journey-title">
              Lộ trình bài học
            </h4>
            <div className="ld2-timeline">
              {/* Bước 1: Xem Video */}
              <div className={`ld2-timeline-item ${progress.DaXemVideo === 1 ? "completed" : "active"}`}>
                <div className="ld2-timeline-bullet">
                  {progress.DaXemVideo === 1 ? <FiCheckCircle /> : "1"}
                </div>
                <div className="ld2-timeline-content">
                  <span className="ld2-timeline-label">
                    {mediaType === "document" ? "Xem / Tải tài liệu học" : "Xem video bài giảng"}
                  </span>
                  <span className="ld2-timeline-desc">
                    {progress.DaXemVideo === 1 ? "Đã hoàn thành" : "Đang thực hiện"}
                  </span>
                </div>
              </div>

              {/* Bước 2: Minitest */}
              {minitestQuestions && minitestQuestions.length > 0 && (
                <div className={`ld2-timeline-item ${
                  progress.DaXemVideo === 0 ? "" : progress.DaDatMinitest === 1 ? "completed" : "active"
                }`}>
                  <div className="ld2-timeline-bullet">
                    {progress.DaDatMinitest === 1 ? <FiCheckCircle /> : progress.DaXemVideo === 0 ? <FiLock /> : "2"}
                  </div>
                  <div className="ld2-timeline-content">
                    <span className="ld2-timeline-label">Hoàn thành Minitest</span>
                    <span className="ld2-timeline-desc">
                      {progress.DaDatMinitest === 1 ? "Đạt yêu cầu" : progress.DaXemVideo === 0 ? "Đang khóa" : "Chờ thực hiện"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Popup Modal Alert for Minitest feedback */}
      {showQuizAlert && (
        <div className="ld2-popup-overlay">
          <div className="ld2-popup-card">
            <div className={`ld2-popup-icon-box ${quizAlertStatus}`}>
              {quizAlertStatus === "success" ? <FiCheckCircle /> : <FiXCircle />}
            </div>
            <h3 className="ld2-popup-title">
              {quizAlertStatus === "success" ? "Chúc mừng!" : "Không đạt yêu cầu"}
            </h3>
            <p className="ld2-popup-message">
              {quizAlertMessage}
            </p>
            <button
              className={`ld2-popup-btn ${quizAlertStatus}`}
              onClick={handleCloseAlert}
            >
              {quizAlertStatus === "success" 
                ? "Đi đến bài tập" 
                : mediaType === "document" 
                  ? "Xem lại tài liệu" 
                  : "Xem lại video"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default BaiGiangSV;
