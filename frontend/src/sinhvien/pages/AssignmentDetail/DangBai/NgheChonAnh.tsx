import React from "react";
import { CustomAudioPlayer } from "../../../components/CustomAudioPlayer/CustomAudioPlayer";
import { CauHoiTracNghiem } from "./CauHoiTracNghiem";
import "./NgheChonAnh.css";

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
  isReview?: boolean; // Che do xem lai bài tap da nop
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
  isReview = false,
}) => {
  const img = q.imageUrl || exercise?.FileDinhKem || "";
  const aud = q.audioUrl || exercise?.AudioUrl || "";

  return (
    <div className="asd-listening-image-block">
      {/* 1. Trinh phat am thanh (Audio Player) */}
      {aud && !hideAudio && (
        <div className="asd-listening-image-audio-wrapper">
          <CustomAudioPlayer src={`${API}${aud}`} className="asd-listening-image-audio" />
        </div>
      )}
      
      {/* 2. Than noi dung (Body) chia làm 2 cot Trai - Phai */}
      <div className="asd-listening-image-body">
        {/* Cot ben trai: Hien thi anh minh hoa cau hoi */}
        <div className="asd-listening-image-left">
          {img && (
            <img
              src={`${API}${img}`}
              alt="Listening image visual"
              className="asd-listening-image-img"
            />
          )}
        </div>
        
        {/* Cot ben phai: Hien thi hop cau hoi trac nghiem lua chon (A, B, C, D) */}
        <div className="asd-listening-image-right">
          <CauHoiTracNghiem
            q={{
              question: q.question || "",
              correct: q.correct || "A",
              answers: q.answers && q.answers.some((a: string) => a && a.trim() !== "") ? q.answers : ["A", "B", "C", "D"]
            }}
            qIdx={qIdx}
            subIdxPrefix={subIdxPrefix}
            mcAnswers={mcAnswers}
            setMcAnswers={setMcAnswers}
            submitted={submitted}
            isOverdue={isOverdue}
            isExam={isExam}
            examStarted={examStarted}
            isReview={isReview} // Truyen isReview vao de hien thi to mau dung/sai cua CauHoiTracNghiem
          />
        </div>
      </div>
    </div>
  );
};
