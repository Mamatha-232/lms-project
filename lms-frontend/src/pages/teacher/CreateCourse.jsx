import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { courseAPI } from '../../services/api';
import { ArrowLeft, BookOpen, FileText, Image } from 'lucide-react';

export default function CreateCourse() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'active',
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Course title is required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await courseAPI.create(formData);
      navigate('/teacher/courses');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create course.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: 720, margin: '0 auto' }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'none', border: 'none', color: 'var(--on-surface-variant)',
          cursor: 'pointer', fontSize: '0.9rem', marginBottom: 24, padding: 0,
        }}
      >
        <ArrowLeft size={18} /> Back
      </button>

      <div style={{
        background: 'var(--surface-container-high)',
        borderRadius: 20, padding: '40px 36px',
        border: '1px solid rgba(74, 66, 107, 0.12)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: 'rgba(96, 99, 238, 0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--primary)',
          }}>
            <BookOpen size={28} />
          </div>
          <div>
            <h2 style={{
              fontFamily: 'var(--font-headline)', fontSize: '1.5rem',
              fontWeight: 700, margin: 0,
            }}>Create New Course</h2>
            <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.9rem', margin: '4px 0 0' }}>
              Set up a new course for your students
            </p>
          </div>
        </div>

        {error && <div className="auth-error" style={{ marginBottom: 20 }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: 24 }}>
            <label htmlFor="course-title" style={{
              fontFamily: 'var(--font-label)', fontSize: '0.82rem',
              fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em',
              color: 'var(--on-surface-variant)', marginBottom: 8, display: 'block',
            }}>Course Title</label>
            <input
              id="course-title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="e.g. Introduction to Computer Science"
              style={{
                width: '100%', padding: '14px 18px',
                background: 'var(--surface-container)', border: '1px solid rgba(74, 66, 107, 0.2)',
                borderRadius: 12, color: 'var(--on-surface)', fontSize: '0.95rem',
                fontFamily: 'var(--font-body)', outline: 'none', boxSizing: 'border-box',
                transition: 'border-color 0.25s',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(74, 66, 107, 0.2)'}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 24 }}>
            <label htmlFor="course-desc" style={{
              fontFamily: 'var(--font-label)', fontSize: '0.82rem',
              fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em',
              color: 'var(--on-surface-variant)', marginBottom: 8, display: 'block',
            }}>Description</label>
            <textarea
              id="course-desc"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={5}
              placeholder="Describe what students will learn in this course..."
              style={{
                width: '100%', padding: '14px 18px',
                background: 'var(--surface-container)', border: '1px solid rgba(74, 66, 107, 0.2)',
                borderRadius: 12, color: 'var(--on-surface)', fontSize: '0.95rem',
                fontFamily: 'var(--font-body)', outline: 'none', resize: 'vertical',
                boxSizing: 'border-box', transition: 'border-color 0.25s',
                minHeight: 120,
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(74, 66, 107, 0.2)'}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 32 }}>
            <label htmlFor="course-status" style={{
              fontFamily: 'var(--font-label)', fontSize: '0.82rem',
              fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em',
              color: 'var(--on-surface-variant)', marginBottom: 8, display: 'block',
            }}>Status</label>
            <select
              id="course-status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              style={{
                width: '100%', padding: '14px 18px',
                background: 'var(--surface-container)', border: '1px solid rgba(74, 66, 107, 0.2)',
                borderRadius: 12, color: 'var(--on-surface)', fontSize: '0.95rem',
                fontFamily: 'var(--font-body)', outline: 'none', boxSizing: 'border-box',
                cursor: 'pointer', appearance: 'auto',
              }}
            >
              <option value="active">Active</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              width: '100%', padding: '16px', fontSize: '1rem',
              fontWeight: 600, borderRadius: 14,
            }}
          >
            {loading ? 'Creating...' : 'Create Course'}
          </button>
        </form>
      </div>
    </div>
  );
}
