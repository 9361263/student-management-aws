import React, { useState, useEffect } from 'react';
import { studentApi, academicApi } from '../services/api';
import { UserPlus, ArrowLeft, Check, AlertCircle } from 'lucide-react';

export const AddStudent = ({ setActiveTab }) => {
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    rollNumber: '',
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '2003-01-01',
    departmentId: '1',
    courseId: '1',
    year: '3',
    semester: '5',
    address: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const loadAcademicData = async () => {
      try {
        const [dRes, cRes] = await Promise.all([
          academicApi.getDepartments(),
          academicApi.getCourses(),
        ]);
        if (dRes?.departments) setDepartments(dRes.departments);
        if (cRes?.courses) setCourses(cRes.courses);
      } catch (err) {}
    };
    loadAcademicData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      await studentApi.create(formData);
      setSuccessMsg('Student successfully registered in AWS RDS Database!');
      setTimeout(() => {
        setActiveTab('students');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to register student.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper" style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('students')}>
          <ArrowLeft size={16} /> Back to Directory
        </button>
        <h2>Register New Student</h2>
      </div>

      <div className="glass-card">
        {error && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              marginBottom: '1.25rem',
              fontSize: '0.875rem',
            }}
          >
            {error}
          </div>
        )}

        {successMsg && (
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#10b981',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              marginBottom: '1.25rem',
              fontSize: '0.875rem',
            }}
          >
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            {/* Roll Number */}
            <div className="form-group">
              <label className="form-label">Roll Number *</label>
              <input
                type="text"
                name="rollNumber"
                className="form-input"
                placeholder="e.g. CS2024011"
                value={formData.rollNumber}
                onChange={handleChange}
                required
              />
            </div>

            {/* Student Name */}
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                name="name"
                className="form-input"
                placeholder="e.g. Rahul Verma"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="rahul@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* Phone */}
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                name="phone"
                className="form-input"
                placeholder="9876543210"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            {/* Department */}
            <div className="form-group">
              <label className="form-label">Department *</label>
              <select
                name="departmentId"
                className="form-select"
                value={formData.departmentId}
                onChange={handleChange}
                required
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Course */}
            <div className="form-group">
              <label className="form-label">Enrolled Degree Course</label>
              <select
                name="courseId"
                className="form-select"
                value={formData.courseId}
                onChange={handleChange}
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Academic Year */}
            <div className="form-group">
              <label className="form-label">Year of Study *</label>
              <select
                name="year"
                className="form-select"
                value={formData.year}
                onChange={handleChange}
                required
              >
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>

            {/* Semester */}
            <div className="form-group">
              <label className="form-label">Current Semester *</label>
              <select
                name="semester"
                className="form-select"
                value={formData.semester}
                onChange={handleChange}
                required
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Address */}
          <div className="form-group">
            <label className="form-label">Residential Address</label>
            <textarea
              name="address"
              className="form-textarea"
              rows="3"
              placeholder="Enter student residential address"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          {/* Submit */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setActiveTab('students')}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-gradient" disabled={loading}>
              <UserPlus size={16} />
              {loading ? 'Registering...' : 'Save Student to RDS'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
