/**
 * CHỨC NĂNG CỦA FILE:
 * Component này là khung bao ngoài dành cho các bài tập thường (Regular exercises - không phải đề thi).
 * Nó quản lý phân trang câu hỏi (pagination), thanh tiến trình làm bài, nút Tiếp / Quay lại,
 * hiển thị tập tin âm thanh chung (General Audio Player) và lặp qua các câu hỏi để hiển thị.
 */

import React, { useMemo } from "react";
import { FiVolume2 } from "react-icons/fi";
import { CustomAudioPlayer } from "../../../components/CustomAudioPlayer/CustomAudioPlayer";
import { BoGiaoDienCauHoi } from "./BoGiaoDienCauHoi";

const API = "http://14.225.192.252:5000";

interface KhungBaiTapThuongProps {
  exercise: any;
  questionsList: any[];
  submitted: boolean;
  isOverdue: boolean;
  isExam: boolean;
  examStarted: boolean;
  isReview: boolean;
  isModal: boolean;
  currentPageIdx: number;
  setCurrentPageIdx: React.Dispatch<React.SetStateAction<number>>;
  
  // States of questions answers
  mcAnswers: Record<string | number, string>;
  setMcAnswers: React.Dispatch<React.SetStateAction<Record<string | number, string>>>;
  essayAnswers: Record<string | number, string>;
  setEssayAnswers: React.Dispatch<React.SetStateAction<Record<string | number, string>>>;
  fillInAnswers: Record<string | number, string[]>;
  setFillInAnswers: React.Dispatch<React.SetStateAction<Record<string | number, string[]>>>;
  orderedWords: Record<string | number, string[]>;
  setOrderedWords: React.Dispatch<React.SetStateAction<Record<string | number, string[]>>>;
  shuffledWords: Record<string | number, string[]>;
  setShuffledWords: React.Dispatch<React.SetStateAction<Record<string | number, string[]>>>;
  shuffledSentences: Record<string | number, string[]>;
  setShuffledSentences: React.Dispatch<React.SetStateAction<Record<string | number, string[]>>>;
  recordedUrls: Record<string | number, string>;
  setRecordedUrls: React.Dispatch<React.SetStateAction<Record<string | number, string>>>;
  recordedBlobs: Record<string | number, Blob>;
  setRecordedBlobs: React.Dispatch<React.SetStateAction<Record<string | number, Blob>>>;
  isRecording: Record<string | number, boolean>;
  setIsRecording: React.Dispatch<React.SetStateAction<Record<string | number, boolean>>>;
  recordSeconds: Record<string | number, number>;
  setRecordSeconds: React.Dispatch<React.SetStateAction<Record<string | number, number>>>;
  spokenTexts: Record<string | number, string>;
  setSpokenTexts: React.Dispatch<React.SetStateAction<Record<string | number, string>>>;
  speechScores: Record<string | number, number | null>;
  setSpeechScores: React.Dispatch<React.SetStateAction<Record<string | number, number | null>>>;
  isListeningSTT: Record<string | number, boolean>;
  setIsListeningSTT: React.Dispatch<React.SetStateAction<Record<string | number, boolean>>>;

  handleSubmit: (answers: any) => void;
}

export const KhungBaiTapThuong: React.FC<KhungBaiTapThuongProps> = ({
  exercise,
  questionsList,
  submitted,
  isOverdue,
  isExam,
  examStarted,
  isReview,
  isModal,
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
  recordedBlobs,
  setRecordedBlobs,
  isRecording,
  setIsRecording,
  recordSeconds,
  setRecordSeconds,
  spokenTexts,
  setSpokenTexts,
  speechScores,
  setSpeechScores,
  isListeningSTT,
  setIsListeningSTT,
  handleSubmit
}) => {

  const questionPages = useMemo(() => {
    if (questionsList.length === 0) return [];
    return [questionsList];
  }, [questionsList]);

  return (
    <div>
      {/* 1. Tập tin audio chung cho cả bài nếu là nghe trắc nghiệm */}
      {exercise?.AudioUrl && (exercise?.Type || "").toLowerCase() === "Nghe audio trắc nghiệm" && (
        <div className="ad-audio-card">
          <h4><FiVolume2 style={{ color: "#f95800", fontSize: "1.2rem" }} /> General audio file for the entire assignment:</h4>
          <CustomAudioPlayer src={`${API}${exercise.AudioUrl}`} className="ad-audio-player" />
        </div>
      )}

      {/* 2. Thanh hiển thị phân trang bài tập */}
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

      {/* 3. Hiển thị danh sách câu hỏi trong trang hiện tại */}
      {questionPages.map((page, pIdx) => {
        if (pIdx !== currentPageIdx) return null;

        const alreadyHasGlobalAudio = exercise?.AudioUrl && (exercise?.Type || "").toLowerCase() === "Nghe audio trắc nghiệm";
        const isFindMistakes = (exercise?.Type || "").toLowerCase() === "Tìm lỗi sai";

        return (
          <div key={pIdx} className={`ad-page-container ${isModal ? "ad-page-readonly" : ""}`}>
            {isFindMistakes ? (
              <div className="ad-section" style={{ background: "#fff", border: "1px solid #e0d4c3", padding: "24px 28px", borderRadius: 12, marginBottom: 20 }}>
                <div style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: "15px", marginBottom: "20px" }}>
                  <h4 style={{ margin: 0, color: "#1e3a8a", fontSize: "18px", fontWeight: 700 }}>
                    Find and correct the mistake in the following sentences:
                  </h4>
                </div>
                {page.map((q, idx) => {
                  const originalIdx = questionsList.indexOf(q);
                  return (
                    <div 
                      key={originalIdx} 
                      style={{ 
                        borderBottom: idx < page.length - 1 ? "1px dashed #cbd5e1" : "none", 
                        paddingBottom: idx < page.length - 1 ? "24px" : "0", 
                        marginBottom: idx < page.length - 1 ? "24px" : "0" 
                      }}
                    >
                      <BoGiaoDienCauHoi
                        q={q}
                        qIdx={originalIdx}
                        exercise={exercise}
                        submitted={submitted}
                        isOverdue={isOverdue}
                        isExam={isExam}
                        examStarted={examStarted}
                        isReview={isReview}
                        hideAudio={alreadyHasGlobalAudio}
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
                        recordedUrls={recordedUrls}
                        setRecordedUrls={setRecordedUrls}
                        recordedBlobs={recordedBlobs}
                        setRecordedBlobs={setRecordedBlobs}
                        isRecording={isRecording}
                        setIsRecording={setIsRecording}
                        recordSeconds={recordSeconds}
                        setRecordSeconds={setRecordSeconds}
                        spokenTexts={spokenTexts}
                        setSpokenTexts={setSpokenTexts}
                        speechScores={speechScores}
                        setSpeechScores={setSpeechScores}
                        isListeningSTT={isListeningSTT}
                        setIsListeningSTT={setIsListeningSTT}
                        questionsList={questionsList}
                        handleSubmit={handleSubmit}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              page.map((q) => {
                const originalIdx = questionsList.indexOf(q);
                return (
                  <div key={originalIdx} className="ad-section" style={{ background: "#fff", border: "1px solid #e0d4c3", padding: 20, borderRadius: 12, marginBottom: 20 }}>
                    <BoGiaoDienCauHoi
                      q={q}
                      qIdx={originalIdx}
                      exercise={exercise}
                      submitted={submitted}
                      isOverdue={isOverdue}
                      isExam={isExam}
                      examStarted={examStarted}
                      isReview={isReview}
                      hideAudio={alreadyHasGlobalAudio}
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
                      recordedUrls={recordedUrls}
                      setRecordedUrls={setRecordedUrls}
                      recordedBlobs={recordedBlobs}
                      setRecordedBlobs={setRecordedBlobs}
                      isRecording={isRecording}
                      setIsRecording={setIsRecording}
                      recordSeconds={recordSeconds}
                      setRecordSeconds={setRecordSeconds}
                      spokenTexts={spokenTexts}
                      setSpokenTexts={setSpokenTexts}
                      speechScores={speechScores}
                      setSpeechScores={setSpeechScores}
                      isListeningSTT={isListeningSTT}
                      setIsListeningSTT={setIsListeningSTT}
                      questionsList={questionsList}
                      handleSubmit={handleSubmit}
                    />
                  </div>
                );
              })
            )}
          </div>
        );
      })}

      {/* 4. Các nút điều chuyển trang */}
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
  );
};
