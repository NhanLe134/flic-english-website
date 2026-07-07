import "./VeChuongToi.css";
import "./VeChuongToi_TuongThich.css"; // Import file css tuong thich rieng
import Footer from "../../components/Footer/Footer";
import NavTuDong from "../../components/NavTuDong/NavTuDong";
import { FiEye, FiTarget, FiAward, FiCheckCircle, FiThumbsUp } from "react-icons/fi";

const cards = [
  {
    icon: <FiEye className="about-card-icon" />,
    title: "TẦM NHÌN",
    content: (
      <p>FLIC hướng tới việc trở thành trung tâm đào tạo tiếng Anh chất lượng, đáp ứng nhu cầu học tập đa dạng của học viên và người đi làm. Trung tâm mong muốn xây dựng một hệ sinh thái học tập hiện đại, nơi người học có thể phát triển toàn diện các kỹ năng tiếng Anh và tự tin ứng dụng vào học tập, công việc cũng như giao tiếp trong môi trường hội nhập quốc tế.</p>
    ),
  },
  {
    icon: <FiTarget className="about-card-icon" />,
    title: "SỨ MỆNH",
    content: (
      <>
        <p>Sứ mệnh của FLIC là mang đến các chương trình đào tạo tiếng Anh thực tiễn, dễ tiếp cận và phù hợp với từng đối tượng học viên.</p>
        <p>Thông qua phương pháp giảng dạy rõ ràng, lộ trình học tập cá nhân hóa và môi trường học tập tích cực, FLIC giúp người học xây dựng nền tảng tiếng Anh vững chắc, nâng cao năng lực giao tiếp và từng bước đạt được các mục tiêu học tập như TOEIC, IELTS & VSTEP.</p>
      </>
    ),
  },
  {
    icon: <FiAward className="about-card-icon" />,
    title: "GIÁ TRỊ CỐT LÕI",
    content: (
      <ul>
        <li><strong>Người học là trung tâm:</strong> Mọi chương trình và hoạt động đào tạo đều hướng đến nhu cầu, năng lực và mục tiêu của học viên.</li>
        <li><strong>Tính thực tiễn:</strong> Nội dung học tập gắn liền với các tình huống sử dụng tiếng Anh trong học tập và công việc thực tế.</li>
        <li><strong>Chất lượng rõ ràng:</strong> Kiến thức được trình bày dễ hiểu, có hệ thống và phù hợp với nhiều trình độ.</li>
        <li><strong>Đồng hành lâu dài:</strong> FLIC luôn theo sát quá trình học tập và hỗ trợ học viên trong suốt lộ trình học.</li>
      </ul>
    ),
  },
  {
    icon: <FiCheckCircle className="about-card-icon" />,
    title: "CAM KẾT",
    content: (
      <p>Chúng tôi cam kết cung cấp chương trình đào tạo có định hướng rõ ràng, phù hợp với từng học viên. Trung tâm không ngừng cải tiến nội dung, phương pháp giảng dạy và hệ thống học tập nhằm nâng cao chất lượng đào tạo. Đồng thời, FLIC cam kết tạo ra môi trường học tập thân thiện, khuyến khích sự chủ động, tự tin và tiến bộ bền vững của người học.</p>
    ),
  },
  {
    icon: <FiThumbsUp className="about-card-icon" />,
    title: "TẠI SAO CHỌN CHÚNG TÔI?",
    content: (
      <>
        <p>Chúng tôi mang đến giải pháp học tiếng Anh toàn diện với lộ trình cá nhân hóa, giúp học viên dễ dàng theo dõi và đánh giá sự tiến bộ của bản thân.</p>
        <p>Nội dung học phong phú, bao gồm từ vựng, ngữ pháp, kỹ năng nghe – nói – đọc – viết và luyện thi TOEIC, VSTEP. Phương pháp học kết hợp giữa lý thuyết và thực hành giúp người học nhanh chóng áp dụng kiến thức vào thực tế.</p>
      </>
    ),
  },
];

const VeChuongToi = () => {
  return (
    <>
      <NavTuDong />

      {/* Hero Banner duoc thiet ke tu dong thay doi va fix vua van khung hinh */}
      <div className="about-hero">
        <img src={`${import.meta.env.BASE_URL}image(16).png`} alt="FLIC Banner" />
      </div>

      <div className="about-container">

        <div className="about-grid">
          {cards.map((card, i) => (
            <div className="about-card" key={i}>
              <h2>{card.icon} {card.title}</h2>
              {card.content}
            </div>
          ))}
        </div>

      </div>

      <Footer />
    </>
  );
};

export default VeChuongToi;
