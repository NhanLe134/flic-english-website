import "./TaoBaiTap.css";
import { useNavigate, useParams, useSearchParams, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";

const API_BASE = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.startsWith("192.168.") || window.location.hostname.startsWith("10.") ? "http://" + window.location.hostname + ":5004" : "http://14.225.192.252:5004");

interface Question {
  question?: string;
  answers?: string[];
  correct?: string;
  explanation?: string;
  audioUrl?: string;
  imageUrl?: string;
  text?: string;
  prompt?: string;
  vocabPairs?: { word: string; meaning: string }[];
  fillInAnswers?: string[];
  sentences?: string[];
  level?: string;
  correctSentence?: string;
  subQuestions?: any[];
}

interface ExamSection {
  type: string;
  title: string;
  audioUrl?: string;
  imageUrl?: string;
  content?: string;
  vocab?: string;
  questions?: Question[];
}


/*
const mapDangBaiToType = (db: string): string => {
  if (db === "Nghe audio trắc nghiệm") return "Nghe audio trắc nghiệm";
  if (db === "Hình ảnh chọn đáp án") return "Hình ảnh chọn đáp án";
  if (db === "Nghe chép chính tả") return "Nghe chép chính tả";
  if (db === "Điền từ vào đoạn văn") return "Điền từ vào đoạn văn";
  if (db === "Luyện phát âm (check phát âm tự động)") return "Luyện phát âm (check phát âm tự động)";
  if (db === "Nói theo chủ đề (ghi âm nộp GV)") return "Nói theo chủ đề (ghi âm nộp GV)";
  if (db === "Trắc nghiệm đọc hiểu (chia đôi màn hình)") return "Trắc nghiệm đọc hiểu (chia đôi màn hình)";
  if (db === "Bài tập từ vựng" || db === "Nối từ") return "Nối từ";
  if (db === "Sắp xếp từ thành câu") return "Sắp xếp từ thành câu";
  if (db === "Tìm lỗi sai") return "Tìm lỗi sai";
  if (db === "Trắc nghiệm xác định thì" || db === "Trắc nghiệm") return "Trắc nghiệm";
  if (db === "Viết đoạn văn ngắn") return "Viết đoạn văn ngắn";
  if (db === "Sắp xếp câu thành đoạn văn") return "Sắp xếp câu thành đoạn văn";
  return "Tổng hợp";
};
*/

const cleanSectionTitle = (title: string) => {
  if (!title) return "";
  return title.replace(/^phần\s*\d+\s*[:\-.]?\s*/i, "").trim();
};

const stripHtml = (html: string) => {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
};

const RichTextarea = ({
  value,
  onChange,
  placeholder,
  className,
  style,
  rows
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  rows?: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      const normalizedValue = value || "";
      if (document.activeElement !== ref.current || normalizedValue === "") {
        if (ref.current.innerHTML !== normalizedValue) {
          ref.current.innerHTML = normalizedValue;
        }
      }
    }
  }, [value]);

  const handleInput = () => {
    if (ref.current) {
      let val = ref.current.innerHTML;
      if (val === "<br>" || val === "<br/>" || val === "<div><br></div>" || val === "<div><br/></div>") {
        val = "";
      }
      onChange(val);
    }
  };

  const calculatedMinHeight = rows ? `${rows * 20 + 20}px` : "60px";

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      className={`exercise-content rich-editable ${className || ""}`}
      style={{
        outline: "none",
        minHeight: calculatedMinHeight,
        whiteSpace: "pre-wrap",
        overflowWrap: "break-word",
        display: "block",
        ...style
      }}
      {...{ placeholder }}
      onInput={handleInput}
    />
  );
};

const getQuestionSummary = (q: any, type: string) => {
  let text = "";
  if (type === "Nghe audio trắc nghiệm") {
    text = q.prompt || (q.subQuestions?.[0]?.question);
  } else if (type === "Trắc nghiệm") {
    text = q.question;
  } else if (type === "Tìm lỗi sai") {
    text = q.question;
  } else if (type === "Nối từ") {
    const pairs = q.vocabPairs || [];
    if (pairs.length > 0) {
      text = pairs.map((p: any) => `${p.word || "?"}: ${p.meaning || "?"}`).join(", ");
    } else {
      text = "Chưa có cặp từ vựng";
    }
  } else if (type === "Hình ảnh chọn đáp án") {
    text = `[Hình ảnh & Audio - Đáp án: ${q.correct || "A"}]`;
  } else if (type === "Nghe chép chính tả") {
    text = q.text;
  } else if (type === "Điền từ vào đoạn văn") {
    text = q.text;
  } else if (type === "Luyện phát âm (check phát âm tự động)") {
    text = q.text;
  } else if (type === "Sắp xếp từ thành câu") {
    text = q.correctSentence || q.text;
  } else if (type === "Sắp xếp câu thành đoạn văn") {
    const sents = q.sentences || [];
    text = sents.filter((s: string) => s && s.trim() !== "").join(" / ");
  } else if (type === "Trắc nghiệm đọc hiểu (chia đôi màn hình)") {
    text = q.text || (q.subQuestions?.[0]?.question);
  } else if (type === "Nói theo chủ đề (ghi âm nộp GV)") {
    text = q.prompt;
  }
  
  if (!text || text.trim() === "") return "(Chưa nhập nội dung)";
  const cleanText = text.replace(/<[^>]*>/g, "");
  if (cleanText.length > 50) return cleanText.substring(0, 50) + "...";
  return cleanText;
};

const QuestionCard = ({ qIdx, sec, q, onRemove, isCollapsed, onToggle, children }: any) => {
  return (
    <div style={{ background: "#f8fafc", border: "1.5px solid #cbd5e1", borderRadius: 12, marginTop: 15, overflow: "hidden", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
      {/* Question Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#e2e8f0",
          padding: "10px 16px",
          cursor: "pointer",
          userSelect: "none"
        }}
        onClick={onToggle}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "12px", transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)", transition: "transform 0.1s ease", color: "#475569" }}>▼</span>
          <h5 style={{ color: "#000080", fontSize: 13, fontWeight: 700, margin: 0 }}>
            Câu hỏi {qIdx + 1}: <span style={{ color: "#475569", fontWeight: "normal", fontStyle: "italic", marginLeft: "4px" }}>{getQuestionSummary(q, sec.type)}</span>
          </h5>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }} onClick={e => e.stopPropagation()}>
          {sec.questions && sec.questions.length > 1 && (
            <button
              type="button"
              className="remove-btn"
              style={{ padding: "3px 8px", fontSize: 11, background: "#fee2e2", border: "1px solid #fecaca", color: "#ef4444", borderRadius: "4px", cursor: "pointer", margin: 0 }}
              onClick={onRemove}
            >
              Xóa
            </button>
          )}
        </div>
      </div>

      {!isCollapsed && (
        <div style={{ padding: 16 }}>
          {children}
        </div>
      )}
    </div>
  );
};

/*
const getSkillFromDangBai = (db: string): string => {
  if (["Nghe audio trắc nghiệm", "Hình ảnh chọn đáp án", "Nghe chép chính tả", "Điền từ vào đoạn văn"].includes(db)) return "Nghe";
  if (["Luyện phát âm (check phát âm tự động)", "Nói theo chủ đề (ghi âm nộp GV)"].includes(db)) return "Noi";
  if (["Trắc nghiệm đọc hiểu (chia đôi màn hình)", "Nối từ"].includes(db)) return "Doc";
  if (["Sắp xếp từ thành câu", "Trắc nghiệm", "Viết đoạn văn ngắn", "Sắp xếp câu thành đoạn văn"].includes(db)) return "Viet";
  return "Nghe";
};
*/

const TaoBaiTap = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isPractice = searchParams.get("isPractice") === "true";
  const isMiniTest = searchParams.get("isMiniTest") === "true";
  const maBaiHocParam = searchParams.get("maBaiHoc");
  const editDraftId = searchParams.get("editDraftId");
  const [sessionLectures, setSessionLectures] = useState<any[]>([]);
  const [selectedMaBaiHoc, setSelectedMaBaiHoc] = useState<number | "">(
    maBaiHocParam ? Number(maBaiHocParam) : ""
  );
  const [, setLecture] = useState<any>(null);

  const [lesson, setLesson] = useState<any>(null);
  const fromClassId = location.state?.fromClassId || lesson?.MaLopHoc;
  const fromCourseId = location.state?.fromCourseId;
  const userStr = sessionStorage.getItem("user") || localStorage.getItem("user");
  const user = JSON.parse(userStr || "{}");
  const vaiTroLower = (user.VaiTro || "").toLowerCase().trim();
  const isTeacher = vaiTroLower === "giảng viên";
  const isQTV = vaiTroLower === "quản trị nội dung" || vaiTroLower === "quản trị viên" || vaiTroLower === "admin" || window.location.pathname.toLowerCase().includes("/qtv");
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("Lưu kết quả thành công");
  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({ show: false, title: "", message: "" });
  const [title, setTitle] = useState("");
  const [titleError, setTitleError] = useState("");
  const [deadlineError, setDeadlineError] = useState("");
  const [type] = useState(isMiniTest ? "Trắc nghiệm" : "Nghe audio trắc nghiệm");
  
  const [kyNang] = useState(isMiniTest ? "Viet" : "Nghe");
  const [dangBai] = useState(isMiniTest ? "Trắc nghiệm" : "Nghe audio trắc nghiệm");
  const [isFree, setIsFree] = useState(false);
  const [isExam, setIsExam] = useState(false);
  const [deadline, setDeadline] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [draftMaBuoiHoc, setDraftMaBuoiHoc] = useState<number | null>(null);

  // States for Exam Builder
  const [examDuration, setExamDuration] = useState(50);
  const [examStartTime, setExamStartTime] = useState("");
  const [openingMode, setOpeningMode] = useState<"scheduled" | "manual">("scheduled");
  const [commonAudioUrl, setCommonAudioUrl] = useState("");
  const [examSections, setExamSections] = useState<ExamSection[]>([
    {
      type: "Nghe audio trắc nghiệm",
      title: "Phần 1: Nghe trắc nghiệm",
      audioUrl: "",
      questions: [{ question: "", answers: ["", "", "", ""], correct: "A", explanation: "" }]
    }
  ]);

  // States for Accordion collapses
  const [collapsedSections, setCollapsedSections] = useState<Record<number, boolean>>({});
  const [collapsedQuestions, setCollapsedQuestions] = useState<Record<string, boolean>>({});

  const toggleSectionCollapse = (secIdx: number) => {
    setCollapsedSections(prev => ({ ...prev, [secIdx]: !prev[secIdx] }));
  };

  const toggleQuestionCollapse = (secIdx: number, qIdx: number) => {
    const key = `${secIdx}_${qIdx}`;
    setCollapsedQuestions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const collapseAllSections = () => {
    const collapsed: Record<number, boolean> = {};
    examSections.forEach((_, idx) => {
      collapsed[idx] = true;
    });
    setCollapsedSections(collapsed);
  };

  const expandAllSections = () => {
    setCollapsedSections({});
  };



  // Unified state for multiple questions in regular exercises
  const [questions, setQuestions] = useState<any[]>([
    {
      question: "",
      answers: ["", "", "", ""],
      correct: "A",
      explanation: "",
      audioUrl: "",
      imageUrl: "",
      text: "",
      prompt: "",
      vocabPairs: [{ word: "", meaning: "" }],
      fillInAnswers: [],
      sentences: ["", "", "", "", "", ""],
      subQuestions: [{ question: "", answers: ["", "", "", ""], correct: "A", explanation: "" }]
    }
  ]);

  // Formatter states & handlers
  const [activeEl, setActiveEl] = useState<HTMLElement | null>(null);
  const [toolbarCoords, setToolbarCoords] = useState<{ top: number; left: number } | null>(null);

  const applyFormat = (type: "b" | "i" | "u", targetEl?: HTMLElement) => {
    const el = targetEl || activeEl;
    if (!el) return;

    if (el.contentEditable === "true" || el.getAttribute("contenteditable") === "true") {
      el.focus();
      const cmdMap = {
        b: "bold",
        i: "italic",
        u: "underline"
      };
      document.execCommand(cmdMap[type], false);
      el.dispatchEvent(new Event("input", { bubbles: true }));
      return;
    }

    // Fallback for standard input/textarea
    const textEl = el as HTMLInputElement | HTMLTextAreaElement;
    const start = textEl.selectionStart ?? 0;
    const end = textEl.selectionEnd ?? 0;
    const val = textEl.value;
    const selectedText = val.substring(start, end);

    const tagMap = {
      b: { open: "<b>", close: "</b>" },
      i: { open: "<i>", close: "</i>" },
      u: { open: "<u>", close: "</u>" }
    };

    const { open, close } = tagMap[type];
    let newText;
    if (selectedText.startsWith(open) && selectedText.endsWith(close)) {
      newText = selectedText.slice(open.length, -close.length);
    } else {
      newText = open + selectedText + close;
    }

    const newValue = val.substring(0, start) + newText + val.substring(end);

    const prototype = textEl.tagName === "INPUT" ? window.HTMLInputElement.prototype : window.HTMLTextAreaElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;
    if (setter) {
      setter.call(textEl, newValue);
      textEl.dispatchEvent(new Event("input", { bubbles: true }));

      // Restore selection
      setTimeout(() => {
        textEl.focus();
        textEl.setSelectionRange(start, start + newText.length);
      }, 0);
    }
  };

  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.contentEditable === "true" || target.getAttribute("contenteditable") === "true") &&
        (target as HTMLInputElement).type !== "checkbox" &&
        (target as HTMLInputElement).type !== "radio" &&
        (target as HTMLInputElement).type !== "file" &&
        (target as HTMLInputElement).type !== "date" &&
        (target as HTMLInputElement).type !== "datetime-local" &&
        (target as HTMLInputElement).type !== "number"
      ) {
        setActiveEl(target);
      }
    };

    const handleFocusOut = () => {
      setTimeout(() => {
        const active = document.activeElement as HTMLElement;
        if (
          !active ||
          (active.tagName !== "INPUT" && active.tagName !== "TEXTAREA" && active.contentEditable !== "true" && active.getAttribute("contenteditable") !== "true")
        ) {
          setActiveEl(null);
        }
      }, 200); // 200ms is safe for mouse clicks on formatting buttons
    };

    window.addEventListener("focusin", handleFocusIn);
    window.addEventListener("focusout", handleFocusOut);
    return () => {
      window.removeEventListener("focusin", handleFocusIn);
      window.removeEventListener("focusout", handleFocusOut);
    };
  }, []);

  const updateToolbarPosition = () => {
    if (!activeEl) return;
    const rect = activeEl.getBoundingClientRect();
    setToolbarCoords({
      top: rect.top + window.scrollY - 8,
      left: rect.left + window.scrollX + rect.width / 2
    });
  };

  useEffect(() => {
    if (activeEl) {
      updateToolbarPosition();
      window.addEventListener("resize", updateToolbarPosition);
      window.addEventListener("scroll", updateToolbarPosition, true);
      return () => {
        window.removeEventListener("resize", updateToolbarPosition);
        window.removeEventListener("scroll", updateToolbarPosition, true);
      };
    }
  }, [activeEl]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && ["b", "i", "u"].includes(e.key.toLowerCase())) {
        const el = document.activeElement as HTMLElement;
        if (
          el &&
          (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.contentEditable === "true" || el.getAttribute("contenteditable") === "true") &&
          (el as HTMLInputElement).type !== "checkbox" &&
          (el as HTMLInputElement).type !== "radio" &&
          (el as HTMLInputElement).type !== "file" &&
          (el as HTMLInputElement).type !== "date" &&
          (el as HTMLInputElement).type !== "datetime-local" &&
          (el as HTMLInputElement).type !== "number"
        ) {
          if (el.contentEditable === "true" || el.getAttribute("contenteditable") === "true") {
            setTimeout(() => {
              el.dispatchEvent(new Event("input", { bubbles: true }));
            }, 0);
          } else {
            e.preventDefault();
            applyFormat(e.key.toLowerCase() as "b" | "i" | "u", el);
          }
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeEl]);

  const renderFormattingToolbar = () => {
    if (!activeEl || !toolbarCoords) return null;

    return createPortal(
      <div
        className="formatting-toolbar"
        style={{
          top: toolbarCoords.top,
          left: toolbarCoords.left
        }}
      >
        <button
          type="button"
          className="formatting-btn bold"
          onMouseDown={(e) => {
            e.preventDefault();
            applyFormat("b");
          }}
          title="Bôi đậm (Ctrl+B)"
        >
          B
        </button>
        <button
          type="button"
          className="formatting-btn italic"
          onMouseDown={(e) => {
            e.preventDefault();
            applyFormat("i");
          }}
          title="In nghiêng (Ctrl+I)"
        >
          I
        </button>
        <button
          type="button"
          className="formatting-btn underline"
          onMouseDown={(e) => {
            e.preventDefault();
            applyFormat("u");
          }}
          title="Gạch chân (Ctrl+U)"
        >
          U
        </button>
      </div>,
      document.body
    );
  };

  useEffect(() => {
    if (!maBaiHocParam) return;
    fetch(`${API_BASE}/baigiang/detail/${maBaiHocParam}`)
      .then(res => res.json())
      .then(data => {
        setLecture(data);
        if (isMiniTest && data?.TieuDe) {
          setTitle(`MiniTest: ${data.TieuDe}`);
        }
      })
      .catch(err => console.log("Lỗi tải thông tin bài giảng:", err));

    if (isMiniTest) {
      fetch(`${API_BASE}/minitest/baigiang/${maBaiHocParam}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.CauHoi) {
            try {
              const parsed = JSON.parse(data.CauHoi);
              if (Array.isArray(parsed) && parsed.length > 0) {
                setQuestions(parsed);
              }
            } catch (e) {
              console.error("Lỗi parse câu hỏi MiniTest cũ:", e);
            }
          }
        })
        .catch(err => console.error("Lỗi tải MiniTest cũ:", err));
    }
  }, [maBaiHocParam, isMiniTest]);

  /* ===== LOAD LESSON ===== */
  useEffect(() => {
    if (!id) return;
    fetch(`${API_BASE}/buoihoc/${id}`)
      .then(res => res.json())
      .then(data => setLesson(Array.isArray(data) ? data[0] : data))
      .catch(err => console.log(err));
  }, [id]);

  /* ===== LOAD SESSION LECTURES ===== */
  useEffect(() => {
    if (!id) return;
    fetch(`${API_BASE}/baigiang/${id}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const published = data.filter((bg: any) => bg.TrangThai === "published" || bg.TrangThai === "Đã duyệt");
          setSessionLectures(published);
          if (!selectedMaBaiHoc && !maBaiHocParam && published.length > 0) {
            setSelectedMaBaiHoc(published[0].MaBaiHoc);
          }
        }
      })
      .catch(err => console.error("Lỗi tải danh sách bài giảng:", err));
  }, [id, maBaiHocParam]);

  useEffect(() => {
    // Tự động điều chỉnh chiều cao của toàn bộ textarea tự co giãn
    const textareas = document.querySelectorAll(".auto-resize-textarea");
    textareas.forEach((ta: any) => {
      ta.style.height = "auto";
      ta.style.height = ta.scrollHeight + "px";
    });
  }, [questions, examSections]);

  const [activeTab, setActiveTab] = useState<"create" | "reuse">("create");
  const [allExistingEx, setAllExistingEx] = useState<any[]>([]);
  const [reuseSearch, setReuseSearch] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Fetch all existing exercises for cloning
    const userStr = sessionStorage.getItem("user") || localStorage.getItem("user");
    let url = API_BASE + "/exercises/list/all";
    if (userStr) {
      const user = JSON.parse(userStr);
      if ((user.VaiTro || "").toLowerCase().trim() === "giảng viên" && user.MaNguoiDung) {
        url += `?maNguoiDung=${user.MaNguoiDung}`;
      }
    }
    fetch(url)
      .then(res => res.json())
      .then(data => setAllExistingEx(data))
      .catch(err => console.log(err));
  }, []);

  useEffect(() => {
    if (!editDraftId) return;
    fetch(`${API_BASE}/baitap/${editDraftId}`)
      .then(res => res.json())
      .then(data => {
        if (data) {
          setTitle(data.Title || data.TieuDe || "");
          setIsFree(data.IsFree === 1);
          setIsExam(data.IsExam === 1 || data.Type === "exam");
          if (data.Deadline) {
            setDeadline(data.Deadline.split(".")[0]);
          }
          setShowAnswer(data.ShowAnswer === 1);
          if (data.MaBaiHoc) {
            setSelectedMaBaiHoc(Number(data.MaBaiHoc));
          }
          if (data.MaBuoiHoc) {
            const buoiHocId = Number(data.MaBuoiHoc);
            setDraftMaBuoiHoc(buoiHocId);
            
            // Load lesson details
            fetch(`${API_BASE}/buoihoc/${buoiHocId}`)
              .then(res => res.json())
              .then(lessonData => setLesson(Array.isArray(lessonData) ? lessonData[0] : lessonData))
              .catch(err => console.error("Lỗi tải thông tin buổi học bản nháp:", err));

            // Load session lectures
            fetch(`${API_BASE}/baigiang/${buoiHocId}`)
              .then(res => res.json())
              .then(lecturesData => {
                if (Array.isArray(lecturesData)) {
                  const published = lecturesData.filter((bg: any) => bg.TrangThai === "published");
                  setSessionLectures(published);
                  if (!selectedMaBaiHoc && published.length > 0) {
                    setSelectedMaBaiHoc(published[0].MaBaiHoc);
                  }
                }
              })
              .catch(err => console.error("Lỗi tải danh sách bài giảng bản nháp:", err));
          }
          if (data.Content) {
            try {
              const parsed = JSON.parse(data.Content);
              if (parsed.examDuration) setExamDuration(parsed.examDuration);
              if (parsed.examStartTime) setExamStartTime(parsed.examStartTime.split(".")[0]);
              if (parsed.openingMode) setOpeningMode(parsed.openingMode);
              if (parsed.sections) {
                setExamSections(parsed.sections);
              }
            } catch (e) {
              console.error("Lỗi parse Content bản nháp:", e);
            }
          }
        }
      })
      .catch(err => console.error("Lỗi fetch chi tiết bản nháp:", err));
  }, [editDraftId]);

  const handleReuseExercise = async (exerciseId: number) => {
    if (!selectedMaBaiHoc) {
      alert("Vui lòng chọn bài giảng để gắn với bài tập này!");
      return;
    }
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const userStr = sessionStorage.getItem("user") || localStorage.getItem("user");
      let clonerMaNguoiDung = null;
      if (userStr) {
        const user = JSON.parse(userStr);
        clonerMaNguoiDung = user.MaNguoiDung || null;
      }
      const res = await fetch(`${API_BASE}/exercises/${exerciseId}/clone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          MaBuoiHoc: Number(id),
          MaBaiHoc: Number(selectedMaBaiHoc),
          MaNguoiDung: clonerMaNguoiDung
        })
      });
      if (res.ok) {
        alert("Chọn bài tập thành công!");
        const isQTVPath = location.pathname.startsWith("/QTV");
        if (isQTVPath) {
          if (location.state?.fromPage === "kho-hoc-lieu") {
            setTimeout(() => navigate("/QTV/kho-hoc-lieu"), 1500);
          } else {
            setTimeout(() => navigate("/QTV/khoahoc"), 1500);
          }
        } else {
          setTimeout(() => navigate(`/bai-tap/${id}`), 1500);
        }
      } else {
        const txt = await res.text();
        alert("Không thể dùng lại bài tập: " + txt);
      }
    } catch (err) {
      alert("Lỗi kết nối: " + err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileScan = async (e: React.ChangeEvent<HTMLInputElement>, secIdx?: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      let text = "";
      if (file.name.endsWith(".docx")) {
        const arrayBuffer = await file.arrayBuffer();
        const mammothModule = await import("mammoth");
        const extractRawText = mammothModule.extractRawText || mammothModule.default?.extractRawText;
        if (!extractRawText) {
          throw new Error("Mammoth library did not export extractRawText");
        }
        const result = await extractRawText({ arrayBuffer });
        text = result.value;
      } else {
        text = await file.text();
      }

      processScannedText(text, secIdx);
    } catch (err) {
      alert("Lỗi khi đọc file: " + err);
    }
  };

  const processScannedText = (text: string, secIdx?: number) => {
    if (!text.trim()) {
      alert("File trống hoặc không đọc được nội dung.");
      return;
    }

    const targetType = secIdx !== undefined ? examSections[secIdx].type : type;

    // 1. Dạng Đọc hiểu chia đôi màn hình (reading-split)
    if (targetType === "Trắc nghiệm đọc hiểu (chia đôi màn hình)") {
      const parsedPassages: any[] = [];
      const rawBlocks = text.split(/\[(?:Bài đọc|Reading|Passage)\]/i).map(b => b.trim()).filter(Boolean);

      if (rawBlocks.length > 0 && (text.toLowerCase().includes("[bài đọc]") || text.toLowerCase().includes("[reading]") || text.toLowerCase().includes("[passage]"))) {
        for (const block of rawBlocks) {
          let passage = "";
          let questionsText = block;

          const qMatch = block.match(/^([\s\S]*?)\[(?:Câu hỏi|Questions)\]\s*([\s\S]*)/i);
          if (qMatch) {
            passage = qMatch[1].trim();
            questionsText = qMatch[2].trim();
          } else {
            const qBoundary = /(?=Câu\s*\d+|Question\s*\d+|\b\d+\s*[\.\:\)])/i;
            const parts = block.split(qBoundary);
            if (parts.length > 0) {
              passage = parts[0].trim();
              questionsText = parts.slice(1).join("\n\n");
            }
          }

          const subQuestions: any[] = [];
          const qBoundary = /(?=Câu\s*\d+|Question\s*\d+|\b\d+\s*[\.\:\)])/i;
          const qBlocks = questionsText.split(qBoundary).map(b => b.trim()).filter(Boolean);

          for (const qBlock of qBlocks) {
            const lines = qBlock.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
            if (lines.length < 2) continue;

            let questionText = "";
            let answers = ["", "", "", ""];
            let correct = "A";

            for (let line of lines) {
              if (/^[A]\s*[\.\:\)]\s*(.*)/i.test(line)) {
                answers[0] = line.match(/^[A]\s*[\.\:\)]\s*(.*)/i)![1].trim();
              } else if (/^[B]\s*[\.\:\)]\s*(.*)/i.test(line)) {
                answers[1] = line.match(/^[B]\s*[\.\:\)]\s*(.*)/i)![1].trim();
              } else if (/^[C]\s*[\.\:\)]\s*(.*)/i.test(line)) {
                answers[2] = line.match(/^[C]\s*[\.\:\)]\s*(.*)/i)![1].trim();
              } else if (/^[D]\s*[\.\:\)]\s*(.*)/i.test(line)) {
                answers[3] = line.match(/^[D]\s*[\.\:\)]\s*(.*)/i)![1].trim();
              } else if (/^(Đáp án đúng|Correct|Key|Đáp án|Chọn)\s*[\.\:\-]?\s*([A-D])/i.test(line)) {
                correct = line.match(/^(Đáp án đúng|Correct|Key|Đáp án|Chọn)\s*[\.\:\-]?\s*([A-D])/i)![2].toUpperCase();
              } else {
                if (answers.every(a => !a)) {
                  if (questionText) questionText += "\n";
                  questionText += line;
                }
              }
            }

            questionText = questionText.replace(/^(Câu\s*\d+\s*[\.\:\-]?\s*|Question\s*\d+\s*[\.\:\-]?\s*|\d+\s*[\.\:\)]\s*)/i, "").trim();
            subQuestions.push({ question: questionText, answers, correct });
          }

          if (subQuestions.length > 0) {
            parsedPassages.push({ passage, subQuestions });
          }
        }
      } else {
        let passage = "";
        let questionsText = text;

        const qMatch = text.match(/^([\s\S]*?)\[(?:Câu hỏi|Questions)\]\s*([\s\S]*)/i);
        if (qMatch) {
          passage = qMatch[1].trim();
          questionsText = qMatch[2].trim();
        } else {
          const qBoundary = /(?=Câu\s*\d+|Question\s*\d+|\b\d+\s*[\.\:\)])/i;
          const parts = text.split(qBoundary);
          if (parts.length > 0) {
            passage = parts[0].trim();
            questionsText = parts.slice(1).join("\n\n");
          }
        }

        // Clean up [Bài đọc] or [Reading] or [Passage] from the beginning of passage
        passage = passage.replace(/^\[(?:Bài đọc|Reading|Passage)\]\s*/i, "").trim();

        const subQuestions: any[] = [];
        const qBoundary = /(?=Câu\s*\d+|Question\s*\d+|\b\d+\s*[\.\:\)])/i;
        const qBlocks = questionsText.split(qBoundary).map(b => b.trim()).filter(Boolean);

        for (const qBlock of qBlocks) {
          const lines = qBlock.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
          if (lines.length < 2) continue;

          let questionText = "";
          let answers = ["", "", "", ""];
          let correct = "A";

          for (let line of lines) {
            if (/^[A]\s*[\.\:\)]\s*(.*)/i.test(line)) {
              answers[0] = line.match(/^[A]\s*[\.\:\)]\s*(.*)/i)![1].trim();
            } else if (/^[B]\s*[\.\:\)]\s*(.*)/i.test(line)) {
              answers[1] = line.match(/^[B]\s*[\.\:\)]\s*(.*)/i)![1].trim();
            } else if (/^[C]\s*[\.\:\)]\s*(.*)/i.test(line)) {
              answers[2] = line.match(/^[C]\s*[\.\:\)]\s*(.*)/i)![1].trim();
            } else if (/^[D]\s*[\.\:\)]\s*(.*)/i.test(line)) {
              answers[3] = line.match(/^[D]\s*[\.\:\)]\s*(.*)/i)![1].trim();
            } else if (/^(Đáp án đúng|Correct|Key|Đáp án|Chọn)\s*[\.\:\-]?\s*([A-D])/i.test(line)) {
              correct = line.match(/^(Đáp án đúng|Correct|Key|Đáp án|Chọn)\s*[\.\:\-]?\s*([A-D])/i)![2].toUpperCase();
            } else {
              if (answers.every(a => !a)) {
                if (questionText) questionText += "\n";
                questionText += line;
              }
            }
          }

          questionText = questionText.replace(/^(Câu\s*\d+\s*[\.\:\-]?\s*|Question\s*\d+\s*[\.\:\-]?\s*|\d+\s*[\.\:\)]\s*)/i, "").trim();
          subQuestions.push({ question: questionText, answers, correct });
        }

        if (subQuestions.length > 0) {
          parsedPassages.push({ passage, subQuestions });
        }
      }

      if (parsedPassages.length > 0) {
        const formattedQuestions = parsedPassages.map(p => ({
          question: "",
          answers: ["", "", "", ""],
          correct: "A",
          explanation: "",
          audioUrl: "",
          imageUrl: "",
          text: p.passage,
          prompt: "",
          vocabPairs: [{ word: "", meaning: "" }],
          fillInAnswers: [],
          sentences: [""],
          subQuestions: p.subQuestions.map((sq: any) => ({
            question: sq.question,
            answers: sq.answers,
            correct: sq.correct,
            explanation: ""
          }))
        }));

        if (secIdx !== undefined) {
          const copy = [...examSections];
          copy[secIdx].questions = formattedQuestions;
          setExamSections(copy);
          alert(`Đã quét và điền thành công phần thi Đọc hiểu (Phần ${secIdx + 1}) với ${parsedPassages.length} bài đọc và tổng cộng ${parsedPassages.reduce((acc, p) => acc + p.subQuestions.length, 0)} câu hỏi!`);
        } else {
          setQuestions(formattedQuestions);
          alert(`Đã quét thành công ${parsedPassages.length} bài đọc và tổng cộng ${parsedPassages.reduce((acc, p) => acc + p.subQuestions.length, 0)} câu hỏi!`);
        }
      } else {
        alert("Không tìm thấy câu hỏi hoặc bài đọc nào hợp lệ trong file.");
      }
      return;
    }

    // 2. Dạng trắc nghiệm nhóm/ngữ cảnh (multiple, listening-mcq)
    if (targetType === "Tổng hợp" || targetType === "Nghe audio trắc nghiệm") {
      const groupBoundary = /(?=\[(?:Nhóm|Group|Ngữ cảnh|Context|Dialogue|Đoạn hội thoại|Audio|Passage|Bài đọc)\s*\d*\]|^(?:Nhóm|Group|Ngữ cảnh|Context|Dialogue|Đoạn hội thoại|Audio|Passage|Bài đọc)\s*\d*\s*[\.\:\-])/im;
      const groupBlocks = text.split(groupBoundary).map(g => g.trim()).filter(Boolean);
      const parsedGroups: any[] = [];

      for (const groupBlock of groupBlocks) {
        const firstQIdx = groupBlock.search(/(?:Câu\s*\d+|Question\s*\d+|\b\d+\s*[\.\:\)])/i);
        let groupPrompt = "";
        let questionsText = groupBlock;

        if (firstQIdx !== -1) {
          groupPrompt = groupBlock.substring(0, firstQIdx).trim();
          questionsText = groupBlock.substring(firstQIdx).trim();
        } else {
          groupPrompt = groupBlock.trim();
          questionsText = "";
        }

        // Clean group markers from prompt for clean display
        groupPrompt = groupPrompt
          .replace(/^\[(?:Nhóm|Group|Ngữ cảnh|Context|Dialogue|Đoạn hội thoại|Audio|Passage|Bài đọc)\s*\d*\]\s*/i, "")
          .replace(/^(?:Nhóm|Group|Ngữ cảnh|Context|Dialogue|Đoạn hội thoại|Audio|Passage|Bài đọc|Prompt)\s*\d*\s*[\.\:\-]\s*/im, "")
          .trim();

        const qBoundary = /(?=Câu\s*\d+|Question\s*\d+|\b\d+\s*[\.\:\)])/i;
        const qBlocks = questionsText.split(qBoundary).map(b => b.trim()).filter(Boolean);
        const subQuestions: any[] = [];

        for (const block of qBlocks) {
          const lines = block.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
          if (lines.length < 2) continue;

          let questionText = "";
          let answers = ["", "", "", ""];
          let correct = "A";
          let explanation = "";

          for (let line of lines) {
            if (/^[A]\s*[\.\:\)]\s*(.*)/i.test(line)) {
              answers[0] = line.match(/^[A]\s*[\.\:\)]\s*(.*)/i)![1].trim();
            } else if (/^[B]\s*[\.\:\)]\s*(.*)/i.test(line)) {
              answers[1] = line.match(/^[B]\s*[\.\:\)]\s*(.*)/i)![1].trim();
            } else if (/^[C]\s*[\.\:\)]\s*(.*)/i.test(line)) {
              answers[2] = line.match(/^[C]\s*[\.\:\)]\s*(.*)/i)![1].trim();
            } else if (/^[D]\s*[\.\:\)]\s*(.*)/i.test(line)) {
              answers[3] = line.match(/^[D]\s*[\.\:\)]\s*(.*)/i)![1].trim();
            } else if (/^(Đáp án đúng|Correct|Key|Đáp án|Chọn)\s*[\.\:\-]?\s*([A-D])/i.test(line)) {
              correct = line.match(/^(Đáp án đúng|Correct|Key|Đáp án|Chọn)\s*[\.\:\-]?\s*([A-D])/i)![2].toUpperCase();
            } else if (/^(Giải thích|Explanation)\s*[\.\:\-]?\s*(.*)/i.test(line)) {
              explanation = line.match(/^(Giải thích|Explanation)\s*[\.\:\-]?\s*(.*)/i)![2].trim();
            } else {
              if (answers.every(a => !a)) {
                if (questionText) questionText += "\n";
                questionText += line;
              } else {
                if (explanation) {
                  explanation += "\n" + line;
                }
              }
            }
          }

          questionText = questionText.replace(/^(Câu\s*\d+\s*[\.\:\-]?\s*|Question\s*\d+\s*[\.\:\-]?\s*|\d+\s*[\.\:\)]\s*)/i, "").trim();
          subQuestions.push({
            question: questionText,
            answers,
            correct,
            explanation
          });
        }

        if (subQuestions.length > 0) {
          parsedGroups.push({
            prompt: groupPrompt,
            subQuestions
          });
        }
      }

      if (parsedGroups.length > 0) {
        const formattedQuestions = parsedGroups.map(pg => ({
          question: "",
          answers: ["", "", "", ""],
          correct: "A",
          explanation: "",
          audioUrl: "",
          imageUrl: "",
          text: "",
          prompt: pg.prompt,
          vocabPairs: [{ word: "", meaning: "" }],
          fillInAnswers: [],
          sentences: [""],
          subQuestions: pg.subQuestions
        }));

        if (secIdx !== undefined) {
          const copy = [...examSections];
          copy[secIdx].questions = formattedQuestions;
          setExamSections(copy);
          alert(`Đã quét và điền thành công Phần ${secIdx + 1} với ${parsedGroups.reduce((acc, g) => acc + g.subQuestions.length, 0)} câu hỏi trắc nghiệm chia thành ${parsedGroups.length} nhóm!`);
        } else {
          setQuestions(formattedQuestions);
          alert(`Đã quét thành công ${parsedGroups.reduce((acc, g) => acc + g.subQuestions.length, 0)} câu hỏi trắc nghiệm chia thành ${parsedGroups.length} nhóm!`);
        }
      } else {
        alert("Không thể phân tích câu hỏi nhóm nào. Vui lòng kiểm tra lại định dạng file.");
      }
      return;
    }

    // Dạng Tìm lỗi sai (writing-find-mistakes)
    if (targetType === "Tìm lỗi sai") {
      const qBoundary = /(?=Câu\s*\d+|Question\s*\d+|\b\d+\s*[\.\:\)])/i;
      const qBlocks = text.split(qBoundary).map(b => b.trim()).filter(Boolean);
      const parsed: any[] = [];

      for (const block of qBlocks) {
        const lines = block.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        if (lines.length < 2) continue;

        let questionText = "";
        let incorrectSegment = "";
        let correctSeg = "";
        let explanation = "";

        for (let line of lines) {
          if (/^(Từ sai|Lỗi sai|Incorrect|Wrong)\s*[\.\:\-]?\s*(.*)/i.test(line)) {
            incorrectSegment = line.match(/^(Từ sai|Lỗi sai|Incorrect|Wrong)\s*[\.\:\-]?\s*(.*)/i)![2].trim();
          } else if (/^(Sửa lại|Corrected|Right|Correct)\s*[\.\:\-]?\s*(.*)/i.test(line)) {
            correctSeg = line.match(/^(Sửa lại|Corrected|Right|Correct)\s*[\.\:\-]?\s*(.*)/i)![2].trim();
          } else if (/^(Giải thích|Explanation)\s*[\.\:\-]?\s*(.*)/i.test(line)) {
            explanation = line.match(/^(Giải thích|Explanation)\s*[\.\:\-]?\s*(.*)/i)![2].trim();
          } else {
            if (!incorrectSegment && !correctSeg && !explanation) {
              if (questionText) questionText += "\n";
              questionText += line;
            } else {
              if (explanation) {
                explanation += "\n" + line;
              }
            }
          }
        }

        questionText = questionText.replace(/^(Câu\s*\d+\s*[\.\:\-]?\s*|Question\s*\d+\s*[\.\:\-]?\s*|\d+\s*[\.\:\)]\s*)/i, "").trim();
        const segments = questionText.split("  ").map((s: string) => s.trim()).filter(Boolean);

        parsed.push({
          question: questionText,
          answers: segments,
          correct: incorrectSegment,
          correctSentence: correctSeg,
          explanation: explanation,
          audioUrl: "",
          imageUrl: "",
          text: "",
          prompt: "",
          vocabPairs: [{ word: "", meaning: "" }],
          fillInAnswers: [],
          sentences: [""]
        });
      }

      if (parsed.length > 0) {
        if (secIdx !== undefined) {
          const copy = [...examSections];
          copy[secIdx].questions = parsed;
          setExamSections(copy);
          alert(`Đã quét và điền thành công Phần ${secIdx + 1} với ${parsed.length} câu tìm lỗi sai!`);
        } else {
          setQuestions(parsed);
          alert(`Đã quét thành công ${parsed.length} câu tìm lỗi sai!`);
        }
      } else {
        alert("Không thể phân tích câu hỏi tìm lỗi sai nào. Vui lòng kiểm tra lại định dạng file.");
      }
      return;
    }

    // 3. Dạng trắc nghiệm phẳng (writing-tense-mcq)
    if (targetType === "Trắc nghiệm") {
      const qBoundary = /(?=Câu\s*\d+|Question\s*\d+|\b\d+\s*[\.\:\)])/i;
      const qBlocks = text.split(qBoundary).map(b => b.trim()).filter(Boolean);
      const parsed: any[] = [];
      
      for (const block of qBlocks) {
        const lines = block.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        if (lines.length < 2) continue;

        let questionText = "";
        let answers = ["", "", "", ""];
        let correct = "A";
        let explanation = "";

        for (let line of lines) {
          if (/^[A]\s*[\.\:\)]\s*(.*)/i.test(line)) {
            answers[0] = line.match(/^[A]\s*[\.\:\)]\s*(.*)/i)![1].trim();
          } else if (/^[B]\s*[\.\:\)]\s*(.*)/i.test(line)) {
            answers[1] = line.match(/^[B]\s*[\.\:\)]\s*(.*)/i)![1].trim();
          } else if (/^[C]\s*[\.\:\)]\s*(.*)/i.test(line)) {
            answers[2] = line.match(/^[C]\s*[\.\:\)]\s*(.*)/i)![1].trim();
          } else if (/^[D]\s*[\.\:\)]\s*(.*)/i.test(line)) {
            answers[3] = line.match(/^[D]\s*[\.\:\)]\s*(.*)/i)![1].trim();
          } else if (/^(Đáp án đúng|Correct|Key|Đáp án|Chọn)\s*[\.\:\-]?\s*([A-D])/i.test(line)) {
            correct = line.match(/^(Đáp án đúng|Correct|Key|Đáp án|Chọn)\s*[\.\:\-]?\s*([A-D])/i)![2].toUpperCase();
          } else if (/^(Giải thích|Explanation)\s*[\.\:\-]?\s*(.*)/i.test(line)) {
            explanation = line.match(/^(Giải thích|Explanation)\s*[\.\:\-]?\s*(.*)/i)![2].trim();
          } else {
            if (answers.every(a => !a)) {
              if (questionText) questionText += "\n";
              questionText += line;
            } else {
              if (explanation) {
                explanation += "\n" + line;
              }
            }
          }
        }
        
        questionText = questionText.replace(/^(Câu\s*\d+\s*[\.\:\-]?\s*|Question\s*\d+\s*[\.\:\-]?\s*|\d+\s*[\.\:\)]\s*)/i, "").trim();
        parsed.push({
          question: questionText,
          answers,
          correct,
          explanation,
          audioUrl: "",
          imageUrl: "",
          text: "",
          prompt: "",
          vocabPairs: [{ word: "", meaning: "" }],
          fillInAnswers: [],
          sentences: [""]
        });
      }

      if (parsed.length > 0) {
        if (secIdx !== undefined) {
          const copy = [...examSections];
          copy[secIdx].questions = parsed;
          setExamSections(copy);
          alert(`Đã quét và điền thành công Phần ${secIdx + 1} với ${parsed.length} câu hỏi trắc nghiệm!`);
        } else {
          setQuestions(parsed);
          alert(`Đã quét thành công ${parsed.length} câu hỏi trắc nghiệm!`);
        }
      } else {
        alert("Không thể phân tích câu hỏi nào. Vui lòng kiểm tra lại định dạng file.");
      }
      return;
    }

    // 4. Dạng Nghe chép chính tả (listening-dictation) & Luyện phát âm (speaking-pronounce)
    if (targetType === "Nghe chép chính tả" || targetType === "Luyện phát âm (check phát âm tự động)") {
      const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      const parsed: any[] = [];
      for (const line of lines) {
        if (/^(Giải thích|Explanation)\s*[\.\:\-]?\s*(.*)/i.test(line)) {
          const exp = line.match(/^(Giải thích|Explanation)\s*[\.\:\-]?\s*(.*)/i)![2].trim();
          if (parsed.length > 0) {
            parsed[parsed.length - 1].explanation = exp;
          }
          continue;
        }
        parsed.push({
          question: "",
          answers: ["", "", "", ""],
          correct: "A",
          explanation: "",
          audioUrl: "",
          imageUrl: "",
          text: line,
          prompt: "",
          vocabPairs: [{ word: "", meaning: "" }],
          fillInAnswers: [],
          sentences: [""]
        });
      }

      if (parsed.length > 0) {
        if (secIdx !== undefined) {
          const copy = [...examSections];
          copy[secIdx].questions = parsed;
          setExamSections(copy);
          alert(`Đã quét và điền thành công Phần ${secIdx + 1} với ${parsed.length} câu mẫu!`);
        } else {
          setQuestions(parsed);
          alert(`Đã quét thành công ${parsed.length} câu mẫu!`);
        }
      } else {
        alert("File trống hoặc không có nội dung hợp lệ.");
      }
      return;
    }

    // 5. Sắp xếp câu thành đoạn văn (writing-order-sentences)
    if (targetType === "Sắp xếp câu thành đoạn văn") {
      const parsedParagraphs: any[] = [];
      const rawBlocks = text.split(/\[(?:Đoạn văn|Paragraph|Đoạn|Passage)\]/i).map(b => b.trim()).filter(Boolean);

      const processBlockLines = (lines: string[]) => {
        const sentences: string[] = [];
        let explanation = "";
        for (const line of lines) {
          if (/^(Giải thích|Explanation)\s*[\.\:\-]?\s*(.*)/i.test(line)) {
            explanation = line.match(/^(Giải thích|Explanation)\s*[\.\:\-]?\s*(.*)/i)![2].trim();
          } else {
            sentences.push(line);
          }
        }
        return { sentences, explanation };
      };

      if (rawBlocks.length > 0 && (text.toLowerCase().includes("[đoạn văn]") || text.toLowerCase().includes("[paragraph]") || text.toLowerCase().includes("[đoạn]") || text.toLowerCase().includes("[passage]"))) {
        for (const block of rawBlocks) {
          const lines = block.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
          if (lines.length > 0) {
            const { sentences, explanation } = processBlockLines(lines);
            parsedParagraphs.push({
              question: "",
              answers: ["", "", "", ""],
              correct: "A",
              explanation,
              audioUrl: "",
              imageUrl: "",
              text: "",
              prompt: "",
              vocabPairs: [{ word: "", meaning: "" }],
              fillInAnswers: [],
              sentences
            });
          }
        }
      } else {
        const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        if (lines.length > 0) {
          const { sentences, explanation } = processBlockLines(lines);
          parsedParagraphs.push({
            question: "",
            answers: ["", "", "", ""],
            correct: "A",
            explanation,
            audioUrl: "",
            imageUrl: "",
            text: "",
            prompt: "",
            vocabPairs: [{ word: "", meaning: "" }],
            fillInAnswers: [],
            sentences
          });
        }
      }

      if (parsedParagraphs.length > 0) {
        if (secIdx !== undefined) {
          const copy = [...examSections];
          copy[secIdx].questions = parsedParagraphs;
          setExamSections(copy);
          alert(`Đã quét và điền thành công Phần ${secIdx + 1} với ${parsedParagraphs.length} đoạn văn sắp xếp (tổng cộng ${parsedParagraphs.reduce((acc, p) => acc + p.sentences.length, 0)} câu)!`);
        } else {
          setQuestions(parsedParagraphs);
          alert(`Đã quét thành công ${parsedParagraphs.length} đoạn văn sắp xếp (tổng cộng ${parsedParagraphs.reduce((acc, p) => acc + p.sentences.length, 0)} câu)!`);
        }
      } else {
        alert("File trống hoặc không có nội dung hợp lệ.");
      }
      return;
    }

    // 6. Sắp xếp từ thành câu (writing-order-words)
    if (targetType === "Sắp xếp từ thành câu") {
      const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      const parsed: any[] = [];
      let i = 0;
      while (i < lines.length) {
        const promptLine = lines[i] || "";
        const correctLine = lines[i + 1] || "";
        if (correctLine) {
          let explanation = "";
          let nextIdx = i + 2;
          if (lines[nextIdx] && /^(Giải thích|Explanation)\s*[\.\:\-]?\s*(.*)/i.test(lines[nextIdx])) {
            explanation = lines[nextIdx].match(/^(Giải thích|Explanation)\s*[\.\:\-]?\s*(.*)/i)![2].trim();
            i += 3;
          } else {
            i += 2;
          }
          parsed.push({
            question: "",
            answers: ["", "", "", ""],
            correct: "A",
            explanation: explanation,
            audioUrl: "",
            imageUrl: "",
            text: promptLine,
            correctSentence: correctLine,
            prompt: "",
            vocabPairs: [{ word: "", meaning: "" }],
            fillInAnswers: [],
            sentences: [""]
          });
        } else {
          i += 1;
        }
      }

      if (parsed.length > 0) {
        if (secIdx !== undefined) {
          const copy = [...examSections];
          copy[secIdx].questions = parsed;
          setExamSections(copy);
          alert(`Đã quét và điền thành công Phần ${secIdx + 1} với ${parsed.length} câu sắp xếp từ!`);
        } else {
          setQuestions(parsed);
          alert(`Đã quét thành công ${parsed.length} câu sắp xếp từ!`);
        }
      } else {
        alert("Định dạng file không đúng hoặc không đủ 2 dòng.");
      }
      return;
    }

    // 7. Điền từ vào đoạn văn (listening-fill-in)
    if (targetType === "Điền từ vào đoạn văn") {
      const blocks: { passage: string; answersText: string }[] = [];
      const rawBlocks = text.split(/\[(?:Đoạn văn|Passage)\]/i).map(b => b.trim()).filter(Boolean);
      
      if (rawBlocks.length > 0 && (text.toLowerCase().includes("[đoạn văn]") || text.toLowerCase().includes("[passage]"))) {
        for (const block of rawBlocks) {
          const ansMatch = block.match(/\[(?:Đáp án|Answers|Keys)\]\s*([\s\S]*)/i);
          if (ansMatch) {
            const answersText = ansMatch[1].trim();
            const passage = block.replace(ansMatch[0], "").trim();
            blocks.push({ passage, answersText });
          } else {
            blocks.push({ passage: block, answersText: "" });
          }
        }
      } else {
        const ansMatch = text.match(/\[(?:Đáp án|Answers|Keys)\]\s*([\s\S]*)$/i);
        if (ansMatch) {
          const answersText = ansMatch[1].trim();
          const passage = text.replace(ansMatch[0], "").replace(/\[(?:Đoạn văn|Passage)\]/i, "").trim();
          blocks.push({ passage, answersText });
        } else {
          blocks.push({ passage: text.trim(), answersText: "" });
        }
      }

      const parsedQuestions = blocks.map(block => {
        const fillInAnswers: string[] = [];
        let explanation = "";
        const ansLines = block.answersText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        for (const line of ansLines) {
          if (/^(Giải thích|Explanation)\s*[\.\:\-]?\s*(.*)/i.test(line)) {
            explanation = line.match(/^(Giải thích|Explanation)\s*[\.\:\-]?\s*(.*)/i)![2].trim();
          } else {
            const m = line.match(/^\d+\s*[\.\:\-]?\s*(.*)/);
            if (m) {
              fillInAnswers.push(m[1].trim());
            } else {
              fillInAnswers.push(line);
            }
          }
        }
        return {
          question: "",
          answers: ["", "", "", ""],
          correct: "A",
          explanation: explanation,
          audioUrl: "",
          imageUrl: "",
          text: block.passage,
          prompt: "",
          vocabPairs: [{ word: "", meaning: "" }],
          fillInAnswers: fillInAnswers,
          sentences: [""]
        };
      });

      if (parsedQuestions.length > 0) {
        if (secIdx !== undefined) {
          const copy = [...examSections];
          copy[secIdx].content = parsedQuestions[0].text;
          copy[secIdx].questions = parsedQuestions;
          setExamSections(copy);
          alert(`Đã quét và điền thành công Phần ${secIdx + 1} với ${parsedQuestions.length} đoạn văn điền từ!`);
        } else {
          setQuestions(parsedQuestions);
          alert(`Đã quét thành công ${parsedQuestions.length} đoạn văn và danh sách đáp án!`);
        }
      } else {
        alert("Định dạng file không đúng.");
      }
      return;
    }

    // 8. Bài tập từ vựng nối từ (reading-vocab-mcq)
    if (targetType === "Nối từ") {
      const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      const vocabPairs: { word: string; meaning: string }[] = [];
      let explanation = "";
      for (const line of lines) {
        if (/^(Giải thích|Explanation)\s*[\.\:\-]?\s*(.*)/i.test(line)) {
          explanation = line.match(/^(Giải thích|Explanation)\s*[\.\:\-]?\s*(.*)/i)![2].trim();
          continue;
        }
        const parts = line.split(/\s*(?:-|:|->)\s*/);
        if (parts.length >= 2) {
          vocabPairs.push({
            word: parts[0].trim(),
            meaning: parts[1].trim()
          });
        }
      }

      if (vocabPairs.length > 0) {
        const parsedQuestion = {
          question: "",
          answers: ["", "", "", ""],
          correct: "A",
          explanation: explanation,
          audioUrl: "",
          imageUrl: "",
          text: "",
          prompt: "",
          vocabPairs: vocabPairs,
          fillInAnswers: [],
          sentences: [""]
        };

        if (secIdx !== undefined) {
          const copy = [...examSections];
          copy[secIdx].questions = [parsedQuestion];
          setExamSections(copy);
          alert(`Đã quét và điền thành công Phần ${secIdx + 1} với ${vocabPairs.length} cặp từ vựng!`);
        } else {
          setQuestions([parsedQuestion]);
          alert(`Đã quét thành công ${vocabPairs.length} cặp từ vựng!`);
        }
      } else {
        alert("Định dạng file không đúng. Vui lòng nhập theo mẫu: word - nghĩa");
      }
      return;
    }

    alert("Dạng bài tập này chưa được hỗ trợ quét file tự động.");
  };

  /* ===== FILE UPLOAD HELPER ===== */
  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(API_BASE + "/upload", {
      method: "POST",
      body: formData
    });
    if (!res.ok) throw new Error("Upload failed");
    const data = await res.json();
    return data.url || "";
  };

  /*
  const handleDangBaiChange = (db: string) => {
    setDangBai(db);
    const targetType = mapDangBaiToType(db);
    setType(targetType);
    setCommonAudioUrl("");
    
    // Reset questions state with proper initial structure
    setQuestions([
      {
        question: "",
        answers: ["", "", "", ""],
        correct: "A",
        explanation: "",
        audioUrl: "",
        imageUrl: "",
        text: "",
        prompt: "",
        vocabPairs: [{ word: "", meaning: "" }],
        fillInAnswers: [],
        sentences: [""]
      }
    ]);
  };
  */

  const addQuestionItem = () => {
    setQuestions([
      ...questions,
      {
        question: "",
        answers: ["", "", "", ""],
        correct: "A",
        explanation: "",
        audioUrl: "",
        imageUrl: "",
        text: "",
        prompt: "",
        vocabPairs: [{ word: "", meaning: "" }],
        fillInAnswers: [],
        sentences: ["", "", "", "", "", ""],
        correctSentence: "",
        subQuestions: [{ question: "", answers: ["", "", "", ""], correct: "A", explanation: "" }]
      }
    ]);
  };

  const removeQuestionItem = (idx: number) => {
    if (questions.length === 1) return;
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const updateQuestionItemField = (idx: number, field: string, value: any) => {
    const copy = [...questions];
    copy[idx][field] = value;
    setQuestions(copy);
  };

  const addSubQuestion = (qIdx: number) => {
    const copy = [...questions];
    if (!copy[qIdx].subQuestions) {
      copy[qIdx].subQuestions = [];
    }
    copy[qIdx].subQuestions.push({
      question: "",
      answers: ["", "", "", ""],
      correct: "A",
      explanation: ""
    });
    setQuestions(copy);
  };

  const removeSubQuestion = (qIdx: number, subIdx: number) => {
    const copy = [...questions];
    if (copy[qIdx].subQuestions) {
      copy[qIdx].subQuestions = copy[qIdx].subQuestions.filter((_: any, i: number) => i !== subIdx);
    }
    setQuestions(copy);
  };

  const updateSubQuestionField = (qIdx: number, subIdx: number, field: string, value: any) => {
    const copy = [...questions];
    if (copy[qIdx].subQuestions && copy[qIdx].subQuestions[subIdx]) {
      copy[qIdx].subQuestions[subIdx][field] = value;
    }
    setQuestions(copy);
  };

  const updateSubQuestionAnswer = (qIdx: number, subIdx: number, aIdx: number, value: string) => {
    const copy = [...questions];
    if (copy[qIdx].subQuestions && copy[qIdx].subQuestions[subIdx]) {
      copy[qIdx].subQuestions[subIdx].answers[aIdx] = value;
    }
    setQuestions(copy);
  };

  /* ===== INSTANT FILE UPLOAD FOR MULTIPLE QUESTIONS ===== */
  const handleQuestionFileUpload = async (idx: number, field: "audioUrl" | "imageUrl", file: File) => {
    try {
      const url = await uploadFile(file);
      updateQuestionItemField(idx, field, url);
    } catch (err) {
      alert("Lỗi khi tải file lên");
    }
  };

  /* ===== EXAM BUILDER HELPERS ===== */
  const addExamSection = () => {
    const allTypes = [
      "Nghe audio trắc nghiệm", "Hình ảnh chọn đáp án", "Nghe chép chính tả", "Điền từ vào đoạn văn",
      "Luyện phát âm (check phát âm tự động)", "Nói theo chủ đề (ghi âm nộp GV)", "Trắc nghiệm đọc hiểu (chia đôi màn hình)", "Nối từ",
      "Sắp xếp từ thành câu", "Trắc nghiệm", "Tìm lỗi sai", "Viết đoạn văn ngắn", "Sắp xếp câu thành đoạn văn"
    ];
    const existingTypes = examSections.map(s => s.type);
    const defaultType = allTypes.find(t => !existingTypes.includes(t)) || "Nghe audio trắc nghiệm";
    const newIdx = examSections.length;

    setExamSections([
      ...examSections,
      {
        type: defaultType,
        title: `Phần ${newIdx + 1}`,
        audioUrl: "",
        questions: defaultType === "Viết đoạn văn ngắn" ? [] : (defaultType === "Nói theo chủ đề (ghi âm nộp GV)" ? [{ prompt: "", imageUrl: "", audioUrl: "", question: "", answers: [], correct: "" }] : [{ question: "", answers: ["", "", "", ""], correct: "A", explanation: "" }])
      }
    ]);
    setTimeout(() => {
      const el = document.getElementById(`exam-section-card-${newIdx}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const applyPreset = (presetType: "toeic2" | "toeic4" | "vstep4") => {
    const confirmMsg = "Áp dụng cấu trúc mẫu sẽ XÓA và THAY THẾ toàn bộ phần thi hiện tại. Bạn có chắc chắn muốn tiếp tục?";
    setConfirmDialog({
      show: true,
      title: "Xác nhận áp dụng cấu trúc mẫu",
      message: confirmMsg,
      onConfirm: () => {
        let newSections: ExamSection[] = [];

    if (presetType === "toeic2") {
      newSections = [
        {
          type: "Hình ảnh chọn đáp án",
          title: "Part 1: Photographs (Mô tả tranh nghe)",
          questions: Array.from({ length: 6 }).map(() => ({
            question: "",
            answers: ["A", "B", "C", "D"],
            correct: "A",
            imageUrl: "",
            audioUrl: ""
          }))
        },
        {
          type: "Nghe audio trắc nghiệm",
          title: "Part 2: Question-Response (Hỏi & Đáp)",
          questions: Array.from({ length: 25 }).map(() => ({
            question: "",
            answers: ["A", "B", "C", "D"],
            correct: "A",
            audioUrl: ""
          }))
        },
        {
          type: "Nghe audio trắc nghiệm",
          title: "Part 3: Conversations (Hội thoại)",
          questions: Array.from({ length: 13 }).map(() => ({
            prompt: "",
            audioUrl: "",
            subQuestions: Array.from({ length: 3 }).map(() => ({
              question: "",
              answers: ["", "", "", ""],
              correct: "A",
              explanation: ""
            }))
          }))
        },
        {
          type: "Nghe audio trắc nghiệm",
          title: "Part 4: Talks (Bài nói ngắn)",
          questions: Array.from({ length: 10 }).map(() => ({
            prompt: "",
            audioUrl: "",
            subQuestions: Array.from({ length: 3 }).map(() => ({
              question: "",
              answers: ["", "", "", ""],
              correct: "A",
              explanation: ""
            }))
          }))
        },
        {
          type: "Trắc nghiệm",
          title: "Part 5: Incomplete Sentences (Điền câu)",
          questions: Array.from({ length: 30 }).map(() => ({
            question: "",
            answers: ["", "", "", ""],
            correct: "A",
            explanation: ""
          }))
        },
        {
          type: "Trắc nghiệm đọc hiểu (chia đôi màn hình)",
          title: "Part 6: Text Completion (Điền đoạn văn)",
          questions: Array.from({ length: 4 }).map(() => ({
            text: "",
            subQuestions: Array.from({ length: 4 }).map(() => ({
              question: "",
              answers: ["", "", "", ""],
              correct: "A",
              explanation: ""
            }))
          }))
        },
        {
          type: "Trắc nghiệm đọc hiểu (chia đôi màn hình)",
          title: "Part 7: Reading Comprehension (Đọc hiểu)",
          questions: Array.from({ length: 10 }).map(() => ({
            text: "",
            subQuestions: Array.from({ length: 3 }).map(() => ({
              question: "",
              answers: ["", "", "", ""],
              correct: "A",
              explanation: ""
            }))
          }))
        }
      ];
    } else if (presetType === "toeic4") {
      newSections = [
        {
          type: "Hình ảnh chọn đáp án",
          title: "Part 1: Photographs (Mô tả tranh nghe)",
          questions: Array.from({ length: 6 }).map(() => ({
            question: "",
            answers: ["A", "B", "C", "D"],
            correct: "A",
            imageUrl: "",
            audioUrl: ""
          }))
        },
        {
          type: "Nghe audio trắc nghiệm",
          title: "Part 2: Question-Response (Hỏi & Đáp)",
          questions: Array.from({ length: 25 }).map(() => ({
            question: "",
            answers: ["A", "B", "C", "D"],
            correct: "A",
            audioUrl: ""
          }))
        },
        {
          type: "Nghe audio trắc nghiệm",
          title: "Part 3: Conversations (Hội thoại)",
          questions: Array.from({ length: 13 }).map(() => ({
            prompt: "",
            audioUrl: "",
            subQuestions: Array.from({ length: 3 }).map(() => ({
              question: "",
              answers: ["", "", "", ""],
              correct: "A",
              explanation: ""
            }))
          }))
        },
        {
          type: "Nghe audio trắc nghiệm",
          title: "Part 4: Talks (Bài nói ngắn)",
          questions: Array.from({ length: 10 }).map(() => ({
            prompt: "",
            audioUrl: "",
            subQuestions: Array.from({ length: 3 }).map(() => ({
              question: "",
              answers: ["", "", "", ""],
              correct: "A",
              explanation: ""
            }))
          }))
        },
        {
          type: "Trắc nghiệm",
          title: "Part 5: Incomplete Sentences (Điền câu)",
          questions: Array.from({ length: 30 }).map(() => ({
            question: "",
            answers: ["", "", "", ""],
            correct: "A",
            explanation: ""
          }))
        },
        {
          type: "Trắc nghiệm đọc hiểu (chia đôi màn hình)",
          title: "Part 6: Text Completion (Điền đoạn văn)",
          questions: Array.from({ length: 4 }).map(() => ({
            text: "",
            subQuestions: Array.from({ length: 4 }).map(() => ({
              question: "",
              answers: ["", "", "", ""],
              correct: "A",
              explanation: ""
            }))
          }))
        },
        {
          type: "Trắc nghiệm đọc hiểu (chia đôi màn hình)",
          title: "Part 7: Reading Comprehension (Đọc hiểu)",
          questions: Array.from({ length: 10 }).map(() => ({
            text: "",
            subQuestions: Array.from({ length: 3 }).map(() => ({
              question: "",
              answers: ["", "", "", ""],
              correct: "A",
              explanation: ""
            }))
          }))
        },
        {
          type: "Luyện phát âm (check phát âm tự động)",
          title: "Part 8: Read a text aloud (Đọc to)",
          questions: Array.from({ length: 2 }).map(() => ({
            text: "",
            level: "Đọc theo câu",
            explanation: ""
          }))
        },
        {
          type: "Nói theo chủ đề (ghi âm nộp GV)",
          title: "Part 9: Describe a picture & Respond to questions (Nói mô tả & Trả lời)",
          questions: Array.from({ length: 5 }).map(() => ({
            prompt: "",
            imageUrl: "",
            audioUrl: ""
          }))
        },
        {
          type: "Nói theo chủ đề (ghi âm nộp GV)",
          title: "Part 10: Express an opinion (Bày tỏ ý kiến nói)",
          questions: [
            {
              prompt: "",
              imageUrl: "",
              audioUrl: ""
            }
          ]
        },
        {
          type: "Viết đoạn văn ngắn",
          title: "Part 11: Writing (Viết mô tả & Viết thư & Viết luận)",
          content: "Nhập các hướng dẫn/đề bài viết chung ở đây...",
          questions: []
        }
      ];
    } else if (presetType === "vstep4") {
      newSections = [
        {
          type: "Nghe audio trắc nghiệm",
          title: "Listening Part 1: Short Instructions/Announcements (Nghe thông báo ngắn)",
          questions: Array.from({ length: 8 }).map(() => ({
            question: "",
            answers: ["", "", "", ""],
            correct: "A",
            audioUrl: ""
          }))
        },
        {
          type: "Nghe audio trắc nghiệm",
          title: "Listening Part 2: Conversations (Nghe hội thoại)",
          questions: Array.from({ length: 3 }).map(() => ({
            prompt: "",
            audioUrl: "",
            subQuestions: Array.from({ length: 4 }).map(() => ({
              question: "",
              answers: ["", "", "", ""],
              correct: "A",
              explanation: ""
            }))
          }))
        },
        {
          type: "Nghe audio trắc nghiệm",
          title: "Listening Part 3: Lectures/Talks (Nghe bài nói ngắn)",
          questions: Array.from({ length: 3 }).map(() => ({
            prompt: "",
            audioUrl: "",
            subQuestions: Array.from({ length: 5 }).map(() => ({
              question: "",
              answers: ["", "", "", ""],
              correct: "A",
              explanation: ""
            }))
          }))
        },
        {
          type: "Trắc nghiệm đọc hiểu (chia đôi màn hình)",
          title: "Reading: 4 Passages (Đọc hiểu 4 bài)",
          questions: Array.from({ length: 4 }).map(() => ({
            text: "",
            subQuestions: Array.from({ length: 10 }).map(() => ({
              question: "",
              answers: ["", "", "", ""],
              correct: "A",
              explanation: ""
            }))
          }))
        },
        {
          type: "Viết đoạn văn ngắn",
          title: "Writing Task 1: Email/Letter writing (Viết thư)",
          content: "Write a letter to...",
          questions: []
        },
        {
          type: "Viết đoạn văn ngắn",
          title: "Writing Task 2: Essay writing (Viết luận)",
          content: "Write an essay discussing...",
          questions: []
        },
        {
          type: "Nói theo chủ đề (ghi âm nộp GV)",
          title: "Speaking Part 1: Social Interaction (Giao tiếp xã hội)",
          questions: Array.from({ length: 2 }).map(() => ({
            prompt: "",
            subQuestions: Array.from({ length: 3 }).map(() => ({
              question: "",
              answers: ["", "", "", ""],
              correct: "A"
            }))
          }))
        },
        {
          type: "Nói theo chủ đề (ghi âm nộp GV)",
          title: "Speaking Part 2: Solution Discussion (Thảo luận giải pháp)",
          questions: [
            {
              prompt: "A situation with 3 options..."
            }
          ]
        },
        {
          type: "Nói theo chủ đề (ghi âm nộp GV)",
          title: "Speaking Part 3: Topic Development (Phát triển chủ đề)",
          questions: [
            {
              prompt: "A mindmap topic development..."
            }
          ]
        }
      ];
    }

        setExamSections(newSections);
        setCollapsedSections({});
      }
    });
  };

  const removeExamSection = (idx: number) => {
    if (examSections.length === 1) return;
    setExamSections(examSections.filter((_, i) => i !== idx));
  };

  const handleExamSectionUpload = async (secIdx: number, field: "audioUrl" | "imageUrl", file: File) => {
    try {
      const url = await uploadFile(file);
      const copy = [...examSections];
      copy[secIdx][field] = url;
      setExamSections(copy);
    } catch (err) {
      alert("Lỗi khi tải file lên");
    }
  };

  const handleExamQuestionFileUpload = async (secIdx: number, qIdx: number, field: "audioUrl" | "imageUrl", file: File) => {
    try {
      const url = await uploadFile(file);
      const copy = [...examSections];
      if (copy[secIdx].questions && copy[secIdx].questions[qIdx]) {
        (copy[secIdx].questions[qIdx] as any)[field] = url;
      }
      setExamSections(copy);
    } catch (err) {
      alert("Lỗi khi tải file lên");
    }
  };

  const addQuestionToSection = (secIdx: number) => {
    const copy = [...examSections];
    if (!copy[secIdx].questions) copy[secIdx].questions = [];
    copy[secIdx].questions.push({
      question: "",
      answers: ["", "", "", ""],
      correct: "A",
      explanation: "",
      audioUrl: "",
      imageUrl: "",
      text: "",
      prompt: "",
      vocabPairs: [{ word: "", meaning: "" }],
      fillInAnswers: [],
      sentences: [""],
      correctSentence: "",
      subQuestions: [{ question: "", answers: ["", "", "", ""], correct: "A", explanation: "" }]
    });
    setExamSections(copy);
  };

  const removeQuestionFromSection = (secIdx: number, qIdx: number) => {
    const copy = [...examSections];
    if (copy[secIdx].questions) {
      copy[secIdx].questions = copy[secIdx].questions.filter((_, i) => i !== qIdx);
    }
    setExamSections(copy);
  };

  const updateQuestionInSection = (secIdx: number, qIdx: number, field: string, value: any) => {
    const copy = [...examSections];
    const sec = copy[secIdx];
    if (sec && sec.questions && sec.questions[qIdx]) {
      (sec.questions[qIdx] as any)[field] = value;
    }
    setExamSections(copy);
  };

  const addSubQuestionToSection = (secIdx: number, qIdx: number) => {
    const copy = [...examSections];
    const sec = copy[secIdx];
    if (sec && sec.questions && sec.questions[qIdx]) {
      const q = sec.questions[qIdx];
      if (!q.subQuestions) {
        q.subQuestions = [];
      }
      q.subQuestions.push({
        question: "",
        answers: ["", "", "", ""],
        correct: "A",
        explanation: ""
      });
    }
    setExamSections(copy);
  };

  const removeSubQuestionFromSection = (secIdx: number, qIdx: number, subIdx: number) => {
    const copy = [...examSections];
    const sec = copy[secIdx];
    if (sec && sec.questions && sec.questions[qIdx] && sec.questions[qIdx].subQuestions) {
      sec.questions[qIdx].subQuestions = sec.questions[qIdx].subQuestions.filter((_: any, i: number) => i !== subIdx);
    }
    setExamSections(copy);
  };

  const updateSubQuestionFieldInSection = (secIdx: number, qIdx: number, subIdx: number, field: string, value: any) => {
    const copy = [...examSections];
    const sec = copy[secIdx];
    if (sec && sec.questions && sec.questions[qIdx] && sec.questions[qIdx].subQuestions && sec.questions[qIdx].subQuestions[subIdx]) {
      sec.questions[qIdx].subQuestions[subIdx][field] = value;
    }
    setExamSections(copy);
  };

  const updateSubQuestionAnswerInSection = (secIdx: number, qIdx: number, subIdx: number, aIdx: number, value: string) => {
    const copy = [...examSections];
    const sec = copy[secIdx];
    if (sec && sec.questions && sec.questions[qIdx] && sec.questions[qIdx].subQuestions && sec.questions[qIdx].subQuestions[subIdx]) {
      sec.questions[qIdx].subQuestions[subIdx].answers[aIdx] = value;
    }
    setExamSections(copy);
  };

  const handleCreate = async (statusOverride?: "draft" | "pending" | "published" | "practice") => {
    if (!title.trim()) {
      setTitleError("Vui lòng nhập tiêu đề");
      const el = document.querySelector(".exercise-title");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const shouldShowDeadline = !isMiniTest && (!isExam || (isExam && openingMode === "scheduled"));
    if (shouldShowDeadline && !deadline) {
      setDeadlineError("Vui lòng chọn hạn nộp bài!");
      const el = document.querySelector('input[type="datetime-local"]');
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    if (!isExam && !selectedMaBaiHoc) {
      alert("Vui lòng chọn bài giảng để gắn với bài tập này!");
      const el = document.querySelector(".exercise-title");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const userStr = sessionStorage.getItem("user") || localStorage.getItem("user");
    const user = JSON.parse(userStr || "{}");
    const isTeacher = user.VaiTro === "Giảng Viên";
    let status: string = statusOverride || (isPractice ? "practice" : (isTeacher ? "pending" : "published"));
    if (status === "draft") status = "Lưu nháp";
    else if (status === "pending") status = "Chờ duyệt";
    else if (status === "published") status = "Đã duyệt";
    else if (status === "rejected") status = "Từ chối";
    const today = new Date().toISOString().split("T")[0];

    try {
      let contentStr = "";
      let questionsStr = "";
      let mainAudioUrl = "";

      if (isExam || !isMiniTest) {
        // Compile entire structure into Content
        const examContent = {
          isExam: isExam,
          duration: isExam ? examDuration : null,
          startTime: isExam && openingMode === "scheduled" ? examStartTime : null,
          deadline: deadline || null,
          openingMode: isExam ? openingMode : null,
          isOpened: isExam ? (openingMode === "manual" ? false : true) : true,
          sections: examSections
        };
        contentStr = JSON.stringify(examContent);
        questionsStr = ""; 
        const firstAudioSec = examSections.find(s => s.audioUrl);
        mainAudioUrl = firstAudioSec ? firstAudioSec.audioUrl || "" : "";
      } else {
        // Regular exercise (Minitest only)
        const contentMeta = {
          deadline: deadline || null,
          description: questions[0]?.question || "",
          imageUrl: questions[0]?.imageUrl || "",
          audioUrl: commonAudioUrl || questions[0]?.audioUrl || ""
        };
        contentStr = JSON.stringify(contentMeta);
        // Serialize the array of questions
        questionsStr = JSON.stringify(questions);
        mainAudioUrl = commonAudioUrl || questions[0]?.audioUrl || "";
      }

      if (isMiniTest) {
        const res = await fetch(API_BASE + "/minitest/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            MaBaiHoc: Number(maBaiHocParam),
            CauHoi: questionsStr,
            DiemDat: 100,
            TrangThai: status
          })
        });

        if (!res.ok) {
          throw new Error("Không thể tạo Minitest trên máy chủ");
        }

        setSuccessMessage(
          status === "draft"
            ? "Đã lưu bản nháp Minitest thành công"
            : "Đã lưu Minitest thành công"
        );
        setShowSuccess(true);
        setTimeout(() => navigate(`/bai-giang/${maBaiHocParam}`), 1500);
        return;
      }

      const requestUrl = editDraftId 
        ? `${API_BASE}/baitap/${editDraftId}`
        : `${API_BASE}/baitap/create`;
      const requestMethod = editDraftId ? "PUT" : "POST";

      const res = await fetch(requestUrl, {
        method: requestMethod,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Title:       title,
          Type:        isExam ? "exam" : type,
          Content:     contentStr,
          Questions:   questionsStr,
          Vocabulary:  "", 
          CreatedDate: today,
          MaBuoiHoc:    (Number(id) && Number(id) !== 0) ? Number(id) : (draftMaBuoiHoc || null),
          MaBaiHoc:     isExam ? null : (selectedMaBaiHoc ? Number(selectedMaBaiHoc) : null),
          AudioUrl:    mainAudioUrl,
          ShowAnswer:  showAnswer ? 1 : 0,
          IsFree:      isFree ? 1 : 0,
          IsExam:      isExam ? 1 : 0,
          TrangThai:   status,
          KyNang:      (isExam || !isMiniTest) ? "Tổng hợp" : kyNang,
          DangBai:     (isExam || !isMiniTest) ? "Tổng hợp" : dangBai,
          MaGiangVien: user.MaNguoiDung || null
        })
      });

      if (!res.ok) {
        throw new Error(editDraftId ? "Không thể cập nhật bài tập trên máy chủ" : "Không thể tạo bài tập trên máy chủ");
      }

      setSuccessMessage(
        status === "draft"
          ? "Đã lưu bản nháp thành công"
          : status === "practice"
          ? "Tạo bài luyện tập thêm thành công"
          : isTeacher
          ? (isExam ? "Đã gửi yêu cầu duyệt bài kiểm tra đến QTV" : "Đã gửi yêu cầu duyệt bài tập đến QTV")
          : (isExam ? "Tạo bài kiểm tra thành công" : "Tạo bài tập thành công")
      );
      setShowSuccess(true);
      if (editDraftId) {
        setTimeout(() => {
          navigate("/quan-ly-ban-nhap");
        }, 1500);
      } else {
        const isQTVPath = location.pathname.startsWith("/QTV");
        if (isQTVPath) {
          if (location.state?.fromPage === "kho-hoc-lieu") {
            setTimeout(() => {
              navigate("/QTV/kho-hoc-lieu");
            }, 1500);
          } else {
            setTimeout(() => {
              navigate("/QTV/khoahoc", {
                state: {
                  openClassId: fromClassId,
                  openCourseId: fromCourseId,
                  activeTab: "roadmap"
                }
              });
            }, 1500);
          }
        } else {
          setTimeout(() => navigate(`/bai-tap/${id}`), 1500);
        }
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi khi tạo bài tập");
    }
  };

  if (!lesson && !editDraftId) return <p>Đang tải...</p>;

  return (
    <div className="ce-wrapper" style={isQTV ? { padding: "24px 32px 32px 32px", boxSizing: "border-box" } : undefined}>
      <div className="back" onClick={() => {
        if (editDraftId) {
          navigate("/quan-ly-ban-nhap");
          return;
        }
        if (isQTV) {
          if (location.state?.fromPage === "kho-hoc-lieu") {
            navigate("/QTV/kho-hoc-lieu");
          } else {
            navigate("/QTV/khoahoc", {
              state: {
                openClassId: fromClassId,
                openCourseId: fromCourseId,
                activeTab: "roadmap"
              }
            });
          }
        } else {
          navigate(-1);
        }
      }}>← Quay lại</div>

      {/* HEADER CARD */}
      <div className="ce-header-card">
        <h1>{lesson?.TenBuoiHoc || "Đang tải..."}</h1>
      </div>



      {/* SUB-TABS: TẠO MỚI / CHỌN CÓ SẴN */}
      {!isMiniTest && (
        <div style={{
          marginBottom: "24px",
          display: "inline-flex",
          gap: "4px",
          background: "#e5e2db",
          padding: "3px",
          borderRadius: "8px",
          width: "fit-content",
          border: "1px solid #d4cfc7"
        }}>
          <button
            type="button"
            onClick={() => setActiveTab("create")}
            style={{
              cursor: "pointer",
              padding: "5px 14px",
              fontSize: "12px",
              fontWeight: "600",
              border: "none",
              borderRadius: "6px",
              transition: "all 0.15s ease",
              background: activeTab === "create" ? "#fff" : "transparent",
              color: activeTab === "create" ? "#2d1e15" : "#70625a",
              boxShadow: activeTab === "create" ? "0 1px 3px rgba(0,0,0,0.12)" : "none"
            }}
          >
            Tạo mới
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("reuse")}
            style={{
              cursor: "pointer",
              padding: "5px 14px",
              fontSize: "12px",
              fontWeight: "600",
              border: "none",
              borderRadius: "6px",
              transition: "all 0.15s ease",
              background: activeTab === "reuse" ? "#fff" : "transparent",
              color: activeTab === "reuse" ? "#2d1e15" : "#70625a",
              boxShadow: activeTab === "reuse" ? "0 1px 3px rgba(0,0,0,0.12)" : "none"
            }}
          >
            BT có sẵn
          </button>
        </div>
      )}

      {activeTab === "reuse" ? (
        <div className="exercise-editor" style={{ padding: "24px" }}>
          <h3 style={{ marginBottom: "15px", color: "#000080", fontWeight: 700 }}>BT có sẵn</h3>
          
          <input
            type="text"
            placeholder="Tìm kiếm bài tập..."
            value={reuseSearch}
            onChange={e => setReuseSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              marginBottom: "20px",
              boxSizing: "border-box",
              outline: "none",
              fontSize: "14px",
              transition: "all 0.2s"
            }}
            className="exercise-search-input"
          />

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {allExistingEx.filter(ex => ex.Title?.toLowerCase().includes(reuseSearch.toLowerCase())).length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px", color: "#999" }}>Không tìm thấy bài tập nào.</div>
            ) : (
              allExistingEx.filter(ex => ex.Title?.toLowerCase().includes(reuseSearch.toLowerCase())).map((ex: any) => (
                <div key={ex.MaBaiTap} style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "#ffffff",
                  padding: "16px 20px",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)",
                  transition: "all 0.2s"
                }}>
                  <div style={{ flex: 1, paddingRight: "15px", textAlign: "left" }}>
                    <strong style={{ fontSize: "16px", color: "#000080", display: "block" }}>{ex.Title}</strong>
                    <span style={{ fontSize: "12px", color: "#8b7e74", display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                      Dạng bài: 
                      <span style={{ 
                        fontWeight: 600, 
                        color: (ex.IsExam === 1 || ex.Type === "exam") ? "#ef4444" : ((ex.Type === "luyen-tap-them" || ex.Type === "practice") ? "#f97316" : "#3b82f6"),
                        background: (ex.IsExam === 1 || ex.Type === "exam") ? "#fef2f2" : ((ex.Type === "luyen-tap-them" || ex.Type === "practice") ? "#fff7ed" : "#eff6ff"),
                        padding: "2px 6px",
                        borderRadius: "4px",
                        fontSize: "11px",
                        border: (ex.IsExam === 1 || ex.Type === "exam") ? "1px solid #fee2e2" : ((ex.Type === "luyen-tap-them" || ex.Type === "practice") ? "1px solid #ffedd5" : "1px solid #dbeafe")
                      }}>
                        {(ex.IsExam === 1 || ex.Type === "exam") ? "Bài KTra" : ((ex.Type === "luyen-tap-them" || ex.Type === "practice") ? "LTThem" : "BTap")}
                      </span>
                      · Lớp: {ex.TenLop} ({ex.TenBuoiHoc})
                    </span>
                  </div>
                  <button
                    type="button"
                    className="save-btn"
                    style={{ fontSize: "13px", padding: "8px 16px", width: "auto", margin: 0, opacity: isProcessing ? 0.6 : 1 }}
                    disabled={isProcessing}
                    onClick={() => handleReuseExercise(ex.MaBaiTap)}
                  >
                    {isProcessing ? "Đang xử lý..." : "Chọn bài này"}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* EXERCISE EDITOR */
        <div className="exercise-editor">
          {/* NÚT QUÉT FILE CÂU HỎI */}
          {isMiniTest ? (["Tổng hợp", "Nghe audio trắc nghiệm", "Trắc nghiệm", "Tìm lỗi sai", "Nối từ", "Trắc nghiệm đọc hiểu (chia đôi màn hình)", "Nghe chép chính tả", "Luyện phát âm (check phát âm tự động)", "Sắp xếp từ thành câu", "Sắp xếp câu thành đoạn văn", "Điền từ vào đoạn văn"].includes(type) ? (
            <div style={{
              background: "#f8fafc",
              border: "1px dashed #cbd5e1",
              borderRadius: "12px",
              padding: "20px",
              marginBottom: "20px",
              textAlign: "left"
            }}>
              <h4 style={{ margin: "0 0 6px 0", color: "#000080", fontSize: "16px", fontWeight: 700 }}>Quét câu hỏi từ file Word (.docx) hoặc Text (.txt)</h4>
              <p style={{ margin: "0 0 10px 0", fontSize: "13px", color: "#475569", lineHeight: "1.5" }}>
                Hệ thống hỗ trợ tự động điền thông tin cho dạng bài <strong>{dangBai}</strong>. Vui lòng định dạng file theo mẫu dưới đây để quét chính xác nhất:
              </p>
              
              {/* Dynamic Instructions Box */}
              <div style={{
                background: "#ffffff",
                padding: "14px 18px",
                borderRadius: "8px",
                fontSize: "12px",
                fontFamily: "Courier New, monospace",
                whiteSpace: "pre-wrap",
                color: "#334155",
                marginBottom: "14px",
                border: "1px solid #e2e8f0",
                borderLeft: "4px solid #000080",
                lineHeight: "1.5"
              }}>
                {type === "Tổng hợp" || type === "Nghe audio trắc nghiệm" ? (
                  `Mẫu file Trắc nghiệm nhóm / Nghe Audio MCQ (Hỗ trợ chia theo nhóm/ngữ cảnh):\n` +
                  `[Nhóm 1]\n` +
                  `Ngữ cảnh: Dialogue between a student and a teacher. (tùy chọn)\n` +
                  `Câu 1: What does the student need help with?\n` +
                  `A. Homework\n` +
                  `B. Registration\n` +
                  `C. Examination\n` +
                  `D. Dormitory\n` +
                  `Đáp án đúng: B\n` +
                  `Giải thích: Học viên cần giúp đăng ký môn học (tùy chọn)\n\n` +
                  `Câu 2: When is the deadline?\n` +
                  `A. Today\n` +
                  `B. Tomorrow\n` +
                  `C. Friday\n` +
                  `D. Next week\n` +
                  `Đáp án đúng: C\n\n` +
                  `[Nhóm 2]\n` +
                  `Ngữ cảnh: Announcement in the railway station. (tùy chọn)\n` +
                  `Câu 3: Why is the train delayed?\n` +
                  `A. Bad weather\n` +
                  `B. Technical issues\n` +
                  `C. Late arrival\n` +
                  `D. Track maintenance\n` +
                  `Đáp án đúng: B`
                ) : type === "Trắc nghiệm" ? (
                  `Mẫu file Trắc nghiệm MCQ:\n` +
                  `Câu 1: She _______ English for 5 years.\n` +
                  `A. has studied\n` +
                  `B. studies\n` +
                  `C. studied\n` +
                  `D. is studying\n` +
                  `Đáp án đúng: A\n` +
                  `Giải thích: Hành động bắt đầu trong quá khứ kéo dài đến hiện tại (tùy chọn)`
                ) : type === "Nối từ" ? (
                  `Mẫu file Bài tập từ vựng nối từ (Mỗi dòng là một cặp từ cách nhau bởi dấu gạch ngang, 1 bên từ tiếng Anh - 1 bên diễn giải nghĩa cũng bằng tiếng Anh):\n` +
                  `cat - a small domesticated carnivorous mammal with soft fur\n` +
                  `dog - a common domesticated carnivorous mammal that typically has a long snout\n` +
                  `apple - a round fruit with red, green, or yellow skin and crisp white flesh`
                ) : type === "Trắc nghiệm đọc hiểu (chia đôi màn hình)" ? (
                  `Mẫu file Đọc chia đôi màn hình (Có thể tạo nhiều bài đọc liên tiếp bằng cách lặp lại [Bài đọc] và [Câu hỏi]):\n` +
                  `[Bài đọc]\n` +
                  `This is the reading passage text. You can write paragraphs here...\n\n` +
                  `[Câu hỏi]\n` +
                  `Câu 1: What is this passage about?\n` +
                  `A. French history\n` +
                  `B. Science\n` +
                  `C. Capital cities\n` +
                  `D. Sports\n` +
                  `Đáp án đúng: C\n\n` +
                  `Câu 2: Which word is closest in meaning to 'commence'?\n` +
                  `A. stop\n` +
                  `B. begin\n` +
                  `C. delay\n` +
                  `D. continue\n` +
                  `Đáp án đúng: B\n\n` +
                  `[Bài đọc]\n` +
                  `This is the second reading passage text...\n\n` +
                  `[Câu hỏi]\n` +
                  `Câu 1: Question for passage 2?\n` +
                  `A. Options A\n` +
                  `B. Options B\n` +
                  `C. Options C\n` +
                  `D. Options D\n` +
                  `Đáp án đúng: A`
                ) : type === "Nghe chép chính tả" ? (
                  `Mẫu file Nghe chép chính tả (Mỗi dòng là một câu, hỗ trợ nhiều câu):\n` +
                  `Hello, welcome to our class.\n` +
                  `I am learning English today.\n` +
                  `Practicing listening is very important.`
                ) : type === "Luyện phát âm (check phát âm tự động)" ? (
                  `Mẫu file Luyện phát âm (Mỗi dòng là một câu/từ, hỗ trợ nhiều câu):\n` +
                  `Hello, beautiful world!\n` +
                  `English pronunciation\n` +
                  `Thank you very much`
                ) : type === "Sắp xếp từ thành câu" ? (
                  `Mẫu file Sắp xếp từ (Tạo nhiều câu bằng cách viết các cặp dòng liên tiếp):\n` +
                  `Tôi thích học tiếng Anh.\n` +
                  `I like learning English.\n` +
                  `Thời tiết hôm nay rất đẹp.\n` +
                  `The weather is very nice today.\n` +
                  `Tôi là học sinh.\n` +
                  `I am a student.`
                ) : type === "Sắp xếp câu thành đoạn văn" ? (
                  `Mẫu file Sắp xếp câu thành đoạn văn (Mỗi dòng là một câu, hỗ trợ tạo nhiều đoạn bằng nhãn [Đoạn văn]):\n` +
                  `[Đoạn văn]\n` +
                  `First, download the app.\n` +
                  `Second, create your account.\n` +
                  `Finally, start practicing.\n\n` +
                  `[Đoạn văn]\n` +
                  `The first step is parsing the text.\n` +
                  `The second step is displaying the output.\n` +
                  `The final step is getting user approval.`
                ) : type === "Điền từ vào đoạn văn" ? (
                  `Mẫu file Điền từ vào đoạn văn (Đoạn văn chứa các ký hiệu ô trống [1], [2],...):\n` +
                  `[Đoạn văn]\n` +
                  `Yesterday I went to the [1] and bought some [2] to eat.\n\n` +
                  `[Đáp án]\n` +
                  `1. supermarket\n` +
                  `2. apples\n\n` +
                  `* Hỗ trợ tạo nhiều câu/đoạn bằng cách viết nhiều cặp [Đoạn văn] và [Đáp án] nối tiếp nhau.`
                ) : ""}
              </div>
              
              <input
                type="file"
                accept=".txt,.docx"
                onChange={handleFileScan}
                style={{ fontSize: "13px" }}
              />
            </div>
          ) : (
            <div style={{
              background: "#f9f9f9",
              border: "1.5px dashed #ccc",
              borderRadius: "10px",
              padding: "15px",
              marginBottom: "20px",
              textAlign: "left"
            }}>
              <h4 style={{ margin: "0 0 5px 0", color: "#777", fontSize: "15px" }}>Quét câu hỏi từ file</h4>
              <p style={{ margin: 0, fontSize: "12px", color: "#888" }}>
                Dạng bài tập <strong>{dangBai}</strong> yêu cầu thiết lập thủ công các tệp đa phương tiện (ảnh/ghi âm) hoặc đề bài tự luận trực tiếp trên giao diện và không hỗ trợ tính năng quét từ file Word.
              </p>
            </div>
          )) : null}

          <label style={{ fontSize: "13px", fontWeight: 600, color: "#475569", display: "block", marginBottom: "6px" }}>
            Tiêu đề {isPractice ? "bài luyện tập thêm" : "bài tập / bài kiểm tra"} <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            className="exercise-title"
            placeholder={isPractice ? "Tiêu đề bài luyện tập thêm" : "Tiêu đề bài tập / bài kiểm tra"}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (e.target.value.trim()) setTitleError("");
            }}
            style={{ 
              marginTop: 0, 
              border: titleError ? "1.5px solid #ef4444" : "1px solid #cbd5e1",
              outline: "none"
            }}
          />
          {titleError && (
            <p style={{ color: "#c5221f", fontStyle: "italic", fontSize: "12.5px", margin: "4px 0 10px 0", fontWeight: 500 }}>
              {titleError}
            </p>
          )}

          {!isExam && (
            <div style={{ marginBottom: "20px", display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "#475569" }}>
                Bài giảng gắn kèm <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <select
                className="exercise-type"
                style={{ 
                  width: "100%", 
                  marginTop: 0, 
                  marginBottom: 0,
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "14px",
                  color: "#334155",
                  outline: "none",
                  backgroundColor: "#ffffff",
                  boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
                }}
                value={selectedMaBaiHoc}
                onChange={e => setSelectedMaBaiHoc(e.target.value ? Number(e.target.value) : "")}
              >
                <option value="">-- Chọn bài giảng (Bắt buộc) --</option>
                {sessionLectures.map((lec: any) => (
                  <option key={lec.MaBaiHoc} value={lec.MaBaiHoc}>
                    {lec.TieuDe} ({lec.LoaiBaiHoc})
                  </option>
                ))}
              </select>
              {sessionLectures.length === 0 ? (
                <p style={{ color: "#ef4444", fontSize: "12px", margin: "2px 0 0 0", fontStyle: "italic", fontWeight: 500 }}>
                  ⚠️ Buổi học này chưa có bài giảng nào được xuất bản. Vui lòng tạo bài giảng trước khi tạo bài tập!
                </p>
              ) : !selectedMaBaiHoc ? (
                <p style={{ color: "#ef4444", fontSize: "12px", margin: "2px 0 0 0", fontStyle: "italic", fontWeight: 500 }}>
                  * Bắt buộc chọn bài giảng để gắn kèm bài tập này.
                </p>
              ) : null}
            </div>
          )}



        {!isMiniTest && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 15 }}>
            <div>
              {(!isExam || (isExam && openingMode === "scheduled")) && (
                <>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>
                    Hạn nộp bài (Deadline) <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="datetime-local"
                    className="exercise-type"
                    style={{ 
                      width: '100%', 
                      marginTop: 0, 
                      marginBottom: 0,
                      border: deadlineError ? "1.5px solid #ef4444" : "1px solid #cbd5e1"
                    }}
                    value={deadline}
                    onChange={e => {
                      setDeadline(e.target.value);
                      if (e.target.value) setDeadlineError("");
                    }}
                  />
                  {deadlineError && (
                    <p style={{ color: "#c5221f", fontStyle: "italic", fontSize: "12.5px", margin: "4px 0 10px 0", fontWeight: 500 }}>
                      {deadlineError}
                    </p>
                  )}
                </>
              )}
            </div>
            <div style={{ display: "flex", gap: "40px", alignItems: "center", paddingTop: "24px", paddingLeft: "10px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={isFree}
                  onChange={(e) => setIsFree(e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: "#F95800", cursor: "pointer" }}
                />
                <span style={{ fontSize: 14, fontWeight: 500, color: "#334155" }}>Học thử miễn phí</span>
              </label>

              {!isPractice && (
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={isExam}
                    onChange={(e) => setIsExam(e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: "#F95800", cursor: "pointer" }}
                  />
                  <span style={{ fontSize: 14, fontWeight: 500, color: "#334155" }}>Đặt làm bài kiểm tra</span>
                </label>
              )}
            </div>
          </div>
        )}

        {/* ────────────────── EXAM BUILDER SECTION ────────────────── */}
        {(isExam || !isMiniTest) ? (
          <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "24px", alignItems: "start", borderTop: "1px solid #e2e8f0", marginTop: 30, paddingTop: 24 }}>
            {/* LEFT SIDEBAR (STICKY OUTLINE PANEL & CONFIGS) */}
            <div style={{
              position: "sticky",
              top: "20px",
              background: "#ffffff",
              padding: "20px",
              borderRadius: "12px",
              border: "1.5px solid #e2e8f0",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
              maxHeight: "calc(100vh - 120px)",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "20px"
            }}>
              {isExam && (
                <div>
                  <h3 style={{ color: "#000080", fontSize: "16px", fontWeight: 700, margin: "0 0 12px 0", borderBottom: "1.5px solid #f1f5f9", paddingBottom: "8px" }}>Cấu hình đề thi</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>Hình thức mở đề</label>
                      <select
                        className="exercise-type"
                        style={{ width: '100%', marginTop: 0, marginBottom: 0, height: "38px" }}
                        value={openingMode}
                        onChange={e => {
                          const val = e.target.value as any;
                          setOpeningMode(val);
                          if (val === "manual") {
                            setDeadline("");
                          }
                        }}
                      >
                        <option value="scheduled">Tự động mở theo lịch</option>
                        <option value="manual">Đóng/Mở thủ công</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>Thời lượng (phút)</label>
                      <input
                        type="number"
                        className="exercise-type"
                        style={{ width: '100%', marginTop: 0, marginBottom: 0, height: "38px" }}
                        value={examDuration}
                        onChange={e => setExamDuration(Number(e.target.value))}
                      />
                    </div>
                    {openingMode === "scheduled" && (
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>Thời gian bắt đầu</label>
                        <input
                          type="datetime-local"
                          className="exercise-type"
                          style={{ width: '100%', marginTop: 0, marginBottom: 0, height: "38px" }}
                          value={examStartTime}
                          onChange={e => setExamStartTime(e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {isExam && (
                <div>
                  <h3 style={{ color: "#000080", fontSize: "16px", fontWeight: 700, margin: "0 0 12px 0", borderBottom: "1.5px solid #f1f5f9", paddingBottom: "8px" }}>Cấu trúc đề mẫu</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <button
                      type="button"
                      onClick={() => applyPreset("toeic2")}
                      style={{
                        padding: "8px 12px",
                        fontSize: "12px",
                        background: "#f8fafc",
                        border: "1.5px solid #cbd5e1",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "600",
                        color: "#475569",
                        textAlign: "left",
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#F95800";
                        e.currentTarget.style.color = "#F95800";
                        e.currentTarget.style.background = "#fff4ec";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#cbd5e1";
                        e.currentTarget.style.color = "#475569";
                        e.currentTarget.style.background = "#f8fafc";
                      }}
                    >
                      TOEIC 2 Kỹ năng
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset("toeic4")}
                      style={{
                        padding: "8px 12px",
                        fontSize: "12px",
                        background: "#f8fafc",
                        border: "1.5px solid #cbd5e1",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "600",
                        color: "#475569",
                        textAlign: "left",
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#F95800";
                        e.currentTarget.style.color = "#F95800";
                        e.currentTarget.style.background = "#fff4ec";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#cbd5e1";
                        e.currentTarget.style.color = "#475569";
                        e.currentTarget.style.background = "#f8fafc";
                      }}
                    >
                      TOEIC 4 Kỹ năng
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset("vstep4")}
                      style={{
                        padding: "8px 12px",
                        fontSize: "12px",
                        background: "#f8fafc",
                        border: "1.5px solid #cbd5e1",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "600",
                        color: "#475569",
                        textAlign: "left",
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#F95800";
                        e.currentTarget.style.color = "#F95800";
                        e.currentTarget.style.background = "#fff4ec";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#cbd5e1";
                        e.currentTarget.style.color = "#475569";
                        e.currentTarget.style.background = "#f8fafc";
                      }}
                    >
                      VSTEP 4 Kỹ năng
                    </button>
                  </div>
                </div>
              )}

              <div>
                <h3 style={{ color: "#000080", fontSize: "16px", fontWeight: 700, margin: "0 0 12px 0", borderBottom: "1.5px solid #f1f5f9", paddingBottom: "8px" }}>
                  {isExam ? "Sơ đồ đề thi" : (isPractice ? "Sơ đồ bài luyện tập" : "Sơ đồ bài tập")}
                </h3>
                
                <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                  <button
                    type="button"
                    onClick={expandAllSections}
                    style={{ flex: 1, padding: "5px 8px", fontSize: "11px", background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "6px", cursor: "pointer", fontWeight: "600", color: "#475569" }}
                  >
                    Mở tất cả
                  </button>
                  <button
                    type="button"
                    onClick={collapseAllSections}
                    style={{ flex: 1, padding: "5px 8px", fontSize: "11px", background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "6px", cursor: "pointer", fontWeight: "600", color: "#475569" }}
                  >
                    Thu tất cả
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "250px", overflowY: "auto", paddingRight: "4px" }}>
                  {examSections.map((sec, idx) => {
                    const isCollapsed = !!collapsedSections[idx];
                    const count = sec.questions?.length || 0;
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          const el = document.getElementById(`exam-section-card-${idx}`);
                          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                        }}
                        style={{
                          padding: "8px 12px",
                          background: isCollapsed ? "#f8fafc" : "#fff3e0",
                          border: `1.5px solid ${isCollapsed ? "#e2e8f0" : "#F95800"}`,
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontSize: "12px",
                          fontWeight: "600",
                          color: isCollapsed ? "#475569" : "#F95800",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          transition: "all 0.2s ease"
                        }}
                      >
                        <span
                          style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "150px" }}
                          title={stripHtml(cleanSectionTitle(sec.title || `Phần ${idx + 1}`))}
                        >
                          Phần {idx + 1}: {stripHtml(cleanSectionTitle(sec.title || `Phần ${idx + 1}`))}
                        </span>
                        <span style={{ fontSize: "10px", background: isCollapsed ? "#e2e8f0" : "#F95800", color: isCollapsed ? "#475569" : "#fff", padding: "2px 6px", borderRadius: "10px" }}>
                          {sec.type === "Viết đoạn văn ngắn" ? "Tự luận" : `${count} nhóm`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <button
                  type="button"
                  onClick={addExamSection}
                  style={{
                    background: "#000080",
                    color: "#fff",
                    border: "none",
                    padding: "10px",
                    borderRadius: "8px",
                    fontWeight: "700",
                    cursor: "pointer",
                    fontSize: "13px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px"
                  }}
                >
                  {isExam ? "Thêm Phần Bài Thi" : "Thêm phần mới"}
                </button>
              </div>
            </div>

            {/* RIGHT EDITOR PANEL (SECTIONS ACCORDION) */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%" }}>
              {examSections.map((sec, secIdx) => {
                const isSecCollapsed = !!collapsedSections[secIdx];
                return (
                  <div
                    key={secIdx}
                    id={`exam-section-card-${secIdx}`}
                    className="question-block"
                    style={{
                      borderLeft: "5px solid #F95800",
                      position: "relative",
                      margin: 0,
                      background: "#ffffff",
                      borderRadius: "12px",
                      boxShadow: "0 1px 3px 0 rgba(0,0,0,0.05), 0 1px 2px 0 rgba(0,0,0,0.03)",
                      padding: "20px",
                      border: "1px solid #e2e8f0",
                      borderLeftWidth: "5px",
                      borderLeftColor: "#F95800"
                    }}
                  >
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderBottom: isSecCollapsed ? "none" : "1.5px solid #f1f5f9",
                      paddingBottom: isSecCollapsed ? "0" : "14px",
                      marginBottom: isSecCollapsed ? "0" : "16px",
                      cursor: "pointer"
                    }}
                    onClick={() => toggleSectionCollapse(secIdx)}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, minWidth: 0, marginRight: "12px" }}>
                        <span style={{ fontSize: "16px", transform: isSecCollapsed ? "rotate(-90deg)" : "rotate(0deg)", transition: "transform 0.2s ease", flexShrink: 0 }}>▼</span>
                        <h4
                          style={{ fontSize: 16, margin: 0, fontWeight: "700", color: "#000080", wordBreak: "break-word", flex: 1, minWidth: 0 }}
                          dangerouslySetInnerHTML={{
                            __html: `Phần ${secIdx + 1}: ${cleanSectionTitle(sec.title || `Phần ${secIdx + 1}`)}`
                          }}
                        />
                        <span style={{ fontSize: "11px", color: "#666", background: "#f1f5f9", padding: "2px 8px", borderRadius: "12px", fontWeight: "600", flexShrink: 0 }}>
                          {sec.type === "Viết đoạn văn ngắn" ? "Tự luận" : `${sec.questions?.length || 0} câu hỏi/nhóm`}
                        </span>
                      </div>
                      
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }} onClick={e => e.stopPropagation()}>
                        <button
                          type="button"
                          className="remove-btn"
                          style={{ margin: 0, background: "#fff", border: "1px solid #fee2e2", color: "#ef4444", padding: "4px 8px", borderRadius: "6px" }}
                          onClick={() => {
                            setConfirmDialog({
                              show: true,
                              title: "Xác nhận xóa phần thi",
                              message: "Bạn có chắc chắn muốn xóa phần thi này không?",
                              onConfirm: () => {
                                removeExamSection(secIdx);
                              }
                            });
                          }}
                        >
                          Xóa phần
                        </button>
                      </div>
                    </div>

                    {!isSecCollapsed && (
                      <div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 15, marginBottom: 15 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#666" }}>Tiêu đề phần</label>
                    <RichTextarea
                      className="exercise-content"
                      style={{ marginTop: 4, width: "100%" }}
                      value={sec.title}
                      onChange={val => {
                        const copy = [...examSections];
                        copy[secIdx].title = val;
                        setExamSections(copy);
                      }}
                      rows={2}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#666" }}>Dạng kỹ năng</label>
                    <select
                      className="exercise-type"
                      style={{ width: '100%', marginTop: 4, marginBottom: 0 }}
                      value={sec.type}
                      onChange={e => {
                        const val = e.target.value;
                        const copy = [...examSections];
                        
                        // Check if another section already has this type
                        const existingIdx = copy.findIndex((s, i) => s.type === val && i !== secIdx);
                        if (existingIdx !== -1) {
                          const targetSection = copy[existingIdx];
                          const sourceSection = copy[secIdx];
                          
                          // Merge questions
                          if (sourceSection.questions && sourceSection.questions.length > 0) {
                            if (!targetSection.questions) targetSection.questions = [];
                            targetSection.questions = [...targetSection.questions, ...sourceSection.questions];
                          }
                          
                          // Merge content/prompt if applicable
                          if (sourceSection.content && !targetSection.content) {
                            targetSection.content = sourceSection.content;
                          }
                          
                          // Remove the current section from the list
                          const updatedSections = copy.filter((_, i) => i !== secIdx);
                          
                          // Re-index titles for standard titles
                          updatedSections.forEach((s, idx) => {
                            if (s.title.startsWith("Phần ")) {
                              s.title = `Phần ${idx + 1}`;
                            }
                          });
                          
                          setExamSections(updatedSections);
                          alert(`Dạng bài này đã tồn tại ở Phần ${existingIdx + 1}. Hai phần đã được gộp lại với nhau.`);
                          return;
                        }

                        // Otherwise, update type normally
                        copy[secIdx].type = val;
                        // Reset properties based on type
                        if (val === "Nói theo chủ đề (ghi âm nộp GV)") {
                          copy[secIdx].questions = [{ prompt: "", imageUrl: "", audioUrl: "", question: "", answers: [], correct: "" }];
                          copy[secIdx].content = "";
                        } else if (val === "Viết đoạn văn ngắn") {
                          copy[secIdx].questions = [];
                          copy[secIdx].content = "";
                        } else {
                          copy[secIdx].questions = [{
                            question: "",
                            answers: ["", "", "", ""],
                            correct: "A",
                            explanation: "",
                            audioUrl: "",
                            imageUrl: "",
                            text: "",
                            prompt: "",
                            vocabPairs: [{ word: "", meaning: "" }],
                            fillInAnswers: [],
                            sentences: [""]
                          }];
                          copy[secIdx].content = "";
                        }
                        setExamSections(copy);
                      }}
                    >
                      <option value="Nghe audio trắc nghiệm">Nghe: Nghe audio trắc nghiệm</option>
                      <option value="Hình ảnh chọn đáp án">Nghe: Hình ảnh chọn đáp án</option>
                      <option value="Nghe chép chính tả">Nghe: Nghe chép chính tả</option>
                      <option value="Điền từ vào đoạn văn">Nghe: Điền từ vào đoạn văn</option>
                      <option value="Luyện phát âm (check phát âm tự động)">Nói: Luyện phát âm (tự động check)</option>
                      <option value="Nói theo chủ đề (ghi âm nộp GV)">Nói: Nói theo chủ đề (ghi âm nộp GV)</option>
                      <option value="Trắc nghiệm đọc hiểu (chia đôi màn hình)">Đọc: Trắc nghiệm đọc hiểu (chia đôi màn hình)</option>
                      <option value="Nối từ">Đọc: Nối từ</option>
                      <option value="Sắp xếp từ thành câu">Viết: Sắp xếp từ thành câu</option>
                      <option value="Trắc nghiệm">Viết: Trắc nghiệm</option>
                      <option value="Tìm lỗi sai">Viết: Tìm lỗi sai</option>
                      <option value="Viết đoạn văn ngắn">Viết: Viết đoạn văn ngắn</option>
                      <option value="Sắp xếp câu thành đoạn văn">Viết: Sắp xếp câu thành đoạn văn</option>
                    </select>
                  </div>
                </div>

                {/* NÚT QUÉT FILE CÂU HỎI CHO PHẦN THI */}
                {["Tổng hợp", "Nghe audio trắc nghiệm", "Trắc nghiệm", "Tìm lỗi sai", "Nối từ", "Trắc nghiệm đọc hiểu (chia đôi màn hình)", "Nghe chép chính tả", "Luyện phát âm (check phát âm tự động)", "Sắp xếp từ thành câu", "Sắp xếp câu thành đoạn văn", "Điền từ vào đoạn văn"].includes(sec.type) ? (
                  <div style={{
                    background: "#f8fafc",
                    border: "1px dashed #cbd5e1",
                    borderRadius: "12px",
                    padding: "18px",
                    margin: "12px 0 24px 0",
                    textAlign: "left"
                  }}>
                    <h5 style={{ margin: "0 0 6px 0", color: "#000080", fontSize: "14px", fontWeight: 700 }}>Quét câu hỏi cho Phần {secIdx + 1} (.docx / .txt)</h5>
                    <p style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#475569" }}>
                      * Quét và tự động nhập nhanh toàn bộ câu hỏi cho phần thi này. Mẫu định dạng file của dạng <strong>{sec.type}</strong>:
                    </p>
                    <div style={{
                      background: "#ffffff",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      fontSize: "11px",
                      fontFamily: "Courier New, monospace",
                      whiteSpace: "pre-wrap",
                      color: "#334155",
                      marginBottom: "12px",
                      border: "1px solid #e2e8f0",
                      borderLeft: "4px solid #000080",
                      lineHeight: "1.5"
                    }}>
                      {sec.type === "Tổng hợp" || sec.type === "Nghe audio trắc nghiệm" ? (
                        `Mẫu file Trắc nghiệm nhóm / Nghe Audio MCQ (Hỗ trợ chia theo nhóm/ngữ cảnh):\n` +
                        `[Nhóm 1]\n` +
                        `Ngữ cảnh: Dialogue between a student and a teacher. (tùy chọn)\n` +
                        `Câu 1: What does the student need help with?\n` +
                        `A. Homework\n` +
                        `B. Registration\n` +
                        `C. Examination\n` +
                        `D. Dormitory\n` +
                        `Đáp án đúng: B\n` +
                        `Giải thích: Học viên cần giúp đăng ký môn học (tùy chọn)\n\n` +
                        `Câu 2: When is the deadline?\n` +
                        `A. Today\n` +
                        `B. Tomorrow\n` +
                        `C. Friday\n` +
                        `D. Next week\n` +
                        `Đáp án đúng: C\n` +
                        `Giải thích: Hạn cuối nộp bài là vào thứ 6 (tùy chọn)\n\n` +
                        `[Nhóm 2]\n` +
                        `Ngữ cảnh: Announcement in the railway station. (tùy chọn)\n` +
                        `Câu 3: Why is the train delayed?\n` +
                        `A. Bad weather\n` +
                        `B. Technical issues\n` +
                        `C. Late arrival\n` +
                        `D. Track maintenance\n` +
                        `Đáp án đúng: B\n` +
                        `Giải thích: Tàu hoãn do sự cố kỹ thuật đường ray (tùy chọn)`
                      ) : sec.type === "Tìm lỗi sai" ? (
                        `Mẫu file Tìm lỗi sai:\n` +
                        `Lưu ý: Dùng 2 khoảng trắng liên tiếp (dấu cách kép) để phân tách các đoạn từ trong câu văn gốc.\n\n` +
                        `Câu 1: By the time  you  will arrive  I'll have already left.\n` +
                        `Từ sai: will arrive\n` +
                        `Sửa lại: arrive\n` +
                        `Giải thích: Thì tương lai đơn không dùng sau liên từ chỉ thời gian "by the time" (tùy chọn)\n\n` +
                        `Câu 2: Neither  of the boys  are  present.\n` +
                        `Từ sai: are\n` +
                        `Sửa lại: is\n` +
                        `Giải thích: Chủ ngữ "Neither of..." đi với động từ số ít (tùy chọn)`
                      ) : sec.type === "Trắc nghiệm" ? (
                        `Mẫu file Trắc nghiệm MCQ:\n` +
                        `Câu 1: She _______ English for 5 years.\n` +
                        `A. has studied\n` +
                        `B. studies\n` +
                        `C. studied\n` +
                        `D. is studying\n` +
                        `Đáp án đúng: A\n` +
                        `Giải thích: Hành động bắt đầu trong quá khứ kéo dài đến hiện tại (tùy chọn)`
                      ) : sec.type === "Nối từ" ? (
                        `Mẫu file Bài tập từ vựng nối từ:\n` +
                        `Mỗi dòng là một cặp từ cách nhau bởi dấu gạch ngang (1 bên từ tiếng Anh - 1 bên diễn giải nghĩa cũng bằng tiếng Anh). Có thể thêm dòng giải thích ở cuối cùng. Ví dụ:\n` +
                        `cat - a small domesticated carnivorous mammal with soft fur\n` +
                        `dog - a common domesticated carnivorous mammal that typically has a long snout\n` +
                        `apple - a round fruit with red, green, or yellow skin and crisp white flesh\n` +
                        `Giải thích: Luyện tập từ vựng về động vật và trái cây (tùy chọn)`
                      ) : sec.type === "Trắc nghiệm đọc hiểu (chia đôi màn hình)" ? (
                        `Mẫu file Đọc chia đôi màn hình (Có thể tạo nhiều bài đọc liên tiếp):\n` +
                        `[Bài đọc]\n` +
                        `This is the reading passage text. You can write paragraphs here...\n\n` +
                        `[Câu hỏi]\n` +
                        `Câu 1: What is this passage about?\n` +
                        `A. French history\n` +
                        `B. Science\n` +
                        `C. Capital cities\n` +
                        `D. Sports\n` +
                        `Đáp án đúng: C\n` +
                        `Giải thích: Đoạn văn chủ yếu nói về các thành phố lớn (tùy chọn)\n\n` +
                        `[Bài đọc]\n` +
                        `This is the second reading passage text...\n\n` +
                        `[Câu hỏi]\n` +
                        `Câu 1: Question for passage 2?\n` +
                        `A. Options A\n` +
                        `B. Options B\n` +
                        `C. Options C\n` +
                        `D. Options D\n` +
                        `Đáp án đúng: A\n` +
                        `Giải thích: Đoạn 2 nói về phát kiến khoa học (tùy chọn)`
                      ) : sec.type === "Nghe chép chính tả" ? (
                        `Mẫu file Nghe chép chính tả:\n` +
                        `Mỗi dòng trong file là một câu trả lời chính xác, theo sau có thể là 1 dòng giải thích. Ví dụ:\n` +
                        `Hello, welcome to our class.\n` +
                        `Giải thích: Chào mừng học viên đến lớp học (tùy chọn)\n` +
                        `I am learning English today.\n` +
                        `Giải thích: Luyện tập câu giao tiếp cơ bản (tùy chọn)`
                      ) : sec.type === "Luyện phát âm (check phát âm tự động)" ? (
                        `Mẫu file Luyện phát âm:\n` +
                        `Mỗi dòng là một từ hoặc câu mẫu, theo sau có thể là 1 dòng hướng dẫn phát âm. Ví dụ:\n` +
                        `Hello, beautiful world!\n` +
                        `Giải thích: Chú ý phát âm chuẩn âm đầu và trọng âm câu (tùy chọn)\n` +
                        `English pronunciation`
                      ) : sec.type === "Sắp xếp từ thành câu" ? (
                        `Mẫu file Sắp xếp từ:\n` +
                        `Viết tiếng Việt ở dòng lẻ, câu tiếng Anh ở dòng chẵn, theo sau có thể là 1 dòng giải thích. Ví dụ:\n` +
                        `Tôi thích học tiếng Anh.\n` +
                        `I like learning English.\n` +
                        `Giải thích: Like đi kèm danh động từ V-ing (tùy chọn)\n` +
                        `Thời tiết hôm nay rất đẹp.\n` +
                        `The weather is very nice today.`
                      ) : sec.type === "Sắp xếp câu thành đoạn văn" ? (
                        `Mẫu file Sắp xếp câu thành đoạn văn (Hỗ trợ nhiều đoạn bằng nhãn [Đoạn văn]):\n` +
                        `[Đoạn văn]\n` +
                        `First, download the app.\n` +
                        `Second, create your account.\n` +
                        `Finally, start practicing.\n` +
                        `Giải thích: Các bước bắt đầu sử dụng phần mềm học tiếng Anh (tùy chọn)\n\n` +
                        `[Đoạn văn]\n` +
                        `The first step is parsing the text.\n` +
                        `The second step is displaying the output.\n` +
                        `The final step is getting user approval.`
                      ) : sec.type === "Điền từ vào đoạn văn" ? (
                        `Mẫu file Điền từ vào đoạn văn:\n` +
                        `[Đoạn văn]\n` +
                        `Yesterday I went to the [1] and bought some [2] to eat.\n\n` +
                        `[Đáp án]\n` +
                        `1. supermarket\n` +
                        `2. apples\n` +
                        `Giải thích: Trạng ngữ chỉ thời gian quá khứ đơn (tùy chọn)\n\n` +
                        `* Hỗ trợ tạo nhiều câu/đoạn bằng cách viết nhiều cặp [Đoạn văn] và [Đáp án] nối tiếp nhau.`
                      ) : ""}
                    </div>
                    <input
                      type="file"
                      accept=".txt,.docx"
                      onChange={e => handleFileScan(e, secIdx)}
                      style={{ fontSize: "12px" }}
                    />
                  </div>
                ) : (
                  <div style={{
                    background: "#f9f9f9",
                    border: "1.5px dashed #ccc",
                    borderRadius: "10px",
                    padding: "10px 15px",
                    margin: "10px 0 20px 0",
                    textAlign: "left"
                  }}>
                    <h5 style={{ margin: "0 0 5px 0", color: "#777", fontSize: "14px" }}>Quét câu hỏi cho Phần {secIdx + 1}</h5>
                    <p style={{ margin: 0, fontSize: "11px", color: "#888" }}>
                      Dạng phần thi <strong>{sec.type}</strong> không hỗ trợ quét từ file Word. Vui lòng thiết lập thủ công.
                    </p>
                  </div>
                )}

                {/* Section Specific Inputs */}
                {sec.type === "Nghe audio trắc nghiệm" && (
                  <div>
                    {sec.type === "Nghe audio trắc nghiệm" && (
                      <div style={{ marginBottom: 15 }}>
                        <label style={{ fontSize: 12, fontWeight: 600, color: "#666" }}>File nghe chung cho phần này (Tùy chọn)</label>
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={async e => {
                            if (e.target.files && e.target.files[0]) {
                              await handleExamSectionUpload(secIdx, "audioUrl", e.target.files[0]);
                            }
                          }}
                          style={{ display: "block", marginTop: 5, marginBottom: 15 }}
                        />
                        {sec.audioUrl && <p style={{ color: "green", fontSize: 13 }}>✓ Đã tải lên: {sec.audioUrl}</p>}
                      </div>
                    )}

                    {sec.questions?.map((q, qIdx) => (
                      <QuestionCard
                        key={qIdx}
                        secIdx={secIdx}
                        qIdx={qIdx}
                        sec={sec}
                        q={q}
                        onRemove={() => removeQuestionFromSection(secIdx, qIdx)}
                        isCollapsed={!!collapsedQuestions[`${secIdx}_${qIdx}`]}
                        onToggle={() => toggleQuestionCollapse(secIdx, qIdx)}
                      >
                        {sec.type === "Nghe audio trắc nghiệm" && (
                           <div style={{ marginBottom: 12 }}>
                            <label style={{ fontSize: 11, fontWeight: 600, color: "#888" }}>Audio bài nghe cho nhóm này (Tùy chọn)</label>
                            <input
                              type="file"
                              accept="audio/*"
                              onChange={async e => {
                                if (e.target.files && e.target.files[0]) {
                                  await handleExamQuestionFileUpload(secIdx, qIdx, "audioUrl", e.target.files[0]);
                                }
                              }}
                              style={{ display: "block", marginTop: 5 }}
                            />
                            {q.audioUrl && <p style={{ color: "green", fontSize: 11 }}>✓ Đã tải: {q.audioUrl}</p>}
                          </div>
                        )}

                        {sec.type === "Nghe audio trắc nghiệm" && (sec.title.includes("Part 3") || sec.title.includes("Part 4")) && (
                          <div style={{ marginBottom: 12 }}>
                            <label style={{ fontSize: 11, fontWeight: 600, color: "#888" }}>Hình ảnh cho nhóm này (Tùy chọn)</label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={async e => {
                                if (e.target.files && e.target.files[0]) {
                                  await handleExamQuestionFileUpload(secIdx, qIdx, "imageUrl", e.target.files[0]);
                                }
                              }}
                              style={{ display: "block", marginTop: 5 }}
                            />
                            {q.imageUrl && (
                              <div style={{ marginTop: 5 }}>
                                <p style={{ color: "green", fontSize: 11, margin: 0 }}>✓ Đã tải hình ảnh: {q.imageUrl}</p>
                                <img src={q.imageUrl} alt="Preview" style={{ maxHeight: 80, marginTop: 5, borderRadius: 4 }} />
                              </div>
                            )}
                          </div>
                        )}

                        <div style={{ marginBottom: 12 }}>
                          <label style={{ fontSize: 11, fontWeight: 600, color: "#888" }}>Ngữ cảnh / Đề dẫn chung cho nhóm (Tùy chọn)</label>
                          <RichTextarea
                            className="exercise-content"
                            placeholder="Nhập phần dẫn hoặc ngữ cảnh chung..."
                            value={q.prompt || ""}
                            onChange={val => updateQuestionInSection(secIdx, qIdx, "prompt", val)}
                            rows={2}
                          />
                        </div>

                        <div style={{ marginTop: 10 }}>
                          <p style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>Các câu hỏi trắc nghiệm phụ:</p>
                          {(q.subQuestions || []).map((sub: any, subIdx: number) => (
                            <div key={subIdx} style={{ background: "#ffffff", padding: 12, border: "1px solid #e2e8f0", borderLeft: "3px solid #000080", borderRadius: 8, marginTop: 8, boxShadow: "0 1px 2px rgba(0,0,0,0.01)" }}>
                              <div className="question-block-header">
                                <h6 style={{ margin: 0, fontSize: 12, color: "#000080" }}>Câu hỏi phụ {subIdx + 1}</h6>
                                {(q.subQuestions || []).length > 1 && (
                                  <button
                                    type="button"
                                    className="remove-btn"
                                    style={{ padding: "2px 6px", fontSize: 11 }}
                                    onClick={() => removeSubQuestionFromSection(secIdx, qIdx, subIdx)}
                                  >Xóa</button>
                                )}
                              </div>
                              <input
                                type="text"
                                placeholder="Nhập câu hỏi"
                                className="exercise-content"
                                style={{ marginTop: 6 }}
                                value={sub.question || ""}
                                onChange={e => updateSubQuestionFieldInSection(secIdx, qIdx, subIdx, "question", e.target.value)}
                              />
                              {["A", "B", "C", "D"].map((lbl, aIdx) => (
                                <input
                                  key={lbl}
                                  type="text"
                                  placeholder={`Lựa chọn ${lbl}`}
                                  className="exercise-content"
                                  style={{ margin: "4px 0" }}
                                  value={sub.answers[aIdx] || ""}
                                  onChange={e => updateSubQuestionAnswerInSection(secIdx, qIdx, subIdx, aIdx, e.target.value)}
                                />
                              ))}
                              <select
                                className="exercise-type"
                                style={{ width: "100%", marginTop: 5 }}
                                value={sub.correct || "A"}
                                onChange={e => updateSubQuestionFieldInSection(secIdx, qIdx, subIdx, "correct", e.target.value)}
                              >
                                <option value="A">Đáp án đúng: A</option>
                                <option value="B">Đáp án đúng: B</option>
                                <option value="C">Đáp án đúng: C</option>
                                <option value="D">Đáp án đúng: D</option>
                              </select>
                              <input
                                type="text"
                                className="exercise-content"
                                placeholder="Giải thích đáp án (tùy chọn)"
                                value={sub.explanation || ""}
                                onChange={e => updateSubQuestionFieldInSection(secIdx, qIdx, subIdx, "explanation", e.target.value)}
                                style={{ marginTop: 6 }}
                              />
                            </div>
                          ))}
                          <button
                            type="button"
                            className="add-content"
                            style={{ padding: "4px 10px", marginTop: 8, fontSize: "12px" }}
                            onClick={() => addSubQuestionToSection(secIdx, qIdx)}
                          >+ Thêm câu hỏi phụ</button>
                        </div>
                      </QuestionCard>
                    ))}
                    <button type="button" className="add-content" style={{ marginTop: 15, padding: 8 }} onClick={() => addQuestionToSection(secIdx)}>+ Thêm nhóm câu hỏi</button>
                  </div>
                )}

                {/* ── EXAM TENSE MCQ (writing-tense-mcq / Trắc nghiệm) ── */}
                {sec.type === "Trắc nghiệm" && (
                  <div>
                    {sec.questions?.map((q, qIdx) => (
                      <QuestionCard
                        key={qIdx}
                        secIdx={secIdx}
                        qIdx={qIdx}
                        sec={sec}
                        q={q}
                        onRemove={() => removeQuestionFromSection(secIdx, qIdx)}
                        isCollapsed={!!collapsedQuestions[`${secIdx}_${qIdx}`]}
                        onToggle={() => toggleQuestionCollapse(secIdx, qIdx)}
                      >
                        <label style={{ fontSize: 12, fontWeight: 600, color: "#666" }}>Câu hỏi</label>
                        <input
                          type="text"
                          className="exercise-content"
                          placeholder="Nhập câu hỏi..."
                          value={q.question || ""}
                          onChange={e => updateQuestionInSection(secIdx, qIdx, "question", e.target.value)}
                        />
                        {["A", "B", "C", "D"].map((lbl, aIdx) => (
                          <div key={lbl} style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 5 }}>
                            <span style={{ fontWeight: "bold", width: 20 }}>{lbl}.</span>
                            <input
                              type="text"
                              placeholder={`Lựa chọn ${lbl}`}
                              className="exercise-content"
                              style={{ margin: 0 }}
                              value={(q.answers || [])[aIdx] || ""}
                              onChange={e => {
                                const copyAnswers = [...(q.answers || [])];
                                copyAnswers[aIdx] = e.target.value;
                                updateQuestionInSection(secIdx, qIdx, "answers", copyAnswers);
                              }}
                            />
                          </div>
                        ))}
                        <label style={{ fontSize: 12, fontWeight: 600, color: "#666", display: "block", marginTop: 10 }}>Đáp án đúng</label>
                        <select
                          className="exercise-type"
                          style={{ width: "100%", marginTop: 4 }}
                          value={q.correct || "A"}
                          onChange={e => updateQuestionInSection(secIdx, qIdx, "correct", e.target.value)}
                        >
                          <option value="A">Đáp án đúng: A</option>
                          <option value="B">Đáp án đúng: B</option>
                          <option value="C">Đáp án đúng: C</option>
                          <option value="D">Đáp án đúng: D</option>
                        </select>
                        <label style={{ fontSize: 12, fontWeight: 600, color: "#666", display: "block", marginTop: 10 }}>Giải thích đáp án (tùy chọn)</label>
                        <input
                          type="text"
                          className="exercise-content"
                          placeholder="Giải thích tại sao chọn đáp án này..."
                          value={q.explanation || ""}
                          onChange={e => updateQuestionInSection(secIdx, qIdx, "explanation", e.target.value)}
                        />
                      </QuestionCard>
                    ))}
                    <button type="button" className="add-content" style={{ marginTop: 10, padding: 8 }} onClick={() => addQuestionToSection(secIdx)}>+ Thêm câu hỏi trắc nghiệm</button>
                  </div>
                )}

                {/* ── EXAM FIND AND CORRECT MISTAKES (writing-find-mistakes / Tìm lỗi sai) ── */}
                {sec.type === "Tìm lỗi sai" && (
                  <div>
                    {sec.questions?.map((q, qIdx) => (
                      <QuestionCard
                        key={qIdx}
                        secIdx={secIdx}
                        qIdx={qIdx}
                        sec={sec}
                        q={q}
                        onRemove={() => removeQuestionFromSection(secIdx, qIdx)}
                        isCollapsed={!!collapsedQuestions[`${secIdx}_${qIdx}`]}
                        onToggle={() => toggleQuestionCollapse(secIdx, qIdx)}
                      >
                        <label style={{ fontSize: 12, fontWeight: 600, color: "#666" }}>Câu văn gốc (Dùng dấu cách kép để phân đoạn câu)</label>
                        <textarea
                          className="exercise-content"
                          style={{ width: "100%", padding: "10px", minHeight: "60px", fontFamily: "inherit" }}
                          placeholder="VD: By the time  you  will arrive  I'll have already left."
                          value={q.question || ""}
                          onChange={e => {
                            const val = e.target.value;
                            updateQuestionInSection(secIdx, qIdx, "question", val);
                            const segments = val.split("  ").map((s: string) => s.trim()).filter(Boolean);
                            updateQuestionInSection(secIdx, qIdx, "answers", segments);
                          }}
                        />

                        <div style={{ marginTop: 10, padding: 12, background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                          <label style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", display: "block", marginBottom: 6 }}>
                            Xem trước và chọn cụm từ chứa lỗi sai:
                          </label>
                          {(() => {
                            const segments = (q.question || "").split("  ").map((s: string) => s.trim()).filter(Boolean);
                            if (segments.length > 0) {
                              return (
                                <div className="find-mistake-sentence-preview" style={{ fontSize: "16px", lineHeight: "2.2", color: "#1e293b", background: "#ffffff", padding: "16px", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
                                  {segments.map((text: string, sIdx: number) => {
                                    const isSelected = q.correct === text;
                                    return (
                                      <span
                                        key={sIdx}
                                        className={`mistake-segment ${isSelected ? "selected" : ""}`}
                                        onClick={() => {
                                          updateQuestionInSection(secIdx, qIdx, "correct", text);
                                        }}
                                      >
                                        {text}
                                      </span>
                                    );
                                  })}
                                </div>
                              );
                            }
                            return (
                              <p style={{ fontStyle: "italic", fontSize: 13, color: "#64748b", margin: 0 }}>
                                (Nhập câu văn ở trên để xem trước phân đoạn)
                              </p>
                            );
                          })()}
                        </div>

                        <div style={{ marginTop: 10 }}>
                          <label style={{ fontSize: 12, fontWeight: 600, color: "#666" }}>Cụm từ sửa lại cho đúng <span style={{ color: "red" }}>*</span></label>
                          <input
                            type="text"
                            className="exercise-content"
                            placeholder="VD: arrive"
                            value={q.correctSentence || ""}
                            onChange={e => updateQuestionInSection(secIdx, qIdx, "correctSentence", e.target.value)}
                          />
                        </div>

                        <div style={{ marginTop: 10 }}>
                          <label style={{ fontSize: 12, fontWeight: 600, color: "#666" }}>Giải thích đáp án (tùy chọn)</label>
                          <textarea
                            className="exercise-content auto-resize-textarea"
                            style={{ width: "100%", padding: "10px", minHeight: "44px", fontFamily: "inherit", resize: "none", overflowY: "hidden" }}
                            placeholder="Giải thích tại sao cụm từ này sai và cách dùng đúng..."
                            value={q.explanation || ""}
                            onChange={e => {
                              const val = e.target.value;
                              updateQuestionInSection(secIdx, qIdx, "explanation", val);
                              e.target.style.height = "auto";
                              e.target.style.height = e.target.scrollHeight + "px";
                            }}
                            rows={1}
                          />
                        </div>
                      </QuestionCard>
                    ))}
                    <button type="button" className="add-content" style={{ marginTop: 10, padding: 8 }} onClick={() => addQuestionToSection(secIdx)}>+ Thêm câu hỏi tìm lỗi sai</button>
                  </div>
                )}

                {/* ── TIMED EXAM VOCABULARY MATCHING (reading-vocab-mcq) ── */}
                {sec.type === "Nối từ" && (
                  <div>
                    {sec.questions?.map((q, qIdx) => (
                      <QuestionCard
                        key={qIdx}
                        secIdx={secIdx}
                        qIdx={qIdx}
                        sec={sec}
                        q={q}
                        onRemove={() => removeQuestionFromSection(secIdx, qIdx)}
                        isCollapsed={!!collapsedQuestions[`${secIdx}_${qIdx}`]}
                        onToggle={() => toggleQuestionCollapse(secIdx, qIdx)}
                      >
                        <label style={{ fontSize: 12, fontWeight: 600, color: "#666", display: "block", marginBottom: 5 }}>
                          Danh sách các cặp từ nối (Tiếng Anh - Diễn giải tiếng Anh)
                        </label>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
                          {(q.vocabPairs || [{ word: "", meaning: "" }]).map((pair: any, pIdx: number) => (
                            <div key={pIdx} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                              <input
                                type="text"
                                placeholder="Từ tiếng Anh (Ví dụ: hello)"
                                className="exercise-content"
                                style={{ margin: 0, flex: 1 }}
                                value={pair.word}
                                onChange={e => {
                                  const copy = [...examSections];
                                  const targetQ = copy[secIdx].questions?.[qIdx];
                                  if (targetQ) {
                                    const copyPairs = [...(targetQ.vocabPairs || [])];
                                    if (!copyPairs[pIdx]) copyPairs[pIdx] = { word: "", meaning: "" };
                                    copyPairs[pIdx].word = e.target.value;
                                    targetQ.vocabPairs = copyPairs;
                                    setExamSections(copy);
                                  }
                                }}
                              />
                              <span style={{ fontWeight: "bold", color: "#666" }}>-</span>
                              <input
                                type="text"
                                placeholder="Diễn giải tiếng Anh (Ví dụ: a greeting word)"
                                className="exercise-content"
                                style={{ margin: 0, flex: 1 }}
                                value={pair.meaning}
                                onChange={e => {
                                  const copy = [...examSections];
                                  const targetQ = copy[secIdx].questions?.[qIdx];
                                  if (targetQ) {
                                    const copyPairs = [...(targetQ.vocabPairs || [])];
                                    if (!copyPairs[pIdx]) copyPairs[pIdx] = { word: "", meaning: "" };
                                    copyPairs[pIdx].meaning = e.target.value;
                                    targetQ.vocabPairs = copyPairs;
                                    setExamSections(copy);
                                  }
                                }}
                              />
                              {(q.vocabPairs || []).length > 1 && (
                                <button
                                  type="button"
                                  className="remove-btn"
                                  style={{ padding: "8px 12px" }}
                                  onClick={() => {
                                    const copy = [...examSections];
                                    const targetQ = copy[secIdx].questions?.[qIdx];
                                    if (targetQ) {
                                      targetQ.vocabPairs = (targetQ.vocabPairs || []).filter((_: any, idx: number) => idx !== pIdx);
                                      setExamSections(copy);
                                    }
                                  }}
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                        <button
                          type="button"
                          style={{
                            marginTop: 10,
                            padding: "6px 12px",
                            background: "#000080",
                            color: "#fff",
                            border: "none",
                            borderRadius: 6,
                            cursor: "pointer",
                            fontWeight: 600
                          }}
                          onClick={() => {
                            const copy = [...examSections];
                            const targetQ = copy[secIdx].questions?.[qIdx];
                            if (targetQ) {
                              const copyPairs = [...(targetQ.vocabPairs || [{ word: "", meaning: "" }])];
                              copyPairs.push({ word: "", meaning: "" });
                              targetQ.vocabPairs = copyPairs;
                              setExamSections(copy);
                            }
                          }}
                        >
                          + Thêm cặp từ vựng
                        </button>
                        <label style={{ fontSize: 12, fontWeight: 600, color: "#666", display: "block", marginTop: 10 }}>Giải thích đáp án (tùy chọn)</label>
                        <input
                          type="text"
                          className="exercise-content"
                          placeholder="Giải thích đáp án..."
                          value={q.explanation || ""}
                          onChange={e => updateQuestionInSection(secIdx, qIdx, "explanation", e.target.value)}
                        />
                      </QuestionCard>
                    ))}
                  </div>
                )}

                {sec.type === "Hình ảnh chọn đáp án" && (
                  <div>
                    {sec.questions?.map((q, qIdx) => (
                      <QuestionCard
                        key={qIdx}
                        secIdx={secIdx}
                        qIdx={qIdx}
                        sec={sec}
                        q={q}
                        onRemove={() => removeQuestionFromSection(secIdx, qIdx)}
                        isCollapsed={!!collapsedQuestions[`${secIdx}_${qIdx}`]}
                        onToggle={() => toggleQuestionCollapse(secIdx, qIdx)}
                      >
                        <label style={{ fontSize: 12, fontWeight: 600, color: "#666" }}>Hình ảnh đề bài</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async e => {
                            if (e.target.files && e.target.files[0]) {
                              await handleExamQuestionFileUpload(secIdx, qIdx, "imageUrl", e.target.files[0]);
                            }
                          }}
                          style={{ display: "block", marginTop: 5, marginBottom: 10 }}
                        />
                        {q.imageUrl && <img src={q.imageUrl} alt="Listening section image" style={{ maxHeight: 120, display: "block", marginBottom: 10 }} />}

                        <label style={{ fontSize: 12, fontWeight: 600, color: "#666" }}>Audio câu trả lời</label>
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={async e => {
                            if (e.target.files && e.target.files[0]) {
                              await handleExamQuestionFileUpload(secIdx, qIdx, "audioUrl", e.target.files[0]);
                            }
                          }}
                          style={{ display: "block", marginTop: 5, marginBottom: 10 }}
                        />
                        {q.audioUrl && <p style={{ color: "green", fontSize: 12 }}>✓ Đã tải audio: {q.audioUrl}</p>}

                        <select
                          className="exercise-type"
                          style={{ width: "100%" }}
                          value={q.correct}
                          onChange={e => updateQuestionInSection(secIdx, qIdx, "correct", e.target.value)}
                        >
                          <option value="A">Đáp án đúng: A</option>
                          <option value="B">Đáp án đúng: B</option>
                          <option value="C">Đáp án đúng: C</option>
                          <option value="D">Đáp án đúng: D</option>
                        </select>
                        <label style={{ fontSize: 12, fontWeight: 600, color: "#666", display: "block", marginTop: 10 }}>Giải thích đáp án (tùy chọn)</label>
                        <input
                          type="text"
                          className="exercise-content"
                          placeholder="Giải thích đáp án..."
                          value={q.explanation || ""}
                          onChange={e => updateQuestionInSection(secIdx, qIdx, "explanation", e.target.value)}
                        />
                      </QuestionCard>
                    ))}
                    <button type="button" className="add-content" style={{ marginTop: 10, padding: 8 }} onClick={() => addQuestionToSection(secIdx)}>+ Thêm câu hỏi hình ảnh</button>
                  </div>
                )}

                {sec.type === "Nghe chép chính tả" && (
                  <div>
                    {sec.questions?.map((q, qIdx) => (
                      <QuestionCard
                        key={qIdx}
                        secIdx={secIdx}
                        qIdx={qIdx}
                        sec={sec}
                        q={q}
                        onRemove={() => removeQuestionFromSection(secIdx, qIdx)}
                        isCollapsed={!!collapsedQuestions[`${secIdx}_${qIdx}`]}
                        onToggle={() => toggleQuestionCollapse(secIdx, qIdx)}
                      >
                        <label style={{ fontSize: 12, fontWeight: 600, color: "#666" }}>Audio nghe</label>
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={async e => {
                            if (e.target.files && e.target.files[0]) {
                              await handleExamQuestionFileUpload(secIdx, qIdx, "audioUrl", e.target.files[0]);
                            }
                          }}
                          style={{ display: "block", marginTop: 5, marginBottom: 10 }}
                        />
                        {q.audioUrl && <p style={{ color: "green", fontSize: 12 }}>Đã tải audio: {q.audioUrl}</p>}

                        <label style={{ fontSize: 12, fontWeight: 600, color: "#666" }}>Nội dung văn bản đúng</label>
                        <input
                          type="text"
                          className="exercise-content"
                          placeholder="Nhập văn bản đáp án đúng..."
                          value={q.text || ""}
                          onChange={e => updateQuestionInSection(secIdx, qIdx, "text", e.target.value)}
                        />
                        <label style={{ fontSize: 12, fontWeight: 600, color: "#666", display: "block", marginTop: 10 }}>Giải thích đáp án (tùy chọn)</label>
                        <input
                          type="text"
                          className="exercise-content"
                          placeholder="Giải thích đáp án..."
                          value={q.explanation || ""}
                          onChange={e => updateQuestionInSection(secIdx, qIdx, "explanation", e.target.value)}
                        />
                      </QuestionCard>
                    ))}
                    <button type="button" className="add-content" style={{ marginTop: 10, padding: 8 }} onClick={() => addQuestionToSection(secIdx)}>+ Thêm câu nghe chép chính tả</button>
                  </div>
                )}

                {sec.type === "Điền từ vào đoạn văn" && (
                  <div>
                    {sec.questions?.map((q, qIdx) => (
                      <QuestionCard
                        key={qIdx}
                        secIdx={secIdx}
                        qIdx={qIdx}
                        sec={sec}
                        q={q}
                        onRemove={() => removeQuestionFromSection(secIdx, qIdx)}
                        isCollapsed={!!collapsedQuestions[`${secIdx}_${qIdx}`]}
                        onToggle={() => toggleQuestionCollapse(secIdx, qIdx)}
                      >
                        <label style={{ fontSize: 12, fontWeight: 600, color: "#666" }}>Audio nghe</label>
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={async e => {
                            if (e.target.files && e.target.files[0]) {
                              await handleExamQuestionFileUpload(secIdx, qIdx, "audioUrl", e.target.files[0]);
                            }
                          }}
                          style={{ display: "block", marginTop: 5, marginBottom: 10 }}
                        />
                        {q.audioUrl && <p style={{ color: "green", fontSize: 12 }}>Đã tải audio: {q.audioUrl}</p>}

                        <label style={{ fontSize: 12, fontWeight: 600, color: "#666" }}>Đoạn văn (Dùng [1], [2]... để tạo ô trống)</label>
                        <RichTextarea
                          className="exercise-content"
                          rows={3}
                          placeholder="Yesterday, I went to the [1] and bought [2]..."
                          value={q.text || ""}
                          onChange={val => {
                            const blanksCount = (val.match(/\[\d+\]/g) || []).length;
                            const currentAnswers = q.fillInAnswers || [];
                            const nextAnswers = Array.from({ length: blanksCount }).map((_, i) => currentAnswers[i] || "");
                            
                            const copy = [...examSections];
                            if (copy[secIdx].questions) {
                              copy[secIdx].questions[qIdx].text = val;
                              copy[secIdx].questions[qIdx].fillInAnswers = nextAnswers;
                            }
                            setExamSections(copy);
                          }}
                        />

                        {q.fillInAnswers && q.fillInAnswers.length > 0 && (
                          <div style={{ marginTop: 10 }}>
                            <p style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>Đáp án ô điền:</p>
                            {q.fillInAnswers.map((ans: string, aIdx: number) => (
                              <input
                                key={aIdx}
                                type="text"
                                className="exercise-content"
                                style={{ margin: "4px 0" }}
                                placeholder={`Đáp án ô trống [${aIdx + 1}]`}
                                value={ans}
                                onChange={e => {
                                  const copy = [...examSections];
                                  if (copy[secIdx].questions && copy[secIdx].questions[qIdx].fillInAnswers) {
                                    copy[secIdx].questions[qIdx].fillInAnswers[aIdx] = e.target.value;
                                  }
                                  setExamSections(copy);
                                }}
                              />
                            ))}
                          </div>
                        )}
                        <label style={{ fontSize: 12, fontWeight: 600, color: "#666", display: "block", marginTop: 10 }}>Giải thích đáp án (tùy chọn)</label>
                        <input
                          type="text"
                          className="exercise-content"
                          placeholder="Giải thích đáp án..."
                          value={q.explanation || ""}
                          onChange={e => updateQuestionInSection(secIdx, qIdx, "explanation", e.target.value)}
                        />
                      </QuestionCard>
                    ))}
                    <button type="button" className="add-content" style={{ marginTop: 10, padding: 8 }} onClick={() => addQuestionToSection(secIdx)}>+ Thêm câu hỏi điền từ</button>
                  </div>
                )}

                {sec.type === "Luyện phát âm (check phát âm tự động)" && (
                  <div>
                    {sec.questions?.map((q, qIdx) => (
                      <QuestionCard
                        key={qIdx}
                        secIdx={secIdx}
                        qIdx={qIdx}
                        sec={sec}
                        q={q}
                        onRemove={() => removeQuestionFromSection(secIdx, qIdx)}
                        isCollapsed={!!collapsedQuestions[`${secIdx}_${qIdx}`]}
                        onToggle={() => toggleQuestionCollapse(secIdx, qIdx)}
                      >
                        <label style={{ fontSize: 12, fontWeight: 600, color: "#666" }}>Từ vựng / Câu mẫu phát âm</label>
                        <input
                          type="text"
                          className="exercise-content"
                          placeholder="Ví dụ: Hello, beautiful world!"
                          value={q.text || ""}
                          onChange={e => updateQuestionInSection(secIdx, qIdx, "text", e.target.value)}
                        />
                        <label style={{ fontSize: 12, fontWeight: 600, color: "#666", display: "block", marginTop: 10 }}>Cấp độ</label>
                        <select
                          className="exercise-type"
                          style={{ width: "100%", marginTop: 4 }}
                          value={q.level || "Đọc theo câu"}
                          onChange={e => updateQuestionInSection(secIdx, qIdx, "level", e.target.value)}
                        >
                          <option value="Luyện âm đơn">Luyện âm đơn (Phoneme)</option>
                          <option value="Đọc từ theo âm">Đọc từ theo âm (Word)</option>
                          <option value="Đọc theo câu">Đọc theo câu (Sentence)</option>
                        </select>
                        <label style={{ fontSize: 12, fontWeight: 600, color: "#666", display: "block", marginTop: 10 }}>Giải thích đáp án / Hướng dẫn học viên (tùy chọn)</label>
                        <input
                          type="text"
                          className="exercise-content"
                          placeholder="Nhập giải thích hoặc hướng dẫn..."
                          value={q.explanation || ""}
                          onChange={e => updateQuestionInSection(secIdx, qIdx, "explanation", e.target.value)}
                        />
                      </QuestionCard>
                    ))}
                    <button type="button" className="add-content" style={{ marginTop: 10, padding: 8 }} onClick={() => addQuestionToSection(secIdx)}>+ Thêm câu luyện phát âm</button>
                  </div>
                )}

                {sec.type === "Sắp xếp từ thành câu" && (
                  <div>
                    {sec.questions?.map((q, qIdx) => (
                      <QuestionCard
                        key={qIdx}
                        secIdx={secIdx}
                        qIdx={qIdx}
                        sec={sec}
                        q={q}
                        onRemove={() => removeQuestionFromSection(secIdx, qIdx)}
                        isCollapsed={!!collapsedQuestions[`${secIdx}_${qIdx}`]}
                        onToggle={() => toggleQuestionCollapse(secIdx, qIdx)}
                      >
                        <label style={{ fontSize: 12, fontWeight: 600, color: "#666" }}>Câu gợi ý / Câu gốc (tiếng Việt)</label>
                        <input
                          type="text"
                          className="exercise-content"
                          placeholder="Con mèo đang ngủ trên giường."
                          value={q.text || ""}
                          onChange={e => updateQuestionInSection(secIdx, qIdx, "text", e.target.value)}
                        />
                        <label style={{ fontSize: 12, fontWeight: 600, color: "#666", display: "block", marginTop: 10 }}>Câu tiếng Anh hoàn chỉnh</label>
                        <input
                          type="text"
                          className="exercise-content"
                          placeholder="The cat is sleeping on the bed"
                          value={q.correctSentence || ""}
                          onChange={e => updateQuestionInSection(secIdx, qIdx, "correctSentence", e.target.value)}
                        />
                        <label style={{ fontSize: 12, fontWeight: 600, color: "#666", display: "block", marginTop: 10 }}>Giải thích đáp án (tùy chọn)</label>
                        <input
                          type="text"
                          className="exercise-content"
                          placeholder="Giải thích đáp án..."
                          value={q.explanation || ""}
                          onChange={e => updateQuestionInSection(secIdx, qIdx, "explanation", e.target.value)}
                        />
                      </QuestionCard>
                    ))}
                    <button type="button" className="add-content" style={{ marginTop: 10, padding: 8 }} onClick={() => addQuestionToSection(secIdx)}>+ Thêm câu sắp xếp từ</button>
                  </div>
                )}

                {sec.type === "Sắp xếp câu thành đoạn văn" && (
                  <div>
                    {sec.questions?.map((q, qIdx) => (
                      <QuestionCard
                        key={qIdx}
                        secIdx={secIdx}
                        qIdx={qIdx}
                        sec={sec}
                        q={q}
                        onRemove={() => removeQuestionFromSection(secIdx, qIdx)}
                        isCollapsed={!!collapsedQuestions[`${secIdx}_${qIdx}`]}
                        onToggle={() => toggleQuestionCollapse(secIdx, qIdx)}
                      >
                        <p style={{ fontSize: 12, color: "#888", marginBottom: 5 }}>Nhập các câu của đoạn văn theo thứ tự đúng logic:</p>
                        {q.sentences?.map((sText, sIdx) => (
                          <div key={sIdx} style={{ display: "flex", gap: 10, alignItems: "center", margin: "4px 0" }}>
                            <span style={{ fontSize: 12, fontWeight: 600 }}>Câu {sIdx + 1}</span>
                            <input
                              type="text"
                              className="exercise-content"
                              style={{ marginTop: 0 }}
                              value={sText}
                              onChange={e => {
                                const copy = [...examSections];
                                if (copy[secIdx].questions && copy[secIdx].questions[qIdx].sentences) {
                                  copy[secIdx].questions[qIdx].sentences[sIdx] = e.target.value;
                                }
                                setExamSections(copy);
                              }}
                            />
                            {q.sentences && q.sentences.length > 1 && (
                              <button
                                type="button"
                                className="remove-btn"
                                style={{ padding: "2px 6px" }}
                                onClick={() => {
                                  const copy = [...examSections];
                                  if (copy[secIdx].questions && copy[secIdx].questions[qIdx].sentences) {
                                    copy[secIdx].questions[qIdx].sentences = copy[secIdx].questions[qIdx].sentences.filter((_, i) => i !== sIdx);
                                  }
                                  setExamSections(copy);
                                }}
                              >✕</button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          className="add-content"
                          style={{ padding: "4px 12px", marginTop: 8 }}
                          onClick={() => {
                            const copy = [...examSections];
                            if (copy[secIdx].questions && copy[secIdx].questions[qIdx]) {
                              if (!copy[secIdx].questions[qIdx].sentences) {
                                copy[secIdx].questions[qIdx].sentences = [];
                              }
                              copy[secIdx].questions[qIdx].sentences.push("");
                            }
                            setExamSections(copy);
                          }}
                        >+ Thêm câu tiếp theo</button>
                        <label style={{ fontSize: 12, fontWeight: 600, color: "#666", display: "block", marginTop: 10 }}>Giải thích đáp án (tùy chọn)</label>
                        <input
                          type="text"
                          className="exercise-content"
                          placeholder="Giải thích đáp án..."
                          value={q.explanation || ""}
                          onChange={e => updateQuestionInSection(secIdx, qIdx, "explanation", e.target.value)}
                        />
                      </QuestionCard>
                    ))}
                    <button type="button" className="add-content" style={{ marginTop: 10, padding: 8 }} onClick={() => addQuestionToSection(secIdx)}>+ Thêm câu sắp xếp câu</button>
                  </div>
                )}

                {sec.type === "Trắc nghiệm đọc hiểu (chia đôi màn hình)" && (
                  <div>
                    {sec.questions?.map((q, qIdx) => (
                      <QuestionCard
                        key={qIdx}
                        secIdx={secIdx}
                        qIdx={qIdx}
                        sec={sec}
                        q={q}
                        onRemove={() => removeQuestionFromSection(secIdx, qIdx)}
                        isCollapsed={!!collapsedQuestions[`${secIdx}_${qIdx}`]}
                        onToggle={() => toggleQuestionCollapse(secIdx, qIdx)}
                      >
                        <div style={{ marginBottom: 12 }}>
                          <label style={{ fontSize: 12, fontWeight: 600, color: "#666" }}>📖 Bài đọc dài (Hiển thị bên trái)</label>
                          <RichTextarea
                            className="exercise-content"
                            rows={5}
                            value={q.text || ""}
                            onChange={val => updateQuestionInSection(secIdx, qIdx, "text", val)}
                            placeholder="Nhập bài đọc cho nhóm này..."
                          />
                        </div>

                        {sec.type === "Trắc nghiệm đọc hiểu (chia đôi màn hình)" && sec.title.includes("Part 7") && (
                          <div style={{ marginBottom: 12 }}>
                            <label style={{ fontSize: 11, fontWeight: 600, color: "#888" }}>Hình ảnh cho bài đọc này (Tùy chọn)</label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={async e => {
                                if (e.target.files && e.target.files[0]) {
                                  await handleExamQuestionFileUpload(secIdx, qIdx, "imageUrl", e.target.files[0]);
                                }
                              }}
                              style={{ display: "block", marginTop: 5 }}
                            />
                            {q.imageUrl && (
                              <div style={{ marginTop: 5 }}>
                                <p style={{ color: "green", fontSize: 11, margin: 0 }}>✓ Đã tải hình ảnh: {q.imageUrl}</p>
                                <img src={q.imageUrl} alt="Preview" style={{ maxHeight: 80, marginTop: 5, borderRadius: 4 }} />
                              </div>
                            )}
                          </div>
                        )}

                        <div style={{ marginTop: 10 }}>
                          <p style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>Các câu hỏi đọc hiểu của nhóm này:</p>
                          {(q.subQuestions || []).map((sub: any, subIdx: number) => (
                            <div key={subIdx} style={{ background: "#ffffff", padding: 12, border: "1px solid #e2e8f0", borderLeft: "3px solid #000080", borderRadius: 8, marginTop: 8, boxShadow: "0 1px 2px rgba(0,0,0,0.01)" }}>
                              <div className="question-block-header">
                                <h6 style={{ margin: 0, fontSize: 12, color: "#000080" }}>Câu hỏi phụ {subIdx + 1}</h6>
                                {(q.subQuestions || []).length > 1 && (
                                  <button
                                    type="button"
                                    className="remove-btn"
                                    style={{ padding: "2px 6px", fontSize: 11 }}
                                    onClick={() => removeSubQuestionFromSection(secIdx, qIdx, subIdx)}
                                  >Xóa</button>
                                )}
                              </div>
                              <input
                                type="text"
                                placeholder="Nhập câu hỏi"
                                className="exercise-content"
                                style={{ marginTop: 6 }}
                                value={sub.question || ""}
                                onChange={e => updateSubQuestionFieldInSection(secIdx, qIdx, subIdx, "question", e.target.value)}
                              />
                              {["A", "B", "C", "D"].map((lbl, aIdx) => (
                                <input
                                  key={lbl}
                                  type="text"
                                  placeholder={`Lựa chọn ${lbl}`}
                                  className="exercise-content"
                                  style={{ margin: "4px 0" }}
                                  value={sub.answers[aIdx] || ""}
                                  onChange={e => updateSubQuestionAnswerInSection(secIdx, qIdx, subIdx, aIdx, e.target.value)}
                                />
                              ))}
                              <select
                                className="exercise-type"
                                style={{ width: "100%", marginTop: 5 }}
                                value={sub.correct || "A"}
                                onChange={e => updateSubQuestionFieldInSection(secIdx, qIdx, subIdx, "correct", e.target.value)}
                              >
                                <option value="A">Đáp án đúng: A</option>
                                <option value="B">Đáp án đúng: B</option>
                                <option value="C">Đáp án đúng: C</option>
                                <option value="D">Đáp án đúng: D</option>
                              </select>
                            </div>
                          ))}
                          <button
                            type="button"
                            className="add-content"
                            style={{ padding: "4px 10px", marginTop: 8, fontSize: "12px" }}
                            onClick={() => addSubQuestionToSection(secIdx, qIdx)}
                          >+ Thêm câu hỏi phụ</button>
                        </div>
                      </QuestionCard>
                    ))}
                    <button type="button" className="add-content" style={{ marginTop: 15, padding: 8 }} onClick={() => addQuestionToSection(secIdx)}>+ Thêm nhóm bài đọc</button>
                  </div>
                )}

                {sec.type === "Nói theo chủ đề (ghi âm nộp GV)" && (
                  <div>
                    {sec.questions?.map((q, qIdx) => (
                      <QuestionCard
                        key={qIdx}
                        secIdx={secIdx}
                        qIdx={qIdx}
                        sec={sec}
                        q={q}
                        onRemove={() => removeQuestionFromSection(secIdx, qIdx)}
                        isCollapsed={!!collapsedQuestions[`${secIdx}_${qIdx}`]}
                        onToggle={() => toggleQuestionCollapse(secIdx, qIdx)}
                      >
                        <label style={{ fontSize: 12, fontWeight: 600, color: "#666" }}>Đề bài / Topic bằng chữ</label>
                        <RichTextarea
                          className="exercise-content"
                          rows={3}
                          placeholder="Nhập đề bài nói..."
                          value={q.prompt || ""}
                          onChange={val => updateQuestionInSection(secIdx, qIdx, "prompt", val)}
                        />
                        <label style={{ fontSize: 12, fontWeight: 600, color: "#666", display: "block", marginTop: 10 }}>Hình ảnh gợi ý</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async e => {
                            if (e.target.files && e.target.files[0]) {
                              await handleExamQuestionFileUpload(secIdx, qIdx, "imageUrl", e.target.files[0]);
                            }
                          }}
                          style={{ display: "block", marginTop: 5 }}
                        />
                        {q.imageUrl && <img src={q.imageUrl} alt="Topic hint" style={{ maxHeight: 120, display: "block", marginTop: 8 }} />}

                        <label style={{ fontSize: 12, fontWeight: 600, color: "#666", display: "block", marginTop: 10 }}>Audio đề bài (Tùy chọn)</label>
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={async e => {
                            if (e.target.files && e.target.files[0]) {
                              await handleExamQuestionFileUpload(secIdx, qIdx, "audioUrl", e.target.files[0]);
                            }
                          }}
                          style={{ display: "block", marginTop: 5 }}
                        />
                        {q.audioUrl && <p style={{ color: "green", fontSize: 12, marginTop: 5 }}>Đã tải audio: {q.audioUrl}</p>}
                      </QuestionCard>
                    ))}
                    <button type="button" className="add-content" style={{ marginTop: 10, padding: 8 }} onClick={() => addQuestionToSection(secIdx)}>+ Thêm chủ đề nói</button>
                  </div>
                )}

                {sec.type === "Viết đoạn văn ngắn" && (
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#666" }}>Đề bài viết luận</label>
                    <RichTextarea
                      className="exercise-content"
                      rows={4}
                      value={sec.content || ""}
                      onChange={val => {
                        const copy = [...examSections];
                        copy[secIdx].content = val;
                        setExamSections(copy);
                      }}
                      placeholder="Nhập đề bài viết luận..."
                    />
                  </div>
                )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* ────────────────── DYNAMIC MULTI-QUESTION BUILDERS ────────────────── */
          <div style={{ borderTop: "1px solid #e2e8f0", marginTop: 30, paddingTop: 24 }}>
            <h3 style={{ color: "#000080", marginBottom: 20, fontSize: "18px", fontWeight: 700 }}>Danh sách Câu Hỏi ({dangBai})</h3>

            {type === "Nghe audio trắc nghiệm" && (
              <div style={{
                background: "#f8fafc",
                border: "1px dashed #cbd5e1",
                borderRadius: "12px",
                padding: "20px",
                marginBottom: "20px"
              }}>
                <h4 style={{ color: "#000080", marginTop: 0, marginBottom: 8, fontSize: "15px", fontWeight: 600 }}>File nghe chung cho toàn bộ bài tập (Tùy chọn)</h4>
                <p style={{ color: "#777", fontSize: "12px", marginTop: 0, marginBottom: 12 }}>
                  * Nếu tải lên file nghe chung ở đây, các câu hỏi sẽ dùng chung audio này. Học viên sẽ nghe từ trình phát chung ở đầu bài.
                  Nếu không tải ở đây, bạn có thể tải audio riêng cho từng câu hỏi phía dưới.
                </p>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={async e => {
                    if (e.target.files && e.target.files[0]) {
                      try {
                        const url = await uploadFile(e.target.files[0]);
                        setCommonAudioUrl(url);
                      } catch (err) {
                        alert("Lỗi khi tải file nghe chung lên");
                      }
                    }
                  }}
                  style={{ display: "block" }}
                />
                {commonAudioUrl && (
                  <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10 }}>
                    <p style={{ color: "green", fontSize: 13, fontWeight: "bold", margin: 0 }}>✓ Đã tải file nghe chung:</p>
                    <audio src={commonAudioUrl.startsWith("http") ? commonAudioUrl : `${API_BASE}${commonAudioUrl}`} controls style={{ height: 32 }} />
                    <button
                      type="button"
                      onClick={() => setCommonAudioUrl("")}
                      style={{
                        background: "#ff4d4f",
                        color: "#fff",
                        border: "none",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "11px"
                      }}
                    >
                      Xóa
                    </button>
                  </div>
                )}
              </div>
            )}

            {questions.map((q, qIndex) => (
              <div key={qIndex} className="question-block">
                <div className="question-block-header">
                  <h4 style={{ fontSize: 15 }}>Câu {qIndex + 1}</h4>
                  {questions.length > 1 && (
                    <button className="remove-btn" onClick={() => removeQuestionItem(qIndex)}>Xóa câu này</button>
                  )}
                </div>

                {/* ── SPEAKING PRONOUNCE ── */}
                {type === "Luyện phát âm (check phát âm tự động)" && (
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#666" }}>Từ vựng / Câu mẫu phát âm</label>
                    <input
                      type="text"
                      className="exercise-content"
                      placeholder="Ví dụ: Hello, beautiful world!"
                      value={q.text || ""}
                      onChange={e => updateQuestionItemField(qIndex, "text", e.target.value)}
                    />
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#666", display: "block", marginTop: 10 }}>Cấp độ</label>
                    <select
                      className="exercise-type"
                      style={{ width: "100%", marginTop: 4 }}
                      value={q.level || "Đọc theo câu"}
                      onChange={e => updateQuestionItemField(qIndex, "level", e.target.value)}
                    >
                      <option value="Luyện âm đơn">Luyện âm đơn (Phoneme)</option>
                      <option value="Đọc từ theo âm">Đọc từ theo âm (Word)</option>
                      <option value="Đọc theo câu">Đọc theo câu (Sentence)</option>
                    </select>
                    <input
                      type="text"
                      className="exercise-content"
                      placeholder="Hướng dẫn học viên (tùy chọn)"
                      value={q.explanation || ""}
                      onChange={e => updateQuestionItemField(qIndex, "explanation", e.target.value)}
                    />
                  </div>
                )}

                {/* ── SPEAKING TOPIC ── */}
                {type === "Nói theo chủ đề (ghi âm nộp GV)" && (
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#666" }}>Đề bài / Topic bằng chữ</label>
                    <RichTextarea
                      className="exercise-content"
                      rows={3}
                      placeholder="Nhập đề bài nói..."
                      value={q.prompt || ""}
                      onChange={val => updateQuestionItemField(qIndex, "prompt", val)}
                    />
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#666", display: "block", marginTop: 10 }}>Hình ảnh gợi ý</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => {
                        if (e.target.files && e.target.files[0]) {
                          handleQuestionFileUpload(qIndex, "imageUrl", e.target.files[0]);
                        }
                      }}
                      style={{ display: "block", marginTop: 5 }}
                    />
                    {q.imageUrl && <img src={q.imageUrl} alt="Topic hint" style={{ maxHeight: 120, display: "block", marginTop: 8 }} />}

                    <label style={{ fontSize: 12, fontWeight: 600, color: "#666", display: "block", marginTop: 10 }}>Audio đề bài (Tùy chọn)</label>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={e => {
                        if (e.target.files && e.target.files[0]) {
                          handleQuestionFileUpload(qIndex, "audioUrl", e.target.files[0]);
                        }
                      }}
                      style={{ display: "block", marginTop: 5 }}
                    />
                    {q.audioUrl && <p style={{ color: "green", fontSize: 12, marginTop: 5 }}>Đã tải audio: {q.audioUrl}</p>}
                  </div>
                )}

                {/* ── SIMPLE MCQ (writing-tense-mcq / Trắc nghiệm) ── */}
                {type === "Trắc nghiệm" && (
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#666" }}>Câu hỏi</label>
                    <input
                      type="text"
                      className="exercise-content"
                      placeholder="Nhập câu hỏi..."
                      value={q.question || ""}
                      onChange={e => updateQuestionItemField(qIndex, "question", e.target.value)}
                    />
                    
                    {["A", "B", "C", "D"].map((lbl, aIdx) => (
                      <div key={lbl} style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 5 }}>
                        <span style={{ fontWeight: "bold", width: 20 }}>{lbl}.</span>
                        <input
                          type="text"
                          placeholder={`Lựa chọn ${lbl}`}
                          className="exercise-content"
                          style={{ margin: 0 }}
                          value={(q.answers || [])[aIdx] || ""}
                          onChange={e => {
                            const copyAnswers = [...(q.answers || [])];
                            copyAnswers[aIdx] = e.target.value;
                            updateQuestionItemField(qIndex, "answers", copyAnswers);
                          }}
                        />
                      </div>
                    ))}
                    
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#666", display: "block", marginTop: 10 }}>Đáp án đúng</label>
                    <select
                      className="exercise-type"
                      style={{ width: "100%", marginTop: 4 }}
                      value={q.correct || "A"}
                      onChange={e => updateQuestionItemField(qIndex, "correct", e.target.value)}
                    >
                      <option value="A">Đáp án đúng: A</option>
                      <option value="B">Đáp án đúng: B</option>
                      <option value="C">Đáp án đúng: C</option>
                      <option value="D">Đáp án đúng: D</option>
                    </select>

                    <label style={{ fontSize: 12, fontWeight: 600, color: "#666", display: "block", marginTop: 10 }}>Giải thích đáp án (tùy chọn)</label>
                    <input
                      type="text"
                      className="exercise-content"
                      placeholder="Giải thích tại sao chọn đáp án này..."
                      value={q.explanation || ""}
                      onChange={e => updateQuestionItemField(qIndex, "explanation", e.target.value)}
                    />
                  </div>
                )}
                {/* ── FIND AND CORRECT MISTAKES (writing-find-mistakes / Tìm lỗi sai) ── */}
                {type === "Tìm lỗi sai" && (
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#666" }}>Câu văn gốc (Dùng dấu cách kép để phân đoạn câu)</label>
                    <textarea
                      className="exercise-content"
                      style={{ width: "100%", padding: "10px", minHeight: "60px", fontFamily: "inherit" }}
                      placeholder="VD: By the time  you  will arrive  I'll have already left."
                      value={q.question || ""}
                      onChange={e => {
                        const val = e.target.value;
                        updateQuestionItemField(qIndex, "question", val);
                        const segments = val.split("  ").map((s: string) => s.trim()).filter(Boolean);
                        updateQuestionItemField(qIndex, "answers", segments);
                      }}
                    />

                    <div style={{ marginTop: 10, padding: 12, background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                      <label style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", display: "block", marginBottom: 6 }}>
                        Xem trước và chọn cụm từ chứa lỗi sai:
                      </label>
                      {(() => {
                        const segments = (q.question || "").split("  ").map((s: string) => s.trim()).filter(Boolean);
                        if (segments.length > 0) {
                          return (
                            <div className="find-mistake-sentence-preview" style={{ fontSize: "16px", lineHeight: "2.2", color: "#1e293b", background: "#ffffff", padding: "16px", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
                              {segments.map((text: string, sIdx: number) => {
                                const isSelected = q.correct === text;
                                return (
                                  <span
                                    key={sIdx}
                                    className={`mistake-segment ${isSelected ? "selected" : ""}`}
                                    onClick={() => {
                                      updateQuestionItemField(qIndex, "correct", text);
                                    }}
                                  >
                                    {text}
                                  </span>
                                );
                              })}
                            </div>
                          );
                        }
                        return (
                          <p style={{ fontStyle: "italic", fontSize: 13, color: "#64748b", margin: 0 }}>
                            (Nhập câu văn ở trên để xem trước phân đoạn)
                          </p>
                        );
                      })()}
                    </div>

                    <div style={{ marginTop: 10 }}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: "#666" }}>Cụm từ sửa lại cho đúng <span style={{ color: "red" }}>*</span></label>
                      <input
                        type="text"
                        className="exercise-content"
                        placeholder="VD: arrive"
                        value={q.correctSentence || ""}
                        onChange={e => updateQuestionItemField(qIndex, "correctSentence", e.target.value)}
                      />
                    </div>

                    <div style={{ marginTop: 10 }}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: "#666" }}>Giải thích đáp án (tùy chọn)</label>
                      <textarea
                        className="exercise-content auto-resize-textarea"
                        style={{ width: "100%", padding: "10px", minHeight: "44px", fontFamily: "inherit", resize: "none", overflowY: "hidden" }}
                        placeholder="Giải thích tại sao cụm từ này sai và cách dùng đúng..."
                        value={q.explanation || ""}
                        onChange={e => {
                          const val = e.target.value;
                          updateQuestionItemField(qIndex, "explanation", val);
                          e.target.style.height = "auto";
                          e.target.style.height = e.target.scrollHeight + "px";
                        }}
                        rows={1}
                      />
                    </div>
                  </div>
                )}

                {/* ── LISTENING MCQ & TENSE MCQ & VOCAB MCQ ── */}
                {(type === "Nghe audio trắc nghiệm" || type === "Tổng hợp") && (
                  <div>
                    {type === "Nghe audio trắc nghiệm" && (
                      <div style={{ marginBottom: 12 }}>
                        <label style={{ fontSize: 12, fontWeight: 600, color: "#666", display: "block" }}>Audio riêng của câu hỏi (Tùy chọn)</label>
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={e => {
                            if (e.target.files && e.target.files[0]) {
                              handleQuestionFileUpload(qIndex, "audioUrl", e.target.files[0]);
                            }
                          }}
                          disabled={!!commonAudioUrl}
                          style={{ display: "block", marginTop: 5 }}
                        />
                        {commonAudioUrl ? (
                          <p style={{ color: "#F95800", fontSize: 12, marginTop: 5 }}>Đang dùng file nghe chung ở đầu bài tập</p>
                        ) : q.audioUrl ? (
                          <p style={{ color: "green", fontSize: 12, marginTop: 5 }}>Đã tải: {q.audioUrl}</p>
                        ) : null}
                      </div>
                    )}

                    <div style={{ marginBottom: 12 }}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: "#666", display: "block" }}>Đề bài chung / Đoạn văn / Hướng dẫn (Tùy chọn)</label>
                      <RichTextarea
                        className="exercise-content"
                        placeholder="Nhập đề bài chung, đoạn văn ngữ cảnh..."
                        value={q.prompt || ""}
                        onChange={val => updateQuestionItemField(qIndex, "prompt", val)}
                        rows={2}
                      />
                    </div>

                    <div style={{ marginTop: 10 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>Các câu hỏi trắc nghiệm phụ:</p>
                      {(q.subQuestions || []).map((sub: any, subIdx: number) => (
                        <div key={subIdx} style={{ background: "#ffffff", padding: 16, border: "1px solid #e2e8f0", borderLeft: "3px solid #000080", borderRadius: 8, marginTop: 10, boxShadow: "0 1px 2px rgba(0,0,0,0.01)" }}>
                          <div className="question-block-header">
                            <h5 style={{ margin: 0, fontSize: 13, color: "#000080" }}>Câu hỏi phụ {subIdx + 1}</h5>
                            {(q.subQuestions || []).length > 1 && (
                              <button
                                type="button"
                                className="remove-btn"
                                style={{ padding: "2px 6px", fontSize: 11 }}
                                onClick={() => removeSubQuestion(qIndex, subIdx)}
                              >Xóa</button>
                            )}
                          </div>
                          <input
                            type="text"
                            placeholder="Nhập câu hỏi"
                            className="exercise-content"
                            style={{ marginTop: 8 }}
                            value={sub.question || ""}
                            onChange={e => updateSubQuestionField(qIndex, subIdx, "question", e.target.value)}
                          />
                          {["A", "B", "C", "D"].map((lbl, aIdx) => (
                            <input
                              key={lbl}
                              type="text"
                              placeholder={`Lựa chọn ${lbl}`}
                              className="exercise-content"
                              style={{ margin: "5px 0" }}
                              value={sub.answers[aIdx] || ""}
                              onChange={e => updateSubQuestionAnswer(qIndex, subIdx, aIdx, e.target.value)}
                            />
                          ))}
                          <select
                            className="exercise-type"
                            style={{ width: "100%", marginTop: 5 }}
                            value={sub.correct || "A"}
                            onChange={e => updateSubQuestionField(qIndex, subIdx, "correct", e.target.value)}
                          >
                            <option value="A">Đáp án đúng: A</option>
                            <option value="B">Đáp án đúng: B</option>
                            <option value="C">Đáp án đúng: C</option>
                            <option value="D">Đáp án đúng: D</option>
                          </select>
                          <input
                            type="text"
                            className="exercise-content"
                            placeholder="Giải thích đáp án (tùy chọn)"
                            value={sub.explanation || ""}
                            onChange={e => updateSubQuestionField(qIndex, subIdx, "explanation", e.target.value)}
                            style={{ marginTop: 8 }}
                          />
                        </div>
                      ))}
                      <button
                        type="button"
                        className="add-content"
                        style={{ padding: "6px 12px", marginTop: 8 }}
                        onClick={() => addSubQuestion(qIndex)}
                      >+ Thêm câu hỏi phụ</button>
                    </div>
                  </div>
                ) }

                {/* ── VOCABULARY MATCHING (reading-vocab-mcq) ── */}
                {type === "Nối từ" && (
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#666", display: "block", marginBottom: 5 }}>
                      Danh sách các cặp từ nối (Tiếng Anh - Diễn giải tiếng Anh)
                    </label>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
                      {(q.vocabPairs || [{ word: "", meaning: "" }]).map((pair: any, pIdx: number) => (
                        <div key={pIdx} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                          <input
                            type="text"
                            placeholder="Từ tiếng Anh (Ví dụ: hello)"
                            className="exercise-content"
                            style={{ margin: 0, flex: 1 }}
                            value={pair.word}
                            onChange={e => {
                              const copyPairs = [...(q.vocabPairs || [])];
                              if (!copyPairs[pIdx]) copyPairs[pIdx] = { word: "", meaning: "" };
                              copyPairs[pIdx].word = e.target.value;
                              updateQuestionItemField(qIndex, "vocabPairs", copyPairs);
                            }}
                          />
                          <span style={{ fontWeight: "bold", color: "#666" }}>-</span>
                          <input
                            type="text"
                            placeholder="Diễn giải tiếng Anh (Ví dụ: a greeting word)"
                            className="exercise-content"
                            style={{ margin: 0, flex: 1 }}
                            value={pair.meaning}
                            onChange={e => {
                              const copyPairs = [...(q.vocabPairs || [])];
                              if (!copyPairs[pIdx]) copyPairs[pIdx] = { word: "", meaning: "" };
                              copyPairs[pIdx].meaning = e.target.value;
                              updateQuestionItemField(qIndex, "vocabPairs", copyPairs);
                            }}
                          />
                          {(q.vocabPairs || []).length > 1 && (
                            <button
                              type="button"
                              className="remove-btn"
                              style={{ padding: "8px 12px" }}
                              onClick={() => {
                                const copyPairs = (q.vocabPairs || []).filter((_: any, idx: number) => idx !== pIdx);
                                updateQuestionItemField(qIndex, "vocabPairs", copyPairs);
                              }}
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      style={{
                        marginTop: 10,
                        padding: "6px 12px",
                        background: "#000080",
                        color: "#fff",
                        border: "none",
                        borderRadius: 6,
                        cursor: "pointer",
                        fontWeight: 600
                      }}
                      onClick={() => {
                        const copyPairs = [...(q.vocabPairs || [{ word: "", meaning: "" }])];
                        copyPairs.push({ word: "", meaning: "" });
                        updateQuestionItemField(qIndex, "vocabPairs", copyPairs);
                      }}
                    >
                      + Thêm cặp từ vựng
                    </button>
                  </div>
                )}

                {/* ── LISTENING IMAGE ── */}
                {type === "Hình ảnh chọn đáp án" && (
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#666" }}>Hình ảnh đề bài</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => {
                        if (e.target.files && e.target.files[0]) {
                          handleQuestionFileUpload(qIndex, "imageUrl", e.target.files[0]);
                        }
                      }}
                      style={{ display: "block", marginTop: 5, marginBottom: 10 }}
                    />
                    {q.imageUrl && <img src={q.imageUrl} alt="Listening image cue" style={{ maxHeight: 120, display: "block", marginBottom: 10 }} />}

                    <label style={{ fontSize: 12, fontWeight: 600, color: "#666" }}>Audio câu trả lời</label>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={e => {
                        if (e.target.files && e.target.files[0]) {
                          handleQuestionFileUpload(qIndex, "audioUrl", e.target.files[0]);
                        }
                      }}
                      style={{ display: "block", marginTop: 5, marginBottom: 10 }}
                    />
                    {q.audioUrl && <p style={{ color: "green", fontSize: 12 }}>✓ Đã tải audio: {q.audioUrl}</p>}

                    <label style={{ fontSize: 12, fontWeight: 600, color: "#666", marginTop: 10, display: "block" }}>Câu hỏi (Tùy chọn)</label>
                    <input
                      type="text"
                      className="exercise-content"
                      placeholder="Nhập câu hỏi (ví dụ: Look at the picture and select the best answer)..."
                      value={q.question || ""}
                      onChange={e => updateQuestionItemField(qIndex, "question", e.target.value)}
                    />

                    <label style={{ fontSize: 12, fontWeight: 600, color: "#666", marginTop: 10, display: "block" }}>Các phương án trả lời (Tùy chọn)</label>
                    {["A", "B", "C", "D"].map((lbl, aIdx) => (
                      <div key={lbl} style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 5 }}>
                        <span style={{ fontWeight: "bold", width: 20 }}>{lbl}.</span>
                        <input
                          type="text"
                          placeholder={`Nhập nội dung lựa chọn ${lbl} (để trống nếu chỉ hiển thị chữ ${lbl})`}
                          className="exercise-content"
                          style={{ margin: 0 }}
                          value={(q.answers || [])[aIdx] || ""}
                          onChange={e => {
                            const copyAnswers = [...(q.answers || [])];
                            copyAnswers[aIdx] = e.target.value;
                            updateQuestionItemField(qIndex, "answers", copyAnswers);
                          }}
                        />
                      </div>
                    ))}

                    <label style={{ fontSize: 12, fontWeight: 600, color: "#666", display: "block", marginTop: 10 }}>Đáp án đúng</label>
                    <select
                      className="exercise-type"
                      style={{ width: "100%", marginTop: 4 }}
                      value={q.correct}
                      onChange={e => updateQuestionItemField(qIndex, "correct", e.target.value)}
                    >
                      <option value="A">Đáp án đúng: A</option>
                      <option value="B">Đáp án đúng: B</option>
                      <option value="C">Đáp án đúng: C</option>
                      <option value="D">Đáp án đúng: D</option>
                    </select>

                    <label style={{ fontSize: 12, fontWeight: 600, color: "#666", display: "block", marginTop: 10 }}>Giải thích đáp án (tùy chọn)</label>
                    <input
                      type="text"
                      className="exercise-content"
                      placeholder="Giải thích tại sao chọn đáp án này..."
                      value={q.explanation || ""}
                      onChange={e => updateQuestionItemField(qIndex, "explanation", e.target.value)}
                    />
                  </div>
                )}

                {/* ── LISTENING DICTATION ── */}
                {type === "Nghe chép chính tả" && (
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#666" }}>🎵 Audio nghe</label>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={e => {
                        if (e.target.files && e.target.files[0]) {
                          handleQuestionFileUpload(qIndex, "audioUrl", e.target.files[0]);
                        }
                      }}
                      style={{ display: "block", marginTop: 5, marginBottom: 10 }}
                    />
                    {q.audioUrl && <p style={{ color: "green", fontSize: 12 }}>✓ Đã tải audio: {q.audioUrl}</p>}

                    <label style={{ fontSize: 12, fontWeight: 600, color: "#666" }}>Nội dung văn bản đúng</label>
                    <input
                      type="text"
                      className="exercise-content"
                      placeholder="The quick brown fox jumps..."
                      value={q.text || ""}
                      onChange={e => updateQuestionItemField(qIndex, "text", e.target.value)}
                    />
                  </div>
                )}

                {/* ── LISTENING FILL IN (CLOZE) ── */}
                {type === "Điền từ vào đoạn văn" && (
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#666" }}>🎵 Audio nghe</label>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={e => {
                        if (e.target.files && e.target.files[0]) {
                          handleQuestionFileUpload(qIndex, "audioUrl", e.target.files[0]);
                        }
                      }}
                      style={{ display: "block", marginTop: 5, marginBottom: 10 }}
                    />
                    {q.audioUrl && <p style={{ color: "green", fontSize: 12 }}>✓ Đã tải audio: {q.audioUrl}</p>}

                    <label style={{ fontSize: 12, fontWeight: 600, color: "#666" }}>Đoạn văn (Dùng [1], [2]... để tạo ô trống)</label>
                    <RichTextarea
                      className="exercise-content"
                      rows={3}
                      placeholder="Yesterday, I went to the [1] and bought [2]..."
                      value={q.text || ""}
                      onChange={val => {
                        const blanksCount = (val.match(/\[\d+\]/g) || []).length;
                        const currentAnswers = q.fillInAnswers || [];
                        const nextAnswers = Array.from({ length: blanksCount }).map((_, i) => currentAnswers[i] || "");
                        const copy = [...questions];
                        copy[qIndex].text = val;
                        copy[qIndex].fillInAnswers = nextAnswers;
                        setQuestions(copy);
                      }}
                    />

                    {q.fillInAnswers && q.fillInAnswers.length > 0 && (
                      <div style={{ marginTop: 10 }}>
                        <p style={{ fontSize: 12, fontWeight: 600, color: "#000080" }}>Đáp án ô điền:</p>
                        {q.fillInAnswers.map((ans: string, aIdx: number) => (
                          <input
                            key={aIdx}
                            type="text"
                            className="exercise-content"
                            style={{ margin: "4px 0" }}
                            placeholder={`Đáp án ô trống [${aIdx + 1}]`}
                            value={ans}
                            onChange={e => {
                              const copy = [...questions];
                              copy[qIndex].fillInAnswers[aIdx] = e.target.value;
                              setQuestions(copy);
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ── WRITING ORDER WORDS ── */}
                {type === "Sắp xếp từ thành câu" && (
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#666" }}>Câu gợi ý / Câu gốc (tiếng Việt)</label>
                    <input
                      type="text"
                      className="exercise-content"
                      placeholder="Con mèo đang ngủ trên giường."
                      value={q.text || ""}
                      onChange={e => updateQuestionItemField(qIndex, "text", e.target.value)}
                    />
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#666", display: "block", marginTop: 10 }}>Câu tiếng Anh hoàn chỉnh</label>
                    <input
                      type="text"
                      className="exercise-content"
                      placeholder="The cat is sleeping on the bed"
                      value={q.correctSentence || ""}
                      onChange={e => updateQuestionItemField(qIndex, "correctSentence", e.target.value)}
                    />
                  </div>
                )}

                {/* ── WRITING ESSAY ── */}
                {type === "Viết đoạn văn ngắn" && (
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#666" }}>Đề bài viết luận</label>
                    <RichTextarea
                      className="exercise-content"
                      rows={4}
                      placeholder="Write a short letter..."
                      value={q.prompt || ""}
                      onChange={val => updateQuestionItemField(qIndex, "prompt", val)}
                    />
                  </div>
                )}

                {/* ── WRITING ORDER SENTENCES ── */}
                {type === "Sắp xếp câu thành đoạn văn" && (
                  <div>
                    <p style={{ fontSize: 12, color: "#888", marginBottom: 5 }}>Nhập các câu của đoạn văn theo thứ tự đúng logic:</p>
                    {q.sentences?.map((sText: string, sIdx: number) => (
                      <div key={sIdx} style={{ display: "flex", gap: 10, alignItems: "center", margin: "4px 0" }}>
                        <span style={{ fontSize: 12, fontWeight: 600 }}>Câu {sIdx + 1}</span>
                        <input
                          type="text"
                          className="exercise-content"
                          style={{ marginTop: 0 }}
                          value={sText}
                          onChange={e => {
                            const copy = [...questions];
                            copy[qIndex].sentences[sIdx] = e.target.value;
                            setQuestions(copy);
                          }}
                        />
                        {q.sentences.length > 1 && (
                          <button
                            type="button"
                            className="remove-btn"
                            style={{ padding: "2px 6px" }}
                            onClick={() => {
                              const copy = [...questions];
                              copy[qIndex].sentences = copy[qIndex].sentences.filter((_: any, i: number) => i !== sIdx);
                              setQuestions(copy);
                            }}
                          >✕</button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      className="add-content"
                      style={{ padding: "4px 12px", marginTop: 8 }}
                      onClick={() => {
                        const copy = [...questions];
                        copy[qIndex].sentences.push("");
                        setQuestions(copy);
                      }}
                    >+ Thêm câu tiếp theo</button>
                  </div>
                )}

                {/* ── READING SPLIT ── */}
                {type === "Trắc nghiệm đọc hiểu (chia đôi màn hình)" && (
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#666" }}>Bài đọc dài (Hiển thị bên trái)</label>
                    <RichTextarea
                      className="exercise-content"
                      rows={5}
                      placeholder="Nhập bài đọc dài..."
                      value={q.text || ""}
                      onChange={val => updateQuestionItemField(qIndex, "text", val)}
                    />
                    
                    <div style={{ marginTop: 10 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>Các câu hỏi trắc nghiệm của bài đọc này:</p>
                      {q.subQuestions?.map((sub: any, subIdx: number) => (
                        <div key={subIdx} style={{ background: "#ffffff", padding: 16, border: "1px solid #e2e8f0", borderLeft: "3px solid #000080", borderRadius: 8, marginTop: 10, boxShadow: "0 1px 2px rgba(0,0,0,0.01)" }}>
                          <div className="question-block-header">
                            <h5>Câu hỏi {subIdx + 1}</h5>
                            {q.subQuestions.length > 1 && (
                              <button
                                type="button"
                                className="remove-btn"
                                style={{ padding: "2px 6px", fontSize: 11 }}
                                onClick={() => removeSubQuestion(qIndex, subIdx)}
                              >Xóa</button>
                            )}
                          </div>
                          <input
                            type="text"
                            placeholder="Câu hỏi"
                            className="exercise-content"
                            style={{ marginTop: 0 }}
                            value={sub.question}
                            onChange={e => updateSubQuestionField(qIndex, subIdx, "question", e.target.value)}
                          />
                          {["A", "B", "C", "D"].map((lbl, aIdx) => (
                            <input
                              key={lbl}
                              type="text"
                              placeholder={`Lựa chọn ${lbl}`}
                              className="exercise-content"
                              style={{ margin: "5px 0" }}
                              value={sub.answers[aIdx]}
                              onChange={e => updateSubQuestionAnswer(qIndex, subIdx, aIdx, e.target.value)}
                            />
                          ))}
                          <select
                            className="exercise-type"
                            style={{ width: "100%", marginTop: 5 }}
                            value={sub.correct}
                            onChange={e => updateSubQuestionField(qIndex, subIdx, "correct", e.target.value)}
                          >
                            <option value="A">Đáp án đúng: A</option>
                            <option value="B">Đáp án đúng: B</option>
                            <option value="C">Đáp án đúng: C</option>
                            <option value="D">Đáp án đúng: D</option>
                          </select>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="add-content"
                        style={{ padding: "6px 12px", marginTop: 8 }}
                        onClick={() => addSubQuestion(qIndex)}
                      >+ Thêm câu hỏi cho bài đọc</button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            <button type="button" className="add-content" onClick={addQuestionItem}>+ Thêm câu hỏi ({dangBai})</button>
          </div>
        )}

        {/* ── HIỂN THỊ ĐÁP ÁN ── */}
        <div style={{ marginTop: "15px", marginBottom: "15px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={showAnswer}
              onChange={(e) => setShowAnswer(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: "#F95800", cursor: "pointer" }}
            />
            <span style={{ fontSize: 14, color: "#334155" }}>
              Hiển thị đáp án cho học viên sau khi nộp bài
            </span>
          </label>
        </div>

        {/* ── SUBMIT ACTIONS ── */}
        <div style={{ display: "flex", gap: "12px", marginTop: "30px" }}>
          {isMiniTest ? (
            <>
              <button
                type="button"
                className="draft-btn"
                style={{
                  flex: 1,
                  height: "46px",
                  fontSize: "15px",
                  boxSizing: "border-box",
                  padding: "12px",
                  borderRadius: "10px",
                  background: "#fff",
                  border: "1.5px solid #F95800",
                  color: "#F95800",
                  fontWeight: "600",
                  cursor: "pointer",
                  margin: 0,
                  transition: "background 0.2s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
                onClick={() => handleCreate("draft")}
                onMouseOver={(e) => (e.currentTarget.style.background = "#fff4ec")}
                onMouseOut={(e) => (e.currentTarget.style.background = "#fff")}
              >
                Lưu nháp
              </button>
              <button
                type="button"
                className="save-btn"
                style={{
                  flex: 1,
                  height: "46px",
                  fontSize: "15px",
                  boxSizing: "border-box",
                  padding: "12px",
                  borderRadius: "10px",
                  background: "#F95800",
                  border: "1.5px solid #F95800",
                  color: "#fff",
                  fontWeight: "600",
                  cursor: "pointer",
                  margin: 0,
                  boxShadow: "none",
                  transition: "background 0.2s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = "#e36d12")}
                onMouseOut={(e) => (e.currentTarget.style.background = "#F95800")}
                onClick={() => handleCreate("published")}
              >
                Lưu
              </button>
            </>
          ) : isPractice ? (
            <button
              type="button"
              className="save-btn"
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: "10px",
                background: "#F95800",
                border: "1.5px solid #F95800",
                color: "#fff",
                fontWeight: "600",
                cursor: "pointer",
                marginTop: 0,
                boxShadow: "none",
                transition: "background 0.2s"
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = "#e36d12")}
              onMouseOut={(e) => (e.currentTarget.style.background = "#F95800")}
              onClick={() => handleCreate("practice")}
            >
              Tạo bài luyện tập
            </button>
          ) : isQTV ? (
            <button
              type="button"
              className="save-btn"
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: "10px",
                background: "#F95800",
                border: "1.5px solid #F95800",
                color: "#fff",
                fontWeight: "600",
                cursor: "pointer",
                marginTop: 0,
                boxShadow: "none",
                transition: "background 0.2s"
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = "#e36d12")}
              onMouseOut={(e) => (e.currentTarget.style.background = "#F95800")}
              onClick={() => handleCreate("published")}
            >
              Đăng lên
            </button>
          ) : (
            <>
              <button
                type="button"
                className="draft-btn"
                style={{
                  flex: 1,
                  height: "46px",
                  fontSize: "15px",
                  boxSizing: "border-box",
                  padding: "12px",
                  borderRadius: "10px",
                  background: "#fff",
                  border: "1.5px solid #F95800",
                  color: "#F95800",
                  fontWeight: "600",
                  cursor: "pointer",
                  margin: 0,
                  transition: "background 0.2s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
                onClick={() => handleCreate("draft")}
                onMouseOver={(e) => (e.currentTarget.style.background = "#fff4ec")}
                onMouseOut={(e) => (e.currentTarget.style.background = "#fff")}
              >
                Lưu nháp
              </button>
              <button
                type="button"
                className="save-btn"
                style={{
                  flex: 1,
                  height: "46px",
                  fontSize: "15px",
                  boxSizing: "border-box",
                  padding: "12px",
                  borderRadius: "10px",
                  background: "#F95800",
                  border: "1.5px solid #F95800",
                  color: "#fff",
                  fontWeight: "600",
                  cursor: "pointer",
                  margin: 0,
                  boxShadow: "none",
                  transition: "background 0.2s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = "#e36d12")}
                onMouseOut={(e) => (e.currentTarget.style.background = "#F95800")}
                onClick={() => handleCreate(isTeacher ? "pending" : "published")}
              >
                Gửi duyệt
              </button>
            </>
          )}
        </div>
      </div>
      )}

      {/* SUCCESS OVERLAY */}
      {showSuccess && (
        <div className="success-overlay">
          <div className="success-popup">
            <div className="check-icon">✓</div>
            <p>{successMessage}</p>
          </div>
        </div>
      )}
      {renderFormattingToolbar()}

      {confirmDialog.show && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99999
        }} onClick={() => setConfirmDialog(p => ({ ...p, show: false }))}>
          <div style={{
            background: "white", borderRadius: "12px", width: "450px", maxWidth: "90%",
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
            border: "1px solid #e2e8f0", overflow: "hidden", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderBottom: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "16px", fontWeight: 700, color: "#1e293b" }}>{confirmDialog.title}</span>
              <button type="button" onClick={() => setConfirmDialog(p => ({ ...p, show: false }))} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: "#64748b", padding: 0, display: "flex", alignItems: "center" }}>&times;</button>
            </div>
            <div style={{ padding: "20px 24px", textAlign: "left" }}>
              <p style={{ margin: "0 0 12px 0", fontSize: "14px", color: "#1e293b", lineHeight: "1.6" }}>
                {confirmDialog.message}
              </p>
              <p style={{ margin: "0 0 24px 0", fontSize: "14px", color: "#475569" }}>
                <strong>Lưu ý:</strong> Xóa xong không thể khôi phục lại được
              </p>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <button
                  type="button"
                  onClick={() => setConfirmDialog(p => ({ ...p, show: false }))}
                  style={{
                    padding: "8px 16px", background: "#f1f5f9", color: "#334155", border: "1px solid #cbd5e1",
                    borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: 600
                  }}
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmDialog(p => ({ ...p, show: false }));
                    if (confirmDialog.onConfirm) confirmDialog.onConfirm();
                  }}
                  style={{
                    padding: "8px 16px", background: "#c20e0e", color: "white", border: "none",
                    borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: 700
                  }}
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaoBaiTap;

