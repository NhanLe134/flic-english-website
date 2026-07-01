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

function mapTypeToSkillName(type?: string) {
  if (!type) return "";
  const t = type.toLowerCase().trim();
  if (t === "listening" || t === "l" || t === "nghe") return "Listening";
  if (t === "reading" || t === "r" || t === "đọc" || t === "doc") return "Reading";
  if (t === "writing" || t === "w" || t === "viết" || t === "viet") return "Writing";
  if (t === "speaking" || t === "s" || t === "nói" || t === "noi") return "Speaking";
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function MyCourses() {
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  const userId = user.MaNguoiDung;

  const [classes, setClasses] = useState<any[]>([]);
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
  const [completedLectureIds, setCompletedLectureIds] = useState<Set<number>>(new Set());
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (!userId) return;
    fetch(`${API}/student/bainop/${userId}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const ids = new Set<number>(data.map((sub: any) => sub.MaBaiTap));
          setSubmittedExerciseIds(ids);
        }
      })
      .catch((err) => console.error("Error fetching submissions:", err));
  }, [userId, refreshTrigger]);

  useEffect(() => {
    if (!userId) return;
    fetch(`${API}/student/completed-lectures/${userId}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCompletedLectureIds(new Set<number>(data.map((id: any) => Number(id))));
        }
      })
      .catch((err) => console.error("Error fetching completed lectures:", err));
  }, [userId, refreshTrigger]);

  const handleToggleClassDetails = async (classId: number) => {
    const cls = classes.find(c => c.MaLopHoc === classId);
    const isApproved = cls && (cls.TrangThai === 'Đang học' || cls.TrangThai === 'Đã hoàn thành');
    if (!isApproved) return;

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
        fetch(`${API}/classes/${classId}/baitap`).then(r => r.json()),
        fetch(`${API}/classes/${classId}/tailieu`).then(r => r.json())
      ]);

      const lessonsList = Array.isArray(lessonsRes) ? lessonsRes : [];
      const exercisesList = Array.isArray(exercisesRes)
        ? exercisesRes.map((ex: any) => ({
            ...ex,
            MaExercise: ex.MaBaiTap,
            MaLesson: ex.MaBuoiHoc
          }))
        : [];
      const documentsList = Array.isArray(tailieuRes) ? tailieuRes : [];

      // Fetch lectures for all lessons in parallel
      const lecturesPromises = lessonsList.map(async (l: any) => {
        try {
          const res = await fetch(`${API}/baigiang/${l.MaLesson}`);
          const data = await res.json();
          return {
            lessonId: l.MaLesson,
            lectures: Array.isArray(data) ? data.filter((bg: any) => bg.TrangThai === "published" || bg.TrangThai === "Đã duyệt") : []
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


  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollStudentId.trim()) {
      alert("Vui lòng nhập mã sinh viên.");
      return;
    }
    if (!enrollClassId.trim()) {
      alert("Vui lòng nhập mã lớp học.");
      return;
    }

    try {
      const res = await fetch(`${API}/student/lophoc/request-ghidanh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          MaLopHoc: enrollClassId.trim(), 
          MaSinhVien: enrollStudentId 
        })
      });
      const data = await res.json();

      if (res.ok) {
        alert(data.message || "Gửi yêu cầu ghi danh thành công! Vui lòng chờ Quản trị viên phê duyệt.");
        setShowEnrollModal(false);
      } else {
        alert(data.message || "Lỗi khi gửi yêu cầu ghi danh.");
      }
    } catch (err) {
      console.error("Error sending enrollment request:", err);
      alert("Lỗi hệ thống khi gửi yêu cầu ghi danh.");
    }
  };

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("user") || "{}");
    const userId = user.MaNguoiDung;

    if (!userId) {
      setLoading(false);
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
        setLoading(false);
      })
      .catch(() => {
        setClasses([]);
        setLoading(false);
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
          <div className="mc-empty-state" style={{
            background: "#ffffff",
            border: "1px solid #f0e4d4",
            borderRadius: "20px",
            padding: "48px 32px",
            textAlign: "center",
            boxShadow: "0 10px 30px rgba(0, 0, 128, 0.02)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
            maxWidth: "500px",
            margin: "40px auto 0 auto"
          }}>
            <div style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: "#FFF2EB",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#F95800",
              fontSize: "24px"
            }}>
              <FaBookOpen />
            </div>
            <h3 style={{ fontSize: "20px", fontWeight: 700, color: "#000080", margin: 0 }}>Bạn chưa tham gia lớp học nào</h3>
            <p style={{ fontSize: "14px", color: "#64748b", margin: 0, lineHeight: 1.6 }}>
              Vui lòng nhấn nút <strong>"Ghi danh vào lớp"</strong> ở góc trên bên phải và nhập mã lớp học để tham gia khóa học.
            </p>
          </div>
        ) : (
          /* Normal Registered Classes View */
          <>


            <div className="mc-list-layout">
              {classes.map((c, i) => {
                const isExpanded = !!expandedClasses[c.MaLopHoc];
                const details = classDetails[c.MaLopHoc];
                const isApproved = c.TrangThai === 'Đang học' || c.TrangThai === 'Đã hoàn thành';

                const CardContent = (
                  <>
                    <div className="mc-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                      <div>
                        <h3 className="mc-card-name">{c.TenLop}</h3>
                        <span className="mc-card-code">{c.TenKhoaHoc}</span>
                      </div>
                      
                      {/* Status badges */}
                      {c.TrangThai === 'Chờ duyệt' && (
                        <span className="mc-status-badge" style={{
                          background: '#FFF2EB',
                          color: '#F95800',
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: 600,
                          whiteSpace: 'nowrap'
                        }}>⏳ Chờ duyệt</span>
                      )}
                      {c.TrangThai === 'Từ chối' && (
                        <span className="mc-status-badge" style={{
                          background: '#FEE2E2',
                          color: '#EF4444',
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: 600,
                          whiteSpace: 'nowrap'
                        }}>❌ Bị từ chối</span>
                      )}
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
                        {isApproved && (
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
                        )}
                      </div>
                    </div>
                  </>
                );

                return (
                  <div className="mc-card" key={c.MaLopHoc} style={{ animationDelay: `${i * 60}ms` }}>
                    {isApproved ? (
                      <Link to={`/MyCourses/${c.MaLopHoc}`} className="mc-card-main-info">
                        {CardContent}
                      </Link>
                    ) : (
                      <div className="mc-card-main-info" style={{ cursor: 'default', opacity: 0.8 }}>
                        {CardContent}
                      </div>
                    )}

                    {isApproved && (
                      <div
                        className={`mc-card-actions ${isExpanded ? "expanded" : ""}`}
                        onClick={() => handleToggleClassDetails(c.MaLopHoc)}
                      >
                        <span className={`mc-toggle-syllabus-text ${isExpanded ? "active" : ""}`}>
                          Bài cần hoàn thiện {isExpanded ? <FaChevronUp size={12} style={{ marginLeft: 4 }} /> : <FaChevronDown size={12} style={{ marginLeft: 4 }} />}
                        </span>
                      </div>
                    )}

                    {isExpanded && (
                      <div className="mc-expanded-syllabus">
                        {details?.loading ? (
                          <div className="mc-details-loading">
                            <div className="mc-loading-spinner"></div>
                            <span>Đang tải danh sách bài học cần hoàn thiện...</span>
                          </div>
                        ) : (() => {
                          const totalLessons = (details?.lessons || []).length;
                          const activeLessons = details?.lessons || [];

                          const uncompletedLessons = activeLessons.map((l: any, idx: number) => {
                            const lectures = (details.lecturesMap[l.MaLesson] || []).filter(
                              (lec: any) => !completedLectureIds.has(Number(lec.MaBaiHoc))
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
                          });

                          if (totalLessons === 0) {
                            return <div className="mc-details-empty">Lớp học chưa cập nhật buổi học.</div>;
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
                                      {l.lectures.length === 0 && l.exercises.length === 0 && l.documents.length === 0 && (
                                        <div style={{ color: "#94a3b8", fontSize: "13px", padding: "8px 0", gridColumn: "1 / -1" }}>
                                          Buổi học chưa có nội dung cần hoàn thành.
                                        </div>
                                      )}
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
                                            to={`/baitap/${ex.MaExercise}`}
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
                                              <span className="mc-item-meta">{mapTypeToSkillName(ex.Type) || "Practice"}</span>
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
