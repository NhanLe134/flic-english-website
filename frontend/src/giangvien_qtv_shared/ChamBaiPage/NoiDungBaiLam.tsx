interface NoiDungBaiLamProps {
  isExam: boolean;
  hasSections: boolean;
  parsedSubmission: any;
  parsedContent: any;
  exercise: any;
  baiNop: any;
  questionsList: any[];
  deiBai: string;
  isMC: boolean;
  mcQuestions: any[];
  mcAnswers: any;
  API: string;
}

export default function NoiDungBaiLam({
  isExam,
  hasSections,
  parsedSubmission,
  parsedContent,
  exercise,
  baiNop,
  questionsList,
  deiBai,
  isMC,
  mcQuestions,
  mcAnswers,
  API,
}: NoiDungBaiLamProps) {

  const renderMCQBlockGrading = (q: any, qIdx: number, studentAnswer: string) => {
    const optionsList = q.options || (q.answers?.map((t: string, i: number) => ({ label: ["A", "B", "C", "D"][i], text: t })) || []);
    const isCorrect = studentAnswer === q.correct;

    return (
      <div key={qIdx} style={{
        background: isCorrect ? "#f0fdf4" : studentAnswer ? "#fef2f2" : "#fff",
        border: `1.5px solid ${isCorrect ? "#86efac" : studentAnswer ? "#fecaca" : "#f0e8dc"}`,
        borderRadius: 12, padding: "16px 18px", marginBottom: 14
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <p style={{ margin: 0, fontWeight: 700, color: "#5a3e2b" }}>Câu {qIdx + 1}: {q.question}</p>
          <span style={{ fontSize: 12, fontWeight: 700, color: isCorrect ? "#16a34a" : "#dc2626" }}>
            {isCorrect ? "✓ Đúng" : studentAnswer ? "✗ Sai" : "Chưa trả lời"}
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {optionsList.map((opt: any) => {
            const isChosen = studentAnswer === opt.label;
            const isCorrectOpt = opt.label === q.correct;
            const isWrongOpt = isChosen && opt.label !== q.correct;

            return (
              <div key={opt.label} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 8,
                border: `1.5px solid ${isCorrectOpt ? "#86efac" : isWrongOpt ? "#fecaca" : isChosen ? "#e87722" : "#e0d8cc"}`,
                background: isCorrectOpt ? "#f0fdf4" : isWrongOpt ? "#fef2f2" : isChosen ? "#fff3e0" : "#fafafa",
              }}>
                <span style={{ fontWeight: 600, color: "#e87722" }}>{opt.label}.</span>
                <span style={{ color: "#444" }}>{opt.text}</span>
                {isChosen && <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 700, color: isCorrect ? "green" : "red" }}>SV chọn</span>}
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 10, fontSize: 13, borderTop: "1px dashed #e0d8cc", paddingTop: 8 }}>
          <p style={{ margin: 0, color: "#16a34a", fontWeight: "600" }}>Đáp án đúng: {q.correct}</p>
          {q.explanation && <p style={{ margin: "4px 0 0", color: "#666" }}>Giải thích: {q.explanation}</p>}
        </div>
      </div>
    );
  };

  return (
    <div className="cb-card">
      <h3>Bài làm của học viên</h3>

      {/* ── CASE 1: TIMED EXAMS (SECTIONS-BASED) ── */}
      {(isExam || hasSections) && parsedSubmission ? (
        <div>
          {parsedSubmission.sections.map((sec: any, secIdx: number) => {
            const exerciseSection = parsedContent.sections?.[secIdx];

            return (
              <div key={secIdx} style={{ border: "2px solid #e6caa5", borderRadius: 12, padding: 18, marginBottom: 24, background: "#fffbf5" }}>
                <h4
                  style={{ color: "#F95800", marginTop: 0, borderBottom: "1px solid #e6caa5", paddingBottom: 6, whiteSpace: "pre-wrap" }}
                  dangerouslySetInnerHTML={{
                    __html: `Phần ${secIdx + 1}: ${sec.title.replace(/^phần\s*\d+\s*[:\-.]?\s*/i, "").trim()} (${sec.type.replace("-", " ").toUpperCase()})`
                  }}
                />

                {sec.type === "Nghe audio trắc nghiệm" && (
                  <div>
                    {exerciseSection?.audioUrl && (
                      <div style={{ marginBottom: 12 }}>
                        <p style={{ margin: "0 0 6px", fontSize: 13, color: "#666" }}>🎵 Audio bài nghe:</p>
                        <audio controls style={{ width: "100%" }}><source src={`${API}${exerciseSection.audioUrl}`} /></audio>
                      </div>
                    )}
                    {exerciseSection?.questions.map((q: any, qIdx: number) => {
                      const hasSubQ = q.subQuestions && q.subQuestions.length > 0;
                      return (
                        <div key={qIdx} style={{ marginBottom: 20, borderBottom: "1px dashed #e0d8cc", paddingBottom: 15 }}>
                          {q.audioUrl && (
                            <div style={{ marginBottom: 12 }}>
                              <p style={{ margin: "0 0 6px", fontSize: 13, color: "#666" }}>🎵 Audio nhóm bài nghe:</p>
                              <audio controls style={{ width: "100%" }}><source src={`${API}${q.audioUrl}`} /></audio>
                            </div>
                          )}
                          {q.prompt && (
                            <div style={{ background: "#fff3e0", padding: 10, borderRadius: 8, marginBottom: 10 }}>
                              <p style={{ margin: 0, fontWeight: 600 }} dangerouslySetInnerHTML={{ __html: q.prompt }} />
                            </div>
                          )}
                          {hasSubQ ? (
                            q.subQuestions.map((sub: any, subIdx: number) => {
                              const stdAns = sec.answers?.[`${qIdx}_${subIdx}`] || "";
                              return renderMCQBlockGrading(sub, subIdx, stdAns);
                            })
                          ) : (
                            renderMCQBlockGrading(q, qIdx, sec.answers?.[qIdx] || "")
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {sec.type === "Trắc nghiệm đọc hiểu (chia đôi màn hình)" && (
                  <div>
                    {exerciseSection?.content && (
                      <div style={{ background: "#fff", border: "1px solid #e0d4c3", borderRadius: 8, padding: 12, marginBottom: 15, maxHeight: 150, overflowY: "auto" }}>
                        <p style={{ margin: 0, fontStyle: "italic", whiteSpace: "pre-line", fontSize: 13 }} dangerouslySetInnerHTML={{ __html: exerciseSection.content }} />
                      </div>
                    )}
                    {exerciseSection?.questions.map((q: any, qIdx: number) => {
                      const hasSubQ = q.subQuestions && q.subQuestions.length > 0;
                      return (
                        <div key={qIdx} style={{ marginBottom: 20, borderBottom: "1px dashed #e0d8cc", paddingBottom: 15 }}>
                          {q.prompt && (
                            <div style={{ background: "#fff", border: "1px solid #e0d4c3", borderRadius: 8, padding: 12, marginBottom: 15, maxHeight: 150, overflowY: "auto" }}>
                              <p style={{ margin: 0, fontStyle: "italic", whiteSpace: "pre-line", fontSize: 13 }} dangerouslySetInnerHTML={{ __html: q.prompt }} />
                            </div>
                          )}
                          {hasSubQ ? (
                            q.subQuestions.map((sub: any, subIdx: number) => {
                              const stdAns = sec.answers?.[`${qIdx}_${subIdx}`] || "";
                              return renderMCQBlockGrading(sub, subIdx, stdAns);
                            })
                          ) : (
                            renderMCQBlockGrading(q, qIdx, sec.answers?.[qIdx] || "")
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {sec.type === "Viết đoạn văn ngắn" && (
                  <div>
                    <div style={{ background: "#fff3e0", padding: 10, borderRadius: 8, marginBottom: 10 }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }} dangerouslySetInnerHTML={{ __html: exerciseSection?.content }} />
                    </div>
                    <div style={{ background: "#fff", border: "1px solid #e0d4c3", padding: 12, borderRadius: 8 }}>
                      <p style={{ margin: 0, whiteSpace: "pre-wrap", fontSize: 14 }}>{sec.essayText || <em style={{ color: "#aaa" }}>Học viên bỏ trống bài viết</em>}</p>
                      {sec.essayText && (
                        <p style={{ margin: "8px 0 0", fontSize: 12, color: "#666", fontWeight: "600" }}>
                          Số từ: {sec.essayText.trim().split(/\s+/).filter(Boolean).length} từ
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {sec.type === "Nói theo chủ đề (ghi âm nộp GV)" && (
                  <div>
                    {exerciseSection?.questions && exerciseSection.questions.length > 0 ? (
                      exerciseSection.questions.map((q: any, qIdx: number) => (
                        <div key={qIdx} style={{ background: "#fff", padding: 12, border: "1px solid #e0d4c3", borderRadius: 8, marginBottom: 12 }}>
                          <div style={{ background: "#fff3e0", padding: 10, borderRadius: 8, marginBottom: 10 }}>
                            <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>
                              Chủ đề {qIdx + 1}: <span dangerouslySetInnerHTML={{ __html: q.prompt }} />
                            </p>
                          </div>
                          {q.audioUrl && (
                            <div style={{ marginBottom: 10 }}>
                              <audio src={`${API}${q.audioUrl}`} controls style={{ width: "100%" }} />
                            </div>
                          )}
                          {q.imageUrl && (
                            <img src={`${API}${q.imageUrl}`} alt="Topic hint" style={{ maxHeight: 120, display: "block", marginBottom: 8 }} />
                          )}
                        </div>
                      ))
                    ) : (
                      <div style={{ background: "#fff3e0", padding: 10, borderRadius: 8, marginBottom: 10 }}>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>{exerciseSection?.content}</p>
                      </div>
                    )}
                    <div style={{ background: "#fff", border: "1px solid #e0d4c3", padding: 12, borderRadius: 8 }}>
                      <p style={{ margin: "0 0 8px", fontWeight: "600", fontSize: 13 }}>🎤 File ghi âm giọng nói học sinh:</p>
                      {sec.audioUrl ? (
                        <audio src={`${API}${sec.audioUrl}`} controls style={{ width: "100%" }} />
                      ) : (
                        <p style={{ color: "red", fontStyle: "italic", margin: 0 }}>Học viên không thực hiện ghi âm</p>
                      )}
                      {sec.note && (
                        <div style={{ marginTop: 10, borderTop: "1px dashed #eee", paddingTop: 8 }}>
                          <p style={{ margin: "0 0 4px", fontSize: 12, color: "#666" }}>Ghi chú học viên:</p>
                          <p style={{ margin: 0, fontStyle: "italic" }}>"{sec.note}"</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {(sec.type === "Hình ảnh chọn đáp án" || sec.type === "Trắc nghiệm" || sec.type === "Tổng hợp") && (
                  <div>
                    {exerciseSection?.questions?.map((q: any, qIdx: number) => {
                      const qSub = sec.questions?.[qIdx] || {};
                      const isFlatMC = sec.type === "Hình ảnh chọn đáp án" || sec.type === "Trắc nghiệm";
                      const hasSubQ = !isFlatMC && q.subQuestions && q.subQuestions.length > 0;
                      return (
                        <div key={qIdx} style={{ marginTop: 10, borderBottom: "1px dashed #e0d8cc", paddingBottom: 15 }}>
                          {sec.type === "Hình ảnh chọn đáp án" && q.imageUrl && (
                            <img src={`${API}${q.imageUrl}`} alt="Prompt visual" style={{ maxHeight: 120, display: "block", marginBottom: 8 }} />
                          )}
                          {sec.type === "Hình ảnh chọn đáp án" && q.audioUrl && (
                            <audio src={`${API}${q.audioUrl}`} controls style={{ width: "100%", marginBottom: 8 }} />
                          )}
                          {q.prompt && (
                            <div style={{ background: "#fff3e0", padding: 10, borderRadius: 8, marginBottom: 10 }}>
                              <p style={{ margin: 0, fontWeight: 600 }} dangerouslySetInnerHTML={{ __html: q.prompt }} />
                            </div>
                          )}
                          {hasSubQ ? (
                            q.subQuestions.map((sub: any, subIdx: number) => {
                              const subAns = qSub.subQuestions?.[subIdx]?.chosen || "";
                              return renderMCQBlockGrading(sub, subIdx, subAns);
                            })
                          ) : (
                            renderMCQBlockGrading(q, qIdx, qSub.chosenAnswer || "")
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {sec.type === "Nối từ" && (
                  <div>
                    {exerciseSection?.questions?.map((_: any, qIdx: number) => {
                      const qSub = sec.questions?.[qIdx] || {};
                      const pairs = qSub.vocabPairs || [];
                      return (
                        <div key={qIdx} style={{ marginTop: 10, background: "#fff", padding: 16, borderRadius: 10, border: "1px solid #e0d8cc" }}>
                          <h5 style={{ color: "#000080", fontSize: 14, fontWeight: 700, margin: "0 0 10px 0" }}>Kết quả bài Nối từ vựng (Anh - Anh diễn giải):</h5>
                          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                            <thead>
                              <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                                <th style={{ textAlign: "left", padding: 8 }}>Từ tiếng Anh</th>
                                <th style={{ textAlign: "left", padding: 8 }}>Diễn giải đúng</th>
                                <th style={{ textAlign: "left", padding: 8 }}>Bài làm học sinh</th>
                                <th style={{ textAlign: "center", padding: 8, width: 100 }}>Kết quả</th>
                              </tr>
                            </thead>
                            <tbody>
                              {pairs.map((pair: any, pIdx: number) => (
                                <tr key={pIdx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                  <td style={{ padding: 8, fontWeight: 600, color: "#000080" }}>{pair.word}</td>
                                  <td style={{ padding: 8, color: "#475569" }}>{pair.meaning}</td>
                                  <td style={{ padding: 8, color: pair.studentAnswer ? "#1e293b" : "#94a3b8", fontStyle: pair.studentAnswer ? "normal" : "italic" }}>
                                    {pair.studentAnswer || "(Không ghép nối)"}
                                  </td>
                                  <td style={{ padding: 8, textAlign: "center" }}>
                                    {pair.isCorrect ? (
                                      <span style={{ color: "#22c55e", fontWeight: "bold" }}>Đúng</span>
                                    ) : (
                                      <span style={{ color: "#ef4444", fontWeight: "bold" }}>Sai</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          <p style={{ margin: "12px 0 0", fontSize: 13, color: "green", fontWeight: 700 }}>
                            Máy chấm tự động: {qSub.score}/10
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}

                {sec.type === "Nghe chép chính tả" && (
                  <div>
                    {exerciseSection?.questions?.map((q: any, qIdx: number) => {
                      const qSub = sec.questions?.[qIdx] || {};
                      return (
                        <div key={qIdx} style={{ background: "#fff", padding: 12, border: "1px solid #e0d4c3", borderRadius: 8, marginTop: 10 }}>
                          {q.audioUrl && <audio src={`${API}${q.audioUrl}`} controls style={{ width: "100%", marginBottom: 8 }} />}
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                            <div style={{ background: "#fef2f2", padding: 10, borderRadius: 8, border: "1px solid #fecaca" }}>
                              <p style={{ margin: 0, fontSize: 12, color: "#7f1d1d" }}>Bài làm của SV:</p>
                              <p style={{ margin: 0, fontWeight: 700 }}>"{qSub.essayText || ""}"</p>
                            </div>
                            <div style={{ background: "#f0fdf4", padding: 10, borderRadius: 8, border: "1px solid #86efac" }}>
                              <p style={{ margin: 0, fontSize: 12, color: "#166534" }}>Văn bản đúng:</p>
                              <p style={{ margin: 0, fontWeight: 700, color: "green" }}>
                                "<span dangerouslySetInnerHTML={{ __html: qSub.correctText || q.text || "" }} />"
                              </p>
                            </div>
                          </div>
                          <p style={{ margin: "8px 0 0", fontSize: 13, color: "green", fontWeight: 700 }}> Máy chấm tự động: {qSub.score}/10</p>
                        </div>
                      );
                    })}
                  </div>
                )}

                {sec.type === "Điền từ vào đoạn văn" && (
                  <div>
                    {exerciseSection?.questions?.map((q: any, qIdx: number) => {
                      const qSub = sec.questions?.[qIdx] || {};
                      return (
                        <div key={qIdx} style={{ background: "#fff", padding: 12, border: "1px solid #e0d4c3", borderRadius: 8, marginTop: 10 }}>
                          {q.audioUrl && <audio src={`${API}${q.audioUrl}`} controls style={{ width: "100%", marginBottom: 8 }} />}
                          <div style={{ background: "#fff", border: "1px solid #e0d4c3", padding: 12, borderRadius: 8 }}>
                            <p style={{ margin: "0 0 6px", fontSize: 13, fontWeight: "600" }}>Kết quả điền ô trống:</p>
                            {qSub.correctAnswers?.map((cAns: string, blankIdx: number) => {
                              const stdAns = qSub.fillInAnswers?.[blankIdx] || "";
                              const isOk = stdAns.trim().toLowerCase() === cAns.trim().toLowerCase();
                              return (
                                <p key={blankIdx} style={{ margin: "4px 0", fontSize: 13, color: isOk ? "green" : "red" }}>
                                  Ô trống [{blankIdx + 1}]: SV điền "{stdAns}" (Đáp án đúng: "{cAns}") {isOk ? "(Đúng)" : "(Sai)"}
                                </p>
                              );
                            })}
                          </div>
                          <p style={{ margin: "8px 0 0", fontSize: 13, color: "green", fontWeight: 700 }}>Máy chấm tự động: {qSub.score}/10</p>
                        </div>
                      );
                    })}
                  </div>
                )}

                {sec.type === "Luyện phát âm (check phát âm tự động)" && (
                  <div>
                    {exerciseSection?.questions?.map((q: any, qIdx: number) => {
                      const qSub = sec.questions?.[qIdx] || {};
                      return (
                        <div key={qIdx} style={{ background: "#fff", padding: 12, border: "1px solid #e0d4c3", borderRadius: 8, marginTop: 10 }}>
                          <div style={{ background: "#eff6ff", padding: 10, borderRadius: 8, marginBottom: 10 }}>
                            <p style={{ margin: 0, fontSize: 12, color: "#1d4ed8" }}>Đoạn văn mẫu:</p>
                            <p style={{ margin: 0, fontWeight: 700, color: "#1e3a8a" }}>
                              "<span dangerouslySetInnerHTML={{ __html: qSub.correctText || q.text || "" }} />"
                            </p>
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                            <div style={{ background: "#fcf9f2", padding: 10, borderRadius: 8, border: "1px solid #f0e8dc" }}>
                              <p style={{ margin: 0, fontSize: 12, color: "#666" }}>Máy nghe được SV nói:</p>
                              <p style={{ margin: 0, fontStyle: "italic" }}>"{qSub.spokenText || "—"}"</p>
                            </div>
                            <div style={{ background: "#f0fdf4", padding: 10, borderRadius: 8, border: "1px solid #86efac", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                              <p style={{ margin: 0, fontSize: 12, color: "#166534" }}>Điểm so sánh phát âm:</p>
                              <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "green" }}>{qSub.score}/10</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {sec.type === "Sắp xếp từ thành câu" && (
                  <div>
                    {exerciseSection?.questions?.map((q: any, qIdx: number) => {
                      const qSub = sec.questions?.[qIdx] || {};
                      return (
                        <div key={qIdx} style={{ background: "#fff", padding: 12, border: "1px solid #e0d4c3", borderRadius: 8, marginTop: 10 }}>
                          <div style={{ background: "#fcf9f2", padding: 10, borderRadius: 8, marginBottom: 10 }}>
                            <p style={{ margin: 0, fontSize: 12, color: "#666" }}>
                              Đề bài: <span dangerouslySetInnerHTML={{ __html: q.text }} />
                            </p>
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                            <div style={{ background: qSub.score === 10 ? "#f0fdf4" : "#fef2f2", padding: 10, borderRadius: 8, border: `1px solid ${qSub.score === 10 ? "#86efac" : "#fecaca"}` }}>
                              <p style={{ margin: 0, fontSize: 12 }}>SV sắp xếp:</p>
                              <p style={{ margin: 0, fontWeight: 700 }}>{qSub.essayText || ""}</p>
                            </div>
                            <div style={{ background: "#f0fdf4", padding: 10, borderRadius: 8, border: "1px solid #86efac" }}>
                              <p style={{ margin: 0, fontSize: 12, color: "green" }}>Đáp án đúng:</p>
                              <p style={{ margin: 0, fontWeight: 700, color: "green" }}>{qSub.correctText || q.correctSentence}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {sec.type === "Sắp xếp câu thành đoạn văn" && (
                  <div>
                    {exerciseSection?.questions?.map((_: any, qIdx: number) => {
                      const qSub = sec.questions?.[qIdx] || {};
                      return (
                        <div key={qIdx} style={{ background: "#fff", padding: 12, border: "1px solid #e0d4c3", borderRadius: 8, marginTop: 10 }}>
                          <div style={{ background: "#fff", border: "1px solid #e0d4c3", padding: 12, borderRadius: 8 }}>
                            <p style={{ margin: "0 0 6px", fontSize: 13, fontWeight: "600" }}>Thứ tự câu SV xếp:</p>
                            {qSub.sentences?.map((s: string, sIdx: number) => (
                              <p key={sIdx} style={{ margin: "4px 0", fontSize: 13 }}>
                                Dòng {sIdx + 1}: "{s}"
                              </p>
                            ))}
                          </div>
                          <p style={{ margin: "8px 0 0", fontSize: 13, color: "green", fontWeight: 700 }}>Máy chấm tự động: {qSub.score}/10</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : !(isExam || hasSections) && parsedSubmission ? (
        /* ── CASE 2: REGULAR MULTIPLE QUESTIONS (JSON LIST) ── */
        <div>
          {exercise?.AudioUrl && (exercise.Type || "").toLowerCase() === "nghe audio trắc nghiệm" && (
            <div style={{
              background: "#fff",
              border: "1.5px solid #e0d8cc",
              borderRadius: 10,
              padding: 16,
              marginBottom: 20
            }}>
              <h4 style={{ color: "#5a3e2b", marginTop: 0, marginBottom: 8, fontSize: "14px" }}>🎵 File nghe chung cho toàn bộ bài tập:</h4>
              <audio controls style={{ width: "100%" }}>
                <source src={`${API}${exercise.AudioUrl}`} />
              </audio>
            </div>
          )}

          {parsedSubmission.questions.map((q: any, qIdx: number) => {
            const exerciseQuestion = questionsList[qIdx] || {};
            const questionType = q.type || "";
            const isFlatMC = questionType === "Hình ảnh chọn đáp án" || questionType === "Trắc nghiệm";

            return (
              <div key={qIdx} style={{ border: "1.5px solid #e0d8cc", borderRadius: 10, padding: 16, marginBottom: 20, background: "#fafafa" }}>
                <h4 style={{ color: "#5a3e2b", marginTop: 0, marginBottom: 10 }}>Câu hỏi {qIdx + 1} ({questionType.replace("-", " ")})</h4>

                {(questionType === "Nghe audio trắc nghiệm" || questionType === "Trắc nghiệm" || questionType === "Tổng hợp" || questionType === "Hình ảnh chọn đáp án") && (
                  <div>
                    {exerciseQuestion.audioUrl && !(questionType === "Nghe audio trắc nghiệm" && exercise?.AudioUrl) && (
                      <div style={{ marginBottom: 10 }}><audio controls style={{ width: "100%" }}><source src={`${API}${exerciseQuestion.audioUrl}`} /></audio></div>
                    )}
                    {exerciseQuestion.prompt && (
                      <div style={{ background: "#fff3e0", padding: 10, borderRadius: 8, marginBottom: 10, fontSize: 13, fontWeight: "600" }}>
                        {exerciseQuestion.prompt}
                      </div>
                    )}
                    {(!isFlatMC && exerciseQuestion.subQuestions && exerciseQuestion.subQuestions.length > 0) ? (
                      exerciseQuestion.subQuestions.map((sub: any, subIdx: number) => {
                        const subAns = q.subQuestions?.[subIdx]?.chosen || "";
                        return renderMCQBlockGrading(sub, subIdx, subAns);
                      })
                    ) : (
                      renderMCQBlockGrading(exerciseQuestion, qIdx, q.chosenAnswer)
                    )}
                  </div>
                )}

                {questionType === "Nối từ" && (
                  <div style={{ marginTop: 10, background: "#fff", padding: 16, borderRadius: 10, border: "1px solid #e0d8cc" }}>
                    <h5 style={{ color: "#000080", fontSize: 14, fontWeight: 700, margin: "0 0 10px 0" }}>Kết quả bài Nối từ vựng (Anh - Anh diễn giải):</h5>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                      <thead>
                        <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                          <th style={{ textAlign: "left", padding: 8 }}>Từ tiếng Anh</th>
                          <th style={{ textAlign: "left", padding: 8 }}>Diễn giải đúng</th>
                          <th style={{ textAlign: "left", padding: 8 }}>Bài làm học sinh</th>
                          <th style={{ textAlign: "center", padding: 8, width: 100 }}>Kết quả</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(q.vocabPairs || []).map((pair: any, pIdx: number) => (
                          <tr key={pIdx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                            <td style={{ padding: 8, fontWeight: 600, color: "#000080" }}>{pair.word}</td>
                            <td style={{ padding: 8, color: "#475569" }}>{pair.meaning}</td>
                            <td style={{ padding: 8, color: pair.studentAnswer ? "#1e293b" : "#94a3b8", fontStyle: pair.studentAnswer ? "normal" : "italic" }}>
                              {pair.studentAnswer || "(Không ghép nối)"}
                            </td>
                            <td style={{ padding: 8, textAlign: "center" }}>
                              {pair.isCorrect ? (
                                <span style={{ color: "#22c55e", fontWeight: "bold" }}>Đúng</span>
                              ) : (
                                <span style={{ color: "#ef4444", fontWeight: "bold" }}>Sai</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <p style={{ margin: "12px 0 0", fontSize: 13, color: "green", fontWeight: 700 }}>
                      Máy chấm tự động: {q.score}/10
                    </p>
                  </div>
                )}

                {questionType === "Nghe chép chính tả" && (
                  <div>
                    {exerciseQuestion.audioUrl && (
                      <div style={{ marginBottom: 10 }}><audio controls style={{ width: "100%" }}><source src={`${API}${exerciseQuestion.audioUrl}`} /></audio></div>
                    )}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div style={{ background: "#fef2f2", padding: 10, borderRadius: 8, border: "1px solid #fecaca" }}>
                        <p style={{ margin: 0, fontSize: 12, color: "#7f1d1d" }}>Bài làm của SV:</p>
                        <p style={{ margin: 0, fontWeight: 700 }}>"{q.essayText}"</p>
                      </div>
                      <div style={{ background: "#f0fdf4", padding: 10, borderRadius: 8, border: "1px solid #86efac" }}>
                        <p style={{ margin: 0, fontSize: 12, color: "#166534" }}>Văn bản đúng:</p>
                        <p style={{ margin: 0, fontWeight: 700, color: "green" }}>"{q.correctText}"</p>
                      </div>
                    </div>
                    <p style={{ margin: "8px 0 0", fontSize: 13, color: "green", fontWeight: 700 }}> Máy chấm tự động: {q.score}/10</p>
                  </div>
                )}

                {questionType === "Điền từ vào đoạn văn" && (
                  <div>
                    {exerciseQuestion.audioUrl && (
                      <div style={{ marginBottom: 10 }}><audio controls style={{ width: "100%" }}><source src={`${API}${exerciseQuestion.audioUrl}`} /></audio></div>
                    )}
                    <div style={{ background: "#fff", border: "1px solid #e0d4c3", padding: 12, borderRadius: 8 }}>
                      <p style={{ margin: "0 0 6px", fontSize: 13, fontWeight: "600" }}>Kết quả điền ô trống:</p>
                      {q.correctAnswers?.map((cAns: string, blankIdx: number) => {
                        const stdAns = q.fillInAnswers?.[blankIdx] || "";
                        const isOk = stdAns.trim().toLowerCase() === cAns.trim().toLowerCase();
                        return (
                          <p key={blankIdx} style={{ margin: "4px 0", fontSize: 13, color: isOk ? "green" : "red" }}>
                            Ô trống [{blankIdx + 1}]: SV điền "{stdAns}" (Đáp án đúng: "{cAns}") {isOk ? "(Đúng)" : "(Sai)"}
                          </p>
                        );
                      })}
                    </div>
                    <p style={{ margin: "8px 0 0", fontSize: 13, color: "green", fontWeight: 700 }}>Máy chấm tự động: {q.score}/10</p>
                  </div>
                )}

                {questionType === "Luyện phát âm (check phát âm tự động)" && (
                  <div>
                    <div style={{ background: "#eff6ff", padding: 10, borderRadius: 8, marginBottom: 10 }}>
                      <p style={{ margin: 0, fontSize: 12, color: "#1d4ed8" }}>Đoạn văn mẫu:</p>
                      <p style={{ margin: 0, fontWeight: 700, color: "#1e3a8a" }}>"{q.correctText}"</p>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div style={{ background: "#fcf9f2", padding: 10, borderRadius: 8, border: "1px solid #f0e8dc" }}>
                        <p style={{ margin: 0, fontSize: 12, color: "#666" }}>Máy nghe được SV nói:</p>
                        <p style={{ margin: 0, fontStyle: "italic" }}>"{q.spokenText || "—"}"</p>
                      </div>
                      <div style={{ background: "#f0fdf4", padding: 10, borderRadius: 8, border: "1px solid #86efac", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                        <p style={{ margin: 0, fontSize: 12, color: "#166534" }}>Điểm so sánh phát âm:</p>
                        <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "green" }}>{q.score}/10</p>
                      </div>
                    </div>
                  </div>
                )}

                {questionType === "Nói theo chủ đề (ghi âm nộp GV)" && (
                  <div>
                    <div style={{ background: "#fff3e0", padding: 10, borderRadius: 8, marginBottom: 10 }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>{exerciseQuestion.prompt}</p>
                    </div>
                    <div style={{ background: "#fff", border: "1px solid #e0d4c3", padding: 12, borderRadius: 8 }}>
                      <p style={{ margin: "0 0 6px", fontWeight: "600", fontSize: 13 }}>🎤 File ghi âm bài nói:</p>
                      {q.audioUrl ? (
                        <audio src={`${API}${q.audioUrl}`} controls style={{ width: "100%" }} />
                      ) : (
                        <p style={{ color: "red", fontStyle: "italic", margin: 0 }}>SV không thực hiện ghi âm</p>
                      )}
                      {q.essayText && (
                        <div style={{ marginTop: 10, borderTop: "1px dashed #eee", paddingTop: 6 }}>
                          <p style={{ margin: 0, fontSize: 12, color: "#666" }}>Ghi chú của SV:</p>
                          <p style={{ margin: 0, fontStyle: "italic" }}>"{q.essayText}"</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {questionType === "Sắp xếp từ thành câu" && (
                  <div>
                    <div style={{ background: "#fcf9f2", padding: 10, borderRadius: 8, marginBottom: 10 }}>
                      <p style={{ margin: 0, fontSize: 12, color: "#666" }}>Đề bài: {exerciseQuestion.text}</p>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div style={{ background: q.score === 10 ? "#f0fdf4" : "#fef2f2", padding: 10, borderRadius: 8, border: `1px solid ${q.score === 10 ? "#86efac" : "#fecaca"}` }}>
                        <p style={{ margin: 0, fontSize: 12 }}>SV sắp xếp:</p>
                        <p style={{ margin: 0, fontWeight: 700 }}>{q.essayText}</p>
                      </div>
                      <div style={{ background: "#f0fdf4", padding: 10, borderRadius: 8, border: "1px solid #86efac" }}>
                        <p style={{ margin: 0, fontSize: 12, color: "green" }}>Đáp án đúng:</p>
                        <p style={{ margin: 0, fontWeight: 700, color: "green" }}>{q.correctText}</p>
                      </div>
                    </div>
                  </div>
                )}

                {questionType === "Sắp xếp câu thành đoạn văn" && (
                  <div>
                    <div style={{ background: "#fff", border: "1px solid #e0d4c3", padding: 12, borderRadius: 8 }}>
                      <p style={{ margin: "0 0 6px", fontSize: 13, fontWeight: "600" }}>Thứ tự câu SV xếp:</p>
                      {q.sentences?.map((s: string, sIdx: number) => (
                        <p key={sIdx} style={{ margin: "4px 0", fontSize: 13 }}>
                          Dòng {sIdx + 1}: "{s}"
                        </p>
                      ))}
                    </div>
                    <p style={{ margin: "8px 0 0", fontSize: 13, color: "green", fontWeight: 700 }}>Máy chấm tự động: {q.score}/10</p>
                  </div>
                )}

                {questionType === "Viết đoạn văn ngắn" && (
                  <div>
                    <div style={{ background: "#fff3e0", padding: 10, borderRadius: 8, marginBottom: 10 }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>{exerciseQuestion.prompt}</p>
                    </div>
                    <div style={{ background: "#fff", border: "1px solid #e0d4c3", padding: 12, borderRadius: 8 }}>
                      <p style={{ margin: 0, whiteSpace: "pre-wrap", fontSize: 14 }}>{q.essayText || <em style={{ color: "#aaa" }}>Không trả lời</em>}</p>
                      {q.essayText && (
                        <p style={{ margin: "8px 0 0", fontSize: 12, color: "#666", fontWeight: "600" }}>
                          Số từ: {q.essayText.trim().split(/\s+/).filter(Boolean).length} từ
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {questionType === "Trắc nghiệm đọc hiểu (chia đôi màn hình)" && (
                  <div>
                    <div style={{ background: "#fff", border: "1px solid #e0d4c3", padding: 10, borderRadius: 8, maxHeight: 100, overflowY: "auto", marginBottom: 12 }}>
                      <p style={{ margin: 0, fontSize: 13 }}>{exerciseQuestion.text}</p>
                    </div>
                    {exerciseQuestion.subQuestions?.map((sub: any, subIdx: number) => {
                      const subAns = q.subQuestions?.[subIdx]?.chosen || "";
                      return renderMCQBlockGrading(sub, subIdx, subAns);
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* ── CASE 3: OLD TEXT SUBMISSIONS ── */
        <div>
          {deiBai && (
            <div className="cb-passage">
              <h4>Đề bài:</h4>
              <p>{deiBai}</p>
            </div>
          )}

          {isMC && mcQuestions.filter(q => q.options.length > 0).length > 0 && (
            <div className="cb-qa-list">
              {mcQuestions.map((q, i) => {
                const ans = mcAnswers[i];
                return (
                  <div key={i} className="cb-qa-item">
                    <div className="cb-question">
                      <span className="cb-q-num">Câu {i + 1}:</span> {q.question}
                    </div>
                    <div style={{ marginTop: 8 }}>
                      {q.options.map((opt: any) => {
                        const isChosen = ans?.chosen === opt.label;
                        const isCorrect = opt.label === q.correct;
                        const isWrong = isChosen && !isCorrect;
                        return (
                          <div key={opt.label} style={{
                            display: "flex", alignItems: "center", gap: 8,
                            padding: "7px 12px", borderRadius: 8, marginBottom: 6,
                            background: isCorrect ? "#f0fdf4" : isWrong ? "#fef2f2" : "#fafafa",
                            border: `1px solid ${isCorrect ? "#86efac" : isWrong ? "#fecaca" : "#f0e8dc"}`
                          }}>
                            <span style={{ fontWeight: 700, minWidth: 20 }}>{opt.label}.</span>
                            <span>{opt.text}</span>
                            {isChosen && <span style={{ marginLeft: "auto", fontSize: 13, fontWeight: 700, color: isCorrect ? "green" : "red" }}>SV chọn</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!isMC && baiNop.NoiDung && (
            <div style={{ background: "#fff", border: "1px solid #e0d4c3", padding: 15, borderRadius: 8, whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
              {baiNop.NoiDung}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
