import { FiBookOpen, FiPlayCircle, FiHeadphones, FiCheckCircle, FiClock } from "react-icons/fi";
import "./hocthu.css"; // Reuse existing css or add sv styling

export default function HocThuSV() {
  const trialLessons = [
    {
      id: 1,
      skill: "Listening",
      title: "IELTS Listening Practice - Section 1: Hotel Reservation",
      duration: "15 phút",
      icon: <FiHeadphones size={24} color="#3b82f6" />,
      desc: "Luyện tập kỹ năng nghe điền từ thông tin cá nhân và hội thoại đời thường."
    },
    {
      id: 2,
      skill: "Reading",
      title: "Reading Comprehension - Skimming & Scanning Techniques",
      duration: "20 phút",
      icon: <FiBookOpen size={24} color="#10b981" />,
      desc: "Nắm vững kỹ năng đọc lướt tìm ý chính và quét thông tin trả lời câu hỏi."
    },
    {
      id: 3,
      skill: "Speaking",
      title: "Speaking Part 1 - Common Topics & Model Answers",
      duration: "12 phút",
      icon: <FiPlayCircle size={24} color="#f59e0b" />,
      desc: "Hướng dẫn trả lời các câu hỏi cơ bản về bản thân, sở thích và gia đình."
    }
  ];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #FFF2EB 0%, #FFEBE0 100%)', borderRadius: '16px', padding: '36px', marginBottom: '32px', border: '1px solid #FFE0D1' }}>
        <h1 style={{ margin: '0 0 12px 0', color: '#dd4e00', fontSize: '28px', fontWeight: 800 }}>LỚP HỌC TRẢI NGHIỆM THỬ</h1>
        <p style={{ color: '#64748b', fontSize: '15px', margin: 0, lineHeight: '1.6' }}>
          Chào mừng bạn đến với góc học thử của trung tâm FLIC! Dưới đây là các tài liệu và bài giảng mẫu được thiết kế chuẩn xác giúp bạn làm quen với phương pháp dạy học tại trung tâm trước khi đăng ký chính thức.
        </p>
      </div>

      <h2 style={{ fontSize: '20px', color: '#0f172a', fontWeight: 700, marginBottom: '20px' }}>Bài Học Trải Nghiệm Mẫu</h2>
      
      {/* Lesson List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
        {trialLessons.map(lesson => (
          <div key={lesson.id} style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'transform 0.2s', cursor: 'pointer' }} className="trial-lesson-card">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', background: '#f1f5f9', color: '#475569' }}>
                  {lesson.skill}
                </span>
                <span style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FiClock size={14} /> {lesson.duration}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <div style={{ marginTop: '2px' }}>{lesson.icon}</div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0, lineHeight: '1.4' }}>
                  {lesson.title}
                </h3>
              </div>
              <p style={{ color: '#64748b', fontSize: '13.5px', margin: '0 0 20px 0', lineHeight: '1.5' }}>
                {lesson.desc}
              </p>
            </div>
            <button 
              onClick={() => alert(`Bắt đầu học thử bài: ${lesson.title}`)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: 'none', background: '#000080', color: '#fff', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <FiPlayCircle size={16} /> Bắt đầu học ngay
            </button>
          </div>
        ))}
      </div>

      {/* Info Card */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: '#eff6ff', borderRadius: '12px', padding: '20px', marginTop: '36px', border: '1px solid #bfdbfe' }}>
        <FiCheckCircle size={24} color="#1d4ed8" />
        <span style={{ color: '#1e3a8a', fontSize: '14.5px', fontWeight: 500 }}>
          Học thử hoàn toàn miễn phí. Kết quả học thử và thông tin của bạn được ghi nhận vào hệ thống để hỗ trợ tư vấn lộ trình học phù hợp nhất.
        </span>
      </div>
    </div>
  );
}
