import React, { useRef } from "react";
import { FiFileText, FiMic } from "react-icons/fi";
import { CustomAudioPlayer } from "../../components/CustomAudioPlayer/CustomAudioPlayer";

interface NoiTheoChuDeProps {
  q: any;
  qIdx: number;
  recordedUrls: Record<string | number, string>;
  setRecordedUrls: React.Dispatch<React.SetStateAction<Record<string | number, string>>>;
  recordedBlobs: Record<string | number, Blob>;
  setRecordedBlobs: React.Dispatch<React.SetStateAction<Record<string | number, Blob>>>;
  isRecording: Record<string | number, boolean>;
  setIsRecording: React.Dispatch<React.SetStateAction<Record<string | number, boolean>>>;
  recordSeconds: Record<string | number, number>;
  setRecordSeconds: React.Dispatch<React.SetStateAction<Record<string | number, number>>>;
  essayAnswers: Record<string | number, string>;
  setEssayAnswers: React.Dispatch<React.SetStateAction<Record<string | number, string>>>;
  submitted: boolean;
  isOverdue: boolean;
  API: string;
}

export const NoiTheoChuDe: React.FC<NoiTheoChuDeProps> = ({
  q,
  qIdx,
  recordedUrls,
  setRecordedUrls,
  setRecordedBlobs,
  isRecording,
  setIsRecording,
  recordSeconds,
  setRecordSeconds,
  essayAnswers,
  setEssayAnswers,
  submitted,
  isOverdue,
  API,
}) => {
  const url = recordedUrls[qIdx];
  const isRec = isRecording[qIdx];
  const secs = recordSeconds[qIdx] || 0;

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<any>(null);

  const startRecording = async (idx: number | string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        setRecordedBlobs((prev) => ({ ...prev, [idx]: blob }));
        setRecordedUrls((prev) => ({ ...prev, [idx]: URL.createObjectURL(blob) }));
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRecorder.start();
      setIsRecording((prev) => ({ ...prev, [idx]: true }));
      setRecordSeconds((prev) => ({ ...prev, [idx]: 0 }));
      timerRef.current = setInterval(() => {
        setRecordSeconds((prev) => ({ ...prev, [idx]: (prev[idx] || 0) + 1 }));
      }, 1000);
    } catch {
      alert("Không thể truy cập microphone. Vui lòng cấp quyền!");
    }
  };

  const stopRecording = (idx: number | string) => {
    mediaRecorderRef.current?.stop();
    setIsRecording((prev) => ({ ...prev, [idx]: false }));
    clearInterval(timerRef.current);
  };

  return (
    <div>
      <div className="ad-speaking-prompt-box">
        <p
          className="ad-speaking-prompt-label"
          style={{ display: "flex", alignItems: "center", gap: 6 }}
        >
          <FiFileText /> Topic Prompt:
        </p>
        <p className="ad-speaking-prompt-text">{q.prompt}</p>
      </div>
      {q.imageUrl && (
        <img
          src={`${API}${q.imageUrl}`}
          alt="Topic hint"
          style={{ maxHeight: 200, display: "block", marginBottom: 12, borderRadius: 8 }}
        />
      )}

      {!submitted ? (
        <div className="ad-recorder-dashed-box">
          {isRec ? (
            <div className="ad-recording-status">
              <span>🔴 Recording: {secs}s </span>
              <button onClick={() => stopRecording(qIdx)} className="ad-record-stop-btn">
                Stop
              </button>
            </div>
          ) : (
            <button
              disabled={isOverdue}
              onClick={() => startRecording(qIdx)}
              className="ad-record-start-btn"
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <FiMic /> Start Recording
            </button>
          )}
          {url && (
            <div style={{ marginTop: 15 }}>
              <CustomAudioPlayer src={url} />
            </div>
          )}
        </div>
      ) : (
        url && (
          <div style={{ marginBottom: 12 }}>
            <CustomAudioPlayer src={`${API}${url}`} />
          </div>
        )
      )}

      <textarea
        className="ad-q-input"
        disabled={submitted || isOverdue}
        value={essayAnswers[qIdx] || ""}
        onChange={(e) =>
          setEssayAnswers((prev) => ({ ...prev, [qIdx]: e.target.value }))
        }
        placeholder="Prepare your speech notes here..."
        rows={2}
      />
    </div>
  );
};
