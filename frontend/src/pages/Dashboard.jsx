import React, { useState, useEffect } from 'react';
import { analyticsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  CalendarCheck,
  Award,
  AlertTriangle,
  FileText,
  TrendingUp,
  Server,
  Cloud,
  ChevronRight,
} from 'lucide-react';

export const Dashboard = ({ setActiveTab, setSelectedStudentId }) => {
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 10,
    averageAttendance: 86.5,
    averageMarks: 81.2,
    passPercentage: 92.0,
    lowAttendanceCount: 1,
    totalDocuments: 3,
  });
  const [departments, setDepartments] = useState([]);
  const [topStudents, setTopStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [overviewRes, deptRes, topRes] = await Promise.all([
          analyticsApi.getOverview().catch(() => ({ success: true, data: stats })),
          analyticsApi.getDepartments().catch(() => ({ success: true, data: [] })),
          analyticsApi.getTopStudents().catch(() => ({ success: true, data: [] })),
        ]);

        if (overviewRes?.data) setStats(overviewRes.data);
        if (deptRes?.data) setDepartments(deptRes.data);
        if (topRes?.data) setTopStudents(topRes.data);
      } catch (err) {
        console.warn('Dashboard fetch warning:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="page-wrapper">
      {/* Welcome Banner */}
      <div
        className="glass-card"
        style={{
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(139, 92, 246, 0.08) 100%)',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.6rem', marginBottom: '0.4rem' }}>
            Academic Overview & Analytics Dashboard
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '0.95rem' }}>
            Centralized portal for student attendance, marks management, and performance tracking.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-primary" onClick={() => setActiveTab('attendance')}>
            <CalendarCheck size={16} /> Mark Attendance
          </button>
          <button className="btn btn-secondary" onClick={() => setActiveTab('documents')}>
            <FileText size={16} /> Upload Documents
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="stat-grid">
        {/* Total Students */}
        <div className="stat-card" style={{ '--stat-color': '#3b82f6' }}>
          <div className="stat-info">
            <span>Total Enrolled</span>
            <h3>{stats.totalStudents}</h3>
          </div>
          <div className="stat-icon-box">
            <Users size={24} />
          </div>
        </div>

        {/* Average Attendance */}
        <div className="stat-card" style={{ '--stat-color': '#10b981' }}>
          <div className="stat-info">
            <span>Avg. Attendance</span>
            <h3 style={{ color: '#10b981' }}>{stats.averageAttendance}%</h3>
          </div>
          <div className="stat-icon-box">
            <CalendarCheck size={24} />
          </div>
        </div>

        {/* Average Marks */}
        <div className="stat-card" style={{ '--stat-color': '#a855f7' }}>
          <div className="stat-info">
            <span>Average Marks</span>
            <h3 style={{ color: '#a855f7' }}>{stats.averageMarks}%</h3>
          </div>
          <div className="stat-icon-box">
            <Award size={24} />
          </div>
        </div>

        {/* Pass Percentage */}
        <div className="stat-card" style={{ '--stat-color': '#06b6d4' }}>
          <div className="stat-info">
            <span>Pass Percentage</span>
            <h3 style={{ color: '#06b6d4' }}>{stats.passPercentage}%</h3>
          </div>
          <div className="stat-icon-box">
            <TrendingUp size={24} />
          </div>
        </div>

        {/* Low Attendance Alert */}
        <div className="stat-card" style={{ '--stat-color': '#ef4444' }}>
          <div className="stat-info">
            <span>Below 75% Attendance</span>
            <h3 style={{ color: '#ef4444' }}>{stats.lowAttendanceCount} Student(s)</h3>
          </div>
          <div className="stat-icon-box" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
            <AlertTriangle size={24} />
          </div>
        </div>
      </div>

      {/* Two-Column Analytics Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Department Enrollment Breakdown */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3>Students by Department</h3>
            <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{departments.length} Departments</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {departments.length > 0 ? (
              departments.map((dept, index) => {
                const percentage = stats.totalStudents > 0 ? ((dept.student_count / stats.totalStudents) * 100).toFixed(0) : 0;
                return (
                  <div key={index}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                      <span style={{ fontWeight: 600 }}>{dept.name} ({dept.code})</span>
                      <span style={{ color: '#9ca3af' }}>{dept.student_count} students ({percentage}%)</span>
                    </div>
                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${Math.max(percentage, 10)}%`,
                          background: index === 0 ? '#3b82f6' : index === 1 ? '#8b5cf6' : index === 2 ? '#10b981' : '#f59e0b',
                          borderRadius: '4px',
                          transition: 'width 0.6s ease',
                        }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p style={{ color: '#9ca3af' }}>Loading department data...</p>
            )}
          </div>
        </div>

        {/* Top Performing Students */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3>Top Performers</h3>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setActiveTab('analytics')}
            >
              View Full Analytics <ChevronRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {topStudents.length > 0 ? (
              topStudents.slice(0, 4).map((student, idx) => (
                <div
                  key={student.id || idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
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
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{student.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                        {student.roll_number} • {student.department_code}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span className="badge badge-success" style={{ fontSize: '0.8rem' }}>
                      {student.avg_marks}% Score
                    </span>
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '2px' }}>
                      {student.attendance_pct}% Att.
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: '#9ca3af' }}>Loading rankers...</p>
            )}
          </div>
        </div>
      </div>

      {/* Cloud Architecture Summary Bar (Admin Only) */}
      {isAdmin && (
        <div
          className="glass-card"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            border: '1px solid rgba(255, 153, 0, 0.3)',
            background: 'rgba(255, 153, 0, 0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(255,153,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff9900' }}>
              <Cloud size={24} />
            </div>
            <div>
              <h4 style={{ color: '#ff9900', fontSize: '1rem' }}>AWS Cloud Infrastructure Configured</h4>
              <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                RDS PostgreSQL • S3 Bucket Storage • Lambda API • EC2 Server
              </span>
            </div>
          </div>

          <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('cloud-status')}>
            Inspect Cloud Topology <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
};
