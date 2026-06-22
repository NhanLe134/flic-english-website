import "./CourseDetail.css";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import {
  FiBookOpen,
  FiUsers,
  FiCheckSquare,
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

interface ClassItem {
  id: number;
  name: string;
  code: string;
  schedule: string;
  students: number;
  progress: number;
}

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
    listening: { parts: ListeningPart[] };
    reading: { parts: ReadingPart[] };
    writing: { parts: WritingPart[] };
    speaking: { parts: SpeakingPart[] };
  };
}

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

  // Sync state to editor HTML
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
      {/* Formatting buttons toolbar */}
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

      {/* Content editable wrapper */}
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

const CourseDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const tenKhoaHoc = location.state?.tenKhoaHoc || "Chi tiết khóa học";

  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [pendingCount, setPendingCount] = useState(0);

  // Tab views
  const [activeTab, setActiveTab] = useState<"classes" | "tests">("classes");

  // Practice tests lists
  const [tests, setTests] = useState<BaiTest[]>([]);

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

  const loadTests = () => {
    let localTests = localStorage.getItem("flic_practice_tests");
    if (!localTests) {
      localStorage.setItem("flic_practice_tests", JSON.stringify(DEFAULT_TESTS));
      localTests = JSON.stringify(DEFAULT_TESTS);
    }
    try {
      setTests(JSON.parse(localTests));
    } catch (e) {
      setTests(DEFAULT_TESTS);
    }
  };

  useEffect(() => {
    loadTests();

    const user = JSON.parse(sessionStorage.getItem("user") || "{}");
    const maNguoiDung = user.MaNguoiDung;

    fetch(`http://14.225.192.252:5000/course-detail/${id}/classes/${maNguoiDung}`)
      .then((res) => res.json())
      .then(async (data) => {
        const mapped = await Promise.all(
          data.map(async (c: any) => {
            let soLuong = 0;
            try {
              const res = await fetch(`http://14.225.192.252:5000/lophoc/${c.MaLopHoc}/students/count`);
              const json = await res.json();
              soLuong = json?.SoLuongHocVien ?? 0;
            } catch (_) { }

            return {
              id: c.MaLopHoc,
              name: c.TenLop,
              code: `CT-${c.MaLopHoc}`,
              schedule: c.LichHoc,
              students: soLuong,
              progress: c.TienDo || 0,
            };
          })
        );
        setClasses(mapped);
      })
      .catch((err) => console.log(err));

    fetch("http://14.225.192.252:5000/teacher/submissions/pending-count")
      .then(res => res.json())
      .then(data => setPendingCount(data.count))
      .catch(err => console.log(err));
  }, [id]);

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
      
      // Push history state to intercept back button
      window.history.pushState({ isDesigning: true }, "");

      const handlePopState = () => {
        if (isExitingRef.current) return;
        
        if (checkIsDirtyRef.current()) {
          setShowExitConfirmPopup(true);
          // Restore the history state
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
      window.history.back(); // Clear the pushed history state
    }
  };

  // Action handlers
  const handleStartCreateWizard = () => {
    const newTestItem: BaiTest = {
      MaBaiTest: Date.now(),
      TieuDe: "",
      MoTa: "",
      TongThoiGian: 120,
      CapDo: "B1",
      LoaiBai: "VSTEP",
      NgayTao: new Date().toISOString(),
      TrangThai: "draft",
      kyNang: {
        listening: {
          parts: [
            { soPhan: 1, tieuDe: "Listening Part 1", huongDan: "Listen and choose the best answers.", audioUrl: "", cauHois: [] }
          ]
        },
        reading: {
          parts: [
            { soPhan: 1, tieuDe: "Reading Part 1", huongDan: "Read the passage and choose the best answers.", doanVan: "", cauHois: [] }
          ]
        },
        writing: {
          parts: [
            { soPhan: 1, tieuDe: "Writing Part 1", huongDan: "You should spend about 20 minutes on this task.", yeuCau: "Email", noiDung: "", soTuToiThieu: 120 }
          ]
        },
        speaking: {
          parts: [
            { soPhan: 1, tieuDe: "Speaking Part 1", moTa: "Speaking practice", audioUrl: "", noiDung: "", thoiGianChuanBi: 60, thoiGianNoi: 180 }
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

  const handleCloneTest = (testToClone: BaiTest) => {
    const clonedTest: BaiTest = {
      ...testToClone,
      MaBaiTest: Date.now(),
      TieuDe: `${testToClone.TieuDe} - Bản sao`,
      NgayTao: new Date().toISOString(),
      kyNang: JSON.parse(JSON.stringify(testToClone.kyNang))
    };
    const updated = [clonedTest, ...tests];
    localStorage.setItem("flic_practice_tests", JSON.stringify(updated));
    setTests(updated);
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
    setEditingTest(JSON.parse(JSON.stringify(test)));
    setWorkspaceSkill("listening");
    setActivePartIdx(0);
    setImportedQuestions([]);
    setImportErrors([]);
    setEditingQuestionIdx(null);
    setAddQuestionError("");
    setAddAnswersError("");
  };

  // Add Part helpers
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

  // Audio file upload handlers
  const handleListeningAudioUpload = (e: React.ChangeEvent<HTMLInputElement>, partIdx: number) => {
    const file = e.target.files?.[0];
    if (!file || !editingTest) return;
    const localUrl = URL.createObjectURL(file);
    const updated = { ...editingTest };
    updated.kyNang.listening.parts[partIdx].audioUrl = localUrl;
    updated.kyNang.listening.parts[partIdx].audioName = file.name;
    setEditingTest(updated);
  };

  const handleSpeakingAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingTest) return;
    const localUrl = URL.createObjectURL(file);
    const updated = { ...editingTest };
    if (!updated.kyNang.speaking.parts[0]) {
      updated.kyNang.speaking.parts[0] = { soPhan: 1, tieuDe: "Speaking Part 1", moTa: "Speaking Practice", audioUrl: "", noiDung: "", thoiGianChuanBi: 60, thoiGianNoi: 180 };
    }
    updated.kyNang.speaking.parts[0].audioUrl = localUrl;
    updated.kyNang.speaking.parts[0].audioName = file.name;
    setEditingTest(updated);
  };

  const handleSpeakingImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingTest) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      const updated = { ...editingTest };
      if (!updated.kyNang.speaking.parts[0]) {
        updated.kyNang.speaking.parts[0] = { soPhan: 1, tieuDe: "Speaking Part 1", moTa: "Speaking Practice", audioUrl: "", noiDung: "", thoiGianChuanBi: 60, thoiGianNoi: 180 };
      }
      updated.kyNang.speaking.parts[0].imageUrl = base64Url;
      updated.kyNang.speaking.parts[0].imageName = file.name;
      setEditingTest(updated);
    };
    reader.readAsDataURL(file);
  };

  // Add Question helper with required red warning validation
  const handleAddManualQuestion = (e: React.FormEvent, skill: "listening" | "reading", partIdx: number) => {
    e.preventDefault();
    if (!editingTest) return;

    let hasError = false;
    setAddQuestionError("");
    setAddAnswersError("");

    // Strip HTML tags to validate if actual text was entered
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

    // Clear forms and warnings
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

  // DOCX & TXT File Import Parser
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

  const handleSaveWorkspaceChanges = (statusToSet: "published" | "draft") => {
    if (!editingTest) return;

    if (!editingTest.TieuDe.trim()) {
      setTestTitleError("Vui lòng nhập đề thi.");
      return;
    }

    setTestTitleError("");
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
    window.history.back(); // Clear the pushed history state
  };

  const filteredClasses = classes.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Render WORKSPACE when editingTest is active
  if (editingTest) {
    return (
      <div className="cd-wrapper anim-fade-in" style={{ paddingBottom: "60px", maxWidth: "100%", overflowX: "hidden" }}>
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

        {/* WORKSPACE LAYOUT */}
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
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", boxSizing: "border-box" }}>
                  <label style={{ fontSize: "13px", fontWeight: 600, color: "#475569" }}>Thời gian (phút)</label>
                  <input
                    type="number"
                    value={editingTest.TongThoiGian}
                    onChange={(e) => setEditingTest({ ...editingTest, TongThoiGian: Number(e.target.value) || 0 })}
                    style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", outline: "none" }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px", boxSizing: "border-box" }}>
                  <label style={{ fontSize: "13px", fontWeight: 600, color: "#475569" }}>Cấp độ</label>
                  <select
                    value={editingTest.CapDo}
                    onChange={(e) => setEditingTest({ ...editingTest, CapDo: e.target.value })}
                    style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", outline: "none", background: "white" }}
                  >
                    <option value="A2">A2</option>
                    <option value="B1">B1</option>
                    <option value="B2">B2</option>
                    <option value="C1">C1</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px", boxSizing: "border-box" }}>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "#475569" }}>Loại bài</label>
                <select
                  value={editingTest.LoaiBai}
                  onChange={(e) => setEditingTest({ ...editingTest, LoaiBai: e.target.value })}
                  style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", outline: "none", background: "white" }}
                >
                  <option value="VSTEP">VSTEP</option>
                  <option value="TOEIC">TOEIC</option>
                  <option value="IELTS">IELTS</option>
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "14px", borderTop: "1px solid #f1f5f9", paddingTop: "16px", boxSizing: "border-box" }}>
                <button
                  onClick={() => handleSaveWorkspaceChanges("published")}
                  style={{
                    background: "#107544", color: "white", border: "none", padding: "12px", borderRadius: "8px",
                    fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", boxSizing: "border-box"
                  }}
                >
                  <FiCheckCircle size={18} /> Đăng bài
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
                    {/* Part Selectors with Delete option */}
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
                            onClick={() => handleDeletePart("listening", idx)}
                            style={{ border: "none", background: "none", display: "flex", alignItems: "center", cursor: "pointer", color: activePartIdx === idx ? "white" : "#ef4444", padding: "2px" }}
                            title="Xóa Part"
                          >
                            <FiX size={13} />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Active Part Form Editor */}
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
                            type="file"
                            accept="audio/*"
                            onChange={(e) => handleListeningAudioUpload(e, activePartIdx)}
                            style={{ width: "100%", boxSizing: "border-box", fontSize: "13px", padding: "4px", border: "1px dashed #cbd5e1", borderRadius: "6px" }}
                          />
                          {editingTest.kyNang.listening.parts[activePartIdx].audioUrl && (
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px", padding: "6px 10px", background: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0", width: "100%", boxSizing: "border-box" }}>
                              <audio src={editingTest.kyNang.listening.parts[activePartIdx].audioUrl} controls style={{ height: "24px" }} />
                              <span style={{ fontSize: "11px", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {editingTest.kyNang.listening.parts[activePartIdx].audioName || "Audio đã tải lên"}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Question Builder inside Part */}
                        <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "16px", boxSizing: "border-box", width: "100%" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", boxSizing: "border-box", flexWrap: "wrap", gap: "8px" }}>
                            <h5 style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "#334155" }}>
                              Danh sách câu hỏi của Part {activePartIdx + 1} ({editingTest.kyNang.listening.parts[activePartIdx].cauHois.length} câu)
                            </h5>

                            {/* DOCX Import within part */}
                            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                              <input
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

                          {/* Dynamic File Import Preview inside part */}
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

                          {/* Render Part questions list */}
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
                                    /* Edit Question form inside Listening Part */
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

                          {/* Add manual question inside Listening Part */}
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
                    {/* Part selectors with Delete option */}
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
                            onClick={() => handleDeletePart("reading", idx)}
                            style={{ border: "none", background: "none", display: "flex", alignItems: "center", cursor: "pointer", color: activePartIdx === idx ? "white" : "#ef4444", padding: "2px" }}
                            title="Xóa Part"
                          >
                            <FiX size={13} />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Active Reading Part form */}
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

                        {/* Questions list inside Reading Part */}
                        <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "16px", boxSizing: "border-box", width: "100%" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", boxSizing: "border-box", flexWrap: "wrap", gap: "8px" }}>
                            <h5 style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "#334155" }}>
                              Danh sách câu hỏi của Part {activePartIdx + 1} ({editingTest.kyNang.reading.parts[activePartIdx].cauHois.length} câu)
                            </h5>

                            {/* DOCX Import inside part */}
                            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                              <input
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

                          {/* Dynamic File Import Preview inside part */}
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

                          {/* Render questions list */}
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

                          {/* Add manual question to Reading Part */}
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
                    {/* Part Selectors with Delete option */}
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px", boxSizing: "border-box" }}>
                      {editingTest.kyNang.writing.parts.map((p, idx) => (
                        <div key={idx} style={{ display: "flex", alignItems: "center", gap: "2px", background: activePartIdx === idx ? "#F95800" : "#f1f5f9", borderRadius: "20px", padding: "2px 8px" }}>
                          <button
                            onClick={() => { setActivePartIdx(idx); }}
                            style={{
                              padding: "4px 8px", border: "none", background: "none",
                              color: activePartIdx === idx ? "white" : "#475569",
                              fontSize: "12px", fontWeight: 600, cursor: "pointer"
                            }}
                          >
                            Part {p.soPhan} ({p.loaiBai || (p.yeuCau && p.yeuCau.toLowerCase().includes("letter") ? "Letter" : "Email")})
                          </button>
                          <button
                            onClick={() => handleDeletePart("writing", idx)}
                            style={{ border: "none", background: "none", display: "flex", alignItems: "center", cursor: "pointer", color: activePartIdx === idx ? "white" : "#ef4444", padding: "2px" }}
                            title="Xóa Part"
                          >
                            <FiX size={13} />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Active Writing Part Form */}
                    {editingTest.kyNang.writing.parts[activePartIdx] && (
                      <div style={{ border: "1px solid #cbd5e1", borderRadius: "12px", padding: "20px", background: "white", display: "flex", flexDirection: "column", gap: "16px", boxSizing: "border-box", width: "100%" }}>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", boxSizing: "border-box", width: "100%" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px", boxSizing: "border-box" }}>
                            <label style={{ fontSize: "12px", fontWeight: 600, color: "#64748b" }}>Loại bài</label>
                            <select
                              value={editingTest.kyNang.writing.parts[activePartIdx].loaiBai || (editingTest.kyNang.writing.parts[activePartIdx].yeuCau && editingTest.kyNang.writing.parts[activePartIdx].yeuCau.toLowerCase().includes("letter") ? "Letter" : "Email")}
                              onChange={(e) => {
                                const val = e.target.value;
                                const updated = { ...editingTest };
                                const part = updated.kyNang.writing.parts[activePartIdx];
                                part.loaiBai = val;
                                if (val === "Email") {
                                  part.yeuCau = "Write an email responding to them, giving advice on travel routes, transportation, and accommodation. You should write at least 120 words. Do not include your name. Your response will be evaluated in terms of Task Fulfillment, Organization, Vocabulary and Grammar.";
                                } else {
                                  part.yeuCau = "Write a letter responding to them, giving advice on travel routes, transportation, and accommodation. You should write at least 120 words. Do not include your name. Your response will be evaluated in terms of Task Fulfillment, Organization, Vocabulary and Grammar.";
                                }
                                setEditingTest(updated);
                              }}
                              style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "13px", background: "white" }}
                            >
                              <option value="Email">Email</option>
                              <option value="Letter">Letter</option>
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
                          <label style={{ fontSize: "12px", fontWeight: 600, color: "#64748b", marginBottom: "4px" }}>Gợi ý làm bài</label>
                          <RichTextEditor
                            id={`textarea-write-goiy-${activePartIdx}`}
                            value={editingTest.kyNang.writing.parts[activePartIdx].goiY || ""}
                            onChange={(val) => {
                              const updated = { ...editingTest };
                              updated.kyNang.writing.parts[activePartIdx].goiY = val;
                              setEditingTest(updated);
                            }}
                            minHeight="80px"
                            placeholder="Nhập các gợi ý hoặc dàn ý gợi ý cho bài viết..."
                          />
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "4px", boxSizing: "border-box", width: "100%" }}>
                          <label style={{ fontSize: "12px", fontWeight: 600, color: "#64748b", marginBottom: "4px" }}>Đề bài (Prompt)</label>
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

                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* SKILL: SPEAKING */}
            {workspaceSkill === "speaking" && (
              <div className="anim-fade-in" style={{ display: "flex", flexDirection: "column", gap: "16px", boxSizing: "border-box", width: "100%" }}>
                <div style={{ border: "1px solid #cbd5e1", borderRadius: "12px", padding: "20px", background: "white", display: "flex", flexDirection: "column", gap: "16px", boxSizing: "border-box", width: "100%" }}>
                  <h4 style={{ margin: "0 0 4px 0", fontSize: "14px", fontWeight: 700, color: "#1e293b", borderBottom: "1px solid #f1f5f9", paddingBottom: "6px" }}>
                    Cấu hình Speaking Part 1
                  </h4>

                  <div style={{ display: "flex", flexDirection: "column", gap: "4px", boxSizing: "border-box", width: "100%" }}>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "#64748b", marginBottom: "4px" }}>Nội dung câu hỏi</label>
                    <RichTextEditor
                      id="textarea-speak-noidung-0"
                      value={editingTest.kyNang.speaking.parts[0]?.noiDung || ""}
                      onChange={(val) => {
                        const updated = { ...editingTest };
                        if (!updated.kyNang.speaking.parts[0]) {
                          updated.kyNang.speaking.parts[0] = { soPhan: 1, tieuDe: "Speaking Part 1", moTa: "Speaking Practice", audioUrl: "", noiDung: "", thoiGianChuanBi: 60, thoiGianNoi: 180 };
                        }
                        updated.kyNang.speaking.parts[0].noiDung = val;
                        setEditingTest(updated);
                      }}
                      minHeight="120px"
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "4px", boxSizing: "border-box", width: "100%" }}>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "#64748b" }}>Tải hình ảnh minh họa (dưới câu hỏi)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleSpeakingImageUpload}
                      style={{ width: "100%", boxSizing: "border-box", fontSize: "13px", padding: "4px", border: "1px dashed #cbd5e1", borderRadius: "6px" }}
                    />
                    {editingTest.kyNang.speaking.parts[0]?.imageUrl && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "6px", padding: "10px", background: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0", width: "100%", boxSizing: "border-box" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ fontSize: "11px", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "80%" }}>
                            {editingTest.kyNang.speaking.parts[0].imageName || "Hình ảnh đã tải lên"}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = { ...editingTest };
                              if (updated.kyNang.speaking.parts[0]) {
                                updated.kyNang.speaking.parts[0].imageUrl = undefined;
                                updated.kyNang.speaking.parts[0].imageName = undefined;
                              }
                              setEditingTest(updated);
                            }}
                            style={{ border: "none", background: "none", color: "#ef4444", fontSize: "11px", cursor: "pointer", fontWeight: 600 }}
                          >
                            Xóa hình ảnh
                          </button>
                        </div>
                        <img
                          src={editingTest.kyNang.speaking.parts[0].imageUrl}
                          alt="Preview"
                          style={{ maxWidth: "150px", maxHeight: "100px", borderRadius: "4px", border: "1px solid #cbd5e1", alignSelf: "flex-start" }}
                        />
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
                        <audio src={editingTest.kyNang.speaking.parts[0].audioUrl} controls style={{ height: "24px" }} />
                        <span style={{ fontSize: "11px", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {(editingTest.kyNang.speaking.parts[0] as any).audioName || "Audio đã tải lên"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", boxSizing: "border-box", width: "100%" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px", boxSizing: "border-box" }}>
                      <label style={{ fontSize: "12px", fontWeight: 600, color: "#64748b" }}>Thời gian chuẩn bị (giây)</label>
                      <input
                        type="number"
                        value={editingTest.kyNang.speaking.parts[0]?.thoiGianChuanBi || 60}
                        onChange={(e) => {
                          const updated = { ...editingTest };
                          if (!updated.kyNang.speaking.parts[0]) {
                            updated.kyNang.speaking.parts[0] = { soPhan: 1, tieuDe: "Speaking Part 1", moTa: "Speaking Practice", audioUrl: "", noiDung: "", thoiGianChuanBi: 60, thoiGianNoi: 180 };
                          }
                          updated.kyNang.speaking.parts[0].thoiGianChuanBi = Number(e.target.value) || 0;
                          setEditingTest(updated);
                        }}
                        style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "13px" }}
                      />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "4px", boxSizing: "border-box" }}>
                      <label style={{ fontSize: "12px", fontWeight: 600, color: "#64748b" }}>Thời gian trả lời (giây)</label>
                      <input
                        type="number"
                        value={editingTest.kyNang.speaking.parts[0]?.thoiGianNoi || 180}
                        onChange={(e) => {
                          const updated = { ...editingTest };
                          if (!updated.kyNang.speaking.parts[0]) {
                            updated.kyNang.speaking.parts[0] = { soPhan: 1, tieuDe: "Speaking Part 1", moTa: "Speaking Practice", audioUrl: "", noiDung: "", thoiGianChuanBi: 60, thoiGianNoi: 180 };
                          }
                          updated.kyNang.speaking.parts[0].thoiGianNoi = Number(e.target.value) || 0;
                          setEditingTest(updated);
                        }}
                        style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "13px" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    );
  }

  // Otherwise, render normal Course Detail tab lists
  return (
    <div className="cd-wrapper">
      <span className="cd-back" onClick={() => navigate(-1)}>
        <FiArrowLeft size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
        Quay lại
      </span>

      {/* HEADER ROW */}
      <div className="cd-header">
        <div>
          <h1 className="cd-title">{tenKhoaHoc}</h1>
        </div>
      </div>

      {/* STATS CARD - STATIC INFORMATION DISPLAYS WITHOUT TOGGLES */}
      <div className="cd-stats">
        <div className="cd-stat-card classes-card">
          <div className="stat-icon-wrapper">
            <FiBookOpen size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Lớp học</span>
            <h3 className="stat-value">{filteredClasses.length} lớp</h3>
            <span className="stat-desc">Tổng số lớp học</span>
          </div>
        </div>

        <div className="cd-stat-card students-card">
          <div className="stat-icon-wrapper">
            <FiUsers size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Học viên</span>
            <h3 className="stat-value">{filteredClasses.reduce((t, c) => t + c.students, 0)} HV</h3>
            <span className="stat-desc">Tổng số học viên</span>
          </div>
        </div>

        <div className="cd-stat-card pending-card">
          <div className="stat-icon-wrapper">
            <FiCheckSquare size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Chấm bài</span>
            <h3 className="stat-value">{pendingCount} bài nộp</h3>
            <span className="stat-desc">Số bài nộp chưa chấm</span>
          </div>
        </div>
      </div>

      {/* EXPLICIT NAVIGATION TABS BAR */}
      <div className="cd-tab-bar" style={{ display: "flex", gap: "8px", borderBottom: "2px solid #f1f5f9", marginBottom: "20px" }}>
        <button
          className={`cd-tab-button ${activeTab === "classes" ? "active" : ""}`}
          onClick={() => setActiveTab("classes")}
          style={{
            padding: "12px 24px", fontSize: "15px", fontWeight: 600,
            color: activeTab === "classes" ? "#F95800" : "#64748b",
            background: "none", border: "none",
            borderBottom: activeTab === "classes" ? "3px solid #F95800" : "3px solid transparent",
            cursor: "pointer", transition: "all 0.2s"
          }}
        >
          Quản lý lớp học
        </button>
        <button
          className={`cd-tab-button ${activeTab === "tests" ? "active" : ""}`}
          onClick={() => setActiveTab("tests")}
          style={{
            padding: "12px 24px", fontSize: "15px", fontWeight: 600,
            color: activeTab === "tests" ? "#F95800" : "#64748b",
            background: "none", border: "none",
            borderBottom: activeTab === "tests" ? "3px solid #F95800" : "3px solid transparent",
            cursor: "pointer", transition: "all 0.2s"
          }}
        >
          Quản lý đề thi
        </button>
      </div>

      {/* CONDITIONAL TAB VIEWS */}
      {activeTab === "classes" ? (
        <>
          {/* SEARCH CONTAINER - PREVENT SUBMIT/RELOAD */}
          <form className="search-container" onSubmit={(e) => e.preventDefault()}>
            <input
              className="search-input"
              placeholder="Tìm kiếm lớp học theo tên hoặc mã lớp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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

          {/* CLASS LIST */}
          <div className="cd-class-list">
            {filteredClasses.length === 0 ? (
              <p>Không tìm thấy lớp học</p>
            ) : (
              filteredClasses.map((item, i) => (
                <div key={item.id} className="cd-class-card">
                  <div className="cd-card-header">
                    <span className="cd-index-tag">Lớp {i + 1}</span>
                    <span className="cd-code-tag">{item.code}</span>
                  </div>
                  <h3>{item.name}</h3>
                  <p className="cd-schedule">{(item.schedule || '—').replace(/,?\s*\d{1,2}:\d{2}-\d{1,2}:\d{2}/g, '')}</p>
                  <p className="cd-students">{item.students} Học viên</p>
                  <button
                    className="cd-detail-btn"
                    onClick={() =>
                      navigate(`/lessonlist/${item.id}`, {
                        state: { tenKhoaHoc, tenLop: item.name },
                      })
                    }
                  >
                    Xem chi tiết
                  </button>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <>
          {/* PRACTICE TESTS MANAGEMENT VIEW */}
          <div className="cd-test-management-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 style={{ fontSize: "18px", color: "#1e293b", fontWeight: 700, margin: 0 }}>Danh sách đề thi thử của khóa</h2>
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
          <div className="cd-test-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
            {tests.length === 0 ? (
              <p style={{ color: "#64748b", gridColumn: "1 / -1", textAlign: "center", padding: "40px", background: "white", borderRadius: "12px", border: "1px solid #eef2f6" }}>
                Chưa có đề thi thử nào. Hãy tạo một đề thi mới.
              </p>
            ) : (
              tests.map((test) => {
                const listenQs = test.kyNang?.listening?.parts?.reduce((sum, p) => sum + (p.cauHois?.length || 0), 0) || 0;
                const readQs = test.kyNang?.reading?.parts?.reduce((sum, p) => sum + (p.cauHois?.length || 0), 0) || 0;
                const totalQs = listenQs + readQs;

                return (
                  <div key={test.MaBaiTest} className="cd-test-card" style={{
                    background: "white", border: "1px solid #cbd5e1", borderRadius: "16px", padding: "24px",
                    display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "0 2px 8px rgba(0,0,0,0.015)"
                  }}>
                    <div>
                      {/* Header tags */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                        <span style={{
                          background: "#fff4ec", color: "#F95800", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: 700
                        }}>{test.LoaiBai}</span>
                        <span className={`cd-test-badge-status ${test.TrangThai}`} style={{
                          background: test.TrangThai === "published" ? "#e6f4ea" : "#f1f5f9",
                          color: test.TrangThai === "published" ? "#137333" : "#475569",
                          padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: 700
                        }}>
                          {test.TrangThai === "published" ? "Hoạt động" : "Nháp"}
                        </span>
                      </div>

                      <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#1e293b", margin: "0 0 6px 0", lineHeight: 1.4 }}>{test.TieuDe || "(Chưa đặt tên đề thi)"}</h3>
                      <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 16px 0", lineHeight: 1.5, height: "38px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                        {test.MoTa || ""}
                      </p>
                    </div>

                    {/* Metadata info */}
                    <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #f1f5f9", paddingTop: "12px", marginBottom: "16px" }}>
                      <span style={{ fontSize: "12px", color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>
                        <FiClock /> {test.TongThoiGian} phút
                      </span>
                      <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
                        Cấp độ: {test.CapDo}
                      </span>
                      <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
                        {totalQs} câu hỏi
                      </span>
                    </div>

                    {/* Operational buttons */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                      <button
                        onClick={() => handleOpenPreview(test)}
                        style={{
                          padding: "8px", background: "#f1f5f9", color: "#334155", border: "none", borderRadius: "8px",
                          fontSize: "12px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px"
                        }}
                      >
                        <FiEye /> Xem trước
                      </button>
                      <button
                        onClick={() => handleOpenEditWorkspace(test)}
                        style={{
                          padding: "8px", background: "#fff4ec", color: "#F95800", border: "none", borderRadius: "8px",
                          fontSize: "12px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px"
                        }}
                      >
                        <FiEdit /> Thiết kế
                      </button>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "8px" }}>
                      <button
                        onClick={() => handleCloneTest(test)}
                        style={{
                          padding: "8px", background: "white", color: "#475569", border: "1px solid #cbd5e1", borderRadius: "8px",
                          fontSize: "12px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px"
                        }}
                      >
                        <FiCopy /> Nhân bản
                      </button>
                      <button
                        onClick={() => handleDeleteTest(test.MaBaiTest)}
                        style={{
                          padding: "8px", background: "white", color: "#ef4444", border: "1px solid #fee2e2", borderRadius: "8px",
                          fontSize: "12px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px"
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
      )}

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

              {/* Listening Preview */}
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

              {/* Reading Preview */}
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

              {/* Writing Preview */}
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

              {/* Speaking Preview */}
              <div>
                <h4 style={{ color: "#F95800", borderBottom: "1px solid #f1f5f9", paddingBottom: "6px" }}>4. Speaking Section</h4>
                {previewTest.kyNang?.speaking?.parts?.map((p, pIdx) => (
                  <div key={pIdx} style={{ margin: "12px 0", background: "#f8fafc", padding: "14px", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
                    <h5 style={{ margin: "0 0 6px 0", fontSize: "13px", fontWeight: 700 }}>Part {p.soPhan}</h5>
                    <p style={{ fontSize: "13px", color: "#1e293b", fontWeight: 600, marginBottom: "8px" }} dangerouslySetInnerHTML={{ __html: `Đề bài: ${p.noiDung || "(Chưa nhập câu hỏi)"}` }} />
                    {p.imageUrl && (
                      <div style={{ margin: "10px 0", textAlign: "left" }}>
                        <img src={p.imageUrl} alt="Speaking Visual Prompt" style={{ maxWidth: "200px", maxHeight: "150px", borderRadius: "6px", border: "1px solid #cbd5e1" }} />
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
                  window.history.back(); // Clear the pushed history state
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
                onClick={() => {
                  if (testIdToDelete !== null) {
                    const updated = tests.filter(t => t.MaBaiTest !== testIdToDelete);
                    localStorage.setItem("flic_practice_tests", JSON.stringify(updated));
                    setTests(updated);
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

export default CourseDetail;
