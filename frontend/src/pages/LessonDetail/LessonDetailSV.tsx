import "./LessonDetailSV.css";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API = "http://localhost:5000";

function LessonDetailSV() {
  const navigate = useNavigate();
  const { maLopHoc, maBuoiHoc } = useParams();
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");

  const [lessonInfo, setLessonInfo] = useState<any>(null);
  const [baiGiangs, setBaiGiangs]   = useState<any[]>([]);
  const [taiLieus, setTaiLieus]     = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [comments, setComments]     = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo]       = useState<number | null>(null);
  const [replyText, setReplyText]   = useState("");
  const [activeBaiHoc, setActiveBaiHoc] = useState<number | null>(null);
  const [showModal, setShowModal]   = useState(false);
  const [deleteId, setDeleteId]     = useState<number | null>(null);

  useEffect(() => {
    if (!maBuoiHoc) return;
    setLoading(true);
    Promise.all([
      fetch(`${API}/lesson/${maBuoiHoc}`).then(r => r.json()),
      fetch(`${API}/baigiang/${maBuoiHoc}?role=Sinh Viên`).then(r => r.json()),
      fetch(`${API}/tailieu/${maBuoiHoc}?role=Sinh Viên`).then(r => r.json()),
    ])
      .then(([lesson, baigiangData, tailieu]) => {
        setLessonInfo(lesson);
        const published = Array.isArray(baigiangData)
          ? baigiangData.filter((b: any) => b.TrangThai === "published")
          : [];
        setBaiGiangs(published);
        setTaiLieus(Array.isArray(tailieu) ? tailieu : []);
        if (published.length > 0) {
          setActiveBaiHoc(published[0].MaBaiHoc);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [maBuoiHoc]);

  const loadComments = () => {
    if (!maBuoiHoc) return;
    fetch(`${API}/binhluan/buoihoc/${maBuoiHoc}`)
      .then(r => r.json())
      .then(data => setComments(Array.isArray(data) ? data : []))
      .catch(() => {});
  };

  useEffect(() => {
    loadComments();
  }, [maBuoiHoc]);

  const initials = user.HoTen
    ? user.HoTen.split(" ").slice(-2).map((w: string) => w[0]).join("").toUpperCase()
    : "SV";

  const handlePostComment = async () => {
    if (!newComment.trim() || !maBuoiHoc) return;
    try {
      await fetch(`${API}/binhluan/buoihoc`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          MaBuoiHoc: Number(maBuoiHoc),
          MaNguoiDung: user.MaNguoiDung,
          NoiDung: newComment.trim(),
          MaBinhLuanCha: null
        })
      });
      setNewComment("");
      loadComments();
    } catch (err) { console.log(err); }
  };

  const handleReply = async (parentId: number) => {
    if (!replyText.trim() || !maBuoiHoc) return;
    try {
      await fetch(`${API}/binhluan/buoihoc`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          MaBuoiHoc: Number(maBuoiHoc),
          MaNguoiDung: user.MaNguoiDung,
          NoiDung: replyText.trim(),
          MaBinhLuanCha: parentId
        })
      });
      setReplyText("");
      setReplyTo(null);
      loadComments();
    } catch (err) { console.log(err); }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await fetch(`${API}/binhluan/${deleteId}`, { method: "DELETE" });
      setShowModal(false);
      setDeleteId(null);
      loadComments();
    } catch (err) { console.log(err); }
  };

  const typeIcon = (loai: string) => {
    if (loai === "Video") return "🎬";
    if (loai === "PDF") return "📄";
    return "📝";
  };

  const rootComments = comments.filter(c => !c.MaBinhLuanCha);
  const getReplies = (id: number) => comments.filter(c => c.MaBinhLuanCha === id);

  if (loading) return (
        <div className="ld2-content" style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "#999" }}>
          Đang tải...
        </div>
  );

  return (
    <>
        <div className="ld2-content">

          {/* Breadcrumb */}
          <nav className="ld2-breadcrumb">
            <span className="ld2-link" onClick={() => navigate(`/course-detail/${maLopHoc}`)}>
              Lớp học
            </span>
            <span>›</span>
            <span className="ld2-active">{lessonInfo?.TenBuoiHoc || "Bài học"}</span>
          </nav>

          {/* Lesson info */}
          <div className="ld2-lesson-info">
            <div className="ld2-lesson-icon">📖</div>
            <div>
              <p className="ld2-lesson-title">{lessonInfo?.TenBuoiHoc || "—"}</p>
              <p className="ld2-lesson-date">
                📅 {lessonInfo?.NgayBatDau
                  ? new Date(lessonInfo.NgayBatDau).toLocaleDateString("vi-VN")
                  : "—"}
                {lessonInfo?.MoTa && ` · ${lessonInfo.MoTa}`}
              </p>
            </div>
          </div>

          {/* Bảng bài giảng */}
          {baiGiangs.length > 0 ? (
            <div className="ld2-table-wrap">
              <table className="ld2-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Tên bài giảng</th>
                    <th>Loại</th>
                    <th>Thời lượng</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {baiGiangs.map((b, i) => (
                    <tr key={b.MaBaiHoc}>
                      <td>{i + 1}</td>
                      <td><strong>{b.TieuDe}</strong></td>
                      <td><span className="ld2-type-badge">{b.LoaiBaiHoc}</span></td>
                      <td>{b.ThoiLuong || "—"}</td>
                      <td>
                        <button
                          className="ld2-open-btn"
                          onClick={() => {
                            setActiveBaiHoc(b.MaBaiHoc);
                            navigate(`/bai-giangSV/${b.MaBaiHoc}`, {
                              state: { fromStudent: true, maLopHoc, maBuoiHoc }
                            });
                          }}
                        >
                          Xem
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ background: "#fff", borderRadius: 12, padding: 24, marginBottom: 20, color: "#999", textAlign: "center" }}>
              Chưa có bài giảng nào được xuất bản cho buổi học này.
            </div>
          )}

          {/* Video placeholder */}
          <div className="ld2-video-wrap">
            <div className="ld2-video-player">
              <div className="ld2-play-icon">▶</div>
              <p className="ld2-video-label">{lessonInfo?.TenBuoiHoc || "Bài học"}</p>
              <p className="ld2-video-sub">
                {baiGiangs.length > 0
                  ? "Chọn bài giảng từ danh sách bên trên để xem"
                  : "Chưa có bài giảng nào cho buổi học này"}
              </p>
            </div>

            <div className="ld2-video-sidebar">
              <p className="ld2-vs-title">📋 Nội dung bài học</p>
              <ul className="ld2-vs-list">
                {baiGiangs.length === 0 ? (
                  <li style={{ color: "#999" }}>Chưa có nội dung</li>
                ) : (
                  baiGiangs.map((b, i) => (
                    <li
                      key={b.MaBaiHoc}
                      className={activeBaiHoc === b.MaBaiHoc ? "active" : ""}
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        setActiveBaiHoc(b.MaBaiHoc);
                        navigate(`/bai-giang/${b.MaBaiHoc}`, {
                          state: { fromStudent: true, maLopHoc, maBuoiHoc }
                        });
                      }}
                    >
                      {typeIcon(b.LoaiBaiHoc)} {i + 1}. {b.TieuDe}
                    </li>
                  ))
                )}
              </ul>

              {taiLieus.length > 0 && (
                <div className="ld2-vs-resources">
                  <p className="ld2-vs-title">📎 Tài liệu đính kèm</p>
                  {taiLieus.map(t => (
                    <a
                      key={t.MaTaiLieu}
                      className="ld2-resource-link"
                      onClick={() => navigate(`/doc-detail/${t.MaTaiLieu}`)}
                      style={{ cursor: "pointer" }}
                    >
                      {"📄"} {t.TieuDe}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Comments */}
          <div className="ld2-comments-section">
            <h3 className="ld2-comments-title">
              💬 Thảo luận bài học ({rootComments.length})
            </h3>

            <div className="ld2-new-comment">
              <div className="ld2-avatar">{initials}</div>
              <div className="ld2-new-comment-right">
                <textarea
                  placeholder="Đặt câu hỏi hoặc chia sẻ ý kiến của bạn..."
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  rows={3}
                />
                <button className="ld2-post-btn" onClick={handlePostComment}>Gửi</button>
              </div>
            </div>

            <div className="ld2-comments-list">
              {rootComments.length === 0 ? (
                <p style={{ textAlign: "center", color: "#999", padding: 20 }}>
                  Chưa có thảo luận nào. Hãy là người đầu tiên đặt câu hỏi!
                </p>
              ) : rootComments.map(c => (
                <div className="ld2-comment" key={c.MaBinhLuan}>
                  <div className="ld2-comment-header">
                    <div className={`ld2-avatar ${c.VaiTro === "Giảng Viên" ? "teacher" : ""}`}>
                      {c.VaiTro === "Giảng Viên" ? "👩‍🏫" : c.HoTen?.[0] || "?"}
                    </div>
                    <div>
                      <span className="ld2-comment-author">{c.HoTen}</span>
                      {c.VaiTro === "Giảng Viên" && (
                        <span className="ld2-teacher-badge">Giảng viên</span>
                      )}
                      <span className="ld2-comment-time">
                        {" · "}{new Date(c.ThoiGian).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                  </div>

                  <p className="ld2-comment-body" style={{ whiteSpace: "pre-line" }}>{c.NoiDung}</p>

                  <div className="ld2-comment-actions">
                    <button onClick={() => setReplyTo(replyTo === c.MaBinhLuan ? null : c.MaBinhLuan)}>
                      💬 Trả lời
                    </button>
                    {/* Chỉ hiện nút Xóa với bình luận của chính mình */}
                    {user.MaNguoiDung === c.MaNguoiDung && (
                      <button
                        style={{ color: "red", marginLeft: 8, background: "none", border: "none", cursor: "pointer", fontSize: 13 }}
                        onClick={() => { setDeleteId(c.MaBinhLuan); setShowModal(true); }}
                      >
                        🗑 Xóa
                      </button>
                    )}
                  </div>

                  {replyTo === c.MaBinhLuan && (
                    <div className="ld2-reply-input">
                      <textarea
                        placeholder="Viết câu trả lời..."
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        rows={2}
                      />
                      <div className="ld2-reply-actions">
                        <button className="ld2-cancel-btn" onClick={() => setReplyTo(null)}>Hủy</button>
                        <button className="ld2-post-btn sm" onClick={() => handleReply(c.MaBinhLuan)}>Gửi</button>
                      </div>
                    </div>
                  )}

                  {getReplies(c.MaBinhLuan).length > 0 && (
                    <div className="ld2-replies">
                      {getReplies(c.MaBinhLuan).map(r => (
                        <div className="ld2-comment reply" key={r.MaBinhLuan}>
                          <div className="ld2-comment-header">
                            <div className={`ld2-avatar sm ${r.VaiTro === "Giảng Viên" ? "teacher" : ""}`}>
                              {r.VaiTro === "Giảng Viên" ? "👩‍🏫" : r.HoTen?.[0] || "?"}
                            </div>
                            <div>
                              <span className="ld2-comment-author">{r.HoTen}</span>
                              {r.VaiTro === "Giảng Viên" && (
                                <span className="ld2-teacher-badge">Giảng viên</span>
                              )}
                              <span className="ld2-comment-time">
                                {" · "}{new Date(r.ThoiGian).toLocaleDateString("vi-VN")}
                              </span>
                            </div>
                          </div>
                          <p className="ld2-comment-body" style={{ whiteSpace: "pre-line" }}>{r.NoiDung}</p>
                          {user.MaNguoiDung === r.MaNguoiDung && (
                            <button
                              style={{ color: "red", background: "none", border: "none", cursor: "pointer", fontSize: 12 }}
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
          </div>

        </div>

      {/* DELETE MODAL */}
      {showModal && (
        <div className="ld2-modal-overlay">
          <div className="ld2-modal">
            <div className="ld2-modal-icon">!</div>
            <h3>Xác nhận xóa</h3>
            <p>Bạn có chắc muốn xóa bình luận này?</p>
            <button className="ld2-confirm-btn" onClick={confirmDelete}>Xác nhận</button>
            <button className="ld2-cancel-btn" onClick={() => { setShowModal(false); setDeleteId(null); }}>Không</button>
          </div>
        </div>
      )}
      </>
  );
}

export default LessonDetailSV;