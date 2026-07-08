/**
 * CHỨC NĂNG CỦA FILE:
 * Hook tùy chỉnh này quản lý toàn bộ việc tải dữ liệu từ database liên quan đến bài tập (exercise),
 * thông tin lớp học (lopInfo), nạp thông tin sinh viên từ tài khoản đang đăng nhập, tải lịch sử bài nộp trước đó (baiNop),
 * kiểm tra các điều kiện khóa bài (lock), và tự động thiết lập/phục hồi các câu trả lời cũ của học sinh.
 */

import { useState, useEffect, useMemo } from "react";
import { parseQuestionsList } from "./hoTroBaiTap";

const API =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname.startsWith("192.168.") ||
  window.location.hostname.startsWith("10.")
    ? `http://${window.location.hostname}:5000`
    : "http://14.225.192.252:5000";

const mapDangBaiToType = (db: string): string => {
  if (!db) return "Trắc nghiệm";
  const dbClean = db.trim();
  if (dbClean === "Bài tập từ vựng" || dbClean === "Nối từ") return "Nối từ";
  if (dbClean === "Trắc nghiệm xác định thì" || dbClean === "Trắc nghiệm") return "Trắc nghiệm";
  return dbClean;
};

export function useLayDuLieuBaiTap(
  id: string | undefined,
  _classId: string | undefined,
  maLopHoc: number | undefined,
  user: any,
  overrideStudentId?: number,
  location?: any,
  isPreview: boolean = false,
  isModal: boolean = false
) {
  const maNguoiDung = user?.MaNguoiDung;

  const [exercise, setExercise] = useState<any>(null);
  const [lopInfo, setLopInfo] = useState<any>(null);
  const [baiNop, setBaiNop] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const [maSinhVien, setMaSinhVien] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [lockMessage, setLockMessage] = useState<string>("");

  // Solving states (answers)
  const [currentPageIdx, setCurrentPageIdx] = useState(0);
  const [mcAnswers, setMcAnswers] = useState<Record<string | number, string>>({});
  const [essayAnswers, setEssayAnswers] = useState<Record<string | number, string>>({});
  const [fillInAnswers, setFillInAnswers] = useState<Record<string | number, string[]>>({});
  const [orderedWords, setOrderedWords] = useState<Record<string | number, string[]>>({});
  const [shuffledWords, setShuffledWords] = useState<Record<string | number, string[]>>({});
  const [shuffledSentences, setShuffledSentences] = useState<Record<string | number, string[]>>({});
  const [recordedUrls, setRecordedUrls] = useState<Record<string | number, string>>({});

  // Web Speech State (for restoration)
  const [spokenTexts, setSpokenTexts] = useState<Record<string | number, string>>({});
  const [speechScores, setSpeechScores] = useState<Record<string | number, number | null>>({});

  // Exam section state
  const [activeSectionIdx, setActiveSectionIdx] = useState(0);

  // Load student info
  useEffect(() => {
    if (overrideStudentId) {
      setMaSinhVien(overrideStudentId);
      return;
    }
    if (!maNguoiDung) return;
    fetch(`${API}/students/by-user/${maNguoiDung}`)
      .then(r => r.json())
      .then(data => {
        if (data && data.MaSinhVien) {
          setMaSinhVien(data.MaSinhVien);
        } else {
          setMaSinhVien(maNguoiDung);
        }
      })
      .catch(err => {
        console.error("Error fetching student info:", err);
        setMaSinhVien(maNguoiDung);
      });
  }, [maNguoiDung, overrideStudentId]);

  // Load prior locks progress
  useEffect(() => {
    if (!exercise || !maSinhVien || (user.VaiTro !== "Sinh Viên" && user.VaiTro !== "Học Viên")) return;

    if (maNguoiDung === 123456 || maNguoiDung === 5) {
      setIsLocked(false);
      return;
    }

    if (exercise.MaBaiHoc) {
      const checkProgress = async () => {
        try {
          const mtRes = await fetch(`${API}/minitest/baigiang/${exercise.MaBaiHoc}?role=student`);
          const mtData = await mtRes.json();
          const hasMinitest = mtData && mtData.MaMinitest;

          const progRes = await fetch(`${API}/student/progress/minitest/${exercise.MaBaiHoc}/${maSinhVien}`);
          const progData = await progRes.json();

          const daXemVideo = progData.DaXemVideo === 1;
          const daDatMinitest = progData.DaDatMinitest === 1;

          if (!daXemVideo) {
            setIsLocked(true);
            setLockMessage("Bạn cần xem hết video bài giảng để mở khóa bài tập này.");
          } else if (hasMinitest && !daDatMinitest) {
            setIsLocked(true);
            setLockMessage("Bạn đã xem xong bài giảng nhưng cần hoàn thành và đạt bài Minitest để mở khóa bài tập này.");
          } else {
            setIsLocked(false);
          }
        } catch (err) {
          console.error("Lỗi khi kiểm tra tiến trình học tập:", err);
        }
      };
      checkProgress();
    }
  }, [exercise, maSinhVien, user?.VaiTro, maNguoiDung]);

  const isReview = isPreview ? false : (isModal ? true : (new URLSearchParams(location?.search || "").get("mode") === "review" || !!(baiNop && (baiNop.DaXemGiaiThich === 1 || (baiNop.SoLanLamBai || 0) >= 3))));

  // Metadata parsing
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

  const isExam = !!parsedContent.isExam || exercise?.Type === "exam";
  const hasSections = !!parsedContent.sections && parsedContent.sections.length > 0;

  const questionsList = useMemo(() => {
    return parseQuestionsList(exercise, isExam || hasSections, parsedContent);
  }, [exercise, isExam, hasSections, parsedContent]);

  // Load prior submission data
  useEffect(() => {
    if (!id) return;
    if (maNguoiDung && maSinhVien === null) return;

    Promise.all([
      fetch(`${API}/baitap/${id}`).then(r => r.json()),
      maLopHoc ? fetch(`${API}/classes/${maLopHoc}/info`).then(r => r.json()) : Promise.resolve(null),
      fetch(`${API}/bainop/baitap/${id}`).then(r => r.json()),
    ])
      .then(([exData, lopData, nopData]) => {
        setExercise({ ...exData, Type: mapDangBaiToType(exData.Type) });
        setLopInfo(lopData);
        const queryParams = new URLSearchParams(location?.search || "");
        const urlSubmissionId = queryParams.get("submissionId");
        
        let myNop = null;
        if (!isPreview) {
          if (location?.state?.justSubmittedAnswers) {
            myNop = {
              NoiDung: typeof location.state.justSubmittedAnswers === "string"
                ? location.state.justSubmittedAnswers
                : JSON.stringify(location.state.justSubmittedAnswers),
              Diem: location.state.diem
            };
          }

          if (!myNop && urlSubmissionId && Array.isArray(nopData)) {
            myNop = nopData.find((b: any) => String(b.MaBaiNop) === String(urlSubmissionId));
          }
          
          if (!myNop && Array.isArray(nopData)) {
            const studentNops = nopData.filter((b: any) => {
              const rowSVId = b.MaSinhVien && typeof b.MaSinhVien === "string" && b.MaSinhVien.startsWith("SV")
                ? parseInt(b.MaSinhVien.replace("SV", ""), 10)
                : Number(b.MaSinhVien);
              const currentSVId = Number(maSinhVien);
              const currentNDId = Number(maNguoiDung);
              return rowSVId === currentSVId || rowSVId === currentNDId || Number(b.MaNguoiDung) === currentNDId;
            });
            if (studentNops.length > 0) {
              studentNops.sort((a, b) => {
                const aVal = a.SoLanLamBai || 0;
                const bVal = b.SoLanLamBai || 0;
                if (bVal !== aVal) return bVal - aVal;
                return (b.MaBaiNop || 0) - (a.MaBaiNop || 0);
              });
              myNop = studentNops[0];
            }
          }
        }
        
        setBaiNop(myNop || null);
        
        const forceReviewMode = !isPreview && (isReview || !!(myNop && (myNop.DaXemGiaiThich === 1 || (myNop.SoLanLamBai || 0) >= 3)));
        if (myNop && forceReviewMode) {
          setSubmitted(true);
          try {
            const contentText = myNop.NoiDung || "";
            if (contentText.startsWith("{") || contentText.startsWith("[")) {
              const subObj = JSON.parse(contentText);
              if (subObj.isExam || subObj.sections) {
                const loadedAnswers: Record<string | number, string> = {};
                const loadedEssay: Record<string | number, string> = {};
                const loadedUrls: Record<string | number, string> = {};
                const loadedFillIn: Record<string | number, string[]> = {};
                subObj.sections.forEach((sec: any, sIdx: number) => {
                  if (sec.type === "Nghe audio trắc nghiệm" || sec.type === "Trắc nghiệm đọc hiểu (chia đôi màn hình)") {
                    Object.keys(sec.answers || {}).forEach((qIdxStr) => {
                      loadedAnswers[`${sIdx}_${qIdxStr}`] = sec.answers[qIdxStr];
                    });
                  } else if (sec.type === "Viết đoạn văn ngắn") {
                    loadedEssay[sIdx] = sec.essayText;
                  } else if (sec.type === "Nói theo chủ đề (ghi âm nộp GV)") {
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
                      const scoreVal = q.score !== undefined && q.score !== null ? q.score : q.speechScore;
                      if (scoreVal !== undefined && scoreVal !== null) setSpeechScores(prev => ({ ...prev, [key]: scoreVal }));
                      if (q.sentences) setShuffledSentences(prev => ({ ...prev, [key]: q.sentences }));
                    });
                  }
                });
                setMcAnswers(loadedAnswers);
                setEssayAnswers(loadedEssay);
                setRecordedUrls(loadedUrls);
                setFillInAnswers(loadedFillIn);
              } else {
                const loadedAnswers: Record<string | number, string> = {};
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
                  const scoreVal = q.score !== undefined && q.score !== null ? q.score : q.speechScore;
                  if (scoreVal !== undefined && scoreVal !== null) setSpeechScores(prev => ({ ...prev, [idx]: scoreVal }));
                  if (q.subQuestions && Array.isArray(q.subQuestions)) {
                    q.subQuestions.forEach((sub: any, subIdx: number) => {
                      if (sub.chosen) {
                        loadedAnswers[`${idx}_${subIdx}`] = sub.chosen;
                      }
                    });
                  }
                });
                setMcAnswers(loadedAnswers);
                setEssayAnswers(loadedEssay);
                setRecordedUrls(loadedUrls);
                setFillInAnswers(loadedFillIn);
              }
            } else {
              setEssayAnswers({ 0: contentText });
            }
          } catch (e) {
            console.log("Error parsing prior submission", e);
          }
        }
      })
      .catch((err) => {
        console.error("Error loading exercise:", err);
      })
      .finally(() => setLoading(false));
  }, [id, maLopHoc, maSinhVien, maNguoiDung, isReview, isPreview, location]);

  // Initializing words and sentences shuffle
  useEffect(() => {
    if (questionsList.length > 0 && !submitted) {
      questionsList.forEach((q, idx) => {
        if (exercise?.Type === "Sắp xếp từ thành câu" || (q.correctSentence && !q.answers)) {
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
    if ((isExam || hasSections) && parsedContent.sections && !submitted) {
      parsedContent.sections.forEach((sec: any, sIdx: number) => {
        if (sec.questions) {
          sec.questions.forEach((q: any, qIdx: number) => {
            const key = `${sIdx}_${qIdx}`;
            if (sec.type === "Sắp xếp từ thành câu") {
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
            if (sec.type === "Sắp xếp câu thành đoạn văn") {
              setShuffledSentences(prev => {
                if (prev[key]) return prev;
                return { ...prev, [key]: [...(q.sentences || [])].sort(() => Math.random() - 0.5) };
              });
            }
          });
        }
      });
    }
  }, [questionsList, parsedContent, submitted, exercise, isExam, hasSections]);

  return {
    exercise,
    setExercise,
    lopInfo,
    setLopInfo,
    baiNop,
    setBaiNop,
    loading,
    setLoading,
    submitted,
    setSubmitted,
    maSinhVien,
    isLocked,
    lockMessage,
    isReview,
    parsedContent,
    isExam,
    hasSections,
    questionsList,
    // solving states
    currentPageIdx,
    setCurrentPageIdx,
    mcAnswers,
    setMcAnswers,
    essayAnswers,
    setEssayAnswers,
    fillInAnswers,
    setFillInAnswers,
    orderedWords,
    setOrderedWords,
    shuffledWords,
    setShuffledWords,
    shuffledSentences,
    setShuffledSentences,
    recordedUrls,
    setRecordedUrls,
    spokenTexts,
    setSpokenTexts,
    speechScores,
    setSpeechScores,
    activeSectionIdx,
    setActiveSectionIdx
  };
}
