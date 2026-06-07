import "./lessonDiscussion.css";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";

const API = "http://localhost:5000";

const LessonDiscussionPage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // id = MaBaiHoc

  const user = JSON.parse(sessionStorage.getItem("user") || "{}");

  const [lesson, setLesson]         = useState<any>(null);
  const [comments, setComments]     = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo]       = useState<number | null>(null);
  const [replyText, setReplyText]   = useState("");
  const [showModal, setShowModal]   = useState(false);
  const [deleteId, setDeleteId]     = useState<number | null>(null);

  /* ===== LOAD BÀI GIẢNG ===== */
  useEffect(() => {
    if (!id) return;
    fetch(`${API}/baigiang/detail/${id}`)
      .then(res => res.json())
      .then(data => setLesson(data))
      .catch(err => console.log(err));
  }, [id]);

  /* ===== LOAD BÌNH LUẬN ===== */
  const loadComments = () => {
    if (!id) return;
    fetch(`${API}/binhluan/lesson/${id}`)
      .then(r => r.json())
      .then(data => setComments(Array.isArray(data) ? data : []))
      .catch(() => {});
  };

  useEffect(() => {
    loadComments();
  }, [id]);

  /* ===== GỬI BÌNH LUẬN ===== */
  const handlePostComment = async () => {
    if (!newComment.trim() || !id) return;
    try {
      await fetch(`${API}/binhluan/lesson`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          MaLesson: Number(id),
          MaNguoiDung: user.MaNguoiDung,
          NoiDung: newComment.trim(),
          MaBinhLuanCha: null,
        }),
      });
      setNewComment("");
      loadComments();
    } catch (err) { console.log(err); }
  };

  /* ===== TRẢ LỜI ===== */
  const handleReply = async (parentId: number) => {
    if (!replyText.trim() || !id) return;
    try {
      await fetch(`${API}/binhluan/lesson`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          MaLesson: Number(id),
          MaNguoiDung: user.MaNguoiDung,
          NoiDung: replyText.trim(),
          MaBinhLuanCha: parentId,
        }),
      });
      setReplyText("");
      setReplyTo(null);
      loadComments();
    } catch (err) { console.log(err); }
  };

  /* ===== XÓA BÌNH LUẬN ===== */
  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await fetch(`${API}/binhluan/${deleteId}`, { method: "DELETE" });
      setShowModal(false);
      setDeleteId(null);
      loadComments();
    } catch (err) { console.log(err); }
  };

  const rootComments = comments.filter(c => !c.MaBinhLuanCha);
  const getReplies   = (cid: number) => comments.filter(c => c.MaBinhLuanCha === cid);

  const initials = user.HoTen
    ? user.HoTen.split(" ").slice(-2).map((w: string) => w[0]).join("").toUpperCase()
    : "GV";

  if (!lesson) return <p style={{ padding: 20 }}>Đang tải...</p>;

  return (
    <div className="ldp-wrapper">

      {/* PAGE HEADER */}
      <div className="discussion-header">
        <div className="header-left">
          <h1>{lesson.TieuDe}</h1>
          <p>Loại: {lesson.LoaiBaiHoc} • Thời lượng: {lesson.ThoiLuong}</p>
        </div>
        <div className="header-right">
          <div className="back-btn" onClick={() => navigate(-1)}>← Quay lại</div>
        </div>
      </div>

      {/* INFO BÀI GIẢNG */}
      <div className="lesson-table">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Tên bài giảng</th>
              <th>Loại</th>
              <th>Thời lượng</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>{lesson.TieuDe}</td>
              <td>{lesson.LoaiBaiHoc}</td>
              <td>{lesson.ThoiLuong}</td>
              <td>
                <span className={`status ${lesson.TrangThai === "published" ? "published" : "draft"}`}>
                  {lesson.TrangThai === "published" ? "Đã xuất bản" : "Nháp"}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* DISCUSSION */}
      <div className="discussion-section">
        <h3>💬 Thảo luận bài giảng ({rootComments.length})</h3>

        {/* Ô nhập bình luận mới */}
        <div className="discussion-card">
          <div className="discussion-user">
            <strong>{initials}</strong>
            <span> {user.HoTen || "Giảng viên"}</span>
          </div>
          <div className="reply-box" style={{ marginTop: 8 }}>
            <input
              type="text"
              placeholder="Nhập bình luận..."
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handlePostComment()}
            />
            <button className="send-btn" onClick={handlePostComment}>➤</button>
          </div>
        </div>

        {/* Danh sách bình luận */}
        {rootComments.length === 0 ? (
          <p style={{ color: "#999", textAlign: "center", padding: 20 }}>
            Chưa có thảo luận nào.
          </p>
        ) : rootComments.map(c => (
          <div className="discussion-card" key={c.MaBinhLuan}>
            <div className="discussion-user">
              <strong>
                {c.VaiTro === "Giảng Viên" ? "👩‍🏫" : "👨‍🎓"} {c.HoTen}
              </strong>
              <span>
                {" "}
                {c.VaiTro === "Giảng Viên"
                  ? <span style={{ color: "#f97316", fontWeight: 600 }}>Giảng viên</span>
                  : "Sinh viên"
                }
                {" • "}
                {new Date(c.ThoiGian).toLocaleDateString("vi-VN")}
              </span>
            </div>

            <p style={{ margin: "8px 0", whiteSpace: "pre-line" }}>{c.NoiDung}</p>

            <div className="discussion-actions">
              👍
              <button
                className="reply-btn"
                onClick={() => setReplyTo(replyTo === c.MaBinhLuan ? null : c.MaBinhLuan)}
              >
                💬 Trả lời
              </button>
              {user.MaNguoiDung === c.MaNguoiDung && (
                <button
                  className="reply-btn"
                  style={{ color: "red", marginLeft: 8 }}
                  onClick={() => { setDeleteId(c.MaBinhLuan); setShowModal(true); }}
                >
                  🗑 Xóa
                </button>
              )}
            </div>

            {/* Ô trả lời */}
            {replyTo === c.MaBinhLuan && (
              <div className="reply-box" style={{ marginTop: 8 }}>
                <input
                  type="text"
                  placeholder="Nhập câu trả lời..."
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleReply(c.MaBinhLuan)}
                />
                <button className="send-btn" onClick={() => handleReply(c.MaBinhLuan)}>➤</button>
              </div>
            )}

            {/* Replies */}
            {getReplies(c.MaBinhLuan).length > 0 && (
              <div className="reply-list">
                {getReplies(c.MaBinhLuan).map(r => (
                  <div key={r.MaBinhLuan} className="reply-item">
                    <strong>
                      {r.VaiTro === "Giảng Viên" ? "👩‍🏫" : "👨‍🎓"} {r.HoTen}
                      {r.VaiTro === "Giảng Viên" && (
                        <span style={{ color: "#f97316", marginLeft: 6 }}>Giảng viên</span>
                      )}
                    </strong>
                    <span style={{ marginLeft: 8, color: "#999", fontSize: 12 }}>
                      {new Date(r.ThoiGian).toLocaleDateString("vi-VN")}
                    </span>
                    <p style={{ margin: "4px 0 0 0", whiteSpace: "pre-line" }}>{r.NoiDung}</p>
                    {user.MaNguoiDung === r.MaNguoiDung && (
                      <button
                        className="reply-btn"
                        style={{ color: "red", fontSize: 12 }}
                        onClick={() => { setDeleteId(r.MaBinhLuan); setShowModal(true); }}
                      >
                        🗑 Xóa
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* DELETE MODAL */}
      {showModal && (
        <div className="baigiang-modal-overlay">
          <div className="modal">
            <div className="modal-icon">!</div>
            <h3>Xác nhận Xóa</h3>
            <p>Bạn có chắc chắn muốn xóa bình luận này?</p>
            <button className="confirm-btn" onClick={confirmDelete}>Xác nhận</button>
            <button className="cancel-btn" onClick={() => { setShowModal(false); setDeleteId(null); }}>Không</button>
          </div>
        </div>
      )}

    </div>
  );
};

export default LessonDiscussionPage;