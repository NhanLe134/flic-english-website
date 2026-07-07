import "./Progress.css";
import { useState, useEffect } from "react";
import {
  FiCalendar,
  FiUsers,
  FiBookOpen,
  FiEdit3,
  FiBarChart2,
  FiPlayCircle,
  FiFileText,
  FiFile,
  FiCheck,
  FiLock,
  FiChevronDown,
  FiClock
} from "react-icons/fi";

// Sub-interfaces
interface QuizQuestion {
  q: string;
  options: string[];
  answer: number; // Index of correct option
}

interface MockExercise {
  id: string | number;
  name: string;
  completed: boolean;
  score?: string;
  questions: QuizQuestion[];
}

interface LectureData {
  id: string | number;
  name: string;
  videoWatched: boolean;
  exercises: MockExercise[];
  completed: boolean;
}

interface DocumentData {
  id: string | number;
  name: string;
  content: string;
  completed: boolean;
}

interface GenericQuiz {
  id: string | number;
  name: string;
  questions: QuizQuestion[];
  completed: boolean;
  score?: string;
}

interface SessionData {
  id: number;
  title: string;
  date: string;
  lecture: LectureData;
  test: GenericQuiz;
  practice?: GenericQuiz; // Optional extra practice
  document: DocumentData;
}

interface ClassProgress {
  id: number;
  className: string;
  courseName: string;
  schedule: string;
  totalStudents: number;
  teacherName: string;
  sessions: SessionData[];
}



export default function Progress() {
  const [classes, setClasses] = useState<ClassProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [expandedSessions, setExpandedSessions] = useState<Record<number, boolean>>({});
  const [hoTen, setHoTen] = useState("Lê Nhàn");
  const [userId, setUserId] = useState<number | null>(null);
  const API = "http://14.225.192.252:5000";

  useEffect(() => {
    const userJson = sessionStorage.getItem("user");
    if (!userJson) {
      setError("Bạn cần đăng nhập để xem tiến độ học tập.");
      setLoading(false);
      return;
    }
    
    try {
      const u = JSON.parse(userJson);
      if (u.HoTen) setHoTen(u.HoTen);
      if (u.MaNguoiDung) {
        setUserId(u.MaNguoiDung);
        
        fetch(`${API}/student/progress/classes/${u.MaNguoiDung}`)
          .then((res) => {
            if (!res.ok) throw new Error("Không thể kết nối đến máy chủ.");
            return res.json();
          })
          .then((data) => {
            if (Array.isArray(data)) {
              setClasses(data);
              if (data.length > 0) {
                setSelectedId(data[0].id);
                // Mở rộng buổi học đầu tiên mặc định
                const expands: Record<number, boolean> = {};
                data[0].sessions.forEach((s: any) => {
                  expands[s.id] = true;
                });
                setExpandedSessions(expands);
              }
            }
            setLoading(false);
          })
          .catch((err) => {
            console.error("Lỗi khi tải tiến độ:", err);
            setError("Lỗi tải tiến độ học tập. Vui lòng thử lại sau.");
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    } catch (e) {
      setError("Thông tin người dùng không hợp lệ.");
      setLoading(false);
    }
  }, []);

  const activeClass = classes.find(c => c.id === selectedId) || classes[0];

  // Helper: Count total & completed items dynamically
  const getProgressStats = (cls: ClassProgress) => {
    let total = 0;
    let completed = 0;
    let scoreSum = 0;
    let scoreCount = 0;
    let assignmentsTotal = 0;
    let assignmentsCompleted = 0;

    if (!cls || !cls.sessions) {
      return {
        percent: 0,
        completed: 0,
        total: 0,
        assignmentsCompleted: 0,
        assignmentsTotal: 0,
        avgScore: "—"
      };
    }

    cls.sessions.forEach(s => {
      // 1. Lecture
      if (s.lecture && s.lecture.id !== 0 && s.lecture.id !== "0") {
        total++;
        if (s.lecture.completed) completed++;

        // Lecture Exercises
        s.lecture.exercises.forEach(ex => {
          assignmentsTotal++;
          if (ex.completed) {
            assignmentsCompleted++;
          }
        });
      }

      // 2. Test
      if (s.test && s.test.id !== 0 && s.test.id !== "0") {
        total++;
        if (s.test.completed) {
          completed++;
          if (s.test.score) {
            const parts = s.test.score.split("/");
            scoreSum += (parseFloat(parts[0]) / parseFloat(parts[1])) * 10;
            scoreCount++;
          }
        }
      }

      // 3. Practice (if exists)
      if (s.practice && s.practice.id !== 0 && s.practice.id !== "0") {
        total++;
        if (s.practice.completed) {
          completed++;
          if (s.practice.score) {
            const parts = s.practice.score.split("/");
            scoreSum += (parseFloat(parts[0]) / parseFloat(parts[1])) * 10;
            scoreCount++;
          }
        }
      }

      // 4. Document
      if (s.document && s.document.id !== 0 && s.document.id !== "0") {
        total++;
        const isDocDone = localStorage.getItem(`completed_document_${userId}_${s.document.id}`) === "true";
        if (isDocDone) completed++;
      }
    });

    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    const avgScore = scoreCount > 0 ? (scoreSum / scoreCount).toFixed(1) : "—";

    return {
      percent,
      completed,
      total,
      assignmentsCompleted,
      assignmentsTotal,
      avgScore
    };
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "300px", gap: "12px", color: "#64748b" }}>
        <div style={{ width: "40px", height: "40px", border: "4px solid #f3f3f3", borderTop: "4px solid #f95800", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
        <span>Đang tải thông tin tiến độ học tập...</span>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#ef4444" }}>
        <p>{error}</p>
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <div className="prog-container" style={{ padding: "40px 20px" }}>
        <div className="prog-header">
          <div className="prog-header-title">
            <h1>Tiến độ học tập</h1>
            <p>Xin chào, <strong>{hoTen}</strong>. Theo dõi tiến độ học tập chi tiết của các lớp học tại đây.</p>
          </div>
        </div>
        <div style={{
          background: "#f8fafc",
          border: "1.5px dashed #cbd5e1",
          padding: "50px 20px",
          borderRadius: 16,
          textAlign: "center",
          color: "#64748b",
          marginTop: "30px"
        }}>
          <h3 style={{ margin: "0 0 10px 0", color: "#000080" }}>Không có lớp học hoạt động</h3>
          <p style={{ margin: 0, fontSize: "14px" }}>Bạn hiện tại chưa được đăng ký lớp học nào đang diễn ra hoặc đã kết thúc.</p>
        </div>
      </div>
    );
  }

  const currentStats = getProgressStats(activeClass);

  // Đếm số buổi học đã hoàn thành 100%
  const completedSessionsCount = activeClass.sessions.filter(s => {
    const lectureDone = s.lecture ? s.lecture.completed : true;
    const testDone = s.test ? s.test.completed : true;
    const docDone = s.document ? localStorage.getItem(`completed_document_${userId}_${s.document.id}`) === "true" : true;
    const practiceDone = s.practice ? s.practice.completed : true;
    return lectureDone && testDone && docDone && practiceDone;
  }).length;

  const toggleSession = (sessionId: number) => {
    setExpandedSessions(prev => ({
      ...prev,
      [sessionId]: !prev[sessionId]
    }));
  };

  // Circular progress SVG configurations
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (currentStats.percent / 100) * circumference;

  return (
    <div className="prog-container">
      {/* Header */}
      <div className="prog-header">
        <div className="prog-header-title">
          <h1>Tiến độ học tập</h1>
          <p>Xin chào, <strong>{hoTen}</strong>. Theo dõi tiến độ học tập chi tiết của từng lớp học của bạn tại đây.</p>
        </div>
      </div>

      {/* Class Selector Cards */}
      <div className="prog-class-selector">
        {classes.map(c => {
          const stats = getProgressStats(c);
          return (
            <div
              key={c.id}
              className={`prog-class-card ${selectedId === c.id ? "active" : ""}`}
              onClick={() => setSelectedId(c.id)}
            >
              <div className="prog-class-card-header">
                <span className="prog-class-badge">{c.courseName}</span>
              </div>
              <h3 className="prog-class-title">{c.className}</h3>
              <div className="prog-class-meta-item">
                <FiCalendar style={{ marginRight: 6, color: "#000080" }} /> {c.schedule}
              </div>
              <div className="prog-class-meta-item">
                <FiUsers style={{ marginRight: 6, color: "#000080" }} /> Sĩ số: {c.totalStudents} học viên
              </div>

              <div className="prog-class-progress-bar">
                <div className="prog-bar-label">
                  <span>Tiến độ học tập</span>
                  <span style={{ color: selectedId === c.id ? "#F95800" : "#64748b" }}>{stats.percent}%</span>
                </div>
                <div className="prog-bar-container">
                  <div
                    className="prog-bar-fill"
                    style={{
                      width: `${stats.percent}%`,
                      backgroundColor: stats.percent === 100 ? "#22c55e" : "#F95800"
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dashboard Main Grid */}
      <div className="prog-dashboard">
        {/* Left Side: Summary Metrics */}
        <div className="prog-stats-panel">
          <h2 className="prog-stats-title">Tổng quan tiến độ</h2>

          <div className="prog-circle-wrapper">
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="8" />
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke={currentStats.percent === 100 ? "#22c55e" : "#000080"}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
                style={{ transition: "stroke-dashoffset 0.35s" }}
              />
            </svg>
            <div className="prog-circle-text">
              <span className="prog-circle-pct">{currentStats.percent}%</span>
              <span className="prog-circle-lbl">Hoàn thành</span>
            </div>
          </div>

          <div className="prog-metric-grid">
            <div className="prog-metric-card">
              <div className="prog-metric-icon">
                <FiBookOpen />
              </div>
              <div className="prog-metric-info">
                <p className="prog-metric-val">{completedSessionsCount}/{activeClass.sessions.length}</p>
                <p className="prog-metric-lbl">Buổi học hoàn thành</p>
              </div>
            </div>

            <div className="prog-metric-card">
              <div className="prog-metric-icon orange">
                <FiEdit3 />
              </div>
              <div className="prog-metric-info">
                <p className="prog-metric-val">{currentStats.assignmentsCompleted}/{currentStats.assignmentsTotal}</p>
                <p className="prog-metric-lbl">Bài tập đã nộp</p>
              </div>
            </div>

            <div className="prog-metric-card">
              <div className="prog-metric-icon">
                <FiBarChart2 />
              </div>
              <div className="prog-metric-info">
                <p className="prog-metric-val">{currentStats.avgScore}</p>
                <p className="prog-metric-lbl">Điểm kiểm tra TB</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Detailed Timeline */}
        <div className="prog-schedule-panel">
          <div className="prog-schedule-header">
            <h2 className="prog-schedule-title">Lịch trình học tập chi tiết</h2>
            <div style={{ fontSize: "12px", color: "#64748b" }}>
              * Chọn các lớp học để so sánh trạng thái học tập.
            </div>
          </div>

          <div className="prog-sessions-list">
            {activeClass.sessions.map(s => {
              const lectureDone = s.lecture ? s.lecture.completed : true;
              const testDone = s.test ? s.test.completed : true;
              const docDone = s.document ? localStorage.getItem(`completed_document_${userId}_${s.document.id}`) === "true" : true;
              const practiceDone = s.practice ? s.practice.completed : true;

              const sessionCompleted = lectureDone && testDone && docDone && practiceDone;
              const sessionInProgress = (lectureDone || testDone || docDone || (s.practice && s.practice.completed)) && !sessionCompleted;
              const isExpanded = !!expandedSessions[s.id];

              return (
                <div key={s.id} className="prog-session-node">
                  {/* Trigger Header */}
                  <button className="prog-session-trigger" onClick={() => toggleSession(s.id)}>
                    <div className="prog-session-title-wrap">
                      <div
                        className={`prog-status-dot ${
                          sessionCompleted ? "completed" : sessionInProgress ? "inprogress" : "locked"
                        }`}
                      >
                        {sessionCompleted ? (
                          <FiCheck size={12} />
                        ) : sessionInProgress ? (
                          <FiClock size={12} />
                        ) : (
                          <FiLock size={12} />
                        )}
                      </div>
                      <div>
                        <h4 className="prog-session-name">{s.title}</h4>
                        <p className="prog-session-date">Ngày học: {s.date}</p>
                      </div>
                    </div>
                    <span className={`prog-session-arrow ${isExpanded ? "expanded" : ""}`}>
                      <FiChevronDown />
                    </span>
                  </button>

                  {/* Accordion Details */}
                  {isExpanded && (
                    <div className="prog-session-content">
                      {/* 1. Bài giảng */}
                      {s.lecture && s.lecture.id !== 0 && s.lecture.id !== "0" && (
                        <div className="prog-item-row">
                          <div className="prog-item-left">
                            <span className="prog-item-icon">
                              <FiPlayCircle />
                            </span>
                            <div className="prog-item-info">
                              <p className="prog-item-name">{s.lecture.name}</p>
                              <p className="prog-item-type">
                                Bài giảng · {s.lecture.videoWatched ? "Đã xem video" : "Chưa xem video"}
                                {` (${s.lecture.exercises.filter(ex => ex.completed).length}/${s.lecture.exercises.length} bài tập)`}
                              </p>
                            </div>
                          </div>
                          <div className="prog-item-right">
                            <span className={`prog-item-badge ${s.lecture.completed ? "completed" : "pending"}`}>
                              {s.lecture.completed ? "Đã hoàn thành" : "Chưa học"}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* 2. Bài kiểm tra */}
                      {s.test && s.test.id !== 0 && s.test.id !== "0" && (
                        <div className="prog-item-row">
                          <div className="prog-item-left">
                            <span className="prog-item-icon">
                              <FiFileText />
                            </span>
                            <div className="prog-item-info">
                              <p className="prog-item-name">{s.test.name}</p>
                              <p className="prog-item-type">Bài kiểm tra bắt buộc</p>
                            </div>
                          </div>
                          <div className="prog-item-right">
                            <span className={`prog-item-badge ${s.test.completed ? "completed" : "pending"}`}>
                              {s.test.completed ? `Đã nộp (${s.test.score})` : "Chưa làm"}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* 3. Bài luyện tập thêm (nếu có) */}
                      {s.practice && s.practice.id !== 0 && s.practice.id !== "0" && (
                        <div className="prog-item-row">
                          <div className="prog-item-left">
                            <span className="prog-item-icon">
                              <FiEdit3 />
                            </span>
                            <div className="prog-item-info">
                              <p className="prog-item-name">{s.practice.name}</p>
                              <p className="prog-item-type">Bài luyện tập thêm</p>
                            </div>
                          </div>
                          <div className="prog-item-right">
                            <span className={`prog-item-badge ${s.practice.completed ? "completed" : "inprogress"}`}>
                              {s.practice.completed ? `Đã nộp (${s.practice.score})` : "Chưa làm"}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* 4. Tài liệu */}
                      {s.document && s.document.id !== 0 && s.document.id !== "0" && (() => {
                        const isDocDone = localStorage.getItem(`completed_document_${userId}_${s.document.id}`) === "true";
                        return (
                          <div className="prog-item-row">
                            <div className="prog-item-left">
                              <span className="prog-item-icon">
                                <FiFile />
                              </span>
                              <div className="prog-item-info">
                                <p className="prog-item-name">{s.document.name}</p>
                                <p className="prog-item-type">Tài liệu học tập đính kèm</p>
                              </div>
                            </div>
                            <div className="prog-item-right">
                              <span className={`prog-item-badge ${isDocDone ? "completed" : "pending"}`}>
                                {isDocDone ? "Đã xem tài liệu" : "Chưa đọc"}
                              </span>
                            </div>
                          </div>
                        );
                      })()}

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
