export interface Course {
  id: number;
  title: string;
  desc: string;
  level: string;
  status: string;
  created: string;
  category: string;
  classCount: number;
  Listening: boolean;
  Reading: boolean;
  Speaking: boolean;
  Writing: boolean;
  HinhAnh?: string;
}

export interface LopHoc {
  id: number;
  name: string;
  schedule: string;
  students: number;
  maxStudents: number;
  progress: number;
  lessonCount: number;
  completed: boolean;
  status: string;
  maLop?: number;
}

export interface Teacher {
  MaGiangVien: number;
  MaNguoiDung: number;
  HoTen: string;
}
