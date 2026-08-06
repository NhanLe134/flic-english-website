export const GV_PERMISSIONS = [
  { code: "LECTURE_CREATE", label: "Đăng bài giảng" },
  { code: "BAITAP_CREATE", label: "Đăng bài tập" },
  { code: "QUIZ_CREATE", label: "Đăng bài kiểm tra" },
  { code: "EXTRA_PRACTICE_CREATE", label: "Đăng bài luyện tập thêm" },
  { code: "DOCUMENT_CREATE_PENDING", label: "Đăng tài liệu" },
  { code: "STUDENT_GRADE", label: "Chấm điểm bài tập" },
  { code: "GRADEBOOK_VIEW_CLASS", label: "Xem điểm lớp phụ trách" },
  { code: "SUBMISSION_VIEW", label: "Xem bài làm của SV" }
];

export const QTND_PERMISSIONS = [
  { code: "CLASS_MANAGE", label: "Tạo & quản lý lớp" },
  { code: "STUDENT_ASSIGN", label: "Xếp lớp cho SV" },
  { code: "LECTURE_CREATE", label: "Đăng bài giảng" },
  { code: "BAITAP_CREATE", label: "Đăng bài tập" },
  { code: "QUIZ_CREATE", label: "Đăng bài kiểm tra" },
  { code: "EXTRA_PRACTICE_CREATE", label: "Đăng bài luyện tập thêm" },
  { code: "DOCUMENT_CREATE_DIRECT", label: "Đăng tài liệu" },
  { code: "CONTENT_APPROVE", label: "Duyệt bài & tài liệu của GV" },
  { code: "STUDENT_GRADE", label: "Chấm điểm bài tập" },
  { code: "GRADEBOOK_VIEW_ALL", label: "Xem điểm toàn hệ thống" },
  { code: "SUBMISSION_VIEW", label: "Xem bài làm của SV" }
];

export const isActive = (s: string) => s === "Active" || s === "Hoạt động" || s === "active";

export const roleColor: Record<string, { bg: string; color: string }> = {
  "Học Viên": { bg: "#e3f2fd", color: "#1565c0" },
  "Giảng Viên": { bg: "#e8f5e9", color: "#2e7d32" },
  "Quản Trị Viên": { bg: "#fce4ec", color: "#c62828" },
  "Quản Trị Nội Dung": { bg: "#fff3e0", color: "#e65100" },
};
