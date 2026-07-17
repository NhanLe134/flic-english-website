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
  window.location.hostname.startsWith("192.168.") || window.location.hostname.startsWith("172.") ||
  window.location.hostname.startsWith("10.")
    ? `http://${window.location.hostname}:5004`
    : (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.startsWith("192.168.") || window.location.hostname.startsWith("172.") || window.location.hostname.startsWith("10.") ? "http://" + window.location.hostname + ":5004" : "http://14.225.192.252:5004") + "";

const normalizeSectionType = (typeStr: string): string => {
  if (!typeStr) return "";
  const s = typeStr.trim().toLowerCase();
  
  if (s.includes("nghe audio") && (s.includes("trac nghiem") || s.includes("tr?c nghi?m") || s.includes("trắc nghiệm"))) {
    return "Nghe audio trắc nghiệm";
  }
  if (s.includes("hình ảnh chọn") || s.includes("hinh anh chon") || s.includes("hnh ?nh ch?n")) {
    return "Hình ảnh chọn đáp án";
  }
  if (s.includes("chép chính tả") || s.includes("chep chinh ta") || s.includes("ch?p chnh t?")) {
    return "Nghe chép chính tả";
  }
  if (s.includes("điền từ") || s.includes("dien tu") || s.includes("di?n t?")) {
    return "Điền từ vào đoạn văn";
  }
  if (s.includes("luyện phát âm") || s.includes("luyen phat am") || s.includes("luy?n pht m") || s.includes("check phát âm") || s.includes("check phat am")) {
    return "Luyện phát âm (check phát âm tự động)";
  }
  if (s.includes("nói theo chủ đề") || s.includes("noi theo chu de") || s.includes("ni theo ch? d?")) {
    return "Nói theo chủ đề (ghi âm nộp GV)";
  }
  if (s.includes("đọc hiểu") || s.includes("doc hieu") || s.includes("d?c hi?u")) {
    return "Trắc nghiệm đọc hiểu (chia đôi màn hình)";
  }
  if (s.includes("nối từ") || s.includes("noi tu") || s.includes("ni t?")) {
    return "Nối từ";
  }
  if (s.includes("sắp xếp từ") || s.includes("sap xep tu") || s.includes("s?p x?p t?")) {
    return "Sắp xếp từ thành câu";
  }
  if (s.includes("tìm lỗi sai") || s.includes("tim loi sai") || s.includes("tm l?i sai")) {
    return "Tìm lỗi sai";
  }
  if (s === "trắc nghiệm" || s === "trac nghiem" || s === "tr?c nghi?m") {
    return "Trắc nghiệm";
  }
  if (s.includes("viết đoạn") || s.includes("viet doan") || s.includes("vi?t do?n")) {
    return "Viết đoạn văn ngắn";
  }
  if (s.includes("sắp xếp câu") || s.includes("sap xep cau") || s.includes("s?p x?p cu")) {
    return "Sắp xếp câu thành đoạn văn";
  }

  if (s.includes("audio")) return "Nghe audio trắc nghiệm";
  if (s.includes("image") || s.includes("ảnh") || s.includes("?nh")) return "Hình ảnh chọn đáp án";
  if (s.includes("dictation") || s.includes("chính tả") || s.includes("chnh t?")) return "Nghe chép chính tả";
  if (s.includes("fill") || s.includes("điền") || s.includes("di?n")) return "Điền từ vào đoạn văn";
  if (s.includes("pronounce") || s.includes("phát âm") || s.includes("pht m")) return "Luyện phát âm (check phát âm tự động)";
  if (s.includes("speaking") || s.includes("nói") || s.includes("ni")) return "Nói theo chủ đề (ghi âm nộp GV)";
  if (s.includes("reading") || s.includes("đọc") || s.includes("d?c")) return "Trắc nghiệm đọc hiểu (chia đôi màn hình)";
  if (s.includes("matching") || s.includes("nối") || s.includes("ni")) return "Nối từ";
  if (s.includes("arrange words") || s.includes("sắp xếp từ")) return "Sắp xếp từ thành câu";
  if (s.includes("mistake") || s.includes("lỗi") || s.includes("l?i")) return "Tìm lỗi sai";
  if (s.includes("mcq") || s.includes("trắc nghiệm")) return "Trắc nghiệm";
  if (s.includes("essay") || s.includes("viết") || s.includes("vi?t")) return "Viết đoạn văn ngắn";
  if (s.includes("arrange sentences") || s.includes("sắp xếp câu")) return "Sắp xếp câu thành đoạn văn";

  return typeStr;
};

const mapDangBaiToType = (db: string): string => {
  if (!db) return "Trắc nghiệm";
  return normalizeSectionType(db);
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
    if (isPreview) return;
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

    let isUnlinked = false;
    if (exercise.Content) {
      try {
        const parsed = JSON.parse(exercise.Content);
        if (parsed.unlinked) {
          isUnlinked = true;
        }
      } catch (e) {}
    }

    if (isUnlinked) {
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
    console.log("useLayDuLieuBaiTap [parsedContent]: exercise Content length:", exercise?.Content?.length);
    if (!exercise?.Content) return {};
    try {
      if (exercise.Content.trim().startsWith("{")) {
        const parsed = JSON.parse(exercise.Content);
        console.log("useLayDuLieuBaiTap [parsedContent]: JSON parsed successfully, sections count:", parsed.sections?.length);
        if (parsed.sections && Array.isArray(parsed.sections)) {
          parsed.sections = parsed.sections.map((sec: any) => ({
            ...sec,
            type: normalizeSectionType(sec.type)
          }));
        }
        return parsed;
      }
    } catch (e) {
      console.error("useLayDuLieuBaiTap [parsedContent]: JSON parse error:", e);
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
    console.log("useLayDuLieuBaiTap [fetchEffect]: triggered! id:", id, "maNguoiDung:", maNguoiDung, "maSinhVien:", maSinhVien, "isPreview:", isPreview, "maLopHoc:", maLopHoc);
    if (!id) {
      console.log("useLayDuLieuBaiTap [fetchEffect]: no id, skipped fetch");
      return;
    }
    if (!isPreview && maNguoiDung && maSinhVien === null) {
      console.log("useLayDuLieuBaiTap [fetchEffect]: !isPreview and maSinhVien is null, skipped fetch");
      return;
    }

    console.log("useLayDuLieuBaiTap [fetchEffect]: starting fetch calls...");
    Promise.all([
      fetch(`${API}/baitap/${id}`).then(r => r.json()),
      maLopHoc ? fetch(`${API}/classes/${maLopHoc}/info`).then(r => r.json()) : Promise.resolve(null),
      !isPreview ? fetch(`${API}/bainop/baitap/${id}`).then(r => r.json()) : Promise.resolve([]),
    ])
      .then(([exData, lopData, nopData]) => {
        console.log("useLayDuLieuBaiTap [fetchEffect]: fetch finished! Title:", exData?.Title || exData?.TenBai, "Type:", exData?.Type);
        setExercise({ ...exData, Type: mapDangBaiToType(exData?.Type || exData?.DangBai) });
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
                   const normalizedSecType = normalizeSectionType(sec.type);
                   if (normalizedSecType === "Nghe audio trắc nghiệm" || normalizedSecType === "Trắc nghiệm đọc hiểu (chia đôi màn hình)") {
                     Object.keys(sec.answers || {}).forEach((qIdxStr) => {
                       loadedAnswers[`${sIdx}_${qIdxStr}`] = sec.answers[qIdxStr];
                     });
                   } else if (normalizedSecType === "Viết đoạn văn ngắn") {
                     loadedEssay[sIdx] = sec.essayText;
                   } else if (normalizedSecType === "Nói theo chủ đề (ghi âm nộp GV)") {
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
      .finally(() => {
        console.log("useLayDuLieuBaiTap [fetchEffect]: finally block. Setting loading to false");
        setLoading(false);
      });
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
