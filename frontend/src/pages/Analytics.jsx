import React, { useState, useEffect } from 'react';
import { analyticsApi } from '../services/api';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Award,
  Users,
  CalendarCheck,
  Download,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const Analytics = () => {
  const [overview, setOverview] = useState({
    totalStudents: 10,
    averageAttendance: 86.5,
    averageMarks: 81.2,
    passPercentage: 92.0,
    lowAttendanceCount: 1,
    totalDocuments: 3,
  });

  const [deptData, setDeptData] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [subjectData, setSubjectData] = useState([]);
  const [topStudents, setTopStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const [oRes, dRes, aRes, sRes, tRes] = await Promise.all([
          analyticsApi.getOverview().catch(() => ({ success: true, data: overview })),
          analyticsApi.getDepartments().catch(() => ({ success: true, data: [] })),
          analyticsApi.getAttendance().catch(() => ({ success: true, data: [] })),
          analyticsApi.getSubjects().catch(() => ({ success: true, data: [] })),
          analyticsApi.getTopStudents().catch(() => ({ success: true, data: [] })),
        ]);

        if (oRes?.data) setOverview(oRes.data);
        if (dRes?.data) setDeptData(dRes.data);
        if (aRes?.data) setAttendanceData(aRes.data);
        if (sRes?.data) setSubjectData(sRes.data);
        if (tRes?.data) setTopStudents(tRes.data);
      } catch (err) {
        console.warn('Analytics error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadAnalytics();
  }, []);

  const handleExportCSV = () => {
    let csv = 'Roll Number,Name,Department,Avg Marks,Attendance %\n';
    topStudents.forEach((s) => {
      csv += `${s.roll_number},${s.name},${s.department_code},${s.avg_marks},${s.attendance_pct}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `student_analytics_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem' }}>Institutional Cloud Analytics</h1>
          <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
            Aggregated metrics across departments, subject evaluations, and student attendance.
          </p>
        </div>

        <button className="btn btn-secondary" onClick={handleExportCSV}>
          <Download size={16} /> Export Analytics CSV
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="stat-grid">
        <div className="stat-card" style={{ '--stat-color': '#3b82f6' }}>
          <div className="stat-info">
            <span>Total Enrolled</span>
            <h3>{overview.totalStudents}</h3>
          </div>
          <div className="stat-icon-box">
            <Users size={24} />
          </div>
        </div>

        <div className="stat-card" style={{ '--stat-color': '#10b981' }}>
          <div className="stat-info">
            <span>Institutional Attendance</span>
            <h3 style={{ color: '#10b981' }}>{overview.averageAttendance}%</h3>
          </div>
          <div className="stat-icon-box">
            <CalendarCheck size={24} />
          </div>
        </div>

        <div className="stat-card" style={{ '--stat-color': '#a855f7' }}>
          <div className="stat-info">
            <span>Overall Score Avg.</span>
            <h3 style={{ color: '#a855f7' }}>{overview.averageMarks}%</h3>
          </div>
          <div className="stat-icon-box">
            <Award size={24} />
          </div>
        </div>

        <div className="stat-card" style={{ '--stat-color': '#06b6d4' }}>
          <div className="stat-info">
            <span>Pass Percentage</span>
            <h3 style={{ color: '#06b6d4' }}>{overview.passPercentage}%</h3>
          </div>
          <div className="stat-icon-box">
            <TrendingUp size={24} />
          </div>
        </div>
      </div>

      {/* Charts Row 1: Attendance Distribution & Subject Performance */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Attendance Breakdown */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CalendarCheck size={18} color="#10b981" /> Attendance Distribution Tiers
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {attendanceData.map((item, i) => {
              const pct = overview.totalStudents > 0 ? ((item.count / overview.totalStudents) * 100).toFixed(0) : 0;
              return (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                    <span style={{ fontWeight: 600 }}>{item.category}</span>
                    <span style={{ color: '#9ca3af' }}>{item.count} students ({pct}%)</span>
                  </div>
                  <div style={{ height: '10px', background: 'rgba(255,255,255,0.06)', borderRadius: '5px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.max(pct, 5)}%`,
                        background: item.fill || '#3b82f6',
                        borderRadius: '5px',
                        transition: 'width 0.6s ease',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Subject Performance */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={18} color="#a855f7" /> Subject-wise Performance Index
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {subjectData.slice(0, 5).map((sub, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                  <span style={{ fontWeight: 600 }}>{sub.subject_name} ({sub.subject_code})</span>
                  <span style={{ color: '#a855f7', fontWeight: 700 }}>{sub.average_score}% Avg</span>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${sub.average_score}%`,
                      background: 'linear-gradient(90deg, #8b5cf6 0%, #3b82f6 100%)',
                      borderRadius: '4px',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top 5 Students Leaderboard Table */}
      <div className="glass-card">
        <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Award size={18} color="#ff9900" /> Academic Honor Roll & Top Performers
        </h3>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Roll Number</th>
                <th>Student Name</th>
                <th>Department</th>
                <th>Average Score</th>
                <th>Attendance %</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {topStudents.map((s, idx) => (
                <tr key={s.id || idx}>
                  <td>
                    <div
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        background: idx === 0 ? '#ff9900' : idx === 1 ? '#94a3b8' : '#cd7f32',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                      }}
                    >
                      {idx + 1}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: '#3b82f6' }}>{s.roll_number}</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{s.name}</div>
                  </td>
                  <td>
                    <span className="badge badge-info">{s.department_code}</span>
                  </td>
                  <td>
                    <strong style={{ color: '#a855f7', fontSize: '0.95rem' }}>{s.avg_marks}%</strong>
                  </td>
                  <td>
                    <span className="badge badge-success">{s.attendance_pct}%</span>
                  </td>
                  <td>
                    <span className="badge badge-success">Top Tier</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
