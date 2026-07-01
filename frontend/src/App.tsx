import { useEffect } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import TeacherLayout from "./giangvien/layout/TeacherLayout"
import TrangChu from "./home_pages/TrangChu/TrangChu"
import VeChuongToi from "./home_pages/VeChuongToi/VeChuongToi"
import CoursesPageHome from "./home_pages/DSKhoaHoc/DSKhoaHoc"
import CoursesCategoryPage from "./home_pages/CoursesCategoryPage/CoursesCategoryPage"
import CourseDetailHome from "./home_pages/CourseDetailHome/CourseDetailHome"
import RegisterSuccess from "./home_pages/RegisterSuccess/RegisterSuccess"
import AuthModal from "./components/AuthModal"
import QuanLyKhoaHoc from "./giangvien_qtv_shared/QuanLyKhoaHoc/QuanLyKhoaHoc"
import ResetSuccess from "./home_pages/ResetSuccess/ResetSuccess"
import CourseDetail from "./giangvien_qtv_shared/CourseDetail/CourseDetail"
import LessonList from "./giangvien_qtv_shared/LessonList/LessonList"
import ClassDetail from "./giangvien_qtv_shared/ClassDetail/ClassDetail"
import CreateExercise from "./giangvien_qtv_shared/CreateExercise/CreateExercise"
import ExerciseDetail from "./giangvien_qtv_shared/ExerciseDetail/ExerciseDetail"
import LessonManagement from "./giangvien_qtv_shared/LessonManagement/LessonManagement"
import LessonDetail from "./giangvien_qtv_shared/LessonDetail/LessonDetail"
import AddLesson from "./giangvien_qtv_shared/AddLesson/AddLesson"
import DocumentManagement from "./giangvien_qtv_shared/DocumentManagement/DocumentManagement"
import AddDocument from "./giangvien_qtv_shared/AddDocument/AddDocument"

import CreatepersonalInfo from "./giangvien_qtv_shared/CreatepersonalInfo/CreatepersonalInfo"
import PersonalInfoView from "./giangvien_qtv_shared/PersonalInfoView/PersonalInfoView"
import EditPersonalInfo from "./giangvien_qtv_shared/EditPersonalInfo/EditPersonalInfo"
import StudentList from "./giangvien_qtv_shared/StudentList/StudentList"
import AddStudent from "./giangvien_qtv_shared/AddStudent/AddStudent"
import ExercisePage from "./giangvien_qtv_shared/ExercisePage/ExercisePage"
import LessonDiscussionPage from "./giangvien_qtv_shared/LessonDiscussionPage/LessonDiscussionPage"
import ViewStudent from "./giangvien_qtv_shared/ViewStudent/ViewStudent"
import EditStudent from "./giangvien_qtv_shared/EditStudent/EditStudent"
import QuanLyKetQuaHocTap from "./giangvien_qtv_shared/QuanLyKetQuaHocTap/QuanLyKetQuaHocTap"
import LessonResultPage from "./giangvien_qtv_shared/LessonResultPage/LessonResultPage"
import ChiTietKetQua from "./giangvien_qtv_shared/ChiTietKetQua/ChiTietKetQua"
import KetQuaHocTapHocVien from "./giangvien_qtv_shared/KetQuaHocTapHocVien/KetQuaHocTapHocVien"
import SuaKetQuaHocTapHocVien from "./giangvien_qtv_shared/SuaKetQuaHocTapHocVien/SuaKetQuaHocTapHocVien"
import DoiMatKhau from "./giangvien_qtv_shared/DoiMatKhau/DoiMatKhau"
import HocThu from "./home_pages/HocThu/HocThu"
import TestThuPublic from "./home_pages/TestThu/TestThuPublic"
import DraftsManagement from "./giangvien/pages/DraftsManagement/DraftsManagement"
import QuanLyDeThiThu from "./giangvien_qtv_shared/QuanLyDeThiThu/QuanLyDeThiThu"

/* ADMIN */
import AdminLayout from "./admin/layout/AdminLayout"
import StatisticsAdmin from "./admin/pages/StatisticsAdmin/StatisticsAdmin"
import ApproveAdmin from "./admin/pages/ApproveAdmin/ApproveAdmin"
import AccountAdmin from "./admin/pages/AccountAdmin/AccountAdmin"
import PermissionsAdmin from "./admin/pages/PermissionsAdmin/PermissionsAdmin"
import BaoCaoKetQua from "./admin/pages/BaoCaoKetQua/BaoCaoKetQua"

/* QTV nội dung */
import QTVLayout from "./qtv/layout/QTVLayout"
import DuyetBaiQTV from "./qtv/pages/DuyetBaiQTV/DuyetBaiQTV"
import CoursePageQTV from "./qtv/pages/CoursePageQTV/CoursePageQTV"
import CourseRegister from "./sinhvien/pages/CourseRegister/CourseRegister"
import Profile from "./sinhvien/pages/Profile/Profile"
import ProfilePage from "./sinhvien/pages/ProfilePage/ProfilePage"
import MyCourses from "./sinhvien/pages/MyCourses/MyCourses"
import ClassDetailSV from "./sinhvien/pages/ClassDetail/ClassDetailSV"
import DocDetail from "./sinhvien/pages/DocDetail/DocDetail"
import Progress from "./sinhvien/pages/Progress/Progress"
import Settings from "./sinhvien/pages/Settings/Settings"
import ChiTietBaiTap from "./sinhvien/pages/AssignmentDetail/ChiTietBaiTap"
import AssignmentSuccess from "./sinhvien/pages/AssignmentSuccess/AssignmentSuccess"
import QuizDetail from "./sinhvien/pages/QuizDetail/QuizDetail"
import EssayDetail from "./sinhvien/pages/EssayDetail/EssayDetail"
import DanhSachBaiNop from "./giangvien_qtv_shared/DanhSachBaiNop/DanhSachBaiNop"
import ChamBaiPage from "./giangvien_qtv_shared/ChamBaiPage/ChamBaiPage"
import BaoCaoKetQuaQTV from "./qtv/pages/BaoCaoKetQuaQTV/BaoCaoKetQuaQTV"
import StudentListQTV from "./qtv/pages/StudentListQTV/StudentListQTV"
import BaiGiangSV from "./sinhvien/pages/LessonDetail/BaiGiangSV"
import KhoHocLieu from "./qtv/pages/KhoHocLieu/KhoHocLieu"
import StudentLayout from "./sinhvien/layout/StudentLayout"
import HocThuSV from "./sinhvien/pages/HocThuSV"
import TestThuSV from "./sinhvien/pages/TestThuSV"
import TestExamPage from "./sinhvien/pages/TestExamPage"
import ClassDetailTrial from "./sinhvien/pages/ClassDetail/ClassDetailTrial"
import NavbarAuto from "./components/NavbarAuto"
import Footer from "./components/Footer"

const ClassDetailTrialPublic = () => {
  return (
    <>
      <NavbarAuto />
      <div style={{ padding: "0", minHeight: "80vh", background: "#f8fafc" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <ClassDetailTrial />
        </div>
      </div>
      <Footer />
    </>
  );
};


function App() {
  useEffect(() => {
    try {
      const sessionUser = sessionStorage.getItem("user");
      if (!sessionUser || sessionUser === "{}") {
        localStorage.removeItem("user");
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  return (
    <BrowserRouter basename="/flic-english-website">
      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<TrangChu />} />
        <Route path="/about" element={<VeChuongToi />} />
        <Route path="/courses" element={<CoursesPageHome />} />
        <Route path="/courses-category/:categoryKey" element={<CoursesCategoryPage />} />
        <Route path="/coursehome/:id" element={<CourseDetailHome />} />
        <Route path="/register" element={<Navigate to="/?auth=register" replace />} />
        <Route path="/register-success" element={<RegisterSuccess />} />
        <Route path="/hoc-thu" element={<HocThu />} />
        <Route path="/hoc-thu/:id/:lessonId?/:tab?/:itemId?" element={<ClassDetailTrialPublic />} />
        <Route path="/test-thu" element={<TestThuPublic />} />
        <Route path="/test-exam/:testId" element={<TestExamPage />} />

        {/* LOGIN */}
        <Route path="/login" element={<Navigate to="/?auth=login" replace />} />
        <Route path="/forgot-password" element={<Navigate to="/?auth=forgot" replace />} />
        <Route path="/reset-success" element={<ResetSuccess />} />

        {/* GIẢNG VIÊN */}
        {/* GIẢNG VIÊN - bọc trong TeacherLayout */}
        <Route element={<TeacherLayout />}>
          <Route path="/quan-ly-khoa-hoc" element={<QuanLyKhoaHoc />} />
          <Route path="/quan-ly-de-thi" element={<QuanLyDeThiThu />} />
          <Route path="/khoa-hoc/:id" element={<CourseDetail />} />
          <Route path="/lessonlist/:id" element={<LessonList />} />
          <Route path="/class/:id" element={<ClassDetail />} />
          <Route path="/create-exercise/:id" element={<CreateExercise />} />
          <Route path="/baitap-detail/:id/:buoiHocId" element={<ExerciseDetail />} />
          <Route path="/danh-sach-bai-nop/:maBaiTap" element={<DanhSachBaiNop />} />
          <Route path="/cham-bai/:maBaiNop" element={<ChamBaiPage />} />
          <Route path="/quan-ly-bai-giang/:buoiHocId" element={<LessonManagement />} />
          <Route path="/bai-giang/:id" element={<LessonDetail />} />
          <Route path="/them-bai-giang/:buoiHocId" element={<AddLesson />} />
          <Route path="/documents/:buoiHocId" element={<DocumentManagement />} />
          <Route path="/them-tai-lieu/:buoiHocId" element={<AddDocument />} />


          {/* PROFILE */}
          <Route path="/personal-info-view" element={<CreatepersonalInfo />} />
          <Route path="/thong-tin-ca-nhan" element={<PersonalInfoView />} />
          <Route path="/edit-personal-info" element={<EditPersonalInfo />} />
          <Route path="/doi-mat-khau" element={<DoiMatKhau />} />
          <Route path="/quan-ly-ban-nhap" element={<DraftsManagement />} />
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
          <Route path="permissions" element={<PermissionsAdmin />} />
          <Route path="bao-cao-ket-qua" element={<BaoCaoKetQua />} />
        </Route>

        {/* QTV nội dung */}
        <Route path="/QTV" element={<QTVLayout />}>
          <Route index element={<Navigate to="khoahoc" />} />
          <Route path="khoahoc" element={<CoursePageQTV />} />
          <Route path="baocao" element={<BaoCaoKetQuaQTV />} />
          <Route path="hocvien" element={<StudentListQTV />} />
          <Route path="duyet-bai" element={<DuyetBaiQTV />} />
          <Route path="create-exercise/:id" element={<CreateExercise />} />
          <Route path="quan-ly-de-thi" element={<QuanLyDeThiThu />} />
          <Route path="kho-hoc-lieu" element={<KhoHocLieu />} />
          <Route path="bai-giang/:id" element={<LessonDetail />} />
          <Route path="baitap-detail/:id/:buoiHocId" element={<ExerciseDetail />} />
        </Route>

        {/*Sinh viên*/}
        <Route element={<StudentLayout />}>
          <Route path="/course-register" element={<CourseRegister />} />
          <Route path="/hoc-thu-sv" element={<HocThuSV />} />
          <Route path="/hoc-thu-sv/:id/:lessonId?/:tab?/:itemId?" element={<ClassDetailTrial />} />
          <Route path="/hoc-thu-sv/:classId/:lessonId/bg/:id" element={<BaiGiangSV />} />
          <Route path="/hoc-thu-sv/:classId/:lessonId/lt/:id" element={<ChiTietBaiTap />} />
          <Route path="/hoc-thu-sv/:classId/:lessonId/bt/:id" element={<ChiTietBaiTap />} />
          <Route path="/test-thu-sv" element={<TestThuSV />} />
          <Route path="/profile" element={<Profile/>} />
          {/* Bấm Hồ Sơ trên sidebar → ProfilePage mới */}
          <Route path="/profile-info" element={<ProfilePage />} />
          <Route path="/MyCourses" element={<MyCourses />} />
          <Route path="/MyCourses/:id/:lessonId?/:tab?/:itemId?" element={<ClassDetailSV />} />
          <Route path="/MyCourses/:classId/:lessonId/bg/:id" element={<BaiGiangSV />} />
          <Route path="/MyCourses/:classId/:lessonId/lt/:id" element={<ChiTietBaiTap />} />
          <Route path="/MyCourses/:classId/:lessonId/bt/:id" element={<ChiTietBaiTap />} />
          <Route path="/doc-detail/:id" element={<DocDetail />} />
          <Route path="/bai-giangSV/:id" element={<BaiGiangSV />} />
          
          <Route path="/progress" element={<Progress />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/baitap/:id" element={<ChiTietBaiTap />} />
          <Route path="/assignment-success" element={<AssignmentSuccess />} />
          <Route path="/quiz-detail" element={<QuizDetail />} />
          <Route path="/essay-detail" element={<EssayDetail />} />
        </Route>
      </Routes>
      <AuthModal />
    </BrowserRouter>
  )
}

export default App
