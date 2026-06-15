// @ts-nocheck
import "./AssignmentDetail.css";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useState, useEffect, useRef, useMemo } from "react";

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

  const [exercise, setExercise] = useState<any>(null);
  const [lopInfo, setLopInfo] = useState<any>(null);
  const [baiNop, setBaiNop] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Solving states
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [mcAnswers, setMcAnswers] = useState<Record<number, string>>({}); // mapped by questionIdx
  const [essayAnswers, setEssayAnswers] = useState<Record<number, string>>({}); // mapped by questionIdx
  const [fillInAnswers, setFillInAnswers] = useState<Record<number, string[]>>({}); // questionIdx -> list of answers
  const [orderedWords, setOrderedWords] = useState<Record<number, string[]>>({}); // questionIdx -> words
  const [shuffledWords, setShuffledWords] = useState<Record<number, string[]>>({}); // questionIdx -> words
  const [shuffledSentences, setShuffledSentences] = useState<Record<number, string[]>>({}); // questionIdx -> sentences

  // Multi-audio limit track
  const [listenCounts, setListenCounts] = useState<Record<number, number>>({});

  // Multiple Voice Recordings (mapped by questionIndex)
  const [recordedBlobs, setRecordedBlobs] = useState<Record<number, Blob>>({});
  const [recordedUrls, setRecordedUrls] = useState<Record<number, string>>({});
  const [isRecording, setIsRecording] = useState<Record<number, boolean>>({});
  const [recordSeconds, setRecordSeconds] = useState<Record<number, number>>({});
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<any>(null);

  // Web Speech API
  const [spokenTexts, setSpokenTexts] = useState<Record<number, string>>({});
  const [speechScores, setSpeechScores] = useState<Record<number, number | null>>({});
  const [isListeningSTT, setIsListeningSTT] = useState<Record<number, boolean>>({});
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
    } catch (e) {}

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

  // Load prior submission and metadata
  useEffect(() => {
    if (!id) return;
    Promise.all([
      fetch(`${API}/exercise/${id}`).then(r => r.json()),
      maLopHoc ? fetch(`${API}/classes/${maLopHoc}/info`).then(r => r.json()) : Promise.resolve(null),
      fetch(`${API}/bainop/exercise/${id}`).then(r => r.json()),
    ])
      .then(([exData, lopData, nopData]) => {
        setExercise(exData);
        setLopInfo(lopData);
        const myNop = Array.isArray(nopData)
          ? nopData.find((b: any) => b.MaSinhVien === maNguoiDung || b.MaNguoiDung === maNguoiDung)
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
                const loadedAnswers: Record<number, string> = {};
                const loadedEssay: Record<number, string> = {};
                const loadedUrls: Record<number, string> = {};
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
                  }
                });
                setMcAnswers(loadedAnswers);
                setEssayAnswers(loadedEssay);
                setRecordedUrls(loadedUrls);
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
      .catch(() => {})
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
  }, [questionsList, submitted, exercise]);

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
  const startRecording = async (idx: number) => {
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

  const stopRecording = (idx: number) => {
    mediaRecorderRef.current?.stop();
    setIsRecording(prev => ({ ...prev, [idx]: false }));
    clearInterval(timerRef.current);
  };

  // WEB SPEECH Recognizer
  const startSpeechRecognition = (idx: number, expectedText: string) => {
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

  const stopSpeechRecognition = (idx: number) => {
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
            MaSinhVien: maNguoiDung,
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
            MaSinhVien: maNguoiDung,
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

  if (loading) return <div style={{ textAlign: "center", padding: 40, color: "#999" }}>Đang tải...</div>;
  if (!exercise) return <div style={{ textAlign: "center", padding: 40, color: "#999" }}>Không tìm thấy bài tập.</div>;

  // RENDER QUESTION SUB-COMPONENTS
  const renderMCQBlock = (q: any, qIdx: number, subIdxPrefix?: string) => {
    const key = subIdxPrefix !== undefined ? `${subIdxPrefix}_${qIdx}` : qIdx;
    const chosen = mcAnswers[key] || "";
    const optionsList = q.options || (q.answers?.map((t: string, i: number) => ({ label: ["A", "B", "C", "D"][i], text: t })) || []);
    const isCorrect = submitted && chosen === q.correct;
    const isWrong = submitted && chosen && chosen !== q.correct;

    return (
      <div key={qIdx} style={{
        background: submitted ? (isCorrect ? "#f0fdf4" : isWrong ? "#fef2f2" : "#fff") : "#fff",
        border: `1.5px solid ${submitted ? (isCorrect ? "#86efac" : isWrong ? "#fecaca" : "#f0e8dc") : "#f0e8dc"}`,
        borderRadius: 12, padding: "16px 18px", marginBottom: 14
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <p style={{ margin: 0, fontWeight: 700, color: "#5a3e2b" }}>Câu {qIdx + 1}: {q.question}</p>
          {submitted && (
            <span style={{ fontSize: 12, fontWeight: 700, color: isCorrect ? "#16a34a" : "#dc2626" }}>
              {isCorrect ? "✓ Đúng" : "✗ Sai"}
            </span>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {optionsList.map((opt: any) => {
            const isChosen = chosen === opt.label;
            const isCorrectOpt = submitted && opt.label === q.correct;
            const isWrongOpt = submitted && isChosen && opt.label !== q.correct;

            return (
              <label key={opt.label} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 8,
                cursor: submitted ? "default" : "pointer",
                border: `1.5px solid ${isCorrectOpt ? "#86efac" : isWrongOpt ? "#fecaca" : isChosen ? "#e87722" : "#e0d8cc"}`,
                background: isCorrectOpt ? "#f0fdf4" : isWrongOpt ? "#fef2f2" : isChosen ? "#fff3e0" : "#fafafa",
              }}>
                <input
                  type="radio"
                  disabled={submitted || isOverdue || (isExam && !examStarted)}
                  checked={isChosen}
                  onChange={() => {
                    setMcAnswers(prev => ({ ...prev, [key]: opt.label }));
                  }}
                  style={{ accentColor: "#e87722" }}
                />
                <span style={{ fontWeight: 600, color: "#e87722" }}>{opt.label}.</span>
                <span>{opt.text}</span>
              </label>
            );
          })}
        </div>
        {submitted && (
          <div style={{ marginTop: 10, fontSize: 13, borderTop: "1px dashed #e0d8cc", paddingTop: 8 }}>
            <p style={{ margin: 0, color: "#16a34a", fontWeight: "600" }}>Đáp án đúng: {q.correct}</p>
            {q.explanation && <p style={{ margin: "4px 0 0", color: "#666" }}>Giải thích: {q.explanation}</p>}
          </div>
        )}
      </div>
    );
  };

  const renderCurrentQuestionBlock = (q: any, qIdx: number) => {
    const questionType = (exercise?.Type || "").toLowerCase();

    if (questionType === "listening-mcq" || questionType === "writing-tense-mcq" || questionType === "reading-vocab-mcq" || questionType === "multiple") {
      return (
        <div>
          {q.audioUrl && (
            <div style={{ marginBottom: 12 }}>
              <audio controls style={{ width: "100%" }}>
                <source src={`${API}${q.audioUrl}`} />
              </audio>
            </div>
          )}
          {q.imageUrl && <img src={`${API}${q.imageUrl}`} alt="Question visual cue" style={{ maxHeight: 200, display: "block", marginBottom: 12, borderRadius: 8 }} />}
          {renderMCQBlock(q, qIdx)}
        </div>
      );
    }

    if (questionType === "listening-image") {
      return (
        <div>
          {q.imageUrl && <img src={`${API}${q.imageUrl}`} alt="Listening image visual" style={{ maxWidth: "100%", maxHeight: 300, display: "block", margin: "0 auto 12px", borderRadius: 8 }} />}
          {q.audioUrl && <audio controls style={{ width: "100%", marginBottom: 12 }}><source src={`${API}${q.audioUrl}`} /></audio>}
          {renderMCQBlock({ question: "Chọn đáp án đúng theo hình ảnh và âm thanh:", correct: q.correct || "A", answers: ["A", "B", "C", "D"] }, qIdx)}
        </div>
      );
    }

    if (questionType === "listening-dictation") {
      return (
        <div>
          {q.audioUrl && <audio controls style={{ width: "100%", marginBottom: 12 }}><source src={`${API}${q.audioUrl}`} /></audio>}
          <p style={{ fontWeight: 600, color: "#5a3e2b" }}>Nghe và viết lại chính xác:</p>
          {submitted ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ background: "#fafafa", border: "1px solid #e0d8cc", borderRadius: 8, padding: 12 }}>
                <p style={{ margin: 0, fontSize: 13, color: "#888" }}>Bạn viết:</p>
                <p style={{ margin: 0, fontWeight: 700 }}>"{essayAnswers[qIdx] || ""}"</p>
              </div>
              <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 8, padding: 12 }}>
                <p style={{ margin: 0, fontSize: 13, color: "#16a34a" }}>Đáp án đúng:</p>
                <p style={{ margin: 0, color: "#15803d", fontWeight: 700 }}>"{q.text}"</p>
              </div>
            </div>
          ) : (
            <textarea
              className="ad-q-input"
              disabled={isOverdue}
              value={essayAnswers[qIdx] || ""}
              onChange={e => setEssayAnswers(prev => ({ ...prev, [qIdx]: e.target.value }))}
              placeholder="Nhập những gì bạn nghe được..."
              rows={3}
            />
          )}
        </div>
      );
    }

    if (questionType === "listening-fill-in") {
      const parts = (q.text || "").split(/(\[\d+\])/g);
      const correctAnswers = q.fillInAnswers || [];

      return (
        <div>
          {q.audioUrl && <audio controls style={{ width: "100%", marginBottom: 12 }}><source src={`${API}${q.audioUrl}`} /></audio>}
          <p style={{ fontWeight: 600, color: "#5a3e2b" }}>Nghe và điền vào ô trống:</p>
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
          <span style={{ background: "#eff6ff", color: "#1d4ed8", padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700, display: "inline-block", marginBottom: 10 }}>🎯 Cấp độ: {q.level}</span>
          <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: 12, marginBottom: 12 }}>
            <p style={{ margin: 0, fontSize: 12, color: "#1d4ed8", fontWeight: 600 }}>🗣️ Đọc câu sau:</p>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1e3a8a" }}>{q.text}</p>
          </div>

          {!submitted ? (
            <div style={{ border: "2px dashed #e87722", borderRadius: 12, padding: 20, textAlign: "center" }}>
              {isList ? (
                <div>
                  <span style={{ color: "#dc2626", fontWeight: 700 }}>🔴 Đang nhận âm...</span>
                  <button onClick={() => stopSpeechRecognition(qIdx)} style={{ marginLeft: 10, padding: "4px 12px", background: "#dc2626", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}>Dừng</button>
                </div>
              ) : (
                <button disabled={isOverdue} onClick={() => startSpeechRecognition(qIdx, q.text)} style={{ padding: "10px 20px", background: "#e87722", color: "#fff", border: "none", borderRadius: 20, cursor: "pointer", fontWeight: 700 }}>🎙️ Bấm để nói</button>
              )}
              {spokenText && (
                <div style={{ marginTop: 15, textAlign: "left" }}>
                  <p style={{ margin: 0, fontSize: 13, color: "#888" }}>Nhận âm: "{spokenText}"</p>
                  <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: (speechScore || 0) >= 7 ? "green" : "orange" }}>Điểm: {speechScore}/10</p>
                </div>
              )}
            </div>
          ) : (
            <div style={{ background: "#fafafa", borderRadius: 8, padding: 12 }}>
              <p style={{ margin: 0 }}><strong>Bạn đọc:</strong> "{spokenText || "—"}"</p>
              <p style={{ margin: "5px 0 0", color: "green" }}><strong>Điểm chấm tự động:</strong> {speechScore}/10</p>
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
          <div style={{ background: "#fff3e0", border: "1px solid #f0d8b0", borderRadius: 10, padding: 12, marginBottom: 12 }}>
            <p style={{ margin: 0, fontWeight: 700, color: "#5a3e2b" }}>📌 {q.prompt}</p>
          </div>
          {q.imageUrl && <img src={`${API}${q.imageUrl}`} alt="Topic hint" style={{ maxHeight: 200, display: "block", marginBottom: 12, borderRadius: 8 }} />}

          {!submitted ? (
            <div style={{ border: "2px dashed #e87722", borderRadius: 12, padding: 20, textAlign: "center", marginBottom: 12 }}>
              {isRec ? (
                <div>
                  <span style={{ color: "#dc2626" }}>🔴 Đang ghi âm: {secs}s </span>
                  <button onClick={() => stopRecording(qIdx)} style={{ padding: "6px 12px", background: "#dc2626", color: "#fff", border: "none", borderRadius: 4 }}>Dừng</button>
                </div>
              ) : (
                <button disabled={isOverdue} onClick={() => startRecording(qIdx)} style={{ padding: "10px 20px", background: "#e87722", color: "#fff", border: "none", borderRadius: 20, fontWeight: 700 }}>🎙️ Bắt đầu ghi âm</button>
              )}
              {url && (
                <div style={{ marginTop: 15 }}>
                  <audio src={url} controls style={{ width: "100%" }} />
                </div>
              )}
            </div>
          ) : (
            url && <div style={{ marginBottom: 12 }}><audio src={`${API}${url}`} controls style={{ width: "100%" }} /></div>
          )}

          <textarea
            className="ad-q-input"
            disabled={submitted || isOverdue}
            value={essayAnswers[qIdx] || ""}
            onChange={e => setEssayAnswers(prev => ({ ...prev, [qIdx]: e.target.value }))}
            placeholder="Ghi chú bài nói..."
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
          <div style={{ background: "#fff3e0", padding: 12, borderRadius: 8, marginBottom: 12 }}>
            <p style={{ margin: 0, fontSize: 13, color: "#888" }}>Gợi ý:</p>
            <p style={{ margin: 0, fontWeight: 700 }}>{q.text}</p>
          </div>

          <div style={{ minHeight: 48, border: "2px dashed #e87722", borderRadius: 8, padding: 8, display: "flex", flexWrap: "wrap", gap: 6, background: "#fffbf5", marginBottom: 12 }}>
            {oWords.map((w, i) => (
              <span key={i} onClick={() => {
                if (submitted) return;
                setOrderedWords(prev => ({ ...prev, [qIdx]: oWords.filter((_, idx) => idx !== i) }));
                setShuffledWords(prev => ({ ...prev, [qIdx]: [...sWords, w] }));
              }} style={{ background: "#e87722", color: "#fff", padding: "4px 10px", borderRadius: 20, cursor: submitted ? "default" : "pointer" }}>{w} ✕</span>
            ))}
          </div>

          {!submitted && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {sWords.map((w, i) => (
                <span key={i} onClick={() => {
                  setOrderedWords(prev => ({ ...prev, [qIdx]: [...oWords, w] }));
                  setShuffledWords(prev => ({ ...prev, [qIdx]: sWords.filter((_, idx) => idx !== i) }));
                }} style={{ background: "#f0e8dc", padding: "4px 10px", borderRadius: 20, cursor: "pointer" }}>{w}</span>
              ))}
            </div>
          )}

          {submitted && (
            <div style={{ background: "#f0fdf4", border: "1px solid #86efac", padding: 12, borderRadius: 8 }}>
              <p style={{ margin: 0, color: "green" }}>Đáp án đúng: {q.correctSentence}</p>
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
          <p style={{ fontSize: 13, color: "#666" }}>Di chuyển vị trí câu để sắp xếp đoạn văn đúng logic:</p>
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
              placeholder="Nhập bài viết của bạn tại đây..."
              rows={6}
            />
          )}
        </div>
      );
    }

    if (questionType === "reading-split") {
      return (
        <div style={{ display: "flex", gap: 20, height: 500 }}>
          <div style={{ flex: 1, overflowY: "auto", borderRight: "1px solid #e0d8cc", paddingRight: 15 }}>
            <h5 style={{ margin: 0, fontWeight: 700 }}>📖 Reading Passage</h5>
            <p style={{ whiteSpace: "pre-line", lineHeight: 1.6 }}>{q.text}</p>
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            <h5 style={{ margin: 0, fontWeight: 700, marginBottom: 10 }}>❓ Questions</h5>
            {q.subQuestions?.map((sub: any, subIdx: number) => (
              renderMCQBlock(sub, subIdx, `${qIdx}`)
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="ad-content">
      <button className="ad-back" onClick={() => navigate(-1)}>← Quay lại</button>

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
        <div style={{
          background: "#fef2f2", border: "2px solid #ef4444", borderRadius: 12,
          padding: "16px 20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12
        }}>
          <span style={{ fontSize: 24 }}>⚠️</span>
          <div>
            <h4 style={{ margin: 0, color: "#991b1b", fontSize: 16 }}>Bài tập đã quá hạn nộp!</h4>
            <p style={{ margin: "4px 0 0", color: "#7f1d1d", fontSize: 13 }}>
              Hạn nộp bài là: <strong>{new Date(parsedContent.deadline).toLocaleString()}</strong>. Bạn chỉ có thể xem lại đề bài, không thể làm bài hoặc nộp bài.
            </p>
          </div>
        </div>
      )}

      {/* EXAM COUNTDOWN / OVER / RUNNING HEADER */}
      {isExam && (
        <div style={{
          background: "#fffbeb", border: "2px solid #f59e0b", borderRadius: 12,
          padding: "16px 20px", marginBottom: 20, textAlign: "center"
        }}>
          <h3 style={{ margin: 0, color: "#b45309" }}>⏱️ Bài Kiểm Tra Khảo Sát</h3>
          <p style={{ margin: "4px 0 12px", color: "#d97706", fontSize: 13 }}>
            Thời lượng: <strong>{parsedContent.duration} phút</strong> · Thời gian mở: {new Date(parsedContent.startTime).toLocaleString()}
          </p>

          {timeToExamStart !== null && (
            <div style={{ fontSize: 18, fontWeight: 700, color: "#b45309" }}>
              ⏳ Bài thi sẽ bắt đầu sau: <span style={{ fontFamily: "monospace", fontSize: 22 }}>{timeToExamStart}s</span>
            </div>
          )}

          {examStarted && !examEnded && (
            <div style={{ fontSize: 20, fontWeight: 800, color: "#dc2626" }}>
              ⏳ THỜI GIAN LÀM BÀI CÒN LẠI: <span style={{ fontFamily: "monospace", fontSize: 24, padding: "4px 12px", background: "#fef2f2", borderRadius: 8 }}>{formattedExamTime}</span>
            </div>
          )}

          {examEnded && (
            <div style={{ fontSize: 18, fontWeight: 700, color: "#dc2626" }}>
              🛑 Bài kiểm tra đã kết thúc.
            </div>
          )}
        </div>
      )}

      <h2 className="ad-title">{exercise.Title}</h2>

      {/* SUBMISSION STATE BANNER */}
      {submitted && baiNop && (
        <div style={{
          background: "#dcfce7", border: "1px solid #86efac",
          borderRadius: 12, padding: "14px 18px", marginBottom: 20
        }}>
          <p style={{ margin: 0, fontWeight: 600, color: "#15803d" }}>✅ Bạn đã nộp bài này</p>
          {baiNop.Diem !== null && baiNop.Diem !== undefined ? (
            <p style={{ margin: "6px 0 0", color: "#166534" }}>
              Điểm của bạn: <strong>{baiNop.Diem}/10</strong>
              {baiNop.NhanXet && ` · Nhận xét: ${baiNop.NhanXet}`}
            </p>
          ) : (
            <p style={{ margin: "6px 0 0", fontSize: 13, color: "#166534" }}>
              Đang chờ giáo viên chấm điểm thủ công bài tự luận/nói.
            </p>
          )}
        </div>
      )}

      {/* ────────────────── EXAM SOLVER INTERFACE ────────────────── */}
      {isExam ? (
        <div>
          {timeToExamStart !== null ? (
            <div style={{ textAlign: "center", padding: 50, background: "#fafafa", borderRadius: 12, border: "1px solid #e0d8cc", color: "#888" }}>
              <h3>Chờ đến giờ bắt đầu làm bài thi...</h3>
              <p>Màn hình làm bài sẽ tự động hiển thị khi đồng hồ đếm ngược kết thúc.</p>
            </div>
          ) : examEnded && !submitted ? (
            <div style={{ textAlign: "center", padding: 50, background: "#fef2f2", borderRadius: 12, border: "1px solid #fecaca", color: "#dc2626" }}>
              <h3>Đã quá thời gian làm bài kiểm tra!</h3>
              <p>Hệ thống đã khóa nhận bài thi.</p>
            </div>
          ) : (
            <div>
              {/* Section Tabs */}
              <div style={{ display: "flex", gap: 10, marginBottom: 20, overflowX: "auto" }}>
                {parsedContent.sections?.map((sec: any, sIdx: number) => (
                  <button
                    key={sIdx}
                    onClick={() => setActiveSectionIdx(sIdx)}
                    style={{
                      padding: "10px 20px", borderRadius: 20, border: "none",
                      background: activeSectionIdx === sIdx ? "#F95800" : "#e0d4c3",
                      color: activeSectionIdx === sIdx ? "#fff" : "#444",
                      fontWeight: 600, cursor: "pointer"
                    }}
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

                    {sec.type === "listening-mcq" && (
                      <div>
                        {sec.audioUrl && (
                          <div style={{ marginBottom: 20 }}>
                            <audio controls style={{ width: "100%" }}><source src={`${API}${sec.audioUrl}`} /></audio>
                          </div>
                        )}
                        {sec.questions.map((q: any, qIdx: number) => (
                          renderMCQBlock(q, qIdx, `${sIdx}`)
                        ))}
                      </div>
                    )}

                    {sec.type === "reading-split" && (
                      <div style={{ display: "flex", gap: 20, height: 500 }}>
                        <div style={{ flex: 1, overflowY: "auto", borderRight: "1px solid #e0d8cc", paddingRight: 15 }}>
                          <p style={{ whiteSpace: "pre-line", lineHeight: 1.6 }}>{sec.content}</p>
                        </div>
                        <div style={{ flex: 1, overflowY: "auto" }}>
                          {sec.questions.map((q: any, qIdx: number) => (
                            renderMCQBlock(q, qIdx, `${sIdx}`)
                          ))}
                        </div>
                      </div>
                    )}

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
                            placeholder="Nhập câu trả lời viết luận..."
                            rows={8}
                          />
                        )}
                      </div>
                    )}

                    {sec.type === "speaking-topic" && (
                      <div>
                        <div style={{ background: "#fff3e0", padding: 12, borderRadius: 8, marginBottom: 12 }}>
                          <p style={{ margin: 0, fontWeight: 700 }}>{sec.content}</p>
                        </div>
                        {sec.imageUrl && <img src={`${API}${sec.imageUrl}`} alt="Topic hint" style={{ maxHeight: 200, display: "block", marginBottom: 12, borderRadius: 8 }} />}

                        {!submitted ? (
                          <div style={{ border: "2px dashed #e87722", borderRadius: 12, padding: 20, textAlign: "center", marginBottom: 12 }}>
                            {isRecording[sIdx] ? (
                              <div>
                                <span style={{ color: "#dc2626" }}>🔴 Đang ghi âm: {recordSeconds[sIdx] || 0}s </span>
                                <button onClick={() => stopRecording(sIdx)} style={{ padding: "6px 12px", background: "#dc2626", color: "#fff", border: "none", borderRadius: 4 }}>Dừng</button>
                              </div>
                            ) : (
                              <button disabled={!examStarted || examEnded} onClick={() => startRecording(sIdx)} style={{ padding: "10px 20px", background: "#e87722", color: "#fff", border: "none", borderRadius: 20, fontWeight: 700 }}>🎙️ Ghi âm bài nói</button>
                            )}
                            {recordedUrls[sIdx] && (
                              <div style={{ marginTop: 15 }}>
                                <audio src={recordedUrls[sIdx]} controls style={{ width: "100%" }} />
                              </div>
                            )}
                          </div>
                        ) : (
                          recordedUrls[sIdx] && <div style={{ marginBottom: 12 }}><audio src={`${API}${recordedUrls[sIdx]}`} controls style={{ width: "100%" }} /></div>
                        )}

                        <textarea
                          className="ad-q-input"
                          disabled={submitted || !examStarted || examEnded}
                          value={essayAnswers[sIdx] || ""}
                          onChange={e => setEssayAnswers(prev => ({ ...prev, [sIdx]: e.target.value }))}
                          placeholder="Ghi chú thêm cho bài nói..."
                          rows={2}
                        />
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
          {/* Progress pagination indicators */}
          {questionsList.length > 1 && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 15, background: "#fafafa", padding: "10px 16px", borderRadius: 8, border: "1px solid #e0d8cc" }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#5a3e2b" }}>
                Câu hỏi {currentQuestionIdx + 1} trên {questionsList.length}
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                {questionsList.map((_, qIdx) => (
                  <span
                    key={qIdx}
                    onClick={() => setCurrentQuestionIdx(qIdx)}
                    style={{
                      width: 10, height: 10, borderRadius: "50%",
                      background: currentQuestionIdx === qIdx ? "#F95800" : "#e0d4c3",
                      cursor: "pointer"
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Render Active Question */}
          {questionsList.map((q, qIdx) => {
            if (qIdx !== currentQuestionIdx) return null;
            return (
              <div key={qIdx} className="ad-section" style={{ background: "#fff", border: "1px solid #e0d4c3", padding: 20, borderRadius: 12, marginBottom: 20 }}>
                {renderCurrentQuestionBlock(q, qIdx)}
              </div>
            );
          })}

          {/* Pagination Buttons */}
          {questionsList.length > 1 && (
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 15 }}>
              <button
                disabled={currentQuestionIdx === 0}
                onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
                style={{ padding: "8px 20px", borderRadius: 20, border: "1.5px solid #F95800", background: "#fff", color: "#F95800", fontWeight: 600, cursor: currentQuestionIdx === 0 ? "default" : "pointer", opacity: currentQuestionIdx === 0 ? 0.5 : 1 }}
              >
                ← Quay lại
              </button>
              <button
                disabled={currentQuestionIdx === questionsList.length - 1}
                onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
                style={{ padding: "8px 20px", borderRadius: 20, border: "none", background: "#F95800", color: "#fff", fontWeight: 600, cursor: currentQuestionIdx === questionsList.length - 1 ? "default" : "pointer", opacity: currentQuestionIdx === questionsList.length - 1 ? 0.5 : 1 }}
              >
                Tiếp theo →
              </button>
            </div>
          )}
        </div>
      )}

      {/* SUBMIT BUTTON FOOTER */}
      <div className="ad-footer" style={{ marginTop: 30 }}>
        {submitted ? (
          <button className="ad-submit-btn" style={{ background: "#6b7280" }} onClick={() => navigate(-1)}>
            ← Quay lại Lớp học
          </button>
        ) : (
          <button
            className="ad-submit-btn"
            onClick={handleSubmit}
            disabled={submitting || isOverdue || (isExam && (!examStarted || examEnded))}
          >
            {submitting ? "Đang nộp..." : isExam ? "Nộp bài Thi" : "Nộp bài tập"}
          </button>
        )}
      </div>
    </div>
  );
}

export default AssignmentDetail;