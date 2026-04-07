export interface Course {
  id: number
  title: string
  teacher: string
  level: string
  category: string
  students: number
  status: 'Hoạt động' | 'Ẩn'
  created: string
  desc: string
  classes: ClassRoom[]
}

export interface LessonRoadmap {
  id: number
  title: string
  description: string
  order: number
  type: 'Video' | 'PDF' | 'Quiz' | 'Assignment'
  duration: string
  date: string
  status: 'published' | 'draft'
}

export interface EnrolledStudent {
  studentId: string
  name: string
  gender: string
  phone: string
  enrollDate: string
  status: 'Đang học' | 'Hoàn thành' | 'Đã hủy'
}

export interface ClassRoom {
  id: number
  name: string
  teacher: string
  schedule: string
  startDate: string
  endDate: string
  maxStudents: number
  enrolled: number
  status: 'Đang học' | 'Sắp khai giảng' | 'Đã kết thúc'
  enrolledStudents?: EnrolledStudent[]
  lessonRoadmap?: LessonRoadmap[]
}

export interface Skill {
  id: number
  title: string
  category: 'Reading' | 'Listening' | 'Speaking' | 'Writing' | 'Grammar' | 'Vocabulary'
  level: string
  teacher: string
  duration: number
  status: 'Hoạt động' | 'Ẩn' | 'Chờ duyệt'
  created: string
  desc: string
  content?: string
}

export interface ExerciseScore {
  exerciseId: number
  exerciseName: string
  lessonName: string
  score: number | null
  maxScore: number
  submittedAt: string | null
}

export interface StudentResult {
  studentId: string
  studentName: string
  gender: string
  classId: number
  className: string
  courseName: string
  enrollDate: string
  status: 'Đang học' | 'Hoàn thành' | 'Đã hủy'
  exerciseScores: ExerciseScore[]
  avgScore: number | null
}
