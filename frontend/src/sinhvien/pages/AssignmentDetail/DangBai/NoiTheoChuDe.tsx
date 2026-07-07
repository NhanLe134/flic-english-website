import React, { useRef, useState, useEffect } from "react";
import { FiFileText, FiMic, FiSquare, FiAlertCircle, FiCheck, FiBookOpen } from "react-icons/fi";
import { FaPlay, FaPause } from "react-icons/fa";
import "../KhungHienThi/AssignmentTypes.css";

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

  const [isPlayingLocal, setIsPlayingLocal] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Stop local playback if URL changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlayingLocal(false);
      audioRef.current = null;
    }
  }, [url]);

  const startRecording = async (idx: number | string) => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Trình duyệt chặn truy cập microphone trên kết nối HTTP không bảo mật (IP). Vui lòng sử dụng địa chỉ 'localhost' hoặc kết nối HTTPS bảo mật để sử dụng micro!");
        return;
      }
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
    } catch (err) {
      console.error(err);
      alert("Không thể truy cập microphone. Vui lòng nhấp vào biểu tượng ổ khóa hoặc micro ở bên trái thanh địa chỉ trình duyệt, chọn 'Cho phép (Allow)' cho Microphone, sau đó tải lại trang!");
    }
  };

  const stopRecording = (idx: number | string) => {
    mediaRecorderRef.current?.stop();
    setIsRecording((prev) => ({ ...prev, [idx]: false }));
    clearInterval(timerRef.current);
  };

  const togglePlayback = () => {
    if (!url) return;
    const finalUrl = url.startsWith("blob:") ? url : `${API}${url}`;

    if (!audioRef.current) {
      audioRef.current = new Audio(finalUrl);
      audioRef.current.onended = () => setIsPlayingLocal(false);
    }

    if (isPlayingLocal) {
      audioRef.current.pause();
      setIsPlayingLocal(false);
    } else {
      audioRef.current.play().catch(err => console.error("Playback error:", err));
      setIsPlayingLocal(true);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const remainingSecs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  const getWordCount = (text: string) => {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  };

  return (
    <div className="flic-asgn-speaking-topic-container">
      {/* Exercise info header */}


      {/* Topic Prompt Card */}
      <div className="flic-asgn-speaking-prompt-card">
        <div className="flic-asgn-speaking-prompt-title">
          <FiBookOpen style={{ color: "#F95800", fontSize: "20px" }} />
          <h4>Topic</h4>
        </div>
        <p className="flic-asgn-speaking-prompt-text">
          {q.prompt}
        </p>

        {q.imageUrl && (
          <div className="flic-asgn-speaking-image-wrap">
            <img
              src={q.imageUrl.startsWith("http") || q.imageUrl.startsWith("blob:") ? q.imageUrl : `${API}${q.imageUrl}`}
              alt="Topic hint visual"
              className="flic-asgn-speaking-image"
            />
          </div>
        )}

        {q.explanation && (
          <div className="flic-asgn-speaking-hint">
            <FiAlertCircle className="flic-asgn-speaking-hint-icon" />
            <span>Gợi ý/Hướng dẫn: {q.explanation}</span>
          </div>
        )}
      </div>

      {/* Drafting / Notes Section */}
      <div className="flic-asgn-speaking-notes-section">
        <div className="flic-asgn-speaking-notes-header">
          <label className="flic-asgn-speaking-notes-label">
            <FiFileText />
            <span>Dàn ý bài nói của bạn (Prepare your script/notes)</span>
          </label>
          <span className="flic-asgn-speaking-notes-counter">
            {getWordCount(essayAnswers[qIdx] || "")} từ
          </span>
        </div>
        <textarea
          className="flic-asgn-speaking-notes-textarea"
          disabled={submitted || isOverdue}
          value={essayAnswers[qIdx] || ""}
          onChange={(e) =>
            setEssayAnswers((prev) => ({ ...prev, [qIdx]: e.target.value }))
          }
          placeholder="Nhập dàn ý hoặc các ý chính bạn chuẩn bị nói tại đây..."
          rows={5}
        />
      </div>

      {/* Audio Recording Station */}
      <div className="flic-asgn-speaking-recording-station">
        {isRec ? (
          /* Active Recording State */
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
            <div className="flic-asgn-speaking-active-rec-badge">
              <span className="flic-asgn-speaking-active-rec-dot"></span>
              <span>ĐANG GHI ÂM: {formatTime(secs)}</span>
            </div>

            {/* Audio Waveform Simulation */}
            <div className="flic-asgn-speaking-waveform">
              {[0.4, 0.8, 0.5, 0.9, 0.6, 1.0, 0.7, 0.4, 0.8, 0.5, 0.9, 0.6, 0.7, 0.4].map((scale, i) => (
                <div
                  key={i}
                  className="flic-asgn-speaking-waveform-bar"
                  style={{
                    transform: `scaleY(${scale})`,
                    animationDelay: `${i * 0.1}s`
                  }}
                />
              ))}
            </div>

            <button
              onClick={() => stopRecording(qIdx)}
              className="flic-asgn-speaking-stop-btn"
            >
              <FiSquare /> Dừng ghi âm
            </button>
          </div>
        ) : (
          /* Idle / Playback State */
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
            {!submitted ? (
              <button
                disabled={isOverdue}
                onClick={() => startRecording(qIdx)}
                className="flic-asgn-speaking-start-btn"
              >
                <FiMic size={28} />
              </button>
            ) : null}

            <span className="flic-asgn-speaking-status-text">
              {url
                ? (submitted ? "Bài nói đã nộp ghi âm" : "Nhấn nút trên để ghi âm lại bài nói mới")
                : "Nhấn nút micro để bắt đầu ghi âm câu trả lời"}
            </span>

            {/* Custom Audio Player for recorded voice */}
            {url && (
              <div className="flic-asgn-speaking-player-card">
                <button
                  onClick={togglePlayback}
                  className="flic-asgn-speaking-player-play-btn"
                >
                  {isPlayingLocal ? <FaPause size={14} /> : <FaPlay size={14} style={{ marginLeft: "2px" }} />}
                </button>
                <div className="flic-asgn-speaking-player-info">
                  <div className="flic-asgn-speaking-player-title">Bài nói đã thu âm</div>
                  <div className="flic-asgn-speaking-player-subtitle">Sẵn sàng nộp chấm điểm</div>
                </div>
                <div className="flic-asgn-speaking-player-badge">
                  <FiCheck />
                  <span>Đã lưu</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
