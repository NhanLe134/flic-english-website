/**
 * CHỨC NĂNG CỦA FILE:
 * Component chính quản lý trang Chi Tiết Bài Tập học viên.
 * Nó kết nối các Custom Hooks logic (useLayDuLieuBaiTap, useGhiAmVaGiongNoi, useNopBaiTap)
 * và phân luồng hiển thị giữa Đề thi thử (BoGiaiDeThi) và Bài tập ôn luyện thường (KhungBaiTapThuong).
 * Ngoài ra còn xử lý điều hướng, trạng thái tải trang (loading), khóa bài học, cảnh báo hết hạn và nộp bài.
 */

import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { FiLock, FiClock, FiXCircle } from "react-icons/fi";
import { FaReply } from "react-icons/fa";

import { useLayDuLieuBaiTap } from "../XuLyLogic/useLayDuLieuBaiTap";
import { useGhiAmVaGiongNoi } from "../XuLyLogic/useGhiAmVaGiongNoi";
import { useNopBaiTap } from "../XuLyLogic/useNopBaiTap";
import { PopupXacNhanThoat } from "../Popup/PopupXacNhanThoat";
import { KhungBaiTapThuong } from "./KhungBaiTapThuong";
import { BoGiaiDeThi } from "./BoGiaiDeThi";

import "./ChiTietBaiTap.css";
import "./AssignmentTypes.css";

const API =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname.startsWith("192.168.") ||
  window.location.hostname.startsWith("10.")
    ? `http://${window.location.hostname}:5004`
    : (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.startsWith("192.168.") || window.location.hostname.startsWith("10.") ? "http://" + window.location.hostname + ":5004" : "http://14.225.192.252:5004") + "";

interface ChiTietBaiTapProps {
  overrideExerciseId?: number;
  overrideStudentId?: number;
  overrideClassId?: number;
  isModal?: boolean;
  isPreview?: boolean;
  onClose?: () => void;
  showAnswers?: boolean;
}

function ChiTietBaiTap({
  overrideExerciseId,
  overrideStudentId,
  overrideClassId,
  isModal = false,
  isPreview = false,
  onClose,
  showAnswers = false
}: ChiTietBaiTapProps = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: paramId, classId: paramClassId, lessonId } = useParams<{ id: string; classId?: string; lessonId?: string }>();

  const id = overrideExerciseId ? String(overrideExerciseId) : paramId;
  const classId = overrideClassId ? String(overrideClassId) : paramClassId;
  const maLopHoc = classId ? Number(classId) : location.state?.maLopHoc;

  const user = JSON.parse(sessionStorage.getItem("user") || "{}");

  // Hook 1: Fetch and load all exercise configurations and data
  const data = useLayDuLieuBaiTap(id, classId, maLopHoc, user, overrideStudentId, location, isPreview, isModal);
  const {
    exercise,
    lopInfo,
    baiNop,
    loading,
    submitted,
    maSinhVien,
    isLocked,
    lockMessage,
    isReview,
    parsedContent,
    isExam,
    hasSections,
    questionsList,
    currentPageIdx,
    setCurrentPageIdx,
    mcAnswers, setMcAnswers,
    essayAnswers, setEssayAnswers,
    fillInAnswers, setFillInAnswers,
    orderedWords, setOrderedWords,
    shuffledWords, setShuffledWords,
    shuffledSentences, setShuffledSentences,
    recordedUrls,
    spokenTexts,
    speechScores,
    activeSectionIdx, setActiveSectionIdx
  } = data;

  // Hook 2: Handles Microphone recording blobs & Web Speech to Text recognizers
  const recorder = useGhiAmVaGiongNoi();
  const {
    recordedBlobs,
    setRecordedBlobs,
    isRecording,
    setIsRecording,
    recordSeconds,
    setRecordSeconds,
    startRecording,
    stopRecording,
    isListeningSTT,
    setIsListeningSTT
  } = recorder;

  // Sync loaded states from DB to recorder hook states (for speech restoration)
  useEffect(() => {
    if (Object.keys(recordedUrls).length > 0) {
      recorder.setRecordedUrls(recordedUrls);
    }
  }, [recordedUrls]);

  useEffect(() => {
    if (Object.keys(spokenTexts).length > 0) {
      recorder.setSpokenTexts(spokenTexts);
    }
  }, [spokenTexts]);

  useEffect(() => {
    if (Object.keys(speechScores).length > 0) {
      recorder.setSpeechScores(speechScores);
    }
  }, [speechScores]);

  // Hook 3: Handles grading and submitting to backend API
  const submitter = useNopBaiTap(
    id, maSinhVien, user, exercise, questionsList, isExam, hasSections,
    parsedContent, maLopHoc, lessonId, navigate, location
  );

  const { submitting, handleSubmit } = submitter;

  const handleWrappedSubmit = (answers: any) => {
    if (isPreview) {
      console.log("Submit disabled in preview mode");
      return;
    }
    handleSubmit(answers);
  };

  // Layout navigation buttons logic
  const [showBackBtn, setShowBackBtn] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  useEffect(() => {
    if (isModal) return;
    const handleMouseMove = (e: MouseEvent) => {
      if (e.clientX < window.innerWidth / 2 && e.clientY < window.innerHeight / 2) {
        setShowBackBtn(true);
      } else {
        setShowBackBtn(false);
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isModal]);

  const executeBackNavigation = () => {
    if (isModal && onClose) {
      onClose();
      return;
    }
    if (location.pathname.includes('/hoc-thu-sv/')) {
      if (classId && lessonId) {
        const isExamTab = location.pathname.includes('/bt/');
        navigate(`/hoc-thu-sv/${classId}/${lessonId}/${isExamTab ? 'bt' : 'lt'}`);
      } else {
        navigate(-1);
      }
      return;
    }

    if (classId && lessonId) {
      const isExamTab = location.pathname.includes('/bt/');
      navigate(`/MyCourses/${classId}/${lessonId}/${isExamTab ? 'bt' : 'lt'}`);
    } else if (maLopHoc) {
      navigate(`/MyCourses/${maLopHoc}`);
    } else {
      navigate("/MyCourses");
    }
  };

  const handleBackNavigation = () => {
    if (isReview || submitted) {
      executeBackNavigation();
    } else {
      setShowExitConfirm(true);
    }
  };

  // Timer configuration for Exam solver
  const [examSecondsLeft, setExamSecondsLeft] = useState<number | null>(null);
  const [examStarted, setExamStarted] = useState(false);
  const [examEnded, setExamEnded] = useState(false);
  const [timeToExamStart, setTimeToExamStart] = useState<number | null>(null);

  // Initialize examStarted/examEnded for non-exam sectioned exercises/practices
  useEffect(() => {
    if (hasSections && !isExam) {
      setExamStarted(true);
      setExamEnded(false);
    }
  }, [hasSections, isExam]);

  // Countdown timer setup
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
          handleWrappedSubmit({
            mcAnswers, essayAnswers, recordedBlobs, recordedUrls: recorder.recordedUrls,
            fillInAnswers, spokenTexts: recorder.spokenTexts, speechScores: recorder.speechScores,
            orderedWords, shuffledSentences
          });
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isExam, parsedContent, mcAnswers, essayAnswers, recordedBlobs, recorder.recordedUrls, fillInAnswers, recorder.spokenTexts, recorder.speechScores, orderedWords, shuffledSentences]);

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

  // Loading and Locked banners
  if (loading) return <div style={{ textAlign: "center", padding: 40, color: "#999" }}>Loading...</div>;
  if (!exercise) return <div style={{ textAlign: "center", padding: 40, color: "#999" }}>Exercise not found.</div>;

  if (isLocked) {
    return (
      <div className="exit-confirm-modal-backdrop" onClick={() => navigate(-1)}>
        <div className="exit-confirm-modal-card" style={{ textAlign: "center", position: "relative", maxWidth: "440px", padding: "40px 30px" }} onClick={(e) => e.stopPropagation()}>
          <button className="exit-modal-close-x" onClick={() => navigate(-1)} title="Quay lại">&times;</button>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}><FiLock size={56} color="#F95800" /></div>
          <h2 style={{ color: "#1e3a8a", marginBottom: 16, fontWeight: 700, fontSize: "22px" }}>Bài tập đang bị khóa</h2>
          <p style={{ color: "#4b5563", fontSize: "14.5px", lineHeight: 1.6, marginBottom: 28 }}>{lockMessage}</p>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <button onClick={() => navigate(-1)} style={{ background: "#F95800", color: "#fff", padding: "10px 24px", borderRadius: "8px", fontWeight: "600", border: "none" }}>Quay lại</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ad-content">
      {/* 1. Nút quay lại góc trái */}
      {showBackBtn && (
        <button className="ad-back-overlay" onClick={handleBackNavigation} title="Quay lại">
          <FaReply size={18} style={{ marginRight: "1px" }} />
        </button>
      )}

      {/* 2. Hộp thoại xác nhận thoát khỏi bài làm dở */}
      {showExitConfirm && (
        <PopupXacNhanThoat
          onClose={() => setShowExitConfirm(false)}
          onConfirm={() => {
            setShowExitConfirm(false);
            executeBackNavigation();
          }}
        />
      )}

      {/* 3. Banner thông tin Lớp học */}
      {lopInfo && (
        <div className="ad-info-card">
          <div className="ad-info-left">
            <p className="ad-course-name">{lopInfo.TenLop}</p>
            <p className="ad-course-code">{lopInfo.TenKhoaHoc}</p>
          </div>
          <span className="ad-badge-active">Active</span>
        </div>
      )}

      {/* EXAM COUNTDOWN / OVER / RUNNING HEADER */}
      {isExam && (
        <div className="ad-banner ad-banner-exam">
          <h3 style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
            <FiClock /> Assessment Exam
          </h3>
          <p className="exam-meta">
            Duration: <strong>{parsedContent.duration} minutes</strong> · Open time: {new Date(parsedContent.startTime).toLocaleString()}
          </p>

          {isPreview && (
            <div style={{ fontSize: 16, fontWeight: 700, color: "#059669", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
              [PREVIEW MODE] Bạn đang xem thử đề thi này dưới vai trò Giáo viên/QTV.
            </div>
          )}

          {!isPreview && timeToExamStart !== null && (
            <div style={{ fontSize: 18, fontWeight: 700, color: "#b45309", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
              <FiClock /> The exam starts in: <span style={{ fontFamily: "monospace", fontSize: 22 }}>{timeToExamStart}s</span>
            </div>
          )}

          {!isPreview && examStarted && !examEnded && (
            <div className="exam-timer" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
              <FiClock /> REMAINING TIME: <span className="exam-timer-span">{formattedExamTime}</span>
            </div>
          )}

          {!isPreview && examEnded && (
            <div style={{ fontSize: 18, fontWeight: 700, color: "#dc2626", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
              <FiXCircle /> The exam has ended.
            </div>
          )}
        </div>
      )}

      <h2 className="ad-title">{exercise.Title}</h2>

      {/* 4. Banner Trạng thái Đã Nộp */}
      {submitted && baiNop && (
        <div className="ad-banner ad-banner-submitted">
          <p className="status-title">You have submitted this assignment</p>
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

      {/* 5. Giao diện làm đề thi lớn hoặc ôn tập từng phần */}
      {(isExam || hasSections) ? (
        <div>
          {!isPreview && timeToExamStart !== null ? (
            <div className="ad-exam-waiting">
              <h3>Waiting for the exam to start...</h3>
              <p>The exam interface will automatically display when the countdown reaches 0.</p>
            </div>
          ) : !isPreview && examEnded && !submitted ? (
            <div className="ad-exam-waiting" style={{ background: "#fef2f2", borderColor: "#fecaca", color: "#dc2626" }}>
              <h3>The exam time limit has expired!</h3>
              <p>Submissions are now closed.</p>
            </div>
          ) : (
            <BoGiaiDeThi
              exercise={exercise}
              parsedContent={parsedContent}
              submitted={submitted}
              examStarted={isPreview ? true : examStarted}
              examEnded={isPreview ? false : examEnded}
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
              recordedUrls={recorder.recordedUrls}
              isRecording={isRecording}
              recordSeconds={recordSeconds}
              spokenTexts={recorder.spokenTexts}
              setSpokenTexts={recorder.setSpokenTexts}
              speechScores={recorder.speechScores}
              setSpeechScores={recorder.setSpeechScores}
              isListeningSTT={isListeningSTT}
              setIsListeningSTT={setIsListeningSTT}
              startRecording={startRecording}
              stopRecording={stopRecording}
              API={API}
              isReview={isPreview ? false : isReview}
              showAnswers={showAnswers}
            />
          )}
        </div>
      ) : (
        /* 6. Giao diện làm các câu hỏi bài tập ôn luyện thường */
        <KhungBaiTapThuong
          exercise={exercise}
          questionsList={questionsList}
          submitted={submitted}
          isOverdue={false}
          isExam={isExam}
          showAnswers={showAnswers}
          examStarted={examStarted}
          isReview={isReview}
          isModal={isModal}
          currentPageIdx={currentPageIdx}
          setCurrentPageIdx={setCurrentPageIdx}
          mcAnswers={mcAnswers}
          setMcAnswers={setMcAnswers}
          essayAnswers={essayAnswers}
          setEssayAnswers={setEssayAnswers}
          fillInAnswers={fillInAnswers}
          setFillInAnswers={setFillInAnswers}
          orderedWords={orderedWords}
          setOrderedWords={setOrderedWords}
          shuffledWords={shuffledWords}
          setShuffledWords={setShuffledWords}
          shuffledSentences={shuffledSentences}
          setShuffledSentences={setShuffledSentences}
          recordedUrls={recorder.recordedUrls}
          setRecordedUrls={recorder.setRecordedUrls}
          recordedBlobs={recordedBlobs}
          setRecordedBlobs={setRecordedBlobs}
          isRecording={isRecording}
          setIsRecording={setIsRecording}
          recordSeconds={recordSeconds}
          setRecordSeconds={setRecordSeconds}
          spokenTexts={recorder.spokenTexts}
          setSpokenTexts={recorder.setSpokenTexts}
          speechScores={recorder.speechScores}
          setSpeechScores={recorder.setSpeechScores}
          isListeningSTT={isListeningSTT}
          setIsListeningSTT={setIsListeningSTT}
          handleSubmit={handleWrappedSubmit}
        />
      )}

      {/* 7. Nút Nộp Bài góc dưới */}
      {!submitted && !isReview && !isPreview && (
        <button
          onClick={() => handleWrappedSubmit({
            mcAnswers, essayAnswers, recordedBlobs, recordedUrls: recorder.recordedUrls,
            fillInAnswers, spokenTexts: recorder.spokenTexts, speechScores: recorder.speechScores,
            orderedWords, shuffledSentences
          })}
          disabled={submitting || (isExam && !examStarted) || (isExam && examEnded)}
          className="ad-submit-btn"
        >
          {submitting ? "SUBMITTING..." : "SUBMIT ASSIGNMENT"}
        </button>
      )}
    </div>
  );
}

export default ChiTietBaiTap;
