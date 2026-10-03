import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('path');
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Trạng thái cho RAG Chat
  const [chatInput, setChatInput] = useState('');
  const [chatLog, setChatLog] = useState([
    { role: 'ai', text: 'Chào Alex! Tôi là Trợ lý AI nội bộ. Bạn có câu hỏi nào về các chính sách hay quy trình không?' }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    setChatLog([...chatLog, { role: 'user', text: chatInput }]);
    setChatInput('');
    setIsTyping(true);

    // Giả lập RAG response
    setTimeout(() => {
      setChatLog(prev => [
        ...prev, 
        { role: 'ai', text: 'Theo tài liệu "CustomerSupport_Policy_01.pdf" (Trang 2), nếu khách hàng phàn nàn gay gắt, bạn cần thực hiện theo quy trình "De-escalation": 1. Lắng nghe chủ động. 2. Xin lỗi vì trải nghiệm không tốt. 3. Đề nghị chuyển cấp (Escalate) lên Manager nếu không thể giải quyết trong 5 phút.' }
      ]);
      setIsTyping(false);
    }, 2000);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-color)', color: 'var(--text-color)' }}>
      {/* Sidebar */}
      <div className="glass-panel" style={{ width: '260px', borderRadius: '0', borderLeft: 'none', borderTop: 'none', borderBottom: 'none', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 style={{ color: 'var(--primary-color)' }}>SkillSprint AI</h2>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Không gian Học tập</p>
        </div>
        <ul style={{ listStyle: 'none', padding: '20px', flex: 1 }}>
          <li 
            onClick={() => setActiveTab('path')}
            style={{ padding: '12px 10px', cursor: 'pointer', borderRadius: '8px', background: activeTab === 'path' ? 'rgba(59, 130, 246, 0.1)' : 'transparent', color: activeTab === 'path' ? 'var(--primary-color)' : '#94a3b8' }}>
            🎯 Lộ trình của tôi
          </li>
          <li 
            onClick={() => setIsChatOpen(!isChatOpen)}
            style={{ padding: '12px 10px', cursor: 'pointer', borderRadius: '8px', background: isChatOpen ? 'rgba(59, 130, 246, 0.1)' : 'transparent', color: isChatOpen ? 'var(--primary-color)' : '#94a3b8' }}>
            📚 Trợ lý AI (Hỏi đáp)
          </li>
          <li 
            onClick={() => setActiveTab('quiz')}
            style={{ padding: '12px 10px', cursor: 'pointer', borderRadius: '8px', background: activeTab === 'quiz' ? 'rgba(59, 130, 246, 0.1)' : 'transparent', color: activeTab === 'quiz' ? 'var(--primary-color)' : '#94a3b8' }}>
            📝 Bài kiểm tra (Quiz)
          </li>
        </ul>
        <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--secondary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>AL</div>
            <div>
              <strong style={{ display: 'block', fontSize: '0.9rem' }}>Alex</strong>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Customer Support</span>
            </div>
          </div>
          <button onClick={handleLogout} className="btn" style={{ width: '100%', background: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger-color)' }}>Logout</button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        
        {/* TAB 1: LEARNING PATH */}
        {activeTab === 'path' && (
          <div className="animate-fade-in">
            <h1 style={{ marginBottom: '10px' }}>Chào mừng trở lại, Alex! 👋</h1>
            <p style={{ color: '#94a3b8', marginBottom: '30px' }}>Đây là lộ trình đào tạo được AI cá nhân hóa dành riêng cho bạn (Được QA kiểm duyệt qua PLAN-101).</p>
            
            {/* Progress Section */}
            <div className="glass-panel" style={{ padding: '25px', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '30px' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ marginBottom: '15px' }}>Tiến độ Onboarding</h3>
                <div style={{ width: '100%', background: 'rgba(255,255,255,0.1)', height: '12px', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{ width: '33%', background: 'var(--primary-color)', height: '100%' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '0.85rem', color: '#94a3b8' }}>
                  <span>1 / 3 Modules hoàn thành</span>
                  <span>33%</span>
                </div>
              </div>
            </div>

            {/* Modules Grid */}
            <h3 style={{ marginBottom: '20px' }}>Bài học của bạn</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              
              {/* Completed Module */}
              <div className="glass-panel" style={{ padding: '25px', borderTop: '4px solid var(--success-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Module 1</span>
                  <span style={{ fontSize: '0.8rem', background: 'rgba(34, 197, 94, 0.2)', color: 'var(--success-color)', padding: '2px 8px', borderRadius: '12px' }}>Hoàn thành</span>
                </div>
                <h3 style={{ marginBottom: '10px' }}>Information Security Basics</h3>
                <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '20px' }}>Source: IT_Policy_04.pdf</p>
                <button className="btn" style={{ width: '100%', background: 'rgba(255,255,255,0.1)' }}>Ôn tập lại</button>
              </div>

              {/* In-Progress Module */}
              <div className="glass-panel" style={{ padding: '25px', borderTop: '4px solid var(--primary-color)', transform: 'scale(1.02)', boxShadow: '0 0 20px rgba(59, 130, 246, 0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Module 2</span>
                  <span style={{ fontSize: '0.8rem', background: 'rgba(59, 130, 246, 0.2)', color: 'var(--primary-color)', padding: '2px 8px', borderRadius: '12px' }}>Đang học</span>
                </div>
                <h3 style={{ marginBottom: '10px' }}>Customer Escalation Process</h3>
                <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '20px' }}>Source: CustomerSupport_Policy_01.pdf</p>
                <button className="btn btn-primary" style={{ width: '100%' }}>Tiếp tục học 👉</button>
              </div>

              {/* Locked Module */}
              <div className="glass-panel" style={{ padding: '25px', opacity: 0.6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Module 3</span>
                  <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)', color: '#94a3b8', padding: '2px 8px', borderRadius: '12px' }}>Đã khóa 🔒</span>
                </div>
                <h3 style={{ marginBottom: '10px' }}>Product Knowledge (Phase 1)</h3>
                <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '20px' }}>Source: General_Guideline_14.pdf</p>
                <button className="btn" disabled style={{ width: '100%', background: 'rgba(255,255,255,0.05)', color: '#64748b', cursor: 'not-allowed' }}>Yêu cầu hoàn thành Module 2</button>
              </div>

            </div>
          </div>
        )}



        {/* TAB 3: ASSESSMENTS */}
        {activeTab === 'quiz' && (
          <div className="animate-fade-in">
            <h1 style={{ marginBottom: '10px' }}>📝 Bài Kiểm tra (Quiz)</h1>
            <p style={{ color: '#94a3b8', marginBottom: '30px' }}>Bài test được GenAI tự động tạo ra từ CustomerSupport_Policy_01.pdf (SRS Step 52).</p>
            
            <div className="glass-panel" style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px' }}>
                <h2>Quiz: Customer Escalation Process</h2>
                <span style={{ background: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger-color)', padding: '5px 15px', borderRadius: '20px', fontWeight: 'bold' }}>Thời gian: 15:00</span>
              </div>

              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ marginBottom: '15px' }}>Câu 1: Bước ĐẦU TIÊN cần làm khi đối mặt với một khách hàng đang rất tức giận là gì?</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label className="glass-panel" style={{ padding: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.05)' }}>
                    <input type="radio" name="q1" /> Lập tức chuyển cuộc gọi cho Manager.
                  </label>
                  <label className="glass-panel" style={{ padding: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(59, 130, 246, 0.2)', border: '1px solid var(--primary-color)' }}>
                    <input type="radio" name="q1" defaultChecked /> Lắng nghe chủ động (Active listening) và không ngắt lời.
                  </label>
                  <label className="glass-panel" style={{ padding: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.05)' }}>
                    <input type="radio" name="q1" /> Trả lời ngay lập tức để bảo vệ công ty.
                  </label>
                  <label className="glass-panel" style={{ padding: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.05)' }}>
                    <input type="radio" name="q1" /> Cúp máy.
                  </label>
                </div>
              </div>

              <button className="btn btn-primary" style={{ width: '100%', padding: '15px', fontSize: '1.1rem' }}>Nộp Bài (Submit)</button>
            </div>
          </div>
        )}
      </div>

      {/* FLOATING CHAT WIDGET */}
      {isChatOpen && (
        <div className="glass-panel animate-fade-in" style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '400px',
          height: '550px',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1000,
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
          overflow: 'hidden'
        }}>
          {/* Chat Header */}
          <div style={{ padding: '15px 20px', background: 'rgba(30, 41, 59, 0.8)', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--primary-color)' }}>📚 Trợ lý AI (RAG)</h3>
            <button onClick={() => setIsChatOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.2rem' }}>✖</button>
          </div>

          {/* Chat Body */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {chatLog.map((chat, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: chat.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{ 
                  maxWidth: '85%', 
                  padding: '12px 16px', 
                  borderRadius: '12px',
                  background: chat.role === 'user' ? 'var(--primary-color)' : 'rgba(0,0,0,0.3)',
                  color: 'white',
                  lineHeight: '1.4',
                  fontSize: '0.95rem'
                }}>
                  {chat.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                <div style={{ padding: '10px 15px', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', color: '#94a3b8', fontSize: '0.9rem' }}>
                  Đang tìm kiếm... ⏳
                </div>
              </div>
            )}
          </div>

          {/* Chat Footer */}
          <div style={{ padding: '15px', borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15, 23, 42, 0.8)' }}>
            <form onSubmit={handleChat} style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="text" 
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Hỏi gì đó..." 
                className="form-input" 
                style={{ flex: 1, padding: '10px', fontSize: '0.9rem' }}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '10px 15px' }} disabled={isTyping || !chatInput.trim()}>
                Gửi
              </button>
            </form>
          </div>
        </div>
      )}
      
      {/* Nút Chat nổi (khi đóng chatbox) */}
      {!isChatOpen && (
        <button 
          onClick={() => setIsChatOpen(true)}
          className="btn btn-primary"
          style={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            fontSize: '1.5rem',
            boxShadow: '0 5px 15px rgba(59, 130, 246, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            zIndex: 999
          }}
        >
          💬
        </button>
      )}
    </div>
  );
}
