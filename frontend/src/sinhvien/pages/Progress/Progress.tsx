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
  id: string;
  name: string;
  completed: boolean;
  score?: string;
  questions: QuizQuestion[];
}

interface LectureData {
  id: string;
  name: string;
  videoWatched: boolean;
  exercises: MockExercise[];
  completed: boolean;
}

interface DocumentData {
  id: string;
  name: string;
  content: string;
  completed: boolean;
}

interface GenericQuiz {
  id: string;
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

const INITIAL_CLASSES: ClassProgress[] = [
  {
    id: 2,
    className: "Lớp 2 - TOEIC Foundation",
    courseName: "Khóa học Luyện thi TOEIC",
    schedule: "Thứ 3,5,7 - 9:00-10:30",
    totalStudents: 45,
    teacherName: "Nguyễn Đình Khoa",
    sessions: [
      {
        id: 1,
        title: "Buổi 1: Kiến thức nền tảng - Lớp 2 - TOEIC Foundation",
        date: "01/03/2026",
        lecture: {
          id: "c2-s1-lec",
          name: "Bài giảng: Nền tảng phát âm và từ vựng cơ bản",
          videoWatched: true,
          completed: true,
          exercises: [
            {
              id: "c2-s1-lec-ex1",
              name: "Luyện tập ngữ pháp Danh từ, Động từ",
              completed: true,
              score: "2/2",
              questions: []
            }
          ]
        },
        test: {
          id: "c2-s1-test",
          name: "Bài kiểm tra từ vựng Buổi 1",
          completed: true,
          score: "3/3",
          questions: []
        },
        practice: {
          id: "c2-s1-prac",
          name: "Bài luyện tập thêm: Phát âm nâng cao",
          completed: true,
          score: "2/3",
          questions: []
        },
        document: {
          id: "c2-s1-doc",
          name: "Tài liệu ôn tập Buổi 1 (Slide bài giảng)",
          content: "Tài liệu học tập.",
          completed: true
        }
      },
      {
        id: 2,
        title: "Buổi 2: Luyện tập chuyên sâu - Lớp 2 - TOEIC Foundation",
        date: "05/03/2026",
        lecture: {
          id: "c2-s2-lec",
          name: "Bài giảng: Kỹ thuật nghe TOEIC Part 1 & 2",
          videoWatched: true,
          completed: true,
          exercises: [
            {
              id: "c2-s2-lec-ex1",
              name: "Luyện tập nghe tranh tả người",
              completed: true,
              score: "2/2",
              questions: []
            }
          ]
        },
        test: {
          id: "c2-s2-test",
          name: "Bài kiểm tra nghe TOEIC Buổi 2",
          completed: true,
          score: "2/3",
          questions: []
        },
        document: {
          id: "c2-s2-doc",
          name: "Tài liệu: Mẹo tránh bẫy nghe Part 1 & 2",
          content: "Mẹo tránh bẫy.",
          completed: true
        }
      }
    ]
  },
  {
    id: 1,
    className: "Lớp 1 - TOEIC Foundation",
    courseName: "Khóa học Luyện thi TOEIC",
    schedule: "Thứ 2,4,6 - 9:00-10:30",
    totalStudents: 50,
    teacherName: "Nguyễn Đình Khoa",
    sessions: [
      {
        id: 1,
        title: "Buổi 1: Kiến thức nền tảng - Lớp 1 - TOEIC Foundation",
        date: "01/03/2026",
        lecture: {
          id: "c1-s1-lec",
          name: "Bài giảng: Nền tảng phát âm và từ vựng cơ bản",
          videoWatched: false,
          completed: false,
          exercises: [
            {
              id: "c1-s1-lec-ex1",
              name: "Luyện tập ngữ pháp Danh từ, Động từ",
              completed: false,
              questions: []
            }
          ]
        },
        test: {
          id: "c1-s1-test",
          name: "Bài kiểm tra từ vựng Buổi 1",
          completed: false,
          questions: []
        },
        practice: {
          id: "c1-s1-prac",
          name: "Bài luyện tập thêm: Phát âm cơ bản",
          completed: false,
          questions: []
        },
        document: {
          id: "c1-s1-doc",
          name: "Tài liệu ôn tập Buổi 1 (Slide bài giảng)",
          content: "Tài liệu học tập.",
          completed: false
        }
      },
      {
        id: 2,
        title: "Buổi 2: Luyện tập chuyên sâu - Lớp 1 - TOEIC Foundation",
        date: "05/03/2026",
        lecture: {
          id: "c1-s2-lec",
          name: "Bài giảng: Kỹ thuật nghe TOEIC Part 1 & 2",
          videoWatched: false,
          completed: false,
          exercises: [
            {
              id: "c1-s2-lec-ex1",
              name: "Luyện tập nghe tranh tả người",
              completed: false,
              questions: []
            }
          ]
        },
        test: {
          id: "c1-s2-test",
          name: "Bài kiểm tra nghe TOEIC Buổi 2",
          completed: false,
          questions: []
        },
        document: {
          id: "c1-s2-doc",
          name: "Tài liệu: Mẹo tránh bẫy nghe Part 1 & 2",
          content: "Mẹo tránh bẫy.",
          completed: false
        }
      }
    ]
  }
];

export default function Progress() {
  const [classes] = useState<ClassProgress[]>(INITIAL_CLASSES);
  const [selectedId, setSelectedId] = useState<number>(2);
  const [expandedSessions, setExpandedSessions] = useState<Record<number, boolean>>({ 1: true, 2: true });
  const [hoTen, setHoTen] = useState("Lê Nhàn");

  useEffect(() => {
    try {
      const u = JSON.parse(sessionStorage.getItem("user") || "{}");
      if (u.HoTen) setHoTen(u.HoTen);
    } catch { /* empty */ }
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

    cls.sessions.forEach(s => {
      // 1. Lecture
      total++;
      if (s.lecture.completed) completed++;

      // Lecture Exercises
      s.lecture.exercises.forEach(ex => {
        assignmentsTotal++;
        if (ex.completed) {
          assignmentsCompleted++;
        }
      });

      // 2. Test
      total++;
      if (s.test.completed) {
        completed++;
        if (s.test.score) {
          const parts = s.test.score.split("/");
          scoreSum += (parseFloat(parts[0]) / parseFloat(parts[1])) * 10;
          scoreCount++;
        }
      }

      // 3. Practice (if exists)
      if (s.practice) {
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
      total++;
      if (s.document.completed) completed++;
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

  const currentStats = getProgressStats(activeClass);

  // Check how many sessions are 100% completed
  const completedSessionsCount = activeClass.sessions.filter(s => {
    const lectureDone = s.lecture.completed;
    const testDone = s.test.completed;
    const docDone = s.document.completed;
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
              const lectureDone = s.lecture.completed;
              const testDone = s.test.completed;
              const docDone = s.document.completed;
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

                      {/* 2. Bài kiểm tra */}
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

                      {/* 3. Bài luyện tập thêm (nếu có) */}
                      {s.practice && (
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
                          <span className={`prog-item-badge ${s.document.completed ? "completed" : "pending"}`}>
                            {s.document.completed ? "Đã xem tài liệu" : "Chưa đọc"}
                          </span>
                        </div>
                      </div>

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
