import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  CalendarCheck,
  GraduationCap,
  FileText,
  BarChart3,
  Server,
  CloudLightning,
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user, isAdmin } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Students', icon: Users },
    ...(isAdmin ? [{ id: 'add-student', label: 'Add Student', icon: UserPlus }] : []),
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'marks', label: 'Marks & GPA', icon: GraduationCap },
    { id: 'documents', label: 'S3 Documents', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'cloud-status', label: 'AWS Cloud Status', icon: Server },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <CloudLightning size={22} />
        </div>
        <div className="sidebar-title">
          <h2>CloudEdu</h2>
          <span>AWS Serverless</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-title">Main Menu</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <div
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </div>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div style={{ fontSize: '0.75rem', color: '#6b7280', textAlign: 'center' }}>
          <span>AWS Mini Project</span>
          <br />
          <strong style={{ color: '#9ca3af' }}>Prime Vector 2026</strong>
        </div>
      </div>
    </aside>
  );
};
