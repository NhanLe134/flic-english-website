/**
 * Các hàm trợ giúp để tính điểm bài tập của sinh viên và phân tích cú pháp câu hỏi
 */

/**
 * Tính điểm từ 0 đến 10 cho bài nghe chép chính tả (listening-dictation) dựa trên tỷ lệ từ trùng khớp.
 */
export const calcDictationScore = (studentText: string, correctText: string): number => {
  const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();
  const std = clean(studentText);
  const cor = clean(correctText);
  if (!cor) return 0;
  if (std === cor) return 10;
  
  const stdWords = std.split(" ").filter(Boolean);
  const corWords = cor.split(" ").filter(Boolean);
  if (corWords.length === 0) return 0;
  
  let correctCount = 0;
  corWords.forEach((word, idx) => {
    if (stdWords[idx] === word) {
      correctCount++;
    }
  });
  return Math.round((correctCount / corWords.length) * 10 * 10) / 10;
};

/**
 * Tính điểm phát âm từ 0 đến 10 cho bài tập nói (speaking) dựa trên việc các từ khóa mong đợi có xuất hiện trong phần nói được nhận diện hay không.
 */
export const calcSpeechScore = (spoken: string, expected: string): number => {
  if (!expected) return 0;
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
  const spokenWords = normalize(spoken).split(/\s+/).filter(Boolean);
  const expectedWords = normalize(expected).split(/\s+/).filter(Boolean);
  if (expectedWords.length === 0) return 0;
  
  const correctCount = spokenWords.filter(w => expectedWords.includes(w)).length;
  return Math.min(Math.round((correctCount / expectedWords.length) * 10 * 10) / 10, 10);
};

/**
 * Phân tích trường câu hỏi thô từ cơ sở dữ liệu thành các đối tượng cấu trúc
 */
export const parseQuestionsList = (exercise: any, isExam: boolean, parsedContent: any): any[] => {
  if (isExam) return []; // Bài thi sử dụng các phần (sections), không phải danh sách câu hỏi tuyến tính
  
  if (!exercise?.Questions) {
    // Phương án dự phòng cho các mẫu câu hỏi đơn lẻ
    return [{
      question: exercise?.Title || "",
      audioUrl: exercise?.AudioUrl || "",
      imageUrl: parsedContent?.imageUrl || "",
      text: parsedContent?.text || exercise?.Content || "",
      prompt: parsedContent?.prompt || exercise?.Content || "",
      level: parsedContent?.level || "Đọc theo câu",
      explanation: ""
    }];
  }

  try {
    if (exercise.Questions.trim().startsWith("[")) {
      return JSON.parse(exercise.Questions);
    }
  } catch (e) {
    // Tiếp tục nếu phân tích cú pháp JSON thất bại
  }

  // Phương án dự phòng cho định dạng văn bản tùy chỉnh cũ
  const exType = (exercise?.Type || "").toLowerCase();
  const isMultiple = ["multiple", "quiz", "trắc nghiệm", "reading-vocab-mcq", "writing-tense-mcq"].includes(exType);
  const isListening = ["listening", "nghe", "listening-mcq", "listening-image", "listening-dictation", "listening-fill-in"].includes(exType);
  const isReadingSplit = exType === "reading-split";

  if (isMultiple || isListening || isReadingSplit) {
    const raw = exercise.Questions;
    if (raw.includes("###") || raw.includes("||")) {
      return raw.split("###").map((block: string) => {
        const parts = block.split("||");
        const question = parts[0]?.trim() || "";
        const rest = parts[1] || "";
        const items = rest.split("|");
        const options: { label: string; text: string }[] = [];
        let correct = "A";
        let explanation = "";
        
        items.forEach(item => {
          const trimmed = item.trim();
          if (trimmed.startsWith("Đáp án đúng:")) {
            correct = trimmed.replace("Đáp án đúng:", "").trim();
          } else if (trimmed.startsWith("Giải thích:")) {
            explanation = trimmed.replace("Giải thích:", "").trim();
          } else {
            const match = trimmed.match(/^([A-D])\.\s*(.+)/);
            if (match) options.push({ label: match[1], text: match[2] });
          }
        });
        return { question, answers: options.map(o => o.text), correct, explanation };
      }).filter((q: any) => q.question);
    }
  }

  // Phương án dự phòng cho một mục dựa trên loại bài tập
  if (exType === "listening-dictation") {
    return [{ audioUrl: exercise.AudioUrl, text: exercise.Content }];
  }
  if (exType === "listening-fill-in") {
    return [{ audioUrl: exercise.AudioUrl, text: exercise.Content, fillInAnswers: (exercise.Questions || "").split("|").map((s: string) => s.trim()) }];
  }
  if (exType === "speaking-pronounce") {
    return [{ text: parsedContent?.text || exercise.Content, level: parsedContent?.level || "Đọc theo câu", explanation: exercise.Questions || "" }];
  }
  if (exType === "speaking-topic") {
    return [{ prompt: parsedContent?.prompt || exercise.Content, imageUrl: parsedContent?.imageUrl || "" }];
  }
  if (exType === "writing-order-words") {
    return [{ text: exercise.Content, correctSentence: exercise.Questions }];
  }
  if (exType === "writing-order-sentences") {
    return [{ sentences: (exercise.Questions || "").split("###").map((s: string) => s.trim()).filter(Boolean) }];
  }
  if (exType === "writing-essay") {
    return [{ prompt: exercise.Content }];
  }

  return [{ question: exercise.Title, text: exercise.Content }];
};
