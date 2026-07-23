# TÀI LIỆU HƯỚNG DẪN SỬ DỤNG HỆ THỐNG FLIC ENGLISH 🎓

Tài liệu này cung cấp hướng dẫn chi tiết các tính năng và quy trình thao tác trên hệ thống Website hỗ trợ học Tiếng Anh của Trung tâm Ngoại ngữ FLIC dành cho **5 vai trò người dùng (Roles)**:
1. **Khách vãng lai** (Người chưa đăng ký/chưa đăng nhập)
2. **Học viên** (Sinh viên chính thức đã ghi danh vào lớp)
3. **Giảng viên** (Giáo viên phụ trách giảng dạy và chấm điểm)
4. **Quản trị viên nội dung** (Content Admin - Quản lý học liệu, lớp học, đề thi)
5. **Quản trị viên hệ thống** (Admin - Quản lý tài khoản, phân quyền hệ thống)

---

## 1. KHÁCH VÃNG LAI (GUEST / UNREGISTERED USER) 🌐

Khách vãng lai là người dùng chưa đăng ký tài khoản hoặc chưa đăng nhập vào hệ thống. Vai trò này giúp người dùng tìm hiểu thông tin về trung tâm, xem danh sách khóa học và trải nghiệm thử các dịch vụ trước khi quyết định ghi danh.

### 1.1. Các chức năng chính
*   **Trang chủ (Homepage)**: Xem giới thiệu tổng quan về trung tâm FLIC, các con số thống kê nổi bật, banner chương trình ưu đãi và các liên kết nhanh.
*   **Giới thiệu (About Us)**: Tìm hiểu lịch sử hình thành, đội ngũ giảng viên và sứ mệnh đào tạo của trung tâm.
*   **Xem danh mục & Chi tiết khóa học**: Xem danh sách các khóa học hiện có (TOEIC, IELTS, VSTEP...), lọc theo danh mục và xem chi tiết thông tin khóa học (mô tả, trình độ yêu cầu, các kỹ năng học tập).
*   **Trải nghiệm Học thử (Trial Study)**:
    *   Xem video bài giảng học thử.
    *   Xem và đọc trực tuyến tài liệu PDF học thử.
    *   Làm bài tập trắc nghiệm học thử (Quiz) và nhận kết quả chấm điểm tự động tức thì.
*   **Trải nghiệm Thi thử (Mock Test)**:
    *   Xem danh sách các đề thi thử trắc nghiệm công khai.
    *   Bắt đầu làm bài thi thử online với đồng hồ đếm ngược thời gian thực.
    *   Hệ thống tự động khóa và nộp bài làm khi hết giờ, hoặc người dùng chủ động nộp bài trước thời hạn.
    *   Xem báo cáo kết quả thi thử chi tiết: Tổng số câu đúng/sai, điểm số quy đổi cuối cùng và giải thích đáp án chi tiết từng câu hỏi.
*   **Đăng ký tài khoản (Sign Up)**: Tạo tài khoản mới bằng Email và xác nhận thông qua mã OTP gửi về Email cá nhân.
*   **Khôi phục mật khẩu (Forgot Password)**: Yêu cầu đặt lại mật khẩu bằng cách xác thực mã OTP gửi về Email đăng ký.

### 1.2. Quy trình thao tác tiêu biểu

#### A. Quy trình Đăng ký tài khoản mới
1. Trên thanh điều hướng (Header), nhấp chọn **Đăng ký**.
2. Nhập đầy đủ thông tin vào Form Đăng ký:
    *   **Tên đăng nhập (Email)**: Phải đúng định dạng Gmail (Ví dụ: `nguyena@gmail.com`).
    *   **Họ và tên**: Tên chính thức của người dùng.
    *   **Mật khẩu**: Độ dài tối thiểu 8 ký tự.
    *   **Xác nhận mật khẩu**: Nhập lại chính xác mật khẩu đã nhập phía trên.
3. Nhấp nút **Đăng ký**.
4. Hệ thống gửi một mã xác thực (OTP) về Email của bạn. Nhập mã OTP vào ô xác nhận trên Website để hoàn tất quá trình đăng ký.
5. Hệ thống hiển thị thông báo thành công và chuyển hướng bạn đến trang Đăng nhập.

#### B. Quy trình làm Bài thi thử
1. Trên Header, chọn mục **Thi thử** hoặc truy cập đường dẫn `/test-thu`.
2. Tìm kiếm đề thi mong muốn trong danh sách và nhấp nút **Bắt đầu làm bài**.
3. Hệ thống chuyển hướng vào giao diện phòng thi:
    *   Giao diện hiển thị danh sách câu hỏi trắc nghiệm (Listening, Reading...).
    *   Đồng hồ đếm ngược bắt đầu chạy ở góc màn hình.
4. Lần lượt click chọn các phương án trả lời.
5. Khi làm xong, nhấp nút **Nộp bài** ở cuối trang và nhấn **Xác nhận**.
    > [!IMPORTANT]
    > Nếu đồng hồ đếm ngược về `00:00`, hệ thống sẽ tự động khóa bài thi và tự động nộp bài của bạn lên máy chủ để tính điểm.
6. Xem trang kết quả hiển thị: Tổng điểm, số câu đúng/sai, thời gian làm bài và hướng dẫn/giải thích đáp án chi tiết cho từng câu hỏi.

---

## 2. HỌC VIÊN (STUDENT) 🎓

Học viên là người dùng đã đăng ký tài khoản và được duyệt tham gia vào các lớp học chính thức của trung tâm FLIC. Học viên có không gian học tập riêng để tương tác trực tiếp với nội dung bài học và giảng viên.

### 2.1. Các chức năng chính
*   **Quản lý thông tin cá nhân & Cài đặt**:
    *   Xem và chỉnh sửa hồ sơ cá nhân (họ tên, ngày sinh, số điện thoại...).
    *   Thay đổi mật khẩu tài khoản tại mục **Cài đặt**.
*   **Đăng ký khóa học mới**:
    *   Xem danh sách các khóa học đang mở tuyển sinh của trung tâm.
    *   Tìm kiếm khóa học theo tên và bấm **Đăng ký**.
    *   Yêu cầu sẽ ở trạng thái **Chờ duyệt** cho đến khi Quản trị viên chấp nhận ghi danh vào lớp học cụ thể.
*   **Học tập chính thức ("Khóa học của tôi")**:
    *   Theo dõi tiến độ học tập (%) của từng khóa học đang tham gia.
    *   Xem lộ trình bài học chi tiết theo từng buổi học (Lesson Roadmap).
    *   **Xem bài giảng video**: Hệ thống tự động ghi nhận lịch sử xem video bài giảng và đánh dấu tích xanh hoàn thành buổi học.
    *   **Tài liệu học tập**: Xem trực tuyến hoặc tải xuống tài liệu PDF chính thức của buổi học.
    *   **Làm bài tập trắc nghiệm (Quiz)**: Làm bài tập kiểm tra kiến thức trực tiếp trên web, nộp bài nhận kết quả chấm điểm tự động.
    *   **Làm bài tập tự luận (Assignment)**: Nhập nội dung bài làm trực tiếp hoặc tải lên tệp tin bài làm (.doc, .docx, .pdf có dung lượng < 10MB).
    *   **Theo dõi kết quả chấm bài**: Xem trạng thái bài tự luận (*Chờ chấm điểm / Đã chấm điểm*), xem điểm số và nhận xét chi tiết của giảng viên.
*   **Xem tiến độ học tập toàn diện**:
    *   Xem biểu đồ tròn/thanh tiến trình biểu diễn tỉ lệ hoàn thành của các khóa học.
    *   Xem bảng điểm tổng hợp tất cả các bài tập đã làm, hiển thị điểm số chi tiết cùng điểm trung bình tích lũy hiện tại.
*   **Thảo luận bài học**: Gửi câu hỏi, ý kiến thảo luận dưới video bài giảng và nhận phản hồi phân cấp (thụt lề) từ giảng viên hoặc các học viên khác.

### 2.2. Quy trình thao tác tiêu biểu

#### A. Đăng ký một khóa học tuyển sinh
1. Sau khi Đăng nhập, truy cập mục **Đăng ký khóa học** (`/course-register`).
2. Sử dụng thanh tìm kiếm để tìm khóa học (ví dụ: "IELTS" hoặc "TOEIC").
3. Nhấp nút **Đăng ký** bên cạnh khóa học mong muốn.
4. Trên popup xác nhận, bấm **Xác nhận đăng ký**.
5. Nút đăng ký sẽ chuyển sang trạng thái **Chờ duyệt**. Học viên vui lòng đợi Content Admin hoặc Admin duyệt xếp lớp.

#### B. Làm và Nộp bài tập tự luận (Assignment)
1. Truy cập **Khóa học của tôi** (`/MyCourses`) và chọn khóa học đang học.
2. Chọn buổi học hiện tại trên Lộ trình học tập và bấm vào bài tập tự luận cần làm.
3. Xem kỹ yêu cầu đề bài và thời hạn nộp (Deadline) do giảng viên thiết lập.
4. Nhập nội dung văn bản trả lời (nếu có) và nhấp **Chọn tệp** để tải lên file bài làm từ máy tính của bạn (định dạng hỗ trợ: `.doc`, `.docx`, hoặc `.pdf`).
    > [!WARNING]
    > Hệ thống sẽ ngăn chặn và hiển thị lỗi nếu bạn tải lên tệp sai định dạng (ví dụ: `.png`, `.jpg`, `.mp4`...).
5. Nhấp nút **Nộp bài**. Hệ thống lưu bài nộp và hiển thị trạng thái **Chờ chấm điểm**.
6. Sau khi Giảng viên chấm xong, bạn có thể quay lại trang này để xem điểm số cùng lời nhận xét chi tiết từ giảng viên.

---

## 3. GIẢNG VIÊN (TEACHER) 👨‍🏫

Giảng viên là người phụ trách lớp học, chịu trách nhiệm quản lý học viên, cung cấp học liệu (video bài giảng, tài liệu PDF), giao bài tập và đánh giá kết quả học tập của học viên.

### 3.1. Các chức năng chính
*   **Quản lý khóa học & Lớp học được phân công**:
    *   Xem danh sách các khóa học và lớp học được giao giảng dạy.
    *   Tìm kiếm lớp học, lọc danh sách theo trình độ/cấp độ.
    *   Xem chi tiết lớp học (thông tin giảng viên cùng phụ trách, lịch học, sĩ số lớp, tiến độ bài học).
*   **Quản lý lộ trình học tập & học liệu**:
    *   Xem Lộ trình bài học (Lesson Roadmap).
    *   Thêm mới, sửa thông tin hoặc xóa buổi học trong lộ trình của lớp.
    *   Tải lên bài giảng video (liên kết YouTube/Google Drive): Bài giảng tải lên ban đầu ở trạng thái **Bản nháp (Draft)** và giảng viên có thể chọn **Xuất bản (Publish)** để học viên nhìn thấy.
    *   Tải lên tài liệu học tập PDF để học viên có thể tải về máy.
    *   Quản lý danh sách Bản nháp để tiến hành chỉnh sửa và công bố sau.
*   **Quản lý học viên trong lớp**:
    *   Xem danh sách học viên hiện tại của lớp (họ tên, email, ngày ghi danh, trạng thái học tập).
    *   Thêm học viên mới trực tiếp vào lớp học bằng cách nhập thông tin cá nhân.
    *   Xem chi tiết thông tin hồ sơ và bảng điểm chi tiết của từng học viên.
    *   Cập nhật trạng thái học viên (Đang học / Hoàn thành / Đã hủy).
    *   Xóa học viên ra khỏi lớp học (Hủy đăng ký lớp).
*   **Giao bài tập & Chấm điểm**:
    *   Tạo bài tập tự luận mới cho lớp học: Đặt tiêu đề, mô tả đề bài, thang điểm tối đa và hạn nộp bài (Deadline phải lớn hơn thời gian hiện tại).
    *   Xem danh sách bài nộp tự luận của học viên (bao gồm ngày nộp, nội dung và file đính kèm).
    *   Chấm điểm và viết lời nhận xét phản hồi chi tiết cho học viên.
    *   Chỉnh sửa điểm và lời nhận xét đã lưu nếu cần.
*   **Quản lý kết quả học tập toàn lớp**:
    *   Xem Bảng điểm tổng hợp của toàn bộ lớp học (bao gồm điểm thành phần của từng bài tập và điểm trung bình tích lũy tự động tính toán).
    *   Chỉnh sửa nhanh điểm số của học viên trực tiếp trên bảng điểm tổng hợp.
*   **Giải đáp thảo luận**: Xem các câu hỏi thắc mắc của học viên dưới mỗi bài giảng video và viết câu trả lời phản hồi trực tiếp.

### 3.2. Quy trình thao tác tiêu biểu

#### A. Đăng tải Bài giảng Video mới
1. Đăng nhập tài khoản Giảng viên và truy cập mục **Quản lý khóa học** -> chọn lớp học mong muốn.
2. Tại tab Lộ trình bài học, tìm đến buổi học cần thêm và nhấp chọn **Thêm bài giảng**.
3. Điền các thông tin của bài giảng:
    *   **Tiêu đề bài giảng** (ví dụ: "Ngữ pháp Câu điều kiện loại 1").
    *   **Đường dẫn Video** (phải là liên kết YouTube hoặc Drive hợp lệ).
    *   **Thời lượng** và **Mô tả ngắn**.
4. Nhấp nút **Thêm**. Bài giảng được tạo ở dạng **Bản nháp (Draft)** và học viên chưa nhìn thấy.
5. Để công bố bài giảng, giảng viên truy cập trang **Quản lý bản nháp** hoặc tại dòng bài giảng đó, bấm công tắc chuyển đổi sang trạng thái **Xuất bản (Published)**.

#### B. Chấm điểm bài tập tự luận của Học viên
1. Tại Chi tiết lớp học, tìm đến bài tập tự luận cần chấm và nhấp vào tiêu đề bài tập đó.
2. Chọn chức năng **Xem danh sách bài nộp**. Hệ thống hiển thị danh sách các học viên đã nộp bài.
3. Tìm học viên ở trạng thái **Chờ chấm điểm** và nhấp nút **Chấm bài**.
4. Hệ thống hiển thị chi tiết bài làm: Đọc nội dung học viên viết hoặc tải về file đính kèm (.pdf/.docx) để xem.
5. Nhập số điểm (thang điểm tối đa mặc định là 10, hệ thống báo lỗi nếu nhập vượt quá) và viết nhận xét/phản hồi chi tiết vào ô trống.
6. Nhấp nút **Lưu điểm số**. Trạng thái bài nộp sẽ tự động đổi sang **Đã chấm điểm** và điểm số được cập nhật ngay lập tức sang tài khoản học viên.

---

## 4. QUẢN TRỊ VIÊN NỘI DUNG (CONTENT ADMIN) 📝

Quản trị viên nội dung (Content Admin) chịu trách nhiệm xây dựng chương trình giảng dạy, tổ chức quản lý lớp học (xếp lịch, phân giảng viên), biên soạn đề thi thử và duyệt nội dung bài học.

### 4.1. Các chức năng chính
*   **Quản lý lớp học của các khóa học**:
    *   Xem danh sách các khóa học hiện có.
    *   Tạo lớp học mới trực thuộc khóa học: Đặt tên lớp, chọn cấp độ học tập, thiết lập lịch học chi tiết trong tuần (chọn các ngày trong tuần và khung giờ học) và phân công giảng viên phụ trách riêng cho từng kỹ năng (Listening, Reading, Speaking, Writing).
    *   Chỉnh sửa thông tin lớp học (tên lớp, lịch học, trạng thái lớp, phân công lại giảng viên) hoặc thực hiện xóa lớp học.
*   **Ghi danh & Duyệt học viên vào lớp**:
    *   Quản lý danh sách đăng ký học viên.
    *   Thực hiện duyệt ghi danh học viên từ trạng thái **Chờ duyệt** sang **Đã ghi danh**, hoặc bấm **Hủy ghi danh** để đưa học viên về trạng thái chờ duyệt.
    *   Xem thông tin chi tiết hồ sơ học viên, quản lý và chỉnh sửa biệt danh (tên gọi khác của học viên trong hệ thống).
*   **Quản lý Lộ trình buổi học & Kho học liệu**:
    *   Quản lý các buổi học trong lộ trình học tập của lớp.
    *   Tạo bài giảng mới cho buổi học hoặc chọn nhanh từ danh sách bài giảng mẫu có sẵn trong kho học liệu.
*   **Quản lý đề thi thử (Mock Test)**:
    *   Biên soạn đề thi thử trắc nghiệm mới: Thiết lập tiêu đề đề thi, mô tả, thời gian làm bài và soạn thảo cấu trúc câu hỏi chi tiết.
    *   Đăng tải đề thi công khai (trạng thái **Hoạt động**) hoặc lưu dưới dạng **Nháp (Draft)**.
    *   Chỉnh sửa, xóa đề thi thử hoặc thực hiện **Nhân bản đề thi** (Duplicate) để tạo nhanh đề thi mới từ đề gốc.
    *   Xem trước (Preview) giao diện đề thi thử dưới góc nhìn của học viên để kiểm tra lỗi hiển thị.
*   **Phê duyệt nội dung (DuyetBaiQTV)**:
    *   Kiểm duyệt các đề xuất bài giảng hoặc đề thi thử trên hệ thống.
    *   Bấm **Phê duyệt** (nội dung hiển thị chính thức trên web) hoặc **Từ chối** (ẩn nội dung và yêu cầu biên soạn lại).
*   **Xem báo cáo kết quả & Xuất file dữ liệu**:
    *   Xem thống kê bảng điểm học viên, lọc theo Khóa học, Lớp học và Trạng thái học tập.
    *   Xem chi tiết kết quả bài thi thử của từng học viên (câu đúng/sai, câu trả lời đã chọn).
    *   **Xuất báo cáo kết quả học tập ra file CSV** để phục vụ công tác lưu trữ nội bộ của trung tâm.

### 4.2. Quy trình thao tác tiêu biểu

#### A. Tạo một Lớp học mới và Phân công Giảng viên
1. Chọn mục **Khóa học** trên thanh điều hướng.
2. Tìm đến khóa học mong muốn (ví dụ: "Luyện thi TOEIC 650+"), nhấp chọn biểu tượng mở rộng để hiện danh sách lớp học và bấm nút **Thêm lớp mới**.
3. Điền thông tin vào form:
    *   **Tên lớp học**: Ví dụ: `TOEIC_A1_2026`.
    *   **Trình độ**: Chọn từ dropdown (ví dụ: `Basic`).
    *   **Lịch học**: Click chọn các ngày học trong tuần (ví dụ: Thứ 2, Thứ 4, Thứ 6) và điền khung giờ (ví dụ: `08:00` - `09:30`).
    *   **Phân công giảng viên**: Hệ thống sẽ hiển thị các kỹ năng của khóa học (Ví dụ: Listening, Reading). Chọn tên giảng viên phụ trách tương ứng cho mỗi kỹ năng từ dropdown.
4. Bấm nút **Lưu lớp học**. Lớp học mới được tạo thành công và sẵn sàng để ghi danh học viên.

#### B. Phê duyệt Ghi danh Học viên vào Lớp
1. Tại trang quản trị, truy cập mục **Khóa học** và bấm chọn nút **Đăng ký (Số lượng)** tại lớp học tương ứng để mở Popup Ghi danh.
2. Hệ thống hiển thị danh sách các học viên đã bấm Đăng ký khóa học này và đang ở trạng thái **Chờ duyệt**.
3. Xác minh thông tin học viên.
4. Nhấp nút **Ghi danh** bên cạnh tên học viên. Hệ thống thông báo ghi danh thành công, trạng thái học viên đổi sang **Đã ghi danh** và tài khoản học viên chính thức có quyền vào học lớp này.
5. Nếu muốn rút học viên khỏi lớp, nhấp nút **Hủy GD** (Hủy ghi danh) để đưa tài khoản về trạng thái chờ duyệt.

---

## 5. QUẢN TRỊ VIÊN HỆ THỐNG (ADMIN) ⚙️

Quản trị viên hệ thống (Admin) là vai trò có quyền hạn cao nhất trên hệ thống FLIC English Website. Admin chịu trách nhiệm kiểm soát toàn bộ người dùng, quản trị khóa học, phân quyền hệ thống và theo dõi các báo cáo thống kê vĩ mô.

### 5.1. Các chức năng chính
*   **Trang Thống kê & Báo cáo tổng quan (Dashboard)**:
    *   Xem các chỉ số hoạt động thời gian thực của hệ thống (Tổng số học viên, giảng viên, khóa học đang hoạt động).
    *   Xem biểu đồ cột/đường biểu diễn số lượng học viên đăng ký mới theo các tháng trong năm để phân tích xu hướng tuyển sinh.
*   **Quản lý tài khoản người dùng**:
    *   Xem danh sách tất cả các tài khoản trên hệ thống.
    *   Thêm tài khoản mới: Tạo tài khoản trực tiếp cho Sinh viên, Giảng viên, Content Admin hoặc Admin khác bằng cách nhập Tên đăng nhập, Họ và tên, Email, Mật khẩu và Giới tính.
    *   Chỉnh sửa thông tin tài khoản (thay đổi Email, phân lại Vai trò).
    *   Khóa tài khoản (chuyển trạng thái hoạt động sang **Khóa**) để chặn người dùng đăng nhập hệ thống, hoặc **Mở khóa** khi cần thiết.
*   **Phân quyền hệ thống (PermissionsAdmin)**:
    *   Lọc danh sách người dùng theo vai trò (ví dụ: Tab Giảng viên, Tab Quản trị nội dung).
    *   Quản lý quyền chi tiết cho từng tài khoản thông qua ma trận checkbox quyền hạn (ví dụ: Quyền đăng bài giảng, Quyền chấm điểm, Quyền xếp lớp...).
    *   Hệ thống có cơ chế cảnh báo popup xác nhận trước khi bổ sung hoặc gỡ bỏ quyền của người dùng để tránh nhầm lẫn.
*   **Quản lý Khóa học vĩ mô**:
    *   Thêm khóa học mới vào hệ thống: Nhập tên khóa học, mô tả, cấp độ đào tạo, tích chọn các kỹ năng thuộc chương trình học.
    *   Bật/Tắt hiển thị khóa học lên Trang chủ:
        *   **Bật công tắc**: Khóa học hiển thị công khai ở Trang chủ chung để học viên tìm hiểu và đăng ký.
        *   **Tắt công tắc**: Ẩn khóa học khỏi Trang chủ (áp dụng khi khóa học đã đủ sĩ số hoặc tạm dừng tuyển sinh).
    *   Chỉnh sửa khóa học: Thay đổi thông tin cơ bản.
        > [!NOTE]
        > Nếu khóa học đó đã được xếp lớp học thực tế trong database, hệ thống sẽ tự động khóa (vô hiệu hóa) trường chỉnh sửa Kỹ năng và hiển thị dòng chữ cảnh báo: *"Không thể thay đổi kỹ năng của khóa học khi đã có lớp học trong khóa"* để tránh xung đột dữ liệu.
    *   Xóa khóa học: Hệ thống tích hợp cơ chế bảo vệ an toàn:
        *   Khi bấm xóa, một popup cảnh báo hiện lên thông báo tất cả thông tin liên quan (lớp học, buổi học, tiến trình học viên) cũng sẽ bị xóa.
        *   If chọn Xác nhận, hệ thống tiếp tục hiển thị **popup đếm ngược 5 giây** với nút **Hủy xóa**. Sau khi hết 5 giây đếm ngược mà không có thao tác hủy, khóa học mới chính thức bị xóa vĩnh viễn khỏi cơ sở dữ liệu.
*   **Xem báo cáo kết quả đào tạo**:
    *   Xem bảng điểm chi tiết của tất cả các lớp học.
    *   So sánh kết quả học tập giữa các lớp hoặc giữa các giảng viên thông qua biểu đồ so sánh trực quan của hệ thống.

### 5.2. Quy trình thao tác tiêu biểu

#### A. Phân quyền chi tiết cho Người dùng
1. Chọn mục **Phân quyền** trên thanh điều hướng bên trái.
2. Chọn Tab vai trò tương ứng (ví dụ: chọn Tab **Giảng viên** để xem danh sách các giảng viên).
3. Tìm tài khoản giảng viên cần cấu hình lại quyền hạn.
4. Trên ma trận checkbox các quyền của tài khoản đó:
    *   **Để bổ sung thêm quyền**: Click vào ô checkbox trống của quyền tương ứng.
    *   **Để gỡ bỏ quyền đang có**: Click vào ô checkbox đã được tích chọn của quyền đó.
5. Hệ thống hiển thị Popup: **"Xác nhận thay đổi quyền"** hỏi rõ: *"Bạn muốn bổ sung/gỡ bỏ quyền {Tên quyền} cho {Tên người dùng}?"*.
6. Bấm **Xác nhận** để áp dụng quyền mới ngay lập tức, hoặc bấm **Hủy** để giữ nguyên cấu hình cũ.

#### B. Xóa một Khóa học trên hệ thống (Cơ chế an toàn đếm ngược)
1. Truy cập mục **Quản lý khóa học** trên thanh điều hướng của Admin.
2. Tìm khóa học cần xóa khỏi hệ thống và bấm vào biểu tượng **Xóa** (hình thùng rác).
3. Hệ thống hiển thị Popup cảnh báo đầu tiên: *"Bạn có chắc chắn muốn xóa khóa học {Tên khóa}? Nếu xóa khóa học này, tất cả những thông tin liên quan đến khóa học (lớp học, buổi học, tiến trình đăng ký) sẽ bị xóa hoàn toàn."*
4. Nếu chắc chắn muốn xóa, nhấp nút **Xác nhận xóa**.
5. Hệ thống hiển thị tiếp Popup đếm ngược: *"Khóa học sẽ bị xóa vĩnh viễn trong 5 giây. Bạn có thể bấm Hủy để hủy bỏ yêu cầu này ngay lập tức."* kèm theo đồng hồ đếm ngược từ 5 về 0.
6. Lúc này:
    *   Nếu bạn bấm **Hủy xóa khóa học** trong vòng 5 giây, yêu cầu xóa sẽ bị hủy bỏ ngay lập tức, khóa học được giữ nguyên an toàn trên hệ thống.
    *   Nếu sau 5 giây bạn không bấm nút Hủy, hệ thống sẽ thực hiện lệnh xóa vĩnh viễn khóa học và tất cả dữ liệu liên quan khỏi cơ sở dữ liệu và hiển thị thông báo thành công.

---

> [!TIP]
> **Mẹo chung khi vận hành hệ thống**:
> *   Các chức năng đăng bài giảng/đề thi nên lưu ở chế độ **Bản nháp (Draft)** trong quá trình soạn thảo để kiểm tra nội dung trước, sau đó mới đổi trạng thái sang **Hoạt động/Công bố (Published)** để học viên có thể học tập.
> *   Luôn bảo mật mật khẩu tài khoản Admin/QTV/Giảng viên và thực hiện đăng xuất sau khi hoàn tất các phiên làm việc trên thiết bị công cộng.
