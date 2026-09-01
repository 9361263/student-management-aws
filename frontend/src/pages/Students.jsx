import React, { useState, useEffect } from 'react';
import { studentApi, academicApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Filter,
  UserPlus,
  Eye,
  Trash2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

export const Students = ({ setActiveTab, setSelectedStudentId }) => {
  const { isAdmin } = useAuth();
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (departmentFilter) params.departmentId = departmentFilter;
      if (yearFilter) params.year = yearFilter;

      const res = await studentApi.getAll(params);
      if (res?.students) {
        setStudents(res.students);
      }
    } catch (err) {
      console.warn('Failed to fetch students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const dRes = await academicApi.getDepartments();
        if (dRes?.departments) setDepartments(dRes.departments);
      } catch (err) {}
    };
    loadFilters();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [search, departmentFilter, yearFilter]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete student "${name}"?`)) return;
    try {
      await studentApi.delete(id);
      fetchStudents();
    } catch (err) {
      alert('Error deleting student: ' + err.message);
    }
  };

  const handleViewStudent = (id) => {
    setSelectedStudentId(id);
    setActiveTab('student-details');
  };

  return (
    <div className="page-wrapper">
      {/* Header with Title & Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem' }}>Student Directory</h1>
          <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
            Manage student records, academic profiles, and document links.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={fetchStudents} title="Refresh">
            <RefreshCw size={16} />
          </button>
          {isAdmin && (
            <button className="btn btn-primary" onClick={() => setActiveTab('add-student')}>
              <UserPlus size={16} /> Register Student
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
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
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search
            size={18}
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }}
          />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="Search by name, roll no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Department Filter */}
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

        {/* Year Filter */}
        <div>
          <select
            className="form-select"
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
          >
            <option value="">All Academic Years</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Roll Number</th>
              <th>Student Name</th>
              <th>Department</th>
              <th>Year / Sem</th>
              <th>Attendance</th>
              <th>Avg Marks</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
                  Loading student records...
                </td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
                  No students found matching your criteria.
                </td>
              </tr>
            ) : (
              students.map((student) => {
                const attPct = parseFloat(student.attendance_pct || 0);
                const isLowAtt = attPct < 75.0 && attPct > 0;

                return (
                  <tr key={student.id}>
                    <td>
                      <span style={{ fontWeight: 700, color: '#3b82f6' }}>{student.roll_number}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{student.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{student.email}</div>
                    </td>
                    <td>
                      <span className="badge badge-info">{student.department_code || 'CSE'}</span>
                    </td>
                    <td>
                      Year {student.year} (Sem {student.semester})
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span
                          className={`badge ${
                            attPct >= 85 ? 'badge-success' : attPct >= 75 ? 'badge-warning' : 'badge-danger'
                          }`}
                        >
                          {attPct}%
                        </span>
                        {isLowAtt && (
                          <span title="Attendance below mandatory 75% threshold">
                            <AlertCircle size={14} color="#ef4444" />
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#a855f7' }}>
                        {student.average_marks ? `${student.average_marks}%` : 'N/A'}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-success">ACTIVE</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleViewStudent(student.id)}
                          title="View Full Profile"
                        >
                          <Eye size={14} /> Profile
                        </button>
                        {isAdmin && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(student.id, student.name)}
                            title="Delete Student"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
