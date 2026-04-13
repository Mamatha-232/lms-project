import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap, Mail, Lock, Eye, EyeOff, X } from 'lucide-react';
import { authAPI } from '../../services/api';
import './Auth.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Forgot Password State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState({ text: '', type: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      const routes = { ADMIN: '/admin', TEACHER: '/teacher', STUDENT: '/student' };
      navigate(routes[user.role] || '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMessage({ text: '', type: '' });
    try {
      const res = await authAPI.forgotPassword({ email: forgotEmail, newPassword });
      setForgotMessage({ text: res.data.message, type: 'success' });
      setTimeout(() => setShowForgotModal(false), 3000);
    } catch (err) {
      setForgotMessage({ text: err.response?.data?.message || 'Failed to reset password', type: 'error' });
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left Decorative Panel */}
      <div className="auth-decor">
        <div className="decor-content">
          <div className="decor-orb orb-1" />
          <div className="decor-orb orb-2" />
          <div className="decor-orb orb-3" />
          <div className="decor-logo">
            <GraduationCap size={48} />
          </div>
          <h1 className="decor-title">Empower Your Learning Journey</h1>
          <p className="decor-subtitle">
            Access courses, submit assignments, and track your progress — all in one platform.
          </p>
          <div className="decor-stats">
            <div className="decor-stat">
              <span className="decor-stat-value">10K+</span>
              <span className="decor-stat-label">Students</span>
            </div>
            <div className="decor-stat">
              <span className="decor-stat-value">500+</span>
              <span className="decor-stat-label">Courses</span>
            </div>
            <div className="decor-stat">
              <span className="decor-stat-value">98%</span>
              <span className="decor-stat-label">Satisfaction</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="auth-form-panel">
        <div className="auth-form-container animate-fade-in">
          <div className="auth-form-header">
            <h2>Welcome Back</h2>
            <p>Sign in to continue your learning journey</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="login-email">Email</label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  id="login-email"
                  type="email"
                  className="input-field"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ paddingLeft: '48px' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="login-password">Password</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="input-field"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ paddingLeft: '48px', paddingRight: '48px' }}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-row">
              <label className="checkbox-label">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <button 
                type="button" 
                className="forgot-link" 
                onClick={() => setShowForgotModal(true)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                Forgot Password?
              </button>
            </div>

            <button type="submit" className="btn-primary auth-submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="modal-content animate-scale-up" style={{
            background: 'var(--surface-container-high)', padding: 32,
            borderRadius: 24, width: '100%', maxWidth: 400, position: 'relative',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            <button 
              onClick={() => setShowForgotModal(false)}
              style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', color: 'var(--on-surface-variant)', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>
            
            <h3 style={{ fontSize: '1.5rem', marginBottom: 8, color: 'var(--primary)' }}>Reset Password</h3>
            <p style={{ color: 'var(--on-surface-variant)', marginBottom: 24, fontSize: '0.9rem' }}>
              Enter your email and a new password to reset your account.
            </p>

            {forgotMessage.text && (
              <div style={{
                padding: '12px 16px', borderRadius: 12, marginBottom: 20, fontSize: '0.85rem',
                background: forgotMessage.type === 'success' ? 'rgba(72, 199, 142, 0.1)' : 'rgba(255, 107, 107, 0.1)',
                color: forgotMessage.type === 'success' ? '#48c78e' : '#ff6b6b',
                border: `1px solid ${forgotMessage.type === 'success' ? 'rgba(72, 199, 142, 0.2)' : 'rgba(255, 107, 107, 0.2)'}`
              }}>
                {forgotMessage.text}
              </div>
            )}

            <form onSubmit={handleForgotSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  className="input-field" 
                  value={forgotEmail} 
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required 
                  placeholder="name@example.com"
                />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input 
                  type="password" 
                  className="input-field" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)}
                  required 
                  placeholder="Min. 8 characters"
                />
              </div>
              <button type="submit" className="btn-primary" disabled={forgotLoading} style={{ marginTop: 8 }}>
                {forgotLoading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
