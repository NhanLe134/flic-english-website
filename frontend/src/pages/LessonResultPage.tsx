import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useMemo, Fragment } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "./lessonResultPage.css";
import BaoCaoKetQuaQTV from "./Baocaoketquaqtv";

interface StudentScore {
  Diem: number | null;
  MaBaiNop: number | null;
}

interface Student {
  MaSinhVien: string;
  HoTen: string;
  GioiTinh: string;
  NgayGhiDanh: string;
  TrangThai: string;
  MaNguoiDung: number;
  scores: Record<number, StudentScore | null>; // MaBaiTap -> StudentScore
  diemTB: number | null;
}

interface Exercise {
  MaBaiTap: number;
  TenBai: string;
  TenBuoiHoc: string | null;
  ThuTu: number | null;
  MaBuoiHoc: number | null;
  MaLopHoc: number | null;
  TenLop: string | null;
}

const LessonResultPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [students, setStudents] = useState<Student[]>([]);
  const [classExercises, setClassExercises] = useState<Exercise[]>([]);
  const [classInfo, setClassInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [lessons, setLessons] = useState<any[]>([]);
  const [expandedStudents, setExpandedStudents] = useState<Set<string>>(new Set());

  const refetchClassInfo = () => {
    fetch(`http://localhost:5000/classes/${id}/info`)
      .then(r => r.json())
      .then(info => setClassInfo(info))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    Promise.all([
      fetch(`http://localhost:5000/classes/${id}/info`).then(r => r.json()),
      fetch(`http://localhost:5000/lophoc/${id}/sinhvien`).then(r => r.json()),
      fetch(`http://localhost:5000/baocao/baitap-headers`).then(r => r.json()),
      fetch(`http://localhost:5000/baocao/diem-all`).then(r => r.json()),
      fetch(`http://localhost:5000/classes/${id}/lessons`).then(r => r.json()),
    ])
      .then(([info, sinhVienList, headers, grades, lessonsList]) => {
        setClassInfo(info);
        setLessons(Array.isArray(lessonsList) ? lessonsList : []);

        // Filter and sort exercises for this class by lesson order (ThuTu) and then MaBaiTap
        const classExs = (Array.isArray(headers) ? headers : [])
          .filter((h: any) => Number(h.MaLopHoc) === Number(id))
          .sort((a: any, b: any) => {
            if (a.ThuTu !== b.ThuTu) {
              return (a.ThuTu ?? 0) - (b.ThuTu ?? 0);
            }
            return a.MaBaiTap - b.MaBaiTap;
          });
        setClassExercises(classExs);

        // Map grades to a lookup map (MaNguoiDung -> MaBaiTap -> { Diem, MaBaiNop })
        const gradesMap: Record<number, Record<number, { Diem: number | null, MaBaiNop: number | null }>> = {};
        if (Array.isArray(grades)) {
          grades.forEach((g: any) => {
            const userId = Number(g.MaSinhVien); // MaSinhVien field in BAINOP stores MaNguoiDung
            const exId = Number(g.MaBaiTap);
            const score = g.Diem !== null ? Number(g.Diem) : null;
            const submissionId = g.MaBaiNop ? Number(g.MaBaiNop) : null;
            if (!gradesMap[userId]) {
              gradesMap[userId] = {};
            }
            gradesMap[userId][exId] = { Diem: score, MaBaiNop: submissionId };
          });
        }

        // Map students with their grades and average score
        const mappedStudents: Student[] = (Array.isArray(sinhVienList) ? sinhVienList : []).map((sv: any) => {
          const studentScores: Record<number, StudentScore | null> = {};
          classExs.forEach(ex => {
            const userId = Number(sv.MaNguoiDung);
            const exId = ex.MaBaiTap;
            studentScores[exId] = (gradesMap[userId] && gradesMap[userId][exId] !== undefined)
              ? gradesMap[userId][exId]
              : null;
          });

          // Calculate average score for submitted exercises
          const submittedScores = Object.values(studentScores)
            .filter((s): s is StudentScore => s !== null && s.Diem !== null)
            .map(s => s.Diem as number);
          const diemTB = submittedScores.length > 0
            ? Math.round((submittedScores.reduce((a, b) => a + b, 0) / submittedScores.length) * 100) / 100
            : null;

          return {
            MaSinhVien: sv.MaSinhVien ? sv.MaSinhVien.trim() : "",
            HoTen: sv.HoTen || "—",
            GioiTinh: sv.GioiTinh || "—",
            NgayGhiDanh: sv.NgayGhiDanh || "",
            TrangThai: sv.TrangThai || "—",
            MaNguoiDung: sv.MaNguoiDung,
            scores: studentScores,
            diemTB
          };
        });

        setStudents(mappedStudents);
      })
      .catch(err => console.error("Lỗi tải dữ liệu kết quả học tập:", err))
      .finally(() => setLoading(false));
  }, [id]);

  // Filter students based on search input
  const filteredStudents = useMemo(() => {
    return students.filter(s =>
      s.HoTen.toLowerCase().includes(search.toLowerCase()) ||
      s.MaSinhVien.toLowerCase().includes(search.toLowerCase())
    );
  }, [students, search]);

  // Calculate stats for the class
  const stats = useMemo(() => {
    const totalCount = filteredStudents.length;
    const exerciseCount = classExercises.length;
    const studentsWithAvg = filteredStudents.filter(s => s.diemTB !== null);
    const classAvg = studentsWithAvg.length > 0
      ? (studentsWithAvg.reduce((sum, s) => sum + (s.diemTB ?? 0), 0) / studentsWithAvg.length).toFixed(1)
      : "—";

    return {
      totalCount,
      exerciseCount,
      classAvg
    };
  }, [filteredStudents, classExercises]);

  // Lấy danh sách các buổi học (sắp xếp giảm dần và lọc theo buổi đang học nếu có)
  const uniqueBuois = useMemo(() => {
    if (lessons.length === 0) return [];
    
    const activeLesson = lessons.find(l => l.MaBuoiHoc === classInfo?.ActiveBuoiHocId);
    const activeThuTu = activeLesson ? activeLesson.ThuTu : null;

    const allBuoiNumbers = Array.from(new Set(lessons.filter(l => l.ThuTu !== null).map(l => l.ThuTu as number)))
      .sort((a, b) => b - a);

    if (activeThuTu !== null && activeThuTu !== 0) {
      return allBuoiNumbers.filter(b => b <= activeThuTu);
    }
    return allBuoiNumbers;
  }, [lessons, classInfo]);

  const toggleExpandStudent = (maSV: string) => {
    setExpandedStudents(prev => {
      const next = new Set(prev);
      if (next.has(maSV)) {
        next.delete(maSV);
      } else {
        next.add(maSV);
      }
      return next;
    });
  };

  const handleMarkActiveLesson = async (lessonId: number) => {
    try {
      const res = await fetch(`http://localhost:5000/classes/${id}/active-buoihoc`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activeBuoiHocId: lessonId })
      });
      if (res.ok) {
        refetchClassInfo();
      } else {
        alert("Lỗi khi cập nhật buổi học đang học");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getStudentBuoiStatus = (s: Student, buoiNum: number) => {
    const exsInBuoi = classExercises.filter(ex => ex.ThuTu === buoiNum);
    if (exsInBuoi.length === 0) return { status: "none", score: null };

    const scores = exsInBuoi
      .map(ex => s.scores[ex.MaBaiTap]?.Diem)
      .filter((d): d is number => d !== null);

    const hasSubmission = exsInBuoi.some(ex => s.scores[ex.MaBaiTap]?.MaBaiNop !== null);

    if (scores.length > 0) {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      return { status: "graded", score: Math.round(avg * 10) / 10 };
    }

    if (hasSubmission) {
      return { status: "pending", score: null };
    }

    return { status: "chuanop", score: null };
  };

  const handleExportExcel = () => {
    if (filteredStudents.length === 0) {
      alert("Không có học viên nào để xuất!");
      return;
    }

    const headers = [
      "Mã sinh viên",
      "Họ tên",
      "Lớp/khóa",
      "Trạng thái",
      ...uniqueBuois.map(b => `Buổi ${b}`),
      "Điểm trung bình"
    ];

    const rows = filteredStudents.map(s => {
      const rowData: Record<string, any> = {
        "Mã sinh viên": s.MaSinhVien,
        "Họ tên": s.HoTen,
        "Lớp/khóa": classInfo?.TenLop || "—",
        "Trạng thái": s.TrangThai || "—",
      };
      uniqueBuois.forEach(b => {
        const res = getStudentBuoiStatus(s, b);
        rowData[`Buổi ${b}`] = res.status === "graded" ? res.score : res.status === "pending" ? "Chờ chấm" : "Chưa nộp";
      });
      rowData["Điểm trung bình"] = s.diemTB !== null ? s.diemTB : "—";
      return rowData;
    });

    const worksheet = XLSX.utils.json_to_sheet(rows, { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bảng điểm");

    const colWidths = [
      { wch: 15 }, { wch: 25 }, { wch: 25 }, { wch: 15 },
      ...uniqueBuois.map(() => ({ wch: 15 })),
      { wch: 18 }
    ];
    worksheet["!cols"] = colWidths;

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `BangDiem_${classInfo?.TenLop || "Lop"}_${new Date().toLocaleDateString("vi-VN").replace(/\//g, "-")}.xlsx`);

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const getDiemClass = (d: number | null) => {
    if (d === null) return "lrp-diem-chuanop";
    if (d >= 8) return "lrp-diem-xanh";
    if (d >= 6) return "lrp-diem-vang";
    return "lrp-diem-do";
  };

  return (
    <div className="lrp-wrapper">
      <div className="lrp-header-row">
        <span className="lrp-back" onClick={() => navigate("/quan-ly-ket-qua")}>
          ← Quay lại
        </span>
        <div className="lrp-header-info">
          <h1>{loading ? "Đang tải..." : classInfo?.TenLop || "—"}</h1>
        </div>
      </div>

      {/* STATS */}
      <div className="lrp-stats-row">
        <div className="lrp-stat-card">
          <span className="lrp-stat-label">Tổng học viên</span>
          <span className="lrp-stat-value">{stats.totalCount}</span>
        </div>
        <div className="lrp-stat-card">
          <span className="lrp-stat-label">Tổng số bài tập</span>
          <span className="lrp-stat-value">{stats.exerciseCount}</span>
        </div>
        <div className="lrp-stat-card">
          <span className="lrp-stat-label">Điểm trung bình lớp</span>
          <span className="lrp-stat-value">{stats.classAvg}</span>
        </div>
      </div>

      {/* SEARCH & EXPORT */}
      <div className="lrp-search-export-row">
        <form className="lrp-search-container" onSubmit={(e) => e.preventDefault()}>
          <input
            className="lrp-search-input"
            type="text"
            placeholder="Tìm theo tên hoặc mã sinh viên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="lrp-search-button" type="button">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </form>

        <button className="lrp-export-btn" onClick={handleExportExcel}>
          Xuất Excel
        </button>
      </div>

      {/* TABLE */}
      <div className="lrp-table-container">
        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: "#999" }}>Đang tải bảng điểm...</div>
        ) : (
          id === "101" ? (
            <BaoCaoKetQuaQTV />
          ) : (
            <div className="lrp-table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Mã sinh viên</th>
                    <th>Họ tên</th>
                    <th>Lớp/khóa</th>
                    <th>Trạng thái</th>
                    {uniqueBuois.map(b => {
                      const lessonForBuoi = lessons.find(l => l.ThuTu === b);
                      const isActive = lessonForBuoi && classInfo?.ActiveBuoiHocId === lessonForBuoi.MaBuoiHoc;
                      return (
                        <th key={b}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                            <span>Buổi {b}</span>
                            {isActive ? (
                              <span className="lrp-active-badge">Đang học</span>
                            ) : (
                              <button 
                                type="button" 
                                className="lrp-mark-active-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (lessonForBuoi) {
                                    handleMarkActiveLesson(lessonForBuoi.MaBuoiHoc);
                                  }
                                }}
                              >
                                Đánh dấu đang học
                              </button>
                            )}
                          </div>
                        </th>
                      );
                    })}
                    <th>Điểm TB</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={5 + uniqueBuois.length} style={{ textAlign: "center", padding: "30px", color: "#999" }}>
                        Không tìm thấy dữ liệu học viên
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((s, index) => {
                      const isExpanded = expandedStudents.has(s.MaSinhVien);
                      return (
                        <Fragment key={index}>
                          <tr 
                            className="lrp-row"
                            onClick={() => toggleExpandStudent(s.MaSinhVien)}
                            style={{ cursor: 'pointer' }}
                          >
                            <td className="lrp-code-cell">{s.MaSinhVien}</td>
                            <td>
                              <span className="lrp-name-text">{s.HoTen}</span>
                            </td>
                            <td>
                              <p style={{ margin: 0, fontWeight: 600 }}>{classInfo?.TenLop || "—"}</p>
                              <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>{classInfo?.TenKhoaHoc || "—"}</p>
                            </td>
                            <td>
                              <span className={`lrp-status-badge ${s.TrangThai === "Đang học" ? "active" : ""}`}>
                                {s.TrangThai}
                              </span>
                            </td>
                            {uniqueBuois.map(b => {
                              const res = getStudentBuoiStatus(s, b);
                              return (
                                <td key={b}>
                                  {res.status === "graded" ? (
                                    <span className={`lrp-score-badge ${getDiemClass(res.score)}`}>
                                      {res.score}
                                    </span>
                                  ) : res.status === "pending" ? (
                                    <span className="lrp-score-badge lrp-diem-chuanop" style={{ background: '#e0d8cc', color: '#555' }}>
                                      Chờ chấm
                                    </span>
                                  ) : res.status === "chuanop" ? (
                                    <span className="lrp-score-chuanop">Chưa nộp</span>
                                  ) : (
                                    <span className="lrp-score-chuanop">—</span>
                                  )}
                                </td>
                              );
                            })}
                            <td>
                              {s.diemTB !== null ? (
                                <span className={`lrp-score-badge ${getDiemClass(s.diemTB)}`} style={{ fontWeight: 700 }}>
                                  {s.diemTB}
                                </span>
                              ) : (
                                <span className="lrp-score-chuanop">—</span>
                              )}
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr className="lrp-expanded-row">
                              <td colSpan={6 + uniqueBuois.length}>
                                <div className="lrp-details-container">
                                  <h4 className="lrp-details-title">Chi tiết bài tập của {s.HoTen}</h4>
                                  <div className="lrp-details-grid">
                                    {uniqueBuois.map(b => {
                                      const buoiExs = classExercises.filter(ex => ex.ThuTu === b);
                                      return (
                                        <div key={b} className="lrp-details-buoi-card">
                                          <h5>Buổi {b}</h5>
                                          <div className="lrp-details-ex-list">
                                            {buoiExs.length === 0 ? (
                                              <div className="lrp-score-chuanop">Không có bài tập</div>
                                            ) : (
                                              buoiExs.map(ex => {
                                                const scoreObj = s.scores[ex.MaBaiTap];
                                                const hasScore = scoreObj && scoreObj.Diem !== null;
                                                const hasSubmission = scoreObj && scoreObj.MaBaiNop !== null;
                                                return (
                                                  <div key={ex.MaBaiTap} className="lrp-details-ex-item">
                                                    <span className="ex-title">{ex.TenBai}</span>
                                                    <span className="ex-score">
                                                      {hasScore ? (
                                                        <span 
                                                          className={`score-val ${getDiemClass(scoreObj.Diem)} ${hasSubmission ? "clickable-badge" : ""}`}
                                                          onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (scoreObj.MaBaiNop) {
                                                              navigate(`/cham-bai/${scoreObj.MaBaiNop}`);
                                                            }
                                                          }}
                                                          style={hasSubmission ? { cursor: 'pointer', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 } : { padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}
                                                        >
                                                          {scoreObj.Diem}
                                                        </span>
                                                      ) : hasSubmission ? (
                                                        <span 
                                                          className="score-val pending"
                                                          onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (scoreObj.MaBaiNop) {
                                                              navigate(`/cham-bai/${scoreObj.MaBaiNop}`);
                                                            }
                                                          }}
                                                          style={{ cursor: 'pointer', background: '#f1f5f9', color: '#64748b', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}
                                                        >
                                                          Chờ chấm
                                                        </span>
                                                      ) : (
                                                        <span className="score-val none">Chưa nộp</span>
                                                      )}
                                                    </span>
                                                  </div>
                                                );
                                              })
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {showSuccess && (
        <div className="lrp-success-overlay">
          <div className="lrp-success-modal">
            <div className="lrp-check-circle">
              <span style={{ fontSize: 28, color: "#2ecc71" }}>✔</span>
            </div>
            <p>Tải file báo cáo thành công</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonResultPage;