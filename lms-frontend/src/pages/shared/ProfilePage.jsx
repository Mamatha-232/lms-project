import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Shield, Camera, Save, Key, X, CheckCircle, AlertCircle } from 'lucide-react';
import { profileAPI } from '../../services/api';

export default function ProfilePage() {
  const { user } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passLoading, setPassLoading] = useState(false);
  const [passMessage, setPassMessage] = useState({ text: '', type: '' });

  const roleColors = {
    ADMIN: { bg: 'rgba(255, 110, 132, 0.15)', text: 'var(--error)' },
    TEACHER: { bg: 'rgba(96, 99, 238, 0.15)', text: 'var(--primary)' },
    STUDENT: { bg: 'rgba(255, 165, 217, 0.15)', text: 'var(--tertiary)' },
  };
  const rc = roleColors[user?.role] || roleColors.STUDENT;

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPassMessage({ text: 'New passwords do not match', type: 'error' });
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPassMessage({ text: 'Password must be at least 8 characters', type: 'error' });
      return;
    }

    setPassLoading(true);
    setPassMessage({ text: '', type: '' });
    try {
      await profileAPI.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPassMessage({ text: 'Password updated successfully!', type: 'success' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setShowPasswordModal(false), 2000);
    } catch (err) {
      setPassMessage({ text: err.response?.data?.message || 'Failed to update password', type: 'error' });
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: 720, margin: '0 auto' }}>
      <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.5rem', fontWeight: 700, marginBottom: 28 }}>
        My Profile
      </h2>

      {/* Avatar Section */}
      <div style={{
        background: 'var(--surface-container-high)', borderRadius: 20,
        padding: '36px', border: '1px solid rgba(74, 66, 107, 0.12)',
        marginBottom: 24, display: 'flex', alignItems: 'center', gap: 28,
      }}>
        <div style={{
          width: 88, height: 88, borderRadius: 24,
          background: 'linear-gradient(135deg, var(--primary-dim), var(--primary))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2.2rem', fontWeight: 800, color: '#fff',
          fontFamily: 'var(--font-headline)', position: 'relative',
          flexShrink: 0,
        }}>
          {user?.name?.charAt(0)?.toUpperCase() || '?'}
          <div style={{
            position: 'absolute', bottom: -4, right: -4,
            width: 32, height: 32, borderRadius: 10,
            background: 'var(--surface-container)', border: '2px solid var(--surface-container-high)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--on-surface-variant)',
          }}>
            <Camera size={14} />
          </div>
        </div>
        <div>
          <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.3rem', fontWeight: 700, margin: 0 }}>
            {user?.name || 'User'}
          </h3>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.9rem', marginTop: 4 }}>
            {user?.email || 'email@example.com'}
          </p>
          <span style={{
            display: 'inline-block', marginTop: 8, padding: '4px 14px',
            borderRadius: 20, fontFamily: 'var(--font-label)', fontSize: '0.75rem',
            fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em',
            background: rc.bg, color: rc.text,
          }}>
            {user?.role || 'STUDENT'}
          </span>
        </div>
      </div>

      {/* Info Card */}
      <div style={{
        background: 'var(--surface-container-high)', borderRadius: 20,
        padding: '36px', border: '1px solid rgba(74, 66, 107, 0.12)',
        marginBottom: 24,
      }}>
        <h3 style={{
          fontFamily: 'var(--font-headline)', fontSize: '1.1rem', fontWeight: 700,
          marginBottom: 24,
        }}>Account Information</h3>

        <div style={{ display: 'grid', gap: 20 }}>
          {[
            { icon: <User size={18} />, label: 'Full Name', value: user?.name },
            { icon: <Mail size={18} />, label: 'Email Address', value: user?.email },
            { icon: <Shield size={18} />, label: 'Role', value: user?.role },
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 16,
              padding: '16px 20px', borderRadius: 14,
              background: 'var(--surface-container)',
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: 'rgba(96, 99, 238, 0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--primary)', flexShrink: 0,
              }}>
                {item.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: 'var(--font-label)', fontSize: '0.75rem', fontWeight: 600,
                  color: 'var(--on-surface-variant)', textTransform: 'uppercase',
                  letterSpacing: '0.06em', marginBottom: 4,
                }}>
                  {item.label}
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 500 }}>{item.value || '—'}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security */}
      <div style={{
        background: 'var(--surface-container-high)', borderRadius: 20,
        padding: '36px', border: '1px solid rgba(74, 66, 107, 0.12)',
      }}>
        <h3 style={{
          fontFamily: 'var(--font-headline)', fontSize: '1.1rem', fontWeight: 700,
          marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <Key size={20} /> Security
        </h3>
        <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.9rem', marginBottom: 20 }}>
          Manage your password and account security settings.
        </p>
        <button 
          className="btn-secondary" 
          style={{ padding: '12px 24px' }}
          onClick={() => setShowPasswordModal(true)}
        >
          Change Password
        </button>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="modal-content animate-scale-up" style={{
            background: 'var(--surface-container-high)', padding: 32,
            borderRadius: 24, width: '100%', maxWidth: 450, position: 'relative',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            <button 
              onClick={() => setShowPasswordModal(false)}
              style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', color: 'var(--on-surface-variant)', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>
            
            <h3 style={{ fontSize: '1.5rem', marginBottom: 8, color: 'var(--primary)', fontFamily: 'var(--font-headline)' }}>Change Password</h3>
            <p style={{ color: 'var(--on-surface-variant)', marginBottom: 24, fontSize: '0.9rem' }}>
              Update your account password to stay secure.
            </p>

            {passMessage.text && (
              <div style={{
                padding: '12px 16px', borderRadius: 12, marginBottom: 20, fontSize: '0.85rem',
                background: passMessage.type === 'success' ? 'rgba(72, 199, 142, 0.1)' : 'rgba(255, 107, 107, 0.1)',
                color: passMessage.type === 'success' ? '#48c78e' : '#ff6b6b',
                display: 'flex', alignItems: 'center', gap: 10,
                border: `1px solid ${passMessage.type === 'success' ? 'rgba(72, 199, 142, 0.2)' : 'rgba(255, 107, 107, 0.2)'}`
              }}>
                {passMessage.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                {passMessage.text}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} style={{ display: 'grid', gap: 20 }}>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', fontWeight: 600 }}>Current Password</label>
                <input 
                  type="password" 
                  className="input-field" 
                  value={passwordForm.currentPassword} 
                  onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                  required 
                />
              </div>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', fontWeight: 600 }}>New Password</label>
                <input 
                  type="password" 
                  className="input-field" 
                  value={passwordForm.newPassword} 
                  onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                  required 
                  placeholder="Min. 8 characters"
                />
              </div>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', fontWeight: 600 }}>Confirm New Password</label>
                <input 
                  type="password" 
                  className="input-field" 
                  value={passwordForm.confirmPassword} 
                  onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                  required 
                />
              </div>
              <button type="submit" className="btn-primary" disabled={passLoading} style={{ marginTop: 8 }}>
                {passLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
