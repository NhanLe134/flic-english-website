import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiTrash2, FiEye, FiEyeOff, FiFilter } from "react-icons/fi";
import { hasPermission } from "../../utils/permission";

// Định nghĩa kiểu dữ liệu cho bài tập nhận vào
interface BangBaiTapProps {
  filteredExercises: any[];
  lesson: any;
  buoiHocId: string | undefined;
  handleToggleOpen: (maBaiTap: number) => Promise<void>;
  setSelectedId: (id: string | number | null) => void;
  setShowDeleteModal: (show: boolean) => void;
}

const BangBaiTap: React.FC<BangBaiTapProps> = ({
  filteredExercises,
  lesson,
  buoiHocId,
  handleToggleOpen,
  setSelectedId,
  setShowDeleteModal,
}) => {
  const navigate = useNavigate();
  const { maLop, teacherId } = useParams<{ maLop?: string; teacherId?: string }>();

  const [sortState, setSortState] = useState<"none" | "asc" | "desc">("none");
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const sortedExercises = React.useMemo(() => {
    if (sortState === "none") return filteredExercises;
    return [...filteredExercises].sort((a, b) => {
      const valA = a.DiemTB !== undefined && a.DiemTB !== null ? Number(a.DiemTB) : 0;
      const valB = b.DiemTB !== undefined && b.DiemTB !== null ? Number(b.DiemTB) : 0;
      return sortState === "asc" ? valA - valB : valB - valA;
    });
  }, [filteredExercises, sortState]);

  const coTheThaoTacMo =
    lesson?.TrangThaiLopHoc !== "Đã hoàn thành" && lesson?.TrangThai !== "Đã hoàn thành";

  return (
    <div className="table-responsive">
      <table className="exercise-table">
        <thead>
          <tr>
            <th style={{ width: "110px", textAlign: "center" }}>Loại bài</th>
            <th>Tên bài tập</th>
            <th style={{ width: "110px", textAlign: "center" }}>Duyệt đề</th>
            <th style={{ width: "110px", textAlign: "center" }}>Mở đề</th>
            <th style={{ width: "110px", textAlign: "center" }}>Trạng thái</th>
            <th style={{ width: "120px", textAlign: "center" }}>Tỉ lệ nộp</th>
            <th style={{ width: "135px", textAlign: "center", position: "relative" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", justifyContent: "center", width: "100%" }}>
                Điểm TB
                <span 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (showSortDropdown) {
                      setShowSortDropdown(false);
                      setSortState("none");
                    } else {
                      setShowSortDropdown(true);
                    }
                  }}
                  style={{ 
                    cursor: "pointer", 
                    display: "inline-flex", 
                    alignItems: "center", 
                    padding: "2px", 
                    borderRadius: "4px",
                    background: sortState !== "none" ? "#fff4ec" : "transparent"
                  }}
                  title="Sắp xếp điểm"
                >
                  <FiFilter style={{ color: sortState !== "none" ? "#F95800" : "#64748b", fontSize: "14px" }} />
                </span>

                {showSortDropdown && (
                  <div style={{
                    position: "absolute",
                    top: "100%",
                    right: "10px",
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                    zIndex: 1000,
                    minWidth: "120px",
                    padding: "4px 0",
                    marginTop: "6px",
                    textAlign: "left"
                  }}>
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSortState("asc");
                        setShowSortDropdown(false);
                      }}
                      style={{
                        padding: "8px 12px",
                        fontSize: "12px",
                        color: sortState === "asc" ? "#F95800" : "#334155",
                        cursor: "pointer",
                        fontWeight: sortState === "asc" ? 600 : 400,
                        background: sortState === "asc" ? "#fff4ec" : "transparent"
                      }}
                    >
                      Tăng dần
                    </div>
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSortState("desc");
                        setShowSortDropdown(false);
                      }}
                      style={{
                        padding: "8px 12px",
                        fontSize: "12px",
                        color: sortState === "desc" ? "#F95800" : "#334155",
                        cursor: "pointer",
                        fontWeight: sortState === "desc" ? 600 : 400,
                        background: sortState === "desc" ? "#fff4ec" : "transparent"
                      }}
                    >
                      Giảm dần
                    </div>
                  </div>
                )}
              </div>
            </th>
            {coTheThaoTacMo && (
              <th style={{ width: "100px", textAlign: "center" }}>Thao tác</th>
            )}
          </tr>
        </thead>
        <tbody>
          {sortedExercises.length === 0 ? (
            <tr>
              <td
                colSpan={coTheThaoTacMo ? 8 : 7}
                className="empty-row"
              >
                Không tìm thấy bài tập nào
              </td>
            </tr>
          ) : (
            sortedExercises.map((ex: any) => {
              let parsedContent: any = {};
              try {
                if (ex.Content) parsedContent = JSON.parse(ex.Content);
              } catch (e) {}

              // Xác định loại bài kiểm tra/luyện tập thêm
              const isExam =
                ex.IsExam === 1 ||
                ex.Type === "exam" ||
                parsedContent.isExam ||
                ex.Title?.toLowerCase().includes("test") ||
                ex.Title?.toLowerCase().includes("kiểm tra");
              const isPractice = ex.TrangThai === "practice";
              const isHomework = !isExam && !isPractice;

              let typeLabel = "Bài tập";
              if (isPractice) {
                typeLabel = "Luyện tập thêm";
              } else if (isExam) {
                typeLabel = "Kiểm tra";
              }

              // Quyền xóa bài tập
              const canDelete = isPractice
                ? hasPermission("EXTRA_PRACTICE_CREATE")
                : isExam
                ? hasPermission("QUIZ_CREATE")
                : hasPermission("BAITAP_CREATE");

              const hienThiNutXoa = coTheThaoTacMo && canDelete;

              return (
                <tr
                  key={ex.MaBaiTap}
                  className="exercise-row"
                  onClick={() => navigate(`/${teacherId}/lophoc/${maLop}/buoi${buoiHocId}/bt/${ex.MaBaiTap}/view`)}
                  style={{ cursor: "pointer" }}
                >
                  {/* Cột Loại bài */}
                  <td className="col-type" style={{ textAlign: "center" }}>
                    <span
                      className="type-label"
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        color: "#475569",
                        display: "inline-block",
                      }}
                    >
                      {typeLabel}
                    </span>
                  </td>

                  {/* Cột Tên bài tập */}
                  <td className="col-title">
                    <span className="exercise-name">{ex.Title}</span>
                  </td>

                  {/* Cột Trạng thái duyệt */}
                  <td className="col-approved" style={{ textAlign: "center" }}>
                    {!isPractice ? (
                      <span
                        className={`content-status ${
                          ex.TrangThai === "published"
                            ? "published"
                            : ex.TrangThai === "rejected"
                            ? "rejected"
                            : "pending"
                        }`}
                      >
                        {ex.TrangThai === "published"
                          ? "Đã duyệt"
                          : ex.TrangThai === "rejected"
                          ? "Từ chối"
                          : "Chờ duyệt"}
                      </span>
                    ) : (
                      <span style={{ color: "#94a3b8" }}>—</span>
                    )}
                  </td>

                  {/* Cột Mở đề (Thủ công hay tự động) */}
                  <td className="col-mode" style={{ textAlign: "center", fontSize: "12px", fontWeight: "500" }}>
                    {isExam ? (
                      parsedContent.openingMode === "manual" ? "Thủ công" : "Tự động"
                    ) : !isPractice ? (
                      "Thủ công"
                    ) : (
                      <span style={{ color: "#94a3b8" }}>—</span>
                    )}
                  </td>

                  {/* Cột Trạng thái (Mở/đóng bằng icon con mắt) */}
                  <td className="col-status-eye" style={{ textAlign: "center" }}>
                    {(() => {
                      if (isPractice) return <span style={{ color: "#94a3b8" }}>—</span>;
                      
                      const isManual = !isExam || parsedContent.openingMode === "manual";
                      // Bài tập thường mặc định mở (true) nếu chưa có cấu hình cụ thể
                      const isOpened = isExam
                        ? !!parsedContent.isOpened
                        : parsedContent.isOpened !== false;
                      
                      const isApproved = isHomework || ex.TrangThai === "published";

                      if (!isApproved) {
                        return <span style={{ color: "#94a3b8", fontSize: "12.5px" }}>Chờ duyệt</span>;
                      }

                      // Nếu mở đề thủ công (hoặc bài tập thường) thì icon con mắt có thể click để toggle trạng thái
                      if (isManual) {
                        return (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              if (coTheThaoTacMo) {
                                handleToggleOpen(ex.MaBaiTap);
                              }
                            }}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: coTheThaoTacMo ? "pointer" : "default",
                              padding: "4px",
                            }}
                          >
                            {isOpened ? (
                              <FiEye size={20} style={{ color: "#16a34a" }} title="Đang mở (Click để đóng)" />
                            ) : (
                              <FiEyeOff size={20} style={{ color: "#94a3b8" }} title="Đang đóng (Click để mở)" />
                            )}
                          </div>
                        );
                      }

                      // Nếu mở đề tự động (chỉ dành cho bài kiểm tra)
                      return (
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "4px",
                          }}
                        >
                          {isOpened ? (
                            <FiEye size={20} style={{ color: "#16a34a" }} title="Mở tự động" />
                          ) : (
                            <FiEyeOff size={20} style={{ color: "#94a3b8" }} title="Đóng tự động" />
                          )}
                        </div>
                      );
                    })()}
                  </td>

                  {/* Cột Tỉ lệ nộp */}
                  <td className="col-submit-rate" style={{ textAlign: "center", fontSize: "12.5px", fontWeight: "500", color: "#475569" }}>
                    {ex.TiLeNop !== null && ex.TiLeNop !== undefined
                      ? `${ex.TiLeNop}%`
                      : "0%"}
                  </td>

                  {/* Cột Điểm TB */}
                  <td className="col-avg-score" style={{ textAlign: "center", fontSize: "13px", fontWeight: "600", color: "#1e293b" }}>
                    {ex.DiemTB !== null && ex.DiemTB !== undefined
                      ? ex.DiemTB
                      : 0}
                  </td>

                  {/* Cột Thao tác xóa */}
                  {coTheThaoTacMo && (
                    <td className="col-actions" style={{ textAlign: "center" }}>
                      {hienThiNutXoa ? (
                        <button
                          type="button"
                          className="btn-delete-exercise"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedId(isExam ? "exam-" + ex.MaBaiTap : "baitap-" + ex.MaBaiTap);
                            setShowDeleteModal(true);
                          }}
                          title="Xóa bài tập"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      ) : (
                        <span style={{ color: "#94a3b8" }}>—</span>
                      )}
                    </td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default BangBaiTap;
