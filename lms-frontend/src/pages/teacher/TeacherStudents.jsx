import { useState, useEffect } from 'react';
import { courseAPI } from '../../services/api';
import { Users, Mail, BookOpen } from 'lucide-react';

export default function TeacherStudents() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const res = await courseAPI.getByTeacher();
      setCourses(res.data || []);
    } catch (err) {
      console.error('Failed to load students', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner" />
        <span>Loading students...</span>
      </div>
    );
  }

  // Aggregate all unique students to get a total count
  const allStudents = [];
  const uniqueEmails = new Set();
  courses.forEach(course => {
    if (course.enrolledStudents) {
      course.enrolledStudents.forEach(s => {
        if (!uniqueEmails.has(s.email)) {
          uniqueEmails.add(s.email);
          allStudents.push(s);
        }
      });
    }
  });

  return (
    <div className="animate-fade-in">
      <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.8rem', color: 'var(--primary)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
        <Users size={28} /> Registered Students
      </h2>
      <p style={{ color: 'var(--on-surface-variant)', marginBottom: 30 }}>
        Total unique students across all your courses: <strong>{allStudents.length}</strong>
      </p>

      {courses.length === 0 ? (
        <div className="empty-state" style={{ background: 'var(--surface-container)', padding: 40, borderRadius: 16, textAlign: 'center' }}>
          <Users size={48} style={{ margin: '0 auto 15px', color: '#666' }} />
          <p>You haven't created any courses yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
          {courses.map(course => (
            <div key={course.id} style={{ background: 'var(--surface-container-high)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <BookOpen size={18} color="var(--tertiary)" /> {course.title}
                </h3>
                <span className="status-badge" style={{ background: 'rgba(74, 66, 107, 0.2)', color: '#aaa' }}>
                  {course.enrolledCount} Registered
                </span>
              </div>
              
              <div style={{ padding: 20 }}>
                {course.enrolledStudents && course.enrolledStudents.length > 0 ? (
                  <table className="data-table" style={{ borderSpacing: 0, width: '100%' }}>
                    <thead>
                      <tr>
                        <th style={{ padding: '12px 15px', textAlign: 'left' }}>Student Name</th>
                        <th style={{ padding: '12px 15px', textAlign: 'left' }}>Email Address</th>
                      </tr>
                    </thead>
                    <tbody>
                      {course.enrolledStudents.map((s, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                          <td style={{ padding: '12px 15px', fontWeight: 500 }}>{s.name}</td>
                          <td style={{ padding: '12px 15px', color: 'var(--on-surface-variant)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Mail size={14} /> {s.email}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p style={{ color: '#888', margin: 0, fontStyle: 'italic', padding: '10px 0' }}>No students registered for this course yet.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
