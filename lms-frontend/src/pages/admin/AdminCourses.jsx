import { useState, useEffect } from 'react';
import { courseAPI } from '../../services/api';
import { BookOpen, Users, Trash2 } from 'lucide-react';

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadCourses(); }, []);

  const loadCourses = async () => {
    try {
      const res = await courseAPI.getAll();
      setCourses(res.data || []);
    } catch (err) {
      console.error('Failed to load courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this course permanently?')) return;
    try {
      await courseAPI.delete(id);
      setCourses(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      alert('Failed to delete course.');
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: 64, color: 'var(--on-surface-variant)' }}>Loading courses...</div>;
  }

  return (
    <div className="animate-fade-in">
      <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.5rem', fontWeight: 700, marginBottom: 24 }}>
        All Courses ({courses.length})
      </h2>

      {courses.length === 0 ? (
        <div className="empty-state">
          <BookOpen size={48} />
          <p>No courses have been created yet.</p>
        </div>
      ) : (
        <div style={{
          background: 'var(--surface-container-high)', borderRadius: 16,
          border: '1px solid rgba(74, 66, 107, 0.12)', overflow: 'hidden',
        }}>
          <table className="data-table" style={{ borderSpacing: 0 }}>
            <thead>
              <tr>
                <th style={{ padding: '16px 20px' }}>Course</th>
                <th>Instructor</th>
                <th>Students</th>
                <th>Status</th>
                <th>Created</th>
                <th style={{ textAlign: 'right', paddingRight: 20 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map(course => (
                <tr key={course.id}>
                  <td style={{ padding: '14px 20px', fontWeight: 600 }}>{course.title}</td>
                  <td style={{ fontSize: '0.88rem' }}>{course.instructor || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Users size={14} style={{ color: 'var(--on-surface-variant)' }} />
                      {course.enrolledCount || 0}
                    </div>
                  </td>
                  <td><span className={`status-badge ${course.status || 'active'}`}>{course.status || 'active'}</span></td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>
                    {course.createdAt ? new Date(course.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                  </td>
                  <td style={{ textAlign: 'right', paddingRight: 20 }}>
                    <button onClick={() => handleDelete(course.id)} title="Delete"
                      style={{ background: 'rgba(167, 1, 56, 0.1)', border: 'none', borderRadius: 8,
                        padding: 8, cursor: 'pointer', color: 'var(--error)', transition: 'all 0.25s' }}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
