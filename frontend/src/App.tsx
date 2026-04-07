import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import TeacherLayout from "./layout/TeacherLayout"
import Home from "./pages/Home"
import AboutPage from "./pages/AboutPage"
import CoursesPageHome from "./pages/CoursesPageHome"
import CourseDetailHome from "./pages/CourseDetailHome"
import Register from "./pages/Register"
import RegisterSuccess from "./pages/RegisterSuccess"
import Login from "./pages/Login"
import QuanLyKhoaHoc from "./pages/QuanLyKhoaHoc"
import ForgotPassword from "./pages/ForgotPassword"
import ResetSuccess from "./pages/ResetSuccess"
import CourseDetail from "./pages/CourseDetail"
import LessonList from "./pages/LessonList"
import ClassDetail from "./pages/ClassDetail"
import CreateExercise from "./pages/CreateExercise"
import ExerciseDetail from "./pages/ExerciseDetail"
import LessonManagement from "./pages/LessonManagement"
import LessonDetail from "./pages/LessonDetail"
import AddLesson from "./pages/AddLesson"
import DocumentManagement from "./pages/DocumentManagement"
import AddDocument from "./pages/AddDocument"
import DocumentDetail from "./pages/DocumentDetail"
import CreatepersonalInfo from "./pages/CreatepersonalInfo"
import PersonalInfoView from "./pages/PersonalInfoView"
import EditPersonalInfo from "./pages/EditPersonalInfo"
import StudentList from "./pages/StudentList"
import AddStudent from "./pages/AddStudent"
import ExercisePage from "./pages/ExercisePage"
import LessonDiscussionPage from "./pages/LessonDiscussionPage"
import ViewStudent from "./pages/ViewStudent"
import EditStudent from "./pages/EditStudent"
import QuanLyKetQuaHocTap from "./pages/QuanLyKetQuaHocTap"
import LessonResultPage from "./pages/LessonResultPage"
import ChiTietKetQua from "./pages/ChiTietKetQua"
import KetQuaHocTapHocVien from "./pages/KetQuaHocTapHocVien"
import SuaKetQuaHocTapHocVien from "./pages/SuaKetQuaHocTapHocVien"
import CaiDatTaiKhoan from "./pages/CaiDatTaiKhoan"
import DoiMatKhau from "./pages/DoiMatKhau"

/* ADMIN */
import AdminLayout from "./layout/AdminLayout"
import StatisticsAdmin from "./pages/StatisticsAdmin"
import ApproveAdmin from "./pages/ApproveAdmin"
import AccountAdmin from "./pages/AccountAdmin"
import BaoCaoKetQua from "./pages/BaoCaoKetQua"

/* QTV nội dung */
import QTVLayout from "./layout/QTVLayout"
import KyNangQTVPage from "./pages/KyNangTAPageQTV"
import CoursePageQTV from "./pages/CoursePageQTV"
/* Sinh viên */
import CourseRegister from "./pages/CourseRegister/CourseRegister"
import Profile from "./pages/Profile/Profile"
import ProfilePage from "./pages/ProfilePage/ProfilePage"
import MyCourses from "./pages/MyCourses/MyCourses"
import CourseDetailSV from "./pages/CourseDetail/CourseDetailSV"
import ClassDetailSV from "./pages/ClassDetail/ClassDetailSV"
import DocDetail from "./pages/DocDetail/DocDetail"
import LessonDetailSV from "./pages/LessonDetail/LessonDetailSV"
import Grammar from "./pages/Grammar/Grammar"
import Grammardetail from "./pages/Grammardetail/Grammardetail"
import GrammarPractice from "./pages/GrammarPractice/GrammarPractice"
import VocabularyPractice from "./pages/VocabularyPractice/VocabularyPractice"
import Vocabulary from "./pages/Vocabulary/Vocabulary"
import VocabularyDetail from "./pages/VocabularyDetail/VocabularyDetail"
import Listening from "./pages/Listening/Listening"
import ListeningDetail from "./pages/ListeningDetail/ListeningDetail"
import Speaking from "./pages/Speaking/Speaking"
import SpeakingPractice from "./pages/SpeakingPractice/SpeakingPractice"
import PhoneticPractice from "./pages/PhoneticPractice/PhoneticPractice"
import Writing from "./pages/Writing/Writing"
import WritingDetail from "./pages/WritingDetail/WritingDetail"
import WritingPractice from "./pages/WritingPractice/WritingPractice"
import ReadingSkill from "./pages/ReadingSkill/ReadingSkill"
import ReadingDetail from "./pages/ReadingDetail/ReadingDetail"
import ReadingSubmit from "./pages/ReadingSubmit/ReadingSubmit"
import Progress from "./pages/Progress/Progress"
import Settings from "./pages/Settings/Settings"
import Assignments from "./pages/Assignments/Assignments"
import AssignmentDetail from "./pages/AssignmentDetail/AssignmentDetail"
import AssignmentSuccess from "./pages/AssignmentSuccess/AssignmentSuccess"
import QuizDetail from "./pages/QuizDetail/QuizDetail"
import EssayDetail from "./pages/EssayDetail/EssayDetail"
import DanhSachBaiNop from "./pages/DanhSachBaiNop"
import ChamBaiPage from "./pages/ChamBaiPage"
import BaoCaoKetQuaQTV from "./pages/Baocaoketquaqtv"
import BaiGiangSV from "./pages/LessonDetail/BaiGiangSV"
import StudentLayout from "./layout/StudentLayout"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/courses-home" element={<CoursesPageHome />} />
        <Route path="/coursehome/:id" element={<CourseDetailHome />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register-success" element={<RegisterSuccess />} />

        {/* LOGIN */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-success" element={<ResetSuccess />} />

        {/* GIẢNG VIÊN */}
        {/* GIẢNG VIÊN - bọc trong TeacherLayout */}
        <Route element={<TeacherLayout />}>
          <Route path="/quan-ly-khoa-hoc" element={<QuanLyKhoaHoc />} />
          <Route path="/khoa-hoc/:id" element={<CourseDetail />} />
          <Route path="/lessonlist/:id" element={<LessonList />} />
          <Route path="/class/:id" element={<ClassDetail />} />
          <Route path="/create-exercise/:id" element={<CreateExercise />} />
          <Route path="/exercise-detail/:id/:lessonId" element={<ExerciseDetail />} />
          <Route path="/danh-sach-bai-nop/:maExercise" element={<DanhSachBaiNop />} />
          <Route path="/cham-bai/:maBaiNop" element={<ChamBaiPage />} />
          <Route path="/quan-ly-bai-giang/:lessonId" element={<LessonManagement />} />
          <Route path="/bai-giang/:id" element={<LessonDetail />} />
          <Route path="/them-bai-giang/:lessonId" element={<AddLesson />} />
          <Route path="/documents/:lessonId" element={<DocumentManagement />} />
          <Route path="/them-tai-lieu/:lessonId" element={<AddDocument />} />
          <Route path="/quan-ly-tai-lieu/:id" element={<DocumentDetail />} />

          {/* PROFILE */}
          <Route path="/personal-info-view" element={<CreatepersonalInfo />} />
          <Route path="/thong-tin-ca-nhan" element={<PersonalInfoView />} />
          <Route path="/edit-personal-info" element={<EditPersonalInfo />} />
          {/* CÀI ĐẶT */}
          <Route path="/cai-dat" element={<CaiDatTaiKhoan />} />
          <Route path="/doi-mat-khau" element={<DoiMatKhau />} />
          {/* BÀI TẬP */}
          <Route path="/bai-tap/:id" element={<ExercisePage />} />
          <Route path="/lesson-discussion/:id" element={<LessonDiscussionPage />} />
          {/* HỌC VIÊN */}
          <Route path="/danh-sach-hoc-vien" element={<StudentList />} />
          <Route path="/them-hoc-vien" element={<AddStudent />} />
          <Route path="/xem-hoc-vien/:id" element={<ViewStudent />} />
          <Route path="/sua-hoc-vien/:id" element={<EditStudent />} />


          {/* KẾT QUẢ */}
          <Route path="/quan-ly-ket-qua" element={<QuanLyKetQuaHocTap />} />
          <Route path="/lesson-result/:id" element={<LessonResultPage />} />
          <Route path="/ketqua/:id" element={<ChiTietKetQua />} />
          <Route path="/xem-ket-qua/:id" element={<KetQuaHocTapHocVien />} />
          <Route path="/sua-ket-qua/:id" element={<SuaKetQuaHocTapHocVien />} />
        </Route>

        {/* ADMIN */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="admin-dashboard" />} />
          <Route path="admin-dashboard" element={<StatisticsAdmin />} />
          <Route path="approve" element={<ApproveAdmin />} />
          <Route path="account" element={<AccountAdmin />} />
          <Route path="bao-cao-ket-qua" element={<BaoCaoKetQua />} />
        </Route>

        {/* QTV nội dung */}
        <Route path="/QTV" element={<QTVLayout />}>
          <Route path="dashboard" element={<KyNangQTVPage />} />
          <Route path="khoahoc" element={<CoursePageQTV />} />
          <Route path="baocao" element={<BaoCaoKetQuaQTV />} />
        </Route>

        {/*Sinh viên*/}
        <Route path="/course-register" element={<CourseRegister />} />
        <Route element={<StudentLayout />}>
          <Route path="/profile" element={<Profile/>} />
          {/* Bấm Hồ Sơ trên sidebar → ProfilePage mới */}
          <Route path="/profile-info" element={<ProfilePage />} />
          <Route path="/MyCourses" element={<MyCourses />} />
          <Route path="/class-detail/:id" element={<ClassDetailSV />} />
          <Route path="/course-detail/:id" element={<CourseDetailSV />} />
          <Route path="/doc-detail/:id" element={<DocDetail />} />
          <Route path="/lesson-detail/:maLopHoc/:maLesson" element={<LessonDetailSV />} />
          <Route path="/bai-giangSV/:id" element={<BaiGiangSV />} />
          
          <Route path="/grammar" element={<Grammar />} />
          <Route path="/grammar/detail/:id" element={<Grammardetail />} />
          <Route path="/grammar/practice/:id" element={<GrammarPractice />} />
          <Route path="/vocabulary" element={<Vocabulary />} />
          <Route path="/vocabulary/detail/:id" element={<VocabularyDetail />} />
          <Route path="/vocabulary/practice/:id" element={<VocabularyPractice />} />
          <Route path="/skills/listening" element={<Listening />} />
          <Route path="/skills/listening/detail/:id" element={<ListeningDetail />} />
          <Route path="/skills/speaking" element={<Speaking />} />
          <Route path="/skills/speaking/detail/:id" element={<SpeakingPractice />} />
          <Route path="/skills/speaking/phonetic" element={<PhoneticPractice />} />
          <Route path="/skills/writing" element={<Writing />} />
          <Route path="/skills/writing/detail/:id" element={<WritingDetail />} />
          <Route path="/skills/writing/practice/:id" element={<WritingPractice />} />
          <Route path="/skills/reading" element={<ReadingSkill />} />
          <Route path="/skills/reading/detail/:id" element={<ReadingDetail />} />
          <Route path="/skills/reading/submit-result" element={<ReadingSubmit />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/assignments" element={<Assignments />} />
          <Route path="/exercise/:id" element={<AssignmentDetail />} />
          <Route path="/assignment-success" element={<AssignmentSuccess />} />
          <Route path="/quiz-detail" element={<QuizDetail />} />
          <Route path="/essay-detail" element={<EssayDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
