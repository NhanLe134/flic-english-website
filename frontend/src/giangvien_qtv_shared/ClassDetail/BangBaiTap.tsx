import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiTrash2, FiEye, FiEyeOff } from "react-icons/fi";
import { hasPermission } from "../../utils/permission";

// Định nghĩa kiểu dữ liệu cho bài tập nhận vào
interface BangBaiTapProps {
  filteredExercises: any[];
  lesson: any;
  buoiHocId: string | undefined;
  handleToggleOpen: (maBaiTap: number) => Promise<void>;
  setSelectedId: (id: number | null) => void;
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

  const coTheThaoTacMo =
    lesson?.TrangThaiLopHoc !== "Đã hoàn thành" && lesson?.TrangThai !== "Đã hoàn thành";

  return (
    <div className="table-responsive">
      <table className="exercise-table">
        <thead>
          <tr>
            <th style={{ width: "120px", textAlign: "center" }}>Loại bài</th>
            <th>Tên bài tập</th>
            <th style={{ width: "130px", textAlign: "center" }}>Duyệt đề</th>
            <th style={{ width: "130px", textAlign: "center" }}>Mở đề</th>
            <th style={{ width: "130px", textAlign: "center" }}>Trạng thái</th>
            <th style={{ width: "150px", textAlign: "center" }}>Cập nhật</th>
            {coTheThaoTacMo && (
              <th style={{ width: "100px", textAlign: "center" }}>Thao tác</th>
            )}
          </tr>
        </thead>
        <tbody>
          {filteredExercises.length === 0 ? (
            <tr>
              <td
                colSpan={coTheThaoTacMo ? 7 : 6}
                className="empty-row"
              >
                Chưa có bài tập nào cho buổi học này.
              </td>
            </tr>
          ) : (
            filteredExercises.map((ex: any) => {
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
              let typeColor = "#000080";
              let typeBg = "#e0e7ff";
              if (isPractice) {
                typeLabel = "Luyện tập thêm";
                typeColor = "#c2410c";
                typeBg = "#ffedd5";
              } else if (isExam) {
                typeLabel = "Kiểm tra";
                typeColor = "#b91c1c";
                typeBg = "#fee2e2";
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
                        fontSize: "13px",
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
                  <td className="col-mode" style={{ textAlign: "center", fontSize: "13px", fontWeight: "500" }}>
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

                  {/* Cột Ngày cập nhật */}
                  <td className="col-date" style={{ textAlign: "center", fontSize: "13px", color: "#64748b" }}>
                    {ex.CreatedDate
                      ? new Date(ex.CreatedDate).toLocaleDateString("vi-VN")
                      : "—"}
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
                            setSelectedId(Number(ex.MaBaiTap));
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
