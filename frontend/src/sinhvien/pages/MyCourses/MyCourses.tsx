import "./MyCourses.css";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  FaCalendarAlt,
  FaUsers,
  FaChartLine,
  FaBookOpen,
  FaPenNib,
  FaChevronDown,
  FaChevronUp
} from "react-icons/fa";
import { FiFileText, FiX } from "react-icons/fi";

const API = "http://localhost:5000";

function pctColor(pct: number) {
  if (pct >= 90) return "#22c55e";
  if (pct >= 60) return "#E8683A";
  return "#f97316";
}

function MyCourses() {
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  const userId = user.MaNguoiDung;

  const [classes, setClasses] = useState<any[]>([]);
  const [freeLectures, setFreeLectures] = useState<any[]>([]);
  const [freeExercises, setFreeExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [enrollName, setEnrollName] = useState("");
  const [enrollStudentId, setEnrollStudentId] = useState("");
  const [enrollClassId, setEnrollClassId] = useState("");

  const [expandedClasses, setExpandedClasses] = useState<Record<number, boolean>>({});
  const [classDetails, setClassDetails] = useState<Record<number, {
    loading: boolean;
    lessons: any[];
    exercises: any[];
    documents: any[];
    lecturesMap: Record<number, any[]>;
  }>>({});

  const [submittedExerciseIds, setSubmittedExerciseIds] = useState<Set<number>>(new Set());
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (!userId) return;
    fetch(`${API}/student/bainop/${userId}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const ids = new Set<number>(data.map((sub: any) => sub.MaExercise));
          setSubmittedExerciseIds(ids);
        }
      })
      .catch((err) => console.error("Error fetching submissions:", err));
  }, [userId, refreshTrigger]);

  const handleToggleClassDetails = async (classId: number) => {
    // Toggle expanded state
    setExpandedClasses(prev => ({
      ...prev,
      [classId]: !prev[classId]
    }));

    // If already loaded or loading, do not fetch again
    if (classDetails[classId]) {
      return;
    }

    // Set loading state for this class
    setClassDetails(prev => ({
      ...prev,
      [classId]: {
        loading: true,
        lessons: [],
        exercises: [],
        documents: [],
        lecturesMap: {}
      }
    }));

    try {
      // Fetch lessons, exercises, and documents in parallel
      const [lessonsRes, exercisesRes, tailieuRes] = await Promise.all([
        fetch(`${API}/classes/${classId}/lessons`).then(r => r.json()),
        fetch(`${API}/classes/${classId}/exercises`).then(r => r.json()),
        fetch(`${API}/classes/${classId}/tailieu`).then(r => r.json())
      ]);

      const lessonsList = Array.isArray(lessonsRes) ? lessonsRes : [];
      const exercisesList = Array.isArray(exercisesRes) ? exercisesRes : [];
      const documentsList = Array.isArray(tailieuRes) ? tailieuRes : [];

      // Fetch lectures for all lessons in parallel
      const lecturesPromises = lessonsList.map(async (l: any) => {
        try {
          const res = await fetch(`${API}/baigiang/${l.MaLesson}`);
          const data = await res.json();
          return {
            lessonId: l.MaLesson,
            lectures: Array.isArray(data) ? data : []
          };
        } catch (err) {
          console.error(`Error fetching lectures for lesson ${l.MaLesson}`, err);
          return { lessonId: l.MaLesson, lectures: [] };
        }
      });

      const lecturesResults = await Promise.all(lecturesPromises);
      const lecturesMap: Record<number, any[]> = {};
      lecturesResults.forEach(r => {
        lecturesMap[r.lessonId] = r.lectures;
      });

      setClassDetails(prev => ({
        ...prev,
        [classId]: {
          loading: false,
          lessons: lessonsList,
          exercises: exercisesList,
          documents: documentsList,
          lecturesMap
        }
      }));
    } catch (err) {
      console.error(`Error loading details for class ${classId}`, err);
      setClassDetails(prev => ({
        ...prev,
        [classId]: {
          loading: false,
          lessons: [],
          exercises: [],
          documents: [],
          lecturesMap: {}
        }
      }));
    }
  };

  const fetchFreeContent = () => {
    fetch(`${API}/student/free-content`)
      .then((r) => r.json())
      .then((data) => {
        if (data) {
          setFreeLectures(Array.isArray(data.lectures) ? data.lectures : []);
          setFreeExercises(Array.isArray(data.exercises) ? data.exercises : []);
        }
      })
      .catch((err) => console.error("Error fetching free content", err))
      .finally(() => setLoading(false));
  };

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollStudentId.trim()) {
      alert("Vui lòng nhập mã sinh viên.");
      return;
    }
    if (!enrollClassId) {
      alert("Vui lòng chọn lớp học.");
      return;
    }

    try {
      const res = await fetch(`${API}/qtv/lophoc/${enrollClassId.trim()}/ghidanh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ MaSinhVien: enrollStudentId })
      });
      const data = await res.json();

      alert(data.message || "Đã thực hiện ghi danh.");

      if (data.message && data.message.includes("thành công")) {
        // Refresh classes list
        const user = JSON.parse(sessionStorage.getItem("user") || "{}");
        const userId = user.MaNguoiDung;
        if (userId) {
          setLoading(true);
          const r = await fetch(`${API}/student/my-classes/${userId}`);
          const classData = await r.json();
          setClasses(Array.isArray(classData) ? classData : []);
          setLoading(false);
        }
        setShowEnrollModal(false);
      }
    } catch (err) {
      console.error("Error enrolling student:", err);
      alert("Lỗi hệ thống khi ghi danh vào lớp.");
    }
  };

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("user") || "{}");
    const userId = user.MaNguoiDung;

    if (!userId) {
      fetchFreeContent();
      return;
    }

    // Fetch student profile details to pre-fill the form
    fetch(`${API}/students/by-user/${userId}`)
      .then((r) => r.json())
      .then((svData) => {
        if (svData && svData.MaSinhVien) {
          fetch(`${API}/students/${svData.MaSinhVien}`)
            .then((r) => r.json())
            .then((profileData) => {
              if (profileData) {
                setEnrollName(profileData.HoTen || "");
                setEnrollStudentId(profileData.MaSinhVien || "");
              }
            })
            .catch(err => console.error("Error fetching student profile details:", err));
        }
      })
      .catch(err => console.error("Error fetching student profile by user:", err));


    // Fetch enrolled classes
    fetch(`${API}/student/my-classes/${userId}`)
      .then((r) => r.json())
      .then((data) => {
        const classList = Array.isArray(data) ? data : [];
        setClasses(classList);
        if (classList.length === 0) {
          fetchFreeContent();
        } else {
          setLoading(false);
        }
      })
      .catch(() => {
        setClasses([]);
        fetchFreeContent();
      });
  }, []);


  return (
    <>
      <div className="mc-content">
        <div className="mc-heading">
          <div>
            <h1 className="mc-page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '0 0 6px 0' }}>
              Lớp học của tôi
              {!loading && classes.length > 0 && (
                <span className="mc-count-pill" style={{ textTransform: 'none', fontSize: '18px' }}>
                  {classes.length} Lớp
                </span>
              )}
            </h1>
            <p className="mc-page-sub">Quản lý và theo dõi tiến độ các lớp học đang tham gia</p>
          </div>
          <button onClick={() => setShowEnrollModal(true)} className="mc-register-btn" style={{ border: 'none', cursor: 'pointer' }}>
            Ghi danh vào lớp
          </button>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#999" }}>Đang tải...</div>
        ) : classes.length === 0 ? (
          /* Trial / Try-out view for unregistered students */
          <div className="trial-mode-container">
            <div className="trial-welcome-banner">
              <h2>Chương trình học thử miễn phí</h2>
              <p>Bạn chưa ghi danh vào lớp học nào. Hãy trải nghiệm thử các bài giảng và bài tập miễn phí dưới đây để làm quen với hệ thống!</p>
            </div>

            {/* Trial Lectures Section */}
            <div className="mc-section-label" style={{ marginTop: 24 }}>
              <span>Bài giảng học thử</span>
              <span className="mc-count-pill">{freeLectures.length} bài</span>
            </div>

            {freeLectures.length === 0 ? (
              <div className="trial-empty-box">Hiện tại chưa có bài giảng học thử nào được cập nhật.</div>
            ) : (
              <div className="mc-grid" style={{ marginBottom: 40 }}>
                {freeLectures.map((l, i) => (
                  <div className="mc-card trial-card" key={`lec-${l.MaBaiHoc}`} style={{ animationDelay: `${i * 60}ms` }}>
                    <div className="mc-card-header">
                      <div>
                        <span className="trial-badge">Học thử</span>
                        <h3 className="mc-card-name" style={{ marginTop: 8 }}>{l.TieuDe}</h3>
                        <span className="mc-card-code" style={{ background: "#eff6ff", color: "#1d4ed8" }}>{l.LoaiBaiHoc} · {l.ThoiLuong || "N/A"}</span>
                      </div>
                      <div className="trial-icon-wrap"><FaBookOpen style={{ color: "#3b82f6" }} /></div>
                    </div>
                    <p className="trial-desc">
                      {l.NoiDung ? l.NoiDung.slice(0, 100) + (l.NoiDung.length > 100 ? "..." : "") : "Tài liệu học thử của khóa học."}
                    </p>
                    <Link
                      to={`/bai-giangSV/${l.MaBaiHoc}`}
                      state={{ maLopHoc: null }}
                      className="mc-access-btn"
                      style={{ background: "#3b82f6" }}
                    >
                      Học ngay
                    </Link>
                  </div>
                ))}
              </div>
            )}

            {/* Trial Exercises Section */}
            <div className="mc-section-label">
              <span>Bài tập thực hành thử</span>
              <span className="mc-count-pill">{freeExercises.length} bài</span>
            </div>

            {freeExercises.length === 0 ? (
              <div className="trial-empty-box">Hiện tại chưa có bài tập học thử nào được cập nhật.</div>
            ) : (
              <div className="mc-grid">
                {freeExercises.map((e, i) => (
                  <div className="mc-card trial-card" key={`ex-${e.MaExercise}`} style={{ animationDelay: `${i * 60}ms` }}>
                    <div className="mc-card-header">
                      <div>
                        <span className="trial-badge" style={{ background: "#fef3c7", color: "#d97706" }}>Luyện tập</span>
                        <h3 className="mc-card-name" style={{ marginTop: 8 }}>{e.Title}</h3>
                        <span className="mc-card-code" style={{ background: "#ecfdf5", color: "#059669" }}>{e.Type}</span>
                      </div>
                      <div className="trial-icon-wrap" style={{ background: "#fef3c7" }}><FaPenNib style={{ color: "#d97706" }} /></div>
                    </div>
                    <p className="trial-desc">
                      {e.Content ? e.Content.slice(0, 100) + (e.Content.length > 100 ? "..." : "") : "Bài tập rèn luyện kỹ năng nâng cao."}
                    </p>
                    <Link
                      to={`/exercise/${e.MaExercise}`}
                      state={{ maLopHoc: null }}
                      className="mc-access-btn"
                      style={{ background: "#10b981" }}
                    >
                      Làm bài
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Normal Registered Classes View */
          <>


            <div className="mc-list-layout">
              {classes.map((c, i) => {
                const isExpanded = !!expandedClasses[c.MaLopHoc];
                const details = classDetails[c.MaLopHoc];

                return (
                  <div className="mc-card" key={c.MaLopHoc} style={{ animationDelay: `${i * 60}ms` }}>
                    <Link to={`/class-detail/${c.MaLopHoc}`} className="mc-card-main-info">
                      <div className="mc-card-header">
                        <div>
                          <h3 className="mc-card-name">{c.TenLop}</h3>
                          <span className="mc-card-code">{c.TenKhoaHoc}</span>
                        </div>
                      </div>

                      <div className="mc-card-meta-grid">
                        <div className="mc-meta-column">
                          {c.LichHoc && (
                            <span>
                              <FaCalendarAlt className="mc-icon" />
                              Lịch học: {c.LichHoc}
                            </span>
                          )}
                          <span>
                            <FaUsers className="mc-icon" />
                            Sĩ số: {c.SoLuongHocVien || 0} học viên
                          </span>
                          <div className="mc-progress-inline">
                            <span className="mc-progress-label">
                              <FaChartLine className="mc-icon" />
                              Tiến độ học tập
                            </span>
                            <div className="mc-bar">
                              <div
                                className="mc-bar-fill"
                                style={{ width: `${c.TienDo || 0}%`, background: pctColor(c.TienDo || 0) }}
                              />
                            </div>
                            <span className="mc-progress-pct">{c.TienDo || 0}%</span>
                          </div>
                        </div>
                      </div>
                    </Link>

                    <div
                      className={`mc-card-actions ${isExpanded ? "expanded" : ""}`}
                      onClick={() => handleToggleClassDetails(c.MaLopHoc)}
                    >
                      <span className={`mc-toggle-syllabus-text ${isExpanded ? "active" : ""}`}>
                        Bài cần hoàn thiện {isExpanded ? <FaChevronUp size={12} style={{ marginLeft: 4 }} /> : <FaChevronDown size={12} style={{ marginLeft: 4 }} />}
                      </span>
                    </div>

                    {isExpanded && (
                      <div className="mc-expanded-syllabus">
                        {details?.loading ? (
                          <div className="mc-details-loading">
                            <div className="mc-loading-spinner"></div>
                            <span>Đang tải danh sách bài học cần hoàn thiện...</span>
                          </div>
                        ) : (() => {
                          const uncompletedLessons = (details?.lessons || []).map((l: any, idx: number) => {
                            const lectures = (details.lecturesMap[l.MaLesson] || []).filter(
                              (lec: any) => localStorage.getItem(`completed_lecture_${userId}_${lec.MaBaiHoc}`) !== "true"
                            );
                            const exercises = details.exercises
                              .filter((ex: any) => ex.MaLesson === l.MaLesson)
                              .filter((ex: any) => !submittedExerciseIds.has(ex.MaExercise));
                            const documents = details.documents
                              .filter((d: any) => d.MaLesson === l.MaLesson)
                              .filter((doc: any) => localStorage.getItem(`completed_document_${userId}_${doc.MaTaiLieu}`) !== "true");
                            return {
                              ...l,
                              originalIdx: idx,
                              lectures,
                              exercises,
                              documents,
                              hasContent: lectures.length > 0 || exercises.length > 0 || documents.length > 0
                            };
                          }).filter((l: any) => l.hasContent);

                          if (uncompletedLessons.length === 0) {
                            return <div className="mc-details-empty">🎉 Tuyệt vời! Bạn đã hoàn thành tất cả các nội dung trong lớp học này.</div>;
                          }

                          return (
                            <div className="mc-lessons-list">
                              {uncompletedLessons.map((l: any) => {
                                return (
                                  <div className="mc-lesson-box" key={l.MaLesson}>
                                    <div className="mc-lesson-header">
                                      <h4>Buổi {l.ThuTu || l.originalIdx + 1}: {l.TenLesson}</h4>
                                      {l.MoTa && <p className="mc-lesson-desc">{l.MoTa}</p>}
                                    </div>

                                    <div className="mc-lesson-content-grid">
                                      {/* Lectures */}
                                      {l.lectures.map((lec: any) => (
                                        <Link
                                          to={`/bai-giangSV/${lec.MaBaiHoc}`}
                                          state={{ maLopHoc: c.MaLopHoc }}
                                          className="mc-item-card lecture-item"
                                          key={lec.MaBaiHoc}
                                        >
                                          <div className="mc-item-icon"><FaBookOpen /></div>
                                          <div className="mc-item-info">
                                            <span className="mc-item-badge lecture-badge">Bài giảng</span>
                                            <p className="mc-item-title">{lec.TieuDe}</p>
                                            <span className="mc-item-meta">{lec.LoaiBaiHoc} • {lec.ThoiLuong || "N/A"}</span>
                                          </div>
                                        </Link>
                                      ))}

                                      {/* Exercises & Tests */}
                                      {l.exercises.map((ex: any) => {
                                        const isTest = ex.Type?.toLowerCase().includes("test") || ex.Title?.toLowerCase().includes("test") || ex.Title?.toLowerCase().includes("kiểm tra");
                                        return (
                                          <Link
                                            to={`/exercise/${ex.MaExercise}`}
                                            state={{ maLopHoc: c.MaLopHoc }}
                                            className={`mc-item-card exercise-item ${isTest ? "test-item" : ""}`}
                                            key={ex.MaExercise}
                                          >
                                            <div className="mc-item-icon"><FaPenNib /></div>
                                            <div className="mc-item-info">
                                              <span className={`mc-item-badge ${isTest ? "test-badge" : "exercise-badge"}`}>
                                                {isTest ? "Bài kiểm tra" : "Bài tập thực hành"}
                                              </span>
                                              <p className="mc-item-title">{ex.Title}</p>
                                              <span className="mc-item-meta">{ex.Type || "Practice"}</span>
                                            </div>
                                          </Link>
                                        );
                                      })}

                                      {/* Documents */}
                                      {l.documents.map((doc: any) => (
                                        <a
                                          href={doc.FileUrl ? `${API}${doc.FileUrl}` : "#"}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="mc-item-card document-item"
                                          key={doc.MaTaiLieu}
                                          onClick={(e) => {
                                            if (!doc.FileUrl) {
                                              e.preventDefault();
                                              alert("Tài liệu chưa có file đính kèm.");
                                              return;
                                            }
                                            if (userId) {
                                              localStorage.setItem(`completed_document_${userId}_${doc.MaTaiLieu}`, "true");
                                              setRefreshTrigger(prev => prev + 1);
                                            }
                                          }}
                                        >
                                          <div className="mc-item-icon"><FiFileText /></div>
                                          <div className="mc-item-info">
                                            <span className="mc-item-badge document-badge">Tài liệu</span>
                                            <p className="mc-item-title">{doc.TieuDe}</p>
                                            <span className="mc-item-meta">{doc.MoTa || "Tài liệu học tập"}</span>
                                          </div>
                                        </a>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* MODAL GHI DANH VÀO LỚP */}
      {showEnrollModal && (
        <div className="modal-backdrop-blur">
          <div className="course-form-modal w-520">
            <div className="modal-header-section">
              <h3>Ghi danh vào lớp học</h3>
              <button
                className="modal-close-icon-btn"
                onClick={() => setShowEnrollModal(false)}
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleEnrollSubmit}>
              <div className="modal-scrollable-body">
                <div className="modal-form-group">
                  <label className="modal-form-label">Họ và tên sinh viên</label>
                  <input
                    type="text"
                    className="modal-form-input"
                    value={enrollName}
                    onChange={(e) => setEnrollName(e.target.value)}
                    placeholder="Họ và tên sinh viên"
                  />
                </div>

                <div className="modal-form-group">
                  <label className="modal-form-label">Mã sinh viên</label>
                  <input
                    type="text"
                    className="modal-form-input"
                    value={enrollStudentId}
                    onChange={(e) => setEnrollStudentId(e.target.value)}
                    placeholder="Mã sinh viên"
                  />
                </div>

                <div className="modal-form-group">
                  <label className="modal-form-label">Mã lớp học</label>
                  <input
                    type="text"
                    className="modal-form-input"
                    value={enrollClassId}
                    onChange={(e) => setEnrollClassId(e.target.value)}
                    placeholder="Nhập mã lớp học"
                  />
                </div>
              </div>

              <div className="modal-footer-section">
                <button
                  type="button"
                  className="footer-cancel-btn"
                  onClick={() => setShowEnrollModal(false)}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="footer-save-btn"
                >
                  Ghi danh
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default MyCourses;