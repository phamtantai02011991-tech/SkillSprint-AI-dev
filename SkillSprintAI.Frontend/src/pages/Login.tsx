import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Điền nhanh thông tin từ Thẻ Role
  const fillCredentials = (autoEmail: string, autoPass: string) => {
    setEmail(autoEmail);
    setPassword(autoPass);
    setError('');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const res = await fetch('http://localhost:5156/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Đăng nhập thất bại');
      }
      
      // Lưu thông tin dựa trên Remember Me (Local vs Session Storage)
      if (rememberMe) {
        localStorage.setItem('user', JSON.stringify(data));
      } else {
        sessionStorage.setItem('user', JSON.stringify(data));
      }
      
      if (data.role === 'SystemAdmin') navigate('/system-admin');
      else if (data.role === 'Admin' || data.role === 'HR') navigate('/admin');
      else if (data.role === 'Reviewer') navigate('/reviewer');
      else navigate('/employee');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container animate-fade-in" style={{ overflowY: 'auto', padding: '40px 20px' }}>
      <div className="glass-panel login-box" style={{ maxWidth: '450px', margin: '0 auto' }}>
        <div className="header" style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '2.5rem' }}>SkillSprint AI</h1>
          <p>Sign in to OnboardVerse</p>
        </div>
        
        {error && <div style={{ background: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger-color)', padding: '10px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>{error}</div>}
        
        {/* Form Đăng Nhập */}
        <form onSubmit={handleFormSubmit} style={{ marginBottom: '30px', paddingBottom: '30px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="input-group">
            <label>Email Address</label>
            <input 
              type="email" 
              placeholder="you@company.com" 
              required 
              className="form-input" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
            />
          </div>
          
          <div className="input-group" style={{ marginTop: '20px' }}>
            <label>Password</label>
            <div className="password-wrapper">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" 
                required 
                className="form-input" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                style={{ paddingRight: '40px' }}
              />
              <button 
                type="button"
                className="btn-toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', color: '#94a3b8' }}>
              <input 
                type="checkbox" 
                checked={rememberMe} 
                onChange={(e) => setRememberMe(e.target.checked)} 
                style={{ width: '16px', height: '16px', accentColor: 'var(--primary-color)' }}
              />
              Remember me
            </label>
            <a href="#" style={{ fontSize: '0.9rem', color: 'var(--primary-color)' }}>Forgot password?</a>
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '25px', padding: '12px' }} disabled={isLoading}>
            {isLoading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Quick Fill Cards */}
        <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '15px', fontSize: '0.9rem' }}>Quick Fill Demo Accounts</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          {/* System Admin Card */}
          <div 
            className="glass-panel" 
            style={{ 
              cursor: 'pointer', 
              textAlign: 'center', 
              padding: '15px 5px',
              transition: 'all 0.2s ease',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              background: 'rgba(239, 68, 68, 0.05)'
            }}
            onClick={() => fillCredentials('sysadmin@skillsprint.ai', 'admin123')}
          >
            <div style={{ fontSize: '1.5rem' }}>⚙️</div>
            <h4 style={{ color: 'var(--danger-color)', marginTop: '8px', fontSize: '0.9rem' }}>System Admin</h4>
          </div>

          {/* HR Admin Card */}
          <div 
            className="glass-panel" 
            style={{ 
              cursor: 'pointer', 
              textAlign: 'center', 
              padding: '15px 5px',
              transition: 'all 0.2s ease',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              background: 'rgba(59, 130, 246, 0.05)'
            }}
            onClick={() => fillCredentials('hr@skillsprint.ai', 'hr123')}
          >
            <div style={{ fontSize: '1.5rem' }}>👨‍💼</div>
            <h4 style={{ color: 'var(--primary-color)', marginTop: '8px', fontSize: '0.9rem' }}>HR Manager</h4>
          </div>

          {/* Reviewer Card */}
          <div 
            className="glass-panel" 
            style={{ 
              cursor: 'pointer', 
              textAlign: 'center', 
              padding: '15px 5px',
              transition: 'all 0.2s ease',
              border: '1px solid rgba(234, 179, 8, 0.4)',
              background: 'rgba(234, 179, 8, 0.05)'
            }}
            onClick={() => fillCredentials('reviewer@skillsprint.ai', 'rev123')}
          >
            <div style={{ fontSize: '1.5rem' }}>🔍</div>
            <h4 style={{ color: 'var(--warning-color)', marginTop: '8px', fontSize: '0.9rem' }}>QA Reviewer</h4>
          </div>

          {/* Alex (CS Dept) Card */}
          <div 
            className="glass-panel" 
            style={{ 
              cursor: 'pointer', 
              textAlign: 'center', 
              padding: '15px 5px',
              transition: 'all 0.2s ease',
              border: '1px solid rgba(139, 92, 246, 0.4)',
              background: 'rgba(139, 92, 246, 0.05)'
            }}
            onClick={() => fillCredentials('alex@skillsprint.ai', 'emp123')}
          >
            <div style={{ fontSize: '1.5rem' }}>🧑‍🎓</div>
            <h4 style={{ color: 'var(--secondary-color)', marginTop: '8px', fontSize: '0.9rem' }}>Alex (Customer Support)</h4>
          </div>

          {/* Mike (Finance Dept) Card */}
          <div 
            className="glass-panel" 
            style={{ 
              cursor: 'pointer', 
              textAlign: 'center', 
              padding: '15px 5px',
              transition: 'all 0.2s ease',
              border: '1px solid rgba(139, 92, 246, 0.4)',
              background: 'rgba(139, 92, 246, 0.05)'
            }}
            onClick={() => fillCredentials('mike@skillsprint.ai', 'emp123')}
          >
            <div style={{ fontSize: '1.5rem' }}>🧑‍💼</div>
            <h4 style={{ color: 'var(--secondary-color)', marginTop: '8px', fontSize: '0.9rem' }}>Mike (Finance)</h4>
          </div>
        </div>
      </div>
    </div>
  );
}
