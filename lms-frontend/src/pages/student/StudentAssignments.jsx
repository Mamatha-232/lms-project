import { useState, useEffect } from 'react';
import { assignmentAPI, courseAPI } from '../../services/api';
import { ClipboardList, Clock, CheckCircle, AlertCircle, FileText, Upload, X, Download, MessageSquare } from 'lucide-react';

export default function StudentAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [file, setFile] = useState(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { loadAssignments(); }, []);

  const loadAssignments = async () => {
    try {
      const coursesRes = await courseAPI.getEnrolled();
      const courses = coursesRes.data || [];
      
      const assignmentsPromises = courses.map(async c => {
        try {
          const aRes = await assignmentAPI.getByCourse(c.id);
          return (aRes.data || []).map(a => ({ ...a, courseName: c.title, courseId: c.id }));
        } catch (e) {
          return [];
        }
      });
      const nestedAssignments = await Promise.all(assignmentsPromises);
      const allCourseAssignments = nestedAssignments.flat();
      
      const subRes = await assignmentAPI.getStudentAssignments();
      const submissions = subRes.data || [];
      
      const merged = allCourseAssignments.map(a => {
        const mySub = submissions.find(s => s.assignmentId === a.id);
        if (mySub) {
           return { 
             ...a, 
             submissionId: mySub.id, 
             status: mySub.status, 
             grade: mySub.grade, 
             feedback: mySub.feedback, 
             submittedAt: mySub.submittedAt, 
             submissionFileUrl: mySub.submissionFileUrl,
             questionPaperUrl: mySub.questionPaperUrl || a.questionPaperUrl,
             textContent: mySub.textContent 
           };
        }
        return { ...a, status: 'unsubmitted' };
      });

      setAssignments(merged);
    } catch (err) {
      console.error('Failed to load assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  const openSubmitModal = (task) => {
    setSelectedTask(task);
    setFile(null);
    setComment(task.textContent || '');
    setShowModal(true);
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // REQUIRE exactly one file for first submission or update
    if (!file && selectedTask.status === 'unsubmitted') {
      alert("Please select exactly one document to upload.");
      return;
    }
    
    setSubmitting(true);
    try {
      const formData = new FormData();
      if (file) formData.append('file', file);
      formData.append('textContent', comment || 'Submitted via Student Dashboard');
      
      await assignmentAPI.submit(selectedTask.id, formData);
      setShowModal(false);
      loadAssignments();
    } catch (err) {
      alert("Submission failed: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner" />
        <span>Syncing academic records...</span>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--on-surface)', marginBottom: 28 }}>
        My Academic Work
      </h2>

      {/* Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 32 }}>
        {[
          { icon: <ClipboardList size={22} />, label: 'Ongoing Tasks', value: assignments.filter(a => a.status === 'unsubmitted').length, color: 'var(--primary)', bg: 'rgba(96, 99, 238, 0.1)' },
          { icon: <Clock size={22} />, label: 'Awaiting Grade', value: assignments.filter(a => a.status === 'submitted').length, color: '#ffb74d', bg: 'rgba(255, 183, 77, 0.1)' },
          { icon: <CheckCircle size={22} />, label: 'Completed', value: assignments.filter(a => a.status === 'graded').length, color: '#48c78e', bg: 'rgba(72, 199, 142, 0.1)' },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ padding: 24, borderRadius: 20, background: 'var(--surface-container-high)', border: '1px solid rgba(74, 66, 107, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--on-surface)' }}>{s.value}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)', fontWeight: 500 }}>{s.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {assignments.length === 0 ? (
        <div className="empty-state" style={{ padding: 64, background: 'var(--surface-container-high)', borderRadius: 24 }}>
          <ClipboardList size={56} style={{ color: 'var(--on-surface-variant)', marginBottom: 16 }} />
          <h3>No Assignments Postings</h3>
          <p>Assignments will appear here once your teachers post them in your enrolled courses.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {assignments.map(a => (
            <div key={a.id} style={{
              background: 'var(--surface-container-high)', borderRadius: 20,
              padding: 24, border: '1px solid rgba(74, 66, 107, 0.12)',
              position: 'relative', overflow: 'hidden'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                <div style={{ flex: 1, minWidth: 280 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span className={`status-badge ${a.status.toLowerCase()}`} style={{ fontSize: '0.7rem' }}>{a.status.toUpperCase()}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>{a.courseName}</span>
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 10px 0' }}>{a.title}</h3>
                  <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: 16, maxWidth: 600 }}>
                    {a.description || 'No description provided.'}
                  </p>
                  
                  <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>
                      <Clock size={16} /> 
                      Due: {a.dueDate ? new Date(a.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No Deadline'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', fontWeight: 600, color: 'var(--on-surface)' }}>
                      Marks: {a.grade != null ? <span><strong style={{color: '#48c78e', fontSize: '1.2rem'}}>{a.grade}</strong> / {a.maxMarks || 100}</span> : `${a.maxMarks || 100}`}
                    </div>
                    {a.questionPaperUrl && (
                      <a href={a.questionPaperUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--tertiary)', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none', background: 'rgba(239, 129, 196, 0.1)', padding: '6px 12px', borderRadius: 8 }}>
                        <FileText size={16} /> View Question Paper
                      </a>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-end', minWidth: 160 }}>
                  {a.status === 'unsubmitted' ? (
                    <button className="btn-primary" onClick={() => openSubmitModal(a)} style={{ padding: '12px 20px', width: '100%', borderRadius: 12 }}>
                      <Upload size={18} /> Upload Work
                    </button>
                  ) : (
                    <>
                      <button className="btn-secondary" onClick={() => openSubmitModal(a)} style={{ padding: '10px 16px', width: '100%', borderRadius: 12, fontSize: '0.85rem' }}>
                        {a.status === 'graded' ? 'View Details' : 'Update Submission'}
                      </button>
                      {a.submissionFileUrl && (
                        <a href={a.submissionFileUrl} target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: '10px 16px', width: '100%', borderRadius: 12, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'rgba(255,255,255,0.05)' }}>
                          <Download size={16} /> Download My Work
                        </a>
                      )}
                    </>
                  )}
                </div>
              </div>

              {a.feedback && (
                <div style={{ 
                  marginTop: 20, padding: '16px 20px', borderRadius: 12, 
                  background: 'rgba(96, 99, 238, 0.05)', borderLeft: '3px solid var(--primary)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <MessageSquare size={14} /> Teacher Feedback
                  </div>
                  <p style={{ margin: 0, fontSize: '0.9rem', fontStyle: 'italic', color: 'var(--on-surface-variant)' }}>
                    "{a.feedback}"
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Submit Modal */}
      {showModal && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="modal-content animate-scale-up" style={{
            background: 'var(--surface-container-high)', padding: 32,
            borderRadius: 24, width: '100%', maxWidth: 500, position: 'relative',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', color: 'var(--on-surface-variant)', cursor: 'pointer' }}>
              <X size={24} />
            </button>
            
            <h3 style={{ fontSize: '1.4rem', marginBottom: 6, color: 'var(--primary)', fontWeight: 800 }}>
              {selectedTask.status === 'unsubmitted' ? 'Submit Assignment' : 'Submission Details'}
            </h3>
            <p style={{ color: 'var(--on-surface-variant)', marginBottom: 24, fontSize: '0.9rem' }}>
              One document required for this submission.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 20 }}>
              {selectedTask.status !== 'graded' && (
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: 10, fontSize: '0.85rem', fontWeight: 600 }}>Attach Completed Document</label>
                  <div style={{ 
                    border: '2px dashed rgba(96, 99, 238, 0.3)', borderRadius: 16, 
                    padding: 32, textAlign: 'center', cursor: 'pointer',
                    background: file ? 'rgba(96, 99, 238, 0.05)' : 'transparent',
                    transition: 'all 0.3s'
                  }} onClick={() => document.getElementById('assignmentFile').click()}>
                    <Upload size={32} style={{ color: 'var(--primary)', marginBottom: 12, opacity: 0.8 }} />
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--on-surface)' }}>
                      {file ? file.name : (selectedTask.submissionFileUrl ? 'Update document' : 'Select a single document')}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginTop: 4 }}>PDF, DOCX, ZIP (Max 50MB)</div>
                    <input id="assignmentFile" type="file" onChange={handleFileChange} style={{ display: 'none' }} required={selectedTask.status === 'unsubmitted'} />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: 10, fontSize: '0.85rem', fontWeight: 600 }}>Work Details / Comments</label>
                <textarea 
                  className="input-field" 
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Explain your work or mention any specific details for the teacher..."
                  disabled={selectedTask.status === 'graded'}
                  style={{ borderRadius: 16, padding: 16, resize: 'none' }}
                />
              </div>

              {selectedTask.status !== 'graded' ? (
                <button type="submit" className="btn-primary" disabled={submitting} style={{ padding: '14px', borderRadius: 14, marginTop: 8 }}>
                  {submitting ? 'Processing Submission...' : (selectedTask.status === 'unsubmitted' ? 'Submit Work' : 'Update Work')}
                </button>
              ) : (
                <div style={{ 
                  padding: '16px', borderRadius: 14, textAlign: 'center',
                  background: 'rgba(72, 199, 142, 0.1)', color: '#48c78e', fontWeight: 700
                }}>
                  <CheckCircle size={20} style={{ verticalAlign: 'middle', marginRight: 8 }} />
                  This assignment has been graded.
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
