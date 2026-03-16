import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';

export const Login = () => {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { users, setCurrentUser } = useAppStore();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginId || !password) return;

    // In a real app, this would be an API call verifying hashed passwords
    const user = users.find(u => u.loginId === loginId && u.password === password);
    
    if (!user) {
      setError('Invalid Login ID or Password');
      return;
    }

    setCurrentUser(user);
    if (user.role === 'customer') {
      navigate('/customer');
    } else if (user.role === 'admin') {
      navigate('/admin');
    } else if (user.role === 'super_admin') {
      navigate('/superadmin');
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <h1>Dood Eats</h1>
        <p style={{ textAlign: 'center', marginBottom: '24px', color: 'var(--text-muted)' }}>
          Welcome back! Please login to your account.
        </p>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--primary)', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '16px', textAlign: 'center', fontWeight: 'bold' }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Login ID</label>
            <input 
              required
              type="text" 
              className="input" 
              placeholder="Enter your Login ID"
              value={loginId}
              onChange={(e) => { setLoginId(e.target.value); setError(''); }} 
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input 
              required
              type="password" 
              className="input" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px', padding: '14px' }}>
            Login
          </button>
        </form>

        <div style={{ marginTop: '24px', fontSize: '14px', color: 'var(--text-muted)', background: 'var(--bg-color)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
          <strong>Test Accounts (Password: password)</strong>
          <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
            <li><code>alice</code> - Customer</li>
            <li><code>bob_admin</code> - Burger King Admin</li>
            <li><code>charlie_admin</code> - Pizza Hut Admin</li>
            <li><code>superadmin</code> - Super Admin</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
