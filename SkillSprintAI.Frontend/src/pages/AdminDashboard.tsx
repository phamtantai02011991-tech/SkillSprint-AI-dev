import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('documents');
  const [lang, setLang] = useState('vi');

  // Helper dịch thuật nhanh
  const t = (vi: string, en: string) => lang === 'vi' ? vi : en;

  // Tài liệu thực nghiệm
  const [seededDocs, setSeededDocs] = useState<{fileName: string, status: string}[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);

  useEffect(() => {
    fetch('http://localhost:5156/api/documents/seeded')
      .then(res => res.json())
      .then(data => setSeededDocs(data))
      .catch(err => console.error("Lỗi fetch tài liệu:", err));
  }, []);

  // GenAI Pipeline 1 State
  const [genRole, setGenRole] = useState('Customer Support Executive');
  const [genLevel, setGenLevel] = useState('Fresher');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  const [isSentToReview, setIsSentToReview] = useState(false);

  // Trạng thái cho Upload
  const [uploadStatus, setUploadStatus] = useState<{show: boolean, message: string, type: 'success'|'error'} | null>(null);
  const [recentlyUploaded, setRecentlyUploaded] = useState<string[]>([]);

  // Logic lọc tài liệu theo phòng ban
  const filteredDocs = seededDocs.filter(doc => {
    // Nếu là file vừa upload trong session này, luôn hiển thị
    if (recentlyUploaded.includes(doc.fileName)) return true;

    if (genRole.includes('Customer Support') || genRole === 'Alex') {
      return doc.fileName.startsWith('CustomerSupport_') || doc.fileName.startsWith('General_');
    }
    if (genRole.includes('Finance')) {
      return doc.fileName.startsWith('Finance_') || doc.fileName.startsWith('General_');
    }
    return true; // Mặc định show hết
  });

  // Tự động tick các tài liệu đã được lọc mỗi khi đổi genRole
  useEffect(() => {
    setSelectedDocs(filteredDocs.map(d => d.fileName));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [genRole, seededDocs.length]);


  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentId', `DOC-${Date.now()}`);
    formData.append('version', '1.0');

    fetch('http://localhost:5156/api/documents/upload-async', {
      method: 'POST',
      body: formData,
    })
    .then(res => res.json())
    .then(data => {
      // Báo thành công bằng UI Custom
      setUploadStatus({
        show: true,
        message: `File đã được tải lên! ${data.Message || ''} (JobId: ${data.JobId || 'N/A'})`,
        type: 'success'
      });
      
      // Load lại list nếu cần, tạm thời thêm giả lập vào seededDocs
      setSeededDocs(prev => [{ fileName: file.name, status: "Uploading..." }, ...prev]);
      
      // Thêm vào danh sách vừa upload để không bị giấu bởi filter
      setRecentlyUploaded(prev => [...prev, file.name]);
    })
    .catch(err => {
      console.error("Lỗi upload:", err);
      setUploadStatus({
        show: true,
        message: "Có lỗi xảy ra khi tải file lên.",
        type: 'error'
      });
    });
  };

  // Logic GenAI giả lập
  const handleGeneratePlan = () => {
    setIsGenerating(true);
    setGeneratedPlan(null);
    setIsSentToReview(false);
    
    setTimeout(() => {
      setIsGenerating(false);
      
      const dynamicModules = selectedDocs.length > 0 
        ? selectedDocs.map((doc, idx) => ({ id: `M0${idx+1}`, title: `Phân tích từ ${doc}`, mandatory: true, source: doc }))
        : [
            { id: 'M04', title: 'Customer Escalation Process', mandatory: true, source: 'SOP-07' },
            { id: 'M05', title: 'Information Security Basics', mandatory: true, source: 'POL-HR-01' }
          ];

      setGeneratedPlan({
        role: genRole,
        level: genLevel,
        modules: dynamicModules,
        tasks: [
          { task: 'Respond to a simulated customer complaint', due: 'Week 1' }
        ]
      });
    }, 2500); // 2.5s loading giả lập
  };

  const handleSendToReview = () => {
    setIsSentToReview(true);
    // Ở đây sẽ có logic lưu xuống DB (AuditLog, OnboardingPlan...)
  };

  // Mock Data cho Bảng Giám sát (Tab 2)
  const trainingData = [
    { id: 1, name: 'Alex', role: 'Learner', progress: 85, score: 92, status: 'On Track' },
    { id: 2, name: 'Sarah', role: 'Customer Support', progress: 40, score: 75, status: 'Behind Schedule' },
    { id: 3, name: 'Mike', role: 'Finance Associate', progress: 100, score: 98, status: 'Completed' }
  ];

  // Mock Data cho Cảnh báo (Tab 3)
  const flaggedData = [
    { id: 'F01', issue: 'Missing Requirement', detail: 'Chưa có Policy đào tạo "Data Privacy" cho Role Learner', severity: 'High' },
    { id: 'F02', issue: 'Hallucination', detail: 'Reviewer trả về Module "Fake Procedure" do AI bịa ra', severity: 'Critical' },
    { id: 'F03', issue: 'Outdated Document', detail: 'Tài liệu SOP-07 đã hết hạn, cần update bản mới', severity: 'Medium' }
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-color)', color: 'var(--text-color)' }}>
      {/* Sidebar */}
      <div className="glass-panel" style={{ width: '260px', borderRadius: '0', borderLeft: 'none', borderTop: 'none', borderBottom: 'none', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 style={{ color: 'var(--primary-color)' }}>SkillSprint AI</h2>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>HR Workspace (Admin)</p>
        </div>
        <ul style={{ listStyle: 'none', padding: '20px', flex: 1 }}>
          <li 
            onClick={() => setActiveTab('documents')}
            style={{ padding: '12px 10px', cursor: 'pointer', borderRadius: '8px', background: activeTab === 'documents' ? 'rgba(59, 130, 246, 0.1)' : 'transparent', color: activeTab === 'documents' ? 'var(--primary-color)' : '#94a3b8' }}>
            📄 {t('Quản lý Tài liệu', 'Document Management')}
          </li>
          <li 
            onClick={() => setActiveTab('generate')}
            style={{ padding: '12px 10px', cursor: 'pointer', borderRadius: '8px', background: activeTab === 'generate' ? 'rgba(59, 130, 246, 0.1)' : 'transparent', color: activeTab === 'generate' ? 'var(--primary-color)' : '#94a3b8' }}>
            ✨ {t('Khởi tạo Lộ trình (AI)', 'Generate Plan (AI)')}
          </li>
          <li 
            onClick={() => setActiveTab('progress')}
            style={{ padding: '12px 10px', cursor: 'pointer', borderRadius: '8px', background: activeTab === 'progress' ? 'rgba(59, 130, 246, 0.1)' : 'transparent', color: activeTab === 'progress' ? 'var(--primary-color)' : '#94a3b8' }}>
            📊 {t('Giám sát Đào tạo', 'Training Progress')}
          </li>
          <li 
            onClick={() => setActiveTab('compliance')}
            style={{ padding: '12px 10px', cursor: 'pointer', borderRadius: '8px', background: activeTab === 'compliance' ? 'rgba(59, 130, 246, 0.1)' : 'transparent', color: activeTab === 'compliance' ? 'var(--primary-color)' : '#94a3b8' }}>
            ⚠️ {t('Báo cáo Tuân thủ', 'Compliance Report')}
          </li>
          <li 
            onClick={() => setActiveTab('settings')}
            style={{ padding: '12px 10px', cursor: 'pointer', borderRadius: '8px', background: activeTab === 'settings' ? 'rgba(59, 130, 246, 0.1)' : 'transparent', color: activeTab === 'settings' ? 'var(--primary-color)' : '#94a3b8' }}>
            ⚙️ {t('Cài đặt Hệ thống', 'System Settings')}
          </li>
        </ul>
        <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button onClick={handleLogout} className="btn" style={{ width: '100%', background: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger-color)' }}>{t('Đăng xuất', 'Logout')}</button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto', position: 'relative' }}>
        
        {/* Nút Toggle Ngôn ngữ */}
        <button 
          onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')}
          style={{ position: 'absolute', top: '20px', right: '40px', padding: '8px 16px', borderRadius: '20px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {lang === 'vi' ? '🇻🇳 VN' : '🇺🇸 EN'}
        </button>

        {/* Hidden File Input (Global for this component) */}
        <input 
          type="file" 
          id="doc-upload" 
          style={{ display: 'none' }} 
          onChange={handleFileUpload} 
          accept=".pdf,.docx" 
        />
        
        {/* TAB 1: DOCUMENTS */}
        {activeTab === 'documents' && (
          <div className="animate-fade-in" style={{ marginTop: '20px' }}>
            <h1 style={{ marginBottom: '10px' }}>{t('Kho Tài liệu Tổ chức', 'Organizational Document Repository')}</h1>
            <p style={{ color: '#94a3b8', marginBottom: '30px' }}>{t('Tải lên các Chính sách, SOP, và Cẩm nang để AI phân tích.', 'Upload Policies, SOPs, and Handbooks for AI analysis.')}</p>
            
            <div className="glass-panel" style={{ textAlign: 'center', padding: '40px', border: '2px dashed rgba(59, 130, 246, 0.5)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📥</div>
              <h3 style={{ color: 'var(--primary-color)' }}>{t('Kéo thả tài liệu vào đây', 'Drag and drop documents here')}</h3>
              <p style={{ color: '#94a3b8', margin: '10px 0 20px 0' }}>{t('Hỗ trợ .PDF, .DOCX (Tối đa 50MB)', 'Supports .PDF, .DOCX (Max 50MB)')}</p>
              
              <button 
                className="btn btn-primary"
                onClick={() => document.getElementById('doc-upload')?.click()}
              >
                {t('Chọn File Tải Lên', 'Choose File to Upload')}
              </button>
            </div>
            
            <h3 style={{ marginTop: '40px', marginBottom: '15px' }}>{t('Tài liệu Đã Xử lý', 'Processed Documents')} ({seededDocs.length})</h3>
            <div className="glass-panel" style={{ padding: '20px', minHeight: '400px', maxHeight: '70vh', overflowY: 'auto' }}>
              {seededDocs.length === 0 ? (
                <div style={{ color: '#94a3b8', textAlign: 'center', padding: '20px' }}>{t('Chưa có tài liệu nào.', 'No documents yet.')}</div>
              ) : (
                seededDocs.map((doc, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', marginBottom: '10px', color: '#94a3b8' }}>
                    <span>{doc.fileName}</span>
                    <span style={{ color: 'var(--success-color)' }}>{doc.status}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 2: GENERATE PLAN (PIPELINE 1) */}
        {activeTab === 'generate' && (
          <div className="animate-fade-in" style={{ marginTop: '20px' }}>
            <h1 style={{ marginBottom: '10px' }}>✨ {t('Khởi tạo Lộ trình (Pipeline 1)', 'Generate Onboarding Plan (Pipeline 1)')}</h1>
            <p style={{ color: '#94a3b8', marginBottom: '30px' }}>{t('Sử dụng Generative AI để tự động sinh lộ trình Onboarding dựa trên Kho Tài liệu.', 'Use Generative AI to automatically build an Onboarding plan based on Documents.')}</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Box 1 & 2: Cấu hình và Tài liệu (Chia 2 cột) */}
              <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '20px', alignItems: 'stretch' }}>
                
                {/* Box 1: Cấu hình AI Prompt */}
                <div className="glass-panel" style={{ padding: '30px' }}>
                  <h3 style={{ marginBottom: '20px', color: 'var(--primary-color)' }}>{t('Cấu hình AI Prompt', 'AI Prompt Configuration')}</h3>
                  
                  <div className="input-group" style={{ marginBottom: '15px' }}>
                    <label>{t('Loại Lộ trình (Plan Type)', 'Plan Type')}</label>
                    <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input type="radio" name="planType" value="Department" defaultChecked />
                        {t('Phòng Ban (Bắt buộc)', 'Department (Mandatory)')}
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input type="radio" name="planType" value="Individual" />
                        {t('Cá Nhân (Nâng cấp)', 'Individual (Upskilling)')}
                      </label>
                    </div>
                  </div>

                  <div className="input-group" style={{ marginBottom: '15px' }}>
                    <label>{t('Mục tiêu (Target)', 'Target')}</label>
                    <select className="form-input" value={genRole} onChange={e => setGenRole(e.target.value)} style={{ background: '#1e293b' }}>
                      <optgroup label={t('Phòng Ban', 'Department')}>
                        <option value="Customer Support">Customer Support Dept</option>
                        <option value="Finance">Finance Dept</option>
                      </optgroup>
                      <optgroup label={t('Cá Nhân', 'Individual')}>
                        <option value="Alex">Alex (Learner)</option>
                        <option value="Sarah">Sarah (Manager)</option>
                      </optgroup>
                    </select>
                  </div>
                  
                  <div className="input-group" style={{ marginBottom: '15px' }}>
                    <label>{t('Mức độ Kinh nghiệm (Experience)', 'Experience Level')}</label>
                    <select className="form-input" value={genLevel} onChange={e => setGenLevel(e.target.value)} style={{ background: '#1e293b' }}>
                      <option value="Fresher">{t('Fresher (Mới tốt nghiệp)', 'Fresher (New Grad)')}</option>
                      <option value="Junior">Junior</option>
                      <option value="Senior">Senior</option>
                    </select>
                  </div>
                </div>

                {/* Box 2: Tài liệu Tham chiếu */}
                <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, color: 'var(--primary-color)' }}>{t('Tài liệu Tham chiếu', 'Reference Documents')} ({filteredDocs.length})</h3>
                    <button 
                      onClick={() => document.getElementById('doc-upload')?.click()}
                      className="btn" 
                      style={{ padding: '6px 12px', fontSize: '0.85rem', background: 'rgba(59, 130, 246, 0.2)', color: 'var(--primary-color)', border: '1px solid var(--primary-color)' }}
                    >
                      [+] {t('Tải file mới', 'Upload New File')}
                    </button>
                  </div>
                  
                  <div className="form-input" style={{ background: '#1e293b', flex: 1, maxHeight: '320px', overflowY: 'auto', padding: '15px' }}>
                    {filteredDocs.length === 0 ? (
                      <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{t('Không tìm thấy tài liệu phù hợp.', 'No relevant documents found.')}</div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
                        {filteredDocs.map((doc, idx) => (
                          <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', color: '#cbd5e1' }}>
                            <input 
                              type="checkbox" 
                              checked={selectedDocs.includes(doc.fileName)}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedDocs([...selectedDocs, doc.fileName]);
                                else setSelectedDocs(selectedDocs.filter(d => d !== doc.fileName));
                              }}
                            />
                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={doc.fileName}>{doc.fileName}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Nút Khởi chạy */}
              <button 
                onClick={handleGeneratePlan}
                disabled={isGenerating}
                className="btn btn-primary" 
                style={{ width: '100%', padding: '15px', fontSize: '1.1rem' }}>
                {isGenerating ? `⏳ ${t('Đang xử lý...', 'Processing...')}` : `🧠 ${t('Khởi chạy Pipeline 1 (GenAI)', 'Run Pipeline 1 (GenAI)')}`}
              </button>

              {/* Box 3: Kết quả đầu ra */}
              <div className="glass-panel" style={{ padding: '30px', minHeight: '320px' }}>
                <h3 style={{ marginBottom: '20px', color: 'var(--primary-color)' }}>{t('Kết quả lộ trình và bài quiz', 'Generated Plan & Quiz Results')}</h3>
                
                {isGenerating && (
                  <div style={{ textAlign: 'center', marginTop: '50px', color: '#94a3b8' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '15px', animation: 'pulse 1.5s infinite' }}>🧠</div>
                    <p>{t('AI đang đọc và phân tích tài liệu để lên kế hoạch...', 'AI is analyzing documents to generate plan...')}</p>
                  </div>
                )}

                {!isGenerating && !generatedPlan && (
                  <div style={{ textAlign: 'center', marginTop: '80px', color: '#64748b' }}>
                    {t('Chưa có lộ trình nào được sinh.', 'No plan generated yet.')}
                  </div>
                )}

                {!isGenerating && generatedPlan && (
                  <div className="animate-fade-in">
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                      <p style={{ margin: '0 0 10px 0', color: '#e2e8f0' }}>Role: <strong>{generatedPlan.role}</strong> ({generatedPlan.level})</p>
                      
                      <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '5px' }}>Learning Modules:</p>
                      <ul style={{ paddingLeft: '20px', marginBottom: '15px', color: '#e2e8f0' }}>
                        {generatedPlan.modules.map((m: any) => (
                          <li key={m.id}>
                            {m.title} <span style={{ color: 'var(--success-color)', fontSize: '0.8rem' }}>[{m.source}]</span>
                          </li>
                        ))}
                      </ul>

                      <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '5px' }}>Practical Tasks:</p>
                      <ul style={{ paddingLeft: '20px', color: '#e2e8f0' }}>
                        {generatedPlan.tasks.map((t: any, idx: number) => (
                          <li key={idx}>
                            {t.task} <span style={{ color: 'var(--warning-color)', fontSize: '0.8rem' }}>[{t.due}]</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {!isSentToReview ? (
                      <button 
                        onClick={handleSendToReview}
                        className="btn" 
                        style={{ width: '100%', background: 'var(--success-color)', color: 'white' }}>
                        👉 {t('Gửi sang Pipeline 2 (QA Reviewer)', 'Send to Pipeline 2 (QA Reviewer)')}
                      </button>
                    ) : (
                      <div style={{ padding: '10px', background: 'rgba(34, 197, 94, 0.2)', color: 'var(--success-color)', borderRadius: '4px', textAlign: 'center' }}>
                        ✅ {t('Kế hoạch đã được lưu và chờ QA duyệt!', 'Plan submitted and awaiting QA review!')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PROGRESS */}
        {activeTab === 'progress' && (
          <div className="animate-fade-in">
            <h1 style={{ marginBottom: '10px' }}>Giám sát Tiến độ Đào tạo</h1>
            <p style={{ color: '#94a3b8', marginBottom: '30px' }}>Theo dõi mức độ hoàn thành và điểm số của từng nhân sự (Step 51).</p>
            
            <div className="glass-panel" style={{ padding: '20px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <th style={{ padding: '15px', color: '#94a3b8' }}>Nhân viên</th>
                    <th style={{ padding: '15px', color: '#94a3b8' }}>Vị trí (Role)</th>
                    <th style={{ padding: '15px', color: '#94a3b8' }}>Hoàn thành (%)</th>
                    <th style={{ padding: '15px', color: '#94a3b8' }}>Điểm số</th>
                    <th style={{ padding: '15px', color: '#94a3b8' }}>Đánh giá</th>
                  </tr>
                </thead>
                <tbody>
                  {trainingData.map(emp => (
                    <tr key={emp.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '15px' }}><strong>{emp.name}</strong></td>
                      <td style={{ padding: '15px', color: '#94a3b8' }}>{emp.role}</td>
                      <td style={{ padding: '15px' }}>
                        <div style={{ width: '100%', background: 'rgba(255,255,255,0.1)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${emp.progress}%`, background: emp.progress === 100 ? 'var(--success-color)' : 'var(--primary-color)', height: '100%' }}></div>
                        </div>
                        <span style={{ fontSize: '0.8rem', marginTop: '5px', display: 'block', color: '#94a3b8' }}>{emp.progress}%</span>
                      </td>
                      <td style={{ padding: '15px', color: 'var(--warning-color)', fontWeight: 'bold' }}>{emp.score}/100</td>
                      <td style={{ padding: '15px' }}>
                        {emp.status === 'On Track' && <span style={{ color: 'var(--primary-color)', background: 'rgba(59, 130, 246, 0.2)', padding: '5px 10px', borderRadius: '4px', fontSize: '0.85rem' }}>{emp.status}</span>}
                        {emp.status === 'Behind Schedule' && <span style={{ color: 'var(--danger-color)', background: 'rgba(239, 68, 68, 0.2)', padding: '5px 10px', borderRadius: '4px', fontSize: '0.85rem' }}>{emp.status}</span>}
                        {emp.status === 'Completed' && <span style={{ color: 'var(--success-color)', background: 'rgba(34, 197, 94, 0.2)', padding: '5px 10px', borderRadius: '4px', fontSize: '0.85rem' }}>{emp.status}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: COMPLIANCE & FLAGGED */}
        {activeTab === 'compliance' && (
          <div className="animate-fade-in">
            <h1 style={{ marginBottom: '10px' }}>Báo cáo Tuân thủ & Lỗi (Flagged Content)</h1>
            <p style={{ color: '#94a3b8', marginBottom: '30px' }}>Tổng hợp các vấn đề từ Pipeline 2 (Python Ground-Truth) và phản hồi từ QA Reviewer.</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
              <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid var(--primary-color)' }}>
                <h3 style={{ color: '#94a3b8' }}>Tổng độ bao phủ (Coverage)</h3>
                <h1 style={{ fontSize: '3rem', color: 'var(--primary-color)' }}>85%</h1>
                <p style={{ fontSize: '0.85rem', color: 'var(--danger-color)' }}>↓ Còn thiếu 15% Mandatory Policies</p>
              </div>
              <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid var(--success-color)' }}>
                <h3 style={{ color: '#94a3b8' }}>Truy xuất nguồn (Traceability)</h3>
                <h1 style={{ fontSize: '3rem', color: 'var(--success-color)' }}>92%</h1>
                <p style={{ fontSize: '0.85rem', color: 'var(--warning-color)' }}>8% nội dung thiếu trích dẫn</p>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '20px' }}>
              <h3 style={{ marginBottom: '20px', color: 'var(--danger-color)' }}>🚨 Vấn đề cần xử lý gấp</h3>
              <div style={{ display: 'grid', gap: '15px' }}>
                {flaggedData.map(flag => (
                  <div key={flag.id} style={{ background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '8px', borderLeft: `4px solid ${flag.severity === 'Critical' ? 'var(--danger-color)' : flag.severity === 'High' ? 'var(--warning-color)' : '#94a3b8'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong>[{flag.issue}]</strong>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>ID: {flag.id}</span>
                    </div>
                    <p style={{ marginTop: '8px', color: '#e2e8f0', fontSize: '0.95rem' }}>{flag.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* TAB 5: SYSTEM SETTINGS */}
        {activeTab === 'settings' && (
          <div className="animate-fade-in">
            <h1 style={{ marginBottom: '10px' }}>System Settings</h1>
            <p style={{ color: '#94a3b8', marginBottom: '30px' }}>Cấu hình API và luật ưu tiên tài liệu (Policy Precedence Rules).</p>
            
            <div style={{ display: 'grid', gap: '20px', maxWidth: '800px' }}>
              <div className="glass-panel" style={{ padding: '30px' }}>
                <h3 style={{ marginBottom: '20px', color: 'var(--primary-color)' }}>🧠 Generative AI Config</h3>
                <div className="input-group">
                  <label>Google Gemini API Key (Pipeline 1)</label>
                  <input type="password" value="AIzaSyA_*********************" readOnly className="form-input" />
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '5px' }}>Đang sử dụng model: gemini-1.5-pro</p>
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '30px' }}>
                <h3 style={{ marginBottom: '20px', color: 'var(--warning-color)' }}>⚖️ Policy Precedence Rules (Step 34)</h3>
                <p style={{ color: '#94a3b8', marginBottom: '15px', fontSize: '0.9rem' }}>Độ ưu tiên tài liệu khi xảy ra mâu thuẫn (Contradiction):</p>
                
                <ol style={{ paddingLeft: '20px', color: '#e2e8f0', lineHeight: '2' }}>
                  <li><strong>Latest Approved Policy</strong> (Cao nhất)</li>
                  <li><strong>Department SOP</strong> (Thứ hai)</li>
                  <li><strong>FAQ / Cẩm nang</strong> (Thứ ba)</li>
                  <li><strong>Informal Guidance</strong> (Thấp nhất)</li>
                </ol>
                <button className="btn" style={{ marginTop: '20px', background: 'rgba(255,255,255,0.1)' }}>Chỉnh sửa độ ưu tiên</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CUSTOM UPLOAD STATUS MODAL */}
      {uploadStatus && uploadStatus.show && (
        <div className="animate-fade-in" style={{
          position: 'fixed',
          bottom: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: uploadStatus.type === 'success' ? 'rgba(16, 185, 129, 0.9)' : 'rgba(239, 68, 68, 0.9)',
          backdropFilter: 'blur(10px)',
          color: 'white',
          padding: '15px 25px',
          borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          zIndex: 9999
        }}>
          <span style={{ fontSize: '1.2rem' }}>{uploadStatus.type === 'success' ? '✅' : '❌'}</span>
          <span>{uploadStatus.message}</span>
          <button 
            onClick={() => setUploadStatus(null)}
            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', marginLeft: '10px' }}
          >
            {t('Đóng', 'Close')}
          </button>
        </div>
      )}
    </div>
  );
}
