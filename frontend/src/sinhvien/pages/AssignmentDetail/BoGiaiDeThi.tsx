import React from "react";
import { FiFileText, FiMic } from "react-icons/fi";
import { CustomAudioPlayer } from "../../components/CustomAudioPlayer/CustomAudioPlayer";
import { CauHoiTracNghiem } from "./CauHoiTracNghiem";
import { NgheChonAnh } from "./NgheChonAnh";
import { NgheChepChinhTa } from "./NgheChepChinhTa";
import { NgheDienTu } from "./NgheDienTu";
import { PhatAmTuDong } from "./PhatAmTuDong";
import { SapXepTu } from "./SapXepTu";
import { SapXepCau } from "./SapXepCau";

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
}

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
}) => {

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
          />
        </div>
      );
    }

    if (secType === "listening-image") {
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
          />
        </div>
      );
    }

    if (secType === "listening-dictation") {
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

    if (secType === "listening-fill-in") {
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

    if (secType === "speaking-pronounce") {
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

    if (secType === "writing-order-words") {
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

    if (secType === "writing-order-sentences") {
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

    if (secType === "reading-split") {
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
            {sec.title} ({sec.type.replace("-", " ")})
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
                        <span>🔴 Recording: {recordSeconds[sIdx] || 0}s </span>
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

            {sec.type === "reading-split" && (
              <div className="ad-reading-split-container">
                <div className="ad-reading-passage-panel">
                  <p className="ad-passage-text">{sec.content}</p>
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
  );
};
