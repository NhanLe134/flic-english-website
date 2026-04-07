import type { Course, Skill, StudentResult } from './types'

export const courses: Course[] = [
  {
    id: 1, title: 'TOEIC 650+ Intensive', teacher: 'Nguyễn Văn A', level: 'TOEIC',
    category: 'Luyện thi', students: 45, status: 'Hoạt động', created: '10/01/2025',
    desc: 'Khóa học luyện thi TOEIC đạt 650+ điểm.',
    classes: [
      {
        id: 101, name: 'TOEIC-01', teacher: 'Nguyễn Văn A',
        schedule: 'Thứ 2 & 4, 18:00-20:00', startDate: '01/03/2025', endDate: '30/05/2025',
        maxStudents: 30, enrolled: 3, status: 'Đang học',
        enrolledStudents: [
          { studentId: 'B238BIL1H01', name: 'Nguyễn Văn An', gender: 'Nam', phone: '0912345678', enrollDate: '01/03/2025', status: 'Đang học' },
          { studentId: 'B238BIL1H02', name: 'Trần Thị Bích', gender: 'Nữ', phone: '0912345679', enrollDate: '01/03/2025', status: 'Đang học' },
          { studentId: 'B238BIL1H03', name: 'Lê Minh Cường', gender: 'Nam', phone: '0912345680', enrollDate: '02/03/2025', status: 'Đang học' },
        ],
        lessonRoadmap: [
          { id: 1, title: 'Buổi 1: Ngữ pháp cơ bản - Thì hiện tại', description: 'Ôn tập các thì hiện tại đơn, hiện tại tiếp diễn', order: 1, type: 'Video', duration: '45p', status: 'published' },
          { id: 2, title: 'Buổi 2: Từ vựng TOEIC Part 5', description: '500 từ vựng thông dụng trong TOEIC', order: 2, type: 'PDF', duration: '60p', status: 'published' },
          { id: 3, title: 'Buổi 3: Luyện nghe Part 1 & 2', description: 'Kỹ thuật nghe và nhận dạng từ khóa', order: 3, type: 'Video', duration: '50p', status: 'published' },
          { id: 4, title: 'Bài tập 1: Ngữ pháp', description: 'Bài kiểm tra ngữ pháp cơ bản', order: 4, type: 'Assignment', duration: '30p', status: 'published' },
          { id: 5, title: 'Buổi 4: Reading Part 5 & 6', description: 'Kỹ thuật điền từ vào chỗ trống', order: 5, type: 'Video', duration: '55p', status: 'published' },
          { id: 6, title: 'Bài tập 2: Reading', description: 'Bài kiểm tra kỹ năng đọc hiểu', order: 6, type: 'Assignment', duration: '40p', status: 'draft' },
        ],
      },
      {
        id: 102, name: 'TOEIC-02', teacher: 'Trần Thị B',
        schedule: 'Thứ 3 & 5, 18:00-20:00', startDate: '15/04/2025', endDate: '15/07/2025',
        maxStudents: 30, enrolled: 2, status: 'Đang học',
        enrolledStudents: [
          { studentId: 'B238BIL1H04', name: 'Phạm Thị Dung', gender: 'Nữ', phone: '0912345681', enrollDate: '15/04/2025', status: 'Đang học' },
          { studentId: 'B238BIL1H05', name: 'Hoàng Quốc Huy', gender: 'Nam', phone: '0912345682', enrollDate: '15/04/2025', status: 'Đang học' },
        ],
        lessonRoadmap: [
          { id: 1, title: 'Buổi 1: Giới thiệu khóa học', description: 'Tổng quan về cấu trúc bài thi TOEIC', order: 1, type: 'Video', duration: '30p', status: 'published' },
          { id: 2, title: 'Buổi 2: Part 1 - Photographs', description: 'Mô tả hình ảnh trong TOEIC Listening', order: 2, type: 'Video', duration: '45p', status: 'published' },
        ],
      },
    ],
  },
  {
    id: 2, title: 'IELTS Speaking Band 7', teacher: 'Trần Thị B', level: 'IELTS',
    category: 'Luyện thi', students: 32, status: 'Hoạt động', created: '15/01/2025',
    desc: 'Luyện Speaking IELTS band 7.0 trở lên.',
    classes: [
      {
        id: 201, name: 'IELTS-SP-01', teacher: 'Trần Thị B',
        schedule: 'Thứ 7, 08:00-11:00', startDate: '01/02/2025', endDate: '30/04/2025',
        maxStudents: 20, enrolled: 2, status: 'Đang học',
        enrolledStudents: [
          { studentId: 'B238BIL1H06', name: 'Đặng Thị Lan', gender: 'Nữ', phone: '0912345683', enrollDate: '01/02/2025', status: 'Đang học' },
          { studentId: 'B238BIL1H07', name: 'Nguyễn Thành Nam', gender: 'Nam', phone: '0912345684', enrollDate: '01/02/2025', status: 'Hoàn thành' },
        ],
        lessonRoadmap: [
          { id: 1, title: 'Part 1: Introduction & Interview', description: 'Luyện trả lời câu hỏi cá nhân', order: 1, type: 'Video', duration: '40p', status: 'published' },
          { id: 2, title: 'Bài tập 1: Speaking Part 1', description: 'Luyện nói về chủ đề quen thuộc', order: 2, type: 'Assignment', duration: '20p', status: 'published' },
        ],
      },
    ],
  },
  {
    id: 3, title: 'Business English Essentials', teacher: 'Lê Văn C', level: 'Intermediate',
    category: 'Giao tiếp', students: 28, status: 'Hoạt động', created: '20/01/2025',
    desc: 'Tiếng Anh thương mại cho môi trường công sở.',
    classes: [
      { id: 301, name: 'BIZ-01', teacher: 'Lê Văn C', schedule: 'Thứ 2 & 6, 17:30-19:30', startDate: '10/06/2025', endDate: '10/09/2025', maxStudents: 25, enrolled: 0, status: 'Sắp khai giảng', enrolledStudents: [], lessonRoadmap: [] },
    ],
  },
  { id: 4, title: 'English for Beginners A1', teacher: 'Phạm Thị D', level: 'Beginner', category: 'Cơ bản', students: 60, status: 'Hoạt động', created: '25/01/2025', desc: 'Tiếng Anh cơ bản dành cho người mới bắt đầu.', classes: [] },
  { id: 5, title: 'Advanced Grammar Mastery', teacher: 'Hoàng Văn E', level: 'Advanced', category: 'Ngữ pháp', students: 15, status: 'Ẩn', created: '01/02/2025', desc: 'Ngữ pháp nâng cao cho người học tiếng Anh.', classes: [] },
  {
    id: 6, title: 'Everyday Conversation Skills', teacher: 'Võ Thị F', level: 'Elementary',
    category: 'Giao tiếp', students: 38, status: 'Hoạt động', created: '05/02/2025',
    desc: 'Kỹ năng hội thoại tiếng Anh hàng ngày.',
    classes: [
      { id: 601, name: 'CONV-01', teacher: 'Võ Thị F', schedule: 'Chủ nhật, 08:00-10:00', startDate: '01/01/2025', endDate: '31/03/2025', maxStudents: 20, enrolled: 0, status: 'Đã kết thúc', enrolledStudents: [], lessonRoadmap: [] },
    ],
  },
]

export const skills: Skill[] = [
  { id: 1, title: 'Reading Comprehension: The Ocean World', category: 'Reading', level: 'Intermediate', teacher: 'Nguyễn Văn A', duration: 30, status: 'Hoạt động', created: '10/01/2025', desc: 'Bài đọc về đại dương và sinh vật biển.', content: 'Reading passages about ocean life and marine biology.' },
  { id: 2, title: 'Listening: Daily News Podcast', category: 'Listening', level: 'Intermediate', teacher: 'Trần Thị B', duration: 25, status: 'Hoạt động', created: '12/01/2025', desc: 'Luyện nghe tin tức hàng ngày.', content: 'Audio clips from news podcasts with transcript and exercises.' },
  { id: 3, title: 'Speaking: Job Interview Practice', category: 'Speaking', level: 'Advanced', teacher: 'Lê Văn C', duration: 45, status: 'Chờ duyệt', created: '15/01/2025', desc: 'Luyện kỹ năng phỏng vấn xin việc bằng tiếng Anh.', content: 'Mock interview scenarios and sample answers.' },
  { id: 4, title: 'Writing: Academic Essay Structure', category: 'Writing', level: 'Advanced', teacher: 'Phạm Thị D', duration: 60, status: 'Chờ duyệt', created: '18/01/2025', desc: 'Cấu trúc bài luận học thuật chuẩn IELTS.', content: 'Essay writing templates and step-by-step guide.' },
  { id: 5, title: 'Grammar: Conditional Sentences', category: 'Grammar', level: 'Intermediate', teacher: 'Hoàng Văn E', duration: 20, status: 'Ẩn', created: '20/01/2025', desc: 'Câu điều kiện loại 1, 2, 3 trong tiếng Anh.', content: 'Exercises and explanations for conditional sentences.' },
  { id: 6, title: 'Vocabulary: Business & Finance', category: 'Vocabulary', level: 'Advanced', teacher: 'Võ Thị F', duration: 35, status: 'Hoạt động', created: '22/01/2025', desc: 'Từ vựng kinh doanh và tài chính.', content: 'Word lists and practice exercises.' },
  { id: 7, title: 'Reading: Short Stories for Beginners', category: 'Reading', level: 'Beginner', teacher: 'Nguyễn Văn A', duration: 20, status: 'Hoạt động', created: '25/01/2025', desc: 'Truyện ngắn tiếng Anh dành cho người mới.', content: 'Simple short stories with comprehension questions.' },
  { id: 8, title: 'Listening: TOEIC Part 3 & 4', category: 'Listening', level: 'TOEIC', teacher: 'Trần Thị B', duration: 40, status: 'Chờ duyệt', created: '28/01/2025', desc: 'Luyện nghe TOEIC Part 3 và 4.', content: 'TOEIC listening practice tracks with full scripts.' },
]

export const studentResultsData: StudentResult[] = [
  {
    studentId: 'B238BIL1H01', studentName: 'Nguyễn Văn An', gender: 'Nam',
    classId: 101, className: 'TOEIC-01', courseName: 'TOEIC 650+ Intensive',
    enrollDate: '01/03/2025', status: 'Đang học',
    exerciseScores: [
      { exerciseId: 1, exerciseName: 'Bài tập 1: Ngữ pháp', lessonName: 'Buổi 4: Ngữ pháp cơ bản', score: 8.5, maxScore: 10, submittedAt: '15/03/2025' },
      { exerciseId: 2, exerciseName: 'Bài tập 2: Reading', lessonName: 'Buổi 5: Reading Part 5 & 6', score: 7.0, maxScore: 10, submittedAt: '22/03/2025' },
      { exerciseId: 3, exerciseName: 'Bài tập 3: Listening', lessonName: 'Buổi 6: Luyện nghe', score: null, maxScore: 10, submittedAt: null },
    ],
    avgScore: 7.75,
  },
  {
    studentId: 'B238BIL1H02', studentName: 'Trần Thị Bích', gender: 'Nữ',
    classId: 101, className: 'TOEIC-01', courseName: 'TOEIC 650+ Intensive',
    enrollDate: '01/03/2025', status: 'Đang học',
    exerciseScores: [
      { exerciseId: 1, exerciseName: 'Bài tập 1: Ngữ pháp', lessonName: 'Buổi 4: Ngữ pháp cơ bản', score: 9.0, maxScore: 10, submittedAt: '14/03/2025' },
      { exerciseId: 2, exerciseName: 'Bài tập 2: Reading', lessonName: 'Buổi 5: Reading Part 5 & 6', score: 8.5, maxScore: 10, submittedAt: '21/03/2025' },
      { exerciseId: 3, exerciseName: 'Bài tập 3: Listening', lessonName: 'Buổi 6: Luyện nghe', score: 8.0, maxScore: 10, submittedAt: '28/03/2025' },
    ],
    avgScore: 8.5,
  },
  {
    studentId: 'B238BIL1H03', studentName: 'Lê Minh Cường', gender: 'Nam',
    classId: 101, className: 'TOEIC-01', courseName: 'TOEIC 650+ Intensive',
    enrollDate: '02/03/2025', status: 'Đang học',
    exerciseScores: [
      { exerciseId: 1, exerciseName: 'Bài tập 1: Ngữ pháp', lessonName: 'Buổi 4: Ngữ pháp cơ bản', score: 6.0, maxScore: 10, submittedAt: '16/03/2025' },
      { exerciseId: 2, exerciseName: 'Bài tập 2: Reading', lessonName: 'Buổi 5: Reading Part 5 & 6', score: 5.5, maxScore: 10, submittedAt: '23/03/2025' },
      { exerciseId: 3, exerciseName: 'Bài tập 3: Listening', lessonName: 'Buổi 6: Luyện nghe', score: null, maxScore: 10, submittedAt: null },
    ],
    avgScore: 5.75,
  },
  {
    studentId: 'B238BIL1H04', studentName: 'Phạm Thị Dung', gender: 'Nữ',
    classId: 102, className: 'TOEIC-02', courseName: 'TOEIC 650+ Intensive',
    enrollDate: '15/04/2025', status: 'Đang học',
    exerciseScores: [
      { exerciseId: 1, exerciseName: 'Bài tập 1: Từ vựng Part 5', lessonName: 'Buổi 2: Từ vựng TOEIC', score: 7.5, maxScore: 10, submittedAt: '25/04/2025' },
      { exerciseId: 2, exerciseName: 'Bài tập 2: Listening Part 1', lessonName: 'Buổi 3: Part 1', score: 8.0, maxScore: 10, submittedAt: '02/05/2025' },
    ],
    avgScore: 7.75,
  },
  {
    studentId: 'B238BIL1H05', studentName: 'Hoàng Quốc Huy', gender: 'Nam',
    classId: 102, className: 'TOEIC-02', courseName: 'TOEIC 650+ Intensive',
    enrollDate: '15/04/2025', status: 'Đang học',
    exerciseScores: [
      { exerciseId: 1, exerciseName: 'Bài tập 1: Từ vựng Part 5', lessonName: 'Buổi 2: Từ vựng TOEIC', score: 9.5, maxScore: 10, submittedAt: '24/04/2025' },
      { exerciseId: 2, exerciseName: 'Bài tập 2: Listening Part 1', lessonName: 'Buổi 3: Part 1', score: 9.0, maxScore: 10, submittedAt: '01/05/2025' },
    ],
    avgScore: 9.25,
  },
  {
    studentId: 'B238BIL1H06', studentName: 'Đặng Thị Lan', gender: 'Nữ',
    classId: 201, className: 'IELTS-SP-01', courseName: 'IELTS Speaking Band 7',
    enrollDate: '01/02/2025', status: 'Đang học',
    exerciseScores: [
      { exerciseId: 1, exerciseName: 'Bài tập 1: Speaking Part 1', lessonName: 'Part 1: Introduction', score: 7.0, maxScore: 10, submittedAt: '10/02/2025' },
      { exerciseId: 2, exerciseName: 'Bài tập 2: Long Turn', lessonName: 'Part 2: Long Turn', score: 7.5, maxScore: 10, submittedAt: '17/02/2025' },
    ],
    avgScore: 7.25,
  },
  {
    studentId: 'B238BIL1H07', studentName: 'Nguyễn Thành Nam', gender: 'Nam',
    classId: 201, className: 'IELTS-SP-01', courseName: 'IELTS Speaking Band 7',
    enrollDate: '01/02/2025', status: 'Hoàn thành',
    exerciseScores: [
      { exerciseId: 1, exerciseName: 'Bài tập 1: Speaking Part 1', lessonName: 'Part 1: Introduction', score: 8.5, maxScore: 10, submittedAt: '08/02/2025' },
      { exerciseId: 2, exerciseName: 'Bài tập 2: Long Turn', lessonName: 'Part 2: Long Turn', score: 9.0, maxScore: 10, submittedAt: '15/02/2025' },
    ],
    avgScore: 8.75,
  },
]
