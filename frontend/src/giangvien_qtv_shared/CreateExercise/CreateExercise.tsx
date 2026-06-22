import "./CreateExercise.css";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";

interface Question {
  question: string;
  answers: string[];
  correct: string;
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

const getDangBaiOptions = (kn: string): string[] => {
  if (kn === "Nghe") return ["Nghe audio trắc nghiệm", "Hình ảnh chọn đáp án", "Nghe chép chính tả", "Điền từ vào đoạn văn"];
  if (kn === "Noi") return ["Luyện phát âm (check phát âm tự động)", "Nói theo chủ đề (ghi âm nộp GV)"];
  if (kn === "Doc") return ["Trắc nghiệm đọc hiểu (chia đôi màn hình)", "Bài tập từ vựng"];
  if (kn === "Viet") return ["Sắp xếp từ thành câu", "Trắc nghiệm xác định thì", "Viết đoạn văn ngắn", "Sắp xếp câu thành đoạn văn"];
  return [];
};

const mapDangBaiToType = (db: string): string => {
  if (db === "Nghe audio trắc nghiệm") return "listening-mcq";
  if (db === "Hình ảnh chọn đáp án") return "listening-image";
  if (db === "Nghe chép chính tả") return "listening-dictation";
  if (db === "Điền từ vào đoạn văn") return "listening-fill-in";
  if (db === "Luyện phát âm (check phát âm tự động)") return "speaking-pronounce";
  if (db === "Nói theo chủ đề (ghi âm nộp GV)") return "speaking-topic";
  if (db === "Trắc nghiệm đọc hiểu (chia đôi màn hình)") return "reading-split";
  if (db === "Bài tập từ vựng") return "reading-vocab-mcq";
  if (db === "Sắp xếp từ thành câu") return "writing-order-words";
  if (db === "Trắc nghiệm xác định thì") return "writing-tense-mcq";
  if (db === "Viết đoạn văn ngắn") return "writing-essay";
  if (db === "Sắp xếp câu thành đoạn văn") return "writing-order-sentences";
  return "multiple";
};

const CreateExercise = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isPractice = searchParams.get("isPractice") === "true";

  const [lesson, setLesson] = useState<any>(null);
  const userStr = sessionStorage.getItem("user") || localStorage.getItem("user");
  const user = JSON.parse(userStr || "{}");
  const vaiTroLower = (user.VaiTro || "").toLowerCase().trim();
  const isQTV = vaiTroLower === "quản trị nội dung" || vaiTroLower === "quản trị viên" || vaiTroLower === "admin" || window.location.pathname.toLowerCase().includes("/qtv");
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("Lưu kết quả thành công");
  const [title, setTitle] = useState("");
  const [type, setType] = useState("listening-mcq");
  
  const [kyNang, setKyNang] = useState("Nghe");
  const [dangBai, setDangBai] = useState("Nghe audio trắc nghiệm");
  const [isFree, setIsFree] = useState(false);
  const [isExam, setIsExam] = useState(false);
  const [deadline, setDeadline] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);

  // States for Exam Builder
  const [examDuration, setExamDuration] = useState(50);
  const [examStartTime, setExamStartTime] = useState("");
  const [commonAudioUrl, setCommonAudioUrl] = useState("");
  const [examSections, setExamSections] = useState<ExamSection[]>([
    {
      type: "listening-mcq",
      title: "Phần 1: Nghe trắc nghiệm",
      audioUrl: "",
      questions: [{ question: "", answers: ["", "", "", ""], correct: "A", explanation: "" }]
    }
  ]);

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
      sentences: [""]
    }
  ]);

  /* ===== LOAD LESSON ===== */
  useEffect(() => {
    if (!id) return;
    fetch(`http://14.225.192.252:5000/buoihoc/${id}`)
      .then(res => res.json())
      .then(data => setLesson(Array.isArray(data) ? data[0] : data))
      .catch(err => console.log(err));
  }, [id]);

  const [activeTab, setActiveTab] = useState<"create" | "reuse">("create");
  const [allExistingEx, setAllExistingEx] = useState<any[]>([]);
  const [reuseSearch, setReuseSearch] = useState("");

  useEffect(() => {
    // Fetch all existing exercises for cloning
    const userStr = sessionStorage.getItem("user") || localStorage.getItem("user");
    let url = "http://14.225.192.252:5000/exercises/list/all";
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

  const handleReuseExercise = async (exerciseId: number) => {
    try {
      const res = await fetch(`http://14.225.192.252:5000/exercises/${exerciseId}/clone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ MaBuoiHoc: Number(id) })
      });
      if (res.ok) {
        setSuccessMessage("Sao chép bài tập thành công");
        setShowSuccess(true);
        const isQTVPath = window.location.pathname.startsWith("/QTV");
        if (isQTVPath) {
          setTimeout(() => navigate("/QTV/khoahoc"), 1500);
        } else {
          setTimeout(() => navigate(`/bai-tap/${id}`), 1500);
        }
      } else {
        const txt = await res.text();
        alert("Không thể dùng lại bài tập: " + txt);
      }
    } catch (err) {
      alert("Lỗi kết nối: " + err);
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
    if (targetType === "reading-split") {
      let passage = "";
      let questionsText = text;
      
      const passageMarker = /\[(?:Bài đọc|Reading|Passage)\]\s*([\s\S]*?)(?=\[(?:Câu hỏi|Questions)\]|Câu\s*\d+|Question\s*\d+|\b\d+\s*[\.\:\)]|$)/i;
      const match = text.match(passageMarker);
      if (match) {
        passage = match[1].trim();
        questionsText = text.replace(match[0], "");
      } else {
        const qBoundary = /(?=Câu\s*\d+|Question\s*\d+|\b\d+\s*[\.\:\)])/i;
        const parts = text.split(qBoundary);
        if (parts.length > 0) {
          passage = parts[0].trim();
          questionsText = parts.slice(1).join("\n\n");
        }
      }

      const subQuestions: any[] = [];
      const qBoundary = /(?=Câu\s*\d+|Question\s*\d+|\b\d+\s*[\.\:\)])/i;
      const qBlocks = questionsText.split(qBoundary).map(b => b.trim()).filter(Boolean);
      
      for (const block of qBlocks) {
        const lines = block.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
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

      if (secIdx !== undefined) {
        const copy = [...examSections];
        copy[secIdx].content = passage;
        copy[secIdx].questions = subQuestions.map(sq => ({
          question: sq.question,
          answers: sq.answers,
          correct: sq.correct,
          explanation: "",
          audioUrl: "",
          imageUrl: "",
          text: "",
          prompt: "",
          vocabPairs: [{ word: "", meaning: "" }],
          fillInAnswers: [],
          sentences: [""]
        }));
        setExamSections(copy);
        alert(`Đã quét và điền thành công phần thi Đọc hiểu (Phần ${secIdx + 1}) với ${subQuestions.length} câu hỏi!`);
      } else {
        setQuestions([
          {
            question: "",
            answers: ["", "", "", ""],
            correct: "A",
            explanation: "",
            audioUrl: "",
            imageUrl: "",
            text: passage,
            prompt: "",
            vocabPairs: [{ word: "", meaning: "" }],
            fillInAnswers: [],
            sentences: [""],
            subQuestions: subQuestions
          }
        ]);
        alert("Đã quét thành công bài đọc và " + subQuestions.length + " câu hỏi!");
      }
      return;
    }

    // 2. Dạng trắc nghiệm (multiple, listening-mcq, writing-tense-mcq, reading-vocab-mcq)
    if (["multiple", "listening-mcq", "writing-tense-mcq", "reading-vocab-mcq"].includes(targetType)) {
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

    // 3. Dạng Nghe chép chính tả (listening-dictation) & Luyện phát âm (speaking-pronounce)
    if (targetType === "listening-dictation" || targetType === "speaking-pronounce") {
      const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      const parsed = lines.map(line => ({
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
      }));

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

    // 4. Sắp xếp câu thành đoạn văn (writing-order-sentences)
    if (targetType === "writing-order-sentences") {
      const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      if (lines.length > 0) {
        const parsedQuestion = {
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
          sentences: lines
        };
        if (secIdx !== undefined) {
          const copy = [...examSections];
          copy[secIdx].questions = [parsedQuestion];
          setExamSections(copy);
          alert(`Đã quét và điền thành công Phần ${secIdx + 1} đoạn văn gồm ${lines.length} câu!`);
        } else {
          setQuestions([parsedQuestion]);
          alert(`Đã quét thành công đoạn văn gồm ${lines.length} câu!`);
        }
      } else {
        alert("File trống hoặc không có nội dung hợp lệ.");
      }
      return;
    }

    // 5. Sắp xếp từ thành câu (writing-order-words)
    if (targetType === "writing-order-words") {
      const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      const parsed: any[] = [];
      for (let i = 0; i < lines.length; i += 2) {
        const promptLine = lines[i] || "";
        const correctLine = lines[i + 1] || "";
        if (correctLine) {
          parsed.push({
            question: "",
            answers: ["", "", "", ""],
            correct: "A",
            explanation: "",
            audioUrl: "",
            imageUrl: "",
            text: correctLine,
            prompt: promptLine,
            vocabPairs: [{ word: "", meaning: "" }],
            fillInAnswers: [],
            sentences: [""]
          });
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

    // 6. Điền từ vào đoạn văn (listening-fill-in)
    if (targetType === "listening-fill-in") {
      let passage = "";
      let answersText = "";
      const ansMarker = /\[(?:Đáp án|Answers|Keys)\]\s*([\s\S]*?)$/i;
      const match = text.match(ansMarker);
      if (match) {
        answersText = match[1].trim();
        passage = text.replace(match[0], "").replace(/\[(?:Đoạn văn|Passage)\]/i, "").trim();
      } else {
        passage = text.trim();
      }

      const fillInAnswers: string[] = [];
      const ansLines = answersText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      for (const line of ansLines) {
        const m = line.match(/^\d+\s*[\.\:\-]?\s*(.*)/);
        if (m) {
          fillInAnswers.push(m[1].trim());
        } else {
          fillInAnswers.push(line);
        }
      }

      const parsedQuestion = {
        question: "",
        answers: ["", "", "", ""],
        correct: "A",
        explanation: "",
        audioUrl: "",
        imageUrl: "",
        text: passage,
        prompt: "",
        vocabPairs: [{ word: "", meaning: "" }],
        fillInAnswers: fillInAnswers,
        sentences: [""]
      };

      if (secIdx !== undefined) {
        const copy = [...examSections];
        copy[secIdx].content = passage;
        copy[secIdx].questions = [parsedQuestion];
        setExamSections(copy);
        alert(`Đã quét và điền thành công Phần ${secIdx + 1} đoạn văn điền từ!`);
      } else {
        setQuestions([parsedQuestion]);
        alert("Đã quét thành công đoạn văn và danh sách đáp án!");
      }
      return;
    }

    alert("Dạng bài tập này chưa được hỗ trợ quét file tự động.");
  };

  /* ===== FILE UPLOAD HELPER ===== */
  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("http://14.225.192.252:5000/upload", {
      method: "POST",
      body: formData
    });
    if (!res.ok) throw new Error("Upload failed");
    const data = await res.json();
    return data.url || "";
  };

  const handleKyNangChange = (kn: string) => {
    setKyNang(kn);
    const opts = getDangBaiOptions(kn);
    if (opts.length > 0) {
      handleDangBaiChange(opts[0]);
    }
  };

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

  /* ===== QUESTION ACTIONS FOR REGULAR MODE ===== */
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
        sentences: [""]
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

  const updateQuestionItemAnswer = (qIdx: number, aIdx: number, value: string) => {
    const copy = [...questions];
    copy[qIdx].answers[aIdx] = value;
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
    setExamSections([
      ...examSections,
      {
        type: "listening-mcq",
        title: `Phần ${examSections.length + 1}`,
        audioUrl: "",
        questions: [{ question: "", answers: ["", "", "", ""], correct: "A", explanation: "" }]
      }
    ]);
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
      sentences: [""]
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
    if (copy[secIdx].questions && copy[secIdx].questions[qIdx]) {
      (copy[secIdx].questions[qIdx] as any)[field] = value;
    }
    setExamSections(copy);
  };

  const updateAnswerInSection = (secIdx: number, qIdx: number, aIdx: number, value: string) => {
    const copy = [...examSections];
    if (copy[secIdx].questions && copy[secIdx].questions[qIdx]) {
      copy[secIdx].questions[qIdx].answers[aIdx] = value;
    }
    setExamSections(copy);
  };

  /* ===== CREATE & POST BAITAP ===== */
  const handleCreate = async (statusOverride?: "draft" | "pending" | "published" | "practice") => {
    if (!title) { alert("Vui lòng nhập tiêu đề"); return; }

    const userStr = sessionStorage.getItem("user") || localStorage.getItem("user");
    const user = JSON.parse(userStr || "{}");
    const isTeacher = user.VaiTro === "Giảng Viên";
    const status = statusOverride || (isPractice ? "practice" : (isTeacher ? "pending" : "published"));
    const today = new Date().toISOString().split("T")[0];

    try {
      let contentStr = "";
      let questionsStr = "";
      let mainAudioUrl = "";

      if (isExam) {
        // Compile entire structure into Content
        const examContent = {
          isExam: true,
          duration: examDuration,
          startTime: examStartTime,
          deadline: deadline || null,
          sections: examSections
        };
        contentStr = JSON.stringify(examContent);
        questionsStr = ""; 
      } else {
        // Regular exercise
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

      await fetch("http://14.225.192.252:5000/baitap/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Title:       title,
          Type:        isExam ? "exam" : type,
          Content:     contentStr,
          Questions:   questionsStr,
          Vocabulary:  "", 
          CreatedDate: today,
          MaBuoiHoc:    Number(id),
          AudioUrl:    mainAudioUrl,
          ShowAnswer:  showAnswer ? 1 : 0,
          IsFree:      isFree ? 1 : 0,
          IsExam:      isExam ? 1 : 0,
          TrangThai:   status,
          KyNang:      kyNang,
          DangBai:     dangBai,
          MaGiangVien: user.MaNguoiDung || null
        })
      });

      setSuccessMessage(
        status === "draft"
          ? "Đã lưu bản nháp thành công"
          : status === "practice"
          ? "Tạo bài luyện tập thêm thành công"
          : isTeacher
          ? "Đã gửi yêu cầu duyệt bài tập đến QTV"
          : "Tạo bài tập thành công"
      );
      setShowSuccess(true);
      const isQTVPath = window.location.pathname.startsWith("/QTV");
      if (isQTVPath) {
        setTimeout(() => navigate("/QTV/khoahoc"), 1500);
      } else {
        setTimeout(() => navigate(`/bai-tap/${id}`), 1500);
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi khi tạo bài tập");
    }
  };

  if (!lesson) return <p>Đang tải...</p>;

  return (
    <div className="ce-wrapper">
      <div className="back" onClick={() => navigate(-1)}>← Quay lại</div>

      {/* HEADER CARD */}
      <div className="ce-header-card">
        <h1>{lesson?.TenBuoiHoc || "Đang tải..."}</h1>
        <p>{lesson?.MoTa || ""}</p>
      </div>

      {/* TABS */}
      <div className="tabs">
                <button className="tab active" onClick={() => navigate(`/bai-tap/${id}`)}>Bài tập</button>
        <button className="tab" onClick={() => navigate(`/quan-ly-bai-giang/${id}`)}>Bài giảng</button>
        <button className="tab" onClick={() => navigate(`/documents/${id}`)}>Tài liệu</button>
      </div>

      {/* SUB-TABS: TẠO MỚI / CHỌN CÓ SẴN */}
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
                    <span style={{ fontSize: "12px", color: "#8b7e74" }}>
                      Kỹ năng: {ex.KyNang || "—"} · Dạng: {ex.DangBai || "—"} · Lớp: {ex.TenLop} ({ex.TenBuoiHoc})
                    </span>
                  </div>
                  <button
                    type="button"
                    className="save-btn"
                    style={{ fontSize: "13px", padding: "8px 16px", width: "auto", margin: 0 }}
                    onClick={() => handleReuseExercise(ex.MaBaiTap)}
                  >
                    Chọn bài này
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
          {["multiple", "listening-mcq", "writing-tense-mcq", "reading-vocab-mcq", "reading-split", "listening-dictation", "speaking-pronounce", "writing-order-words", "writing-order-sentences", "listening-fill-in"].includes(type) ? (
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
                {type === "multiple" || type === "listening-mcq" || type === "writing-tense-mcq" || type === "reading-vocab-mcq" ? (
                  `Mẫu file Trắc nghiệm MCQ (Có thể tạo nhiều câu liên tiếp):\n` +
                  `Câu 1: What is the capital of France?\n` +
                  `A. London\n` +
                  `B. Paris\n` +
                  `C. Rome\n` +
                  `D. Berlin\n` +
                  `Đáp án đúng: B\n` +
                  `Giải thích: Paris là thủ đô nước Pháp (tùy chọn)\n\n` +
                  `Câu 2: How many colors are there in a rainbow?\n` +
                  `A. 5\n` +
                  `B. 6\n` +
                  `C. 7\n` +
                  `D. 8\n` +
                  `Đáp án đúng: C`
                ) : type === "reading-split" ? (
                  `Mẫu file Đọc chia đôi màn hình (Có thể tạo nhiều câu hỏi liên tiếp):\n` +
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
                  `Đáp án đúng: B`
                ) : type === "listening-dictation" ? (
                  `Mẫu file Nghe chép chính tả (Mỗi dòng là một câu, hỗ trợ nhiều câu):\n` +
                  `Hello, welcome to our class.\n` +
                  `I am learning English today.\n` +
                  `Practicing listening is very important.`
                ) : type === "speaking-pronounce" ? (
                  `Mẫu file Luyện phát âm (Mỗi dòng là một câu/từ, hỗ trợ nhiều câu):\n` +
                  `Hello, beautiful world!\n` +
                  `English pronunciation\n` +
                  `Thank you very much`
                ) : type === "writing-order-words" ? (
                  `Mẫu file Sắp xếp từ (Tạo nhiều câu bằng cách viết các cặp dòng liên tiếp):\n` +
                  `Tôi thích học tiếng Anh.\n` +
                  `I like learning English.\n` +
                  `Thời tiết hôm nay rất đẹp.\n` +
                  `The weather is very nice today.\n` +
                  `Tôi là học sinh.\n` +
                  `I am a student.`
                ) : type === "writing-order-sentences" ? (
                  `Mẫu file Sắp xếp câu thành đoạn văn (Mỗi dòng là một câu theo đúng thứ tự):\n` +
                  `First, download the app.\n` +
                  `Second, create your account.\n` +
                  `Finally, start practicing.`
                ) : type === "listening-fill-in" ? (
                  `Mẫu file Điền từ vào đoạn văn (Đoạn văn chứa các ký hiệu ô trống [1], [2],...):\n` +
                  `[Đoạn văn]\n` +
                  `Yesterday I went to the [1] and bought some [2] to eat.\n\n` +
                  `[Đáp án]\n` +
                  `1. supermarket\n` +
                  `2. apples`
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
                ⚠️ Dạng bài tập <strong>{dangBai}</strong> yêu cầu thiết lập thủ công các tệp đa phương tiện (ảnh/ghi âm) hoặc đề bài tự luận trực tiếp trên giao diện và không hỗ trợ tính năng quét từ file Word.
              </p>
            </div>
          )}

          <input
            className="exercise-title"
            placeholder={isPractice ? "Tiêu đề bài luyện tập thêm" : "Tiêu đề bài tập / bài kiểm tra"}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

        {/* Global Settings Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 15 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>Kỹ năng</label>
            <select
              className="exercise-type"
              style={{ width: '100%', marginTop: 0, marginBottom: 0 }}
              value={kyNang}
              disabled={isExam}
              onChange={(e) => handleKyNangChange(e.target.value)}
            >
              <option value="Nghe">Nghe (Listening)</option>
              <option value="Noi">Nói (Speaking)</option>
              <option value="Doc">Đọc (Reading)</option>
              <option value="Viet">Viết (Writing)</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>Dạng bài tập</label>
            <select
              className="exercise-type"
              style={{ width: '100%', marginTop: 0, marginBottom: 0 }}
              value={dangBai}
              disabled={isExam}
              onChange={(e) => handleDangBaiChange(e.target.value)}
            >
              {getDangBaiOptions(kyNang).map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 15 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>Hạn nộp bài (Deadline)</label>
            <input
              type="datetime-local"
              className="exercise-type"
              style={{ width: '100%', marginTop: 0, marginBottom: 0 }}
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
            />
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

            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={isExam}
                onChange={(e) => setIsExam(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: "#F95800", cursor: "pointer" }}
              />
              <span style={{ fontSize: 14, fontWeight: 500, color: "#334155" }}>Đặt làm bài kiểm tra</span>
            </label>
          </div>
        </div>

        {/* ────────────────── EXAM BUILDER SECTION ────────────────── */}
        {isExam ? (
          <div style={{ borderTop: "1px solid #e2e8f0", marginTop: 30, paddingTop: 24 }}>
            <h3 style={{ color: "#000080", marginBottom: 20, fontSize: "18px", fontWeight: 700 }}>⚙️ Cấu hình Bài Kiểm Tra</h3>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>Thời lượng (phút)</label>
                <input
                  type="number"
                  className="exercise-content"
                  style={{ marginTop: 0 }}
                  value={examDuration}
                  onChange={e => setExamDuration(Number(e.target.value))}
                />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>Thời gian bắt đầu</label>
                <input
                  type="datetime-local"
                  className="exercise-type"
                  style={{ width: '100%', marginTop: 0, marginBottom: 0 }}
                  value={examStartTime}
                  onChange={e => setExamStartTime(e.target.value)}
                />
              </div>
            </div>

            <h4 style={{ color: "#000080", borderBottom: "1.5px solid #000080", paddingBottom: 10, marginBottom: 20, fontSize: "16px", fontWeight: 700 }}>📚 Các Phần Bài Thi (Exam Sections)</h4>

            {examSections.map((sec, secIdx) => (
              <div key={secIdx} className="question-block" style={{ borderLeft: "4px solid #F95800", position: "relative", marginBottom: 24 }}>
                <div className="question-block-header">
                  <h4 style={{ fontSize: 16 }}>Phần {secIdx + 1}: {sec.title}</h4>
                  <button className="remove-btn" onClick={() => removeExamSection(secIdx)}>✕ Xóa phần này</button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 15, marginBottom: 15 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#666" }}>Tiêu đề phần</label>
                    <input
                      type="text"
                      className="exercise-content"
                      style={{ marginTop: 4 }}
                      value={sec.title}
                      onChange={e => {
                        const copy = [...examSections];
                        copy[secIdx].title = e.target.value;
                        setExamSections(copy);
                      }}
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
                        copy[secIdx].type = val;
                        // Reset properties based on type
                        if (val === "speaking-topic" || val === "writing-essay") {
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
                      <option value="listening-mcq">Nghe: Nghe audio trắc nghiệm</option>
                      <option value="listening-image">Nghe: Hình ảnh chọn đáp án</option>
                      <option value="listening-dictation">Nghe: Nghe chép chính tả</option>
                      <option value="listening-fill-in">Nghe: Điền từ vào đoạn văn</option>
                      <option value="speaking-pronounce">Nói: Luyện phát âm (tự động check)</option>
                      <option value="speaking-topic">Nói: Nói theo chủ đề (ghi âm nộp GV)</option>
                      <option value="reading-split">Đọc: Trắc nghiệm đọc hiểu (chia đôi màn hình)</option>
                      <option value="reading-vocab-mcq">Đọc: Bài tập từ vựng</option>
                      <option value="writing-order-words">Viết: Sắp xếp từ thành câu</option>
                      <option value="writing-tense-mcq">Viết: Trắc nghiệm xác định thì</option>
                      <option value="writing-essay">Viết: Viết đoạn văn ngắn</option>
                      <option value="writing-order-sentences">Viết: Sắp xếp câu thành đoạn văn</option>
                    </select>
                  </div>
                </div>

                {/* NÚT QUÉT FILE CÂU HỎI CHO PHẦN THI */}
                {["multiple", "listening-mcq", "writing-tense-mcq", "reading-vocab-mcq", "reading-split", "listening-dictation", "speaking-pronounce", "writing-order-words", "writing-order-sentences", "listening-fill-in"].includes(sec.type) ? (
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
                      {sec.type === "multiple" || sec.type === "listening-mcq" || sec.type === "writing-tense-mcq" || sec.type === "reading-vocab-mcq" ? (
                        `Mẫu file Trắc nghiệm MCQ:\n` +
                        `Câu 1: What is the capital of France?\n` +
                        `A. London\n` +
                        `B. Paris\n` +
                        `C. Rome\n` +
                        `D. Berlin\n` +
                        `Đáp án đúng: B`
                      ) : sec.type === "reading-split" ? (
                        `Mẫu file Đọc chia đôi màn hình:\n` +
                        `[Bài đọc]\n` +
                        `This is the reading passage text. You can write paragraphs here...\n\n` +
                        `[Câu hỏi]\n` +
                        `Câu 1: What is this passage about?\n` +
                        `A. French history\n` +
                        `B. Science\n` +
                        `C. Capital cities\n` +
                        `D. Sports\n` +
                        `Đáp án đúng: C`
                      ) : sec.type === "listening-dictation" ? (
                        `Mẫu file Nghe chép chính tả:\n` +
                        `Mỗi dòng trong file là một câu trả lời chính xác. Ví dụ:\n` +
                        `Hello, welcome to our class.\n` +
                        `I am learning English today.`
                      ) : sec.type === "speaking-pronounce" ? (
                        `Mẫu file Luyện phát âm:\n` +
                        `Mỗi dòng là một từ hoặc câu mẫu. Ví dụ:\n` +
                        `Hello, beautiful world!\n` +
                        `English pronunciation`
                      ) : sec.type === "writing-order-words" ? (
                        `Mẫu file Sắp xếp từ:\n` +
                        `Tôi thích học tiếng Anh.\n` +
                        `I like learning English.\n` +
                        `Thời tiết hôm nay rất đẹp.\n` +
                        `The weather is very nice today.`
                      ) : sec.type === "writing-order-sentences" ? (
                        `Mẫu file Sắp xếp câu thành đoạn văn:\n` +
                        `First, download the app.\n` +
                        `Second, create your account.\n` +
                        `Finally, start practicing.`
                      ) : sec.type === "listening-fill-in" ? (
                        `Mẫu file Điền từ vào đoạn văn:\n` +
                        `[Đoạn văn]\n` +
                        `Yesterday I went to the [1] and bought some [2] to eat.\n\n` +
                        `[Đáp án]\n` +
                        `1. supermarket\n` +
                        `2. apples`
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
                      ⚠️ Dạng phần thi <strong>{sec.type}</strong> không hỗ trợ quét từ file Word. Vui lòng thiết lập thủ công.
                    </p>
                  </div>
                )}

                {/* Section Specific Inputs */}
                {(sec.type === "listening-mcq" || sec.type === "writing-tense-mcq" || sec.type === "reading-vocab-mcq") && (
                  <div>
                    {sec.type === "listening-mcq" && (
                      <div style={{ marginBottom: 15 }}>
                        <label style={{ fontSize: 12, fontWeight: 600, color: "#666" }}>🎵 File nghe chung cho phần này (Tùy chọn)</label>
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
                      <div key={qIdx} style={{ background: "#fff", padding: 12, border: "1px solid #e0d4c3", borderRadius: 8, marginTop: 10 }}>
                        <div className="question-block-header">
                          <h5>Câu hỏi {qIdx + 1}</h5>
                          {sec.questions && sec.questions.length > 1 && (
                            <button type="button" className="remove-btn" style={{ padding: "2px 6px", fontSize: 11 }} onClick={() => removeQuestionFromSection(secIdx, qIdx)}>Xóa</button>
                          )}
                        </div>
                        {sec.type === "listening-mcq" && (
                          <div style={{ marginBottom: 12 }}>
                            <label style={{ fontSize: 11, fontWeight: 600, color: "#888" }}>Audio riêng cho câu này (Tùy chọn)</label>
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
                        <input
                          type="text"
                          placeholder="Câu hỏi"
                          className="exercise-content"
                          style={{ marginTop: 0 }}
                          value={q.question}
                          onChange={e => updateQuestionInSection(secIdx, qIdx, "question", e.target.value)}
                        />
                        {["A", "B", "C", "D"].map((lbl, aIdx) => (
                          <input
                            key={lbl}
                            type="text"
                            placeholder={`Lựa chọn ${lbl}`}
                            className="exercise-content"
                            style={{ margin: "5px 0" }}
                            value={q.answers[aIdx]}
                            onChange={e => updateAnswerInSection(secIdx, qIdx, aIdx, e.target.value)}
                          />
                        ))}
                        <select
                          className="exercise-type"
                          style={{ width: "100%", marginTop: 5 }}
                          value={q.correct}
                          onChange={e => updateQuestionInSection(secIdx, qIdx, "correct", e.target.value)}
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
                          value={q.explanation || ""}
                          onChange={e => updateQuestionInSection(secIdx, qIdx, "explanation", e.target.value)}
                        />
                      </div>
                    ))}
                    <button type="button" className="add-content" style={{ marginTop: 10, padding: 8 }} onClick={() => addQuestionToSection(secIdx)}>+ Thêm câu hỏi trắc nghiệm</button>
                  </div>
                )}

                {sec.type === "listening-image" && (
                  <div>
                    {sec.questions?.map((q, qIdx) => (
                      <div key={qIdx} style={{ background: "#fff", padding: 12, border: "1px solid #e0d4c3", borderRadius: 8, marginTop: 10 }}>
                        <div className="question-block-header">
                          <h5>Câu hỏi {qIdx + 1}</h5>
                          {sec.questions && sec.questions.length > 1 && (
                            <button type="button" className="remove-btn" style={{ padding: "2px 6px", fontSize: 11 }} onClick={() => removeQuestionFromSection(secIdx, qIdx)}>Xóa</button>
                          )}
                        </div>
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
                      </div>
                    ))}
                    <button type="button" className="add-content" style={{ marginTop: 10, padding: 8 }} onClick={() => addQuestionToSection(secIdx)}>+ Thêm câu hỏi hình ảnh</button>
                  </div>
                )}

                {sec.type === "listening-dictation" && (
                  <div>
                    {sec.questions?.map((q, qIdx) => (
                      <div key={qIdx} style={{ background: "#fff", padding: 12, border: "1px solid #e0d4c3", borderRadius: 8, marginTop: 10 }}>
                        <div className="question-block-header">
                          <h5>Câu hỏi {qIdx + 1}</h5>
                          {sec.questions && sec.questions.length > 1 && (
                            <button type="button" className="remove-btn" style={{ padding: "2px 6px", fontSize: 11 }} onClick={() => removeQuestionFromSection(secIdx, qIdx)}>Xóa</button>
                          )}
                        </div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: "#666" }}>🎵 Audio nghe</label>
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

                        <label style={{ fontSize: 12, fontWeight: 600, color: "#666" }}>Nội dung văn bản đúng</label>
                        <input
                          type="text"
                          className="exercise-content"
                          placeholder="Nhập văn bản đáp án đúng..."
                          value={q.text || ""}
                          onChange={e => updateQuestionInSection(secIdx, qIdx, "text", e.target.value)}
                        />
                      </div>
                    ))}
                    <button type="button" className="add-content" style={{ marginTop: 10, padding: 8 }} onClick={() => addQuestionToSection(secIdx)}>+ Thêm câu nghe chép chính tả</button>
                  </div>
                )}

                {sec.type === "listening-fill-in" && (
                  <div>
                    {sec.questions?.map((q, qIdx) => (
                      <div key={qIdx} style={{ background: "#fff", padding: 12, border: "1px solid #e0d4c3", borderRadius: 8, marginTop: 10 }}>
                        <div className="question-block-header">
                          <h5>Câu hỏi {qIdx + 1}</h5>
                          {sec.questions && sec.questions.length > 1 && (
                            <button type="button" className="remove-btn" style={{ padding: "2px 6px", fontSize: 11 }} onClick={() => removeQuestionFromSection(secIdx, qIdx)}>Xóa</button>
                          )}
                        </div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: "#666" }}>🎵 Audio nghe</label>
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

                        <label style={{ fontSize: 12, fontWeight: 600, color: "#666" }}>Đoạn văn (Dùng [1], [2]... để tạo ô trống)</label>
                        <textarea
                          className="exercise-content"
                          rows={3}
                          placeholder="Yesterday, I went to the [1] and bought [2]..."
                          value={q.text || ""}
                          onChange={e => {
                            const val = e.target.value;
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
                      </div>
                    ))}
                    <button type="button" className="add-content" style={{ marginTop: 10, padding: 8 }} onClick={() => addQuestionToSection(secIdx)}>+ Thêm câu hỏi điền từ</button>
                  </div>
                )}

                {sec.type === "speaking-pronounce" && (
                  <div>
                    {sec.questions?.map((q, qIdx) => (
                      <div key={qIdx} style={{ background: "#fff", padding: 12, border: "1px solid #e0d4c3", borderRadius: 8, marginTop: 10 }}>
                        <div className="question-block-header">
                          <h5>Câu hỏi {qIdx + 1}</h5>
                          {sec.questions && sec.questions.length > 1 && (
                            <button type="button" className="remove-btn" style={{ padding: "2px 6px", fontSize: 11 }} onClick={() => removeQuestionFromSection(secIdx, qIdx)}>Xóa</button>
                          )}
                        </div>
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
                        <input
                          type="text"
                          className="exercise-content"
                          placeholder="Hướng dẫn học viên (tùy chọn)"
                          value={q.explanation || ""}
                          onChange={e => updateQuestionInSection(secIdx, qIdx, "explanation", e.target.value)}
                        />
                      </div>
                    ))}
                    <button type="button" className="add-content" style={{ marginTop: 10, padding: 8 }} onClick={() => addQuestionToSection(secIdx)}>+ Thêm câu luyện phát âm</button>
                  </div>
                )}

                {sec.type === "writing-order-words" && (
                  <div>
                    {sec.questions?.map((q, qIdx) => (
                      <div key={qIdx} style={{ background: "#fff", padding: 12, border: "1px solid #e0d4c3", borderRadius: 8, marginTop: 10 }}>
                        <div className="question-block-header">
                          <h5>Câu hỏi {qIdx + 1}</h5>
                          {sec.questions && sec.questions.length > 1 && (
                            <button type="button" className="remove-btn" style={{ padding: "2px 6px", fontSize: 11 }} onClick={() => removeQuestionFromSection(secIdx, qIdx)}>Xóa</button>
                          )}
                        </div>
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
                      </div>
                    ))}
                    <button type="button" className="add-content" style={{ marginTop: 10, padding: 8 }} onClick={() => addQuestionToSection(secIdx)}>+ Thêm câu sắp xếp từ</button>
                  </div>
                )}

                {sec.type === "writing-order-sentences" && (
                  <div>
                    {sec.questions?.map((q, qIdx) => (
                      <div key={qIdx} style={{ background: "#fff", padding: 12, border: "1px solid #e0d4c3", borderRadius: 8, marginTop: 10 }}>
                        <div className="question-block-header">
                          <h5>Câu hỏi {qIdx + 1}</h5>
                          {sec.questions && sec.questions.length > 1 && (
                            <button type="button" className="remove-btn" style={{ padding: "2px 6px", fontSize: 11 }} onClick={() => removeQuestionFromSection(secIdx, qIdx)}>Xóa</button>
                          )}
                        </div>
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
                      </div>
                    ))}
                    <button type="button" className="add-content" style={{ marginTop: 10, padding: 8 }} onClick={() => addQuestionToSection(secIdx)}>+ Thêm câu sắp xếp câu</button>
                  </div>
                )}

                {sec.type === "reading-split" && (
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#666" }}>📖 Bài đọc dài (Hiển thị bên trái)</label>
                    <textarea
                      className="exercise-content"
                      rows={5}
                      value={sec.content || ""}
                      onChange={e => {
                        const copy = [...examSections];
                        copy[secIdx].content = e.target.value;
                        setExamSections(copy);
                      }}
                      placeholder="Nhập bài đọc..."
                    />

                    {/* Section MCQ List */}
                    {sec.questions?.map((q, qIdx) => (
                      <div key={qIdx} style={{ background: "#fff", padding: 12, border: "1px solid #e0d4c3", borderRadius: 8, marginTop: 10 }}>
                        <div className="question-block-header">
                          <h5>Câu hỏi {qIdx + 1}</h5>
                          {sec.questions && sec.questions.length > 1 && (
                            <button className="remove-btn" style={{ padding: "2px 6px", fontSize: 11 }} onClick={() => removeQuestionFromSection(secIdx, qIdx)}>Xóa</button>
                          )}
                        </div>
                        <input
                          type="text"
                          placeholder="Câu hỏi"
                          className="exercise-content"
                          style={{ marginTop: 0 }}
                          value={q.question}
                          onChange={e => updateQuestionInSection(secIdx, qIdx, "question", e.target.value)}
                        />
                        {["A", "B", "C", "D"].map((lbl, aIdx) => (
                          <input
                            key={lbl}
                            type="text"
                            placeholder={`Lựa chọn ${lbl}`}
                            className="exercise-content"
                            style={{ margin: "5px 0" }}
                            value={q.answers[aIdx]}
                            onChange={e => updateAnswerInSection(secIdx, qIdx, aIdx, e.target.value)}
                          />
                        ))}
                        <select
                          className="exercise-type"
                          style={{ width: "100%", marginTop: 5 }}
                          value={q.correct}
                          onChange={e => updateQuestionInSection(secIdx, qIdx, "correct", e.target.value)}
                        >
                          <option value="A">Đáp án đúng: A</option>
                          <option value="B">Đáp án đúng: B</option>
                          <option value="C">Đáp án đúng: C</option>
                          <option value="D">Đáp án đúng: D</option>
                        </select>
                      </div>
                    ))}
                    <button type="button" className="add-content" style={{ marginTop: 10, padding: 8 }} onClick={() => addQuestionToSection(secIdx)}>+ Thêm câu hỏi cho bài đọc</button>
                  </div>
                )}

                {sec.type === "speaking-topic" && (
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#666" }}>🗣️ Chủ đề / Topic nói</label>
                    <textarea
                      className="exercise-content"
                      rows={3}
                      value={sec.content || ""}
                      onChange={e => {
                        const copy = [...examSections];
                        copy[secIdx].content = e.target.value;
                        setExamSections(copy);
                      }}
                      placeholder="Nhập yêu cầu bài nói..."
                    />
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#666", display: "block", marginTop: 10 }}>🖼️ Ảnh gợi ý</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async e => {
                        if (e.target.files && e.target.files[0]) {
                          await handleExamSectionUpload(secIdx, "imageUrl", e.target.files[0]);
                        }
                      }}
                      style={{ display: "block", marginTop: 5 }}
                    />
                    {sec.imageUrl && <img src={sec.imageUrl} alt="Exam prompt suggestion" style={{ maxHeight: 120, display: "block", marginTop: 8 }} />}
                  </div>
                )}

                {sec.type === "writing-essay" && (
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#666" }}>✍️ Đề bài viết luận</label>
                    <textarea
                      className="exercise-content"
                      rows={4}
                      value={sec.content || ""}
                      onChange={e => {
                        const copy = [...examSections];
                        copy[secIdx].content = e.target.value;
                        setExamSections(copy);
                      }}
                      placeholder="Nhập đề bài viết luận..."
                    />
                  </div>
                )}
              </div>
            ))}

            <button type="button" className="add-content" onClick={addExamSection}>+ Thêm phần (Add Section)</button>
          </div>
        ) : (
          /* ────────────────── DYNAMIC MULTI-QUESTION BUILDERS ────────────────── */
          <div style={{ borderTop: "1px solid #e2e8f0", marginTop: 30, paddingTop: 24 }}>
            <h3 style={{ color: "#000080", marginBottom: 20, fontSize: "18px", fontWeight: 700 }}>📝 Danh sách Câu Hỏi ({dangBai})</h3>

            {type === "listening-mcq" && (
              <div style={{
                background: "#f8fafc",
                border: "1px dashed #cbd5e1",
                borderRadius: "12px",
                padding: "20px",
                marginBottom: "20px"
              }}>
                <h4 style={{ color: "#000080", marginTop: 0, marginBottom: 8, fontSize: "15px", fontWeight: 600 }}>🎵 File nghe chung cho toàn bộ bài tập (Tùy chọn)</h4>
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
                    <audio src={commonAudioUrl.startsWith("http") ? commonAudioUrl : `http://14.225.192.252:5000${commonAudioUrl}`} controls style={{ height: 32 }} />
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
                    <button className="remove-btn" onClick={() => removeQuestionItem(qIndex)}>✕ Xóa câu này</button>
                  )}
                </div>

                {/* ── SPEAKING PRONOUNCE ── */}
                {type === "speaking-pronounce" && (
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
                {type === "speaking-topic" && (
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#666" }}>Đề bài / Topic bằng chữ</label>
                    <textarea
                      className="exercise-content"
                      rows={3}
                      placeholder="Nhập đề bài nói..."
                      value={q.prompt || ""}
                      onChange={e => updateQuestionItemField(qIndex, "prompt", e.target.value)}
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
                  </div>
                )}

                {/* ── LISTENING MCQ & TENSE MCQ & VOCAB MCQ ── */}
                {(type === "listening-mcq" || type === "writing-tense-mcq" || type === "reading-vocab-mcq" || type === "multiple") && (
                  <div>
                    {type === "listening-mcq" && (
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
                          <p style={{ color: "#F95800", fontSize: 12, marginTop: 5 }}>⚠️ Đang dùng file nghe chung ở đầu bài tập</p>
                        ) : q.audioUrl ? (
                          <p style={{ color: "green", fontSize: 12, marginTop: 5 }}>✓ Đã tải: {q.audioUrl}</p>
                        ) : null}
                      </div>
                    )}

                    <textarea
                      className="exercise-content"
                      placeholder="Nhập câu hỏi"
                      value={q.question || ""}
                      onChange={e => updateQuestionItemField(qIndex, "question", e.target.value)}
                    />
                    {["A", "B", "C", "D"].map((lbl, aIdx) => (
                      <input
                        key={lbl}
                        className="exercise-content"
                        style={{ margin: "5px 0" }}
                        placeholder={`Đáp án ${lbl}`}
                        value={q.answers[aIdx] || ""}
                        onChange={e => updateQuestionItemAnswer(qIndex, aIdx, e.target.value)}
                      />
                    ))}
                    <select
                      className="exercise-type"
                      style={{ width: "100%", marginTop: 5 }}
                      value={q.correct}
                      onChange={e => updateQuestionItemField(qIndex, "correct", e.target.value)}
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
                      value={q.explanation || ""}
                      onChange={e => updateQuestionItemField(qIndex, "explanation", e.target.value)}
                    />
                  </div>
                )}

                {/* ── LISTENING IMAGE ── */}
                {type === "listening-image" && (
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

                    <select
                      className="exercise-type"
                      style={{ width: "100%" }}
                      value={q.correct}
                      onChange={e => updateQuestionItemField(qIndex, "correct", e.target.value)}
                    >
                      <option value="A">Đáp án đúng: A</option>
                      <option value="B">Đáp án đúng: B</option>
                      <option value="C">Đáp án đúng: C</option>
                      <option value="D">Đáp án đúng: D</option>
                    </select>
                  </div>
                )}

                {/* ── LISTENING DICTATION ── */}
                {type === "listening-dictation" && (
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
                {type === "listening-fill-in" && (
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
                    <textarea
                      className="exercise-content"
                      rows={3}
                      placeholder="Yesterday, I went to the [1] and bought [2]..."
                      value={q.text || ""}
                      onChange={e => {
                        const val = e.target.value;
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
                {type === "writing-order-words" && (
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
                {type === "writing-essay" && (
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#666" }}>Đề bài viết luận</label>
                    <textarea
                      className="exercise-content"
                      rows={4}
                      placeholder="Write a short letter..."
                      value={q.prompt || ""}
                      onChange={e => updateQuestionItemField(qIndex, "prompt", e.target.value)}
                    />
                  </div>
                )}

                {/* ── WRITING ORDER SENTENCES ── */}
                {type === "writing-order-sentences" && (
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
                {type === "reading-split" && (
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#666" }}>Bài đọc dài (Hiển thị bên trái)</label>
                    <textarea
                      className="exercise-content"
                      rows={5}
                      placeholder="Nhập bài đọc dài..."
                      value={q.text || ""}
                      onChange={e => updateQuestionItemField(qIndex, "text", e.target.value)}
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
                                onClick={() => {
                                  const copy = [...questions];
                                  copy[qIndex].subQuestions = copy[qIndex].subQuestions.filter((_: any, i: number) => i !== subIdx);
                                  setQuestions(copy);
                                }}
                              >Xóa</button>
                            )}
                          </div>
                          <input
                            type="text"
                            placeholder="Câu hỏi"
                            className="exercise-content"
                            style={{ marginTop: 0 }}
                            value={sub.question}
                            onChange={e => {
                              const copy = [...questions];
                              copy[qIndex].subQuestions[subIdx].question = e.target.value;
                              setQuestions(copy);
                            }}
                          />
                          {["A", "B", "C", "D"].map((lbl, aIdx) => (
                            <input
                              key={lbl}
                              type="text"
                              placeholder={`Lựa chọn ${lbl}`}
                              className="exercise-content"
                              style={{ margin: "5px 0" }}
                              value={sub.answers[aIdx]}
                              onChange={e => {
                                const copy = [...questions];
                                copy[qIndex].subQuestions[subIdx].answers[aIdx] = e.target.value;
                                setQuestions(copy);
                              }}
                            />
                          ))}
                          <select
                            className="exercise-type"
                            style={{ width: "100%", marginTop: 5 }}
                            value={sub.correct}
                            onChange={e => {
                              const copy = [...questions];
                              copy[qIndex].subQuestions[subIdx].correct = e.target.value;
                              setQuestions(copy);
                            }}
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
                        onClick={() => {
                          const copy = [...questions];
                          if (!copy[qIndex].subQuestions) copy[qIndex].subQuestions = [];
                          copy[qIndex].subQuestions.push({ question: "", answers: ["", "", "", ""], correct: "A", explanation: "" });
                          setQuestions(copy);
                        }}
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
          {isPractice ? (
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
                  padding: "12px",
                  borderRadius: "10px",
                  background: "#fff",
                  border: "1.5px solid #F95800",
                  color: "#F95800",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "background 0.2s"
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
                onClick={() => handleCreate(lesson?.TrangThaiDuyet === "Giảng Viên" ? "pending" : "published")}
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
    </div>
  );
};

export default CreateExercise;
