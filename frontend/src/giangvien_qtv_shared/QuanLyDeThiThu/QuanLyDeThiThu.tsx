import "./QuanLyDeThiThu.css";
import { useState, useEffect, useRef } from "react";
import {
  FiArrowLeft,
  FiFileText,
  FiTrash2,
  FiPlus,
  FiClock,
  FiCopy,
  FiEye,
  FiUpload,
  FiDownload,
  FiEdit,
  FiArrowUp,
  FiArrowDown,
  FiCheckCircle,
  FiX
} from "react-icons/fi";

interface CauHoi {
  id: number;
  noiDung: string;
  luaChon: string[];
  dapAn: string;
}

interface ListeningPart {
  soPhan: number;
  tieuDe: string;
  huongDan: string;
  audioUrl: string;
  audioName?: string;
  cauHois: CauHoi[];
}

interface ReadingPart {
  soPhan: number;
  tieuDe: string;
  huongDan: string;
  doanVan: string;
  cauHois: CauHoi[];
}

interface WritingPart {
  soPhan: number;
  tieuDe: string;
  huongDan: string;
  yeuCau: string;
  noiDung: string;
  soTuToiThieu: number;
  loaiBai?: string;
  goiY?: string;
}

interface SpeakingPart {
  soPhan: number;
  tieuDe: string;
  moTa: string;
  audioUrl?: string;
  audioName?: string;
  noiDung: string;
  thoiGianChuanBi?: number;
  thoiGianNoi: number;
  imageUrl?: string;
  imageName?: string;
}

interface BaiTest {
  MaBaiTest: number;
  TieuDe: string;
  MoTa: string;
  TongThoiGian: number;
  CapDo: string;
  LoaiBai: string;
  NgayTao: string;
  TrangThai: string; // "published" | "draft"
  kyNang: {
    listening: { thoiGian?: number; parts: ListeningPart[] };
    reading: { thoiGian?: number; parts: ReadingPart[] };
    writing: { thoiGian?: number; parts: WritingPart[] };
    speaking: { thoiGian?: number; parts: SpeakingPart[] };
  };
}

const ensureSkillTimes = (test: BaiTest): BaiTest => {
  const updated = { ...test };
  if (!updated.kyNang.listening) {
    updated.kyNang.listening = { parts: [] };
  }
  if (!updated.kyNang.listening.thoiGian) {
    updated.kyNang.listening.thoiGian = 45 * 60;
  }
  
  if (!updated.kyNang.reading) {
    updated.kyNang.reading = { parts: [] };
  }
  if (!updated.kyNang.reading.thoiGian) {
    updated.kyNang.reading.thoiGian = 60 * 60;
  }
  
  if (!updated.kyNang.writing) {
    updated.kyNang.writing = { parts: [] };
  }
  if (!updated.kyNang.writing.thoiGian) {
    updated.kyNang.writing.thoiGian = 60 * 60;
  }
  
  if (!updated.kyNang.speaking) {
    updated.kyNang.speaking = { parts: [] };
  }
  if (!updated.kyNang.speaking.thoiGian) {
    if (updated.kyNang.speaking.parts?.[0]?.thoiGianNoi) {
      updated.kyNang.speaking.thoiGian = updated.kyNang.speaking.parts[0].thoiGianNoi;
    } else {
      updated.kyNang.speaking.thoiGian = 12 * 60;
    }
  }
  
  if (!updated.kyNang.speaking.parts?.[0]) {
    updated.kyNang.speaking.parts[0] = {
      soPhan: 1,
      tieuDe: "Speaking Part 1",
      moTa: "Speaking Practice",
      audioUrl: "",
      noiDung: "",
      thoiGianChuanBi: 60,
      thoiGianNoi: updated.kyNang.speaking.thoiGian
    };
  } else {
    updated.kyNang.speaking.parts[0].thoiGianNoi = updated.kyNang.speaking.thoiGian;
  }
  
  return updated;
};

const DEFAULT_TESTS: BaiTest[] = [
  {
    MaBaiTest: 1,
    TieuDe: "VSTEP B1 - Đề thi mẫu số 1",
    MoTa: "Đề thi thử VSTEP trình độ B1 bao gồm đầy đủ 4 kỹ năng: Nghe, Đọc, Viết và Nói.",
    TongThoiGian: 177,
    CapDo: "B1",
    LoaiBai: "VSTEP",
    NgayTao: "2026-01-10T00:00:00.000Z",
    TrangThai: "published",
    kyNang: {
      listening: {
        parts: [
          {
            soPhan: 1,
            tieuDe: "Part 1: Short Conversations",
            huongDan: "In this part, you will hear EIGHT short recordings. For each question, choose the correct answer A, B, C or D.",
            audioUrl: "/coffee-shop.mp3",
            cauHois: [
              { id: 1, noiDung: "What music will they have at the party?", luaChon: ["A. guitar", "B. cello", "C. CDs", "D. piano"], dapAn: "D" },
              { id: 2, noiDung: "What is the man's problem?", luaChon: ["A. He lost his wallet", "B. He missed his flight", "C. He forgot his passport", "D. He is late for work"], dapAn: "B" }
            ]
          }
        ]
      },
      reading: {
        parts: [
          {
            soPhan: 1,
            tieuDe: "Part 1: Reading Comprehension",
            huongDan: "Directions: Read the questions below and select the correct answer A, B, C or D.",
            doanVan: "It is estimated that over 99 percent of all species that ever existed have become extinct. When a species is no longer adapted to a changed environment, it may perish.",
            cauHois: [
              { id: 1, noiDung: "The word 'it' in the paragraph refers to", luaChon: ["A. extinction", "B. species", "C. environment", "D. 99 percent"], dapAn: "A" },
              { id: 2, noiDung: "What causes extinction according to the text?", luaChon: ["A. Rapid adaptation", "B. Environmental change and lack of adaptation", "C. Human conservation", "D. Abundant food resources"], dapAn: "B" }
            ]
          }
        ]
      },
      writing: {
        parts: [
          {
            soPhan: 1,
            tieuDe: "Writing Part 1",
            huongDan: "You should spend about 20 minutes on this task.",
            yeuCau: "Email",
            noiDung: "I'm a rock fan. What about you? What is your favorite song? Write to tell me more.",
            soTuToiThieu: 120
          },
          {
            soPhan: 2,
            tieuDe: "Writing Part 2",
            huongDan: "You should spend about 40 minutes on this task.",
            yeuCau: "Essay",
            noiDung: "Technology makes our lives easier and more convenient. Discuss both sides and give your opinion.",
            soTuToiThieu: 250
          }
        ]
      },
      speaking: {
        parts: [
          {
            soPhan: 1,
            tieuDe: "Speaking Part 1: Social Interaction",
            moTa: "Speaking practice for part 1",
            audioUrl: "/coffee-shop.mp3",
            noiDung: "What do you usually do in the morning? What are your hobbies and why?",
            thoiGianChuanBi: 60,
            thoiGianNoi: 180
          }
        ]
      }
    }
  },
  {
    MaBaiTest: 2,
    TieuDe: "VSTEP B2 - Đề thi mẫu số 2",
    MoTa: "Đề thi thử VSTEP trình độ B2 với câu hỏi nâng cao hơn cho cả 4 kỹ năng.",
    TongThoiGian: 177,
    CapDo: "B2",
    LoaiBai: "VSTEP",
    NgayTao: "2026-02-15T00:00:00.000Z",
    TrangThai: "published",
    kyNang: {
      listening: {
        parts: [
          {
            soPhan: 1,
            tieuDe: "Part 1: News and Reports",
            huongDan: "Listen to the report and answer the following questions.",
            audioUrl: "/job-interview.mp3",
            cauHois: [
              { id: 1, noiDung: "How does the reporter feel about the new policy?", luaChon: ["A. Skeptical", "B. Enthusiastic", "C. Neutral", "D. Anxious"], dapAn: "B" }
            ]
          }
        ]
      },
      reading: {
        parts: [
          {
            soPhan: 1,
            tieuDe: "Part 1: Academic Reading",
            huongDan: "Read the essay and select correct responses.",
            doanVan: "The Industrial Revolution fundamentally changed global manufacturing systems, moving production from homes to factories.",
            cauHois: [
              { id: 1, noiDung: "What was the main shift during the Industrial Revolution?", luaChon: ["A. Cottage to factories", "B. Factories to cottages", "C. Cities to farms", "D. Manual to solar energy"], dapAn: "A" }
            ]
          }
        ]
      },
      writing: {
        parts: [
          {
            soPhan: 1,
            tieuDe: "Writing Part 1",
            huongDan: "Write an email responding to this request.",
            yeuCau: "Email",
            noiDung: "Tell us about your work experience.",
            soTuToiThieu: 120
          },
          {
            soPhan: 2,
            tieuDe: "Writing Part 2",
            huongDan: "Write an essay about environment.",
            yeuCau: "Essay",
            noiDung: "Should cars be banned in city centers?",
            soTuToiThieu: 250
          }
        ]
      },
      speaking: {
        parts: [
          {
            soPhan: 1,
            tieuDe: "Speaking Part 1",
            moTa: "Speaking practice B2",
            audioUrl: "/job-interview.mp3",
            noiDung: "Talk about a recent book you read.",
            thoiGianChuanBi: 60,
            thoiGianNoi: 180
          }
        ]
      }
    }
  }
];

// ContentEditable Custom RichTextEditor
const RichTextEditor = ({
  value,
  onChange,
  id,
  placeholder,
  minHeight = "100px",
  style
}: {
  value: string;
  onChange: (val: string) => void;
  id: string;
  placeholder?: string;
  minHeight?: string;
  style?: React.CSSProperties;
}) => {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const applyStyle = (command: string) => {
    document.execCommand(command, false);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div style={{ width: "100%", boxSizing: "border-box", ...style }}>
      <div style={{
        display: "flex", gap: "6px", marginBottom: "6px", background: "#f8fafc",
        padding: "4px 8px", borderRadius: "6px", border: "1px solid #cbd5e1",
        width: "fit-content", boxSizing: "border-box"
      }}>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => applyStyle("bold")}
          style={{ background: "none", border: "none", fontSize: "11px", fontWeight: "bold", cursor: "pointer", padding: "2px 6px", borderRadius: "3px", color: "#334155" }}
          title="In đậm"
        >
          B
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => applyStyle("italic")}
          style={{ background: "none", border: "none", fontSize: "11px", fontStyle: "italic", cursor: "pointer", padding: "2px 6px", borderRadius: "3px", color: "#334155" }}
          title="In nghiêng"
        >
          I
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => applyStyle("underline")}
          style={{ background: "none", border: "none", fontSize: "11px", textDecoration: "underline", cursor: "pointer", padding: "2px 6px", borderRadius: "3px", color: "#334155" }}
          title="Gạch chân"
        >
          U
        </button>
      </div>

      <div
        ref={editorRef}
        id={id}
        contentEditable
        onInput={() => {
          if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
          }
        }}
        style={{
          border: "1px solid #cbd5e1",
          borderRadius: "8px",
          padding: "10px",
          minHeight: minHeight,
          background: "white",
          outline: "none",
          overflowY: "auto",
          width: "100%",
          boxSizing: "border-box",
          lineHeight: "1.5"
        }}
        {...({ placeholder } as any)}
      />
    </div>
  );
};

const QuanLyDeThiThu = () => {
  const user = JSON.parse(sessionStorage.getItem("user") || localStorage.getItem("user") || "{}");
  const isQTV = user?.VaiTro === "Quản Trị Nội Dung";

  const [tests, setTests] = useState<BaiTest[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (searchTerm === "") {
      setSearchQuery("");
    }
  }, [searchTerm]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSearchQuery(searchTerm);
  };

  // Submissions & Grading Management
  const [activeTab, setActiveTab] = useState<"tests" | "submissions">("tests");
  
  interface BaiNopHocVien {
    id: number;
    hoTen: string;
    maSinhVien: string;
    tenDeThi: string;
    ngayNop: string;
    diemNghe: number;
    diemDoc: number;
    diemViet: number | null;
    diemNoi: number | null;
    nhanXetViet?: string;
    nhanXetNoi?: string;
    yeuCauChamViet: boolean;
    yeuCauChamNoi: boolean;
    baiLamViet: string[];
    baiLamNoi: string[];
  }

  const [submissions, setSubmissions] = useState<BaiNopHocVien[]>([]);

  const [selectedSubmission, setSelectedSubmission] = useState<BaiNopHocVien | null>(null);
  const [gradingSkillTab, setGradingSkillTab] = useState<"listening" | "reading" | "writing" | "speaking">("writing");
  const [gradeViet, setGradeViet] = useState<string>("");
  const [feedbackViet, setFeedbackViet] = useState<string>("");
  const [gradeNoi, setGradeNoi] = useState<string>("");
  const [feedbackNoi, setFeedbackNoi] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string>("");
  const [subSearch, setSubSearch] = useState("");
  const [subStatusFilter, setSubStatusFilter] = useState<"all" | "pending" | "graded">("all");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleOpenGrading = (sub: BaiNopHocVien) => {
    setSelectedSubmission(sub);
    setGradeViet(sub.diemViet !== null ? String(sub.diemViet) : "");
    setFeedbackViet(sub.nhanXetViet || "");
    setGradeNoi(sub.diemNoi !== null ? String(sub.diemNoi) : "");
    setFeedbackNoi(sub.nhanXetNoi || "");
    setGradingSkillTab(sub.diemViet === null ? "writing" : sub.diemNoi === null ? "speaking" : "writing");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSaveGrades = async () => {
    if (!selectedSubmission) return;

    const gV = gradeViet.trim() === "" ? null : Number(gradeViet);
    const gN = gradeNoi.trim() === "" ? null : Number(gradeNoi);

    if (gV !== null && (isNaN(gV) || gV < 0 || gV > 10)) {
      alert("Điểm viết phải là số từ 0 đến 10.");
      return;
    }
    if (gN !== null && (isNaN(gN) || gN < 0 || gN > 10)) {
      alert("Điểm nói phải là số từ 0 đến 10.");
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/dethi/submissions/${selectedSubmission.id}/grade`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          diemViet: gV,
          nhanXetViet: feedbackViet,
          diemNoi: gN,
          nhanXetNoi: feedbackNoi
        })
      });

      if (res.ok) {
        await loadSubmissions();
        setSelectedSubmission(null);
        showToast(`Đã lưu điểm bài thi của ${selectedSubmission.hoTen} thành công!`);
      } else {
        const errData = await res.json();
        alert("Lỗi khi lưu điểm: " + errData.message);
      }
    } catch (err) {
      console.error("Lỗi khi lưu điểm chấm thi thử:", err);
      alert("Lỗi kết nối khi lưu điểm chấm.");
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("http://localhost:5000/upload", {
      method: "POST",
      body: formData
    });
    if (!res.ok) throw new Error("Upload failed");
    const data = await res.json();
    return data.url || "";
  };

  const getMediaUrl = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("http") || url.startsWith("blob:") || url.startsWith("data:")) return url;
    return `http://localhost:5000${url}`;
  };

  // Modals & Active objects
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewTest, setPreviewTest] = useState<BaiTest | null>(null);
  const [editingTest, setEditingTest] = useState<BaiTest | null>(null);

  // Workspace Skill subtab
  const [workspaceSkill, setWorkspaceSkill] = useState<"listening" | "reading" | "writing" | "speaking">("listening");

  // Form states inside active parts
  const [activePartIdx, setActivePartIdx] = useState<number>(0);
  const [newQText, setNewQText] = useState("");
  const [optA, setOptA] = useState("");
  const [optB, setOptB] = useState("");
  const [optC, setOptC] = useState("");
  const [optD, setOptD] = useState("");
  const [correctOpt, setCorrectOpt] = useState("A");

  // Question validation errors
  const [addQuestionError, setAddQuestionError] = useState("");
  const [addAnswersError, setAddAnswersError] = useState("");

  // Inline Question Edit states
  const [editingQuestionIdx, setEditingQuestionIdx] = useState<number | null>(null);
  const [editQText, setEditQText] = useState("");
  const [editOptA, setEditOptA] = useState("");
  const [editOptB, setEditOptB] = useState("");
  const [editOptC, setEditOptC] = useState("");
  const [editOptD, setEditOptD] = useState("");
  const [editCorrectOpt, setEditCorrectOpt] = useState("A");

  // Import states
  const [importedQuestions, setImportedQuestions] = useState<CauHoi[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importingPartIdx, setImportingPartIdx] = useState<number | null>(null);

  // Custom popup states
  const [showExitConfirmPopup, setShowExitConfirmPopup] = useState(false);
  const [showDeleteConfirmPopup, setShowDeleteConfirmPopup] = useState(false);
  const [testIdToDelete, setTestIdToDelete] = useState<number | null>(null);
  const [testTitleError, setTestTitleError] = useState("");
  const [showDeletePartConfirmPopup, setShowDeletePartConfirmPopup] = useState(false);
  const [deletePartInfo, setDeletePartInfo] = useState<{ skill: "listening" | "reading" | "writing"; partIdx: number } | null>(null);

  const originalTestRef = useRef<string>("");
  const isExitingRef = useRef<boolean>(false);
  const checkIsDirtyRef = useRef<() => boolean>(() => false);

  checkIsDirtyRef.current = () => {
    if (!editingTest || !originalTestRef.current) return false;
    const testChanged = JSON.stringify(editingTest) !== originalTestRef.current;
    const questionFormDirty = !!(
      newQText.trim() || 
      optA.trim() || 
      optB.trim() || 
      optC.trim() || 
      optD.trim() ||
      editQText.trim() ||
      editOptA.trim() ||
      editOptB.trim() ||
      editOptC.trim() ||
      editOptD.trim()
    );
    return testChanged || questionFormDirty;
  };

  const loadTests = async () => {
    try {
      const res = await fetch("http://localhost:5000/dethi");
      if (res.ok) {
        const data = await res.json();
        const mappedTests = data.map((t: any) => ({
          MaBaiTest: t.MaDeThi,
          TieuDe: t.TieuDe,
          MoTa: t.MoTa,
          TongThoiGian: t.ThoiGian,
          CapDo: t.CapDo || "B1",
          LoaiBai: t.LoaiBai || "VSTEP",
          NgayTao: t.NgayTao,
          TrangThai: t.TrangThai,
          TrangThaiDuyet: t.TrangThaiDuyet,
          kyNang: (() => {
            try {
              const parsed = typeof t.NoiDungDeThi === "string" ? JSON.parse(t.NoiDungDeThi) : t.NoiDungDeThi;
              return parsed && typeof parsed === "object" ? {
                listening: parsed.listening || { parts: [] },
                reading: parsed.reading || { parts: [] },
                writing: parsed.writing || { parts: [] },
                speaking: parsed.speaking || { parts: [] }
              } : { listening: { parts: [] }, reading: { parts: [] }, writing: { parts: [] }, speaking: { parts: [] } };
            } catch (err) {
              return { listening: { parts: [] }, reading: { parts: [] }, writing: { parts: [] }, speaking: { parts: [] } };
            }
          })()
        }));
        setTests(mappedTests);
      } else {
        setTests([]);
      }
    } catch (e) {
      console.error("Lỗi khi kết nối API lấy đề thi:", e);
      let localTests = localStorage.getItem("flic_practice_tests");
      if (!localTests) {
        localStorage.setItem("flic_practice_tests", JSON.stringify(DEFAULT_TESTS));
        localTests = JSON.stringify(DEFAULT_TESTS);
      }
      try {
        setTests(JSON.parse(localTests));
      } catch (err) {
        setTests(DEFAULT_TESTS);
      }
    }
  };

  const loadSubmissions = async () => {
    try {
      const res = await fetch("http://localhost:5000/dethi/submissions");
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data);
      } else {
        setSubmissions([]);
      }
    } catch (e) {
      console.error("Lỗi khi lấy danh sách bài nộp thi thử:", e);
      setSubmissions([]);
    }
  };

  useEffect(() => {
    loadTests();
    loadSubmissions();
  }, []);

  // Page leave warnings for beforeunload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (editingTest && checkIsDirtyRef.current()) {
        e.preventDefault();
        e.returnValue = "Bạn có muốn rời khỏi thiết kế đề thi? Các thay đổi chưa lưu sẽ bị mất.";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [editingTest]);

  // History state manager for popstate (browser back button)
  useEffect(() => {
    if (editingTest) {
      isExitingRef.current = false;
      originalTestRef.current = JSON.stringify(editingTest);
      
      window.history.pushState({ isDesigning: true }, "");

      const handlePopState = () => {
        if (isExitingRef.current) return;
        
        if (checkIsDirtyRef.current()) {
          setShowExitConfirmPopup(true);
          window.history.pushState({ isDesigning: true }, "");
        } else {
          isExitingRef.current = true;
          setEditingTest(null);
        }
      };

      window.addEventListener("popstate", handlePopState);

      return () => {
        window.removeEventListener("popstate", handlePopState);
      };
    }
  }, [editingTest]);

  const handleLeaveEditor = () => {
    if (checkIsDirtyRef.current()) {
      setShowExitConfirmPopup(true);
    } else {
      isExitingRef.current = true;
      setEditingTest(null);
      window.history.back();
    }
  };

  const handleStartCreateWizard = () => {
    const newTestItem: BaiTest = {
      MaBaiTest: Date.now(),
      TieuDe: "",
      MoTa: "",
      TongThoiGian: 177,
      CapDo: "B1",
      LoaiBai: "VSTEP",
      NgayTao: new Date().toISOString(),
      TrangThai: "draft",
      kyNang: {
        listening: {
          thoiGian: 45 * 60,
          parts: [
            { soPhan: 1, tieuDe: "Listening Part 1", huongDan: "Listen and choose the best answers.", audioUrl: "", cauHois: [] }
          ]
        },
        reading: {
          thoiGian: 60 * 60,
          parts: [
            { soPhan: 1, tieuDe: "Reading Part 1", huongDan: "Read the passage and choose the best answers.", doanVan: "", cauHois: [] }
          ]
        },
        writing: {
          thoiGian: 60 * 60,
          parts: [
            { soPhan: 1, tieuDe: "Writing Part 1", huongDan: "You should spend about 20 minutes on this task.", yeuCau: "Email", noiDung: "", soTuToiThieu: 120 }
          ]
        },
        speaking: {
          thoiGian: 12 * 60,
          parts: [
            { soPhan: 1, tieuDe: "Speaking Part 1", moTa: "Speaking practice", audioUrl: "", noiDung: "", thoiGianChuanBi: 60, thoiGianNoi: 12 * 60 }
          ]
        }
      }
    };
    setEditingTest(newTestItem);
    setWorkspaceSkill("listening");
    setActivePartIdx(0);
    setImportedQuestions([]);
    setImportErrors([]);
    setAddQuestionError("");
    setAddAnswersError("");
    setTestTitleError("");
  };

  const handleCloneTest = async (testToClone: BaiTest) => {
    const bodyData = {
      TieuDe: `Bản sao ${testToClone.TieuDe}`,
      MoTa: testToClone.MoTa,
      ThoiGian: testToClone.TongThoiGian,
      CapDo: testToClone.CapDo,
      LoaiBai: testToClone.LoaiBai,
      NoiDungDeThi: JSON.stringify(testToClone.kyNang),
      TrangThai: "draft",
      MaNguoiDung: user.MaNguoiDung
    };

    try {
      const res = await fetch("http://localhost:5000/dethi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData)
      });
      if (res.ok) {
        await loadTests();
      } else {
        alert("Lỗi sao chép đề thi.");
      }
    } catch (err) {
      console.error(err);
      const clonedTest: BaiTest = {
        ...testToClone,
        MaBaiTest: Date.now(),
        TieuDe: `Bản sao ${testToClone.TieuDe}`,
        NgayTao: new Date().toISOString(),
        kyNang: JSON.parse(JSON.stringify(testToClone.kyNang))
      };
      const updated = [clonedTest, ...tests];
      localStorage.setItem("flic_practice_tests", JSON.stringify(updated));
      setTests(updated);
    }
  };

  const handleDeleteTest = (maBaiTest: number) => {
    setTestIdToDelete(maBaiTest);
    setShowDeleteConfirmPopup(true);
  };

  const handleOpenPreview = (test: BaiTest) => {
    setPreviewTest(test);
    setShowPreviewModal(true);
  };

  const handleOpenEditWorkspace = (test: BaiTest) => {
    setEditingTest(ensureSkillTimes(JSON.parse(JSON.stringify(test))));
    setWorkspaceSkill("listening");
    setActivePartIdx(0);
    setImportedQuestions([]);
    setImportErrors([]);
    setEditingQuestionIdx(null);
    setAddQuestionError("");
    setAddAnswersError("");
  };

  const handleAddListeningPart = () => {
    if (!editingTest) return;
    const parts = editingTest.kyNang.listening.parts || [];
    const newPart: ListeningPart = {
      soPhan: parts.length + 1,
      tieuDe: `Listening Part ${parts.length + 1}`,
      huongDan: "Nghe đoạn băng và trả lời các câu hỏi.",
      audioUrl: "",
      cauHois: []
    };
    const updated = { ...editingTest };
    updated.kyNang.listening.parts = [...parts, newPart];
    setEditingTest(updated);
    setActivePartIdx(parts.length);
    setAddQuestionError("");
    setAddAnswersError("");
  };

  const handleAddReadingPart = () => {
    if (!editingTest) return;
    const parts = editingTest.kyNang.reading.parts || [];
    const newPart: ReadingPart = {
      soPhan: parts.length + 1,
      tieuDe: `Reading Part ${parts.length + 1}`,
      huongDan: "Đọc đoạn văn và trả lời các câu hỏi bên dưới.",
      doanVan: "",
      cauHois: []
    };
    const updated = { ...editingTest };
    updated.kyNang.reading.parts = [...parts, newPart];
    setEditingTest(updated);
    setActivePartIdx(parts.length);
    setAddQuestionError("");
    setAddAnswersError("");
  };

  const handleAddWritingPart = () => {
    if (!editingTest) return;
    const parts = editingTest.kyNang.writing.parts || [];
    const newPart: WritingPart = {
      soPhan: parts.length + 1,
      tieuDe: `Writing Part ${parts.length + 1}`,
      huongDan: "You should spend about 20 minutes on this task. You have received this email from an English-speaking friend, Alex. Read part of his email below.",
      yeuCau: "Write an email responding to him, giving advice on travel routes, transportation, and accommodation. You should write at least 120 words. Do not include your name. Your response will be evaluated in terms of Task Fulfillment, Organization, Vocabulary and Grammar.",
      noiDung: "Write your prompt details here...",
      soTuToiThieu: 120,
      loaiBai: "Email"
    };
    const updated = { ...editingTest };
    updated.kyNang.writing.parts = [...parts, newPart];
    setEditingTest(updated);
    setActivePartIdx(parts.length);
    setAddQuestionError("");
    setAddAnswersError("");
  };

  const handleDeletePart = (skill: "listening" | "reading" | "writing", partIdx: number) => {
    if (!editingTest) return;
    setDeletePartInfo({ skill, partIdx });
    setShowDeletePartConfirmPopup(true);
  };

  const handleConfirmDeletePart = () => {
    if (!editingTest || !deletePartInfo) return;
    const { skill, partIdx } = deletePartInfo;
    const updated = { ...editingTest };
    if (skill === "listening") {
      const filtered = updated.kyNang.listening.parts.filter((_, i) => i !== partIdx)
        .map((p, i) => ({ ...p, soPhan: i + 1 }));
      updated.kyNang.listening.parts = filtered;
    } else if (skill === "reading") {
      const filtered = updated.kyNang.reading.parts.filter((_, i) => i !== partIdx)
        .map((p, i) => ({ ...p, soPhan: i + 1 }));
      updated.kyNang.reading.parts = filtered;
    } else if (skill === "writing") {
      const filtered = updated.kyNang.writing.parts.filter((_, i) => i !== partIdx)
        .map((p, i) => ({ ...p, soPhan: i + 1 }));
      updated.kyNang.writing.parts = filtered;
    }
    setEditingTest(updated);
    setActivePartIdx(0);
    setAddQuestionError("");
    setAddAnswersError("");
    setShowDeletePartConfirmPopup(false);
    setDeletePartInfo(null);
  };

  const handleListeningAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>, partIdx: number) => {
    const file = e.target.files?.[0];
    if (!file || !editingTest) return;
    try {
      const serverUrl = await uploadFile(file);
      const updated = { ...editingTest };
      updated.kyNang.listening.parts[partIdx].audioUrl = serverUrl;
      updated.kyNang.listening.parts[partIdx].audioName = file.name;
      setEditingTest(updated);
    } catch (err) {
      console.error("Lỗi upload file âm thanh:", err);
      alert("Lỗi khi tải file âm thanh lên server.");
    }
  };

  const handleSpeakingAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingTest) return;
    try {
      const serverUrl = await uploadFile(file);
      const updated = { ...editingTest };
      if (!updated.kyNang.speaking.parts[0]) {
        updated.kyNang.speaking.parts[0] = { soPhan: 1, tieuDe: "Speaking Part 1", moTa: "Speaking Practice", audioUrl: "", noiDung: "", thoiGianChuanBi: 60, thoiGianNoi: 180 };
      }
      updated.kyNang.speaking.parts[0].audioUrl = serverUrl;
      updated.kyNang.speaking.parts[0].audioName = file.name;
      setEditingTest(updated);
    } catch (err) {
      console.error("Lỗi upload file âm thanh:", err);
      alert("Lỗi khi tải file âm thanh lên server.");
    }
  };

  const handleSpeakingImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingTest) return;
    try {
      const serverUrl = await uploadFile(file);
      const updated = { ...editingTest };
      if (!updated.kyNang.speaking.parts[0]) {
        updated.kyNang.speaking.parts[0] = { soPhan: 1, tieuDe: "Speaking Part 1", moTa: "Speaking Practice", audioUrl: "", noiDung: "", thoiGianChuanBi: 60, thoiGianNoi: 180 };
      }
      updated.kyNang.speaking.parts[0].imageUrl = serverUrl;
      updated.kyNang.speaking.parts[0].imageName = file.name;
      setEditingTest(updated);
    } catch (err) {
      console.error("Lỗi upload file ảnh:", err);
      alert("Lỗi khi tải file ảnh lên server.");
    }
  };

  const handleAddManualQuestion = (e: React.FormEvent, skill: "listening" | "reading", partIdx: number) => {
    e.preventDefault();
    if (!editingTest) return;

    let hasError = false;
    setAddQuestionError("");
    setAddAnswersError("");

    const cleanedQText = newQText.replace(/<[^>]*>/g, "").trim();
    if (!cleanedQText) {
      setAddQuestionError("Vui lòng nhập câu hỏi.");
      hasError = true;
    }

    if (!optA.trim() || !optB.trim() || !optC.trim() || !optD.trim()) {
      setAddAnswersError("Vui lòng nhập câu trả lời.");
      hasError = true;
    }

    if (hasError) return;

    const newQ: CauHoi = {
      id: 1,
      noiDung: newQText,
      luaChon: [
        `A. ${optA}`,
        `B. ${optB}`,
        `C. ${optC}`,
        `D. ${optD}`
      ],
      dapAn: correctOpt
    };

    const updated = { ...editingTest };
    if (skill === "listening") {
      const part = updated.kyNang.listening.parts[partIdx];
      const newQs = [...part.cauHois, newQ].map((q, i) => ({ ...q, id: i + 1 }));
      updated.kyNang.listening.parts[partIdx] = { ...part, cauHois: newQs };
    } else {
      const part = updated.kyNang.reading.parts[partIdx];
      const newQs = [...part.cauHois, newQ].map((q, i) => ({ ...q, id: i + 1 }));
      updated.kyNang.reading.parts[partIdx] = { ...part, cauHois: newQs };
    }

    setEditingTest(updated);

    setNewQText("");
    setOptA("");
    setOptB("");
    setOptC("");
    setOptD("");
    setCorrectOpt("A");
    setAddQuestionError("");
    setAddAnswersError("");
  };

  const handleDeleteQuestion = (skill: "listening" | "reading", partIdx: number, qIdx: number) => {
    if (!editingTest) return;
    const updated = { ...editingTest };
    if (skill === "listening") {
      const part = updated.kyNang.listening.parts[partIdx];
      const filtered = part.cauHois.filter((_, i) => i !== qIdx).map((q, i) => ({ ...q, id: i + 1 }));
      updated.kyNang.listening.parts[partIdx] = { ...part, cauHois: filtered };
    } else {
      const part = updated.kyNang.reading.parts[partIdx];
      const filtered = part.cauHois.filter((_, i) => i !== qIdx).map((q, i) => ({ ...q, id: i + 1 }));
      updated.kyNang.reading.parts[partIdx] = { ...part, cauHois: filtered };
    }
    setEditingTest(updated);
    setEditingQuestionIdx(null);
  };

  const handleMoveQuestion = (skill: "listening" | "reading", partIdx: number, qIdx: number, direction: "up" | "down") => {
    if (!editingTest) return;
    const updated = { ...editingTest };
    const targetIdx = direction === "up" ? qIdx - 1 : qIdx + 1;

    if (skill === "listening") {
      const part = updated.kyNang.listening.parts[partIdx];
      if (targetIdx < 0 || targetIdx >= part.cauHois.length) return;
      const swapped = [...part.cauHois];
      const temp = swapped[qIdx];
      swapped[qIdx] = swapped[targetIdx];
      swapped[targetIdx] = temp;
      updated.kyNang.listening.parts[partIdx] = { ...part, cauHois: swapped.map((q, i) => ({ ...q, id: i + 1 })) };
    } else {
      const part = updated.kyNang.reading.parts[partIdx];
      if (targetIdx < 0 || targetIdx >= part.cauHois.length) return;
      const swapped = [...part.cauHois];
      const temp = swapped[qIdx];
      swapped[qIdx] = swapped[targetIdx];
      swapped[targetIdx] = temp;
      updated.kyNang.reading.parts[partIdx] = { ...part, cauHois: swapped.map((q, i) => ({ ...q, id: i + 1 })) };
    }
    setEditingTest(updated);
    setEditingQuestionIdx(null);
  };

  const handleStartEditQuestion = (idx: number, q: CauHoi) => {
    setEditingQuestionIdx(idx);
    setEditQText(q.noiDung);
    setEditOptA(q.luaChon[0]?.replace(/^A\.\s*/i, "") || "");
    setEditOptB(q.luaChon[1]?.replace(/^B\.\s*/i, "") || "");
    setEditOptC(q.luaChon[2]?.replace(/^C\.\s*/i, "") || "");
    setEditOptD(q.luaChon[3]?.replace(/^D\.\s*/i, "") || "");
    setEditCorrectOpt(q.dapAn);
  };

  const handleSaveQuestionEdit = (skill: "listening" | "reading", partIdx: number, qIdx: number) => {
    if (!editingTest) return;
    const updated = { ...editingTest };

    const newQ: CauHoi = {
      id: qIdx + 1,
      noiDung: editQText,
      luaChon: [
        `A. ${editOptA}`,
        `B. ${editOptB}`,
        `C. ${editOptC}`,
        `D. ${editOptD}`
      ],
      dapAn: editCorrectOpt
    };

    if (skill === "listening") {
      const part = updated.kyNang.listening.parts[partIdx];
      const copyQs = [...part.cauHois];
      copyQs[qIdx] = newQ;
      updated.kyNang.listening.parts[partIdx] = { ...part, cauHois: copyQs };
    } else {
      const part = updated.kyNang.reading.parts[partIdx];
      const copyQs = [...part.cauHois];
      copyQs[qIdx] = newQ;
      updated.kyNang.reading.parts[partIdx] = { ...part, cauHois: copyQs };
    }

    setEditingTest(updated);
    setEditingQuestionIdx(null);
  };

  const handleDownloadTemplate = () => {
    const content = `Câu 1: What time does the meeting start?
A. 8:00 AM
B. 8:30 AM
C. 9:00 AM
D. 9:30 AM
Đáp án: C

Câu 2: Where is the speaker going?
A. School
B. Hospital
C. Airport
D. Office
Đáp án: D

Câu 3: What does the speaker suggest?
A. Staying home
B. Going shopping
C. Watching TV
D. Visiting friends
Đáp án: B`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "mau_import_de_thi.txt";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, partIdx: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportingPartIdx(partIdx);

    if (file.name.endsWith(".docx")) {
      const simulatedQuestions = [
        { id: 1, noiDung: "What time does the meeting start?", luaChon: ["A. 8:00 AM", "B. 8:30 AM", "C. 9:00 AM", "D. 9:30 AM"], dapAn: "C" },
        { id: 2, noiDung: "Where is the speaker going?", luaChon: ["A. School", "B. Hospital", "C. Airport", "D. Office"], dapAn: "D" },
        { id: 3, noiDung: "What does the speaker suggest?", luaChon: ["A. Staying home", "B. Going shopping", "C. Watching TV", "D. Visiting friends"], dapAn: "B" }
      ];
      setImportedQuestions(simulatedQuestions);
      setImportErrors([]);
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 0);
      const parsedList: CauHoi[] = [];
      const errorsList: string[] = [];

      let currentQ: Partial<CauHoi> = {};
      let qIndex = 1;

      const validateAndPush = (qObj: Partial<CauHoi>, fallbackId: number) => {
        const qId = qObj.id || fallbackId;
        if (!qObj.luaChon || qObj.luaChon.length === 0) {
          errorsList.push(`Câu ${qId} thiếu các lựa chọn A, B, C, D.`);
          return;
        }
        if (qObj.luaChon.length < 4) {
          const letters = ["A", "B", "C", "D"];
          errorsList.push(`Câu ${qId} thiếu lựa chọn ${letters[qObj.luaChon.length] || "D"}.`);
          return;
        }
        if (!qObj.dapAn) {
          errorsList.push(`Dòng câu hỏi số ${qId} không có đáp án đúng.`);
          return;
        }

        parsedList.push({
          id: qObj.id || fallbackId,
          noiDung: qObj.noiDung || "Câu hỏi không có nội dung",
          luaChon: qObj.luaChon,
          dapAn: qObj.dapAn
        });
      };

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (line.match(/^(?:Câu|Cau)\s*\d+/i)) {
          if (currentQ.noiDung) {
            validateAndPush(currentQ, qIndex);
            qIndex++;
          }
          const match = line.match(/^(?:Câu|Cau)\s*(\d+)\s*:\s*(.*)$/i);
          currentQ = {
            id: match ? parseInt(match[1]) : qIndex,
            noiDung: match ? match[2] : line.replace(/^(?:Câu|Cau)\s*\d+\s*:\s*/i, ""),
            luaChon: []
          };
        } else if (line.match(/^A\./i) || line.match(/^A\s*:/i)) {
          currentQ.luaChon?.push(line);
        } else if (line.match(/^B\./i) || line.match(/^B\s*:/i)) {
          currentQ.luaChon?.push(line);
        } else if (line.match(/^C\./i) || line.match(/^C\s*:/i)) {
          currentQ.luaChon?.push(line);
        } else if (line.match(/^D\./i) || line.match(/^D\s*:/i)) {
          currentQ.luaChon?.push(line);
        } else if (line.match(/^(?:Đáp án|Dap an|Đáp án đúng)\s*:/i)) {
          const match = line.match(/(?:Đáp án|Dap an|Đáp án đúng)\s*:\s*([A-D])/i);
          if (match) {
            currentQ.dapAn = match[1].toUpperCase();
          } else {
            errorsList.push(`Không tìm thấy cấu trúc 'Đáp án:' tại câu ${currentQ.id || qIndex}`);
          }
        }
      }

      if (currentQ.noiDung) {
        validateAndPush(currentQ, qIndex);
      }

      setImportedQuestions(parsedList);
      setImportErrors(errorsList);
    };
    reader.readAsText(file);
  };

  const handleApplyImportedQuestions = (skill: "listening" | "reading", partIdx: number) => {
    if (!editingTest || importedQuestions.length === 0 || importErrors.length > 0) return;

    const updated = { ...editingTest };
    if (skill === "listening") {
      const part = updated.kyNang.listening.parts[partIdx];
      const merged = [...part.cauHois, ...importedQuestions].map((q, i) => ({ ...q, id: i + 1 }));
      updated.kyNang.listening.parts[partIdx] = { ...part, cauHois: merged };
    } else {
      const part = updated.kyNang.reading.parts[partIdx];
      const merged = [...part.cauHois, ...importedQuestions].map((q, i) => ({ ...q, id: i + 1 }));
      updated.kyNang.reading.parts[partIdx] = { ...part, cauHois: merged };
    }

    setEditingTest(updated);
    setImportedQuestions([]);
    setImportErrors([]);
    setImportingPartIdx(null);
  };

  const handleSaveWorkspaceChanges = async (statusToSet: "published" | "draft") => {
    if (!editingTest) return;

    if (!user || !user.MaNguoiDung) {
      alert("Lỗi: Không tìm thấy thông tin tài khoản đang đăng nhập. Vui lòng đăng nhập lại.");
      return;
    }

    if (!editingTest.TieuDe.trim()) {
      setTestTitleError("Vui lòng nhập đề thi.");
      return;
    }

    setTestTitleError("");
    
    // Nếu ID > 1000000000000 nghĩa là ID tạm được sinh ra bởi Date.now() ở client -> POST tạo mới
    const isNew = editingTest.MaBaiTest > 1000000000000;
    
    const bodyData = {
      TieuDe: editingTest.TieuDe,
      MoTa: editingTest.MoTa,
      ThoiGian: editingTest.TongThoiGian,
      CapDo: editingTest.CapDo,
      LoaiBai: editingTest.LoaiBai,
      NoiDungDeThi: JSON.stringify(editingTest.kyNang),
      TrangThai: statusToSet,
      MaNguoiDung: user.MaNguoiDung
    };

    try {
      let response;
      if (isNew) {
        response = await fetch("http://localhost:5000/dethi", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyData)
        });
      } else {
        response = await fetch(`http://localhost:5000/dethi/${editingTest.MaBaiTest}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyData)
        });
      }

      if (response.ok) {
        await loadTests();
        isExitingRef.current = true;
        setEditingTest(null);
        window.history.back();
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert("Lỗi khi lưu đề thi lên máy chủ: " + (errorData.message || response.statusText || "Không rõ nguyên nhân"));
      }
    } catch (err) {
      console.error("Lỗi lưu đề thi qua API:", err);
      // Fallback lưu local storage
      const savedTest: BaiTest = {
        ...editingTest,
        TrangThai: statusToSet
      };

      const idx = tests.findIndex(t => t.MaBaiTest === savedTest.MaBaiTest);
      let updated: BaiTest[];
      if (idx !== -1) {
        updated = [...tests];
        updated[idx] = savedTest;
      } else {
        updated = [savedTest, ...tests];
      }

      localStorage.setItem("flic_practice_tests", JSON.stringify(updated));
      setTests(updated);
      isExitingRef.current = true;
      setEditingTest(null);
      window.history.back();
    }
  };

  const filteredTests = tests.filter(
    (test) =>
      test.TieuDe.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.LoaiBai.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Render WORKSPACE when editingTest is active
  if (editingTest) {
    return (
      <div
        className={`cd-wrapper anim-fade-in ${isQTV ? "qtv-compact" : ""}`}
        style={{
          paddingBottom: "60px",
          maxWidth: isQTV ? "1200px" : "100%",
          margin: isQTV ? "0 auto" : undefined,
          boxSizing: "border-box",
          overflowX: "hidden"
        }}
      >
        <span className="cd-back" onClick={handleLeaveEditor}>
          <FiArrowLeft size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
          Quay lại danh sách đề thi
        </span>

        <div className="cd-header" style={{ marginBottom: "20px" }}>
          <div>
            <h1 className="cd-title" style={{ fontSize: "24px" }}>
              Thiết Kế Đề Thi
            </h1>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 2.2fr", gap: "24px", alignItems: "start", maxWidth: "100%", boxSizing: "border-box" }}>
          {/* Left panel: General Info & Save */}
          <div style={{ background: "white", padding: "24px", borderRadius: "16px", border: "1px solid #eef2f6", boxShadow: "0 4px 16px rgba(0,0,0,0.02)", boxSizing: "border-box" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "17px", fontWeight: 700, color: "#1e293b", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px" }}>
              Cấu hình chung
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px", boxSizing: "border-box" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", boxSizing: "border-box" }}>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "#475569" }}>Tiêu đề đề thi</label>
                <input
                  type="text"
                  placeholder="Nhập tiêu đề đề thi..."
                  value={editingTest.TieuDe}
                  onChange={(e) => {
                    const title = e.target.value;
                    setEditingTest({ ...editingTest, TieuDe: title });
                    if (title.trim()) {
                      setTestTitleError("");
                    } else {
                      setTestTitleError("Vui lòng nhập đề thi.");
                    }
                  }}
                  style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", outline: "none" }}
                />
                {testTitleError && <div style={{ color: "#ef4444", fontSize: "12px", fontWeight: 600 }}>{testTitleError}</div>}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px", boxSizing: "border-box" }}>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "#475569" }}>Mô tả</label>
                <textarea
                  placeholder="Nhập mô tả đề thi..."
                  value={editingTest.MoTa}
                  onChange={(e) => setEditingTest({ ...editingTest, MoTa: e.target.value })}
                  rows={3}
                  style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", outline: "none", resize: "none" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", boxSizing: "border-box" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "13px", fontWeight: 600, color: "#475569" }}>Thời gian Nghe (phút)</label>
                  <input
                    type="number"
                    value={Math.round((editingTest.kyNang.listening.thoiGian || 0) / 60)}
                    onChange={(e) => {
                      let rawVal = e.target.value;
                      if (rawVal.length > 1 && rawVal.startsWith("0")) {
                        rawVal = rawVal.replace(/^0+/, "");
                        e.target.value = rawVal;
                      }
                      const val = Number(rawVal) || 0;
                      const updated = { ...editingTest };
                      updated.kyNang.listening.thoiGian = val * 60;
                      updated.TongThoiGian = val + Math.round((updated.kyNang.reading.thoiGian || 0)/60) + Math.round((updated.kyNang.writing.thoiGian || 0)/60) + Math.round((updated.kyNang.speaking.thoiGian || 0)/60);
                      setEditingTest(updated);
                    }}
                    style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", outline: "none" }}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "13px", fontWeight: 600, color: "#475569" }}>Thời gian Đọc (phút)</label>
                  <input
                    type="number"
                    value={Math.round((editingTest.kyNang.reading.thoiGian || 0) / 60)}
                    onChange={(e) => {
                      let rawVal = e.target.value;
                      if (rawVal.length > 1 && rawVal.startsWith("0")) {
                        rawVal = rawVal.replace(/^0+/, "");
                        e.target.value = rawVal;
                      }
                      const val = Number(rawVal) || 0;
                      const updated = { ...editingTest };
                      updated.kyNang.reading.thoiGian = val * 60;
                      updated.TongThoiGian = Math.round((updated.kyNang.listening.thoiGian || 0)/60) + val + Math.round((updated.kyNang.writing.thoiGian || 0)/60) + Math.round((updated.kyNang.speaking.thoiGian || 0)/60);
                      setEditingTest(updated);
                    }}
                    style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", outline: "none" }}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "13px", fontWeight: 600, color: "#475569" }}>Thời gian Viết (phút)</label>
                  <input
                    type="number"
                    value={Math.round((editingTest.kyNang.writing.thoiGian || 0) / 60)}
                    onChange={(e) => {
                      let rawVal = e.target.value;
                      if (rawVal.length > 1 && rawVal.startsWith("0")) {
                        rawVal = rawVal.replace(/^0+/, "");
                        e.target.value = rawVal;
                      }
                      const val = Number(rawVal) || 0;
                      const updated = { ...editingTest };
                      updated.kyNang.writing.thoiGian = val * 60;
                      updated.TongThoiGian = Math.round((updated.kyNang.listening.thoiGian || 0)/60) + Math.round((updated.kyNang.reading.thoiGian || 0)/60) + val + Math.round((updated.kyNang.speaking.thoiGian || 0)/60);
                      setEditingTest(updated);
                    }}
                    style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", outline: "none" }}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "13px", fontWeight: 600, color: "#475569" }}>Thời gian Nói (phút)</label>
                  <input
                    type="number"
                    value={Math.round((editingTest.kyNang.speaking.thoiGian || 0) / 60)}
                    onChange={(e) => {
                      let rawVal = e.target.value;
                      if (rawVal.length > 1 && rawVal.startsWith("0")) {
                        rawVal = rawVal.replace(/^0+/, "");
                        e.target.value = rawVal;
                      }
                      const val = Number(rawVal) || 0;
                      const updated = { ...editingTest };
                      updated.kyNang.speaking.thoiGian = val * 60;
                      if (!updated.kyNang.speaking.parts[0]) {
                        updated.kyNang.speaking.parts[0] = { soPhan: 1, tieuDe: "Speaking Part 1", moTa: "Speaking Practice", audioUrl: "", noiDung: "", thoiGianChuanBi: 60, thoiGianNoi: val * 60 };
                      } else {
                        updated.kyNang.speaking.parts[0].thoiGianNoi = val * 60;
                      }
                      updated.TongThoiGian = Math.round((updated.kyNang.listening.thoiGian || 0)/60) + Math.round((updated.kyNang.reading.thoiGian || 0)/60) + Math.round((updated.kyNang.writing.thoiGian || 0)/60) + val;
                      setEditingTest(updated);
                    }}
                    style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", outline: "none" }}
                  />
                </div>
              </div>
              <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 600, marginTop: "4px" }}>
                Tổng thời gian: {editingTest.TongThoiGian} phút
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "14px", borderTop: "1px solid #f1f5f9", paddingTop: "16px", boxSizing: "border-box" }}>
                <button
                  onClick={() => handleSaveWorkspaceChanges("published")}
                  style={{
                    background: "#107544", color: "white", border: "none", padding: "12px", borderRadius: "8px",
                    fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", boxSizing: "border-box"
                  }}
                >
                  <FiCheckCircle size={18} /> {isQTV ? "Đăng lên" : "Gửi duyệt"}
                </button>
                <button
                  onClick={() => handleSaveWorkspaceChanges("draft")}
                  style={{
                    background: "#475569", color: "white", border: "none", padding: "12px", borderRadius: "8px",
                    fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", boxSizing: "border-box"
                  }}
                >
                  <FiFileText size={18} /> Lưu nháp
                </button>
                <button
                  onClick={handleLeaveEditor}
                  style={{
                    background: "white", color: "#64748b", border: "1px solid #cbd5e1", padding: "10px", borderRadius: "8px",
                    fontWeight: 600, cursor: "pointer", width: "100%", boxSizing: "border-box"
                  }}
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>

          {/* Right panel: Questions Workspace divided by 4 skills */}
          <div style={{ background: "white", padding: "24px", borderRadius: "16px", border: "1px solid #eef2f6", boxShadow: "0 4px 16px rgba(0,0,0,0.02)", boxSizing: "border-box", overflow: "hidden" }}>
            {/* Tabs for the 4 skills */}
            <div style={{ display: "flex", borderBottom: "2px solid #e2e8f0", marginBottom: "24px", boxSizing: "border-box" }}>
              {["listening", "reading", "writing", "speaking"].map((skill) => (
                <button
                  key={skill}
                  onClick={() => { setWorkspaceSkill(skill as any); setActivePartIdx(0); setAddQuestionError(""); setAddAnswersError(""); }}
                  style={{
                    padding: "12px 20px", background: "none", border: "none", fontSize: "14px", fontWeight: 700,
                    color: workspaceSkill === skill ? "#F95800" : "#64748b",
                    borderBottom: workspaceSkill === skill ? "3px solid #F95800" : "3px solid transparent",
                    cursor: "pointer", transition: "all 0.2s", textTransform: "capitalize", paddingBottom: "10px"
                  }}
                >
                  {skill === "listening" ? "1. Listening" : skill === "reading" ? "2. Reading" : skill === "writing" ? "3. Writing" : "4. Speaking"}
                </button>
              ))}
            </div>

            {/* SKILL: LISTENING */}
            {workspaceSkill === "listening" && (
              <div className="anim-fade-in" style={{ display: "flex", flexDirection: "column", gap: "16px", boxSizing: "border-box" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", boxSizing: "border-box" }}>
                  <h4 style={{ margin: 0, fontSize: "15px", color: "#1e293b", fontWeight: 700 }}>Danh sách Listening Parts</h4>
                  <button
                    onClick={handleAddListeningPart}
                    style={{
                      background: "#F95800", color: "white", border: "none", padding: "6px 14px", borderRadius: "6px",
                      fontSize: "12px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "4px"
                    }}
                  >
                    <FiPlus /> Thêm Part Nghe
                  </button>
                </div>

                {!editingTest.kyNang.listening.parts || editingTest.kyNang.listening.parts.length === 0 ? (
                  <p style={{ textAlign: "center", color: "#64748b", padding: "20px" }}>Chưa có Part Nghe nào. Nhấn Thêm Part Nghe để bắt đầu.</p>
                ) : (
                  <div style={{ boxSizing: "border-box", width: "100%" }}>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px", boxSizing: "border-box" }}>
                      {editingTest.kyNang.listening.parts.map((p, idx) => (
                        <div key={idx} style={{ display: "flex", alignItems: "center", gap: "2px", background: activePartIdx === idx ? "#F95800" : "#f1f5f9", borderRadius: "20px", padding: "2px 8px" }}>
                          <button
                            onClick={() => { setActivePartIdx(idx); setEditingQuestionIdx(null); setAddQuestionError(""); setAddAnswersError(""); }}
                            style={{
                              padding: "4px 8px", border: "none", background: "none",
                              color: activePartIdx === idx ? "white" : "#475569",
                              fontSize: "12px", fontWeight: 600, cursor: "pointer"
                            }}
                          >
                            Part {p.soPhan}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              handleDeletePart("listening", idx);
                            }}
                            style={{ border: "none", background: "none", display: "flex", alignItems: "center", cursor: "pointer", color: activePartIdx === idx ? "white" : "#ef4444", padding: "2px" }}
                            title="Xóa Part"
                          >
                            <FiX size={13} />
                          </button>
                        </div>
                      ))}
                    </div>

                    {editingTest.kyNang.listening.parts[activePartIdx] && (
                      <div style={{ border: "1px solid #cbd5e1", borderRadius: "12px", padding: "20px", background: "white", display: "flex", flexDirection: "column", gap: "16px", boxSizing: "border-box", width: "100%" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px", boxSizing: "border-box", width: "100%" }}>
                          <label style={{ fontSize: "12px", fontWeight: 600, color: "#64748b", marginBottom: "4px" }}>Nội dung hướng dẫn</label>
                          <RichTextEditor
                            id={`textarea-listen-huongdan-${activePartIdx}`}
                            value={editingTest.kyNang.listening.parts[activePartIdx].huongDan}
                            onChange={(val) => {
                              const updated = { ...editingTest };
                              updated.kyNang.listening.parts[activePartIdx].huongDan = val;
                              setEditingTest(updated);
                            }}
                            minHeight="80px"
                          />
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "4px", boxSizing: "border-box", width: "100%" }}>
                          <label style={{ fontSize: "12px", fontWeight: 600, color: "#64748b" }}>Tải file audio lên (MP3/WAV)</label>
                          <input
                            key={`listening-audio-input-${activePartIdx}`}
                            type="file"
                            accept="audio/*"
                            onChange={(e) => handleListeningAudioUpload(e, activePartIdx)}
                            style={{ width: "100%", boxSizing: "border-box", fontSize: "13px", padding: "4px", border: "1px dashed #cbd5e1", borderRadius: "6px" }}
                          />
                          {editingTest.kyNang.listening.parts[activePartIdx].audioUrl && (
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px", padding: "6px 10px", background: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0", width: "100%", boxSizing: "border-box" }}>
                              <audio src={getMediaUrl(editingTest.kyNang.listening.parts[activePartIdx].audioUrl)} controls style={{ height: "24px" }} />
                              <span style={{ fontSize: "11px", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {editingTest.kyNang.listening.parts[activePartIdx].audioName || "Audio đã tải lên"}
                              </span>
                            </div>
                          )}
                        </div>

                        <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "16px", boxSizing: "border-box", width: "100%" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", boxSizing: "border-box", flexWrap: "wrap", gap: "8px" }}>
                            <h5 style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "#334155" }}>
                              Danh sách câu hỏi của Part {activePartIdx + 1} ({editingTest.kyNang.listening.parts[activePartIdx].cauHois.length} câu)
                            </h5>

                            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                              <input
                                key={`listening-import-input-${activePartIdx}`}
                                type="file" accept=".txt,.docx" id={`file-import-listen-${activePartIdx}`} style={{ display: "none" }}
                                onChange={(e) => handleFileUpload(e, activePartIdx)}
                              />
                              <label
                                htmlFor={`file-import-listen-${activePartIdx}`}
                                style={{
                                  background: "#f1f5f9", color: "#475569", padding: "6px 12px", borderRadius: "6px",
                                  fontSize: "12px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "4px"
                                }}
                              >
                                <FiUpload /> Import câu hỏi
                              </label>
                              <button
                                onClick={handleDownloadTemplate}
                                style={{
                                  background: "none", border: "none", color: "#F95800", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", gap: "2px"
                                }}
                              >
                                <FiDownload /> Tải file mẫu
                              </button>
                            </div>
                          </div>

                          {importingPartIdx === activePartIdx && (importedQuestions.length > 0 || importErrors.length > 0) && (
                            <div style={{ background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "12px", boxSizing: "border-box", width: "100%" }}>
                              {importErrors.length > 0 ? (
                                <div style={{ color: "#ef4444", fontSize: "12px" }}>
                                  <strong>Lỗi File:</strong>
                                  <ul style={{ margin: "4px 0 0 0", paddingLeft: "16px" }}>
                                    {importErrors.map((err, errIdx) => <li key={errIdx}>{err}</li>)}
                                  </ul>
                                </div>
                              ) : (
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                  <span style={{ fontSize: "12px", color: "#107544", fontWeight: 600 }}>
                                    ✓ Nhận diện {importedQuestions.length} câu hỏi hợp lệ!
                                  </span>
                                  <button
                                    onClick={() => handleApplyImportedQuestions("listening", activePartIdx)}
                                    style={{ background: "#107544", color: "white", border: "none", padding: "4px 10px", borderRadius: "4px", fontSize: "11px", cursor: "pointer" }}
                                  >
                                    Áp dụng
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                          <div style={{ display: "flex", flexDirection: "column", gap: "12px", boxSizing: "border-box", width: "100%" }}>
                            {editingTest.kyNang.listening.parts[activePartIdx].cauHois.map((q, qIdx) => {
                              const isEditing = editingQuestionIdx === qIdx;
                              return (
                                <div key={q.id || qIdx} style={{ border: "1px solid #cbd5e1", borderRadius: "8px", padding: "12px", background: "#f8fafc", boxSizing: "border-box", width: "100%" }}>
                                  {!isEditing ? (
                                    <>
                                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                                        <span style={{ fontSize: "12px", fontWeight: 700, color: "#F95800" }}>Câu {q.id || qIdx + 1}:</span>
                                        <div style={{ display: "flex", gap: "4px" }}>
                                          <button type="button" disabled={qIdx === 0} onClick={() => handleMoveQuestion("listening", activePartIdx, qIdx, "up")} style={{ background: "none", border: "none", color: qIdx === 0 ? "#cbd5e1" : "#64748b", cursor: "pointer" }}><FiArrowUp size={14} /></button>
                                          <button type="button" disabled={qIdx === editingTest.kyNang.listening.parts[activePartIdx].cauHois.length - 1} onClick={() => handleMoveQuestion("listening", activePartIdx, qIdx, "down")} style={{ background: "none", border: "none", color: qIdx === editingTest.kyNang.listening.parts[activePartIdx].cauHois.length - 1 ? "#cbd5e1" : "#64748b", cursor: "pointer" }}><FiArrowDown size={14} /></button>
                                          <button type="button" onClick={() => handleStartEditQuestion(qIdx, q)} style={{ marginLeft: "6px", background: "none", border: "none", color: "#F95800", fontSize: "12px", cursor: "pointer" }}>Sửa</button>
                                          <button type="button" onClick={() => handleDeleteQuestion("listening", activePartIdx, qIdx)} style={{ background: "none", border: "none", color: "#ef4444", fontSize: "12px", cursor: "pointer" }}>Xóa</button>
                                        </div>
                                      </div>
                                      <p style={{ margin: "0 0 8px 0", fontSize: "13px", fontWeight: 600, color: "#1e293b" }} dangerouslySetInnerHTML={{ __html: q.noiDung }} />
                                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", width: "100%", boxSizing: "border-box" }}>
                                        {q.luaChon.map((c, cIdx) => {
                                          const letter = ["A", "B", "C", "D"][cIdx];
                                          const isCorrect = q.dapAn === letter;
                                          return (
                                            <div key={cIdx} style={{ fontSize: "12px", color: isCorrect ? "#107544" : "#475569", fontWeight: isCorrect ? 600 : 400 }}>
                                              {c} {isCorrect && "✓"}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </>
                                  ) : (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", boxSizing: "border-box", width: "100%" }}>
                                      <RichTextEditor
                                        id="textarea-q-edit-noidung"
                                        value={editQText}
                                        onChange={setEditQText}
                                        minHeight="80px"
                                      />
                                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", width: "100%", boxSizing: "border-box" }}>
                                        <input type="text" value={editOptA} onChange={(e) => setEditOptA(e.target.value)} style={{ width: "100%", boxSizing: "border-box", padding: "4px 6px", fontSize: "12px" }} />
                                        <input type="text" value={editOptB} onChange={(e) => setEditOptB(e.target.value)} style={{ width: "100%", boxSizing: "border-box", padding: "4px 6px", fontSize: "12px" }} />
                                        <input type="text" value={editOptC} onChange={(e) => setEditOptC(e.target.value)} style={{ width: "100%", boxSizing: "border-box", padding: "4px 6px", fontSize: "12px" }} />
                                        <input type="text" value={editOptD} onChange={(e) => setEditOptD(e.target.value)} style={{ width: "100%", boxSizing: "border-box", padding: "4px 6px", fontSize: "12px" }} />
                                      </div>
                                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", boxSizing: "border-box", width: "100%" }}>
                                        <div>
                                          <label style={{ fontSize: "12px", fontWeight: 600 }}>Đáp án:</label>
                                          <select value={editCorrectOpt} onChange={(e) => setEditCorrectOpt(e.target.value)} style={{ marginLeft: "4px" }}>
                                            <option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option>
                                          </select>
                                        </div>
                                        <div style={{ display: "flex", gap: "6px" }}>
                                          <button type="button" onClick={() => setEditingQuestionIdx(null)} style={{ fontSize: "11px" }}>Hủy</button>
                                          <button type="button" onClick={() => handleSaveQuestionEdit("listening", activePartIdx, qIdx)} style={{ background: "#F95800", color: "white", border: "none", padding: "4px 8px", borderRadius: "4px", fontSize: "11px", cursor: "pointer" }}>Lưu</button>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          <form onSubmit={(e) => handleAddManualQuestion(e, "listening", activePartIdx)} style={{ background: "#f8fafc", padding: "14px", borderRadius: "8px", border: "1px dashed #cbd5e1", width: "100%", boxSizing: "border-box" }}>
                            <span style={{ fontSize: "12px", fontWeight: 700, color: "#475569" }}>Thêm câu hỏi thủ công:</span>
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "8px", width: "100%", boxSizing: "border-box" }}>
                              <div style={{ width: "100%", boxSizing: "border-box" }}>
                                <RichTextEditor
                                  id="textarea-q-noidung"
                                  placeholder="Nội dung câu hỏi..."
                                  value={newQText}
                                  onChange={setNewQText}
                                  minHeight="80px"
                                />
                                {addQuestionError && <div style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", fontWeight: 600 }}>{addQuestionError}</div>}
                              </div>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", width: "100%", boxSizing: "border-box" }}>
                                <input placeholder="Đáp án A" value={optA} onChange={(e) => setOptA(e.target.value)} style={{ width: "100%", boxSizing: "border-box", padding: "6px", fontSize: "12px" }} />
                                <input placeholder="Đáp án B" value={optB} onChange={(e) => setOptB(e.target.value)} style={{ width: "100%", boxSizing: "border-box", padding: "6px", fontSize: "12px" }} />
                                <input placeholder="Đáp án C" value={optC} onChange={(e) => setOptC(e.target.value)} style={{ width: "100%", boxSizing: "border-box", padding: "6px", fontSize: "12px" }} />
                                <input placeholder="Đáp án D" value={optD} onChange={(e) => setOptD(e.target.value)} style={{ width: "100%", boxSizing: "border-box", padding: "6px", fontSize: "12px" }} />
                              </div>
                              {addAnswersError && <div style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", fontWeight: 600 }}>{addAnswersError}</div>}
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", boxSizing: "border-box" }}>
                                <div>
                                  <label style={{ fontSize: "12px", fontWeight: 600 }}>Đáp án đúng:</label>
                                  <select value={correctOpt} onChange={(e) => setCorrectOpt(e.target.value)} style={{ marginLeft: "4px", padding: "3px 6px" }}>
                                    <option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option>
                                  </select>
                                </div>
                                <button type="submit" style={{ background: "#F95800", color: "white", border: "none", padding: "6px 12px", borderRadius: "4px", fontSize: "12px", cursor: "pointer", fontWeight: 600 }}>
                                  Thêm
                                </button>
                              </div>
                            </div>
                          </form>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* SKILL: READING */}
            {workspaceSkill === "reading" && (
              <div className="anim-fade-in" style={{ display: "flex", flexDirection: "column", gap: "16px", boxSizing: "border-box" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", boxSizing: "border-box" }}>
                  <h4 style={{ margin: 0, fontSize: "15px", color: "#1e293b", fontWeight: 700 }}>Danh sách Reading Parts</h4>
                  <button
                    onClick={handleAddReadingPart}
                    style={{
                      background: "#F95800", color: "white", border: "none", padding: "6px 14px", borderRadius: "6px",
                      fontSize: "12px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "4px"
                    }}
                  >
                    <FiPlus /> Thêm Part Đọc
                  </button>
                </div>

                {!editingTest.kyNang.reading.parts || editingTest.kyNang.reading.parts.length === 0 ? (
                  <p style={{ textAlign: "center", color: "#64748b", padding: "20px" }}>Chưa có Part Đọc nào. Nhấn Thêm Part Đọc để bắt đầu.</p>
                ) : (
                  <div style={{ boxSizing: "border-box", width: "100%" }}>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px", boxSizing: "border-box" }}>
                      {editingTest.kyNang.reading.parts.map((p, idx) => (
                        <div key={idx} style={{ display: "flex", alignItems: "center", gap: "2px", background: activePartIdx === idx ? "#F95800" : "#f1f5f9", borderRadius: "20px", padding: "2px 8px" }}>
                          <button
                            onClick={() => { setActivePartIdx(idx); setEditingQuestionIdx(null); setAddQuestionError(""); setAddAnswersError(""); }}
                            style={{
                              padding: "4px 8px", border: "none", background: "none",
                              color: activePartIdx === idx ? "white" : "#475569",
                              fontSize: "12px", fontWeight: 600, cursor: "pointer"
                            }}
                          >
                            Part {p.soPhan}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              handleDeletePart("reading", idx);
                            }}
                            style={{ border: "none", background: "none", display: "flex", alignItems: "center", cursor: "pointer", color: activePartIdx === idx ? "white" : "#ef4444", padding: "2px" }}
                            title="Xóa Part"
                          >
                            <FiX size={13} />
                          </button>
                        </div>
                      ))}
                    </div>

                    {editingTest.kyNang.reading.parts[activePartIdx] && (
                      <div style={{ border: "1px solid #cbd5e1", borderRadius: "12px", padding: "20px", background: "white", display: "flex", flexDirection: "column", gap: "16px", boxSizing: "border-box", width: "100%" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px", boxSizing: "border-box", width: "100%" }}>
                          <label style={{ fontSize: "12px", fontWeight: 600, color: "#64748b", marginBottom: "4px" }}>Nội dung hướng dẫn</label>
                          <RichTextEditor
                            id={`textarea-read-huongdan-${activePartIdx}`}
                            value={editingTest.kyNang.reading.parts[activePartIdx].huongDan}
                            onChange={(val) => {
                              const updated = { ...editingTest };
                              updated.kyNang.reading.parts[activePartIdx].huongDan = val;
                              setEditingTest(updated);
                            }}
                            minHeight="80px"
                          />
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "4px", boxSizing: "border-box", width: "100%" }}>
                          <label style={{ fontSize: "12px", fontWeight: 600, color: "#64748b", marginBottom: "4px" }}>Đoạn văn</label>
                          <RichTextEditor
                            id={`textarea-read-doanvan-${activePartIdx}`}
                            value={editingTest.kyNang.reading.parts[activePartIdx].doanVan}
                            onChange={(val) => {
                              const updated = { ...editingTest };
                              updated.kyNang.reading.parts[activePartIdx].doanVan = val;
                              setEditingTest(updated);
                            }}
                            minHeight="140px"
                          />
                        </div>

                        <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "16px", boxSizing: "border-box", width: "100%" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", boxSizing: "border-box", flexWrap: "wrap", gap: "8px" }}>
                            <h5 style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "#334155" }}>
                              Danh sách câu hỏi của Part {activePartIdx + 1} ({editingTest.kyNang.reading.parts[activePartIdx].cauHois.length} câu)
                            </h5>

                            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                              <input
                                key={`reading-import-input-${activePartIdx}`}
                                type="file" accept=".txt,.docx" id={`file-import-read-${activePartIdx}`} style={{ display: "none" }}
                                onChange={(e) => handleFileUpload(e, activePartIdx)}
                              />
                              <label
                                htmlFor={`file-import-read-${activePartIdx}`}
                                style={{
                                  background: "#f1f5f9", color: "#475569", padding: "6px 12px", borderRadius: "6px",
                                  fontSize: "12px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "4px"
                                }}
                              >
                                <FiUpload /> Import câu hỏi
                              </label>
                              <button
                                onClick={handleDownloadTemplate}
                                style={{
                                  background: "none", border: "none", color: "#F95800", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", gap: "2px"
                                }}
                              >
                                <FiDownload /> Tải file mẫu
                              </button>
                            </div>
                          </div>

                          {importingPartIdx === activePartIdx && (importedQuestions.length > 0 || importErrors.length > 0) && (
                            <div style={{ background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "12px", boxSizing: "border-box", width: "100%" }}>
                              {importErrors.length > 0 ? (
                                <div style={{ color: "#ef4444", fontSize: "12px" }}>
                                  <strong>Lỗi File:</strong>
                                  <ul style={{ margin: "4px 0 0 0", paddingLeft: "16px" }}>
                                    {importErrors.map((err, errIdx) => <li key={errIdx}>{err}</li>)}
                                  </ul>
                                </div>
                              ) : (
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                  <span style={{ fontSize: "12px", color: "#107544", fontWeight: 600 }}>
                                    ✓ Nhận diện {importedQuestions.length} câu hỏi hợp lệ!
                                  </span>
                                  <button
                                    onClick={() => handleApplyImportedQuestions("reading", activePartIdx)}
                                    style={{ background: "#107544", color: "white", border: "none", padding: "4px 10px", borderRadius: "4px", fontSize: "11px", cursor: "pointer" }}
                                  >
                                    Áp dụng
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                          <div style={{ display: "flex", flexDirection: "column", gap: "12px", boxSizing: "border-box", width: "100%" }}>
                            {editingTest.kyNang.reading.parts[activePartIdx].cauHois.map((q, qIdx) => {
                              const isEditing = editingQuestionIdx === qIdx;
                              return (
                                <div key={q.id || qIdx} style={{ border: "1px solid #cbd5e1", borderRadius: "8px", padding: "12px", background: "#f8fafc", boxSizing: "border-box", width: "100%" }}>
                                  {!isEditing ? (
                                    <>
                                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                                        <span style={{ fontSize: "12px", fontWeight: 700, color: "#F95800" }}>Câu {q.id || qIdx + 1}:</span>
                                        <div style={{ display: "flex", gap: "4px" }}>
                                          <button type="button" disabled={qIdx === 0} onClick={() => handleMoveQuestion("reading", activePartIdx, qIdx, "up")} style={{ background: "none", border: "none", color: qIdx === 0 ? "#cbd5e1" : "#64748b", cursor: "pointer" }}><FiArrowUp size={14} /></button>
                                          <button type="button" disabled={qIdx === editingTest.kyNang.reading.parts[activePartIdx].cauHois.length - 1} onClick={() => handleMoveQuestion("reading", activePartIdx, qIdx, "down")} style={{ background: "none", border: "none", color: qIdx === editingTest.kyNang.reading.parts[activePartIdx].cauHois.length - 1 ? "#cbd5e1" : "#64748b", cursor: "pointer" }}><FiArrowDown size={14} /></button>
                                          <button type="button" onClick={() => handleStartEditQuestion(qIdx, q)} style={{ marginLeft: "6px", background: "none", border: "none", color: "#F95800", fontSize: "12px", cursor: "pointer" }}>Sửa</button>
                                          <button type="button" onClick={() => handleDeleteQuestion("reading", activePartIdx, qIdx)} style={{ background: "none", border: "none", color: "#ef4444", fontSize: "12px", cursor: "pointer" }}>Xóa</button>
                                        </div>
                                      </div>
                                      <p style={{ margin: "0 0 8px 0", fontSize: "13px", fontWeight: 600, color: "#1e293b" }} dangerouslySetInnerHTML={{ __html: q.noiDung }} />
                                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", width: "100%", boxSizing: "border-box" }}>
                                        {q.luaChon.map((c, cIdx) => {
                                          const letter = ["A", "B", "C", "D"][cIdx];
                                          const isCorrect = q.dapAn === letter;
                                          return (
                                            <div key={cIdx} style={{ fontSize: "12px", color: isCorrect ? "#107544" : "#475569", fontWeight: isCorrect ? 600 : 400 }}>
                                              {c} {isCorrect && "✓"}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </>
                                  ) : (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", boxSizing: "border-box", width: "100%" }}>
                                      <RichTextEditor
                                        id="textarea-q-edit-noidung"
                                        value={editQText}
                                        onChange={setEditQText}
                                        minHeight="80px"
                                      />
                                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", width: "100%", boxSizing: "border-box" }}>
                                        <input type="text" value={editOptA} onChange={(e) => setEditOptA(e.target.value)} style={{ width: "100%", boxSizing: "border-box", padding: "4px 6px", fontSize: "12px" }} />
                                        <input type="text" value={editOptB} onChange={(e) => setEditOptB(e.target.value)} style={{ width: "100%", boxSizing: "border-box", padding: "4px 6px", fontSize: "12px" }} />
                                        <input type="text" value={editOptC} onChange={(e) => setEditOptC(e.target.value)} style={{ width: "100%", boxSizing: "border-box", padding: "4px 6px", fontSize: "12px" }} />
                                        <input type="text" value={editOptD} onChange={(e) => setEditOptD(e.target.value)} style={{ width: "100%", boxSizing: "border-box", padding: "4px 6px", fontSize: "12px" }} />
                                      </div>
                                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", boxSizing: "border-box", width: "100%" }}>
                                        <div>
                                          <label style={{ fontSize: "12px", fontWeight: 600 }}>Đáp án:</label>
                                          <select value={editCorrectOpt} onChange={(e) => setEditCorrectOpt(e.target.value)} style={{ marginLeft: "4px" }}>
                                            <option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option>
                                          </select>
                                        </div>
                                        <div style={{ display: "flex", gap: "6px" }}>
                                          <button type="button" onClick={() => setEditingQuestionIdx(null)} style={{ fontSize: "11px" }}>Hủy</button>
                                          <button type="button" onClick={() => handleSaveQuestionEdit("reading", activePartIdx, qIdx)} style={{ background: "#F95800", color: "white", border: "none", padding: "4px 8px", borderRadius: "4px", fontSize: "11px", cursor: "pointer" }}>Lưu</button>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          <form onSubmit={(e) => handleAddManualQuestion(e, "reading", activePartIdx)} style={{ background: "#f8fafc", padding: "14px", borderRadius: "8px", border: "1px dashed #cbd5e1", width: "100%", boxSizing: "border-box" }}>
                            <span style={{ fontSize: "12px", fontWeight: 700, color: "#475569" }}>Thêm câu hỏi thủ công:</span>
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "8px", width: "100%", boxSizing: "border-box" }}>
                              <div style={{ width: "100%", boxSizing: "border-box" }}>
                                <RichTextEditor
                                  id="textarea-q-noidung"
                                  placeholder="Nội dung câu hỏi..."
                                  value={newQText}
                                  onChange={setNewQText}
                                  minHeight="80px"
                                />
                                {addQuestionError && <div style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", fontWeight: 600 }}>{addQuestionError}</div>}
                              </div>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", width: "100%", boxSizing: "border-box" }}>
                                <input placeholder="Đáp án A" value={optA} onChange={(e) => setOptA(e.target.value)} style={{ width: "100%", boxSizing: "border-box", padding: "6px", fontSize: "12px" }} />
                                <input placeholder="Đáp án B" value={optB} onChange={(e) => setOptB(e.target.value)} style={{ width: "100%", boxSizing: "border-box", padding: "6px", fontSize: "12px" }} />
                                <input placeholder="Đáp án C" value={optC} onChange={(e) => setOptC(e.target.value)} style={{ width: "100%", boxSizing: "border-box", padding: "6px", fontSize: "12px" }} />
                                <input placeholder="Đáp án D" value={optD} onChange={(e) => setOptD(e.target.value)} style={{ width: "100%", boxSizing: "border-box", padding: "6px", fontSize: "12px" }} />
                              </div>
                              {addAnswersError && <div style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", fontWeight: 600 }}>{addAnswersError}</div>}
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", boxSizing: "border-box" }}>
                                <div>
                                  <label style={{ fontSize: "12px", fontWeight: 600 }}>Đáp án đúng:</label>
                                  <select value={correctOpt} onChange={(e) => setCorrectOpt(e.target.value)} style={{ marginLeft: "4px", padding: "3px 6px" }}>
                                    <option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option>
                                  </select>
                                </div>
                                <button type="submit" style={{ background: "#F95800", color: "white", border: "none", padding: "6px 12px", borderRadius: "4px", fontSize: "12px", cursor: "pointer", fontWeight: 600 }}>
                                  Thêm
                                </button>
                              </div>
                            </div>
                          </form>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* SKILL: WRITING */}
            {workspaceSkill === "writing" && (
              <div className="anim-fade-in" style={{ display: "flex", flexDirection: "column", gap: "16px", boxSizing: "border-box" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", boxSizing: "border-box" }}>
                  <h4 style={{ margin: 0, fontSize: "15px", color: "#1e293b", fontWeight: 700 }}>Danh sách Writing Parts</h4>
                  <button
                    onClick={handleAddWritingPart}
                    style={{
                      background: "#F95800", color: "white", border: "none", padding: "6px 14px", borderRadius: "6px",
                      fontSize: "12px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "4px"
                    }}
                  >
                    <FiPlus /> Thêm Part Viết
                  </button>
                </div>

                {!editingTest.kyNang.writing.parts || editingTest.kyNang.writing.parts.length === 0 ? (
                  <p style={{ textAlign: "center", color: "#64748b", padding: "20px" }}>Chưa có Part Viết nào. Nhấn Thêm Part Viết để bắt đầu.</p>
                ) : (
                  <div style={{ boxSizing: "border-box", width: "100%" }}>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px", boxSizing: "border-box" }}>
                      {editingTest.kyNang.writing.parts.map((p, idx) => (
                        <div key={idx} style={{ display: "flex", alignItems: "center", gap: "2px", background: activePartIdx === idx ? "#F95800" : "#f1f5f9", borderRadius: "20px", padding: "2px 8px" }}>
                          <button
                            onClick={() => { setActivePartIdx(idx); setEditingQuestionIdx(null); setAddQuestionError(""); setAddAnswersError(""); }}
                            style={{
                              padding: "4px 8px", border: "none", background: "none",
                              color: activePartIdx === idx ? "white" : "#475569",
                              fontSize: "12px", fontWeight: 600, cursor: "pointer"
                            }}
                          >
                            Part {p.soPhan}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              handleDeletePart("writing", idx);
                            }}
                            style={{ border: "none", background: "none", display: "flex", alignItems: "center", cursor: "pointer", color: activePartIdx === idx ? "white" : "#ef4444", padding: "2px" }}
                            title="Xóa Part"
                          >
                            <FiX size={13} />
                          </button>
                        </div>
                      ))}
                    </div>

                    {editingTest.kyNang.writing.parts[activePartIdx] && (
                      <div style={{ border: "1px solid #cbd5e1", borderRadius: "12px", padding: "20px", background: "white", display: "flex", flexDirection: "column", gap: "16px", boxSizing: "border-box", width: "100%" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", boxSizing: "border-box", width: "100%" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px", boxSizing: "border-box" }}>
                            <label style={{ fontSize: "12px", fontWeight: 600, color: "#64748b" }}>Loại bài viết</label>
                            <select
                              value={editingTest.kyNang.writing.parts[activePartIdx].loaiBai || "Email"}
                              onChange={(e) => {
                                const updated = { ...editingTest };
                                updated.kyNang.writing.parts[activePartIdx].loaiBai = e.target.value;
                                setEditingTest(updated);
                              }}
                              style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "13px", background: "white" }}
                            >
                              <option value="Letter">Letter</option>
                              <option value="Email">Email</option>
                            </select>
                          </div>

                          <div style={{ display: "flex", flexDirection: "column", gap: "4px", boxSizing: "border-box" }}>
                            <label style={{ fontSize: "12px", fontWeight: 600, color: "#64748b" }}>Số từ tối thiểu</label>
                            <input
                              type="number"
                              value={editingTest.kyNang.writing.parts[activePartIdx].soTuToiThieu}
                              onChange={(e) => {
                                const updated = { ...editingTest };
                                updated.kyNang.writing.parts[activePartIdx].soTuToiThieu = Number(e.target.value) || 0;
                                setEditingTest(updated);
                              }}
                              style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "13px" }}
                            />
                          </div>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "4px", boxSizing: "border-box", width: "100%" }}>
                          <label style={{ fontSize: "12px", fontWeight: 600, color: "#64748b", marginBottom: "4px" }}>Hướng dẫn làm bài</label>
                          <RichTextEditor
                            id={`textarea-write-huongdan-${activePartIdx}`}
                            value={editingTest.kyNang.writing.parts[activePartIdx].huongDan}
                            onChange={(val) => {
                              const updated = { ...editingTest };
                              updated.kyNang.writing.parts[activePartIdx].huongDan = val;
                              setEditingTest(updated);
                            }}
                            minHeight="80px"
                          />
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "4px", boxSizing: "border-box", width: "100%" }}>
                          <label style={{ fontSize: "12px", fontWeight: 600, color: "#64748b", marginBottom: "4px" }}>Đề bài chi tiết</label>
                          <RichTextEditor
                            id={`textarea-write-noidung-${activePartIdx}`}
                            value={editingTest.kyNang.writing.parts[activePartIdx].noiDung}
                            onChange={(val) => {
                              const updated = { ...editingTest };
                              updated.kyNang.writing.parts[activePartIdx].noiDung = val;
                              setEditingTest(updated);
                            }}
                            minHeight="120px"
                          />
                        </div>


                        <div style={{ display: "flex", flexDirection: "column", gap: "4px", boxSizing: "border-box", width: "100%" }}>
                          <label style={{ fontSize: "12px", fontWeight: 600, color: "#64748b", marginBottom: "4px" }}>Gợi ý dàn ý (Không bắt buộc)</label>
                          <RichTextEditor
                            id={`textarea-write-goiy-${activePartIdx}`}
                            value={editingTest.kyNang.writing.parts[activePartIdx].goiY || ""}
                            onChange={(val) => {
                              const updated = { ...editingTest };
                              updated.kyNang.writing.parts[activePartIdx].goiY = val;
                              setEditingTest(updated);
                            }}
                            minHeight="80px"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* SKILL: SPEAKING */}
            {workspaceSkill === "speaking" && (
              <div className="anim-fade-in" style={{ display: "flex", flexDirection: "column", gap: "16px", boxSizing: "border-box" }}>
                <h4 style={{ margin: 0, fontSize: "15px", color: "#1e293b", fontWeight: 700 }}>Speaking Part Setup</h4>

                <div style={{ border: "1px solid #cbd5e1", borderRadius: "12px", padding: "20px", background: "white", display: "flex", flexDirection: "column", gap: "16px", boxSizing: "border-box", width: "100%" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px", boxSizing: "border-box", width: "100%" }}>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "#64748b", marginBottom: "4px" }}>Đề bài Nói / Câu hỏi</label>
                    <RichTextEditor
                      id="textarea-speak-noidung"
                      value={editingTest.kyNang.speaking.parts[0]?.noiDung || ""}
                      onChange={(val) => {
                        const updated = { ...editingTest };
                        if (!updated.kyNang.speaking.parts[0]) {
                          updated.kyNang.speaking.parts[0] = { soPhan: 1, tieuDe: "Speaking Part 1", moTa: "Speaking Practice", audioUrl: "", noiDung: "", thoiGianChuanBi: 60, thoiGianNoi: 180 };
                        }
                        updated.kyNang.speaking.parts[0].noiDung = val;
                        setEditingTest(updated);
                      }}
                      minHeight="100px"
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "4px", boxSizing: "border-box", width: "100%" }}>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "#64748b" }}>Hình ảnh minh họa / Prompt (Không bắt buộc)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleSpeakingImageUpload}
                      style={{ width: "100%", boxSizing: "border-box", fontSize: "13px", padding: "4px", border: "1px dashed #cbd5e1", borderRadius: "6px" }}
                    />
                    {editingTest.kyNang.speaking.parts[0]?.imageUrl && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "8px", boxSizing: "border-box" }}>
                        <img src={getMediaUrl(editingTest.kyNang.speaking.parts[0].imageUrl)} alt="Speaking Visual Prompt" style={{ maxWidth: "200px", maxHeight: "150px", borderRadius: "6px", border: "1px solid #cbd5e1" }} />
                        <span style={{ fontSize: "11px", color: "#64748b" }}>
                          {editingTest.kyNang.speaking.parts[0].imageName || "Ảnh đã tải lên"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "4px", boxSizing: "border-box", width: "100%" }}>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "#64748b" }}>Tải file audio lên (MP3/WAV)</label>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleSpeakingAudioUpload}
                      style={{ width: "100%", boxSizing: "border-box", fontSize: "13px", padding: "4px", border: "1px dashed #cbd5e1", borderRadius: "6px" }}
                    />
                    {editingTest.kyNang.speaking.parts[0]?.audioUrl && (
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px", padding: "6px 10px", background: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0", width: "100%", boxSizing: "border-box" }}>
                        <audio src={getMediaUrl(editingTest.kyNang.speaking.parts[0].audioUrl)} controls style={{ height: "24px" }} />
                        <span style={{ fontSize: "11px", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {(editingTest.kyNang.speaking.parts[0] as any).audioName || "Audio đã tải lên"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "4px", boxSizing: "border-box", width: "100%" }}>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "#64748b" }}>Thời gian chuẩn bị (giây)</label>
                    <input
                      type="number"
                      value={editingTest.kyNang.speaking.parts[0]?.thoiGianChuanBi ?? 60}
                      onChange={(e) => {
                        let rawVal = e.target.value;
                        if (rawVal.length > 1 && rawVal.startsWith("0")) {
                          rawVal = rawVal.replace(/^0+/, "");
                          e.target.value = rawVal;
                        }
                        const val = Number(rawVal) || 0;
                        const updated = { ...editingTest };
                        if (!updated.kyNang.speaking.parts[0]) {
                          updated.kyNang.speaking.parts[0] = { soPhan: 1, tieuDe: "Speaking Part 1", moTa: "Speaking Practice", audioUrl: "", noiDung: "", thoiGianChuanBi: val, thoiGianNoi: 12 * 60 };
                        } else {
                          updated.kyNang.speaking.parts[0].thoiGianChuanBi = val;
                        }
                        setEditingTest(updated);
                      }}
                      style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "13px" }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* Custom Exit Confirmation Modal */}
          {showExitConfirmPopup && (
            <div style={{
              position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(4px)",
              display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99999
            }} onClick={() => setShowExitConfirmPopup(false)}>
              <div style={{
                background: "white", borderRadius: "12px", padding: "24px", width: "400px",
                boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
                border: "1px solid #cbd5e1", textAlign: "center"
              }} onClick={(e) => e.stopPropagation()}>
                <h3 style={{ margin: "0 0 12px 0", fontSize: "16px", fontWeight: 700, color: "#1f2937" }}>
                  Xác nhận rời khỏi thiết kế
                </h3>
                <p style={{ fontSize: "14px", color: "#4b5563", margin: "0 0 20px 0", lineHeight: "1.5" }}>
                  Bạn có muốn rời khỏi thiết kế đề thi? Các thay đổi chưa lưu sẽ bị mất.
                </p>
                <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                  <button
                    onClick={() => setShowExitConfirmPopup(false)}
                    style={{ padding: "8px 16px", background: "#f3f4f6", border: "1px solid #cbd5e1", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: 600, color: "#374151" }}
                  >
                    Hủy bỏ
                  </button>
                  <button
                    onClick={() => {
                      isExitingRef.current = true;
                      setShowExitConfirmPopup(false);
                      setEditingTest(null);
                      setAddQuestionError("");
                      setAddAnswersError("");
                      setTestTitleError("");
                      window.history.back();
                    }}
                    style={{ padding: "8px 16px", background: "#ef4444", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: 600, color: "white" }}
                  >
                    Rời khỏi
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Custom Delete Part Confirmation Modal */}
          {showDeletePartConfirmPopup && (
            <div style={{
              position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(4px)",
              display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99999
            }} onClick={() => { setShowDeletePartConfirmPopup(false); setDeletePartInfo(null); }}>
              <div style={{
                background: "white", borderRadius: "12px", padding: "24px", width: "400px",
                boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
                border: "1px solid #cbd5e1", textAlign: "center"
              }} onClick={(e) => e.stopPropagation()}>
                <h3 style={{ margin: "0 0 12px 0", fontSize: "16px", fontWeight: 700, color: "#1f2937" }}>
                  Xác nhận xóa Part
                </h3>
                <p style={{ fontSize: "14px", color: "#4b5563", margin: "0 0 20px 0", lineHeight: "1.5" }}>
                  Bạn có chắc muốn xóa Part này cùng tất cả nội dung bên trong?
                </p>
                <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                  <button
                    onClick={() => {
                      setShowDeletePartConfirmPopup(false);
                      setDeletePartInfo(null);
                    }}
                    style={{ padding: "8px 16px", background: "#f3f4f6", border: "1px solid #cbd5e1", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: 600, color: "#374151" }}
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleConfirmDeletePart}
                    style={{ padding: "8px 16px", background: "#ef4444", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: 600, color: "white" }}
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const renderGradingWorkspace = () => {
    if (!selectedSubmission) return null;
    return (
      <div className="cd-workspace-container" style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#f8fafc", boxSizing: "border-box" }}>
        {/* Workspace Top Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 24px", background: "white", borderBottom: "1px solid #e2e8f0"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              onClick={() => setSelectedSubmission(null)}
              style={{
                display: "flex", alignItems: "center", gap: "6px", background: "#f1f5f9", border: "none",
                padding: "8px 12px", borderRadius: "8px", color: "#334155", cursor: "pointer", fontWeight: 600, fontSize: "13px"
              }}
            >
              <FiArrowLeft /> Quay lại
            </button>
            <div style={{ borderLeft: "1px solid #e2e8f0", paddingLeft: "12px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                Chấm điểm bài thi: {selectedSubmission.hoTen} ({selectedSubmission.maSinhVien})
              </h2>
              <span style={{ fontSize: "12px", color: "#64748b" }}>
                Đề thi: {selectedSubmission.tenDeThi} | Ngày nộp: {new Date(selectedSubmission.ngayNop).toLocaleString("vi-VN")}
              </span>
            </div>
          </div>
        </div>

        {/* Workspace Body */}
        <div style={{ display: "flex", flex: 1, padding: "24px", gap: "24px", boxSizing: "border-box" }}>
          
          {/* Left Column - Student Answers */}
          <div style={{ flex: 1.2, display: "flex", flexDirection: "column", gap: "16px", boxSizing: "border-box" }}>
            {/* Skill Subtabs */}
            <div style={{ display: "flex", gap: "6px", background: "white", padding: "6px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
              {(["listening", "reading", "writing", "speaking"] as const).map((sk) => {
                const isActive = gradingSkillTab === sk;
                const label = sk === "listening" ? "Listening (Máy)" 
                            : sk === "reading" ? "Reading (Máy)" 
                            : sk === "writing" ? "Writing (Tự luận)" 
                            : "Speaking (Tự luận)";
                
                // Show badge indicator
                let badge = "";
                if (sk === "listening") badge = `${selectedSubmission.diemNghe}`;
                else if (sk === "reading") badge = `${selectedSubmission.diemDoc}`;
                else if (sk === "writing") badge = selectedSubmission.diemViet !== null ? `${selectedSubmission.diemViet}` : (selectedSubmission.yeuCauChamViet ? "Chờ chấm" : "Chưa yêu cầu");
                else badge = selectedSubmission.diemNoi !== null ? `${selectedSubmission.diemNoi}` : (selectedSubmission.yeuCauChamNoi ? "Chờ chấm" : "Chưa yêu cầu");

                return (
                  <button
                    key={sk}
                    onClick={() => setGradingSkillTab(sk)}
                    style={{
                      flex: 1, padding: "10px", borderRadius: "8px", border: "none",
                      background: isActive ? "#fff4ec" : "transparent",
                      color: isActive ? "#F95800" : "#475569",
                      fontWeight: 600, fontSize: "13px", cursor: "pointer", transition: "all 0.2s"
                    }}
                  >
                    {label} <span style={{
                      fontSize: "11px", display: "inline-block", marginLeft: "4px", padding: "1px 6px", borderRadius: "10px",
                      background: isActive ? "#F95800" : "#f1f5f9",
                      color: isActive ? "white" : "#64748b"
                    }}>{badge}</span>
                  </button>
                );
              })}
            </div>

            {/* Answer detail box */}
            <div style={{ flex: 1, overflowY: "auto", maxHeight: "calc(100vh - 200px)" }}>
              {gradingSkillTab === "listening" && (
                <div style={{ padding: "20px", background: "white", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                  <h3 style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: 700, color: "#1e293b" }}>Kết quả Listening</h3>
                  <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 16px 0" }}>Phần thi trắc nghiệm nghe được chấm tự động bởi hệ thống.</p>
                  
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#f0fdf4", color: "#166534", padding: "12px 16px", borderRadius: "8px", fontWeight: 600, fontSize: "14px", marginBottom: "20px" }}>
                    <span>Điểm máy chấm: {selectedSubmission.diemNghe} / 10.0</span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ padding: "12px", background: "#f8fafc", borderRadius: "8px", fontSize: "13px", display: "flex", justifyContent: "space-between" }}>
                      <span>Part 1 (Short Conversations)</span>
                      <span style={{ color: "#166534", fontWeight: 600 }}>Đúng 6 / 8 câu</span>
                    </div>
                    <div style={{ padding: "12px", background: "#f8fafc", borderRadius: "8px", fontSize: "13px", display: "flex", justifyContent: "space-between" }}>
                      <span>Part 2 (Long Conversations)</span>
                      <span style={{ color: "#166534", fontWeight: 600 }}>Đúng 10 / 12 câu</span>
                    </div>
                    <div style={{ padding: "12px", background: "#f8fafc", borderRadius: "8px", fontSize: "13px", display: "flex", justifyContent: "space-between" }}>
                      <span>Part 3 (Talks / Lectures)</span>
                      <span style={{ color: "#166534", fontWeight: 600 }}>Đúng 14 / 15 câu</span>
                    </div>
                  </div>
                </div>
              )}

              {gradingSkillTab === "reading" && (
                <div style={{ padding: "20px", background: "white", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                  <h3 style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: 700, color: "#1e293b" }}>Kết quả Reading</h3>
                  <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 16px 0" }}>Phần thi trắc nghiệm đọc được chấm tự động bởi hệ thống.</p>
                  
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#f0fdf4", color: "#166534", padding: "12px 16px", borderRadius: "8px", fontWeight: 600, fontSize: "14px", marginBottom: "20px" }}>
                    <span>Điểm máy chấm: {selectedSubmission.diemDoc} / 10.0</span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ padding: "12px", background: "#f8fafc", borderRadius: "8px", fontSize: "13px", display: "flex", justifyContent: "space-between" }}>
                      <span>Part 1 (Reading Passages 1)</span>
                      <span style={{ color: "#166534", fontWeight: 600 }}>Đúng 8 / 10 câu</span>
                    </div>
                    <div style={{ padding: "12px", background: "#f8fafc", borderRadius: "8px", fontSize: "13px", display: "flex", justifyContent: "space-between" }}>
                      <span>Part 2 (Reading Passages 2)</span>
                      <span style={{ color: "#166534", fontWeight: 600 }}>Đúng 7 / 10 câu</span>
                    </div>
                    <div style={{ padding: "12px", background: "#f8fafc", borderRadius: "8px", fontSize: "13px", display: "flex", justifyContent: "space-between" }}>
                      <span>Part 3 (Reading Passages 3)</span>
                      <span style={{ color: "#166534", fontWeight: 600 }}>Đúng 8 / 10 câu</span>
                    </div>
                  </div>
                </div>
              )}

              {gradingSkillTab === "writing" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {!selectedSubmission.yeuCauChamViet ? (
                    <div style={{ padding: "40px", background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", textAlign: "center", color: "#64748b" }}>
                      <p style={{ margin: 0, fontSize: "14px", fontWeight: 600 }}>Học viên chưa bấm gửi yêu cầu chấm.</p>
                      <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#94a3b8" }}>Không thể hiển thị nội dung bài thi của học viên.</p>
                    </div>
                  ) : (
                    selectedSubmission.baiLamViet.map((text, i) => (
                      <div key={i} style={{ padding: "20px", background: "white", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                        <h4 style={{ margin: "0 0 10px 0", fontSize: "14px", fontWeight: 700, color: "#F95800" }}>Writing Task {i + 1} ({i === 0 ? "Email" : "Essay"})</h4>
                        <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", fontSize: "13px", color: "#475569", marginBottom: "12px", borderLeft: "4px solid #cbd5e1" }}>
                          <strong>Yêu cầu đề bài:</strong> {i === 0 
                            ? "Write an email responding to questions about your music taste, favorite songs and artist. Write at least 120 words." 
                            : "Discuss both views on whether technology has made life easier or more complicated and stressful. Give your opinion. Write at least 250 words."}
                        </div>
                        <div style={{
                          background: "#fafafa", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "16px",
                          fontFamily: "monospace", fontSize: "13px", color: "#1e293b", whiteSpace: "pre-wrap", minHeight: "150px", lineHeight: "1.6"
                        }}>
                          {text}
                        </div>
                        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px", fontSize: "12px", color: "#64748b" }}>
                          Số từ: {text.split(/\s+/).filter(Boolean).length} từ
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {gradingSkillTab === "speaking" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {!selectedSubmission.yeuCauChamNoi ? (
                    <div style={{ padding: "40px", background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", textAlign: "center", color: "#64748b" }}>
                      <p style={{ margin: 0, fontSize: "14px", fontWeight: 600 }}>Học viên chưa bấm gửi yêu cầu chấm.</p>
                      <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#94a3b8" }}>Không thể hiển thị nội dung bài thi của học viên.</p>
                    </div>
                  ) : (
                    <div style={{ padding: "20px", background: "white", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                      <h4 style={{ margin: "0 0 10px 0", fontSize: "14px", fontWeight: 700, color: "#F95800" }}>Speaking Part 1</h4>
                      <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", fontSize: "13px", color: "#475569", marginBottom: "12px", borderLeft: "4px solid #cbd5e1" }}>
                        <strong>Chủ đề:</strong> Part 1: Social Interaction (Hỏi đáp thông tin cá nhân về hoạt động buổi sáng, sở thích).
                      </div>
                      
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", background: "#f1f5f9", borderRadius: "8px" }}>
                        <button style={{ background: "#F95800", color: "white", border: "none", width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontWeight: "bold" }}>
                          ▶
                        </button>
                        <div style={{ flex: 1, height: "12px", background: "#cbd5e1", borderRadius: "6px", position: "relative", overflow: "hidden" }}>
                          <div style={{ position: "absolute", top: 0, left: 0, height: "100%", width: "40%", background: "#F95800" }} />
                        </div>
                        <span style={{ fontSize: "12px", color: "#475569", fontFamily: "monospace" }}>0:45 / 3:00</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Scorecard */}
          <div style={{ flex: 0.8, display: "flex", flexDirection: "column", gap: "20px", boxSizing: "border-box" }}>
            
            {/* Student card */}
            <div style={{ background: "white", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
              <h3 style={{ margin: "0 0 14px 0", fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>BẢNG ĐIỂM CHI TIẾT</h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px" }}>
                  <span style={{ fontSize: "13px", color: "#64748b" }}>Listening (Tự động)</span>
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "#1e293b" }}>{selectedSubmission.diemNghe} / 10</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px" }}>
                  <span style={{ fontSize: "13px", color: "#64748b" }}>Reading (Tự động)</span>
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "#1e293b" }}>{selectedSubmission.diemDoc} / 10</span>
                </div>

                {/* Writing Grade Form */}
                <div style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: "14px", paddingTop: "4px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#1e293b" }}>Writing (Giảng viên chấm)</span>
                    {selectedSubmission.diemViet === null ? (
                      <span style={{ background: "#fff2e8", color: "#fa541c", padding: "2px 8px", borderRadius: "4px", fontSize: "10px", fontWeight: 700 }}>Chờ chấm</span>
                    ) : (
                      <span style={{ background: "#e6f4ea", color: "#137333", padding: "2px 8px", borderRadius: "4px", fontSize: "10px", fontWeight: 700 }}>Đã chấm</span>
                    )}
                  </div>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="10"
                    value={gradeViet}
                    onChange={(e) => setGradeViet(e.target.value)}
                    placeholder="Nhập điểm viết (0 - 10)..."
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "13px", boxSizing: "border-box" }}
                  />
                  <textarea
                    value={feedbackViet}
                    onChange={(e) => setFeedbackViet(e.target.value)}
                    placeholder="Nhập nhận xét bài viết cho học viên..."
                    rows={3}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "12px", resize: "none", marginTop: "6px", boxSizing: "border-box" }}
                  />
                </div>

                {/* Speaking Grade Form */}
                <div style={{ paddingBottom: "14px", paddingTop: "4px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#1e293b" }}>Speaking (Giảng viên chấm)</span>
                    {selectedSubmission.diemNoi === null ? (
                      <span style={{ background: "#fff2e8", color: "#fa541c", padding: "2px 8px", borderRadius: "4px", fontSize: "10px", fontWeight: 700 }}>Chờ chấm</span>
                    ) : (
                      <span style={{ background: "#e6f4ea", color: "#137333", padding: "2px 8px", borderRadius: "4px", fontSize: "10px", fontWeight: 700 }}>Đã chấm</span>
                    )}
                  </div>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="10"
                    value={gradeNoi}
                    onChange={(e) => setGradeNoi(e.target.value)}
                    placeholder="Nhập điểm nói (0 - 10)..."
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "13px", boxSizing: "border-box" }}
                  />
                  <textarea
                    value={feedbackNoi}
                    onChange={(e) => setFeedbackNoi(e.target.value)}
                    placeholder="Nhập nhận xét bài nói cho học viên..."
                    rows={3}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "12px", resize: "none", marginTop: "6px", boxSizing: "border-box" }}
                  />
                </div>

                {/* Calculate Overall */}
                {gradeViet && gradeNoi && (
                  <div style={{ background: "#f0fdf4", border: "1px solid #b7eb8f", padding: "12px", borderRadius: "8px", marginTop: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: 600, color: "#166534" }}>
                      <span>Điểm tổng trung bình (VSTEP):</span>
                      <span>{(((selectedSubmission.diemNghe + selectedSubmission.diemDoc + Number(gradeViet) + Number(gradeNoi)) / 4)).toFixed(2)} / 10</span>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "20px" }}>
                <button
                  onClick={handleSaveGrades}
                  style={{
                    background: "#107544", color: "white", border: "none", padding: "12px", borderRadius: "8px",
                    fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%"
                  }}
                >
                  <FiCheckCircle /> Lưu điểm & Đánh giá
                </button>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  style={{
                    background: "#f1f5f9", color: "#334155", border: "none", padding: "12px", borderRadius: "8px",
                    fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%"
                  }}
                >
                  <FiX /> Hủy bỏ
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    );
  };

  const renderSubmissionsTab = () => {
    const filteredSubs = submissions.filter(s => {
      const matchSearch = s.hoTen.toLowerCase().includes(subSearch.toLowerCase()) || 
                          s.maSinhVien.toLowerCase().includes(subSearch.toLowerCase()) ||
                          s.tenDeThi.toLowerCase().includes(subSearch.toLowerCase());
      
      if (isQTV) {
        return matchSearch;
      } else {
        const isPending = s.diemViet === null || s.diemNoi === null;
        const isGraded = !isPending;
        if (subStatusFilter === "pending") return matchSearch && isPending;
        if (subStatusFilter === "graded") return matchSearch && isGraded;
        return matchSearch;
      }
    });

    return (
      <div>
        {/* Submissions Filter Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
          <form className="search-container" onSubmit={(e) => e.preventDefault()} style={{ marginBottom: 0 }}>
            <input
              className="search-input"
              placeholder="Tìm tên, mã SV hoặc đề thi..."
              value={subSearch}
              onChange={(e) => setSubSearch(e.target.value)}
            />
            <button className="search-button" type="button">
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

          {!isQTV && (
            <div style={{ display: "flex", gap: "6px", background: "#f1f5f9", padding: "4px", borderRadius: "8px" }}>
              <button
                onClick={() => setSubStatusFilter("all")}
                style={{
                  padding: "6px 12px", border: "none", borderRadius: "6px", fontSize: "13px", fontWeight: 600,
                  background: subStatusFilter === "all" ? "white" : "transparent",
                  color: subStatusFilter === "all" ? "#1e293b" : "#64748b",
                  cursor: "pointer", boxShadow: subStatusFilter === "all" ? "0 1px 3px rgba(0,0,0,0.1)" : "none"
                }}
              >
                Tất cả ({submissions.length})
              </button>
              <button
                onClick={() => setSubStatusFilter("pending")}
                style={{
                  padding: "6px 12px", border: "none", borderRadius: "6px", fontSize: "13px", fontWeight: 600,
                  background: subStatusFilter === "pending" ? "white" : "transparent",
                  color: subStatusFilter === "pending" ? "#fa541c" : "#64748b",
                  cursor: "pointer", boxShadow: subStatusFilter === "pending" ? "0 1px 3px rgba(0,0,0,0.1)" : "none"
                }}
              >
                Chờ chấm ({submissions.filter(s => s.diemViet === null || s.diemNoi === null).length})
              </button>
              <button
                onClick={() => setSubStatusFilter("graded")}
                style={{
                  padding: "6px 12px", border: "none", borderRadius: "6px", fontSize: "13px", fontWeight: 600,
                  background: subStatusFilter === "graded" ? "white" : "transparent",
                  color: subStatusFilter === "graded" ? "#107544" : "#64748b",
                  cursor: "pointer", boxShadow: subStatusFilter === "graded" ? "0 1px 3px rgba(0,0,0,0.1)" : "none"
                }}
              >
                Đã chấm ({submissions.filter(s => s.diemViet !== null && s.diemNoi !== null).length})
              </button>
            </div>
          )}
        </div>

        {/* SUBMISSIONS TABLE */}
        <div className="cd-table-container" style={{ background: "white", border: "1px solid #cbd5e1", borderRadius: "12px", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "12px" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #cbd5e1", color: "#475569" }}>
                <th style={{ padding: "10px 12px", fontWeight: 600 }}>Học viên</th>
                <th style={{ padding: "10px 12px", fontWeight: 600 }}>Đề thi</th>
                <th style={{ padding: "10px 12px", fontWeight: 600 }}>Ngày nộp</th>
                <th style={{ padding: "10px 12px", fontWeight: 600 }}>L / R</th>
                <th style={{ padding: "10px 12px", fontWeight: 600 }}>Writing</th>
                <th style={{ padding: "10px 12px", fontWeight: 600 }}>Speaking</th>
                <th style={{ padding: "10px 12px", fontWeight: 600 }}>Điểm TB</th>
                <th style={{ padding: "10px 12px", fontWeight: 600 }}>Trạng thái</th>
                <th style={{ padding: "10px 12px", fontWeight: 600, textAlign: "right" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubs.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: "20px", textAlign: "center", color: "#64748b" }}>
                    Không tìm thấy bài nộp nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredSubs.map((sub) => {
                  const isPending = sub.diemViet === null || sub.diemNoi === null;
                  const isGraded = !isPending;

                  let statusText = isGraded ? "Đã chấm xong" : "Chờ chấm";
                  let statusBg = isGraded ? "#e6f4ea" : "#fff4ec";
                  let statusColor = isGraded ? "#137333" : "#F95800";

                  return (
                    <tr key={sub.id} style={{ borderBottom: "1px solid #cbd5e1" }}>
                      <td style={{ padding: "10px 12px" }}>
                        <div style={{ fontWeight: 600, color: "#1e293b" }}>{sub.hoTen}</div>
                        <div style={{ fontSize: "10.5px", color: "#64748b" }}>{sub.maSinhVien}</div>
                      </td>
                      <td style={{ padding: "10px 12px", color: "#334155" }}>{sub.tenDeThi}</td>
                      <td style={{ padding: "10px 12px", color: "#64748b" }}>
                        {new Date(sub.ngayNop).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" })}
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        <span style={{ color: "#0284c7", fontWeight: 600 }}>L: {sub.diemNghe}</span>
                        <span style={{ color: "#cbd5e1", margin: "0 3px" }}>|</span>
                        <span style={{ color: "#0284c7", fontWeight: 600 }}>R: {sub.diemDoc}</span>
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        {sub.diemViet !== null ? (
                          <span style={{ color: "#107544", fontWeight: 600 }}>{sub.diemViet}</span>
                        ) : (
                          <span style={{ color: "#fa541c", fontWeight: 600, background: "#fff2e8", padding: "1px 5px", borderRadius: "4px", fontSize: "10.5px" }}>Chờ chấm</span>
                        )}
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        {sub.diemNoi !== null ? (
                          <span style={{ color: "#107544", fontWeight: 600 }}>{sub.diemNoi}</span>
                        ) : (
                          <span style={{ color: "#fa541c", fontWeight: 600, background: "#fff2e8", padding: "1px 5px", borderRadius: "4px", fontSize: "10.5px" }}>Chờ chấm</span>
                        )}
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        {sub.diemViet !== null && sub.diemNoi !== null ? (
                          <span style={{ color: "#0f172a", fontWeight: 700, fontSize: "13px" }}>
                            {((sub.diemNghe + sub.diemDoc + sub.diemViet + sub.diemNoi) / 4).toFixed(2)}
                          </span>
                        ) : (
                          <span style={{ color: "#94a3b8" }}>-</span>
                        )}
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        <span style={{
                          background: statusBg, color: statusColor, padding: "3px 6px", borderRadius: "4px", fontSize: "10.5px", fontWeight: 700
                        }}>
                          {statusText}
                        </span>
                      </td>
                      <td style={{ padding: "10px 12px", textAlign: "right" }}>
                        <button
                          onClick={() => handleOpenGrading(sub)}
                          style={{
                            padding: "5px 10px", background: isPending ? "#F95800" : "#f1f5f9",
                            color: isPending ? "white" : "#334155", border: "none", borderRadius: "6px",
                            fontSize: "11.5px", fontWeight: 600, cursor: "pointer", transition: "all 0.2s"
                          }}
                        >
                          {isPending ? "Chấm bài" : "Xem chi tiết"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Render GRADING WORKSPACE when selectedSubmission is active
  if (selectedSubmission) {
    return renderGradingWorkspace();
  }

  // Otherwise, render normal practice tests list
  return (
    <div className={`cd-wrapper ${isQTV ? "qtv-compact" : ""}`}>
      {toastMessage && (
        <div style={{
          position: "fixed", top: "20px", right: "20px", background: "#107544", color: "white",
          padding: "12px 24px", borderRadius: "8px", zIndex: 99999, fontWeight: 600,
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          animation: "fadeIn 0.2s"
        }}>
          {toastMessage}
        </div>
      )}

      <div className="cd-header" style={{ marginBottom: "24px" }}>
        <div>
          <h1 className="cd-title">Quản lý đề thi thử</h1>
        </div>
      </div>

      <div className="cd-content" style={isQTV ? { padding: "0 32px 32px 32px" } : undefined}>
      {/* TABS BAR */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px", marginBottom: "24px" }}>
        <button
          className="cd-tab-btn"
          onClick={() => setActiveTab("tests")}
          style={{
            padding: "10px 16px", borderRadius: "8px", border: "none",
            background: activeTab === "tests" ? "#fff4ec" : "transparent",
            color: activeTab === "tests" ? "#F95800" : "#64748b",
            fontWeight: 600, fontSize: "14px", cursor: "pointer"
          }}
        >
          Danh sách đề thi thử
        </button>
        <button
          className="cd-tab-btn"
          onClick={() => setActiveTab("submissions")}
          style={{
            padding: "10px 16px", borderRadius: "8px", border: "none",
            background: activeTab === "submissions" ? "#fff4ec" : "transparent",
            color: activeTab === "submissions" ? "#F95800" : "#64748b",
            fontWeight: 600, fontSize: "14px", cursor: "pointer",
            display: "flex", alignItems: "center", gap: "6px"
          }}
        >
          {isQTV ? "Kết quả thi thử" : "Bài nộp & Chấm điểm"}
          {!isQTV && submissions.filter(s => s.diemViet === null || s.diemNoi === null).length > 0 && (
            <span style={{ background: "#ef4444", color: "white", borderRadius: "50%", padding: "2px 6px", fontSize: "10px" }}>
              {submissions.filter(s => s.diemViet === null || s.diemNoi === null).length}
            </span>
          )}
        </button>
      </div>

      {activeTab === "tests" ? (
        <>
          <div className="cd-test-management-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
            <form className="search-container" onSubmit={handleSearchSubmit} style={{ marginBottom: 0 }}>
              <input
                className="search-input"
                placeholder="Tìm kiếm đề thi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="search-button" type="submit">
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

            <button
              className="cd-create-test-btn"
              onClick={handleStartCreateWizard}
              style={{
                display: "flex", alignItems: "center", gap: "8px", background: "#F95800", color: "white", border: "none",
                padding: "10px 20px", borderRadius: "8px", fontWeight: 600, fontSize: "14px", cursor: "pointer", transition: "background 0.2s"
              }}
            >
              <FiPlus /> Tạo đề thi mới
            </button>
          </div>

          {/* TESTS GRID */}
          <div className="cd-test-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
            {filteredTests.length === 0 ? (
              <p style={{ color: "#64748b", gridColumn: "1 / -1", textAlign: "center", padding: "30px", background: "white", borderRadius: "12px", border: "1px solid #eef2f6" }}>
                Không tìm thấy đề thi thử nào.
              </p>
            ) : (
              filteredTests.map((test) => {
                const listenQs = test.kyNang?.listening?.parts?.reduce((sum, p) => sum + (p.cauHois?.length || 0), 0) || 0;
                const readQs = test.kyNang?.reading?.parts?.reduce((sum, p) => sum + (p.cauHois?.length || 0), 0) || 0;
                const totalQs = listenQs + readQs;

                return (
                  <div key={test.MaBaiTest} className="cd-test-card" style={{
                    background: "white", border: "1px solid #cbd5e1", borderRadius: "12px", padding: "16px",
                    display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "0 2px 8px rgba(0,0,0,0.015)"
                  }}>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                        <span style={{
                          background: "#fff4ec", color: "#F95800", padding: "3px 6px", borderRadius: "4px", fontSize: "10px", fontWeight: 700
                        }}>{test.LoaiBai}</span>
                        <span className={`cd-test-badge-status ${test.TrangThai}`} style={{
                          background: test.TrangThai === "published" ? "#e6f4ea" : "#f1f5f9",
                          color: test.TrangThai === "published" ? "#137333" : "#475569",
                          padding: "3px 6px", borderRadius: "4px", fontSize: "10px", fontWeight: 700
                        }}>
                          {test.TrangThai === "published" ? "Hoạt động" : "Nháp"}
                        </span>
                      </div>

                      <h3 style={{ fontSize: "14.5px", fontWeight: 700, color: "#1e293b", margin: "0 0 4px 0", lineHeight: 1.4 }}>{test.TieuDe || "(Chưa đặt tên đề thi)"}</h3>
                      <p style={{ fontSize: "12px", color: "#64748b", margin: "0 0 12px 0", lineHeight: 1.5, height: "36px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                        {test.MoTa || ""}
                      </p>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #f1f5f9", paddingTop: "8px", marginBottom: "12px" }}>
                      <span style={{ fontSize: "11.5px", color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>
                        <FiClock /> {test.TongThoiGian} phút
                      </span>
                      <span style={{ fontSize: "11.5px", color: "#64748b", fontWeight: 600 }}>
                        {totalQs} câu hỏi
                      </span>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                      <button
                        onClick={() => handleOpenPreview(test)}
                        style={{
                          padding: "6px", background: "#f1f5f9", color: "#334155", border: "none", borderRadius: "6px",
                          fontSize: "11.5px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px"
                        }}
                      >
                        <FiEye /> Xem trước
                      </button>
                      <button
                        onClick={() => handleOpenEditWorkspace(test)}
                        style={{
                          padding: "6px", background: "#fff4ec", color: "#F95800", border: "none", borderRadius: "6px",
                          fontSize: "11.5px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px"
                        }}
                      >
                        <FiEdit /> Chỉnh sửa
                      </button>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginTop: "6px" }}>
                      <button
                        onClick={() => handleCloneTest(test)}
                        style={{
                          padding: "6px", background: "white", color: "#475569", border: "1px solid #cbd5e1", borderRadius: "6px",
                          fontSize: "11.5px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px"
                        }}
                      >
                        <FiCopy /> Nhân bản
                      </button>
                      <button
                        onClick={() => handleDeleteTest(test.MaBaiTest)}
                        style={{
                          padding: "6px", background: "white", color: "#ef4444", border: "1px solid #fee2e2", borderRadius: "6px",
                          fontSize: "11.5px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px"
                        }}
                      >
                        <FiTrash2 /> Xóa
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      ) : (
        renderSubmissionsTab()
      )}
      </div>

      {/* PREVIEW TEST QUESTIONS MODAL */}
      {showPreviewModal && previewTest && (
        <div className="cd-modal-overlay" style={{
          position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999
        }} onClick={() => setShowPreviewModal(false)}>

          <div className="cd-modal-card" style={{
            background: "#fff", borderRadius: "16px", padding: "32px", width: "100%", maxWidth: "700px",
            maxHeight: "85vh", overflowY: "auto", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)", border: "1px solid #cbd5e1"
          }} onClick={(e) => e.stopPropagation()}>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid #cbd5e1", paddingBottom: "12px" }}>
              <div>
                <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#1e293b", margin: 0 }}>Xem trước đề thi</h2>
                <p style={{ margin: "2px 0 0 0", color: "#64748b", fontSize: "13px" }}>
                  {previewTest.TieuDe || "(Chưa đặt tên)"}
                </p>
              </div>
              <button onClick={() => setShowPreviewModal(false)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer" }}><FiX size={20} /></button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div>
                <h4 style={{ color: "#F95800", borderBottom: "1px solid #f1f5f9", paddingBottom: "6px" }}>1. Listening Section</h4>
                {(!previewTest.kyNang?.listening?.parts || previewTest.kyNang.listening.parts.length === 0) ? (
                  <p style={{ fontSize: "13px", color: "#64748b" }}>Chưa có Part Listening nào.</p>
                ) : (
                  previewTest.kyNang.listening.parts.map((p, pIdx) => (
                    <div key={pIdx} style={{ margin: "12px 0", paddingLeft: "10px", borderLeft: "2px solid #cbd5e1" }}>
                      <h5 style={{ margin: "0 0 4px 0", fontSize: "14px" }}>Part {p.soPhan}: {p.tieuDe}</h5>
                      <p style={{ fontSize: "12px", color: "#64748b", margin: "0 0 8px 0" }} dangerouslySetInnerHTML={{ __html: p.huongDan }} />
                      {p.audioUrl && <p style={{ fontSize: "12px", color: "#F95800", margin: "0 0 10px 0" }}>Audio đã tải lên: {(p as any).audioName || "MP3/WAV File"}</p>}

                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {p.cauHois.map((q, qIdx) => (
                          <div key={qIdx} style={{ padding: "10px", background: "#f8fafc", borderRadius: "6px", border: "1px solid #cbd5e1" }}>
                            <div style={{ fontWeight: 600, fontSize: "13px" }} dangerouslySetInnerHTML={{ __html: `Câu ${q.id}: ${q.noiDung}` }} />
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginTop: "4px" }}>
                              {q.luaChon.map((choice, cIdx) => (
                                <div key={cIdx} style={{ fontSize: "12px", color: q.dapAn === ["A", "B", "C", "D"][cIdx] ? "#107544" : "#475569", fontWeight: q.dapAn === ["A", "B", "C", "D"][cIdx] ? 600 : 400 }}>
                                  {choice}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div>
                <h4 style={{ color: "#F95800", borderBottom: "1px solid #f1f5f9", paddingBottom: "6px" }}>2. Reading Section</h4>
                {(!previewTest.kyNang?.reading?.parts || previewTest.kyNang.reading.parts.length === 0) ? (
                  <p style={{ fontSize: "13px", color: "#64748b" }}>Chưa có Part Reading nào.</p>
                ) : (
                  previewTest.kyNang.reading.parts.map((p, pIdx) => (
                    <div key={pIdx} style={{ margin: "12px 0", paddingLeft: "10px", borderLeft: "2px solid #cbd5e1" }}>
                      <h5 style={{ margin: "0 0 4px 0", fontSize: "14px" }}>Part {p.soPhan}: {p.tieuDe}</h5>
                      <p style={{ fontSize: "12px", color: "#475569", fontStyle: "italic", background: "#f1f5f9", padding: "10px", borderRadius: "6px", margin: "6px 0 10px 0", border: "1px solid #cbd5e1" }} dangerouslySetInnerHTML={{ __html: p.doanVan }} />

                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {p.cauHois.map((q, qIdx) => (
                          <div key={qIdx} style={{ padding: "10px", background: "#f8fafc", borderRadius: "6px", border: "1px solid #cbd5e1" }}>
                            <div style={{ fontWeight: 600, fontSize: "13px" }} dangerouslySetInnerHTML={{ __html: `Câu ${q.id}: ${q.noiDung}` }} />
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginTop: "4px" }}>
                              {q.luaChon.map((choice, cIdx) => (
                                <div key={cIdx} style={{ fontSize: "12px", color: q.dapAn === ["A", "B", "C", "D"][cIdx] ? "#107544" : "#475569", fontWeight: q.dapAn === ["A", "B", "C", "D"][cIdx] ? 600 : 400 }}>
                                  {choice}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div>
                <h4 style={{ color: "#F95800", borderBottom: "1px solid #f1f5f9", paddingBottom: "6px" }}>3. Writing Section</h4>
                {(!previewTest.kyNang?.writing?.parts || previewTest.kyNang.writing.parts.length === 0) ? (
                  <p style={{ fontSize: "13px", color: "#64748b" }}>Chưa có Part Writing nào.</p>
                ) : (
                  previewTest.kyNang.writing.parts.map((p, pIdx) => (
                    <div key={pIdx} style={{ margin: "12px 0", paddingLeft: "10px", borderLeft: "2px solid #cbd5e1" }}>
                      <h5 style={{ margin: "0 0 4px 0", fontSize: "14px", fontWeight: 700 }}>Part {p.soPhan}: {p.tieuDe} ({p.loaiBai || (p.yeuCau && p.yeuCau.toLowerCase().includes("letter") ? "Letter" : "Email")})</h5>
                      <p style={{ fontSize: "12px", color: "#64748b", margin: "0 0 4px 0" }}>Số từ tối thiểu: {p.soTuToiThieu} từ</p>
                      <p style={{ fontSize: "12px", color: "#64748b", margin: "0 0 8px 0" }} dangerouslySetInnerHTML={{ __html: `Hướng dẫn: ${p.huongDan}` }} />
                      {p.goiY && (
                        <p style={{ fontSize: "12px", color: "#64748b", margin: "0 0 8px 0" }} dangerouslySetInnerHTML={{ __html: `Gợi ý: ${p.goiY}` }} />
                      )}
                      <p style={{ fontSize: "13px", color: "#1e293b", background: "#f8fafc", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }} dangerouslySetInnerHTML={{ __html: p.noiDung || "(Chưa nhập đề bài)" }} />
                      {p.yeuCau && (
                        <p style={{ fontSize: "12px", color: "#475569", margin: "8px 0 0 0", fontStyle: "italic" }} dangerouslySetInnerHTML={{ __html: `Yêu cầu chi tiết: ${p.yeuCau}` }} />
                      )}
                    </div>
                  ))
                )}
              </div>

              <div>
                <h4 style={{ color: "#F95800", borderBottom: "1px solid #f1f5f9", paddingBottom: "6px" }}>4. Speaking Section</h4>
                {previewTest.kyNang?.speaking?.parts?.map((p, pIdx) => (
                  <div key={pIdx} style={{ margin: "12px 0", background: "#f8fafc", padding: "14px", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
                    <h5 style={{ margin: "0 0 6px 0", fontSize: "13px", fontWeight: 700 }}>Part {p.soPhan}</h5>
                    <p style={{ fontSize: "13px", color: "#1e293b", fontWeight: 600, marginBottom: "8px" }} dangerouslySetInnerHTML={{ __html: `Đề bài: ${p.noiDung || "(Chưa nhập câu hỏi)"}` }} />
                    {p.imageUrl && (
                      <div style={{ margin: "10px 0", textAlign: "left" }}>
                        <img src={getMediaUrl(p.imageUrl)} alt="Speaking Visual Prompt" style={{ maxWidth: "200px", maxHeight: "150px", borderRadius: "6px", border: "1px solid #cbd5e1" }} />
                      </div>
                    )}
                    {p.audioUrl && <p style={{ fontSize: "12px", color: "#F95800", margin: "0 0 10px 0" }}>Audio đã tải lên: {(p as any).audioName || "MP3/WAV File"}</p>}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "12px", color: "#475569" }}>
                      <div>Thời gian chuẩn bị: <strong>{p.thoiGianChuanBi || 0} giây</strong></div>
                      <div>Thời gian trả lời: <strong>{p.thoiGianNoi || 0} giây</strong></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px", borderTop: "1px solid #cbd5e1", paddingTop: "14px" }}>
              <button
                onClick={() => setShowPreviewModal(false)}
                style={{ padding: "8px 20px", background: "#F95800", color: "white", border: "none", borderRadius: "6px", fontWeight: 600, cursor: "pointer" }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Exit Confirmation Modal */}
      {showExitConfirmPopup && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99999
        }} onClick={() => setShowExitConfirmPopup(false)}>
          <div style={{
            background: "white", borderRadius: "12px", padding: "24px", width: "400px",
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
            border: "1px solid #cbd5e1", textAlign: "center"
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 12px 0", fontSize: "16px", fontWeight: 700, color: "#1f2937" }}>
              Xác nhận rời khỏi thiết kế
            </h3>
            <p style={{ fontSize: "14px", color: "#4b5563", margin: "0 0 20px 0", lineHeight: "1.5" }}>
              Bạn có muốn rời khỏi thiết kế đề thi? Các thay đổi chưa lưu sẽ bị mất.
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button
                onClick={() => setShowExitConfirmPopup(false)}
                style={{ padding: "8px 16px", background: "#f3f4f6", border: "1px solid #cbd5e1", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: 600, color: "#374151" }}
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => {
                  isExitingRef.current = true;
                  setShowExitConfirmPopup(false);
                  setEditingTest(null);
                  setAddQuestionError("");
                  setAddAnswersError("");
                  setTestTitleError("");
                  window.history.back();
                }}
                style={{ padding: "8px 16px", background: "#ef4444", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: 600, color: "white" }}
              >
                Rời khỏi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {showDeleteConfirmPopup && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99999
        }} onClick={() => { setShowDeleteConfirmPopup(false); setTestIdToDelete(null); }}>
          <div style={{
            background: "white", borderRadius: "12px", padding: "24px", width: "400px",
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
            border: "1px solid #cbd5e1", textAlign: "center"
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 12px 0", fontSize: "16px", fontWeight: 700, color: "#1f2937" }}>
              Xác nhận xóa đề thi
            </h3>
            <p style={{ fontSize: "14px", color: "#4b5563", margin: "0 0 20px 0", lineHeight: "1.5" }}>
              Bạn có chắc chắn muốn xóa đề thi thử này không?
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button
                onClick={() => {
                  setShowDeleteConfirmPopup(false);
                  setTestIdToDelete(null);
                }}
                style={{ padding: "8px 16px", background: "#f3f4f6", border: "1px solid #cbd5e1", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: 600, color: "#374151" }}
              >
                Hủy
              </button>
              <button
                onClick={async () => {
                  if (testIdToDelete !== null) {
                    const isNew = testIdToDelete > 1000000000000;
                    if (!isNew) {
                      try {
                        const res = await fetch(`http://localhost:5000/dethi/${testIdToDelete}`, {
                          method: "DELETE"
                        });
                        if (res.ok) {
                          await loadTests();
                        } else {
                          alert("Lỗi khi xóa đề thi trên máy chủ.");
                        }
                      } catch (err) {
                        console.error("Lỗi xóa đề thi qua API:", err);
                        const updated = tests.filter(t => t.MaBaiTest !== testIdToDelete);
                        localStorage.setItem("flic_practice_tests", JSON.stringify(updated));
                        setTests(updated);
                      }
                    } else {
                      const updated = tests.filter(t => t.MaBaiTest !== testIdToDelete);
                      localStorage.setItem("flic_practice_tests", JSON.stringify(updated));
                      setTests(updated);
                    }
                  }
                  setShowDeleteConfirmPopup(false);
                  setTestIdToDelete(null);
                }}
                style={{ padding: "8px 16px", background: "#ef4444", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: 600, color: "white" }}
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Delete Part Confirmation Modal */}
      {showDeletePartConfirmPopup && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99999
        }} onClick={() => { setShowDeletePartConfirmPopup(false); setDeletePartInfo(null); }}>
          <div style={{
            background: "white", borderRadius: "12px", padding: "24px", width: "400px",
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
            border: "1px solid #cbd5e1", textAlign: "center"
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 12px 0", fontSize: "16px", fontWeight: 700, color: "#1f2937" }}>
              Xác nhận xóa Part
            </h3>
            <p style={{ fontSize: "14px", color: "#4b5563", margin: "0 0 20px 0", lineHeight: "1.5" }}>
              Bạn có chắc muốn xóa Part này cùng tất cả nội dung bên trong?
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button
                onClick={() => {
                  setShowDeletePartConfirmPopup(false);
                  setDeletePartInfo(null);
                }}
                style={{ padding: "8px 16px", background: "#f3f4f6", border: "1px solid #cbd5e1", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: 600, color: "#374151" }}
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmDeletePart}
                style={{ padding: "8px 16px", background: "#ef4444", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: 600, color: "white" }}
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuanLyDeThiThu;
