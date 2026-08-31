import React, { useState, useEffect } from 'react';
import { studentApi, attendanceApi, academicApi } from '../services/api';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Save,
  AlertTriangle,
  Users,
  Check,
} from 'lucide-react';

export const Attendance = () => {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('1');
  const [attendanceDate, setAttendanceDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [remarksMap, setRemarksMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [stRes, subRes] = await Promise.all([
          studentApi.getAll(),
          academicApi.getSubjects(),
        ]);

        if (stRes?.students) {
          setStudents(stRes.students);
          // Default all to PRESENT
          const initialMap = {};
          stRes.students.forEach((s) => {
            initialMap[s.id] = 'PRESENT';
          });
          setAttendanceMap(initialMap);
        }

        if (subRes?.subjects && subRes.subjects.length > 0) {
          setSubjects(subRes.subjects);
          setSelectedSubject(String(subRes.subjects[0].id));
        }
      } catch (err) {
        console.warn('Attendance init error:', err);
      }
    };
    loadInitialData();
  }, []);

  const handleStatusChange = (studentId, status) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleMarkAll = (status) => {
    const updated = {};
    students.forEach((s) => {
      updated[s.id] = status;
    });
    setAttendanceMap(updated);
  };

  const handleSaveAttendance = async () => {
    setLoading(true);
    setSaveSuccess(false);

    try {
      const records = students.map((s) => ({
        studentId: s.id,
        subjectId: parseInt(selectedSubject, 10),
        attendanceDate,
        status: attendanceMap[s.id] || 'PRESENT',
        remarks: remarksMap[s.id] || '',
      }));

      await attendanceApi.record({ records });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert('Failed to save attendance: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const presentCount = Object.values(attendanceMap).filter((s) => s === 'PRESENT').length;
  const absentCount = Object.values(attendanceMap).filter((s) => s === 'ABSENT').length;
  const lateCount = Object.values(attendanceMap).filter((s) => s === 'LATE').length;

  return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem' }}>Attendance Tracker</h1>
          <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
            Record and calculate daily subject attendance, track low attendance alerts.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => handleMarkAll('PRESENT')}
          >
            Mark All Present
          </button>
          <button
            className="btn btn-gradient"
            onClick={handleSaveAttendance}
            disabled={loading}
          >
            <Save size={16} />
            {loading ? 'Saving...' : 'Save to RDS'}
          </button>
        </div>
      </div>

      {saveSuccess && (
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
          <Check size={18} /> Attendance successfully saved and synced to PostgreSQL!
        </div>
      )}

      {/* Control Filters Bar */}
      <div
        className="glass-card"
        style={{
          marginBottom: '1.5rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          alignItems: 'center',
        }}
      >
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Subject</label>
          <select
            className="form-select"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Attendance Date</label>
          <input
            type="date"
            className="form-input"
            value={attendanceDate}
            onChange={(e) => setAttendanceDate(e.target.value)}
          />
        </div>

        {/* Live Counter */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Present</span>
            <div style={{ color: '#10b981', fontWeight: 700, fontSize: '1.2rem' }}>{presentCount}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Absent</span>
            <div style={{ color: '#ef4444', fontWeight: 700, fontSize: '1.2rem' }}>{absentCount}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Late</span>
            <div style={{ color: '#f59e0b', fontWeight: 700, fontSize: '1.2rem' }}>{lateCount}</div>
          </div>
        </div>
      </div>

      {/* Attendance Sheet Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Roll Number</th>
              <th>Student Name</th>
              <th>Dept</th>
              <th>Current %</th>
              <th style={{ textAlign: 'center' }}>Attendance Status</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => {
              const currentStatus = attendanceMap[student.id] || 'PRESENT';
              const attPct = parseFloat(student.attendance_pct || 100);

              return (
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span className={`badge ${attPct >= 75 ? 'badge-success' : 'badge-danger'}`}>
                        {attPct}%
                      </span>
                      {attPct < 75 && (
                        <span title="Attendance below 75%">
                          <AlertTriangle size={14} color="#ef4444" />
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                      <button
                        type="button"
                        className={`btn btn-sm ${
                          currentStatus === 'PRESENT' ? 'btn-primary' : 'btn-secondary'
                        }`}
                        style={{
                          background: currentStatus === 'PRESENT' ? '#10b981' : undefined,
                          borderColor: currentStatus === 'PRESENT' ? '#10b981' : undefined,
                        }}
                        onClick={() => handleStatusChange(student.id, 'PRESENT')}
                      >
                        <CheckCircle2 size={14} /> Present
                      </button>

                      <button
                        type="button"
                        className={`btn btn-sm ${
                          currentStatus === 'ABSENT' ? 'btn-danger' : 'btn-secondary'
                        }`}
                        onClick={() => handleStatusChange(student.id, 'ABSENT')}
                      >
                        <XCircle size={14} /> Absent
                      </button>

                      <button
                        type="button"
                        className={`btn btn-sm ${
                          currentStatus === 'LATE' ? 'btn-primary' : 'btn-secondary'
                        }`}
                        style={{
                          background: currentStatus === 'LATE' ? '#f59e0b' : undefined,
                          borderColor: currentStatus === 'LATE' ? '#f59e0b' : undefined,
                        }}
                        onClick={() => handleStatusChange(student.id, 'LATE')}
                      >
                        <Clock size={14} /> Late
                      </button>
                    </div>
                  </td>
                  <td>
                    <input
                      type="text"
                      className="form-input"
                      style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                      placeholder="Optional notes"
                      value={remarksMap[student.id] || ''}
                      onChange={(e) =>
                        setRemarksMap((prev) => ({ ...prev, [student.id]: e.target.value }))
                      }
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
