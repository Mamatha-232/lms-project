import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { courseAPI } from '../../services/api';
import { BookOpen, Users, Plus, ArrowRight, Trash2 } from 'lucide-react';

export default function TeacherCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadCourses(); }, []);

  const loadCourses = async () => {
    try {
      const res = await courseAPI.getByTeacher();
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.5rem', fontWeight: 700 }}>My Courses</h2>
        <button className="btn-primary" onClick={() => navigate('/teacher/create-course')} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plus size={18} /> New Course
        </button>
      </div>

      {courses.length === 0 ? (
        <div className="empty-state">
          <BookOpen size={48} />
          <p>No courses yet. Create your first course!</p>
          <button className="btn-primary" onClick={() => navigate('/teacher/create-course')} style={{ marginTop: 16 }}>
            <Plus size={18} style={{ marginRight: 8, display: 'inline' }} /> Create Course
          </button>
        </div>
      ) : (
        <div className="courses-grid">
          {courses.map((course) => (
            <div key={course.id} className="course-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div className="course-title">{course.title}</div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(course.id); }}
                  style={{
                    background: 'rgba(167, 1, 56, 0.1)', border: 'none', borderRadius: 8,
                    padding: 8, cursor: 'pointer', color: 'var(--error)', transition: 'all 0.25s',
                  }}
                  title="Delete course"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="course-instructor">{course.enrolledCount || 0} students • {course.status || 'active'}</div>
              {course.description && (
                <p style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)', margin: '8px 0 16px', lineHeight: 1.5 }}>
                  {course.description.length > 100 ? course.description.slice(0, 100) + '...' : course.description}
                </p>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                <span className={`status-badge ${course.status || 'active'}`}>{course.status || 'active'}</span>
                <button
                  className="btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6 }}
                  onClick={() => navigate(`/teacher/course/${course.id}`)}
                >
                  Manage <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
