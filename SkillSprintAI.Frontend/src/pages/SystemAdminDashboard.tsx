import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SystemAdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState<any[]>([]);

  // Add User Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ fullName: '', email: '', passwordHash: '', role: 'Employee' });
  const [formError, setFormError] = useState('');

  // Delete Modal State
  const [userToDelete, setUserToDelete] = useState<number | null>(null);

  // Reset Password Modal State
  const [resetUser, setResetUser] = useState<any>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5156/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (err) {
      console.error("Lỗi lấy danh sách user:", err);
    }
  };

  const handleToggleLock = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:5156/api/users/${id}/toggle-lock`, { method: 'PUT' });
      if (response.ok) fetchUsers();
    } catch (err) {
      console.error("Lỗi đổi trạng thái:", err);
    }
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      const response = await fetch(`http://localhost:5156/api/users/${userToDelete}`, { method: 'DELETE' });
      if (response.ok) {
        fetchUsers();
        setUserToDelete(null);
      }
    } catch (err) {
      console.error("Lỗi xóa user:", err);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!newUser.fullName.trim() || !newUser.email.trim() || !newUser.passwordHash.trim()) {
      setFormError('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }

    try {
      const res = await fetch('http://localhost:5156/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setNewUser({ fullName: '', email: '', passwordHash: '', role: 'Employee' });
        fetchUsers();
      } else {
        const data = await res.json();
        setFormError(data.message || "Tạo user thất bại");
      }
    } catch (err) {
      setFormError("Lỗi kết nối Server");
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess(false);

    if (!newPasswordInput.trim()) {
      setResetError('Mật khẩu không được để trống.');
      return;
    }

    try {
      const res = await fetch(`http://localhost:5156/api/users/${resetUser.id}/reset-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: newPasswordInput })
      });

      if (res.ok) {
        setResetSuccess(true);
        setTimeout(() => {
          setResetUser(null);
          setNewPasswordInput('');
          setResetSuccess(false);
        }, 1500);
      } else {
        const data = await res.json();
        setResetError(data.message || "Đổi mật khẩu thất bại");
      }
    } catch (err) {
      setResetError("Lỗi kết nối Server");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Mock Audit Logs (Filtered for System Admin Privacy)
  const auditLogs = [
    { id: 1, time: '2026-10-03 01:45', user: 'System Admin', action: 'Created User', details: 'HR Manager account created', status: 'Success' },
    { id: 2, time: '2026-10-03 01:25', user: 'QA Reviewer', action: 'Manual Override', details: 'Rejected Onboarding Plan PLAN-101 (Hallucination)', status: 'Success' },
    { id: 3, time: '2026-10-02 18:30', user: 'Alex', action: 'Login Attempt', details: 'Failed password attempt', status: 'Failed' },
  ].filter(log => log.user === 'System Admin');

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-color)', color: 'var(--text-color)' }}>
      {/* Sidebar */}
      <div className="glass-panel" style={{ width: '260px', borderRadius: '0', borderLeft: 'none', borderTop: 'none', borderBottom: 'none', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 style={{ color: 'var(--danger-color)' }}>SkillSprint AI</h2>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>System Admin (Root)</p>
        </div>
        <ul style={{ listStyle: 'none', padding: '20px', flex: 1 }}>
          <li 
            onClick={() => setActiveTab('users')}
            style={{ padding: '12px 10px', cursor: 'pointer', borderRadius: '8px', background: activeTab === 'users' ? 'rgba(239, 68, 68, 0.1)' : 'transparent', color: activeTab === 'users' ? 'var(--danger-color)' : '#94a3b8' }}>
            👥 User Management
          </li>
          <li 
            onClick={() => setActiveTab('security')}
            style={{ padding: '12px 10px', cursor: 'pointer', borderRadius: '8px', background: activeTab === 'security' ? 'rgba(239, 68, 68, 0.1)' : 'transparent', color: activeTab === 'security' ? 'var(--danger-color)' : '#94a3b8' }}>
            🛡️ Security & Audit Logs
          </li>
        </ul>
        <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button onClick={handleLogout} className="btn" style={{ width: '100%', background: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger-color)' }}>Logout</button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        
        {/* TAB 1: USER MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="animate-fade-in">
            <h1 style={{ marginBottom: '10px' }}>Quản lý Người Dùng Toàn Hệ Thống</h1>
            <p style={{ color: '#94a3b8', marginBottom: '30px' }}>Tạo tài khoản, phân quyền Role, Khóa tài khoản, và Xóa tài khoản (Soft Delete).</p>
            
            <div className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>➕ Thêm User mới</button>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <th style={{ padding: '10px', color: '#94a3b8' }}>ID</th>
                    <th style={{ padding: '10px', color: '#94a3b8' }}>Tên / Email</th>
                    <th style={{ padding: '10px', color: '#94a3b8' }}>Vai trò (Role)</th>
                    <th style={{ padding: '10px', color: '#94a3b8' }}>Trạng thái</th>
                    <th style={{ padding: '10px', color: '#94a3b8' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', opacity: u.isDeleted ? 0.5 : 1 }}>
                      <td style={{ padding: '15px 10px' }}>{u.id}</td>
                      <td style={{ padding: '15px 10px' }}>
                        <div><strong>{u.fullName}</strong></div>
                        <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{u.email}</div>
                      </td>
                      <td style={{ padding: '15px 10px' }}>{u.role}</td>
                      <td style={{ padding: '15px 10px' }}>
                        {u.isDeleted ? (
                          <span style={{ padding: '5px 8px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger-color)', fontSize: '0.8rem' }}>Đã xóa (Log)</span>
                        ) : u.isActive ? (
                          <span style={{ padding: '5px 8px', borderRadius: '4px', background: 'rgba(34, 197, 94, 0.2)', color: 'var(--success-color)', fontSize: '0.8rem' }}>Đang hoạt động</span>
                        ) : (
                          <span style={{ padding: '5px 8px', borderRadius: '4px', background: 'rgba(234, 179, 8, 0.2)', color: 'var(--warning-color)', fontSize: '0.8rem' }}>Đã khóa</span>
                        )}
                      </td>
                      <td style={{ padding: '15px 10px' }}>
                        <button 
                          disabled={u.isDeleted || u.role === 'SystemAdmin'}
                          onClick={() => setResetUser(u)}
                          className="btn" 
                          style={{ marginRight: '10px', padding: '5px 10px', fontSize: '0.8rem', background: 'rgba(59, 130, 246, 0.2)', color: 'var(--primary-color)' }}>
                          🔑 Đổi MK
                        </button>
                        <button 
                          disabled={u.isDeleted || u.role === 'SystemAdmin'}
                          onClick={() => handleToggleLock(u.id)}
                          className="btn" 
                          style={{ marginRight: '10px', padding: '5px 10px', fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)' }}>
                          {u.isActive ? '🔒 Khóa' : '🔓 Mở khóa'}
                        </button>
                        <button 
                          disabled={u.isDeleted || u.role === 'SystemAdmin'}
                          onClick={() => setUserToDelete(u.id)}
                          className="btn" 
                          style={{ padding: '5px 10px', fontSize: '0.8rem', background: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger-color)' }}>
                          🗑️ Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: SECURITY LOGS */}
        {activeTab === 'security' && (
          <div className="animate-fade-in">
            <h1 style={{ marginBottom: '10px' }}>Security & Audit Logs</h1>
            <p style={{ color: '#94a3b8', marginBottom: '30px' }}>Lưu vết (Audit Trail) các hành động nhạy cảm trong hệ thống theo SRS Step 49.</p>
            
            <div className="glass-panel" style={{ padding: '20px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <th style={{ padding: '15px', color: '#94a3b8' }}>Thời gian</th>
                    <th style={{ padding: '15px', color: '#94a3b8' }}>Người dùng</th>
                    <th style={{ padding: '15px', color: '#94a3b8' }}>Hành động</th>
                    <th style={{ padding: '15px', color: '#94a3b8' }}>Chi tiết</th>
                    <th style={{ padding: '15px', color: '#94a3b8' }}>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map(log => (
                    <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '15px', color: '#94a3b8', fontSize: '0.9rem' }}>{log.time}</td>
                      <td style={{ padding: '15px' }}><strong>{log.user}</strong></td>
                      <td style={{ padding: '15px', color: 'var(--primary-color)' }}>{log.action}</td>
                      <td style={{ padding: '15px', color: '#e2e8f0' }}>{log.details}</td>
                      <td style={{ padding: '15px' }}>
                        {log.status === 'Success' ? (
                          <span style={{ color: 'var(--success-color)' }}>✅ Thành công</span>
                        ) : (
                          <span style={{ color: 'var(--danger-color)' }}>❌ Thất bại</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* MODAL: RESET PASSWORD */}
      {resetUser !== null && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel animate-fade-in" style={{ width: '400px', padding: '30px' }}>
            <h2 style={{ marginBottom: '10px' }}>Cấp lại Mật khẩu</h2>
            <p style={{ color: '#94a3b8', marginBottom: '20px', fontSize: '0.9rem' }}>Đổi mật khẩu cho: <strong>{resetUser.fullName}</strong></p>
            
            {resetSuccess ? (
              <div style={{ background: 'rgba(34, 197, 94, 0.2)', color: 'var(--success-color)', padding: '15px', borderRadius: '4px', textAlign: 'center', marginBottom: '15px' }}>
                ✅ Mật khẩu đã được cập nhật thành công!
              </div>
            ) : (
              <form onSubmit={handleResetPasswordSubmit}>
                {resetError && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger-color)', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '0.9rem', textAlign: 'center' }}>
                    {resetError}
                  </div>
                )}
                
                <div className="input-group" style={{ marginBottom: '25px' }}>
                  <label>Mật khẩu mới</label>
                  <input type="text" className="form-input" value={newPasswordInput} onChange={e => setNewPasswordInput(e.target.value)} placeholder="Nhập mật khẩu mới..." />
                </div>
                
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" onClick={() => { setResetUser(null); setResetError(''); setNewPasswordInput(''); }} className="btn" style={{ flex: 1, background: 'rgba(255,255,255,0.1)' }}>Hủy</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Cập nhật</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL: XÁC NHẬN XÓA USER */}
      {userToDelete !== null && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel animate-fade-in" style={{ width: '400px', padding: '30px', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>⚠️</div>
            <h3 style={{ marginBottom: '10px' }}>Xóa tài khoản này?</h3>
            <p style={{ color: '#94a3b8', marginBottom: '25px', fontSize: '0.9rem' }}>Bạn đang thực hiện thao tác Xóa Mềm (Soft Delete). Tài khoản này sẽ bị vô hiệu hóa nhưng lịch sử hoạt động vẫn được lưu trữ trong hệ thống Audit Logs.</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" onClick={() => setUserToDelete(null)} className="btn" style={{ flex: 1, background: 'rgba(255,255,255,0.1)' }}>Hủy</button>
              <button type="button" onClick={confirmDelete} className="btn" style={{ flex: 1, background: 'var(--danger-color)' }}>Chắc chắn xóa</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TẠO USER MỚI */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel animate-fade-in" style={{ width: '400px', padding: '30px' }}>
            <h2 style={{ marginBottom: '20px' }}>Tạo Người Dùng Mới</h2>
            
            {formError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger-color)', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '0.9rem', textAlign: 'center' }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateUser}>
              <div className="input-group" style={{ marginBottom: '15px' }}>
                <label>Họ và Tên</label>
                <input type="text" className="form-input" value={newUser.fullName} onChange={e => setNewUser({...newUser, fullName: e.target.value})} />
              </div>
              <div className="input-group" style={{ marginBottom: '15px' }}>
                <label>Email</label>
                <input type="email" className="form-input" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
              </div>
              <div className="input-group" style={{ marginBottom: '15px' }}>
                <label>Mật khẩu</label>
                <input type="password" className="form-input" value={newUser.passwordHash} onChange={e => setNewUser({...newUser, passwordHash: e.target.value})} />
              </div>
              <div className="input-group" style={{ marginBottom: '25px' }}>
                <label>Vai trò (Role)</label>
                <select className="form-input" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} style={{ background: '#1e293b' }}>
                  <option value="Employee">Learner (Employee)</option>
                  <option value="Reviewer">QA Reviewer</option>
                  <option value="Admin">HR Manager (Admin)</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn" style={{ flex: 1, background: 'rgba(255,255,255,0.1)' }}>Hủy</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Tạo Mới</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
