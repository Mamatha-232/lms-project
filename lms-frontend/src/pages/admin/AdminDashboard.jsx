import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../../services/api';
import { Users, BookOpen, GraduationCap, Shield, UserPlus, PlusCircle, BarChart3, Settings, Trash2, Edit3, Activity, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const usersRes = await userAPI.getAll();
      setUsers(usersRes.data || []);
    } catch (err) {
      // Mock data for demo
      setUsers([
        { id: 1, name: 'Alice Johnson', email: 'alice@lumina.edu', role: 'STUDENT', status: 'active', createdAt: '2026-03-01' },
        { id: 2, name: 'Dr. Robert Smith', email: 'robert@lumina.edu', role: 'TEACHER', status: 'active', createdAt: '2026-02-15' },
        { id: 3, name: 'Carol Davis', email: 'carol@lumina.edu', role: 'STUDENT', status: 'active', createdAt: '2026-03-10' },
        { id: 4, name: 'Prof. Emily Chen', email: 'emily@lumina.edu', role: 'TEACHER', status: 'active', createdAt: '2026-01-20' },
        { id: 5, name: 'Dan Miller', email: 'dan@lumina.edu', role: 'STUDENT', status: 'inactive', createdAt: '2026-03-25' },
        { id: 6, name: 'Admin Sarah', email: 'sarah@lumina.edu', role: 'ADMIN', status: 'active', createdAt: '2026-01-01' },
      ]);
      setActivities([
        { id: 1, text: 'New student Alice Johnson registered', time: '2 hours ago', type: 'user' },
        { id: 2, text: 'Course "Advanced React" created by Prof. Chen', time: '5 hours ago', type: 'course' },
        { id: 3, text: 'Assignment graded by Dr. Smith in "Java 101"', time: '1 day ago', type: 'grade' },
        { id: 4, text: 'System backup completed successfully', time: '2 days ago', type: 'system' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const totalStudents = users.filter(u => u.role === 'STUDENT').length;
  const totalTeachers = users.filter(u => u.role === 'TEACHER').length;
  const activeUsers = users.filter(u => u.status === 'active').length;

  const stats = [
    { icon: <Users size={22} />, value: users.length, label: 'Total Users', color: '#6063ee' },
    { icon: <GraduationCap size={22} />, value: totalStudents, label: 'Students', color: '#ef81c4' },
    { icon: <Shield size={22} />, value: totalTeachers, label: 'Teachers', color: '#ffb74d' },
    { icon: <TrendingUp size={22} />, value: activeUsers, label: 'Active Users', color: '#48c78e' },
  ];

  const quickActions = [
    { icon: <UserPlus size={22} />, label: 'Manage Users', color: '#6063ee', action: () => navigate('/admin/users') },
    { icon: <PlusCircle size={22} />, label: 'Manage Courses', color: '#48c78e', action: () => navigate('/admin/courses') },
    { icon: <BarChart3 size={22} />, label: 'View Reports', color: '#ef81c4', action: () => navigate('/admin/reports') },
    { icon: <Settings size={22} />, label: 'Settings', color: '#ffb74d', action: () => navigate('/admin/settings') },
  ];

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner" />
        <span>Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Stats */}
      <div className="stats-grid">
        {stats.map((stat, i) => (
          <div key={i} className={`stat-card animate-fade-in-delay-${i + 1}`}>
            <div className="stat-icon" style={{ background: `${stat.color}18`, color: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-value" style={{ color: stat.color }}>{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <h3 className="section-heading">Quick Actions</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14, marginBottom: 32 }}>
        {quickActions.map((action, i) => (
          <button key={i} className="quick-action-card" onClick={action.action}
            style={{ background: 'var(--surface-container-high)' }}>
            <div style={{ color: action.color, padding: 10, borderRadius: 12, background: `${action.color}15` }}>{action.icon}</div>
            <span style={{ fontFamily: 'var(--font-label)', fontSize: '0.82rem', fontWeight: 600, color: 'var(--on-surface)' }}>{action.label}</span>
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
        {/* User Management Table */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 className="section-heading" style={{ margin: 0 }}>Recent Users</h3>
            <button className="btn-secondary" onClick={() => navigate('/admin/users')} style={{ padding: '7px 14px', fontSize: '0.8rem' }}>
              View All
            </button>
          </div>
          <div style={{ background: 'var(--surface-container-high)', borderRadius: 14, border: '1px solid rgba(74, 66, 107, 0.14)', overflow: 'hidden' }}>
            <table className="data-table" style={{ borderSpacing: 0 }}>
              <thead>
                <tr>
                  <th style={{ padding: '12px 16px' }}>Name</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right', paddingRight: 16 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.slice(0, 5).map((u) => (
                  <tr key={u.id}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                          background: 'linear-gradient(135deg, var(--primary-dim), var(--primary))',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontWeight: 700, fontSize: '0.8rem',
                        }}>
                          {u.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{u.name}</span>
                      </div>
                    </td>
                    <td><span className={`role-badge ${u.role?.toLowerCase()}`}>{u.role}</span></td>
                    <td><span className={`status-badge ${u.status}`}>{u.status}</span></td>
                    <td style={{ textAlign: 'right', paddingRight: 16 }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button onClick={() => navigate('/admin/users')} title="Edit"
                          style={{ background: 'rgba(96, 99, 238, 0.1)', border: 'none', borderRadius: 7, padding: 6, cursor: 'pointer', color: 'var(--primary)' }}>
                          <Edit3 size={14} />
                        </button>
                        <button title="Delete"
                          style={{ background: 'rgba(167, 1, 56, 0.1)', border: 'none', borderRadius: 7, padding: 6, cursor: 'pointer', color: 'var(--error)' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h3 className="section-heading" style={{ marginBottom: 16 }}>Recent Activity</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {activities.map((activity) => (
              <div key={activity.id} style={{
                background: 'var(--surface-container-high)',
                border: '1px solid rgba(74, 66, 107, 0.14)',
                borderRadius: 12, padding: '14px 18px',
                display: 'flex', alignItems: 'flex-start', gap: 12,
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                  background: 'rgba(96, 99, 238, 0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--primary)',
                }}>
                  <Activity size={15} />
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--on-surface)', lineHeight: 1.4 }}>{activity.text}</span>
                  <div style={{ fontFamily: 'var(--font-label)', fontSize: '0.72rem', color: 'var(--on-surface-variant)', marginTop: 4 }}>{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
