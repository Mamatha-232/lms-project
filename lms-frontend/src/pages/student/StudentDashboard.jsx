import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { courseAPI, assignmentAPI } from '../../services/api';
import { BookOpen, ClipboardList, GraduationCap, TrendingUp, ArrowRight, Search, Clock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [coursesRes, assignmentsRes] = await Promise.all([
        courseAPI.getEnrolled(),
        assignmentAPI.getStudentAssignments(),
      ]);
      setCourses(coursesRes.data || []);
      setAssignments(assignmentsRes.data || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const pendingCount = assignments.filter(a => a.status === 'unsubmitted').length;

  const stats = [
    { icon: <BookOpen size={24} />, value: courses.length, label: 'Enrolled Courses', color: 'var(--primary)' },
    { icon: <ClipboardList size={24} />, value: pendingCount, label: 'Pending Tasks', color: '#ffb74d' },
    { icon: <GraduationCap size={24} />, value: '87%', label: 'Average Grade', color: '#48c78e' },
    { icon: <TrendingUp size={24} />, value: '12%', label: 'Attendance', color: 'var(--tertiary)' },
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
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 8px 0' }}>Welcome back, {user?.name}!</h2>
        <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.95rem' }}>You have {pendingCount} assignments due this week. Keep up the great work!</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid" style={{ marginBottom: 40 }}>
        {stats.map((stat, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: `${stat.color}20`, color: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-value" style={{ color: stat.color }}>{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 32 }}>
        {/* Course Section */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>My Courses</h3>
            <button className="btn-secondary" onClick={() => navigate('/student/courses')} style={{ padding: '8px 16px', fontSize: '0.8rem' }}>View All</button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 20 }}>
            {courses.slice(0, 3).map((course) => (
              <div key={course.id} className="course-card" style={{ display: 'flex', alignItems: 'center', gap: 20, padding: 20 }}>
                 <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(96,99,238,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                    <BookOpen size={22} />
                 </div>
                 <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--on-surface)' }}>{course.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>{course.instructor}</div>
                 </div>
                 <button onClick={() => navigate(`/student/course/${course.id}`)} style={{ background: 'none', border: 'none', color: 'var(--on-surface-variant)', cursor: 'pointer' }}>
                    <ArrowRight size={20} />
                 </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
