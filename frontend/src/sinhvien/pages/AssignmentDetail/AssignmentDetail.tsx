//quản lý toàn bộ State, giao tiếp với API, điều hướng và cấu trúc bố cục trang
// @ts-nocheck
import "./AssignmentDetail.css";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useState, useEffect, useRef, useMemo } from "react";
import { FiVolume2, FiEdit3, FiBookOpen, FiFileText, FiCheckCircle, FiXCircle, FiClock, FiMic, FiAward, FiList } from "react-icons/fi";
import { CustomAudioPlayer } from "../../components/CustomAudioPlayer/CustomAudioPlayer";

import { CauHoiTracNghiem } from "./CauHoiTracNghiem";
import { NgheChonAnh } from "./NgheChonAnh";
import { NgheChepChinhTa } from "./NgheChepChinhTa";
import { NgheDienTu } from "./NgheDienTu";
import { PhatAmTuDong } from "./PhatAmTuDong";
import { NoiTheoChuDe } from "./NoiTheoChuDe";
import { SapXepTu } from "./SapXepTu";
import { SapXepCau } from "./SapXepCau";
import { VietDoanVan } from "./VietDoanVan";
import { BoGiaiDeThi } from "./BoGiaiDeThi";
import { calcDictationScore, calcSpeechScore, parseQuestionsList } from "./hoTroBaiTap";

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
    return parseQuestionsList(exercise, isExam, parsedContent);
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
    if (maNguoiDung && maSinhVien === null) return;

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
  }, [id, maLopHoc, maSinhVien, maNguoiDung]);

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
    if (submitted) {
      if (maLopHoc) navigate(`/class-detail/${maLopHoc}`);
      else navigate("/MyCourses");
      return;
    }

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
            loai: "Exam",
            maBaiTap: id
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
            loai: exercise?.Type || "Bài tập",
            maBaiTap: id
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
    return (
      <CauHoiTracNghiem
        q={q}
        qIdx={qIdx}
        subIdxPrefix={subIdxPrefix}
        mcAnswers={mcAnswers}
        setMcAnswers={setMcAnswers}
        submitted={submitted}
        isOverdue={isOverdue}
        isExam={isExam}
        examStarted={examStarted}
      />
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
      return (
        <NgheChonAnh
          q={q}
          qIdx={qIdx}
          exercise={exercise}
          hideAudio={hideAudio}
          mcAnswers={mcAnswers}
          setMcAnswers={setMcAnswers}
          submitted={submitted}
          isOverdue={isOverdue}
          isExam={isExam}
          examStarted={examStarted}
          API={API}
        />
      );
    }

    if (questionType === "listening-dictation") {
      return (
        <NgheChepChinhTa
          q={q}
          qIdx={qIdx}
          exercise={exercise}
          essayAnswers={essayAnswers}
          setEssayAnswers={setEssayAnswers}
          submitted={submitted}
          isOverdue={isOverdue}
          isExam={isExam}
          examStarted={examStarted}
          API={API}
        />
      );
    }

    if (questionType === "listening-fill-in") {
      return (
        <NgheDienTu
          q={q}
          qIdx={qIdx}
          fillInAnswers={fillInAnswers}
          setFillInAnswers={setFillInAnswers}
          submitted={submitted}
          isOverdue={isOverdue}
          API={API}
        />
      );
    }

    if (questionType === "speaking-pronounce") {
      return (
        <PhatAmTuDong
          q={q}
          qIdx={qIdx}
          speechScores={speechScores}
          setSpeechScores={setSpeechScores}
          spokenTexts={spokenTexts}
          setSpokenTexts={setSpokenTexts}
          isListeningSTT={isListeningSTT}
          setIsListeningSTT={setIsListeningSTT}
          submitted={submitted}
          isOverdue={isOverdue}
        />
      );
    }

    if (questionType === "speaking-topic") {
      return (
        <NoiTheoChuDe
          q={q}
          qIdx={qIdx}
          recordedUrls={recordedUrls}
          setRecordedUrls={setRecordedUrls}
          recordedBlobs={recordedBlobs}
          setRecordedBlobs={setRecordedBlobs}
          isRecording={isRecording}
          setIsRecording={setIsRecording}
          recordSeconds={recordSeconds}
          setRecordSeconds={setRecordSeconds}
          essayAnswers={essayAnswers}
          setEssayAnswers={setEssayAnswers}
          submitted={submitted}
          isOverdue={isOverdue}
          API={API}
        />
      );
    }

    if (questionType === "writing-order-words") {
      return (
        <SapXepTu
          q={q}
          qIdx={qIdx}
          shuffledWords={shuffledWords}
          setShuffledWords={setShuffledWords}
          orderedWords={orderedWords}
          setOrderedWords={setOrderedWords}
          submitted={submitted}
        />
      );
    }

    if (questionType === "writing-order-sentences") {
      return (
        <SapXepCau
          q={q}
          qIdx={qIdx}
          shuffledSentences={shuffledSentences}
          setShuffledSentences={setShuffledSentences}
          submitted={submitted}
          isOverdue={isOverdue}
        />
      );
    }

    if (questionType === "writing-essay") {
      return (
        <VietDoanVan
          q={q}
          qIdx={qIdx}
          essayAnswers={essayAnswers}
          setEssayAnswers={setEssayAnswers}
          submitted={submitted}
          isOverdue={isOverdue}
        />
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
              <CauHoiTracNghiem
                key={subIdx}
                q={sub}
                qIdx={subIdx}
                subIdxPrefix={`${qIdx}`}
                mcAnswers={mcAnswers}
                setMcAnswers={setMcAnswers}
                submitted={submitted}
                isOverdue={isOverdue}
                isExam={isExam}
                examStarted={examStarted}
              />
            ))}
          </div>
        </div>
      );
    }

    return null;
  };


  return (
    <div className="ad-content">
      <button className="ad-back" onClick={() => maLopHoc ? navigate(`/class-detail/${maLopHoc}`) : navigate("/MyCourses")}>← Quay lại</button>

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
            <BoGiaiDeThi
              exercise={exercise}
              parsedContent={parsedContent}
              submitted={submitted}
              examStarted={examStarted}
              examEnded={examEnded}
              activeSectionIdx={activeSectionIdx}
              setActiveSectionIdx={setActiveSectionIdx}
              mcAnswers={mcAnswers}
              setMcAnswers={setMcAnswers}
              essayAnswers={essayAnswers}
              setEssayAnswers={setEssayAnswers}
              fillInAnswers={fillInAnswers}
              setFillInAnswers={setFillInAnswers}
              shuffledSentences={shuffledSentences}
              setShuffledSentences={setShuffledSentences}
              shuffledWords={shuffledWords}
              setShuffledWords={setShuffledWords}
              orderedWords={orderedWords}
              setOrderedWords={setOrderedWords}
              recordedUrls={recordedUrls}
              isRecording={isRecording}
              recordSeconds={recordSeconds}
              spokenTexts={spokenTexts}
              setSpokenTexts={setSpokenTexts}
              speechScores={speechScores}
              setSpeechScores={setSpeechScores}
              isListeningSTT={isListeningSTT}
              setIsListeningSTT={setIsListeningSTT}
              startRecording={startRecording}
              stopRecording={stopRecording}
              API={API}
            />
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
          <button
            className="ad-submit-btn"
            style={{ backgroundColor: "#64748b" }}
            onClick={() => maLopHoc ? navigate(`/class-detail/${maLopHoc}`) : navigate("/MyCourses")}
          >
            Quay lại lớp học
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

