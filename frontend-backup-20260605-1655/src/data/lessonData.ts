export interface Lesson {
  id: number;
  name: string;
  type: string;
  duration: string;
  status: "published" | "draft";
}

export const lessonData: Lesson[] = [
  {
    id: 1,
    name: "Grammar – Tenses",
    type: "Video",
    duration: "15p",
    status: "published",
  },
  {
    id: 2,
    name: "English Listening",
    type: "PDF",
    duration: "20p",
    status: "draft",
  },
  {
    id: 3,
    name: "Vocabulary – Daily Life",
    type: "Video",
    duration: "10p",
    status: "published",
  },
  {
    id: 4,
    name: "Reading Practice",
    type: "PDF",
    duration: "25p",
    status: "published",
  },
  {
    id: 5,
    name: "Conversation Basics",
    type: "Video",
    duration: "18p",
    status: "draft",
  },
];