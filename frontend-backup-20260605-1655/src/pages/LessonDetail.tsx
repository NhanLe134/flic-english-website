import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./lessonDetail.css";

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

      <div className="back-btn" onClick={() => navigate(-1)}>← Quay lại</div>

      <h1 className="detail-title">{lesson.TieuDe}</h1>
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

      {fileUrl && !isImage && !isPdf && !isVideo && !isAudio && (
        <div className="file-download">
          <a href={fileUrl} target="_blank" rel="noreferrer">
            📄 Tải file đính kèm
          </a>
        </div>
      )}

    </div>
  );
};

export default LessonDetail;