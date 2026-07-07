/**
 * CHỨC NĂNG CỦA FILE:
 * Hook tùy chỉnh này quản lý toàn bộ logic liên quan đến Microphone và Ghi âm:
 * 1. Ghi âm giọng nói (MediaRecorder) cho các bài Nói theo chủ đề hoặc phát âm.
 * 2. Nhận diện giọng nói tiếng Anh (Speech Recognition API) của trình duyệt để chấm điểm tự động.
 */

import { useState, useRef, useEffect } from "react";
import { calcSpeechScore } from "./hoTroBaiTap";

export function useGhiAmVaGiongNoi() {
  const [recordedBlobs, setRecordedBlobs] = useState<Record<string | number, Blob>>({});
  const [recordedUrls, setRecordedUrls] = useState<Record<string | number, string>>({});
  const [isRecording, setIsRecording] = useState<Record<string | number, boolean>>({});
  const [recordSeconds, setRecordSeconds] = useState<Record<string | number, number>>({});

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<any>(null);

  // Web Speech API states
  const [spokenTexts, setSpokenTexts] = useState<Record<string | number, string>>({});
  const [speechScores, setSpeechScores] = useState<Record<string | number, number | null>>({});
  const [isListeningSTT, setIsListeningSTT] = useState<Record<string | number, boolean>>({});
  const recognitionRef = useRef<any>(null);

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
      mediaRecorder.ondataavailable = e => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        setRecordedBlobs(prev => ({ ...prev, [idx]: blob }));
        setRecordedUrls(prev => ({ ...prev, [idx]: URL.createObjectURL(blob) }));
        stream.getTracks().forEach(t => t.stop());
      };
      mediaRecorder.start();
      setIsRecording(prev => ({ ...prev, [idx]: true }));
      setRecordSeconds(prev => ({ ...prev, [idx]: 0 }));
      timerRef.current = setInterval(() => {
        setRecordSeconds(prev => ({ ...prev, [idx]: (prev[idx] || 0) + 1 }));
      }, 1000);
    } catch (err) {
      console.error(err);
      alert("Không thể truy cập microphone. Vui lòng nhấp vào biểu tượng ổ khóa hoặc micro ở bên trái thanh địa chỉ trình duyệt, chọn 'Cho phép (Allow)' cho Microphone, sau đó tải lại trang!");
    }
  };

  const stopRecording = (idx: number | string) => {
    mediaRecorderRef.current?.stop();
    setIsRecording(prev => ({ ...prev, [idx]: false }));
    clearInterval(timerRef.current);
  };

  const startSpeechRecognition = (idx: number | string, expectedText: string) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Trình duyệt không hỗ trợ nhận diện giọng nói. Vui lòng dùng Chrome!");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognitionRef.current = recognition;
    recognition.onstart = () => setIsListeningSTT(prev => ({ ...prev, [idx]: true }));
    recognition.onend = () => setIsListeningSTT(prev => ({ ...prev, [idx]: false }));
    recognition.onerror = () => setIsListeningSTT(prev => ({ ...prev, [idx]: false }));
    recognition.onresult = (e: any) => {
      const text = e.results[0][0].transcript;
      const score = calcSpeechScore(text, expectedText);
      setSpokenTexts(prev => ({ ...prev, [idx]: text }));
      setSpeechScores(prev => ({ ...prev, [idx]: score }));
    };
    recognition.start();
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      recognitionRef.current?.abort();
    };
  }, []);

  return {
    recordedBlobs,
    setRecordedBlobs,
    recordedUrls,
    setRecordedUrls,
    isRecording,
    setIsRecording,
    recordSeconds,
    setRecordSeconds,
    startRecording,
    stopRecording,
    // Voice STT
    spokenTexts,
    setSpokenTexts,
    speechScores,
    setSpeechScores,
    isListeningSTT,
    setIsListeningSTT,
    startSpeechRecognition
  };
}
