/**
 * CHỨC NĂNG CỦA FILE:
 * Component này đóng vai trò là "Trình điều phối hiển thị câu hỏi" (Dispatcher/Router cho UI).
 * Dựa vào dạng bài (questionType) lấy từ CSDL (như "Nghe audio trắc nghiệm", "Nối từ", "Luyện phát âm"...),
 * nó sẽ quyết định import và render đúng giao diện con tương ứng (ví dụ: NoiTu, NgheChepChinhTa, PhatAmTuDong...).
 */

import React from "react";
import { FiBookOpen, FiList } from "react-icons/fi";
import { CustomAudioPlayer } from "../../../components/CustomAudioPlayer/CustomAudioPlayer";
import { CauHoiTracNghiem } from "../DangBai/CauHoiTracNghiem";
import { NgheChonAnh } from "../DangBai/NgheChonAnh";
import { NgheChepChinhTa } from "../DangBai/NgheChepChinhTa";
import { NgheDienTu } from "../DangBai/NgheDienTu";
import { PhatAmTuDong } from "../DangBai/PhatAmTuDong";
import { NoiTheoChuDe } from "../DangBai/NoiTheoChuDe";
import { SapXepTu } from "../DangBai/SapXepTu";
import { SapXepCau } from "../DangBai/SapXepCau";
import { VietDoanVan } from "../DangBai/VietDoanVan";
import { TimLoiSai } from "../DangBai/TimLoiSai";
import { NoiTu } from "../DangBai/NoiTu";

const API = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.startsWith("192.168.") || window.location.hostname.startsWith("172.") || window.location.hostname.startsWith("10.") ? "http://" + window.location.hostname + ":5004" : "http://14.225.192.252:5004") + "";

interface BoGiaoDienCauHoiProps {
  q: any;
  qIdx: number;
  exercise: any;
  submitted: boolean;
  isOverdue: boolean;
  isExam: boolean;
  examStarted: boolean;
  isReview: boolean;
  hideAudio?: boolean;
  // State variables and setters passed from parent
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
  
  questionsList: any[];
  handleSubmit: (answers: any) => void;
  showAnswers?: boolean;
}

export const BoGiaoDienCauHoi: React.FC<BoGiaoDienCauHoiProps> = ({
  q,
  qIdx,
  exercise,
  submitted,
  isOverdue,
  isExam,
  examStarted,
  isReview,
  hideAudio = false,
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
  questionsList,
  handleSubmit,
  showAnswers = false
}) => {
  const questionType = exercise?.Type || "";
  const hasPrompt = q.prompt && q.prompt.trim() !== "" && q.prompt.trim() !== "<p><br></p>";

  const renderQuestionBody = () => {

  const getGlobalSubIdx = (parentIdx: number, subIdx: number) => {
    let count = 0;
    for (let i = 0; i < parentIdx; i++) {
      const parentQ = questionsList[i];
      if (parentQ.subQuestions && parentQ.subQuestions.length > 0) {
        count += parentQ.subQuestions.length;
      } else {
        count += 1;
      }
    }
    return count + subIdx + 1;
  };

  const renderMCQBlock = (subQ: any, subQIdx: number, subIdxPrefix?: string, displayIdx?: number) => {
    return (
      <CauHoiTracNghiem
        q={subQ}
        qIdx={subQIdx}
        subIdxPrefix={subIdxPrefix}
        mcAnswers={mcAnswers}
        setMcAnswers={setMcAnswers}
        submitted={submitted}
        isOverdue={isOverdue}
        isExam={isExam}
        examStarted={examStarted}
        isReview={isReview}
        displayIdx={displayIdx}
        showAnswers={showAnswers}
      />
    );
  };

  const renderReadingPassage = (text: string) => {
    const blocks = text.split(/\n\s*\n/);
    return (
      <>
        {blocks.map((block, idx) => {
          const trimmed = block.trim();
          if (!trimmed) return null;
          const isFirstBlock = idx === 0;
          const isInstruction = trimmed.toLowerCase().startsWith("in this section") || 
                              trimmed.toLowerCase().startsWith("direction") ||
                              trimmed.toLowerCase().startsWith("read the passage");
          return (
            <p 
              key={idx} 
              style={{
                fontStyle: isInstruction ? "italic" : "normal",
                fontWeight: (isFirstBlock || isInstruction) ? 600 : 400,
                color: isInstruction ? "#475569" : "#1e293b",
                marginBottom: "16px",
                lineHeight: 1.7,
                fontSize: "15px"
              }}
            >
              {trimmed}
            </p>
          );
        })}
      </>
    );
  };

  // Dispatch rendering to corresponding component based on questionType
  if (questionType === "Nối từ") {
    if (q.vocabPairs && q.vocabPairs.length > 0) {
      return (
        <NoiTu
          q={q}
          qIdx={qIdx}
          mcAnswers={mcAnswers}
          setMcAnswers={setMcAnswers}
          submitted={submitted}
          onAutoSubmit={() => handleSubmit({
            mcAnswers, essayAnswers, recordedBlobs, recordedUrls,
            fillInAnswers, spokenTexts, speechScores, orderedWords, shuffledSentences
          })}
        />
      );
    }
    return (
      <div>
        {q.imageUrl && <img src={`${API}${q.imageUrl}`} alt="Question visual cue" style={{ maxHeight: 200, display: "block", marginBottom: 12, borderRadius: 8 }} />}
        {renderMCQBlock(q, qIdx, undefined, getGlobalSubIdx(qIdx, 0))}
      </div>
    );
  }

  if (questionType === "Nghe audio trắc nghiệm" || questionType === "Trắc nghiệm" || questionType === "Tổng hợp") {
    const isFlatMC = questionType === "Hình ảnh chọn đáp án" || questionType === "Trắc nghiệm";
    const hasSubQuestions = !isFlatMC && q.subQuestions && q.subQuestions.length > 0;
    return (
      <div>
        {q.audioUrl && !hideAudio && !(questionType === "Nghe audio trắc nghiệm" && exercise?.AudioUrl) && (
          <div style={{ marginBottom: 12 }}>
            <CustomAudioPlayer src={`${API}${q.audioUrl}`} />
          </div>
        )}
        {q.imageUrl && <img src={`${API}${q.imageUrl}`} alt="Question visual cue" style={{ maxHeight: 200, display: "block", marginBottom: 12, borderRadius: 8 }} />}
        {hasSubQuestions ? (
          q.subQuestions.map((sub: any, subIdx: number) => (
            <div key={subIdx} style={{ marginTop: subIdx > 0 ? 20 : 0 }}>
              {renderMCQBlock(sub, subIdx, String(qIdx), getGlobalSubIdx(qIdx, subIdx))}
            </div>
          ))
        ) : (
          renderMCQBlock(q, qIdx, undefined, getGlobalSubIdx(qIdx, 0))
        )}
      </div>
    );
  }

  if (questionType === "Hình ảnh chọn đáp án") {
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
        isReview={isReview}
      />
    );
  }

  if (questionType === "Nghe chép chính tả") {
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
        isReview={isReview}
      />
    );
  }

  if (questionType === "Điền từ vào đoạn văn") {
    return (
      <NgheDienTu
        q={q}
        qIdx={qIdx}
        fillInAnswers={fillInAnswers}
        setFillInAnswers={setFillInAnswers}
        submitted={submitted}
        isOverdue={isOverdue}
        API={API}
        isReview={isReview}
      />
    );
  }

  if (questionType === "Luyện phát âm (check phát âm tự động)") {
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
        isReview={isReview}
      />
    );
  }

  if (questionType === "Nói theo chủ đề (ghi âm nộp GV)") {
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

  if (questionType === "Sắp xếp từ thành câu") {
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

  if (questionType === "Sắp xếp câu thành đoạn văn") {
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

  if (questionType === "Viết đoạn văn ngắn") {
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

  if (questionType === "Tìm lỗi sai") {
    return (
      <TimLoiSai
        q={q}
        qIdx={qIdx}
        mcAnswers={mcAnswers}
        setMcAnswers={setMcAnswers}
        essayAnswers={essayAnswers}
        setEssayAnswers={setEssayAnswers}
        submitted={submitted}
        isOverdue={isOverdue}
        isExam={isExam}
        examStarted={examStarted}
        isReview={isReview}
      />
    );
  }

  if (questionType === "Trắc nghiệm đọc hiểu (chia đôi màn hình)") {
    return (
      <div className="flic-asgn-reading-split-container">
        <div className="flic-asgn-reading-passage-panel">
          <h5 className="flic-asgn-panel-title">
            <FiBookOpen /> Reading Passage
          </h5>
          <div className="flic-asgn-passage-text">
            {renderReadingPassage(q.text)}
          </div>
        </div>
        <div className="flic-asgn-reading-questions-panel">
          <h5 className="flic-asgn-panel-title">
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
              isReview={isReview}
              displayIdx={getGlobalSubIdx(qIdx, subIdx)}
              showAnswers={showAnswers}
            />
          ))}
        </div>
      </div>
    );
  }

    // Mặc định phản hồi tự luận nếu dạng bài chưa được khai báo
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
  };

  return (
    <>
      {hasPrompt && (
        <div 
          className="flic-asgn-prompt-box" 
          style={{ 
            background: "#f8fafc", 
            borderLeft: "4px solid #f95800", 
            padding: "12px 16px", 
            borderRadius: "6px", 
            marginBottom: "16px",
            fontSize: "14px",
            color: "#334155",
            lineHeight: 1.6
          }} 
          dangerouslySetInnerHTML={{ __html: q.prompt }} 
        />
      )}
      {renderQuestionBody()}
    </>
  );
};
