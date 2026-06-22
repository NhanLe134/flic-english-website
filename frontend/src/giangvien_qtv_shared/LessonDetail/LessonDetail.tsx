import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FiArrowLeft, FiFileText } from "react-icons/fi";
import "./LessonDetail.css";

const LessonDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [lesson, setLesson] = useState<any>(null);

  const unescapeMarkdown = (str: string) => {
    let s = str
      .replace(/^#\s+(#{1,6}\s)/gm, "$1")
      .replace(/^#\s+(?!#)/gm, "")
      .replace(/^\\(#{1,6})/gm, "$1")
      .replace(/^\\-/gm, "-")
      .replace(/\\\|/g, "|")
      .replace(/\\>/g, ">")
      .replace(/\\\*/g, "*")
      .replace(/\\_/g, "_")
      .replace(/\\\./g, ".")
      .replace(/\\!/g, "!")
      .replace(/\n{3,}/g, "\n\n");

    const lines = s.split("\n");
    const out: string[] = [];

    const isListOrTable = (l: string) =>
      /^\s*[-*+] /.test(l) ||
      /^\s*\d+\./.test(l) ||
      /^\|/.test(l.trim());

    for (let i = 0; i < lines.length; i++) {
      const prev = out[out.length - 1] ?? "";
      const cur = lines[i];
      const next = lines[i + 1] ?? "";

      if (cur.trim() === "" && isListOrTable(prev) && isListOrTable(next)) {
        continue;
      }
      if (cur.trim() === "" && !isListOrTable(prev) && prev.trim() !== "" && isListOrTable(next)) {
        continue;
      }

      out.push(cur);
    }

    return out.join("\n");
  };

  useEffect(() => {
    if (!id) return;
    fetch(`http://localhost:5000/baigiang/detail/${id}`)
      .then(res => res.json())
      .then(data => setLesson(data))
      .catch(err => console.log(err));
  }, [id]);

  if (!lesson) return <p style={{ padding: 20 }}>Đang tải...</p>;

  const fileUrl = lesson.FileUrl || null;
  const noiDung = lesson.NoiDung || "";

  const isImage = fileUrl && /\.(png|jpg|jpeg|gif|webp)$/i.test(fileUrl);
  const isPdf   = fileUrl && /\.pdf$/i.test(fileUrl);
  const isVideo = fileUrl && /\.(mp4|webm|ogg)$/i.test(fileUrl);
  const isAudio = fileUrl && /\.(mp3|wav|m4a)$/i.test(fileUrl);

  const getYoutubeEmbedUrl = (url: string) => {
    if (!url) return "";
    let videoId = "";
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      videoId = match[2];
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  const getGoogleDriveEmbedUrl = (url: string) => {
    if (!url) return "";
    if (url.includes("drive.google.com")) {
      return url.replace(/\/view(\?.*)?$/, "/preview");
    }
    return url;
  };

  const isYoutube = fileUrl && (fileUrl.includes("youtube.com") || fileUrl.includes("youtu.be"));
  const isGoogleDrive = fileUrl && fileUrl.includes("drive.google.com");

  const markdownComponents = {
    ul: ({ children }: any) => (
      <ul style={{ paddingLeft: 24, margin: "4px 0" }}>{children}</ul>
    ),
    ol: ({ children }: any) => (
      <ol style={{ paddingLeft: 24, margin: "4px 0" }}>{children}</ol>
    ),
    li: ({ children }: any) => {
      const unwrapped = React.Children.map(children, (child: any) => {
        if (child?.type === "p") return child.props.children;
        return child;
      });
      return (
        <li style={{ margin: "2px 0", padding: 0, lineHeight: 1.6 }}>
          {unwrapped}
        </li>
      );
    },
    p: ({ children }: any) => (
      <p style={{ margin: "6px 0", padding: 0 }}>{children}</p>
    ),
  };

  return (
    <div className="ld-wrapper">

      <div className="back-btn" onClick={() => navigate(-1)}>
        <FiArrowLeft size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
        Quay lại
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: '8px' }}>
        <h1 className="detail-title" style={{ margin: 0 }}>{lesson.TieuDe}</h1>
        <span style={{
          background: lesson.TrangThai === 'published' ? '#e8f5e9' : lesson.TrangThai === 'pending' ? '#fff3e0' : '#ffebee',
          color: lesson.TrangThai === 'published' ? '#2e7d32' : lesson.TrangThai === 'pending' ? '#F95800' : '#c62828',
          padding: "3px 12px",
          borderRadius: 20,
          fontSize: 13,
          fontWeight: 600
        }}>
          {lesson.TrangThai === 'published' ? 'Đã duyệt' : lesson.TrangThai === 'pending' ? 'Chờ duyệt' : 'Từ chối'}
        </span>
      </div>
      <p style={{ color: "#777", marginBottom: 16 }}>
        {lesson.LoaiBaiHoc} • {lesson.ThoiLuong}
      </p>

      {noiDung && (
        <>
          {noiDung.trimStart().startsWith("<") ? (
            <div
              className="html-content"
              dangerouslySetInnerHTML={{ __html: noiDung }}
            />
          ) : (
            <div className="text-content">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={markdownComponents}
              >
                {unescapeMarkdown(noiDung)}
              </ReactMarkdown>
            </div>
          )}
        </>
      )}

      {isImage && (
        <div className="file-content">
          <img src={fileUrl!} alt="lesson" style={{ width: "100%", borderRadius: 12 }} />
        </div>
      )}

      {isPdf && (
        <div className="file-content">
          <iframe
            src={fileUrl!}
            width="100%"
            height="700px"
            title="PDF viewer"
            style={{ borderRadius: 12, border: "1px solid #e0d4c3" }}
          />
        </div>
      )}

      {isVideo && (
        <div className="file-content">
          <video controls width="100%" style={{ borderRadius: 12, maxWidth: "720px", display: "block", margin: "0 auto" }}>
            <source src={fileUrl!} />
            Trình duyệt không hỗ trợ video.
          </video>
        </div>
      )}

      {isAudio && (
        <div className="file-content">
          <audio controls style={{ width: "100%" }}>
            <source src={fileUrl!} />
            Trình duyệt không hỗ trợ audio.
          </audio>
        </div>
      )}

      {isYoutube && (
        <div className="file-content" style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden", borderRadius: 12, marginBottom: 20 }}>
          <iframe
            src={getYoutubeEmbedUrl(fileUrl)}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", borderRadius: 12, border: "none" }}
          />
        </div>
      )}

      {isGoogleDrive && (
        <div className="file-content" style={{ marginBottom: 20 }}>
          <iframe
            src={getGoogleDriveEmbedUrl(fileUrl)}
            width="100%"
            height="500px"
            title="Google Drive player"
            style={{ borderRadius: 12, border: "1px solid #e0d4c3" }}
            allow="autoplay"
          />
        </div>
      )}

      {fileUrl && !isImage && !isPdf && !isVideo && !isAudio && !isYoutube && !isGoogleDrive && (
        <div className="file-download">
          <a href={fileUrl} target="_blank" rel="noreferrer">
            <FiFileText size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Tải file đính kèm
          </a>
        </div>
      )}

    </div>
  );
};

export default LessonDetail;
