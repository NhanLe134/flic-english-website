/**
 * CHỨC NĂNG CỦA FILE:
 * Hook tùy chỉnh này quản lý logic liên quan đến nộp bài (submission):
 * 1. Thu thập dữ liệu câu trả lời của sinh viên cho cả dạng Đề thi (Exam) và Bài tập thường (Regular).
 * 2. Upload file ghi âm lên máy chủ (nếu có bài Nói).
 * 3. Chấm điểm tự động phần trắc nghiệm/phát âm/sắp xếp từ và tính điểm trung bình.
 * 4. Gọi API gửi bài nộp về Backend và chuyển hướng sang trang kết quả thành công.
 */

import { useState } from "react";
import { calcDictationScore } from "./hoTroBaiTap";

const API =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname.startsWith("192.168.") ||
  window.location.hostname.startsWith("10.")
    ? `http://${window.location.hostname}:5004`
    : (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.startsWith("192.168.") || window.location.hostname.startsWith("10.") ? "http://" + window.location.hostname + ":5004" : "http://14.225.192.252:5004") + "";

interface SubmittingAnswers {
  mcAnswers: Record<string | number, string>;
  essayAnswers: Record<string | number, string>;
  recordedBlobs: Record<string | number, Blob>;
  recordedUrls: Record<string | number, string>;
  fillInAnswers: Record<string | number, string[]>;
  spokenTexts: Record<string | number, string>;
  speechScores: Record<string | number, number | null>;
  orderedWords: Record<string | number, string[]>;
  shuffledSentences: Record<string | number, string[]>;
}

export function useNopBaiTap(
  id: string | undefined,
  maSinhVien: number | null,
  user: any,
  exercise: any,
  questionsList: any[],
  isExam: boolean,
  hasSections: boolean,
  parsedContent: any,
  maLopHoc: number | undefined,
  lessonId: string | undefined,
  navigate: any,
  location: any
) {
  const [submitting, setSubmitting] = useState(false);
  const maNguoiDung = user?.MaNguoiDung;

  const handleSubmit = async (answers: SubmittingAnswers) => {
    const {
      mcAnswers,
      essayAnswers,
      recordedBlobs,
      recordedUrls,
      fillInAnswers,
      spokenTexts,
      speechScores,
      orderedWords,
      shuffledSentences
    } = answers;

    setSubmitting(true);
    try {
      const submissionData: any = {};

      if (isExam || hasSections) {
        // Build JSON structure for exam sections
        submissionData.isExam = true;
        submissionData.sections = await Promise.all(
          parsedContent.sections.map(async (sec: any, secIdx: number) => {
            const sectionResponse: any = {
              sectionIdx: secIdx,
              type: sec.type
            };

            if (sec.type === "Nghe audio trắc nghiệm" || sec.type === "Trắc nghiệm đọc hiểu (chia đôi màn hình)") {
              const secAns: Record<string | number, string> = {};
              sec.questions.forEach((q: any, qIdx: number) => {
                if (q.subQuestions && q.subQuestions.length > 0) {
                  q.subQuestions.forEach((_: any, subIdx: number) => {
                    secAns[`${qIdx}_${subIdx}`] = mcAnswers[`${secIdx}_${qIdx}_${subIdx}`] || "";
                  });
                } else {
                  secAns[qIdx] = mcAnswers[`${secIdx}_${qIdx}`] || "";
                }
              });
              sectionResponse.answers = secAns;
            } else if (sec.type === "Viết đoạn văn ngắn") {
              sectionResponse.essayText = essayAnswers[secIdx] || "";
            } else if (sec.type === "Nói theo chủ đề (ghi âm nộp GV)") {
              let url = "";
              if (recordedBlobs[secIdx]) {
                const formData = new FormData();
                formData.append("file", recordedBlobs[secIdx], `exam-speaking-${secIdx}.webm`);
                try {
                  const upRes = await fetch(`${API}/upload`, { method: "POST", body: formData });
                  if (!upRes.ok) {
                    const errMsg = await upRes.text();
                    throw new Error(`Upload failed with status ${upRes.status}: ${errMsg}`);
                  }
                  const upData = await upRes.json();
                  url = upData.url || "";
                } catch (uploadError: any) {
                  console.error("Upload error:", uploadError);
                  throw new Error("Không thể tải file ghi âm lên máy chủ: " + (uploadError.message || uploadError));
                }
              }
              sectionResponse.audioUrl = url || recordedUrls[secIdx] || "";
              sectionResponse.note = essayAnswers[secIdx] || "";
            } else if (sec.questions) {
              sectionResponse.questions = await Promise.all(
                sec.questions.map(async (q: any, qIdx: number) => {
                  const key = `${secIdx}_${qIdx}`;
                  const qResult: any = { questionIdx: qIdx, type: sec.type };

                  if (sec.type === "Hình ảnh chọn đáp án") {
                    const ans = mcAnswers[key] || "";
                    qResult.chosenAnswer = ans;
                    qResult.correctAnswer = q.correct || "A";
                    qResult.score = ans === (q.correct || "A") ? 10 : 0;
                  } else if (sec.type === "Nghe chép chính tả") {
                    const textAns = essayAnswers[key] || "";
                    qResult.essayText = textAns;
                    qResult.correctText = q.text;
                    qResult.score = calcDictationScore(textAns, q.text || "");
                  } else if (sec.type === "Điền từ vào đoạn văn") {
                    const stdAnswers = fillInAnswers[key] || [];
                    const correctAnswers = q.fillInAnswers || [];
                    let matched = 0;
                    correctAnswers.forEach((ans: string, i: number) => {
                      if ((stdAnswers[i] || "").trim().toLowerCase() === ans.toLowerCase()) matched++;
                    });
                    qResult.fillInAnswers = stdAnswers;
                    qResult.correctAnswers = correctAnswers;
                    qResult.score = correctAnswers.length > 0 ? (matched / correctAnswers.length) * 10 : 0;
                  } else if (sec.type === "Luyện phát âm (check phát âm tự động)") {
                    qResult.spokenText = spokenTexts[key] || "";
                    qResult.correctText = q.text;
                    qResult.score = speechScores[key] || 0;
                  } else if (sec.type === "Sắp xếp từ thành câu") {
                    const stdSent = (orderedWords[key] || []).join(" ").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
                    const correctSent = (q.correctSentence || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
                    qResult.essayText = (orderedWords[key] || []).join(" ");
                    qResult.correctText = q.correctSentence;
                    qResult.score = stdSent === correctSent ? 10 : 0;
                  } else if (sec.type === "Sắp xếp câu thành đoạn văn") {
                    const stdSents = shuffledSentences[key] || [];
                    const correctSents = q.sentences || [];
                    let placed = 0;
                    stdSents.forEach((s, idx) => {
                      if (s === correctSents[idx]) placed++;
                    });
                    qResult.sentences = stdSents;
                    qResult.score = correctSents.length > 0 ? (placed / correctSents.length) * 10 : 0;
                  } else if (sec.type === "Nối từ") {
                    if (q.vocabPairs && q.vocabPairs.length > 0) {
                      const ansStr = mcAnswers[key] || "";
                      let correctCount = 0;
                      if (ansStr.includes("|||")) {
                        correctCount = ansStr.split("|||").filter(Boolean).length;
                      } else if (ansStr.includes("/")) {
                        const numerator = Number(ansStr.split("/")[0]);
                        correctCount = isNaN(numerator) ? 0 : numerator;
                      } else if (!isNaN(Number(ansStr))) {
                        correctCount = Number(ansStr);
                      } else {
                        correctCount = ansStr.split(",").filter(Boolean).length;
                      }
                      qResult.chosenAnswer = ansStr;
                      qResult.correctAnswer = q.vocabPairs.map((p: any) => p.word).join("|||");
                      qResult.score = q.vocabPairs.length > 0 ? (correctCount / q.vocabPairs.length) * 10 : 0;
                    } else {
                      const ans = mcAnswers[key] || "";
                      qResult.chosenAnswer = ans;
                      qResult.correctAnswer = q.correct;
                      qResult.score = ans === q.correct ? 10 : 0;
                    }
                  } else if (sec.type === "Trắc nghiệm") {
                    const ans = mcAnswers[key] || "";
                    qResult.chosenAnswer = ans;
                    qResult.correctAnswer = q.correct;
                    qResult.score = ans === q.correct ? 10 : 0;
                  } else if (sec.type === "Tìm lỗi sai") {
                    const ans = mcAnswers[key] || "";
                    const typedCorrection = (essayAnswers[key] || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
                    const correctCorrection = (q.correctSentence || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
                    qResult.chosenAnswer = ans;
                    qResult.correctAnswer = q.correct;
                    qResult.essayText = essayAnswers[key] || "";
                    qResult.correctText = q.correctSentence;
                    const isMistakeCorrect = ans === q.correct;
                    const isCorrectionCorrect = typedCorrection === correctCorrection;
                    let qScore = 0;
                    if (isMistakeCorrect) qScore += 5;
                    if (isCorrectionCorrect) qScore += 5;
                    qResult.score = qScore;
                  }

                  return qResult;
                })
              );
            }

            return sectionResponse;
          })
        );

        // Grade automatable parts of exam
        let totalExamPoints = 0;
        let examGradableQuestions = 0;
        let isFullyAutoGraded = true;

        parsedContent.sections.forEach((sec: any, secIdx: number) => {
          if (sec.type === "Nghe audio trắc nghiệm" || sec.type === "Trắc nghiệm đọc hiểu (chia đôi màn hình)") {
            sec.questions.forEach((q: any, qIdx: number) => {
              if (q.subQuestions && q.subQuestions.length > 0) {
                q.subQuestions.forEach((sub: any, subIdx: number) => {
                  const ans = mcAnswers[`${secIdx}_${qIdx}_${subIdx}`];
                  if (ans === sub.correct) totalExamPoints += 10;
                  examGradableQuestions++;
                });
              } else {
                const ans = mcAnswers[`${secIdx}_${qIdx}`];
                if (ans === q.correct) totalExamPoints += 10;
                examGradableQuestions++;
              }
            });
          } else if (sec.type === "Viết đoạn văn ngắn" || sec.type === "Nói theo chủ đề (ghi âm nộp GV)") {
            isFullyAutoGraded = false; // Requires teacher grading
          } else if (sec.questions) {
            sec.questions.forEach((q: any, qIdx: number) => {
              const key = `${secIdx}_${qIdx}`;
              if (sec.type === "Hình ảnh chọn đáp án") {
                const ans = mcAnswers[key] || "";
                if (ans === (q.correct || "A")) totalExamPoints += 10;
                examGradableQuestions++;
              } else if (sec.type === "Nghe chép chính tả") {
                const textAns = essayAnswers[key] || "";
                totalExamPoints += calcDictationScore(textAns, q.text || "");
                examGradableQuestions++;
              } else if (sec.type === "Điền từ vào đoạn văn") {
                const stdAnswers = fillInAnswers[key] || [];
                const correctAnswers = q.fillInAnswers || [];
                let matched = 0;
                correctAnswers.forEach((ans: string, i: number) => {
                  if ((stdAnswers[i] || "").trim().toLowerCase() === ans.toLowerCase()) matched++;
                });
                totalExamPoints += correctAnswers.length > 0 ? (matched / correctAnswers.length) * 10 : 0;
                examGradableQuestions++;
              } else if (sec.type === "Luyện phát âm (check phát âm tự động)") {
                totalExamPoints += speechScores[key] || 0;
                examGradableQuestions++;
              } else if (sec.type === "Sắp xếp từ thành câu") {
                const stdSent = (orderedWords[key] || []).join(" ").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
                const correctSent = (q.correctSentence || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
                if (stdSent === correctSent) totalExamPoints += 10;
                examGradableQuestions++;
              } else if (sec.type === "Sắp xếp câu thành đoạn văn") {
                const stdSents = shuffledSentences[key] || [];
                const correctSents = q.sentences || [];
                let placed = 0;
                stdSents.forEach((s, idx) => {
                  if (s === correctSents[idx]) placed++;
                });
                totalExamPoints += correctSents.length > 0 ? (placed / correctSents.length) * 10 : 0;
                examGradableQuestions++;
              } else if (sec.type === "Nối từ") {
                if (q.vocabPairs && q.vocabPairs.length > 0) {
                  const ansStr = mcAnswers[key] || "";
                  let correctCount = 0;
                  if (ansStr.includes("|||")) {
                    correctCount = ansStr.split("|||").filter(Boolean).length;
                  } else if (ansStr.includes("/")) {
                    const numerator = Number(ansStr.split("/")[0]);
                    correctCount = isNaN(numerator) ? 0 : numerator;
                  } else if (!isNaN(Number(ansStr))) {
                    correctCount = Number(ansStr);
                  } else {
                    correctCount = ansStr.split(",").filter(Boolean).length;
                  }
                  totalExamPoints += q.vocabPairs.length > 0 ? (correctCount / q.vocabPairs.length) * 10 : 0;
                } else {
                  const ans = mcAnswers[key] || "";
                  if (ans === q.correct) totalExamPoints += 10;
                }
                examGradableQuestions++;
              } else if (sec.type === "Trắc nghiệm") {
                const ans = mcAnswers[key] || "";
                if (ans === q.correct) totalExamPoints += 10;
                examGradableQuestions++;
              } else if (sec.type === "Tìm lỗi sai") {
                const ans = mcAnswers[key] || "";
                const typedCorrection = (essayAnswers[key] || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
                const correctCorrection = (q.correctSentence || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
                const isMistakeCorrect = ans === q.correct;
                const isCorrectionCorrect = typedCorrection === correctCorrection;
                let qScore = 0;
                if (isMistakeCorrect) qScore += 5;
                if (isCorrectionCorrect) qScore += 5;
                totalExamPoints += qScore;
                examGradableQuestions++;
              }
            });
          }
        });

        const examFinalScore = isFullyAutoGraded && examGradableQuestions > 0
          ? Math.round((totalExamPoints / examGradableQuestions) * 10) / 10
          : null;

        await fetch(`${API}/bainop`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            MaExercise: isNaN(Number(id)) ? id! : Number(id),
            MaSinhVien: maSinhVien || maNguoiDung,
            NoiDung: JSON.stringify(submissionData),
            Diem: examFinalScore,
            TrangThai: isFullyAutoGraded ? "Đã chấm" : "Chờ chấm"
          })
        });

        navigate(location.pathname + "/assignment-success", {
          state: {
            title: exercise?.Title,
            maLopHoc: maLopHoc,
            diem: examFinalScore,
            loai: "Exam",
            maBaiTap: id,
            lessonId: lessonId,
            tabKey: location.pathname.includes('/bt/') ? 'bt' : 'lt',
            justSubmittedAnswers: submissionData
          }
        });

      } else {
        // Build JSON structure for regular multiple question exercise
        submissionData.isExam = false;
        submissionData.questions = await Promise.all(
          questionsList.map(async (q, qIdx) => {
            const questionType = exercise?.Type || "";
            const qResult: any = {
              questionIdx: qIdx,
              type: questionType
            };

            if (questionType === "Nối từ") {
              if (q.vocabPairs && q.vocabPairs.length > 0) {
                const ansStr = mcAnswers[qIdx] || "";
                let correctCount = 0;
                if (ansStr.includes("|||")) {
                  correctCount = ansStr.split("|||").filter(Boolean).length;
                } else if (ansStr.includes("/")) {
                  const numerator = Number(ansStr.split("/")[0]);
                  correctCount = isNaN(numerator) ? 0 : numerator;
                } else if (!isNaN(Number(ansStr))) {
                  correctCount = Number(ansStr);
                } else {
                  correctCount = ansStr.split(",").filter(Boolean).length;
                }
                qResult.chosenAnswer = ansStr;
                qResult.correctAnswer = q.vocabPairs.map((p: any) => p.word).join("|||");
                qResult.score = q.vocabPairs.length > 0 ? (correctCount / q.vocabPairs.length) * 10 : 0;
              } else {
                const ans = mcAnswers[qIdx] || "";
                qResult.chosenAnswer = ans;
                qResult.correctAnswer = q.correct;
                qResult.score = ans === q.correct ? 10 : 0;
              }
            } else if (questionType === "Nghe audio trắc nghiệm" || questionType === "Trắc nghiệm" || questionType === "Tổng hợp") {
              if (q.subQuestions && q.subQuestions.length > 0) {
                const subResults: any[] = [];
                let correctSubCount = 0;
                q.subQuestions.forEach((sub: any, subIdx: number) => {
                  const ans = mcAnswers[`${qIdx}_${subIdx}`] || "";
                  if (ans.trim().toUpperCase() === sub.correct?.trim().toUpperCase()) {
                    correctSubCount++;
                  }
                  subResults.push({ chosen: ans, correct: sub.correct });
                });
                qResult.subQuestions = subResults;
                qResult.score = q.subQuestions.length > 0 ? (correctSubCount / q.subQuestions.length) * 10 : 0;
              } else {
                const ans = mcAnswers[qIdx] || "";
                qResult.chosenAnswer = ans;
                qResult.correctAnswer = q.correct;
                qResult.score = ans.trim().toUpperCase() === q.correct?.trim().toUpperCase() ? 10 : 0;
              }
            } else if (questionType === "Tìm lỗi sai") {
              const ans = mcAnswers[qIdx] || "";
              const typedCorrection = (essayAnswers[qIdx] || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
              const correctCorrection = (q.correctSentence || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
              qResult.chosenAnswer = ans;
              qResult.correctAnswer = q.correct;
              qResult.essayText = essayAnswers[qIdx] || "";
              qResult.correctText = q.correctSentence;
              const isMistakeCorrect = ans === q.correct;
              const isCorrectionCorrect = typedCorrection === correctCorrection;
              let qScore = 0;
              if (isMistakeCorrect) qScore += 5;
              if (isCorrectionCorrect) qScore += 5;
              qResult.score = qScore;
            } else if (questionType === "Hình ảnh chọn đáp án") {
              const ans = mcAnswers[qIdx] || "";
              qResult.chosenAnswer = ans;
              qResult.correctAnswer = q.correct || "A";
              qResult.score = ans === (q.correct || "A") ? 10 : 0;
            } else if (questionType === "Nghe chép chính tả") {
              const textAns = essayAnswers[qIdx] || "";
              qResult.essayText = textAns;
              qResult.correctText = q.text;
              qResult.score = calcDictationScore(textAns, q.text || "");
            } else if (questionType === "Điền từ vào đoạn văn") {
              const stdAnswers = fillInAnswers[qIdx] || [];
              const correctAnswers = q.fillInAnswers || [];
              let matched = 0;
              correctAnswers.forEach((ans: string, i: number) => {
                if ((stdAnswers[i] || "").trim().toLowerCase() === ans.toLowerCase()) matched++;
              });
              qResult.fillInAnswers = stdAnswers;
              qResult.correctAnswers = correctAnswers;
              qResult.score = correctAnswers.length > 0 ? (matched / correctAnswers.length) * 10 : 0;
            } else if (questionType === "Luyện phát âm (check phát âm tự động)") {
              qResult.spokenText = spokenTexts[qIdx] || "";
              qResult.correctText = q.text;
              qResult.score = speechScores[qIdx] || 0;
            } else if (questionType === "Nói theo chủ đề (ghi âm nộp GV)") {
              let url = "";
              if (recordedBlobs[qIdx]) {
                const formData = new FormData();
                formData.append("file", recordedBlobs[qIdx], `speaking-${qIdx}.webm`);
                try {
                  const upRes = await fetch(`${API}/upload`, { method: "POST", body: formData });
                  if (!upRes.ok) {
                    const errMsg = await upRes.text();
                    throw new Error(`Upload failed with status ${upRes.status}: ${errMsg}`);
                  }
                  const upData = await upRes.json();
                  url = upData.url || "";
                } catch (uploadError: any) {
                  console.error("Upload error:", uploadError);
                  throw new Error("Không thể tải file ghi âm lên máy chủ: " + (uploadError.message || uploadError));
                }
              }
              qResult.audioUrl = url || recordedUrls[qIdx] || "";
              qResult.essayText = essayAnswers[qIdx] || "";
              qResult.score = null;
            } else if (questionType === "Sắp xếp từ thành câu") {
              const stdSent = (orderedWords[qIdx] || []).join(" ").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
              const correctSent = (q.correctSentence || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
              qResult.essayText = (orderedWords[qIdx] || []).join(" ");
              qResult.correctText = q.correctSentence;
              qResult.score = stdSent === correctSent ? 10 : 0;
            } else if (questionType === "Sắp xếp câu thành đoạn văn") {
              const stdSents = shuffledSentences[qIdx] || [];
              const correctSents = q.sentences || [];
              let placed = 0;
              stdSents.forEach((s, idx) => {
                if (s === correctSents[idx]) placed++;
              });
              qResult.sentences = stdSents;
              qResult.score = correctSents.length > 0 ? (placed / correctSents.length) * 10 : 0;
            } else if (questionType === "Viết đoạn văn ngắn") {
              qResult.essayText = essayAnswers[qIdx] || "";
              qResult.score = null;
            } else if (questionType === "Trắc nghiệm đọc hiểu (chia đôi màn hình)") {
              const subResults: any[] = [];
              let correctSubCount = 0;
              q.subQuestions?.forEach((sub: any, subIdx: number) => {
                const ans = mcAnswers[`${qIdx}_${subIdx}`] || "";
                if (ans === sub.correct) correctSubCount++;
                subResults.push({ chosen: ans, correct: sub.correct });
              });
              qResult.subQuestions = subResults;
              qResult.score = q.subQuestions?.length > 0 ? (correctSubCount / q.subQuestions.length) * 10 : 0;
            }

            return qResult;
          })
        );

        let totalScore = 0;
        let gradableCount = 0;
        let isFullyAuto = true;

        submissionData.questions.forEach((q: any) => {
          if (q.score !== null) {
            totalScore += q.score;
            gradableCount++;
          } else {
            isFullyAuto = false;
          }
        });

        const finalScore = isFullyAuto && gradableCount > 0
          ? Math.round((totalScore / gradableCount) * 10) / 10
          : null;

        await fetch(`${API}/bainop`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            MaExercise: isNaN(Number(id)) ? id! : Number(id),
            MaSinhVien: maSinhVien || maNguoiDung,
            NoiDung: JSON.stringify(submissionData),
            Diem: finalScore,
            TrangThai: isFullyAuto ? "Đã chấm" : "Chờ chấm"
          })
        });

        navigate(location.pathname + "/assignment-success", {
          state: {
            title: exercise?.Title,
            maLopHoc: maLopHoc,
            diem: finalScore,
            loai: exercise?.Type || "Bài tập",
            maBaiTap: id,
            lessonId: lessonId,
            tabKey: location.pathname.includes('/bt/') ? 'bt' : 'lt',
            justSubmittedAnswers: submissionData
          }
        });
      }
    } catch (e: any) {
      console.error(e);
      alert("Lỗi khi nộp bài! Chi tiết: " + (e?.message || JSON.stringify(e)));
    } finally {
      setSubmitting(false);
    }
  };

  return {
    submitting,
    handleSubmit
  };
}
