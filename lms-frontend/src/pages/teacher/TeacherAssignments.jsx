import { useState, useEffect } from 'react';
import { assignmentAPI, courseAPI } from '../../services/api';
import { ClipboardList, FileText, Download, CheckCircle, Clock, X, Award, Filter, Plus, BookOpen, Calendar } from 'lucide-react';

export default function TeacherAssignments() {
  const [submissions, setSubmissions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Grading State
  const [gradingId, setGradingId] = useState(null);
  const [gradeInput, setGradeInput] = useState('');
  const [feedbackInput, setFeedbackInput] = useState('');
  const [saving, setSaving] = useState(false);
  
  // Filter State
  const [filterStatus, setFilterStatus] = useState('all');
  const [toast, setToast] = useState(null);

  // Assignment Creation State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAss, setNewAss] = useState({
    courseId: '',
    title: '',
    description: '',
    maxMarks: 100,
    dueDate: '',
    file: null
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = async () => {
    try {
      const [subRes, courseRes] = await Promise.all([
        assignmentAPI.getTeacherSubmissions(),
        courseAPI.getByTeacher()
      ]);
      
      const sorted = (subRes.data || []).sort((a, b) => {
        if (a.status === 'submitted' && b.status !== 'submitted') return -1;
        if (a.status !== 'submitted' && b.status === 'submitted') return 1;
        return new Date(b.submittedAt) - new Date(a.submittedAt);
      });
      
      setSubmissions(sorted);
      setCourses(courseRes.data || []);
    } catch (err) {
      console.error('Failed to load teacher data:', err);
      showToast('Error syncing data from server', 'error');
    } finally {
      setLoading(false);
    }
  };

  const startGrading = (sub) => {
    setGradingId(sub.id);
    setGradeInput(sub.grade != null ? String(sub.grade) : '');
    setFeedbackInput(sub.feedback || '');
  };

  const cancelGrading = () => {
    setGradingId(null);
    setGradeInput('');
    setFeedbackInput('');
  };

  const handleGrade = async (subId) => {
    if (gradeInput === '' || gradeInput === undefined) {
      showToast('Please enter a grade.', 'error');
      return;
    }
    setSaving(true);
    try {
      await assignmentAPI.grade(subId, Number(gradeInput));
      setGradingId(null);
      showToast('Grade saved successfully!');
      loadData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save grade.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!newAss.courseId || !newAss.title) {
      showToast('Please fill required fields (Course & Title)', 'error');
      return;
    }
    setCreating(true);
    try {
      const formData = new FormData();
      formData.append('title', newAss.title);
      formData.append('description', newAss.description);
      formData.append('maxMarks', String(newAss.maxMarks));
      if (newAss.dueDate) formData.append('dueDate', newAss.dueDate + "T23:59:59");
      if (newAss.file) formData.append('file', newAss.file);

      await assignmentAPI.create(newAss.courseId, formData);
      showToast('Assignment posted successfully!');
      setShowCreateModal(false);
      setNewAss({ courseId: '', title: '', description: '', maxMarks: 100, dueDate: '', file: null });
      loadData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to post assignment', 'error');
    } finally {
      setCreating(false);
    }
  };

  const filtered = submissions.filter(s => {
    if (filterStatus === 'all') return true;
    return s.status === filterStatus;
  });

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner" />
        <span>Loading assignments...</span>
      </div>
    );
  }

  const pendingCount = submissions.filter(s => s.status === 'submitted').length;
  const gradedCount = submissions.filter(s => s.status === 'graded').length;

  return (
    <div className="animate-fade-in">
      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <X size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Header Area */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20, marginBottom: 20 }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--on-surface)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <ClipboardList size={28} color="var(--primary)" /> Academic Management
            </h2>
            <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.95rem', marginTop: 4 }}>
              Grade student work or create new assignments for your courses.
            </p>
          </div>
          <button className="btn-primary" onClick={() => setShowCreateModal(true)} style={{ padding: '12px 24px', borderRadius: 14, boxShadow: '0 8px 16px -4px rgba(96, 99, 238, 0.3)' }}>
            <Plus size={20} /> Post Assignment
          </button>
        </div>

        {/* Stats & Filters */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-container-high)', padding: '12px 20px', borderRadius: 16, border: '1px solid rgba(74, 66, 107, 0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
             <div style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>
                <strong style={{ color: '#ffb74d' }}>{pendingCount}</strong> Pending
             </div>
             <div style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>
                <strong style={{ color: '#48c78e' }}>{gradedCount}</strong> Graded
             </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {['all', 'submitted', 'graded'].map(f => (
              <button key={f} onClick={() => setFilterStatus(f)} style={{
                padding: '6px 14px', borderRadius: 12, border: 'none', cursor: 'pointer',
                fontSize: '0.75rem', fontWeight: 700, transition: 'all 0.2s',
                background: filterStatus === f ? 'var(--primary)' : 'transparent',
                color: filterStatus === f ? '#fff' : 'var(--on-surface-variant)',
              }}>
                {f.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state" style={{ padding: 64, background: 'var(--surface-container-high)', borderRadius: 24, textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(96, 99, 238, 0.05)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--on-surface-variant)', marginBottom: 16 }}>
            <FileText size={32} />
          </div>
          <h3>No Submissions Found</h3>
          <p>When students upload their work for your assignments, they will appear here for grading.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {filtered.map((sub, idx) => (
            <div key={sub.id || idx} style={{
              background: 'var(--surface-container-high)', borderRadius: 20,
              padding: 24, border: '1px solid rgba(74, 66, 107, 0.1)',
              position: 'relative', overflow: 'hidden'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
                {/* Left: Student & Assignment Info */}
                <div style={{ flex: 1, minWidth: 280 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg, var(--primary), var(--primary-dim))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800 }}>
                      {sub.studentName?.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--on-surface)' }}>{sub.studentName}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>{sub.studentEmail}</div>
                    </div>
                    <span className={`status-badge ${sub.status}`} style={{ marginLeft: 'auto', fontSize: '0.7rem' }}>{sub.status.toUpperCase()}</span>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>{sub.courseName}</div>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>{sub.assignmentTitle}</h4>
                  </div>

                  {sub.textContent && (
                    <div style={{ padding: 14, background: 'rgba(255,255,255,0.03)', borderRadius: 12, marginBottom: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                      <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--on-surface-variant)', fontStyle: 'italic', lineHeight: 1.5 }}>
                        "{sub.textContent}"
                      </p>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 24, fontSize: '0.8rem', color: 'var(--on-surface-variant)', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Calendar size={14} /> Submitted: {new Date(sub.submittedAt).toLocaleDateString()}
                    </div>
                    {sub.submissionFileUrl ? (
                      <a
                        href={sub.submissionFileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          color: 'var(--tertiary)', background: 'rgba(239, 129, 196, 0.1)',
                          padding: '6px 14px', borderRadius: 8, textDecoration: 'none',
                          fontSize: '0.82rem', fontWeight: 700, transition: 'all 0.2s',
                        }}
                      >
                        <Download size={14} /> View Submission
                      </a>
                    ) : (
                      <span style={{ color: 'var(--on-surface-variant)', fontStyle: 'italic' }}>No file attached</span>
                    )}
                  </div>
                </div>

                {/* Right: Grading Panel */}
                <div style={{ 
                  minWidth: 240, background: 'rgba(96, 99, 238, 0.04)', 
                  padding: 20, borderRadius: 16, border: '1px solid rgba(96, 99, 238, 0.1)',
                  display: 'flex', flexDirection: 'column', gap: 12
                }}>
                  {gradingId === sub.id ? (
                    <>
                      <div style={{ display: 'grid', gap: 10 }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)' }}>ASSIGN GRADE</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <input 
                            type="number" 
                            className="input-field"
                            value={gradeInput}
                            onChange={e => setGradeInput(e.target.value)}
                            style={{ padding: '10px', width: 80, textAlign: 'center', fontSize: '1rem', fontWeight: 700 }}
                          />
                          <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--on-surface-variant)' }}>/ {sub.maxMarks || 100}</span>
                        </div>
                      </div>
                      <textarea 
                        className="input-field"
                        placeholder="Add feedback for student..."
                        value={feedbackInput}
                        onChange={e => setFeedbackInput(e.target.value)}
                        rows={3}
                        style={{ fontSize: '0.85rem' }}
                      />
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn-primary" onClick={() => handleGrade(sub.id)} disabled={saving} style={{ flex: 1, padding: '10px' }}>
                          {saving ? 'Saving...' : 'Save'}
                        </button>
                        <button className="btn-secondary" onClick={cancelGrading} style={{ padding: '10px' }}>
                          <X size={18} />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div style={{ textAlign: 'center' }}>
                      {sub.status === 'graded' ? (
                        <>
                          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#48c78e', marginBottom: 8, textTransform: 'uppercase' }}>Current Grade</div>
                          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--on-surface)' }}>{sub.grade}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)', marginBottom: 16 }}>Out of {sub.maxMarks || 100}</div>
                          <button className="btn-secondary" onClick={() => startGrading(sub)} style={{ width: '100%', padding: '10px', borderRadius: 10 }}>
                            Edit Score
                          </button>
                        </>
                      ) : (
                        <>
                          <Award size={32} style={{ color: 'var(--primary)', marginBottom: 12, opacity: 0.5 }} />
                          <div style={{ fontSize: '0.9rem', color: 'var(--on-surface-variant)', marginBottom: 16 }}>This submission is ready for evaluation.</div>
                          <button className="btn-primary" onClick={() => startGrading(sub)} style={{ width: '100%', padding: '12px', borderRadius: 10 }}>
                            Assign Grade
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Assignment Modal */}
      {showCreateModal && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="modal-content animate-scale-up" style={{
            background: 'var(--surface-container-high)', padding: 32,
            borderRadius: 24, width: '100%', maxWidth: 550, position: 'relative',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            <button onClick={() => setShowCreateModal(false)} style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', color: 'var(--on-surface-variant)', cursor: 'pointer' }}>
              <X size={24} />
            </button>
            
            <h3 style={{ fontSize: '1.5rem', marginBottom: 6, color: 'var(--primary)', fontWeight: 800 }}>
              Create New Assignment
            </h3>
            <p style={{ color: 'var(--on-surface-variant)', marginBottom: 28, fontSize: '0.9rem' }}>
              Post a new task for students across your enrolled courses.
            </p>

            <form onSubmit={handleCreateAssignment} style={{ display: 'grid', gap: 20 }}>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', fontWeight: 700 }}>Select Course</label>
                <div style={{ position: 'relative' }}>
                  <BookOpen size={18} style={{ position: 'absolute', left: 14, top: 12, color: 'var(--primary)' }} />
                  <select 
                    className="input-field"
                    value={newAss.courseId}
                    onChange={e => setNewAss({...newAss, courseId: e.target.value})}
                    style={{ paddingLeft: 44 }}
                    required
                  >
                    <option value="">-- Choose a course --</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', fontWeight: 700 }}>Assignment Title</label>
                <input 
                  type="text" 
                  className="input-field"
                  placeholder="e.g., Mid-Term Research Paper"
                  value={newAss.title}
                  onChange={e => setNewAss({...newAss, title: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', fontWeight: 700 }}>Instructions / Description</label>
                <textarea 
                  className="input-field" 
                  rows={4}
                  value={newAss.description}
                  onChange={e => setNewAss({...newAss, description: e.target.value})}
                  placeholder="Provide detailed instructions for the students..."
                  style={{ resize: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', fontWeight: 700 }}>Max Marks</label>
                  <input 
                    type="number" 
                    className="input-field"
                    value={newAss.maxMarks}
                    onChange={e => setNewAss({...newAss, maxMarks: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', fontWeight: 700 }}>Due Date</label>
                  <input 
                    type="date" 
                    className="input-field"
                    value={newAss.dueDate}
                    onChange={e => setNewAss({...newAss, dueDate: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', fontWeight: 700 }}>Question Paper / Material (Optional)</label>
                <div style={{
                  border: '1px dashed var(--primary)', borderRadius: 12, padding: 12, textAlign: 'center', cursor: 'pointer',
                  background: newAss.file ? 'rgba(96, 99, 238, 0.05)' : 'transparent'
                }} onClick={() => document.getElementById('ass-file-input').click()}>
                  <Upload size={20} style={{ color: 'var(--primary)', marginBottom: 4 }} />
                  <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>{newAss.file ? newAss.file.name : 'Select PDF/DOCX for students'}</div>
                  <input 
                    id="ass-file-input" 
                    type="file" 
                    onChange={e => setNewAss({...newAss, file: e.target.files[0]})} 
                    style={{ display: 'none' }}
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary" disabled={creating} style={{ padding: '14px', borderRadius: 14, marginTop: 10, fontSize: '1rem' }}>
                {creating ? 'Posting Assignment...' : 'Launch Assignment'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
