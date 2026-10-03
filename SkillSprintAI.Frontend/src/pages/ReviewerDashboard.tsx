import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ReviewerDashboard() {
  const navigate = useNavigate();
  
  // Giả lập dữ liệu được trả về từ Python Validation Engine (Pipeline 2)
  const [reviews, setReviews] = useState([
    {
      id: "PLAN-101",
      employee: "Customer Support (Phòng ban)",
      role: "All CS Staff",
      planType: "Department",
      status: "Manual Review Required",
      coverageScore: 50.0,
      traceabilityScore: 50.0,
      missingReqs: ["REQ-EMP-02 (Data Privacy Training)"],
      unsupportedItems: ["Fake Module - Not in SOP"],
      genAiModules: [
        { title: "Workplace Conduct", source: "POL-HR-01", valid: true },
        { title: "Fake Module", source: "FAKE-DOC", valid: false }
      ]
    },
    {
      id: "PLAN-102",
      employee: "Alex (Cá nhân)",
      role: "Promotion to Manager",
      planType: "Individual",
      status: "Verified",
      coverageScore: 100.0,
      traceabilityScore: 100.0,
      missingReqs: [],
      unsupportedItems: [],
      genAiModules: [
        { title: "Document Upload SOP", source: "POL-HR-02", valid: true },
        { title: "Admin Rights", source: "POL-IT-05", valid: true }
      ]
    }
  ]);

  // Modal State
  const [modalData, setModalData] = useState<{ isOpen: boolean, planId: string, action: string, message: string }>({
    isOpen: false, planId: '', action: '', message: ''
  });

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const openModal = (planId: string, action: string) => {
    const plan = reviews.find(r => r.id === planId);
    let message = "";
    if (action === 'Reject') {
      message = `Đã trả Onboarding Plan [${planId}] về cho HR để GenAI tạo lại (Do thiếu Requirement hoặc bịa đặt dữ liệu).`;
    } else {
      if (plan?.planType === "Department") {
        message = `Đã duyệt Onboarding Plan [${planId}] thành công! Lộ trình này sẽ được phân bổ lập tức tới toàn bộ phòng ban.`;
      } else {
        message = `Đã duyệt Onboarding Plan [${planId}] thành công! Lộ trình này sẽ được gửi đích danh cho nhân viên tương ứng.`;
      }
    }
      
    setModalData({ isOpen: true, planId, action, message });
  };

  const confirmAction = () => {
    setReviews(reviews.filter(r => r.id !== modalData.planId));
    setModalData({ isOpen: false, planId: '', action: '', message: '' });
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-color)', color: 'var(--text-color)' }}>
      {/* Sidebar */}
      <div className="glass-panel" style={{ width: '250px', borderRadius: '0', borderLeft: 'none', borderTop: 'none', borderBottom: 'none', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 style={{ color: 'var(--primary-color)' }}>SkillSprint AI</h2>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Pipeline 2: Ground-Truth</p>
        </div>
        <ul style={{ listStyle: 'none', padding: '20px', flex: 1 }}>
          <li style={{ padding: '10px 0', cursor: 'pointer', color: 'var(--primary-color)' }}>🔍 Review Queue</li>
          <li style={{ padding: '10px 0', cursor: 'pointer', color: '#94a3b8' }}>📊 Validation Reports</li>
          <li style={{ padding: '10px 0', cursor: 'pointer', color: '#94a3b8' }}>⚙️ Matrix Settings</li>
        </ul>
        <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button onClick={handleLogout} className="btn" style={{ width: '100%', background: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger-color)' }}>Logout</button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        <h1 style={{ marginBottom: '10px' }}>Reviewer Workspace (QA)</h1>
        <p style={{ color: '#94a3b8', marginBottom: '30px' }}>Kiểm duyệt kết quả sinh ra từ AI (Pipeline 1) dựa trên sự đánh giá của Python (Pipeline 2).</p>

        <div style={{ display: 'grid', gap: '20px' }}>
          {reviews.length === 0 ? (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '40px' }}>
              <h3 style={{ color: '#94a3b8' }}>Tất cả tài liệu đã được duyệt! 🎉</h3>
            </div>
          ) : (
            reviews.map(review => (
              <div key={review.id} className="glass-panel animate-fade-in" style={{ borderLeft: review.status === 'Verified' ? '4px solid var(--success-color)' : '4px solid var(--warning-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3>Plan ID: {review.id} - {review.employee} ({review.role})</h3>
                    <div style={{ marginTop: '10px', display: 'flex', gap: '15px' }}>
                      <span style={{ padding: '5px 10px', borderRadius: '4px', background: review.status === 'Verified' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(234, 179, 8, 0.2)', color: review.status === 'Verified' ? 'var(--success-color)' : 'var(--warning-color)', fontSize: '0.85rem' }}>
                        {review.status}
                      </span>
                      <span style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'flex', alignItems: 'center' }}>Coverage: {review.coverageScore}%</span>
                      <span style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'flex', alignItems: 'center' }}>Traceability: {review.traceabilityScore}%</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => openModal(review.id, 'Reject')} className="btn" style={{ background: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger-color)', border: '1px solid rgba(239, 68, 68, 0.5)' }}>
                      🔙 Trả về HR (Tạo lại)
                    </button>
                    <button onClick={() => openModal(review.id, 'Approve')} className="btn btn-primary" disabled={review.status !== 'Verified'} style={{ opacity: review.status !== 'Verified' ? 0.5 : 1 }}>
                      ✅ Phê duyệt
                    </button>
                  </div>
                </div>

                {review.status !== 'Verified' && (
                  <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                    <h4 style={{ color: 'var(--danger-color)', marginBottom: '10px' }}>🚨 Lỗi do Python Pipeline phát hiện:</h4>
                    {review.missingReqs.length > 0 && (
                      <div style={{ marginBottom: '10px' }}>
                        <strong style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Thiếu Modules Bắt Buộc (Missing Requirements):</strong>
                        <ul style={{ color: 'var(--danger-color)', fontSize: '0.9rem', paddingLeft: '20px', marginTop: '5px' }}>
                          {review.missingReqs.map(req => <li key={req}>{req}</li>)}
                        </ul>
                      </div>
                    )}
                    {review.unsupportedItems.length > 0 && (
                      <div>
                        <strong style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Nội dung bịa đặt (Hallucinations / Unsupported):</strong>
                        <ul style={{ color: 'var(--danger-color)', fontSize: '0.9rem', paddingLeft: '20px', marginTop: '5px' }}>
                          {review.unsupportedItems.map(item => <li key={item}>{item}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* CUSTOM MODAL */}
      {modalData.isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel animate-fade-in" style={{ width: '400px', padding: '30px', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>
              {modalData.action === 'Reject' ? '🔙' : '✅'}
            </div>
            <h3 style={{ marginBottom: '15px', color: modalData.action === 'Reject' ? 'var(--warning-color)' : 'var(--success-color)' }}>
              {modalData.action === 'Reject' ? 'Xác nhận Trả về' : 'Phê duyệt Kế hoạch'}
            </h3>
            <p style={{ color: '#94a3b8', marginBottom: '25px', fontSize: '0.95rem' }}>
              {modalData.message}
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                type="button" 
                onClick={() => setModalData({ ...modalData, isOpen: false })} 
                className="btn" 
                style={{ flex: 1, background: 'rgba(255,255,255,0.1)' }}>
                Hủy
              </button>
              <button 
                type="button" 
                onClick={confirmAction} 
                className="btn btn-primary" 
                style={{ flex: 1 }}>
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
