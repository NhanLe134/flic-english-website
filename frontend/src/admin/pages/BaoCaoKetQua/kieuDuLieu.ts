export interface ExerciseHeader {
  MaBaiTap: number
  TenBai: string
  TenBuoiHoc: string | null
  ThuTu: number | null
  MaBuoiHoc: number | null
  MaLopHoc: number | null
  TenLop: string | null
}

export interface LessonInfo {
  MaBuoiHoc: number
  TenBuoiHoc: string | null
  ThuTu: number | null
  MaLopHoc: number | null
  TenLop: string | null
  ActiveBuoiHocId: number | null
}

export interface StudentResult {
  id: number
  studentId: string
  mssv: string | null
  studentName: string
  gender: string
  className: string
  courseName: string
  enrollDate: string
  status: string
  rawScores: Record<number, number | null>
  diemTB: number | null
  classId: number | null
}
