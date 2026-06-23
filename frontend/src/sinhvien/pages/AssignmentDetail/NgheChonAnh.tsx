import React from "react";
import { CustomAudioPlayer } from "../../components/CustomAudioPlayer/CustomAudioPlayer";
import { CauHoiTracNghiem } from "./CauHoiTracNghiem";

interface NgheChonAnhProps {
  q: any;
  qIdx: number;
  subIdxPrefix?: string;
  exercise: any;
  hideAudio: boolean;
  mcAnswers: Record<string | number, string>;
  setMcAnswers: React.Dispatch<React.SetStateAction<Record<string | number, string>>>;
  submitted: boolean;
  isOverdue: boolean;
  isExam: boolean;
  examStarted: boolean;
  API: string;
}

export const NgheChonAnh: React.FC<NgheChonAnhProps> = ({
  q,
  qIdx,
  subIdxPrefix,
  exercise,
  hideAudio,
  mcAnswers,
  setMcAnswers,
  submitted,
  isOverdue,
  isExam,
  examStarted,
  API,
}) => {
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
          {img && (
            <img
              src={`${API}${img}`}
              alt="Listening image visual"
              className="ad-listening-image-img"
            />
          )}
        </div>
        <div className="ad-listening-image-right">
          <CauHoiTracNghiem
            q={{ question: "", correct: q.correct || "A", answers: ["A", "B", "C", "D"] }}
            qIdx={qIdx}
            subIdxPrefix={subIdxPrefix}
            mcAnswers={mcAnswers}
            setMcAnswers={setMcAnswers}
            submitted={submitted}
            isOverdue={isOverdue}
            isExam={isExam}
            examStarted={examStarted}
          />
        </div>
      </div>
    </div>
  );
};
