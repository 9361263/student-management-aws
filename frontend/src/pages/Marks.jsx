import React, { useState, useEffect } from 'react';
import { marksApi, academicApi } from '../services/api';
import {
  GraduationCap,
  Award,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  X,
  BookOpen,
  Sparkles,
  RefreshCw,
  ChevronRight,
} from 'lucide-react';

export const Marks = () => {
  const [studentsSummary, setStudentsSummary] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State for Selected Student
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentMarks, setStudentMarks] = useState([]);
  const [marksSummary, setMarksSummary] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Form State (for Add or Edit)
  const [editingMarkId, setEditingMarkId] = useState(null); // null = adding new, number = editing existing
  const [formData, setFormData] = useState({
    subjectId: '',
    examType: 'INTERNAL_1',
    semester: '5',
    marks: '',
    maxMarks: '50',
  });

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (departmentFilter) params.departmentId = departmentFilter;

      const res = await marksApi.getAllSummary(params);
      if (res?.students) {
        setStudentsSummary(res.students);
      }
    } catch (err) {
      console.warn('Failed to load marks summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initData = async () => {
      try {
        const [dRes, subRes] = await Promise.all([
          academicApi.getDepartments(),
          academicApi.getSubjects(),
        ]);

        if (dRes?.departments) setDepartments(dRes.departments);
        if (subRes?.subjects && subRes.subjects.length > 0) {
          setSubjects(subRes.subjects);
          setFormData((prev) => ({ ...prev, subjectId: String(subRes.subjects[0].id) }));
        }
      } catch (err) {}
    };
    initData();
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [search, departmentFilter]);

  // Load detailed marks for a selected student in modal
  const openStudentModal = async (student) => {
    setSelectedStudent(student);
    setModalLoading(true);
    setEditingMarkId(null);
    setSuccessMsg('');
    setFormData({
      subjectId: subjects.length > 0 ? String(subjects[0].id) : '1',
      examType: 'INTERNAL_1',
      semester: String(student.semester || '5'),
      marks: '',
      maxMarks: '50',
    });

    try {
      const res = await marksApi.getStudentMarks(student.id);
      if (res) {
        setStudentMarks(res.records || []);
        setMarksSummary(res.summary || null);
      }
    } catch (err) {
      console.warn('Failed to load student details:', err);
    } finally {
      setModalLoading(false);
    }
  };

  const closeStudentModal = () => {
    setSelectedStudent(null);
    setStudentMarks([]);
    setMarksSummary(null);
    fetchSummary(); // Refresh main list CGPAs
  };

  // Add or Update Form Submit
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setSuccessMsg('');

    try {
      if (editingMarkId) {
        // Edit existing mark entry
        await marksApi.update(editingMarkId, {
          marks: parseFloat(formData.marks),
          maxMarks: parseFloat(formData.maxMarks),
          examType: formData.examType,
          semester: parseInt(formData.semester, 10),
        });
        setSuccessMsg('Mark record updated successfully!');
      } else {
        // Add new mark entry
        await marksApi.addOrUpdate({
          studentId: selectedStudent.id,
          subjectId: parseInt(formData.subjectId, 10),
          examType: formData.examType,
          marks: parseFloat(formData.marks),
          maxMarks: parseFloat(formData.maxMarks),
          semester: parseInt(formData.semester, 10),
        });
        setSuccessMsg('New mark record added successfully!');
      }

      // Reset form & reload student marks
      setEditingMarkId(null);
      setFormData({
        subjectId: subjects.length > 0 ? String(subjects[0].id) : '1',
        examType: 'INTERNAL_1',
        semester: String(selectedStudent.semester || '5'),
        marks: '',
        maxMarks: '50',
      });

      // Refresh modal student marks & CGPA
      const res = await marksApi.getStudentMarks(selectedStudent.id);
      if (res) {
        setStudentMarks(res.records || []);
        setMarksSummary(res.summary || null);
      }

      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert('Error saving marks: ' + err.message);
    }
  };

  // Prepare form for editing an existing mark
  const startEditMark = (mark) => {
    setEditingMarkId(mark.id);
    setFormData({
      subjectId: String(mark.subject_id),
      examType: mark.exam_type,
      semester: String(mark.semester),
      marks: String(mark.marks),
      maxMarks: String(mark.max_marks),
    });
  };

  // Cancel edit mode
  const cancelEdit = () => {
    setEditingMarkId(null);
    setFormData({
      subjectId: subjects.length > 0 ? String(subjects[0].id) : '1',
      examType: 'INTERNAL_1',
      semester: String(selectedStudent.semester || '5'),
      marks: '',
      maxMarks: '50',
    });
  };

  // Delete mark entry
  const handleDeleteMark = async (markId) => {
    if (!window.confirm('Are you sure you want to delete this examination mark entry?')) return;
    try {
      await marksApi.delete(markId);
      setSuccessMsg('Mark entry removed.');
      
      // Refresh modal
      const res = await marksApi.getStudentMarks(selectedStudent.id);
      if (res) {
        setStudentMarks(res.records || []);
        setMarksSummary(res.summary || null);
      }
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert('Error deleting mark: ' + err.message);
    }
  };

  // Calculate Overall Averages for KPI Cards
  const totalStudents = studentsSummary.length;
  const avgCgpa = totalStudents > 0 
    ? (studentsSummary.reduce((acc, s) => acc + (s.cgpa || 0), 0) / totalStudents).toFixed(2) 
    : '0.00';
  const passCount = studentsSummary.filter((s) => s.status === 'PASS' || s.cgpa >= 4.0).length;
  const passPercentage = totalStudents > 0 ? ((passCount / totalStudents) * 100).toFixed(1) : '100.0';

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem' }}>Examination Marks & CGPA Portal</h1>
          <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
            Comprehensive directory of student grades, semester evaluations, and CGPA calculations.
          </p>
        </div>

        <button className="btn btn-secondary" onClick={fetchSummary}>
          <RefreshCw size={16} /> Refresh Directory
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="stat-grid">
        <div className="stat-card" style={{ '--stat-color': '#3b82f6' }}>
          <div className="stat-info">
            <span>Total Evaluated</span>
            <h3>{totalStudents} Students</h3>
          </div>
          <div className="stat-icon-box">
            <GraduationCap size={24} />
          </div>
        </div>

        <div className="stat-card" style={{ '--stat-color': '#a855f7' }}>
          <div className="stat-info">
            <span>Institutional CGPA</span>
            <h3 style={{ color: '#a855f7' }}>{avgCgpa} / 10.0</h3>
          </div>
          <div className="stat-icon-box">
            <Award size={24} />
          </div>
        </div>

        <div className="stat-card" style={{ '--stat-color': '#10b981' }}>
          <div className="stat-info">
            <span>Examination Pass Rate</span>
            <h3 style={{ color: '#10b981' }}>{passPercentage}%</h3>
          </div>
          <div className="stat-icon-box">
            <CheckCircle size={24} />
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div
        className="glass-card"
        style={{
          marginBottom: '1.5rem',
          padding: '1rem 1.25rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          alignItems: 'center',
        }}
      >
        <div style={{ position: 'relative' }}>
          <Search
            size={18}
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }}
          />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="Search student or roll no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div>
          <select
            className="form-select"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* All Students Marks & CGPA Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Roll Number</th>
              <th>Student Name</th>
              <th>Dept</th>
              <th>Year / Sem</th>
              <th>Exams Count</th>
              <th>Avg Score (%)</th>
              <th>CGPA</th>
              <th>Grade</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
                  Loading student marks & CGPA summary...
                </td>
              </tr>
            ) : studentsSummary.length === 0 ? (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
                  No students found matching filters.
                </td>
              </tr>
            ) : (
              studentsSummary.map((student) => (
                <tr key={student.id}>
                  <td>
                    <span style={{ fontWeight: 700, color: '#3b82f6' }}>{student.roll_number}</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{student.name}</div>
                  </td>
                  <td>
                    <span className="badge badge-info">{student.department_code || 'CSE'}</span>
                  </td>
                  <td>
                    Year {student.year} (Sem {student.semester})
                  </td>
                  <td>
                    <span className="badge badge-purple">{student.total_exams} Exams</span>
                  </td>
                  <td>
                    <strong>{student.average_percentage}%</strong>
                  </td>
                  <td>
                    <strong style={{ color: '#a855f7', fontSize: '1rem' }}>
                      {student.cgpa ? student.cgpa.toFixed(2) : '0.00'}
                    </strong>
                  </td>
                  <td>
                    <span className={`badge ${student.cgpa >= 8.0 ? 'badge-success' : student.cgpa >= 6.0 ? 'badge-warning' : 'badge-danger'}`}>
                      {student.grade || 'N/A'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${student.status === 'PASS' ? 'badge-success' : student.status === 'FAIL' ? 'badge-danger' : 'badge-info'}`}>
                      {student.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => openStudentModal(student)}
                    >
                      <Edit2 size={14} /> Manage Marks
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ================================================================ */}
      {/* STUDENT MARKS MANAGEMENT MODAL / DRAWER */}
      {/* ================================================================ */}
      {selectedStudent && (
        <div className="modal-overlay" onClick={closeStudentModal}>
          <div
            className="modal-content"
            style={{ maxWidth: '850px', width: '95%' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem' }}>{selectedStudent.name}</h2>
                <div style={{ fontSize: '0.85rem', color: '#9ca3af', display: 'flex', gap: '0.75rem', marginTop: '0.2rem' }}>
                  <span>Roll: <strong>{selectedStudent.roll_number}</strong></span>
                  <span>•</span>
                  <span>Dept: <strong>{selectedStudent.department_code || 'CSE'}</strong></span>
                  <span>•</span>
                  <span>Year {selectedStudent.year}, Sem {selectedStudent.semester}</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {marksSummary && (
                  <div style={{ textAlign: 'right', background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)', padding: '0.35rem 0.75rem', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.7rem', color: '#a855f7', fontWeight: 600 }}>CURRENT CGPA</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#a855f7' }}>
                      {marksSummary.gpa} / 10.0
                    </div>
                  </div>
                )}
                <button className="btn btn-secondary btn-sm" onClick={closeStudentModal}>
                  <X size={18} />
                </button>
              </div>
            </div>

            {successMsg && (
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#10b981',
                  padding: '0.65rem 1rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.85rem',
                }}
              >
                <CheckCircle size={16} /> {successMsg}
              </div>
            )}

            {/* Add / Edit Form Box */}
            <div
              className="glass-card"
              style={{
                marginBottom: '1.5rem',
                background: editingMarkId ? 'rgba(59, 130, 246, 0.08)' : 'rgba(255,255,255,0.02)',
                border: editingMarkId ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid var(--border-color)',
                padding: '1.25rem',
              }}
            >
              <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: editingMarkId ? '#3b82f6' : '#f9fafb' }}>
                {editingMarkId ? <Edit2 size={16} /> : <Plus size={16} />}
                {editingMarkId ? 'Edit Examination Mark Entry' : 'Add New Examination Mark Entry'}
              </h4>

              <form onSubmit={handleFormSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                  {/* Subject Select */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Subject *</label>
                    <select
                      className="form-select"
                      value={formData.subjectId}
                      onChange={(e) => setFormData((p) => ({ ...p, subjectId: e.target.value }))}
                      disabled={!!editingMarkId}
                      required
                    >
                      {subjects.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name} ({sub.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Exam Type */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Exam Type *</label>
                    <select
                      className="form-select"
                      value={formData.examType}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((p) => ({
                          ...p,
                          examType: val,
                          maxMarks: val === 'SEMESTER_FINAL' ? '100' : '50',
                        }));
                      }}
                    >
                      <option value="INTERNAL_1">Internal Assessment 1</option>
                      <option value="INTERNAL_2">Internal Assessment 2</option>
                      <option value="SEMESTER_FINAL">Semester Final Exam</option>
                      <option value="ASSIGNMENT">Assignment / Project</option>
                      <option value="LAB">Lab Practical</option>
                    </select>
                  </div>

                  {/* Semester */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Semester *</label>
                    <select
                      className="form-select"
                      value={formData.semester}
                      onChange={(e) => setFormData((p) => ({ ...p, semester: e.target.value }))}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                        <option key={s} value={s}>
                          Sem {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Marks Scored */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Marks Scored *</label>
                    <input
                      type="number"
                      step="0.5"
                      className="form-input"
                      placeholder="e.g. 45"
                      value={formData.marks}
                      onChange={(e) => setFormData((p) => ({ ...p, marks: e.target.value }))}
                      required
                    />
                  </div>

                  {/* Max Marks */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Max Marks *</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.maxMarks}
                      onChange={(e) => setFormData((p) => ({ ...p, maxMarks: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                  {editingMarkId && (
                    <button type="button" className="btn btn-secondary btn-sm" onClick={cancelEdit}>
                      Cancel Edit
                    </button>
                  )}
                  <button type="submit" className="btn btn-primary btn-sm">
                    {editingMarkId ? 'Save Mark Changes' : 'Add Mark Entry'}
                  </button>
                </div>
              </form>
            </div>

            {/* Existing Marks List */}
            <h4 style={{ marginBottom: '0.75rem' }}>Recorded Examination History</h4>
            <div className="table-container" style={{ maxHeight: '300px', overflowY: 'auto' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Exam Type</th>
                    <th>Sem</th>
                    <th>Marks</th>
                    <th>Score %</th>
                    <th>Grade</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {modalLoading ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                        Loading student examination records...
                      </td>
                    </tr>
                  ) : studentMarks.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                        No examination records found. Use the form above to add marks.
                      </td>
                    </tr>
                  ) : (
                    studentMarks.map((m) => (
                      <tr key={m.id}>
                        <td>
                          <strong>{m.subject_name || 'Subject'}</strong> ({m.subject_code || 'CS501'})
                        </td>
                        <td>
                          <span className="badge badge-purple">{m.exam_type}</span>
                        </td>
                        <td>Sem {m.semester}</td>
                        <td>
                          <strong style={{ color: '#3b82f6' }}>{m.marks}</strong> / {m.max_marks}
                        </td>
                        <td>
                          <strong>{m.percentage}%</strong>
                        </td>
                        <td>
                          <span className={`badge ${parseFloat(m.percentage) >= 75 ? 'badge-success' : 'badge-warning'}`}>
                            {m.grade || 'B'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '0.25rem 0.5rem' }}
                              onClick={() => startEditMark(m)}
                              title="Edit Mark"
                            >
                              <Edit2 size={13} /> Edit
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              style={{ padding: '0.25rem 0.5rem' }}
                              onClick={() => handleDeleteMark(m.id)}
                              title="Remove Mark"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Close Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button className="btn btn-secondary" onClick={closeStudentModal}>
                Done & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
