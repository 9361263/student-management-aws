import React, { useState, useEffect } from 'react';
import { studentApi, documentApi } from '../services/api';
import {
  ArrowLeft,
  CalendarCheck,
  Award,
  FileText,
  Download,
  Mail,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export const StudentDetails = ({ studentId = 1, setActiveTab }) => {
  const [student, setStudent] = useState(null);
  const [activeTab, setSubTab] = useState('attendance'); // 'attendance' | 'marks' | 'documents'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const res = await studentApi.getById(studentId);
        if (res?.student) {
          setStudent(res.student);
        }
      } catch (err) {
        console.warn('Failed to load student:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [studentId]);

  const handleDownloadDoc = async (docId, fileName) => {
    try {
      const res = await documentApi.getDownloadUrl(docId);
      if (res?.downloadUrl) {
        window.open(res.downloadUrl, '_blank');
      }
    } catch (err) {
      alert('Error fetching download link: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <p style={{ color: '#9ca3af', textAlign: 'center', padding: '3rem' }}>
          Loading student profile...
        </p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="page-wrapper">
        <button className="btn btn-secondary" onClick={() => setActiveTab('students')}>
          <ArrowLeft size={16} /> Back to Directory
        </button>
        <p style={{ marginTop: '2rem', color: '#ef4444' }}>Student profile not found.</p>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      {/* Back Button */}
      <div style={{ marginBottom: '1.5rem' }}>
        <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('students')}>
          <ArrowLeft size={16} /> Back to Directory
        </button>
      </div>

      {/* Student Profile Header Card */}
      <div
        className="glass-card"
        style={{
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
          borderLeft: '4px solid #3b82f6',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: 700,
              boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)',
            }}
          >
            {student.name.charAt(0)}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
              <h1 style={{ fontSize: '1.5rem' }}>{student.name}</h1>
              <span className="badge badge-info">{student.department_code || 'CSE'}</span>
              <span className="badge badge-success">ACTIVE</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', color: '#9ca3af', fontSize: '0.85rem' }}>
              <span>
                <strong>Roll No:</strong> {student.roll_number}
              </span>
              <span>•</span>
              <span>{student.course_name || 'B.Tech in Computer Science'}</span>
              <span>•</span>
              <span>
                Year {student.year}, Sem {student.semester}
              </span>
            </div>
          </div>
        </div>

        {/* Contact Info Pills */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.85rem', color: '#9ca3af' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Mail size={14} /> <span>{student.email}</span>
          </div>
          {student.phone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Phone size={14} /> <span>{student.phone}</span>
            </div>
          )}
          {student.address && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={14} /> <span>{student.address}</span>
            </div>
          )}
        </div>
      </div>

      {/* Profile Tabs Navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
        <button
          className={`btn ${activeTab === 'attendance' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setSubTab('attendance')}
        >
          <CalendarCheck size={16} /> Attendance Logs ({student.attendance?.length || 0})
        </button>
        <button
          className={`btn ${activeTab === 'marks' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setSubTab('marks')}
        >
          <Award size={16} /> Marks & GPA ({student.marks?.length || 0})
        </button>
        <button
          className={`btn ${activeTab === 'documents' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setSubTab('documents')}
        >
          <FileText size={16} /> Documents ({student.documents?.length || 0})
        </button>
      </div>

      {/* Tab 1: Attendance */}
      {activeTab === 'attendance' && (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Subject</th>
                <th>Subject Code</th>
                <th>Status</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {!student.attendance || student.attendance.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                    No attendance records found.
                  </td>
                </tr>
              ) : (
                student.attendance.map((att, i) => (
                  <tr key={att.id || i}>
                    <td>{new Date(att.attendance_date).toLocaleDateString()}</td>
                    <td>{att.subject_name || 'Subject'}</td>
                    <td>
                      <span className="badge badge-info">{att.subject_code || 'CS501'}</span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          att.status === 'PRESENT'
                            ? 'badge-success'
                            : att.status === 'LATE'
                            ? 'badge-warning'
                            : 'badge-danger'
                        }`}
                      >
                        {att.status}
                      </span>
                    </td>
                    <td style={{ color: '#9ca3af' }}>{att.remarks || 'Regular Session'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Marks */}
      {activeTab === 'marks' && (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Exam Type</th>
                <th>Semester</th>
                <th>Marks Obtained</th>
                <th>Max Marks</th>
                <th>Percentage</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {!student.marks || student.marks.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                    No examination records found.
                  </td>
                </tr>
              ) : (
                student.marks.map((m, i) => {
                  const pct = ((parseFloat(m.marks) / parseFloat(m.max_marks)) * 100).toFixed(1);
                  return (
                    <tr key={m.id || i}>
                      <td>
                        <strong>{m.subject_name || 'Subject'}</strong> ({m.subject_code || 'CS501'})
                      </td>
                      <td>
                        <span className="badge badge-purple">{m.exam_type}</span>
                      </td>
                      <td>Sem {m.semester}</td>
                      <td>
                        <strong style={{ color: '#3b82f6' }}>{m.marks}</strong>
                      </td>
                      <td>{m.max_marks}</td>
                      <td>
                        <strong>{pct}%</strong>
                      </td>
                      <td>
                        <span className={`badge ${parseFloat(pct) >= 40 ? 'badge-success' : 'badge-danger'}`}>
                          {parseFloat(pct) >= 40 ? 'PASS' : 'FAIL'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Documents */}
      {activeTab === 'documents' && (
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3>Student Documents</h3>
            <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('documents')}>
              Upload New Document
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {!student.documents || student.documents.length === 0 ? (
              <p style={{ color: '#9ca3af' }}>No documents uploaded yet.</p>
            ) : (
              student.documents.map((doc) => (
                <div
                  key={doc.id}
                  style={{
                    padding: '1.25rem',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <FileText size={18} color="#3b82f6" />
                      <strong style={{ fontSize: '0.9rem' }}>{doc.file_name}</strong>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.75rem' }}>
                      Type: <span className="badge badge-info">{doc.document_type}</span>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#6b7280', wordBreak: 'break-all' }}>
                      Ref: {doc.s3_key}
                    </div>
                  </div>

                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ marginTop: '1rem', width: '100%' }}
                    onClick={() => handleDownloadDoc(doc.id, doc.file_name)}
                  >
                    <Download size={14} /> Download Document
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
