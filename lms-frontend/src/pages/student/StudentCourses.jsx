import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { courseAPI } from '../../services/api';
import { BookOpen, Users, Plus, Search, ArrowRight } from 'lucide-react';

export default function StudentCourses() {
  const navigate = useNavigate();
  const [allCourses, setAllCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('enrolled');
  const [enrolling, setEnrolling] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { loadCourses(); }, []);

  const loadCourses = async () => {
    try {
      const [allRes, enrolledRes] = await Promise.all([
        courseAPI.getAll(),
        courseAPI.getEnrolled(),
      ]);
      setAllCourses(allRes.data || []);
      setEnrolledCourses(enrolledRes.data || []);
    } catch (err) {
      console.error('Failed to load courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    setEnrolling(courseId);
    try {
      await courseAPI.enroll(courseId);
      await loadCourses();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to enroll.');
    } finally {
      setEnrolling(null);
    }
  };

  const enrolledIds = new Set(enrolledCourses.map(c => c.id));
  let availableCourses = allCourses.filter(c => !enrolledIds.has(c.id));
  
  // Apply filtering
  const lowerQuery = searchQuery.toLowerCase();
  const filterFn = c => c.title?.toLowerCase().includes(lowerQuery) || c.description?.toLowerCase().includes(lowerQuery) || c.instructor?.toLowerCase().includes(lowerQuery);
  const displayedEnrolledCourses = enrolledCourses.filter(filterFn);
  const displayedAvailableCourses = availableCourses.filter(filterFn);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: 64, color: 'var(--on-surface-variant)' }}>Loading courses...</div>;
  }

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 15 }}>
        <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Courses</h2>
        
        <div style={{ position: 'relative', width: '100%', maxWidth: 300 }}>
          <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
          <input 
            type="text" 
            placeholder={`Search ${tab === 'enrolled' ? 'my' : 'available'} courses...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%', padding: '10px 12px 10px 38px', borderRadius: 20,
              border: '1px solid rgba(255,255,255,0.1)', background: 'var(--surface-container)',
              color: '#fff', fontSize: '0.9rem'
            }}
          />
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
        {['enrolled', 'browse'].map(t => (
          <button key={t} onClick={() => { setTab(t); setSearchQuery(''); }} style={{
            padding: '10px 24px', borderRadius: 12, border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-body)', fontSize: '0.9rem', fontWeight: 600,
            background: tab === t ? 'rgba(96, 99, 238, 0.15)' : 'var(--surface-container)',
            color: tab === t ? 'var(--primary)' : 'var(--on-surface-variant)',
            transition: 'all 0.25s',
          }}>
            {t === 'enrolled' ? `My Courses (${enrolledCourses.length})` : `Browse All (${availableCourses.length})`}
          </button>
        ))}
      </div>

      {/* Course List */}
      {tab === 'enrolled' ? (
        displayedEnrolledCourses.length === 0 ? (
          <div className="empty-state">
            <BookOpen size={48} />
            <p>{searchQuery ? 'No courses matched your search.' : "You haven't enrolled in any courses yet."}</p>
            {!searchQuery && (
              <button className="btn-primary" onClick={() => setTab('browse')} style={{ marginTop: 16 }}>
                <Search size={18} style={{ marginRight: 8, display: 'inline' }} /> Browse Courses
              </button>
            )}
          </div>
        ) : (
          <div className="courses-grid">
            {displayedEnrolledCourses.map(course => (
              <div key={course.id} className="course-card">
                <div className="course-title">{course.title}</div>
                <div className="course-instructor">By {course.instructor || 'Instructor'}</div>
                {course.description && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)', margin: '8px 0', lineHeight: 1.5 }}>
                    {course.description?.slice(0, 100)}{course.description?.length > 100 ? '...' : ''}
                  </p>
                )}
                <div style={{ marginTop: 12 }}>
                  <div className="progress-bar-track">
                    <div className="progress-bar-fill" style={{ width: '0%' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="progress-text">Getting started</div>
                    <button 
                      className="btn-secondary" 
                      style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                      onClick={() => navigate(`/student/course/${course.id}`)}
                    >
                      View Course <ArrowRight size={12} style={{ display: 'inline', marginLeft: 4 }} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        displayedAvailableCourses.length === 0 ? (
          <div className="empty-state">
            <BookOpen size={48} />
            <p>{searchQuery ? 'No courses matched your search.' : 'No new courses available right now.'}</p>
          </div>
        ) : (
          <div className="courses-grid">
            {displayedAvailableCourses.map(course => (
              <div key={course.id} className="course-card">
                <div className="course-title">{course.title}</div>
                <div className="course-instructor">By {course.instructor || 'Instructor'} • {course.enrolledCount || 0} students</div>
                {course.description && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)', margin: '8px 0 16px', lineHeight: 1.5 }}>
                    {course.description?.slice(0, 120)}{course.description?.length > 120 ? '...' : ''}
                  </p>
                )}
                <button
                  className="btn-primary"
                  disabled={enrolling === course.id}
                  onClick={() => handleEnroll(course.id)}
                  style={{ width: '100%', padding: '10px', fontSize: '0.88rem' }}
                >
                  {enrolling === course.id ? 'Enrolling...' : 'Enroll Now'}
                </button>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
