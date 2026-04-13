import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { courseAPI, materialAPI, assignmentAPI, attendanceAPI } from '../../services/api';
import { ArrowLeft, BookOpen, FileText, Upload, Plus, Download, Trash2, CheckCircle, CalendarDays } from 'lucide-react';

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [course, setCourse] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [assignments, setAssignments] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [uploadingMat, setUploadingMat] = useState(false);
  const [uploadingAss, setUploadingAss] = useState(false);
  
  // Modals / forms state
  const [matFile, setMatFile] = useState(null);
  const [matTitle, setMatTitle] = useState('');
  const [showMatForm, setShowMatForm] = useState(false);

  const [assTitle, setAssTitle] = useState('');
  const [assDesc, setAssDesc] = useState('');
  const [assMarks, setAssMarks] = useState(100);
  const [showAssForm, setShowAssForm] = useState(false);

  // Student assignment submission state
  const [submitAssId, setSubmitAssId] = useState(null);
  const [subFile, setSubFile] = useState(null);
  const [subText, setSubText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Teacher grading state
  const [viewingAssId, setViewingAssId] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [grades, setGrades] = useState({}); // Map of submissionId -> grade

  // Attendance state
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState([]); // For teacher
  const [myAttendance, setMyAttendance] = useState([]); // For student
  const [studentStatuses, setStudentStatuses] = useState({}); // studentId -> status
  const [savingAtt, setSavingAtt] = useState(false);
  
  // Student own submissions map
  const [mySubmissionsMap, setMySubmissionsMap] = useState({});

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [courseRes, matRes, assRes] = await Promise.all([
        courseAPI.getById(id),
        materialAPI.getByCourse(id),
        assignmentAPI.getByCourse(id),
      ]);
      setCourse(courseRes.data);
      setMaterials(matRes.data || []);
      setAssignments(assRes.data || []);
      
      // Load attendance specific to role
      const currentUser = JSON.parse(localStorage.getItem('lms_user'));
      if (currentUser?.role === 'TEACHER' || currentUser?.role === 'ADMIN') {
        loadTeacherAttendance(attendanceDate);
      } else {
        const [attRes, subsRes] = await Promise.all([
          attendanceAPI.getMyAttendance(id),
          assignmentAPI.getStudentAssignments()
        ]);
        setMyAttendance(attRes.data || []);
        
        // Map assignments to submissions for this student
        const subMap = {};
        (subsRes.data || []).forEach(sub => {
          // Compare assignment titles (since Assignment ID isn't directly on the student DTO it seems, wait, the backend does return 'assignmentTitle'. But let's just match using assignmentTitle or if we can avoid that, wait: backend returns id: submission.getId(). It doesn't return assignmentId!).
          // Wait, backend mapping in AssignmentController for getStudentAssignments: 
          // map.put("assignmentTitle", s.getAssignment().getTitle());
          // Let's just map by title for now realistically.
          subMap[sub.assignmentTitle] = sub;
        });
        setMySubmissionsMap(subMap);
      }
    } catch (err) {
      console.error('Failed to load course details', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTeacherAttendance = async (dateStr) => {
    try {
      const res = await attendanceAPI.getForDate(id, dateStr);
      setAttendanceRecords(res.data || []);
      const statusMap = {};
      res.data.forEach(r => {
        if (r.status) statusMap[r.studentId] = r.status;
      });
      setStudentStatuses(statusMap);
    } catch (err) {
      console.error('Failed to fetch attendance', err);
    }
  };

  const handleDateChange = (e) => {
    setAttendanceDate(e.target.value);
    loadTeacherAttendance(e.target.value);
  };

  const handleSaveAttendance = async () => {
    setSavingAtt(true);
    try {
      await attendanceAPI.save(id, attendanceDate, studentStatuses);
      alert("Attendance saved!");
      loadTeacherAttendance(attendanceDate);
    } catch (err) {
      alert("Failed to save attendance");
    } finally {
      setSavingAtt(false);
    }
  };

  const handleUploadMaterial = async (e) => {
    e.preventDefault();
    if (!matFile || !matTitle) return alert("Please provide title and file");
    setUploadingMat(true);
    const fd = new FormData();
    fd.append('file', matFile);
    fd.append('title', matTitle);
    try {
      await materialAPI.upload(id, fd);
      setShowMatForm(false);
      setMatFile(null);
      setMatTitle('');
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to upload material");
    } finally {
      setUploadingMat(false);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!assTitle) return alert("Title is required");
    setUploadingAss(true);
    try {
      await assignmentAPI.create(id, {
        title: assTitle,
        description: assDesc,
        maxMarks: assMarks
      });
      setShowAssForm(false);
      setAssTitle('');
      setAssDesc('');
      loadData();
    } catch(err) {
      alert(err.response?.data?.message || "Failed to create assignment");
    } finally {
      setUploadingAss(false);
    }
  };

  const handleDeleteMaterial = async (matId) => {
    if(!window.confirm("Delete this material?")) return;
    try {
      await materialAPI.delete(matId);
      loadData();
    } catch(err) {
      alert("Failed to delete");
    }
  };

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData();
    if (subFile) fd.append('file', subFile);
    if (subText) fd.append('textContent', subText);
    try {
      await assignmentAPI.submit(submitAssId, fd);
      setSubmitAssId(null);
      setSubFile(null);
      setSubText('');
      alert("Submitted successfully!");
      loadData();
    } catch(err) {
      alert(err.response?.data?.message || "Submit failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewSubmissions = async (assId) => {
    if (viewingAssId === assId) {
      setViewingAssId(null);
      return;
    }
    setViewingAssId(assId);
    setLoadingSubs(true);
    try {
      const res = await assignmentAPI.getSubmissions(assId);
      setSubmissions(res.data || []);
      const gradeMap = {};
      res.data.forEach(sub => gradeMap[sub.id] = sub.grade || '');
      setGrades(gradeMap);
    } catch(err) {
      alert("Failed to fetch submissions");
    } finally {
      setLoadingSubs(false);
    }
  };

  const handleGrade = async (subId) => {
    try {
      if (grades[subId] === '' || grades[subId] === undefined) return alert("Enter a grade");
      await assignmentAPI.grade(subId, Number(grades[subId]));
      alert("Graded successfully!");
      // reload submissions
      const res = await assignmentAPI.getSubmissions(viewingAssId);
      setSubmissions(res.data || []);
    } catch(err) {
      alert(err.response?.data?.message || "Failed to submit grade");
    }
  };

  if (loading) return <div style={{padding: 40}}>Loading...</div>;
  if (!course) return <div style={{padding: 40}}>Course not found</div>;

  const isTeacher = user?.role === 'TEACHER' || user?.role === 'ADMIN';

  return (
    <div className="animate-fade-in" style={{ paddingBottom: 40 }}>
      <button onClick={() => navigate(-1)} className="btn-secondary" style={{ marginBottom: 20, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem' }}>
        <ArrowLeft size={16} /> Back
      </button>

      <div style={{ background: 'var(--surface-container-high)', padding: '30px 40px', borderRadius: 16, marginBottom: 30 }}>
        <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: '2rem', margin: '0 0 10px', color: 'var(--primary)' }}>{course.title}</h1>
        <p style={{ color: 'var(--on-surface-variant)' }}>{course.description}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30 }}>
        {/* Materials Section */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <BookOpen size={20} color="var(--tertiary)" /> Course Materials
            </h2>
            {isTeacher && (
              <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => setShowMatForm(!showMatForm)}>
                <Plus size={14} style={{ display: 'inline' }} /> Add Material
              </button>
            )}
          </div>

          {showMatForm && isTeacher && (
            <form onSubmit={handleUploadMaterial} style={{ background: 'var(--surface-container)', padding: 20, borderRadius: 12, marginBottom: 20 }}>
              <input type="text" placeholder="Title (e.g., Chapter 1 Presentation)" value={matTitle} onChange={e => setMatTitle(e.target.value)} style={{ width: '100%', marginBottom: 10, padding: 8, borderRadius: 8, border: '1px solid #444', background: '#222', color: '#fff' }} required />
              <input type="file" onChange={e => setMatFile(e.target.files[0])} accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.zip" style={{ marginBottom: 10, color: '#fff' }} required />
              <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginTop: 0, marginBottom: 15 }}>
                Supports PPT, PDF, DOC, MP4, and ZIP files.
              </p>
              <button type="submit" className="btn-primary" disabled={uploadingMat}>{uploadingMat ? 'Uploading...' : 'Upload Material'}</button>
            </form>
          )}

          {materials.length === 0 ? <p style={{ color: '#888' }}>No materials uploaded yet.</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {materials.map(mat => (
                <div key={mat.id} style={{ background: 'var(--surface-container)', padding: 15, borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: '0 0 5px' }}>{mat.title}</h4>
                    <span style={{ fontSize: '0.8rem', color: '#aaa' }}>{mat.fileType} • {(mat.fileSize/1024).toFixed(1)} KB</span>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <a href={mat.fileUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ padding: '6px 10px' }}><Download size={14} /></a>
                    {isTeacher && <button onClick={() => handleDeleteMaterial(mat.id)} className="btn-secondary" style={{ padding: '6px 10px', color: 'var(--error)' }}><Trash2 size={14} /></button>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Assignments Section */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileText size={20} color="#ffb74d" /> Assignments
            </h2>
            {isTeacher && (
              <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => setShowAssForm(!showAssForm)}>
                <Plus size={14} style={{ display: 'inline' }} /> Create Assignment
              </button>
            )}
          </div>

          {showAssForm && isTeacher && (
            <form onSubmit={handleCreateAssignment} style={{ background: 'var(--surface-container)', padding: 20, borderRadius: 12, marginBottom: 20 }}>
              <input type="text" placeholder="Title" value={assTitle} onChange={e => setAssTitle(e.target.value)} style={{ width: '100%', marginBottom: 10, padding: 8, borderRadius: 8, border: '1px solid #444', background: '#222', color: '#fff' }} required />
              <textarea placeholder="Description" value={assDesc} onChange={e => setAssDesc(e.target.value)} style={{ width: '100%', marginBottom: 10, padding: 8, borderRadius: 8, border: '1px solid #444', background: '#222', color: '#fff' }} rows={3} />
              <input type="number" placeholder="Max Marks" value={assMarks} onChange={e => setAssMarks(e.target.value)} style={{ width: '100%', marginBottom: 10, padding: 8, borderRadius: 8, border: '1px solid #444', background: '#222', color: '#fff' }} required />
              <button type="submit" className="btn-primary" disabled={uploadingAss}>{uploadingAss ? 'Creating...' : 'Create'}</button>
            </form>
          )}

          {assignments.length === 0 ? <p style={{ color: '#888' }}>No assignments yet.</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {assignments.map(ass => (
                <div key={ass.id} style={{ background: 'var(--surface-container)', padding: 15, borderRadius: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <h4 style={{ margin: 0 }}>{ass.title}</h4>
                    <span className="status-badge pending">{ass.maxMarks} Marks</span>
                  </div>
                  <p style={{ margin: '0 0 10px', fontSize: '0.9rem', color: '#ddd' }}>{ass.description}</p>
                  
                  {isTeacher ? (
                    <div>
                      <button 
                        onClick={() => handleViewSubmissions(ass.id)} 
                        className="btn-secondary" 
                        style={{ padding: '4px 10px', fontSize: '0.8rem' }}>
                        {viewingAssId === ass.id ? 'Hide Submissions' : `View ${ass.submissionCount} Submissions`}
                      </button>
                      
                      {viewingAssId === ass.id && (
                        <div style={{ marginTop: 15, padding: 15, background: 'rgba(0,0,0,0.2)', borderRadius: 8 }}>
                          {loadingSubs ? <p style={{fontSize: '0.8rem'}}>Loading...</p> : (
                            submissions.length === 0 ? <p style={{fontSize: '0.8rem', margin: 0}}>No submissions yet.</p> : (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {submissions.map(sub => (
                                  <div key={sub.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: '#222', padding: 10, borderRadius: 6 }}>
                                    <div style={{ flex: 1 }}>
                                      <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 4 }}>
                                        {sub.studentName} <span style={{fontWeight: 400, color: '#aaa', fontSize: '0.8rem'}}>({sub.studentEmail})</span>
                                      </div>
                                      <div style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: 8 }}>Submitted: {new Date(sub.submittedAt).toLocaleDateString()}</div>
                                      
                                      {sub.textContent && <p style={{ fontSize: '0.85rem', color: '#ddd', margin: '0 0 8px', fontStyle: 'italic' }}>"{sub.textContent}"</p>}
                                      {sub.fileUrl && <a href={sub.fileUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: 4 }}><Download size={12}/> Download Work</a>}
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', justifyContent: 'flex-end', marginLeft: 10 }}>
                                      <input 
                                        type="number" 
                                        placeholder="Marks" 
                                        value={grades[sub.id]} 
                                        onChange={e => setGrades({...grades, [sub.id]: e.target.value})} 
                                        style={{ width: 60, padding: 4, borderRadius: 4, border: '1px solid #444', background: '#333', color: '#fff', fontSize: '0.8rem' }}
                                      />
                                      <span style={{ fontSize: '0.8rem', color: '#888' }}>/ {ass.maxMarks}</span>
                                      <button onClick={() => handleGrade(sub.id)} className="btn-primary" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>Grade</button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      {mySubmissionsMap[ass.title] ? (
                        <div style={{ padding: 12, background: 'rgba(76, 175, 80, 0.1)', border: '1px solid #48c78e', borderRadius: 8 }}>
                          <div style={{ color: '#48c78e', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                            <CheckCircle size={16} /> Submitted
                          </div>
                          <div style={{ fontSize: '0.9rem' }}>
                            Grade: <strong style={{ color: '#fff' }}>{mySubmissionsMap[ass.title].grade !== null ? `${mySubmissionsMap[ass.title].grade} / ${ass.maxMarks}` : 'Pending review'}</strong>
                          </div>
                        </div>
                      ) : submitAssId === ass.id ? (
                        <form onSubmit={handleSubmitAssignment} style={{ marginTop: 10, padding: 10, background: 'rgba(0,0,0,0.2)', borderRadius: 8 }}>
                          <textarea placeholder="Write text submission..." value={subText} onChange={e=>setSubText(e.target.value)} style={{ width: '100%', marginBottom: 10, padding: 8, borderRadius: 4, background:'#222', color:'#fff', border:'none' }} rows={3} />
                          <input type="file" onChange={e=>setSubFile(e.target.files[0])} style={{ marginBottom: 10 }} />
                          <div style={{ display: 'flex', gap: 10 }}>
                            <button type="submit" className="btn-primary" style={{ padding: '4px 10px', fontSize: '0.8rem' }} disabled={submitting}>{submitting ? 'Submitting...' : 'Submit'}</button>
                            <button type="button" onClick={() => setSubmitAssId(null)} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.8rem' }}>Cancel</button>
                          </div>
                        </form>
                      ) : (
                        <button onClick={() => setSubmitAssId(ass.id)} className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Upload size={14} /> Submit Work
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Attendance Section (Full Width, below materials/assignments) */}
      <div style={{ marginTop: 40 }}>
        <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <CalendarDays size={20} color="#4fc3f7" /> Attendance
        </h2>
        
        {isTeacher ? (
          <div style={{ background: 'var(--surface-container)', padding: 25, borderRadius: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 15, marginBottom: 20 }}>
              <label>Select Date:</label>
              <input type="date" value={attendanceDate} onChange={handleDateChange} style={{ padding: 8, borderRadius: 6, border: '1px solid #444', background: '#222', color: '#fff' }} />
            </div>
            
            {attendanceRecords.length === 0 ? (
              <p style={{ color: '#888' }}>No students enrolled to mark attendance.</p>
            ) : (
              <div>
                <table className="data-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', marginBottom: 20 }}>
                  <thead>
                    <tr style={{ background: 'rgba(0,0,0,0.2)' }}>
                      <th style={{ padding: 12 }}>Student Name</th>
                      <th style={{ padding: 12 }}>Email</th>
                      <th style={{ padding: 12 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceRecords.map(rec => (
                      <tr key={rec.studentId} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: 12 }}>{rec.studentName}</td>
                        <td style={{ padding: 12, fontSize: '0.85rem', color: '#aaa' }}>{rec.studentEmail}</td>
                        <td style={{ padding: 12 }}>
                          <select 
                            value={studentStatuses[rec.studentId] || ''} 
                            onChange={e => setStudentStatuses({...studentStatuses, [rec.studentId]: e.target.value})}
                            style={{ padding: 6, borderRadius: 4, background: '#333', color: '#fff', border: '1px solid #555' }}
                          >
                            <option value="">-- Select --</option>
                            <option value="PRESENT">Present</option>
                            <option value="ABSENT">Absent</option>
                            <option value="LATE">Late</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button onClick={handleSaveAttendance} disabled={savingAtt} className="btn-primary">
                  {savingAtt ? 'Saving...' : 'Save Attendance'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ background: 'var(--surface-container)', padding: 25, borderRadius: 12 }}>
            <p>Your Attendance Record for this Course:</p>
            {myAttendance.length === 0 ? <p style={{ color: '#888' }}>No attendance recorded yet.</p> : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 10 }}>
                {myAttendance.map((att, i) => (
                  <div key={i} style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.3)', borderRadius: 6, border: '1px solid #333' }}>
                    <div style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: 4 }}>{att.date}</div>
                    <div className={`status-badge ${att.status.toLowerCase()}`}>{att.status}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Registered Students List (Optional, Teacher view) */}
      {isTeacher && (
        <div style={{ marginTop: 40, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.2rem', marginBottom: 20 }}>
            Registered Students ({course.enrolledCount})
          </h2>
          {course.enrolledStudents && course.enrolledStudents.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 15 }}>
              {course.enrolledStudents.map((s, idx) => (
                <div key={idx} style={{ background: 'var(--surface-container)', padding: 15, borderRadius: 8, border: '1px solid #333' }}>
                  <div style={{ fontWeight: 600, color: '#fff' }}>{s.name}</div>
                  <div style={{ fontSize: '0.85rem', color: '#aaa', marginTop: 4 }}>{s.email}</div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#888' }}>No students registered yet.</p>
          )}
        </div>
      )}
      
    </div>
  );
}
