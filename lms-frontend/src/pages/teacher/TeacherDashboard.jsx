import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { courseAPI, assignmentAPI } from '../../services/api';
import { BookOpen, Users, ClipboardList, TrendingUp, Plus, ArrowRight, CheckCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [coursesRes, subsRes] = await Promise.all([
        courseAPI.getByTeacher(),
        assignmentAPI.getTeacherSubmissions(),
      ]);
      setCourses(coursesRes.data || []);
      setSubmissions((subsRes.data || []).slice(0, 6)); // show last 6
    } catch (err) {
      // Mock data
      setCourses([
        { id: 1, title: 'Introduction to Java', enrolledCount: 45, status: 'active' },
        { id: 2, title: 'Data Structures & Algorithms', enrolledCount: 38, status: 'active' },
        { id: 3, title: 'Advanced Spring Boot', enrolledCount: 22, status: 'draft' },
      ]);
      setSubmissions([
        { id: 1, studentName: 'Alice Johnson', assignmentTitle: 'Java Arrays', courseName: 'Intro to Java', submittedAt: '2026-04-02', status: 'submitted' },
        { id: 2, studentName: 'Bob Williams', assignmentTitle: 'Linked List', courseName: 'Data Structures', submittedAt: '2026-04-01', status: 'submitted' },
        { id: 3, studentName: 'Carol Davis', assignmentTitle: 'REST API Project', courseName: 'Spring Boot', submittedAt: '2026-03-30', status: 'graded', grade: 88 },
        { id: 4, studentName: 'Dan Miller', assignmentTitle: 'Java OOP', courseName: 'Intro to Java', submittedAt: '2026-03-29', status: 'graded', grade: 92 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const pendingCount = submissions.filter(s => s.status === 'submitted').length;
  const totalStudents = courses.reduce((sum, c) => sum + (c.enrolledCount || 0), 0);

  const stats = [
    { icon: <BookOpen size={22} />, value: courses.length, label: 'Total Courses', color: '#6063ee' },
    { icon: <Users size={22} />, value: totalStudents, label: 'Total Students', color: '#48c78e' },
    { icon: <ClipboardList size={22} />, value: pendingCount, label: 'Pending Submissions', color: '#ffb74d' },
    { icon: <TrendingUp size={22} />, value: '82%', label: 'Avg Class Grade', color: '#ef81c4' },
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

      {/* My Courses */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <h3 className="section-heading" style={{ marginBottom: 0 }}>My Courses</h3>
        <button className="btn-primary" onClick={() => navigate('/teacher/create-course')} style={{ padding: '9px 18px', fontSize: '0.85rem' }}>
          <Plus size={16} /> Create Course
        </button>
      </div>
      <div className="courses-grid">
        {courses.map((course) => (
          <div key={course.id} className="course-card">
            <div className="course-title">{course.title}</div>
            <div className="course-instructor">{course.enrolledCount || 0} students enrolled</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 14 }}>
              <span className={`status-badge ${course.status}`}>{course.status}</span>
              <button
                className="btn-secondary"
                style={{ padding: '7px 14px', fontSize: '0.8rem' }}
                onClick={() => navigate(`/teacher/course/${course.id}`)}
              >
                Manage <ArrowRight size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Submissions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <h3 className="section-heading" style={{ marginBottom: 0 }}>Recent Submissions</h3>
        <button className="btn-secondary" onClick={() => navigate('/teacher/assignments')} style={{ padding: '7px 14px', fontSize: '0.8rem' }}>
          View All
        </button>
      </div>

      {submissions.length === 0 ? (
        <div className="empty-state" style={{ background: 'var(--surface-container)' , borderRadius: 14 }}>
          <ClipboardList size={40} />
          <p>No submissions yet.</p>
        </div>
      ) : (
        <div style={{ background: 'var(--surface-container-high)', borderRadius: 14, border: '1px solid rgba(74, 66, 107, 0.14)', overflow: 'hidden' }}>
          <table className="data-table" style={{ borderSpacing: 0 }}>
            <thead>
              <tr>
                <th style={{ padding: '12px 16px' }}>Student</th>
                <th>Assignment</th>
                <th>Course</th>
                <th>Submitted</th>
                <th>Status</th>
                <th style={{ textAlign: 'right', paddingRight: 16 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub) => (
                <tr key={sub.id}>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>{sub.studentName}</td>
                  <td style={{ fontSize: '0.85rem' }}>{sub.assignmentTitle || sub.assignment}</td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>{sub.courseName || sub.course}</td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--on-surface-variant)' }}>
                    {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : sub.date}
                  </td>
                  <td>
                    <span className={`status-badge ${sub.status}`}>
                      {sub.status === 'submitted' ? <><Clock size={10} style={{ marginRight: 3 }} />Pending</> : <><CheckCircle size={10} style={{ marginRight: 3 }} />Graded</>}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', paddingRight: 16 }}>
                    {sub.status === 'submitted' ? (
                      <button
                        className="btn-primary"
                        style={{ padding: '6px 14px', fontSize: '0.78rem' }}
                        onClick={() => navigate('/teacher/assignments')}
                      >
                        Grade
                      </button>
                    ) : (
                      <span style={{ color: '#48c78e', fontSize: '0.82rem', fontWeight: 600 }}>
                        {sub.grade !== undefined && sub.grade !== null ? `${sub.grade}` : '✓'} Graded
                      </span>
                    )}
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
