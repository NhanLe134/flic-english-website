// @ts-nocheck
import "./AssignmentDetail.css";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useState, useEffect, useRef, useMemo } from "react";
import { FiVolume2, FiEdit3, FiBookOpen, FiFileText, FiCheckCircle, FiXCircle, FiClock, FiMic, FiAward, FiList } from "react-icons/fi";
import { CustomAudioPlayer } from "../../components/CustomAudioPlayer/CustomAudioPlayer";

const API = "http://localhost:5000";

interface MCQuestion {
  question: string;
  options: { label: string; text: string }[];
  correct: string;
}

function AssignmentDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const maLopHoc = location.state?.maLopHoc;

  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  const maNguoiDung = user.MaNguoiDung;

  const [maSinhVien, setMaSinhVien] = useState<number | null>(null);

  useEffect(() => {
    if (!maNguoiDung) return;
    fetch(`${API}/students/by-user/${maNguoiDung}`)
      .then(r => r.json())
      .then(data => {
        if (data && data.MaSinhVien) {
          setMaSinhVien(data.MaSinhVien);
        }
      })
      .catch(err => console.error("Error fetching student info:", err));
  }, [maNguoiDung]);

  const [exercise, setExercise] = useState<any>(null);
  const [lopInfo, setLopInfo] = useState<any>(null);
  const [baiNop, setBaiNop] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Solving states
  const [currentPageIdx, setCurrentPageIdx] = useState(0);
  const [mcAnswers, setMcAnswers] = useState<Record<string | number, string>>({}); // mapped by questionIdx
  const [essayAnswers, setEssayAnswers] = useState<Record<string | number, string>>({}); // mapped by questionIdx
  const [fillInAnswers, setFillInAnswers] = useState<Record<string | number, string[]>>({}); // questionIdx -> list of answers
  const [orderedWords, setOrderedWords] = useState<Record<string | number, string[]>>({}); // questionIdx -> words
  const [shuffledWords, setShuffledWords] = useState<Record<string | number, string[]>>({}); // questionIdx -> words
  const [shuffledSentences, setShuffledSentences] = useState<Record<string | number, string[]>>({}); // questionIdx -> sentences

  // Multi-audio limit track
  const [listenCounts, setListenCounts] = useState<Record<string | number, number>>({});

  // Multiple Voice Recordings (mapped by questionIndex)
  const [recordedBlobs, setRecordedBlobs] = useState<Record<string | number, Blob>>({});
  const [recordedUrls, setRecordedUrls] = useState<Record<string | number, string>>({});
  const [isRecording, setIsRecording] = useState<Record<string | number, boolean>>({});
  const [recordSeconds, setRecordSeconds] = useState<Record<string | number, number>>({});

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<any>(null);

  // Web Speech API
  const [spokenTexts, setSpokenTexts] = useState<Record<string | number, string>>({});
  const [speechScores, setSpeechScores] = useState<Record<string | number, number | null>>({});
  const [isListeningSTT, setIsListeningSTT] = useState<Record<string | number, boolean>>({});
  const recognitionRef = useRef<any>(null);

  // Exam state
  const [activeSectionIdx, setActiveSectionIdx] = useState(0);
  const [examSecondsLeft, setExamSecondsLeft] = useState<number | null>(null);
  const [examStarted, setExamStarted] = useState(false);
  const [examEnded, setExamEnded] = useState(false);
  const [timeToExamStart, setTimeToExamStart] = useState<number | null>(null); // seconds until start

  // Parse exercise content metadata
  const parsedContent = useMemo(() => {
    if (!exercise?.Content) return {};
    try {
      if (exercise.Content.trim().startsWith("{")) {
        return JSON.parse(exercise.Content);
      }
    } catch (e) {
      console.error(e);
    }
    return {
      text: exercise.Content,
      description: exercise.Content,
      deadline: null
    };
  }, [exercise]);

  // Check if Exam
  const isExam = !!parsedContent.isExam || exercise?.Type === "exam";

  // Build/Parse Questions List
  const questionsList = useMemo(() => {
    if (isExam) return []; // Exams use sections
    if (!exercise?.Questions) {
      // Fallback for single question templates
      return [{
        question: exercise?.Title || "",
        audioUrl: exercise?.AudioUrl || "",
        imageUrl: parsedContent.imageUrl || "",
        text: parsedContent.text || exercise?.Content || "",
        prompt: parsedContent.prompt || exercise?.Content || "",
        level: parsedContent.level || "Đọc theo câu",
        explanation: ""
      }];
    }
    try {
      if (exercise.Questions.trim().startsWith("[")) {
        return JSON.parse(exercise.Questions);
      }
    } catch (e) { }

    // Fallback to old custom text formatting
    const exType = (exercise?.Type || "").toLowerCase();
    const isMultiple = ["multiple", "quiz", "trắc nghiệm", "reading-vocab-mcq", "writing-tense-mcq"].includes(exType);
    const isListening = ["listening", "nghe", "listening-mcq", "listening-image", "listening-dictation", "listening-fill-in"].includes(exType);
    const isReadingSplit = exType === "reading-split";

    if (isMultiple || isListening || isReadingSplit) {
      // Parse MCQs
      const raw = exercise.Questions;
      if (raw.includes("###") || raw.includes("||")) {
        return raw.split("###").map(block => {
          const parts = block.split("||");
          const question = parts[0]?.trim() || "";
          const rest = parts[1] || "";
          const items = rest.split("|");
          const options: { label: string; text: string }[] = [];
          let correct = "A";
          let explanation = "";
          items.forEach(item => {
            const trimmed = item.trim();
            if (trimmed.startsWith("Đáp án đúng:")) {
              correct = trimmed.replace("Đáp án đúng:", "").trim();
            } else if (trimmed.startsWith("Giải thích:")) {
              explanation = trimmed.replace("Giải thích:", "").trim();
            } else {
              const match = trimmed.match(/^([A-D])\.\s*(.+)/);
              if (match) options.push({ label: match[1], text: match[2] });
            }
          });
          return { question, answers: options.map(o => o.text), correct, explanation };
        }).filter(q => q.question);
      }
    }

    // Single item fallback based on type
    if (exType === "listening-dictation") {
      return [{ audioUrl: exercise.AudioUrl, text: exercise.Content }];
    }
    if (exType === "listening-fill-in") {
      return [{ audioUrl: exercise.AudioUrl, text: exercise.Content, fillInAnswers: (exercise.Questions || "").split("|").map(s => s.trim()) }];
    }
    if (exType === "speaking-pronounce") {
      return [{ text: parsedContent.text || exercise.Content, level: parsedContent.level || "Đọc theo câu", explanation: exercise.Questions || "" }];
    }
    if (exType === "speaking-topic") {
      return [{ prompt: parsedContent.prompt || exercise.Content, imageUrl: parsedContent.imageUrl || "" }];
    }
    if (exType === "writing-order-words") {
      return [{ text: exercise.Content, correctSentence: exercise.Questions }];
    }
    if (exType === "writing-order-sentences") {
      return [{ sentences: (exercise.Questions || "").split("###").map(s => s.trim()).filter(Boolean) }];
    }
    if (exType === "writing-essay") {
      return [{ prompt: exercise.Content }];
    }

    return [{ question: exercise.Title, text: exercise.Content }];
  }, [exercise, isExam, parsedContent]);

  // Group questions into pages:
  // - Questions of the same reading-split passage go on the same page.
  // - Questions sharing the same audioUrl go on the same page.
  // - General/Simple questions with no audio or passage are grouped together on a single page.
  const questionPages = useMemo(() => {
    if (isExam) return []; // Exams use their own sections tabs
    if (questionsList.length === 0) return [];

    const pages: any[][] = [];
    let currentAudioGroup: any[] = [];
    let currentAudioUrl: string | null = null;
    let currentSimpleGroup: any[] = [];

    questionsList.forEach((q) => {
      // 1. Reading split passage has its own page
      if ((exercise?.Type || "").toLowerCase() === "reading-split" || q.subQuestions) {
        if (currentAudioGroup.length > 0) {
          pages.push(currentAudioGroup);
          currentAudioGroup = [];
          currentAudioUrl = null;
        }
        if (currentSimpleGroup.length > 0) {
          pages.push(currentSimpleGroup);
          currentSimpleGroup = [];
        }
        pages.push([q]);
        return;
      }

      // 2. Questions sharing the same audio Url
      if (q.audioUrl) {
        if (currentSimpleGroup.length > 0) {
          pages.push(currentSimpleGroup);
          currentSimpleGroup = [];
        }

        if (currentAudioUrl && q.audioUrl === currentAudioUrl) {
          currentAudioGroup.push(q);
        } else {
          if (currentAudioGroup.length > 0) {
            pages.push(currentAudioGroup);
          }
          currentAudioGroup = [q];
          currentAudioUrl = q.audioUrl;
        }
        return;
      }

      // 3. Simple questions with no audio or reading-split
      if (currentAudioGroup.length > 0) {
        pages.push(currentAudioGroup);
        currentAudioGroup = [];
        currentAudioUrl = null;
      }
      currentSimpleGroup.push(q);
    });

    if (currentAudioGroup.length > 0) {
      pages.push(currentAudioGroup);
    }
    if (currentSimpleGroup.length > 0) {
      pages.push(currentSimpleGroup);
    }

    return pages;
  }, [questionsList, isExam, exercise]);

  // Load prior submission and metadata
  useEffect(() => {
    if (!id) return;
    Promise.all([
      fetch(`${API}/baitap/${id}`).then(r => r.json()),
      maLopHoc ? fetch(`${API}/classes/${maLopHoc}/info`).then(r => r.json()) : Promise.resolve(null),
      fetch(`${API}/bainop/baitap/${id}`).then(r => r.json()),
    ])
      .then(([exData, lopData, nopData]) => {
        setExercise(exData);
        setLopInfo(lopData);
        const myNop = Array.isArray(nopData)
          ? nopData.find((b: any) => b.MaSinhVien === maSinhVien || b.MaSinhVien === maNguoiDung || b.MaNguoiDung === maNguoiDung)
          : null;
        setBaiNop(myNop || null);
        if (myNop) {
          setSubmitted(true);
          try {
            const contentText = myNop.NoiDung || "";
            if (contentText.startsWith("{") || contentText.startsWith("[")) {
              const subObj = JSON.parse(contentText);
              if (subObj.isExam) {
                // Populate exam responses
                const loadedAnswers: Record<string | number, string> = {};
                const loadedEssay: Record<string | number, string> = {};
                const loadedUrls: Record<string | number, string> = {};
                const loadedFillIn: Record<string | number, string[]> = {};
                subObj.sections.forEach((sec: any, sIdx: number) => {
                  if (sec.type === "listening-mcq" || sec.type === "reading-split") {
                    Object.keys(sec.answers || {}).forEach((qIdxStr) => {
                      loadedAnswers[`${sIdx}_${qIdxStr}`] = sec.answers[qIdxStr];
                    });
                  } else if (sec.type === "writing-essay") {
                    loadedEssay[sIdx] = sec.essayText;
                  } else if (sec.type === "speaking-topic") {
                    loadedUrls[sIdx] = sec.audioUrl;
                    loadedEssay[sIdx] = sec.note;
                  } else if (sec.questions) {
                    sec.questions.forEach((q: any) => {
                      const qIdx = q.questionIdx;
                      const key = `${sIdx}_${qIdx}`;
                      if (q.chosenAnswer) loadedAnswers[key] = q.chosenAnswer;
                      if (q.essayText) loadedEssay[key] = q.essayText;
                      if (q.audioUrl) loadedUrls[key] = q.audioUrl;
                      if (q.fillInAnswers) loadedFillIn[key] = q.fillInAnswers;
                      if (q.spokenText) setSpokenTexts(prev => ({ ...prev, [key]: q.spokenText }));
                      if (q.speechScore) setSpeechScores(prev => ({ ...prev, [key]: q.speechScore }));
                      if (q.sentences) setShuffledSentences(prev => ({ ...prev, [key]: q.sentences }));
                    });
                  }
                });
                setMcAnswers(loadedAnswers);
                setEssayAnswers(loadedEssay);
                setRecordedUrls(loadedUrls);
                setFillInAnswers(loadedFillIn);
              } else {
                // Populate regular questions responses
                const loadedAnswers: Record<number, string> = {};
                const loadedEssay: Record<number, string> = {};
                const loadedUrls: Record<number, string> = {};
                const loadedFillIn: Record<number, string[]> = {};
                subObj.questions.forEach((q: any) => {
                  const idx = q.questionIdx;
                  if (q.chosenAnswer) loadedAnswers[idx] = q.chosenAnswer;
                  if (q.essayText) loadedEssay[idx] = q.essayText;
                  if (q.audioUrl) loadedUrls[idx] = q.audioUrl;
                  if (q.fillInAnswers) loadedFillIn[idx] = q.fillInAnswers;
                  if (q.spokenText) setSpokenTexts(prev => ({ ...prev, [idx]: q.spokenText }));
                  if (q.speechScore) setSpeechScores(prev => ({ ...prev, [idx]: q.speechScore }));
                });
                setMcAnswers(loadedAnswers);
                setEssayAnswers(loadedEssay);
                setRecordedUrls(loadedUrls);
                setFillInAnswers(loadedFillIn);
              }
            } else {
              // Backward compatibility parsing
              setEssayAnswers({ 0: contentText });
            }
          } catch (e) {
            console.log("Error parsing prior submission", e);
          }
        }
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [id, maLopHoc]);

  // Initializing words and sentences shuffle
  useEffect(() => {
    if (questionsList.length > 0 && !submitted) {
      questionsList.forEach((q, idx) => {
        if (exercise?.Type === "writing-order-words" || (q.correctSentence && !q.answers)) {
          const sentence = q.correctSentence || q.text || "";
          const words = sentence.split(/\s+/).map((w: string) => w.trim().replace(/[^a-zA-Z0-9']/g, "")).filter(Boolean);
          setShuffledWords(prev => ({ ...prev, [idx]: [...words].sort(() => Math.random() - 0.5) }));
          setOrderedWords(prev => ({ ...prev, [idx]: [] }));
        }
        if (q.sentences) {
          setShuffledSentences(prev => ({ ...prev, [idx]: [...q.sentences].sort(() => Math.random() - 0.5) }));
        }
      });
    }
    // Shuffling for exam sections
    if (isExam && parsedContent.sections && !submitted) {
      parsedContent.sections.forEach((sec: any, sIdx: number) => {
        if (sec.questions) {
          sec.questions.forEach((q: any, qIdx: number) => {
            const key = `${sIdx}_${qIdx}`;
            if (sec.type === "writing-order-words") {
              const sentence = q.correctSentence || q.text || "";
              const words = sentence.split(/\s+/).map((w: string) => w.trim().replace(/[^a-zA-Z0-9']/g, "")).filter(Boolean);
              setShuffledWords(prev => {
                if (prev[key]) return prev;
                return { ...prev, [key]: [...words].sort(() => Math.random() - 0.5) };
              });
              setOrderedWords(prev => {
                if (prev[key]) return prev;
                return { ...prev, [key]: [] };
              });
            }
            if (sec.type === "writing-order-sentences") {
              setShuffledSentences(prev => {
                if (prev[key]) return prev;
                return { ...prev, [key]: [...(q.sentences || [])].sort(() => Math.random() - 0.5) };
              });
            }
          });
        }
      });
    }
  }, [questionsList, parsedContent, submitted, exercise, isExam]);

  // Exam Start/Countdown ticks
  useEffect(() => {
    if (!isExam || !parsedContent.startTime) return;
    const interval = setInterval(() => {
      const startMs = new Date(parsedContent.startTime).getTime();
      const durationMs = (parsedContent.duration || 50) * 60 * 1000;
      const endMs = startMs + durationMs;
      const now = new Date().getTime();

      if (now < startMs) {
        setTimeToExamStart(Math.ceil((startMs - now) / 1000));
        setExamStarted(false);
        setExamEnded(false);
      } else if (now > endMs) {
        setTimeToExamStart(null);
        setExamStarted(true);
        setExamEnded(true);
        setExamSecondsLeft(0);
        clearInterval(interval);
      } else {
        setTimeToExamStart(null);
        setExamStarted(true);
        setExamEnded(false);
        const secLeft = Math.ceil((endMs - now) / 1000);
        setExamSecondsLeft(secLeft);
        if (secLeft <= 0) {
          clearInterval(interval);
          handleSubmit();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isExam, parsedContent]);

  // Ticking exam timer when running
  const formattedExamTime = useMemo(() => {
    if (examSecondsLeft === null) return "00:00";
    const hrs = Math.floor(examSecondsLeft / 3600);
    const mins = Math.floor((examSecondsLeft % 3600) / 60);
    const secs = examSecondsLeft % 60;
    if (hrs > 0) {
      return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    }
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }, [examSecondsLeft]);

  // Check general exercise deadline
  const isOverdue = useMemo(() => {
    if (submitted) return false;
    const deadlineStr = parsedContent.deadline || parsedContent.deadlineDate;
    if (!deadlineStr) return false;
    return new Date().getTime() > new Date(deadlineStr).getTime();
  }, [parsedContent, submitted]);

  // Auto-grading score calculators
  const calcDictationScore = (studentText: string, correctText: string): number => {
    const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();
    const std = clean(studentText);
    const cor = clean(correctText);
    if (!cor) return 0;
    if (std === cor) return 10;
    const stdWords = std.split(" ").filter(Boolean);
    const corWords = cor.split(" ").filter(Boolean);
    if (corWords.length === 0) return 0;
    let correct = 0;
    corWords.forEach((word, idx) => {
      if (stdWords[idx] === word) correct++;
    });
    return Math.round((correct / corWords.length) * 10 * 10) / 10;
  };

  const calcSpeechScore = (spoken: string, expected: string): number => {
    if (!expected) return 0;
    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
    const spokenWords = normalize(spoken).split(/\s+/).filter(Boolean);
    const expectedWords = normalize(expected).split(/\s+/).filter(Boolean);
    if (expectedWords.length === 0) return 0;
    const correct = spokenWords.filter(w => expectedWords.includes(w)).length;
    return Math.min(Math.round((correct / expectedWords.length) * 10 * 10) / 10, 10);
  };

  // RECORDING FUNCTIONS
  const startRecording = async (idx: number | string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = e => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        setRecordedBlobs(prev => ({ ...prev, [idx]: blob }));
        setRecordedUrls(prev => ({ ...prev, [idx]: URL.createObjectURL(blob) }));
        stream.getTracks().forEach(t => t.stop());
      };
      mediaRecorder.start();
      setIsRecording(prev => ({ ...prev, [idx]: true }));
      setRecordSeconds(prev => ({ ...prev, [idx]: 0 }));
      timerRef.current = setInterval(() => {
        setRecordSeconds(prev => ({ ...prev, [idx]: (prev[idx] || 0) + 1 }));
      }, 1000);
    } catch {
      alert("Không thể truy cập microphone. Vui lòng cấp quyền!");
    }
  };

  const stopRecording = (idx: number | string) => {
    mediaRecorderRef.current?.stop();
    setIsRecording(prev => ({ ...prev, [idx]: false }));
    clearInterval(timerRef.current);
  };

  // WEB SPEECH Recognizer
  const startSpeechRecognition = (idx: number | string, expectedText: string) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Trình duyệt không hỗ trợ nhận diện giọng nói. Vui lòng dùng Chrome!");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognitionRef.current = recognition;
    recognition.onstart = () => setIsListeningSTT(prev => ({ ...prev, [idx]: true }));
    recognition.onend = () => setIsListeningSTT(prev => ({ ...prev, [idx]: false }));
    recognition.onerror = () => setIsListeningSTT(prev => ({ ...prev, [idx]: false }));
    recognition.onresult = (e: any) => {
      const text = e.results[0][0].transcript;
      const score = calcSpeechScore(text, expectedText);
      setSpokenTexts(prev => ({ ...prev, [idx]: text }));
      setSpeechScores(prev => ({ ...prev, [idx]: score }));
    };
    recognition.start();
  };

  const stopSpeechRecognition = (idx: number | string) => {
    recognitionRef.current?.stop();
    setIsListeningSTT(prev => ({ ...prev, [idx]: false }));
  };

  // SUBMIT HANDLER
  const handleSubmit = async () => {
    if (submitted) { navigate(-1); return; }

    setSubmitting(true);
    try {
      let submissionData: any = {};

      if (isExam) {
        // Build JSON structure for exam nộp bài
        submissionData.isExam = true;
        submissionData.sections = await Promise.all(
          parsedContent.sections.map(async (sec: any, secIdx: number) => {
            const sectionResponse: any = {
              title: sec.title,
              type: sec.type
            };

            if (sec.type === "listening-mcq" || sec.type === "reading-split") {
              const answers: Record<number, string> = {};
              sec.questions.forEach((_: any, qIdx: number) => {
                answers[qIdx] = mcAnswers[`${secIdx}_${qIdx}`] || "";
              });
              sectionResponse.answers = answers;
            } else if (sec.type === "writing-essay") {
              sectionResponse.essayText = essayAnswers[secIdx] || "";
            } else if (sec.type === "speaking-topic") {
              let url = "";
              if (recordedBlobs[secIdx]) {
                const formData = new FormData();
                formData.append("file", recordedBlobs[secIdx], `exam-speaking-${secIdx}.webm`);
                const upRes = await fetch(`${API}/upload`, { method: "POST", body: formData });
                const upData = await upRes.json();
                url = upData.url || "";
              }
              sectionResponse.audioUrl = url || recordedUrls[secIdx] || "";
              sectionResponse.note = essayAnswers[secIdx] || "";
            } else if (sec.questions) {
              sectionResponse.questions = await Promise.all(
                sec.questions.map(async (q: any, qIdx: number) => {
                  const key = `${secIdx}_${qIdx}`;
                  const qResult: any = { questionIdx: qIdx, type: sec.type };

                  if (sec.type === "listening-image") {
                    const ans = mcAnswers[key] || "";
                    qResult.chosenAnswer = ans;
                    qResult.correctAnswer = q.correct || "A";
                    qResult.score = ans === (q.correct || "A") ? 10 : 0;
                  } else if (sec.type === "listening-dictation") {
                    const textAns = essayAnswers[key] || "";
                    qResult.essayText = textAns;
                    qResult.correctText = q.text;
                    qResult.score = calcDictationScore(textAns, q.text || "");
                  } else if (sec.type === "listening-fill-in") {
                    const stdAnswers = fillInAnswers[key] || [];
                    const correctAnswers = q.fillInAnswers || [];
                    let matched = 0;
                    correctAnswers.forEach((ans: string, i: number) => {
                      if ((stdAnswers[i] || "").trim().toLowerCase() === ans.toLowerCase()) matched++;
                    });
                    qResult.fillInAnswers = stdAnswers;
                    qResult.correctAnswers = correctAnswers;
                    qResult.score = correctAnswers.length > 0 ? (matched / correctAnswers.length) * 10 : 0;
                  } else if (sec.type === "speaking-pronounce") {
                    qResult.spokenText = spokenTexts[key] || "";
                    qResult.correctText = q.text;
                    qResult.score = speechScores[key] || 0;
                  } else if (sec.type === "writing-order-words") {
                    const stdSent = (orderedWords[key] || []).join(" ").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
                    const correctSent = (q.correctSentence || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
                    qResult.essayText = (orderedWords[key] || []).join(" ");
                    qResult.correctText = q.correctSentence;
                    qResult.score = stdSent === correctSent ? 10 : 0;
                  } else if (sec.type === "writing-order-sentences") {
                    const stdSents = shuffledSentences[key] || [];
                    const correctSents = q.sentences || [];
                    let placed = 0;
                    stdSents.forEach((s, idx) => {
                      if (s === correctSents[idx]) placed++;
                    });
                    qResult.sentences = stdSents;
                    qResult.score = correctSents.length > 0 ? (placed / correctSents.length) * 10 : 0;
                  } else if (sec.type === "reading-vocab-mcq" || sec.type === "writing-tense-mcq") {
                    const ans = mcAnswers[key] || "";
                    qResult.chosenAnswer = ans;
                    qResult.correctAnswer = q.correct;
                    qResult.score = ans === q.correct ? 10 : 0;
                  }

                  return qResult;
                })
              );
            }

            return sectionResponse;
          })
        );

        // Grade automatable parts of exam
        let totalExamPoints = 0;
        let examGradableQuestions = 0;
        let isFullyAutoGraded = true;

        parsedContent.sections.forEach((sec: any, secIdx: number) => {
          if (sec.type === "listening-mcq" || sec.type === "reading-split") {
            sec.questions.forEach((q: any, qIdx: number) => {
              const ans = mcAnswers[`${secIdx}_${qIdx}`];
              if (ans === q.correct) totalExamPoints += 10;
              examGradableQuestions++;
            });
          } else if (sec.type === "writing-essay" || sec.type === "speaking-topic") {
            isFullyAutoGraded = false; // Requires teacher grading
          } else if (sec.questions) {
            sec.questions.forEach((q: any, qIdx: number) => {
              const key = `${secIdx}_${qIdx}`;
              if (sec.type === "listening-image") {
                const ans = mcAnswers[key] || "";
                if (ans === (q.correct || "A")) totalExamPoints += 10;
                examGradableQuestions++;
              } else if (sec.type === "listening-dictation") {
                const textAns = essayAnswers[key] || "";
                totalExamPoints += calcDictationScore(textAns, q.text || "");
                examGradableQuestions++;
              } else if (sec.type === "listening-fill-in") {
                const stdAnswers = fillInAnswers[key] || [];
                const correctAnswers = q.fillInAnswers || [];
                let matched = 0;
                correctAnswers.forEach((ans: string, i: number) => {
                  if ((stdAnswers[i] || "").trim().toLowerCase() === ans.toLowerCase()) matched++;
                });
                totalExamPoints += correctAnswers.length > 0 ? (matched / correctAnswers.length) * 10 : 0;
                examGradableQuestions++;
              } else if (sec.type === "speaking-pronounce") {
                totalExamPoints += speechScores[key] || 0;
                examGradableQuestions++;
              } else if (sec.type === "writing-order-words") {
                const stdSent = (orderedWords[key] || []).join(" ").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
                const correctSent = (q.correctSentence || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
                if (stdSent === correctSent) totalExamPoints += 10;
                examGradableQuestions++;
              } else if (sec.type === "writing-order-sentences") {
                const stdSents = shuffledSentences[key] || [];
                const correctSents = q.sentences || [];
                let placed = 0;
                stdSents.forEach((s, idx) => {
                  if (s === correctSents[idx]) placed++;
                });
                totalExamPoints += correctSents.length > 0 ? (placed / correctSents.length) * 10 : 0;
                examGradableQuestions++;
              } else if (sec.type === "reading-vocab-mcq" || sec.type === "writing-tense-mcq") {
                const ans = mcAnswers[key] || "";
                if (ans === q.correct) totalExamPoints += 10;
                examGradableQuestions++;
              }
            });
          }
        });

        const examFinalScore = isFullyAutoGraded && examGradableQuestions > 0
          ? Math.round((totalExamPoints / examGradableQuestions) * 10) / 10
          : null;

        await fetch(`${API}/bainop`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            MaExercise: parseInt(id!),
            MaSinhVien: maSinhVien || maNguoiDung,
            NoiDung: JSON.stringify(submissionData),
            Diem: examFinalScore,
            TrangThai: isFullyAutoGraded ? "Đã chấm" : "Chờ chấm"
          })
        });

        navigate("/assignment-success", {
          state: {
            title: exercise?.Title,
            maLopHoc: maLopHoc,
            diem: examFinalScore,
            loai: "Exam"
          }
        });

      } else {
        // Build JSON structure for regular multiple question exercise
        submissionData.isExam = false;
        submissionData.questions = await Promise.all(
          questionsList.map(async (q, qIdx) => {
            const questionType = (exercise?.Type || "").toLowerCase();
            const qResult: any = {
              questionIdx: qIdx,
              type: questionType
            };

            // Grade individual question
            let qScore = 0;
            if (questionType === "listening-mcq" || questionType === "writing-tense-mcq" || questionType === "reading-vocab-mcq" || questionType === "multiple") {
              const ans = mcAnswers[qIdx] || "";
              qResult.chosenAnswer = ans;
              qResult.correctAnswer = q.correct;
              qResult.score = ans === q.correct ? 10 : 0;
            } else if (questionType === "listening-image") {
              const ans = mcAnswers[qIdx] || "";
              qResult.chosenAnswer = ans;
              qResult.correctAnswer = q.correct || "A";
              qResult.score = ans === (q.correct || "A") ? 10 : 0;
            } else if (questionType === "listening-dictation") {
              const textAns = essayAnswers[qIdx] || "";
              qResult.essayText = textAns;
              qResult.correctText = q.text;
              qResult.score = calcDictationScore(textAns, q.text || "");
            } else if (questionType === "listening-fill-in") {
              const stdAnswers = fillInAnswers[qIdx] || [];
              const correctAnswers = q.fillInAnswers || [];
              let matched = 0;
              correctAnswers.forEach((ans: string, i: number) => {
                if ((stdAnswers[i] || "").trim().toLowerCase() === ans.toLowerCase()) matched++;
              });
              qResult.fillInAnswers = stdAnswers;
              qResult.correctAnswers = correctAnswers;
              qResult.score = correctAnswers.length > 0 ? (matched / correctAnswers.length) * 10 : 0;
            } else if (questionType === "speaking-pronounce") {
              qResult.spokenText = spokenTexts[qIdx] || "";
              qResult.correctText = q.text;
              qResult.score = speechScores[qIdx] || 0;
            } else if (questionType === "speaking-topic") {
              let url = "";
              if (recordedBlobs[qIdx]) {
                const formData = new FormData();
                formData.append("file", recordedBlobs[qIdx], `speaking-${qIdx}.webm`);
                const upRes = await fetch(`${API}/upload`, { method: "POST", body: formData });
                const upData = await upRes.json();
                url = upData.url || "";
              }
              qResult.audioUrl = url || recordedUrls[qIdx] || "";
              qResult.essayText = essayAnswers[qIdx] || "";
              qResult.score = null; // Requires teacher grading
            } else if (questionType === "writing-order-words") {
              const stdSent = (orderedWords[qIdx] || []).join(" ").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
              const correctSent = (q.correctSentence || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
              qResult.essayText = (orderedWords[qIdx] || []).join(" ");
              qResult.correctText = q.correctSentence;
              qResult.score = stdSent === correctSent ? 10 : 0;
            } else if (questionType === "writing-order-sentences") {
              const stdSents = shuffledSentences[qIdx] || [];
              const correctSents = q.sentences || [];
              let placed = 0;
              stdSents.forEach((s, idx) => {
                if (s === correctSents[idx]) placed++;
              });
              qResult.sentences = stdSents;
              qResult.score = correctSents.length > 0 ? (placed / correctSents.length) * 10 : 0;
            } else if (questionType === "writing-essay") {
              qResult.essayText = essayAnswers[qIdx] || "";
              qResult.score = null; // Requires teacher grading
            } else if (questionType === "reading-split") {
              // Split screen questions list
              const subResults: any[] = [];
              let correctSubCount = 0;
              q.subQuestions?.forEach((sub: any, subIdx: number) => {
                const ans = mcAnswers[`${qIdx}_${subIdx}`] || "";
                if (ans === sub.correct) correctSubCount++;
                subResults.push({ chosen: ans, correct: sub.correct });
              });
              qResult.subQuestions = subResults;
              qResult.score = q.subQuestions?.length > 0 ? (correctSubCount / q.subQuestions.length) * 10 : 0;
            }

            return qResult;
          })
        );

        // Grade average score
        let totalScore = 0;
        let gradableCount = 0;
        let isFullyAuto = true;

        submissionData.questions.forEach((q: any) => {
          if (q.score !== null) {
            totalScore += q.score;
            gradableCount++;
          } else {
            isFullyAuto = false;
          }
        });

        const finalScore = isFullyAuto && gradableCount > 0
          ? Math.round((totalScore / gradableCount) * 10) / 10
          : null;

        await fetch(`${API}/bainop`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            MaExercise: parseInt(id!),
            MaSinhVien: maSinhVien || maNguoiDung,
            NoiDung: JSON.stringify(submissionData),
            Diem: finalScore,
            TrangThai: isFullyAuto ? "Đã chấm" : "Chờ chấm"
          })
        });

        navigate("/assignment-success", {
          state: {
            title: exercise?.Title,
            maLopHoc: maLopHoc,
            diem: finalScore,
            loai: exercise?.Type || "Bài tập"
          }
        });
      }

    } catch (e) {
      console.error(e);
      alert("Lỗi khi nộp bài!");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ textAlign: "center", padding: 40, color: "#999" }}>Loading...</div>;
  if (!exercise) return <div style={{ textAlign: "center", padding: 40, color: "#999" }}>Exercise not found.</div>;

  // RENDER QUESTION SUB-COMPONENTS
  const renderMCQBlock = (q: any, qIdx: number, subIdxPrefix?: string) => {
    const key = subIdxPrefix !== undefined ? `${subIdxPrefix}_${qIdx}` : qIdx;
    const chosen = mcAnswers[key] || "";
    const optionsList = q.options || (q.answers?.map((t: string, i: number) => ({ label: ["A", "B", "C", "D"][i], text: t })) || []);
    const isCorrect = submitted && chosen === q.correct;
    const isWrong = submitted && chosen && chosen !== q.correct;

    return (
      <div key={qIdx} className={`ad-mcq-question-box ${submitted ? (isCorrect ? "correct-box" : isWrong ? "wrong-box" : "") : ""}`}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
          <p style={{ margin: 0, fontWeight: 700, color: "#1e3a8a", fontSize: 16 }}>Question {qIdx + 1}: {q.question}</p>
          {submitted && (
            <span style={{ fontSize: 12, fontWeight: 700, color: isCorrect ? "#16a34a" : "#dc2626", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 4 }}>
              {isCorrect ? (
                <>
                  <FiCheckCircle /> Correct
                </>
              ) : (
                <>
                  <FiXCircle /> Incorrect
                </>
              )}
            </span>
          )}
        </div>
        <div className="ad-mcq-list">
          {optionsList.map((opt: any) => {
            const isChosen = chosen === opt.label;
            const isCorrectOpt = submitted && opt.label === q.correct;
            const isWrongOpt = submitted && isChosen && opt.label !== q.correct;

            return (
              <label key={opt.label} className={`ad-mcq-option ${isCorrectOpt ? "correct" : isWrongOpt ? "wrong" : isChosen ? "chosen" : ""}`}>
                <input
                  type="radio"
                  disabled={submitted || isOverdue || (isExam && !examStarted)}
                  checked={isChosen}
                  onChange={() => {
                    setMcAnswers(prev => ({ ...prev, [key]: opt.label }));
                  }}
                />
                <span className="ad-mcq-label-text">{opt.label}.</span>
                {opt.text && opt.text.trim().toUpperCase() !== opt.label && (
                  <span>{opt.text}</span>
                )}
              </label>
            );
          })}
        </div>
        {submitted && (
          <div className="ad-explanation">
            <p className="correct-ans">Correct answer: {q.correct}</p>
            {q.explanation && <p className="exp-text">Explanation: {q.explanation}</p>}
          </div>
        )}
      </div>
    );
  };

  const renderCurrentQuestionBlock = (q: any, qIdx: number, hideAudio: boolean = false) => {
    const questionType = (exercise?.Type || "").toLowerCase();

    if (questionType === "listening-mcq" || questionType === "writing-tense-mcq" || questionType === "reading-vocab-mcq" || questionType === "multiple") {
      return (
        <div>
          {q.audioUrl && !hideAudio && !(questionType === "listening-mcq" && exercise?.AudioUrl) && (
            <div style={{ marginBottom: 12 }}>
              <CustomAudioPlayer src={`${API}${q.audioUrl}`} />
            </div>
          )}
          {q.imageUrl && <img src={`${API}${q.imageUrl}`} alt="Question visual cue" style={{ maxHeight: 200, display: "block", marginBottom: 12, borderRadius: 8 }} />}
          {renderMCQBlock(q, qIdx)}
        </div>
      );
    }

    if (questionType === "listening-image") {
      const img = q.imageUrl || exercise?.FileDinhKem || "";
      const aud = q.audioUrl || exercise?.AudioUrl || "";
      return (
        <div className="ad-listening-image-block">
          {aud && !hideAudio && (
            <div className="ad-listening-image-audio-wrapper">
              <CustomAudioPlayer src={`${API}${aud}`} className="ad-listening-image-audio" />
            </div>
          )}
          <div className="ad-listening-image-body">
            <div className="ad-listening-image-left">
              {img && <img src={`${API}${img}`} alt="Listening image visual" className="ad-listening-image-img" />}
            </div>
            <div className="ad-listening-image-right">
              {renderMCQBlock({ question: "", correct: q.correct || "A", answers: ["A", "B", "C", "D"] }, qIdx)}
            </div>
          </div>
        </div>
      );
    }

    if (questionType === "listening-dictation") {
      const aud = q.audioUrl || exercise?.AudioUrl || "";
      const studentAns = essayAnswers[qIdx] || "";
      const score = submitted ? calcDictationScore(studentAns, q.text || "") : 0;
      const isPerfect = score === 10;

      return (
        <div className="ad-dictation-container">
          {aud && (
            <div className="ad-dictation-audio-wrapper">
              <CustomAudioPlayer src={`${API}${aud}`} className="ad-dictation-audio" />
            </div>
          )}
          <div className="ad-dictation-prompt">
            <FiEdit3 className="ad-dictation-icon" style={{ verticalAlign: 'middle' }} />
            <span>Listen and write exactly what you hear:</span>
          </div>

          {submitted ? (
            <div className="ad-dictation-result-wrapper">
              <div className="ad-dictation-score-row">
                <div className={`ad-dictation-score-badge ${isPerfect ? "perfect" : "partial"}`}>
                  {isPerfect ? "✓ Perfect Match" : `Score: ${score}/10`}
                </div>
              </div>
              <div className="ad-dictation-comparison-grid">
                <div className="ad-dictation-comparison-box student">
                  <span className="ad-dictation-box-title">Your response:</span>
                  <p className="ad-dictation-box-text">"{studentAns || "(Empty)"}"</p>
                </div>
                <div className="ad-dictation-comparison-box correct">
                  <span className="ad-dictation-box-title">Correct answer:</span>
                  <p className="ad-dictation-box-text">"{q.text}"</p>
                </div>
              </div>
              {q.explanation && (
                <div className="ad-dictation-explanation">
                  <strong>Explanation:</strong> {q.explanation}
                </div>
              )}
            </div>
          ) : (
            <div className="ad-dictation-input-wrapper">
              <textarea
                className="ad-dictation-textarea"
                disabled={isOverdue || (isExam && !examStarted)}
                value={studentAns}
                onChange={e => setEssayAnswers(prev => ({ ...prev, [qIdx]: e.target.value }))}
                placeholder="Type what you hear..."
                rows={3}
              />
            </div>
          )}
        </div>
      );
    }

    if (questionType === "listening-fill-in") {
      const parts = (q.text || "").split(/(\[\d+\])/g);
      const correctAnswers = q.fillInAnswers || [];

      return (
        <div>
          {q.audioUrl && <div style={{ marginBottom: 12 }}><CustomAudioPlayer src={`${API}${q.audioUrl}`} /></div>}
          <p style={{ fontWeight: 600, color: "#5a3e2b", display: "flex", alignItems: "center", gap: 6 }}>
            <FiVolume2 /> Listen and fill in the blanks:
          </p>
          <div style={{ lineHeight: 2.2, fontSize: 15, color: "#333", background: "#f9f5f0", padding: 16, borderRadius: 10, border: "1px solid #e0d8cc" }}>
            {parts.map((part: string, idx: number) => {
              const match = part.match(/^\[(\d+)\]$/);
              if (match) {
                const blankIdx = parseInt(match[1]) - 1;
                const stdAns = (fillInAnswers[qIdx] || [])[blankIdx] || "";
                const correctAns = correctAnswers[blankIdx] || "";
                const isCorrect = submitted && stdAns.trim().toLowerCase() === correctAns.trim().toLowerCase();

                return (
                  <span key={idx} style={{ display: "inline-block", margin: "0 4px" }}>
                    <input
                      type="text"
                      disabled={submitted || isOverdue}
                      value={stdAns}
                      onChange={e => {
                        const copyAnswers = [...(fillInAnswers[qIdx] || [])];
                        copyAnswers[blankIdx] = e.target.value;
                        setFillInAnswers(prev => ({ ...prev, [qIdx]: copyAnswers }));
                      }}
                      style={{
                        padding: "2px 6px", borderRadius: 4, textAlign: "center", width: 100,
                        border: `1.5px solid ${submitted ? (isCorrect ? "#22c55e" : "#ef4444") : "#e87722"}`,
                        background: submitted ? (isCorrect ? "#f0fdf4" : "#fef2f2") : "#fff"
                      }}
                    />
                    {submitted && !isCorrect && <span style={{ fontSize: 11, color: "#16a34a", display: "block" }}>({correctAns})</span>}
                  </span>
                );
              }
              return <span key={idx}>{part}</span>;
            })}
          </div>
        </div>
      );
    }

    if (questionType === "speaking-pronounce") {
      const speechScore = speechScores[qIdx];
      const spokenText = spokenTexts[qIdx] || "";
      const isList = isListeningSTT[qIdx];

      return (
        <div>
          <span className="ad-speaking-level-badge">
            <FiAward style={{ marginRight: 4, verticalAlign: "middle" }} /> Level: {q.level}
          </span>
          <div className="ad-speaking-prompt-box">
            <p className="ad-speaking-prompt-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <FiVolume2 /> Read the following sentence:
            </p>
            <p className="ad-speaking-prompt-text">{q.text}</p>
          </div>

          {!submitted ? (
            <div className="ad-recorder-dashed-box">
              {isList ? (
                <div>
                  <span className="ad-recording-status">🔴 Listening...</span>
                  <button onClick={() => stopSpeechRecognition(qIdx)} className="ad-record-stop-btn">Stop</button>
                </div>
              ) : (
                <button disabled={isOverdue} onClick={() => startSpeechRecognition(qIdx, q.text)} className="ad-record-start-btn" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <FiMic /> Click to speak
                </button>
              )}
              {spokenText && (
                <div className="ad-stt-text-output">
                  <p>Heard: "{spokenText}"</p>
                  <p className="ad-stt-score-display" style={{ color: (speechScore || 0) >= 7 ? "#22c55e" : "#f97316" }}>Score: {speechScore}/10</p>
                </div>
              )}
            </div>
          ) : (
            <div style={{ background: "#fafafa", borderRadius: 8, padding: 12 }}>
              <p style={{ margin: 0 }}><strong>Your reading:</strong> "{spokenText || "—"}"</p>
              <p style={{ margin: "5px 0 0", color: "green" }}><strong>Auto-grading score:</strong> {speechScore}/10</p>
            </div>
          )}
        </div>
      );
    }

    if (questionType === "speaking-topic") {
      const url = recordedUrls[qIdx];
      const isRec = isRecording[qIdx];
      const secs = recordSeconds[qIdx] || 0;

      return (
        <div>
          <div className="ad-speaking-prompt-box">
            <p className="ad-speaking-prompt-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <FiFileText /> Topic Prompt:
            </p>
            <p className="ad-speaking-prompt-text">{q.prompt}</p>
          </div>
          {q.imageUrl && <img src={`${API}${q.imageUrl}`} alt="Topic hint" style={{ maxHeight: 200, display: "block", marginBottom: 12, borderRadius: 8 }} />}

          {!submitted ? (
            <div className="ad-recorder-dashed-box">
              {isRec ? (
                <div className="ad-recording-status">
                  <span>🔴 Recording: {secs}s </span>
                  <button onClick={() => stopRecording(qIdx)} className="ad-record-stop-btn">Stop</button>
                </div>
              ) : (
                <button disabled={isOverdue} onClick={() => startRecording(qIdx)} className="ad-record-start-btn" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <FiMic /> Start Recording
                </button>
              )}
              {url && (
                <div style={{ marginTop: 15 }}>
                  <CustomAudioPlayer src={url} />
                </div>
              )}
            </div>
          ) : (
            url && <div style={{ marginBottom: 12 }}><CustomAudioPlayer src={`${API}${url}`} /></div>
          )}

          <textarea
            className="ad-q-input"
            disabled={submitted || isOverdue}
            value={essayAnswers[qIdx] || ""}
            onChange={e => setEssayAnswers(prev => ({ ...prev, [qIdx]: e.target.value }))}
            placeholder="Prepare your speech notes here..."
            rows={2}
          />
        </div>
      );
    }

    if (questionType === "writing-order-words") {
      const sWords = shuffledWords[qIdx] || [];
      const oWords = orderedWords[qIdx] || [];

      return (
        <div>
          <div className="ad-speaking-prompt-box" style={{ backgroundColor: "#fff8f5" }}>
            <p className="ad-speaking-prompt-label" style={{ color: "#F95800", display: "flex", alignItems: "center", gap: 6 }}>
              <FiFileText /> Translation hint:
            </p>
            <p className="ad-speaking-prompt-text" style={{ color: "#334155", fontSize: 15 }}>{q.text}</p>
          </div>

          <div className="ad-word-ordered-box">
            {oWords.map((w, i) => (
              <span key={i} onClick={() => {
                if (submitted) return;
                setOrderedWords(prev => ({ ...prev, [qIdx]: oWords.filter((_, idx) => idx !== i) }));
                setShuffledWords(prev => ({ ...prev, [qIdx]: [...sWords, w] }));
              }} className="ad-word-badge">{w} ✕</span>
            ))}
          </div>

          {!submitted && (
            <div className="ad-word-shuffled-box">
              {sWords.map((w, i) => (
                <span key={i} onClick={() => {
                  setOrderedWords(prev => ({ ...prev, [qIdx]: [...oWords, w] }));
                  setShuffledWords(prev => ({ ...prev, [qIdx]: sWords.filter((_, idx) => idx !== i) }));
                }} className="ad-word-badge-inactive">{w}</span>
              ))}
            </div>
          )}

          {submitted && (
            <div className="ad-explanation" style={{ background: "#f0fdf4", border: "1px solid #86efac", padding: 12, borderRadius: 8 }}>
              <p className="correct-ans">Correct sentence: {q.correctSentence}</p>
            </div>
          )}
        </div>
      );
    }

    if (questionType === "writing-order-sentences") {
      const sSents = shuffledSentences[qIdx] || [];
      const correctSentences = q.sentences || [];

      return (
        <div>
          <p style={{ fontSize: 13, color: "#666" }}>Rearrange the sentences to form a logical paragraph:</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {sSents.map((sent, idx) => {
              const isCorrect = submitted && sent === correctSentences[idx];
              return (
                <div key={idx} style={{ display: "flex", alignItems: "center", gap: 10, padding: 10, border: "1px solid #e0d8cc", borderRadius: 8, background: "#fafafa" }}>
                  <span style={{ fontWeight: 700 }}>{idx + 1}.</span>
                  <p style={{ margin: 0, flex: 1, fontSize: 14 }}>{sent}</p>
                  {!submitted && (
                    <div style={{ display: "flex", gap: 4 }}>
                      <button disabled={idx === 0 || isOverdue} onClick={() => {
                        const copy = [...sSents];
                        const tmp = copy[idx];
                        copy[idx] = copy[idx - 1];
                        copy[idx - 1] = tmp;
                        setShuffledSentences(prev => ({ ...prev, [qIdx]: copy }));
                      }}>▲</button>
                      <button disabled={idx === sSents.length - 1 || isOverdue} onClick={() => {
                        const copy = [...sSents];
                        const tmp = copy[idx];
                        copy[idx] = copy[idx + 1];
                        copy[idx + 1] = tmp;
                        setShuffledSentences(prev => ({ ...prev, [qIdx]: copy }));
                      }}>▼</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (questionType === "writing-essay") {
      return (
        <div>
          <div style={{ background: "#fff3e0", padding: 12, borderRadius: 8, marginBottom: 12 }}>
            <p style={{ margin: 0, fontWeight: 700 }}>{q.prompt}</p>
          </div>
          {submitted ? (
            <div style={{ background: "#fafafa", padding: 12, border: "1px solid #e0d8cc", borderRadius: 8 }}>
              <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{essayAnswers[qIdx] || ""}</p>
            </div>
          ) : (
            <textarea
              className="ad-q-input"
              disabled={isOverdue}
              value={essayAnswers[qIdx] || ""}
              onChange={e => setEssayAnswers(prev => ({ ...prev, [qIdx]: e.target.value }))}
              placeholder="Write your essay here..."
              rows={6}
            />
          )}
        </div>
      );
    }

    if (questionType === "reading-split") {
      return (
        <div className="ad-reading-split-container">
          <div className="ad-reading-passage-panel">
            <h5 className="ad-panel-title" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <FiBookOpen /> Reading Passage
            </h5>
            <p className="ad-passage-text">{q.text}</p>
          </div>
          <div className="ad-reading-questions-panel">
            <h5 className="ad-panel-title" style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
              <FiList /> Questions
            </h5>
            {q.subQuestions?.map((sub: any, subIdx: number) => (
              renderMCQBlock(sub, subIdx, `${qIdx}`)
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

  const renderSectionQuestionBlock = (q: any, qIdx: number, sIdx: number, secType: string) => {
    const key = `${sIdx}_${qIdx}`;

    if (secType === "listening-mcq" || secType === "writing-tense-mcq" || secType === "reading-vocab-mcq") {
      return (
        <div key={qIdx} style={{ marginBottom: 20 }}>
          {q.audioUrl && (
            <div style={{ marginBottom: 12 }}>
              <CustomAudioPlayer src={`${API}${q.audioUrl}`} />
            </div>
          )}
          {q.imageUrl && <img src={`${API}${q.imageUrl}`} alt="Question visual cue" style={{ maxHeight: 200, display: "block", marginBottom: 12, borderRadius: 8 }} />}
          {renderMCQBlock(q, qIdx, `${sIdx}`)}
        </div>
      );
    }

    if (secType === "listening-image") {
      const img = q.imageUrl || "";
      const aud = q.audioUrl || "";
      return (
        <div key={qIdx} className="ad-listening-image-block" style={{ marginBottom: 20 }}>
          {aud && (
            <div className="ad-listening-image-audio-wrapper">
              <CustomAudioPlayer src={`${API}${aud}`} className="ad-listening-image-audio" />
            </div>
          )}
          <div className="ad-listening-image-body">
            <div className="ad-listening-image-left">
              {img && <img src={`${API}${img}`} alt="Listening image visual" className="ad-listening-image-img" />}
            </div>
            <div className="ad-listening-image-right">
              {renderMCQBlock({ question: "", correct: q.correct || "A", answers: ["A", "B", "C", "D"] }, qIdx, `${sIdx}`)}
            </div>
          </div>
        </div>
      );
    }

    if (secType === "listening-dictation") {
      const aud = q.audioUrl || "";
      const studentAns = essayAnswers[key] || "";
      const score = submitted ? calcDictationScore(studentAns, q.text || "") : 0;
      const isPerfect = score === 10;

      return (
        <div key={qIdx} className="ad-dictation-container" style={{ marginBottom: 20 }}>
          {aud && (
            <div className="ad-dictation-audio-wrapper">
              <CustomAudioPlayer src={`${API}${aud}`} className="ad-dictation-audio" />
            </div>
          )}
          <div className="ad-dictation-prompt">
            <FiEdit3 className="ad-dictation-icon" style={{ verticalAlign: 'middle' }} />
            <span>Listen and write exactly what you hear:</span>
          </div>

          {submitted ? (
            <div className="ad-dictation-result-wrapper">
              <div className="ad-dictation-score-row">
                <div className={`ad-dictation-score-badge ${isPerfect ? "perfect" : "partial"}`}>
                  {isPerfect ? "✓ Perfect Match" : `Score: ${score}/10`}
                </div>
              </div>
              <div className="ad-dictation-comparison-grid">
                <div className="ad-dictation-comparison-box student">
                  <span className="ad-dictation-box-title">Your response:</span>
                  <p className="ad-dictation-box-text">"{studentAns || "(Empty)"}"</p>
                </div>
                <div className="ad-dictation-comparison-box correct">
                  <span className="ad-dictation-box-title">Correct answer:</span>
                  <p className="ad-dictation-box-text">"{q.text}"</p>
                </div>
              </div>
              {q.explanation && (
                <div className="ad-dictation-explanation">
                  <strong>Explanation:</strong> {q.explanation}
                </div>
              )}
            </div>
          ) : (
            <div className="ad-dictation-input-wrapper">
              <textarea
                className="ad-dictation-textarea"
                disabled={!examStarted || examEnded}
                value={studentAns}
                onChange={e => setEssayAnswers(prev => ({ ...prev, [key]: e.target.value }))}
                placeholder="Type what you hear..."
                rows={3}
              />
            </div>
          )}
        </div>
      );
    }

    if (secType === "listening-fill-in") {
      const parts = (q.text || "").split(/(\[\d+\])/g);
      const correctAnswers = q.fillInAnswers || [];

      return (
        <div key={qIdx} style={{ marginBottom: 20 }}>
          {q.audioUrl && <div style={{ marginBottom: 12 }}><CustomAudioPlayer src={`${API}${q.audioUrl}`} /></div>}
          <p style={{ fontWeight: 600, color: "#5a3e2b", display: "flex", alignItems: "center", gap: 6 }}>
            <FiVolume2 /> Listen and fill in the blanks:
          </p>
          <div style={{ lineHeight: 2.2, fontSize: 15, color: "#333", background: "#f9f5f0", padding: 16, borderRadius: 10, border: "1px solid #e0d8cc" }}>
            {parts.map((part: string, idx: number) => {
              const match = part.match(/^\[(\d+)\]$/);
              if (match) {
                const blankIdx = parseInt(match[1]) - 1;
                const stdAns = (fillInAnswers[key] || [])[blankIdx] || "";
                const correctAns = correctAnswers[blankIdx] || "";
                const isCorrect = submitted && stdAns.trim().toLowerCase() === correctAns.trim().toLowerCase();

                return (
                  <span key={idx} style={{ display: "inline-block", margin: "0 4px" }}>
                    <input
                      type="text"
                      disabled={submitted || !examStarted || examEnded}
                      value={stdAns}
                      onChange={e => {
                        const copyAnswers = [...(fillInAnswers[key] || [])];
                        copyAnswers[blankIdx] = e.target.value;
                        setFillInAnswers(prev => ({ ...prev, [key]: copyAnswers }));
                      }}
                      style={{
                        padding: "2px 6px", borderRadius: 4, textAlign: "center", width: 100,
                        border: `1.5px solid ${submitted ? (isCorrect ? "#22c55e" : "#ef4444") : "#e87722"}`,
                        background: submitted ? (isCorrect ? "#f0fdf4" : "#fef2f2") : "#fff"
                      }}
                    />
                    {submitted && !isCorrect && <span style={{ fontSize: 11, color: "#16a34a", display: "block" }}>({correctAns})</span>}
                  </span>
                );
              }
              return <span key={idx}>{part}</span>;
            })}
          </div>
        </div>
      );
    }

    if (secType === "speaking-pronounce") {
      const speechScore = speechScores[key];
      const spokenText = spokenTexts[key] || "";
      const isList = isListeningSTT[key];

      return (
        <div key={qIdx} style={{ marginBottom: 20 }}>
          <span style={{ background: "#eff6ff", color: "#1d4ed8", padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 10 }}>
            <FiAward /> Level: {q.level}
          </span>
          <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: 12, marginBottom: 12 }}>
            <p style={{ margin: 0, fontSize: 12, color: "#1d4ed8", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
              <FiVolume2 /> Read the following sentence:
            </p>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1e3a8a" }}>{q.text}</p>
          </div>

          {!submitted ? (
            <div style={{ border: "2px dashed #e87722", borderRadius: 12, padding: 20, textAlign: "center" }}>
              {isList ? (
                <div>
                  <span style={{ color: "#dc2626", fontWeight: 700 }}>🔴 Listening...</span>
                  <button onClick={() => stopSpeechRecognition(key)} style={{ marginLeft: 10, padding: "4px 12px", background: "#dc2626", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}>Stop</button>
                </div>
              ) : (
                <button disabled={!examStarted || examEnded} onClick={() => startSpeechRecognition(key, q.text)} style={{ padding: "10px 20px", background: "#e87722", color: "#fff", border: "none", borderRadius: 20, cursor: "pointer", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <FiMic /> Click to speak
                </button>
              )}
              {spokenText && (
                <div style={{ marginTop: 15, textAlign: "left" }}>
                  <p style={{ margin: 0, fontSize: 13, color: "#888" }}>Heard: "{spokenText}"</p>
                  <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: (speechScore || 0) >= 7 ? "green" : "orange" }}>Score: {speechScore}/10</p>
                </div>
              )}
            </div>
          ) : (
            <div style={{ background: "#fafafa", borderRadius: 8, padding: 12 }}>
              <p style={{ margin: 0 }}><strong>Your reading:</strong> "{spokenText || "—"}"</p>
              <p style={{ margin: "5px 0 0", color: "green" }}><strong>Auto-grading score:</strong> {speechScore}/10</p>
            </div>
          )}
        </div>
      );
    }

    if (secType === "writing-order-words") {
      const sWords = shuffledWords[key] || [];
      const oWords = orderedWords[key] || [];

      return (
        <div key={qIdx} style={{ marginBottom: 20 }}>
          <div style={{ background: "#fff3e0", padding: 12, borderRadius: 8, marginBottom: 12 }}>
            <p style={{ margin: 0, fontSize: 13, color: "#888" }}>Translation hint:</p>
            <p style={{ margin: 0, fontWeight: 700 }}>{q.text}</p>
          </div>

          <div style={{ minHeight: 48, border: "2px dashed #e87722", borderRadius: 8, padding: 8, display: "flex", flexWrap: "wrap", gap: 6, background: "#fffbf5", marginBottom: 12 }}>
            {oWords.map((w, i) => (
              <span key={i} onClick={() => {
                if (submitted) return;
                setOrderedWords(prev => ({ ...prev, [key]: oWords.filter((_, idx) => idx !== i) }));
                setShuffledWords(prev => ({ ...prev, [key]: [...sWords, w] }));
              }} style={{ background: "#e87722", color: "#fff", padding: "4px 10px", borderRadius: 20, cursor: submitted ? "default" : "pointer" }}>{w} ✕</span>
            ))}
          </div>

          {!submitted && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {sWords.map((w, i) => (
                <span key={i} onClick={() => {
                  setOrderedWords(prev => ({ ...prev, [key]: [...oWords, w] }));
                  setShuffledWords(prev => ({ ...prev, [key]: sWords.filter((_, idx) => idx !== i) }));
                }} style={{ background: "#f0e8dc", padding: "4px 10px", borderRadius: 20, cursor: "pointer" }}>{w}</span>
              ))}
            </div>
          )}

          {submitted && (
            <div style={{ background: "#f0fdf4", border: "1px solid #86efac", padding: 12, borderRadius: 8 }}>
              <p style={{ margin: 0, color: "green" }}>Correct sentence: {q.correctSentence}</p>
            </div>
          )}
        </div>
      );
    }

    if (secType === "writing-order-sentences") {
      const sSents = shuffledSentences[key] || [];
      const correctSentences = q.sentences || [];

      return (
        <div key={qIdx} style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 13, color: "#666" }}>Rearrange the sentences to form a logical paragraph:</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {sSents.map((sent, idx) => {
              return (
                <div key={idx} style={{ display: "flex", alignItems: "center", gap: 10, padding: 10, border: "1px solid #e0d8cc", borderRadius: 8, background: "#fafafa" }}>
                  <span style={{ fontWeight: 700 }}>{idx + 1}.</span>
                  <p style={{ margin: 0, flex: 1, fontSize: 14 }}>{sent}</p>
                  {!submitted && (
                    <div style={{ display: "flex", gap: 4 }}>
                      <button disabled={idx === 0 || !examStarted || examEnded} onClick={() => {
                        const copy = [...sSents];
                        const tmp = copy[idx];
                        copy[idx] = copy[idx - 1];
                        copy[idx - 1] = tmp;
                        setShuffledSentences(prev => ({ ...prev, [key]: copy }));
                      }}>▲</button>
                      <button disabled={idx === sSents.length - 1 || !examStarted || examEnded} onClick={() => {
                        const copy = [...sSents];
                        const tmp = copy[idx];
                        copy[idx] = copy[idx + 1];
                        copy[idx + 1] = tmp;
                        setShuffledSentences(prev => ({ ...prev, [key]: copy }));
                      }}>▼</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (secType === "reading-split") {
      return renderMCQBlock(q, qIdx, `${sIdx}`);
    }

    return null;
  };

  return (
    <div className="ad-content">
      <button className="ad-back" onClick={() => navigate(-1)}>← Back</button>

      {/* Course Info Card */}
      {lopInfo && (
        <div className="ad-info-card">
          <div className="ad-info-left">
            <p className="ad-course-name">{lopInfo.TenLop}</p>
            <p className="ad-course-code">{lopInfo.TenKhoaHoc}</p>
          </div>
          <span className="ad-badge-active">Active</span>
        </div>
      )}

      {/* OVERDUE DEADLINE WARNING BANNER */}
      {isOverdue && (
        <div className="ad-banner ad-banner-overdue">
          <span style={{ fontSize: 24 }}>⚠️</span>
          <div>
            <h4>Assignment overdue!</h4>
            <p>
              The deadline was: <strong>{new Date(parsedContent.deadline).toLocaleString()}</strong>. You can only view the questions, but cannot answer or submit.
            </p>
          </div>
        </div>
      )}

      {/* EXAM COUNTDOWN / OVER / RUNNING HEADER */}
      {isExam && (
        <div className="ad-banner ad-banner-exam">
          <h3>⏱️ Assessment Exam</h3>
          <p className="exam-meta">
            Duration: <strong>{parsedContent.duration} minutes</strong> · Open time: {new Date(parsedContent.startTime).toLocaleString()}
          </p>

          {timeToExamStart !== null && (
            <div style={{ fontSize: 18, fontWeight: 700, color: "#b45309" }}>
              ⏳ The exam starts in: <span style={{ fontFamily: "monospace", fontSize: 22 }}>{timeToExamStart}s</span>
            </div>
          )}

          {examStarted && !examEnded && (
            <div className="exam-timer">
              ⏳ REMAINING TIME: <span className="exam-timer-span">{formattedExamTime}</span>
            </div>
          )}

          {examEnded && (
            <div style={{ fontSize: 18, fontWeight: 700, color: "#dc2626" }}>
              🛑 The exam has ended.
            </div>
          )}
        </div>
      )}

      <h2 className="ad-title">{exercise.Title}</h2>

      {/* SUBMISSION STATE BANNER */}
      {submitted && baiNop && (
        <div className="ad-banner ad-banner-submitted">
          <p className="status-title">✅ You have submitted this assignment</p>
          {baiNop.Diem !== null && baiNop.Diem !== undefined ? (
            <p className="score-info">
              Your grade: <strong>{baiNop.Diem}/10</strong>
              {baiNop.NhanXet && ` · Feedback: ${baiNop.NhanXet}`}
            </p>
          ) : (
            <p className="score-info" style={{ fontSize: 13 }}>
              Awaiting teacher manual grading for essay/speaking questions.
            </p>
          )}
        </div>
      )}

      {/* ────────────────── EXAM SOLVER INTERFACE ────────────────── */}
      {isExam ? (
        <div>
          {timeToExamStart !== null ? (
            <div className="ad-exam-waiting">
              <h3>Waiting for the exam to start...</h3>
              <p>The exam interface will automatically display when the countdown reaches 0.</p>
            </div>
          ) : examEnded && !submitted ? (
            <div className="ad-exam-waiting" style={{ background: "#fef2f2", borderColor: "#fecaca", color: "#dc2626" }}>
              <h3>The exam time limit has expired!</h3>
              <p>Submissions are now closed.</p>
            </div>
          ) : (
            <div>
              {/* Section Tabs */}
              <div className="ad-exam-tabs">
                {parsedContent.sections?.map((sec: any, sIdx: number) => (
                  <button
                    key={sIdx}
                    onClick={() => setActiveSectionIdx(sIdx)}
                    className={`ad-exam-tab ${activeSectionIdx === sIdx ? "active" : ""}`}
                  >
                    {sec.title} ({sec.type.replace("-", " ")})
                  </button>
                ))}
              </div>

              {/* Render Selected Section */}
              {parsedContent.sections?.map((sec: any, sIdx: number) => {
                if (activeSectionIdx !== sIdx) return null;

                return (
                  <div key={sIdx} className="ad-section" style={{ background: "#fff", border: "1px solid #e0d4c3", padding: 20, borderRadius: 12 }}>
                    <h3 style={{ color: "#F95800", marginTop: 0, marginBottom: 15 }}>{sec.title}</h3>

                    {sec.type === "writing-essay" && (
                      <div>
                        <div style={{ background: "#fff3e0", padding: 12, borderRadius: 8, marginBottom: 12 }}>
                          <p style={{ margin: 0, fontWeight: 700 }}>{sec.content}</p>
                        </div>
                        {submitted ? (
                          <div style={{ background: "#fafafa", padding: 12, border: "1px solid #e0d8cc", borderRadius: 8 }}>
                            <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{essayAnswers[sIdx] || ""}</p>
                          </div>
                        ) : (
                          <textarea
                            className="ad-q-input"
                            disabled={!examStarted || examEnded}
                            value={essayAnswers[sIdx] || ""}
                            onChange={e => setEssayAnswers(prev => ({ ...prev, [sIdx]: e.target.value }))}
                            placeholder="Write your essay answer here..."
                            rows={8}
                          />
                        )}
                      </div>
                    )}

                    {sec.type === "speaking-topic" && (
                      <div>
                        <div className="ad-speaking-prompt-box">
                          <p className="ad-speaking-prompt-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <FiFileText /> Topic Prompt:
                          </p>
                          <p className="ad-speaking-prompt-text">{sec.content}</p>
                        </div>
                        {sec.imageUrl && <img src={`${API}${sec.imageUrl}`} alt="Topic hint" style={{ maxHeight: 200, display: "block", marginBottom: 12, borderRadius: 8 }} />}

                        {!submitted ? (
                          <div className="ad-recorder-dashed-box">
                            {isRecording[sIdx] ? (
                              <div className="ad-recording-status">
                                <span>🔴 Recording: {recordSeconds[sIdx] || 0}s </span>
                                <button onClick={() => stopRecording(sIdx)} className="ad-record-stop-btn">Stop</button>
                              </div>
                            ) : (
                              <button disabled={!examStarted || examEnded} onClick={() => startRecording(sIdx)} className="ad-record-start-btn" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                                <FiMic /> Record your speech
                              </button>
                            )}
                            {recordedUrls[sIdx] && (
                              <div style={{ marginTop: 15 }}>
                                <CustomAudioPlayer src={recordedUrls[sIdx]} />
                              </div>
                            )}
                          </div>
                        ) : (
                          recordedUrls[sIdx] && <div style={{ marginBottom: 12 }}><CustomAudioPlayer src={`${API}${recordedUrls[sIdx]}`} /></div>
                        )}

                        <textarea
                          className="ad-q-input"
                          disabled={submitted || !examStarted || examEnded}
                          value={essayAnswers[sIdx] || ""}
                          onChange={e => setEssayAnswers(prev => ({ ...prev, [sIdx]: e.target.value }))}
                          placeholder="Prepare your speech notes here..."
                          rows={2}
                        />
                      </div>
                     )}

                    {sec.type === "reading-split" && (
                      <div className="ad-reading-split-container">
                        <div className="ad-reading-passage-panel">
                          <p className="ad-passage-text">{sec.content}</p>
                        </div>
                        <div className="ad-reading-questions-panel">
                          {sec.questions?.map((q: any, qIdx: number) => (
                            renderSectionQuestionBlock(q, qIdx, sIdx, sec.type)
                          ))}
                        </div>
                      </div>
                    )}

                    {sec.type !== "writing-essay" && sec.type !== "speaking-topic" && sec.type !== "reading-split" && (
                      <div>
                        {sec.audioUrl && (
                          <div style={{ marginBottom: 20 }}>
                            <CustomAudioPlayer src={`${API}${sec.audioUrl}`} />
                          </div>
                        )}
                        {sec.questions?.map((q: any, qIdx: number) => (
                          renderSectionQuestionBlock(q, qIdx, sIdx, sec.type)
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* ────────────────── REGULAR MULTI-QUESTION SOLVER ────────────────── */
        <div>
          {exercise?.AudioUrl && (exercise?.Type || "").toLowerCase() === "listening-mcq" && (
            <div className="ad-audio-card">
              <h4>🎵 General audio file for the entire assignment:</h4>
              <CustomAudioPlayer src={`${API}${exercise.AudioUrl}`} className="ad-audio-player" />
            </div>
          )}

          {/* Progress pagination indicators */}
          {questionPages.length > 1 && (
            <div className="ad-progress-bar">
              <span className="ad-progress-text">
                Page {currentPageIdx + 1} of {questionPages.length}
              </span>
              <div className="ad-progress-dots">
                {questionPages.map((_, pIdx) => (
                  <span
                    key={pIdx}
                    onClick={() => setCurrentPageIdx(pIdx)}
                    className={`ad-progress-dot ${currentPageIdx === pIdx ? "active" : ""}`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Render Questions inside Current Page */}
          {questionPages.map((page, pIdx) => {
            if (pIdx !== currentPageIdx) return null;

            const alreadyHasGlobalAudio = exercise?.AudioUrl && (exercise?.Type || "").toLowerCase() === "listening-mcq";

            return (
              <div key={pIdx} className="ad-page-container">
                {page.map((q) => {
                  const originalIdx = questionsList.indexOf(q);
                  return (
                    <div key={originalIdx} className="ad-section" style={{ background: "#fff", border: "1px solid #e0d4c3", padding: 20, borderRadius: 12, marginBottom: 20 }}>
                      {renderCurrentQuestionBlock(q, originalIdx, alreadyHasGlobalAudio)}
                    </div>
                  );
                })}
              </div>
            );
          })}

          {/* Pagination Buttons */}
          {questionPages.length > 1 && (
            <div className="ad-nav-buttons">
              <button
                disabled={currentPageIdx === 0}
                onClick={() => setCurrentPageIdx(prev => prev - 1)}
                className="ad-nav-btn ad-nav-btn-prev"
              >
                ← Back
              </button>
              <button
                disabled={currentPageIdx === questionPages.length - 1}
                onClick={() => setCurrentPageIdx(prev => prev + 1)}
                className="ad-nav-btn ad-nav-btn-next"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      )}

      {/* SUBMIT BUTTON FOOTER */}
      <div className="ad-footer">
        {submitted ? (
          <button className="ad-submit-btn" style={{ backgroundColor: "#64748b" }} onClick={() => navigate(-1)}>
            ← Back to Classroom
          </button>
        ) : (
          <button
            className="ad-submit-btn"
            onClick={handleSubmit}
            disabled={submitting || isOverdue || (isExam && (!examStarted || examEnded))}
          >
            {submitting ? "Submitting..." : isExam ? "Submit Exam" : "Submit"}
          </button>
        )}
      </div>
    </div>
  )
}

export default AssignmentDetail;
