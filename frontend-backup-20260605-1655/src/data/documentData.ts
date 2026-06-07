export interface DocumentItem {
  id: number;
  title: string;
  description: string;
  date: string;
  content: string;
}

export const documentData: DocumentItem[] = [
  {
    id: 1,
    title: "Grammar Handbook – Level B1",
    description: "Tổng hợp các điểm ngữ pháp quan trọng từ A2–B1",
    date: "25/10/2025",
    content: `
Present Perfect Tense

Structure:
S + have/has + V3

Example:
- I have finished my homework.
- She has lived here for 5 years.

Usage:
- Diễn tả hành động xảy ra trong quá khứ nhưng còn liên quan đến hiện tại.
- Diễn tả kinh nghiệm.
`
  },

  {
    id: 2,
    title: "Vocabulary Builder – Daily Life",
    description: "Ôn tập từ vựng chủ đề cuộc sống hàng ngày kèm ví dụ.",
    date: "20/10/2025",
    content: `
Morning Routine – Thói quen buổi sáng

1. Wake up: thức dậy
Example: I usually wake up at 6 a.m.

2. Get up: ra khỏi giường
Example: She gets up and makes her bed.

3. Brush teeth: đánh răng
Example: He brushes his teeth twice a day.

4. Take a shower: tắm
Example: She takes a shower before breakfast.

5. Have breakfast: ăn sáng
Example: They have breakfast together.
`
  },

  {
    id: 3,
    title: "Listening Practice Guide",
    description: "30 đoạn hội thoại luyện nghe và phân tích từ vựng khó.",
    date: "19/10/2025",
    content: `
Listening Practice

Listen to the dialogue and answer the questions.

Dialogue
A: What time do you wake up?
B: I wake up at 6 a.m. every day.

Questions
1. What time does he wake up?
2. What does he do after waking up?
`
  },

  {
    id: 4,
    title: "Speaking Tips – Confident Conversations",
    description: "15 mẹo giúp nói tiếng Anh tự nhiên và lưu loát hơn.",
    date: "17/10/2025",
    content: `
Tips for Speaking English

- Practice speaking every day.
- Don't be afraid of making mistakes.
- Think in English.
- Use simple sentences first.

Example Conversation

A: How are you today?
B: I'm fine, thank you.
`
  },

  {
    id: 5,
    title: "Reading Skills Workbook – Intermediate",
    description: "Bài đọc ngắn rèn kỹ năng hiểu ý chính & chi tiết.",
    date: "15/10/2025",
    content: `
Reading Practice

Read the passage and answer the questions.

Anna lives in London. She works in a small company.
Every morning she takes the bus to work.

Questions
1. Where does Anna live?
2. How does she go to work?
`
  },

  {
    id: 6,
    title: "Writing Templates – Academic & General",
    description: "Mẫu viết luận, thư, báo cáo chuẩn TOEIC.",
    date: "14/10/2025",
    content: `
Email Writing Template

Dear Mr. Smith,

I am writing to inform you about the meeting tomorrow.
Please let me know if you can attend.

Best regards,
John
`
  }
];