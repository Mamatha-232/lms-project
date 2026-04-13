import { useState, useEffect } from 'react';
import { assignmentAPI } from '../../services/api';
import {
  GraduationCap, Award, BookOpen, MessageSquare, CheckCircle,
  TrendingUp, Calendar, AlertCircle, AlertTriangle,
  TrendingDown, Target, ListChecks, PieChart
} from 'lucide-react';

export default function StudentGrades() {
  const [grades, setGrades] = useState([]);
  const [allAssignments, setAllAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [gradedRes, allRes] = await Promise.all([
        assignmentAPI.getGradedAssignments(),
        assignmentAPI.getStudentAssignments()
      ]);

      const gradedItems = (gradedRes.data || [])
        .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

      setGrades(gradedItems);
      setAllAssignments(allRes.data || []);
    } catch (err) {
      console.error('Failed to load grades:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner" />
        <span>Generating Academic Report...</span>
      </div>
    );
  }

  // Logic Calculations
  const gradedCount = grades.length;
  const totalPoints = grades.reduce((acc, g) => acc + (g.grade || 0), 0);
  const maxPoints = grades.reduce((acc, g) => acc + (g.maxMarks || 100), 0);
  const percentage = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;

  // Progress & Status
  const gpa = (percentage / 25).toFixed(1); // Rough 4.0 scale
  const uniqueSubjects = [...new Set(allAssignments.map(a => a.courseName))].length;
  const missingAssignments = allAssignments.filter(a => a.status === 'not_submitted').length;

  // At-Risk Analysis
  const atRiskCourses = [...new Set(
    grades.filter(g => (g.grade / (g.maxMarks || 100)) < 0.4).map(g => g.courseName)
  )];

  return (
    <div className="animate-fade-in" style={{ paddingBottom: 60 }}>
      {/* 1. TOP HEADER & SUMMARY */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 20 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '2rem', fontWeight: 900, color: 'var(--on-surface)', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ padding: 10, background: 'rgba(96, 99, 238, 0.1)', borderRadius: 16 }}>
              <GraduationCap size={32} color="var(--primary)" />
            </div>
            Academic Insight
          </h2>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '1rem', marginTop: 6, maxWidth: 450 }}>
            Analyze your performance across {uniqueSubjects} subjects this semester.
          </p>
        </div>

        {/* GPA / PERCENTAGE CARD */}
        <div style={{
          background: 'var(--surface-container-high)',
          padding: '24px 40px', borderRadius: 32,
          border: '1px solid rgba(255,255,255,0.05)',
          boxShadow: '0 20px 40px -10px rgba(0,0,0,0.3)',
          display: 'flex', alignItems: 'center', gap: 32
        }}>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.1em', marginBottom: 6 }}>Current GPA</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--on-surface)', lineHeight: 1 }}>{gpa}</div>
          </div>
          <div style={{ width: 1, height: 50, background: 'rgba(255,255,255,0.1)' }} />
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: '#48c78e', letterSpacing: '0.1em', marginBottom: 6 }}>Overall</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#48c78e', lineHeight: 1 }}>{percentage}%</div>
          </div>
        </div>
      </div>

      {/* 2. ANALYTICS GRID (NEW) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 40 }}>
        <div style={{ background: 'rgba(96, 99, 238, 0.05)', padding: 24, borderRadius: 24, border: '1px solid rgba(96, 99, 238, 0.1)' }}>
          <div style={{ color: 'var(--primary)', marginBottom: 12 }}><Target size={24} /></div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{totalPoints} / {maxPoints}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)', fontWeight: 600 }}>Total Marks Scored</div>
        </div>
        <div style={{ background: 'rgba(72, 199, 142, 0.05)', padding: 24, borderRadius: 24, border: '1px solid rgba(72, 199, 142, 0.1)' }}>
          <div style={{ color: '#48c78e', marginBottom: 12 }}><ListChecks size={24} /></div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{gradedCount}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)', fontWeight: 600 }}>Graded Assignments</div>
        </div>
        <div style={{ background: 'rgba(239, 129, 196, 0.05)', padding: 24, borderRadius: 24, border: '1px solid rgba(239, 129, 196, 0.1)' }}>
          <div style={{ color: 'var(--tertiary)', marginBottom: 12 }}>{percentage > 75 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{percentage > 40 ? 'PASS' : 'FAIL'}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)', fontWeight: 600 }}>Academic Standing</div>
        </div>
      </div>

      {/* 3. ALERTS & WARNINGS (IMPORTANT) */}
      {(atRiskCourses.length > 0 || missingAssignments > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 40 }}>
          {atRiskCourses.map(course => (
            <div key={course} style={{ display: 'flex', gap: 16, padding: 20, background: 'rgba(255, 82, 82, 0.1)', borderRadius: 20, border: '1px solid rgba(255, 82, 82, 0.2)' }}>
              <AlertCircle color="#ff5252" size={24} />
              <div>
                <div style={{ fontWeight: 800, color: '#ff5252' }}>At-Risk: {course}</div>
                <div style={{ fontSize: '0.85rem', color: 'rgba(255, 82, 82, 0.8)' }}>You are currently below 40% in this subject.</div>
              </div>
            </div>
          ))}
          {missingAssignments > 0 && (
            <div style={{ display: 'flex', gap: 16, padding: 20, background: 'rgba(255, 171, 0, 0.1)', borderRadius: 20, border: '1px solid rgba(255, 171, 0, 0.2)' }}>
              <AlertTriangle color="#ffab00" size={24} />
              <div>
                <div style={{ fontWeight: 800, color: '#ffab00' }}>{missingAssignments} Missing Tasks</div>
                <div style={{ fontSize: '0.85rem', color: 'rgba(255, 171, 0, 0.8)' }}>Check assignments for unsubmitted work.</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. MAIN REPORTS LIST */}
      <h3 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
        <PieChart size={20} color="var(--primary)" /> Recent Performance Breakdown
      </h3>

      {grades.length === 0 ? (
        <div className="empty-state" style={{ padding: 80, background: 'var(--surface-container-high)', borderRadius: 32 }}>
          <Award size={64} style={{ color: 'var(--on-surface-variant)', marginBottom: 20, opacity: 0.5 }} />
          <h3>No Graded Records</h3>
          <p>Submit your assignments to receive evaluations from your instructors.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {grades.map((g, idx) => {
            const gradePercent = (g.grade / (g.maxMarks || 100)) * 100;
            const isPassing = gradePercent >= 40;

            return (
              <div key={g.id || idx} style={{
                background: 'var(--surface-container-high)', borderRadius: 24,
                padding: 24, border: '1px solid rgba(74, 66, 107, 0.12)',
                display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 150px', gap: 20, alignItems: 'center'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span style={{
                      padding: '4px 10px', borderRadius: 6, background: 'rgba(96, 99, 238, 0.08)',
                      color: 'var(--primary)', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase'
                    }}>
                      {g.courseName}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={12} /> {new Date(g.submittedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 12px 0' }}>{g.assignmentTitle}</h4>

                  {g.feedback ? (
                    <div style={{
                      display: 'flex', gap: 10, padding: 12,
                      background: 'rgba(255,255,255,0.02)', borderRadius: 14,
                      border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                      <MessageSquare size={16} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: 2 }} />
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--on-surface-variant)', fontStyle: 'italic' }}>
                        "{g.feedback}"
                      </p>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', opacity: 0.5 }}>No instructor comments available</div>
                  )}
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontSize: '2rem', fontWeight: 900,
                    color: isPassing ? '#48c78e' : '#ff5252'
                  }}>
                    {g.grade}
                  </div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--on-surface-variant)' }}>
                    / {g.maxMarks || 100}
                  </div>
                  <div style={{
                    marginTop: 6, fontSize: '0.65rem', fontWeight: 900,
                    color: isPassing ? '#48c78e' : '#ff5252'
                  }}>
                    {isPassing ? 'PASS' : 'FAIL'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
