import { FiTrash2, FiEye, FiSend } from "react-icons/fi";

interface BanNhapCardProps {
  item: any;
  onDelete: (id: number) => void;
  onSubmit: (id: number) => void;
  onView: (id: number, isLesson: boolean, maBuoiHoc: number) => void;
}

export default function BanNhapCard({
  item,
  onDelete,
  onSubmit,
  onView,
}: BanNhapCardProps) {
  const id = item.MaBaiHoc || item.MaBaiTap;
  const title = item.TieuDe || item.Title;
  const typeLabel = item.LoaiBaiHoc || item.Type;
  const extraLabel = item.ThoiLuong ? `Thời lượng: ${item.ThoiLuong}` : `Ngày tạo: ${item.CreatedDate}`;
  const isLesson = !!item.MaBaiHoc;
  const maBuoiHoc = item.MaBuoiHoc || 0;

  return (
    <div className="dm-card">
      <div className="dm-card-info">
        <h3 
          style={{ cursor: "pointer", color: "#F95800" }}
          onClick={() => onView(id, isLesson, maBuoiHoc)}
          onMouseOver={e => {
            e.currentTarget.style.textDecoration = "underline";
          }}
          onMouseOut={e => {
            e.currentTarget.style.textDecoration = "none";
          }}
        >
          {title}
        </h3>
        <div className="dm-card-meta">
          <span className="dm-meta-tag">{typeLabel}</span>
          <span>{extraLabel}</span>
          {item.TenKhoaHoc && (
            <span className="dm-meta-course">
              {item.TenKhoaHoc} &middot; {item.TenLop} &middot; {item.TenBuoiHoc}
            </span>
          )}
        </div>
      </div>
      <div className="dm-card-actions">
        <button
          className="dm-action-delete"
          onClick={() => onDelete(id)}
          title="Xóa bản nháp"
        >
          <FiTrash2 size={16} />
          Xóa
        </button>
        <button
          className="dm-action-view"
          onClick={() => onView(id, isLesson, maBuoiHoc)}
          style={{
            background: "#eff6ff",
            color: "#3b82f6",
            border: "1px solid #dbeafe",
            padding: "6px 12px",
            borderRadius: "6px",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            transition: "all 0.2s"
          }}
          onMouseOver={e => {
            e.currentTarget.style.background = "#dbeafe";
          }}
          onMouseOut={e => {
            e.currentTarget.style.background = "#eff6ff";
          }}
        >
          <FiEye size={16} />
          Xem
        </button>
        <button
          className="dm-action-submit"
          onClick={() => onSubmit(id)}
        >
          <FiSend size={16} />
          Gửi duyệt
        </button>
      </div>
    </div>
  );
}
