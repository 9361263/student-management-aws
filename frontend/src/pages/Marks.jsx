import React, { useState, useEffect } from 'react';
import { studentApi, marksApi, academicApi } from '../services/api';
import {
  GraduationCap,
  Award,
  PlusCircle,
  CheckCircle,
  Search,
  BookOpen,
} from 'lucide-react';

export const Marks = () => {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('1');
  const [examType, setExamType] = useState('INTERNAL_1');
  const [marks, setMarks] = useState('');
  const [maxMarks, setMaxMarks] = useState('50');
  const [semester, setSemester] = useState('5');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [studentMarksList, setStudentMarksList] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [stRes, subRes] = await Promise.all([
          studentApi.getAll(),
          academicApi.getSubjects(),
        ]);

        if (stRes?.students && stRes.students.length > 0) {
          setStudents(stRes.students);
          setSelectedStudent(String(stRes.students[0].id));
        }

        if (subRes?.subjects && subRes.subjects.length > 0) {
          setSubjects(subRes.subjects);
          setSelectedSubject(String(subRes.subjects[0].id));
        }
      } catch (err) {
        console.warn('Marks load error:', err);
      }
    };
    loadData();
  }, []);

  const fetchStudentMarks = async (sId) => {
    if (!sId) return;
    try {
      const res = await marksApi.getStudentMarks(sId);
      if (res?.records) {
        setStudentMarksList(res.records);
      }
    } catch (err) {
      console.warn('Failed to load student marks:', err);
    }
  };

  useEffect(() => {
    if (selectedStudent) {
      fetchStudentMarks(selectedStudent);
    }
  }, [selectedStudent]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');

    try {
      await marksApi.addOrUpdate({
        studentId: selectedStudent,
        subjectId: selectedSubject,
        examType,
        marks: parseFloat(marks),
        maxMarks: parseFloat(maxMarks),
        semester: parseInt(semester, 10),
      });

      setSuccessMsg('Marks saved successfully to RDS PostgreSQL database!');
      setMarks('');
      fetchStudentMarks(selectedStudent);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert('Error saving marks: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedStudentObj = students.find((s) => String(s.id) === String(selectedStudent));

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.6rem' }}>Examination Marks & GPA Management</h1>
        <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
          Record internal assessments, end-semester grades, and compute CGPA metrics.
        </p>
      </div>

      {successMsg && (
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#10b981',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <CheckCircle size={18} /> {successMsg}
        </div>
      )}

      {/* Two Columns: Marks Entry Form + Student Grade History */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {/* Entry Form */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PlusCircle size={18} color="#3b82f6" /> Enter Assessment Marks
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Select Student *</label>
              <select
                className="form-select"
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                required
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.roll_number} - {s.name} ({s.department_code || 'CSE'})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Subject *</label>
              <select
                className="form-select"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                required
              >
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name} ({sub.code})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Exam Type *</label>
                <select
                  className="form-select"
                  value={examType}
                  onChange={(e) => {
                    setExamType(e.target.value);
                    if (e.target.value === 'SEMESTER_FINAL') {
                      setMaxMarks('100');
                    } else {
                      setMaxMarks('50');
                    }
                  }}
                >
                  <option value="INTERNAL_1">Internal Assessment 1</option>
                  <option value="INTERNAL_2">Internal Assessment 2</option>
                  <option value="SEMESTER_FINAL">Semester Final Exam</option>
                  <option value="ASSIGNMENT">Assignment / Project</option>
                  <option value="LAB">Lab Practical</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Semester *</label>
                <select
                  className="form-select"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>
                      Semester {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Marks Scored *</label>
                <input
                  type="number"
                  step="0.5"
                  className="form-input"
                  placeholder="e.g. 45"
                  value={marks}
                  onChange={(e) => setMarks(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Max Marks *</label>
                <input
                  type="number"
                  className="form-input"
                  value={maxMarks}
                  onChange={(e) => setMaxMarks(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-gradient" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
              <Award size={16} />
              {loading ? 'Submitting...' : 'Record Examination Grade'}
            </button>
          </form>
        </div>

        {/* Student Grade History */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3>Academic Record</h3>
              <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                {selectedStudentObj?.name} ({selectedStudentObj?.roll_number})
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '380px', overflowY: 'auto' }}>
            {studentMarksList.length === 0 ? (
              <p style={{ color: '#9ca3af', textAlign: 'center', padding: '2rem' }}>
                No exam records found for this student. Use the form on the left to add marks.
              </p>
            ) : (
              studentMarksList.map((m, i) => (
                <div
                  key={m.id || i}
                  style={{
                    padding: '0.85rem 1rem',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                      {m.subject_name || 'Subject'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                      {m.exam_type} • Sem {m.semester}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, color: '#3b82f6' }}>
                      {m.marks} / {m.max_marks} ({m.percentage}%)
                    </div>
                    <span
                      className={`badge ${
                        parseFloat(m.percentage) >= 75 ? 'badge-success' : 'badge-warning'
                      }`}
                      style={{ fontSize: '0.75rem', marginTop: '2px' }}
                    >
                      Grade {m.grade || (parseFloat(m.percentage) >= 75 ? 'A' : 'B')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
