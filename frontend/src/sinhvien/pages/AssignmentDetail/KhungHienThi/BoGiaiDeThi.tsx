import React from "react";
import { FiFileText, FiMic } from "react-icons/fi";
import { CustomAudioPlayer } from "../../../components/CustomAudioPlayer/CustomAudioPlayer";
import { CauHoiTracNghiem } from "../DangBai/CauHoiTracNghiem";
import { NoiTu } from "../DangBai/NoiTu";
import { NgheChonAnh } from "../DangBai/NgheChonAnh";
import { NgheChepChinhTa } from "../DangBai/NgheChepChinhTa";
import { NgheDienTu } from "../DangBai/NgheDienTu";
import { PhatAmTuDong } from "../DangBai/PhatAmTuDong";
import { SapXepTu } from "../DangBai/SapXepTu";
import { SapXepCau } from "../DangBai/SapXepCau";
import { TimLoiSai } from "../DangBai/TimLoiSai";

interface BoGiaiDeThiProps {
  exercise: any;
  parsedContent: any;
  submitted: boolean;
  examStarted: boolean;
  examEnded: boolean;
  activeSectionIdx: number;
  setActiveSectionIdx: (idx: number) => void;
  mcAnswers: Record<string | number, string>;
  setMcAnswers: React.Dispatch<React.SetStateAction<Record<string | number, string>>>;
  essayAnswers: Record<string | number, string>;
  setEssayAnswers: React.Dispatch<React.SetStateAction<Record<string | number, string>>>;
  fillInAnswers: Record<string | number, string[]>;
  setFillInAnswers: React.Dispatch<React.SetStateAction<Record<string | number, string[]>>>;
  shuffledSentences: Record<string | number, string[]>;
  setShuffledSentences: React.Dispatch<React.SetStateAction<Record<string | number, string[]>>>;
  shuffledWords: Record<string | number, string[]>;
  setShuffledWords: React.Dispatch<React.SetStateAction<Record<string | number, string[]>>>;
  orderedWords: Record<string | number, string[]>;
  setOrderedWords: React.Dispatch<React.SetStateAction<Record<string | number, string[]>>>;
  recordedUrls: Record<string | number, string>;
  isRecording: Record<string | number, boolean>;
  recordSeconds: Record<string | number, number>;
  spokenTexts: Record<string | number, string>;
  setSpokenTexts: React.Dispatch<React.SetStateAction<Record<string | number, string>>>;
  speechScores: Record<string | number, number | null>;
  setSpeechScores: React.Dispatch<React.SetStateAction<Record<string | number, number | null>>>;
  isListeningSTT: Record<string | number, boolean>;
  setIsListeningSTT: React.Dispatch<React.SetStateAction<Record<string | number, boolean>>>;
  startRecording: (idx: number | string) => Promise<void>;
  stopRecording: (idx: number | string) => void;
  API: string;
  isReview?: boolean;
}

const renderReadingPassage = (text: string) => {
  if (!text) return null;
  const blocks = text.split(/\n\s*\n/);
  return (
    <>
      {blocks.map((block, idx) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        const isFirstBlock = idx === 0;
        const isInstruction = trimmed.toLowerCase().startsWith("in this section") || 
                              trimmed.toLowerCase().startsWith("directions:") ||
                              trimmed.toLowerCase().startsWith("direction:");

        if (isFirstBlock && !isInstruction && (trimmed.length < 150 || !trimmed.endsWith("."))) {
          return (
            <h4 key={idx} className="flic-asgn-passage-title" style={{ fontWeight: 800 }}>
              {trimmed}
            </h4>
          );
        }

        if (isInstruction) {
          return (
            <div key={idx} className="flic-asgn-passage-directions">
              {trimmed}
            </div>
          );
        }

        return (
          <p key={idx} className="flic-asgn-passage-paragraph">
            {trimmed}
          </p>
        );
      })}
    </>
  );
};

export const BoGiaiDeThi: React.FC<BoGiaiDeThiProps> = ({
  exercise,
  parsedContent,
  submitted,
  examStarted,
  examEnded,
  activeSectionIdx,
  setActiveSectionIdx,
  mcAnswers,
  setMcAnswers,
  essayAnswers,
  setEssayAnswers,
  fillInAnswers,
  setFillInAnswers,
  shuffledSentences,
  setShuffledSentences,
  shuffledWords,
  setShuffledWords,
  orderedWords,
  setOrderedWords,
  recordedUrls,
  isRecording,
  recordSeconds,
  spokenTexts,
  setSpokenTexts,
  speechScores,
  setSpeechScores,
  isListeningSTT,
  setIsListeningSTT,
  startRecording,
  stopRecording,
  API,
  isReview = false,
}) => {

  const renderSectionQuestionBlock = (q: any, qIdx: number, sIdx: number, secType: string) => {
    const key = `${sIdx}_${qIdx}`;

    if (secType === "Nối từ") {
      if (q.vocabPairs && q.vocabPairs.length > 0) {
        return (
          <NoiTu
            key={qIdx}
            q={q}
            qIdx={key}
            mcAnswers={mcAnswers}
            setMcAnswers={setMcAnswers}
            submitted={submitted}
          />
        );
      }
      return (
        <div key={qIdx} style={{ marginBottom: 20 }}>
          {q.imageUrl && (
            <img
              src={`${API}${q.imageUrl}`}
              alt="Question visual cue"
              style={{ maxHeight: 200, display: "block", marginBottom: 12, borderRadius: 8 }}
            />
          )}
          <CauHoiTracNghiem
            q={q}
            qIdx={qIdx}
            subIdxPrefix={`${sIdx}`}
            mcAnswers={mcAnswers}
            setMcAnswers={setMcAnswers}
            submitted={submitted}
            isOverdue={false}
            isExam={true}
            examStarted={examStarted}
            isReview={isReview}
          />
        </div>
      );
    }

    if (secType === "Nghe audio trắc nghiệm" || secType === "Trắc nghiệm") {
      return (
        <div key={qIdx} style={{ marginBottom: 20 }}>
          {q.audioUrl && (
            <div style={{ marginBottom: 12 }}>
              <CustomAudioPlayer src={`${API}${q.audioUrl}`} />
            </div>
          )}
          {q.imageUrl && (
            <img
              src={`${API}${q.imageUrl}`}
              alt="Question visual cue"
              style={{ maxHeight: 200, display: "block", marginBottom: 12, borderRadius: 8 }}
            />
          )}
          <CauHoiTracNghiem
            q={q}
            qIdx={qIdx}
            subIdxPrefix={`${sIdx}`}
            mcAnswers={mcAnswers}
            setMcAnswers={setMcAnswers}
            submitted={submitted}
            isOverdue={false}
            isExam={true}
            examStarted={examStarted}
            isReview={isReview}
          />
        </div>
      );
    }

    if (secType === "Hình ảnh chọn đáp án") {
      return (
        <div key={qIdx} style={{ marginBottom: 20 }}>
          <NgheChonAnh
            q={q}
            qIdx={qIdx}
            subIdxPrefix={`${sIdx}`}
            exercise={exercise}
            hideAudio={false}
            mcAnswers={mcAnswers}
            setMcAnswers={setMcAnswers}
            submitted={submitted}
            isOverdue={false}
            isExam={true}
            examStarted={examStarted}
            API={API}
            isReview={isReview}
          />
        </div>
      );
    }

    if (secType === "Tìm lỗi sai") {
      return (
        <div key={qIdx} style={{ marginBottom: 20 }}>
          <TimLoiSai
            q={q}
            qIdx={qIdx}
            subIdxPrefix={`${sIdx}`}
            mcAnswers={mcAnswers}
            setMcAnswers={setMcAnswers}
            essayAnswers={essayAnswers}
            setEssayAnswers={setEssayAnswers}
            submitted={submitted}
            isOverdue={!examStarted || examEnded}
            isExam={true}
            examStarted={examStarted}
          />
        </div>
      );
    }

    if (secType === "Nghe chép chính tả") {
      return (
        <div key={qIdx} style={{ marginBottom: 20 }}>
          <NgheChepChinhTa
            q={q}
            qIdx={key}
            exercise={exercise}
            essayAnswers={essayAnswers}
            setEssayAnswers={setEssayAnswers}
            submitted={submitted}
            isOverdue={!examStarted || examEnded}
            isExam={true}
            examStarted={examStarted}
            API={API}
          />
        </div>
      );
    }

    if (secType === "Điền từ vào đoạn văn") {
      return (
        <div key={qIdx} style={{ marginBottom: 20 }}>
          <NgheDienTu
            q={q}
            qIdx={key}
            fillInAnswers={fillInAnswers}
            setFillInAnswers={setFillInAnswers}
            submitted={submitted}
            isOverdue={!examStarted || examEnded}
            API={API}
          />
        </div>
      );
    }

    if (secType === "Luyện phát âm (check phát âm tự động)") {
      return (
        <div key={qIdx} style={{ marginBottom: 20 }}>
          <PhatAmTuDong
            q={q}
            qIdx={key}
            speechScores={speechScores}
            setSpeechScores={setSpeechScores}
            spokenTexts={spokenTexts}
            setSpokenTexts={setSpokenTexts}
            isListeningSTT={isListeningSTT}
            setIsListeningSTT={setIsListeningSTT}
            submitted={submitted}
            isOverdue={!examStarted || examEnded}
          />
        </div>
      );
    }

    if (secType === "Sắp xếp từ thành câu") {
      return (
        <div key={qIdx} style={{ marginBottom: 20 }}>
          <SapXepTu
            q={q}
            qIdx={key}
            shuffledWords={shuffledWords}
            setShuffledWords={setShuffledWords}
            orderedWords={orderedWords}
            setOrderedWords={setOrderedWords}
            submitted={submitted}
          />
        </div>
      );
    }

    if (secType === "Sắp xếp câu thành đoạn văn") {
      return (
        <div key={qIdx} style={{ marginBottom: 20 }}>
          <SapXepCau
            q={q}
            qIdx={key}
            shuffledSentences={shuffledSentences}
            setShuffledSentences={setShuffledSentences}
            submitted={submitted}
            isOverdue={!examStarted || examEnded}
          />
        </div>
      );
    }

    if (secType === "Trắc nghiệm đọc hiểu (chia đôi màn hình)") {
      return (
        <CauHoiTracNghiem
          q={q}
          qIdx={qIdx}
          subIdxPrefix={`${sIdx}`}
          mcAnswers={mcAnswers}
          setMcAnswers={setMcAnswers}
          submitted={submitted}
          isOverdue={false}
          isExam={true}
          examStarted={examStarted}
        />
      );
    }

    return null;
  };

  return (
    <div>
      {/* Các tab phân phần thi */}
      <div className="ad-exam-tabs">
        {parsedContent.sections?.map((sec: any, sIdx: number) => (
          <button
            key={sIdx}
            onClick={() => setActiveSectionIdx(sIdx)}
            className={`ad-exam-tab ${activeSectionIdx === sIdx ? "active" : ""}`}
          >
            {sec.title}
          </button>
        ))}
      </div>

      {/* Hiển thị phần thi được chọn */}
      {parsedContent.sections?.map((sec: any, sIdx: number) => {
        if (activeSectionIdx !== sIdx) return null;

        return (
          <div
            key={sIdx}
            className="ad-section"
            style={{ background: "#fff", border: "1px solid #e0d4c3", padding: 20, borderRadius: 12 }}
          >
            <h3 style={{ color: "#F95800", marginTop: 0, marginBottom: 15 }}>{sec.title}</h3>

            {sec.type === "Viết đoạn văn ngắn" && (
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

            {sec.type === "Nói theo chủ đề (ghi âm nộp GV)" && (
              <div>
                <div className="ad-speaking-prompt-box">
                  <p className="ad-speaking-prompt-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <FiFileText /> Topic Prompt:
                  </p>
                  <p className="ad-speaking-prompt-text">{sec.content}</p>
                </div>
                {sec.imageUrl && (
                  <img
                    src={`${API}${sec.imageUrl}`}
                    alt="Topic hint"
                    style={{ maxHeight: 200, display: "block", marginBottom: 12, borderRadius: 8 }}
                  />
                )}

                {!submitted ? (
                  <div className="ad-recorder-dashed-box">
                    {isRecording[sIdx] ? (
                      <div className="ad-recording-status">
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ display: "inline-block", width: "8px", height: "8px", background: "#dc2626", borderRadius: "50%", animation: "pulse 1.5s infinite" }}></span>
                          Recording: {recordSeconds[sIdx] || 0}s
                        </span>
                        <button onClick={() => stopRecording(sIdx)} className="ad-record-stop-btn">
                          Stop
                        </button>
                      </div>
                    ) : (
                      <button
                        disabled={!examStarted || examEnded}
                        onClick={() => startRecording(sIdx)}
                        className="ad-record-start-btn"
                        style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                      >
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
                  recordedUrls[sIdx] && (
                    <div style={{ marginBottom: 12 }}>
                      <CustomAudioPlayer src={`${API}${recordedUrls[sIdx]}`} />
                    </div>
                  )
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

            {sec.type === "Trắc nghiệm đọc hiểu (chia đôi màn hình)" && (
              <div className="ad-reading-split-container">
                <div className="ad-reading-passage-panel">
                  <div className="ad-passage-text">
                    {renderReadingPassage(sec.content)}
                  </div>
                </div>
                <div className="ad-reading-questions-panel">
                  {sec.questions?.map((q: any, qIdx: number) => (
                    <div key={qIdx} style={{ marginBottom: 20 }}>
                      {renderSectionQuestionBlock(q, qIdx, sIdx, sec.type)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {sec.type !== "Viết đoạn văn ngắn" && sec.type !== "Nói theo chủ đề (ghi âm nộp GV)" && sec.type !== "Trắc nghiệm đọc hiểu (chia đôi màn hình)" && (
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
  );
};
