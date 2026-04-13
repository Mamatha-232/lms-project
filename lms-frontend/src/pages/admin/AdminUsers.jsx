import { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';
import { Users, Search, Trash2, Edit3, Shield, X, Check, Key } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    try {
      const res = await userAPI.getAll();
      setUsers(res.data || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user permanently?')) return;
    try {
      await userAPI.delete(id);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      alert('Failed to delete user.');
    }
  };

  const startEdit = (user) => {
    setEditingId(user.id);
    setEditData({ 
      name: user.name, 
      email: user.email, 
      role: user.role, 
      active: user.status === 'active' ? 'true' : 'false',
      password: '' 
    });
  };

  const saveEdit = async (id) => {
    setSaving(true);
    try {
      // Create request object, omitting password if empty
      const requestData = { ...editData };
      if (!requestData.password) delete requestData.password;
      
      await userAPI.update(id, requestData);
      setEditingId(null);
      loadUsers();
    } catch (err) {
      alert('Failed to update user.');
    } finally {
      setSaving(false);
    }
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.role?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner" />
        <span>Loading users...</span>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--on-surface)' }}>
          User Management ({users.length})
        </h2>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'var(--surface-container)', borderRadius: 12,
          padding: '10px 16px', border: '1px solid rgba(74, 66, 107, 0.15)',
          minWidth: 260,
        }}>
          <Search size={18} style={{ color: 'var(--on-surface-variant)', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              background: 'transparent', border: 'none', outline: 'none',
              color: 'var(--on-surface)', fontSize: '0.9rem', width: '100%',
              fontFamily: 'var(--font-body)',
            }}
          />
        </div>
      </div>

      <div style={{
        background: 'var(--surface-container-high)', borderRadius: 16,
        border: '1px solid rgba(74, 66, 107, 0.12)', overflow: 'hidden',
      }}>
        <table className="data-table" style={{ borderSpacing: 0 }}>
          <thead>
            <tr>
              <th style={{ padding: '16px 20px' }}>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(user => (
              <tr key={user.id} style={{ borderBottom: '1px solid rgba(74, 66, 107, 0.1)' }}>
                <td style={{ padding: '14px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 12,
                      background: 'linear-gradient(135deg, var(--primary-dim), var(--primary))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0,
                    }}>
                      {user.name?.charAt(0)?.toUpperCase()}
                    </div>
                    {editingId === user.id ? (
                      <input value={editData.name} onChange={e => setEditData(p => ({ ...p, name: e.target.value }))}
                        className="input-field"
                        style={{ padding: '6px 10px', fontSize: '0.85rem', width: 140 }} />
                    ) : (
                      <span style={{ fontWeight: 600 }}>{user.name}</span>
                    )}
                  </div>
                </td>
                <td style={{ fontSize: '0.88rem' }}>{user.email}</td>
                <td>
                  {editingId === user.id ? (
                    <select value={editData.role} onChange={e => setEditData(p => ({ ...p, role: e.target.value }))}
                      className="input-field"
                      style={{ padding: '6px 10px', fontSize: '0.8rem', width: 'auto' }}>
                      <option value="ADMIN">Admin</option>
                      <option value="TEACHER">Teacher</option>
                      <option value="STUDENT">Student</option>
                    </select>
                  ) : (
                    <span className={`role-badge ${user.role?.toLowerCase()}`}>{user.role}</span>
                  )}
                </td>
                <td>
                  <span className={`status-badge ${user.status}`}>{user.status}</span>
                </td>
                <td style={{ textAlign: 'right', paddingRight: 20 }}>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center' }}>
                    {editingId === user.id ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                          <Key size={14} style={{ position: 'absolute', left: 8, color: 'var(--on-surface-variant)' }} />
                          <input 
                            placeholder="Reset Password"
                            type="text"
                            value={editData.password}
                            onChange={e => setEditData({...editData, password: e.target.value})}
                            className="input-field"
                            style={{ padding: '6px 10px 6px 28px', fontSize: '0.75rem', width: 130 }}
                          />
                        </div>
                        <button onClick={() => saveEdit(user.id)} title="Save" disabled={saving}
                          style={{ background: 'rgba(72, 199, 142, 0.15)', border: 'none', borderRadius: 8,
                            padding: 8, cursor: 'pointer', color: '#48c78e' }}>
                          <Check size={16} />
                        </button>
                        <button onClick={() => setEditingId(null)} title="Cancel"
                          style={{ background: 'rgba(167, 1, 56, 0.1)', border: 'none', borderRadius: 8,
                            padding: 8, cursor: 'pointer', color: 'var(--error)' }}>
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <button onClick={() => startEdit(user)} title="Edit User"
                          style={{ background: 'rgba(96, 99, 238, 0.1)', border: 'none', borderRadius: 8,
                            padding: 8, cursor: 'pointer', color: 'var(--primary)', transition: 'all 0.25s' }}>
                          <Edit3 size={16} />
                        </button>
                        <button onClick={() => handleDelete(user.id)} title="Delete User"
                          style={{ background: 'rgba(167, 1, 56, 0.1)', border: 'none', borderRadius: 8,
                            padding: 8, cursor: 'pointer', color: 'var(--error)', transition: 'all 0.25s' }}>
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="empty-state" style={{ padding: 64 }}>
            <Users size={48} />
            <p>No users found{search ? ` matching "${search}"` : ''}.</p>
          </div>
        )}
      </div>
    </div>
  );
}
