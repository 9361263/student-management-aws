import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Students } from './pages/Students';
import { AddStudent } from './pages/AddStudent';
import { StudentDetails } from './pages/StudentDetails';
import { Attendance } from './pages/Attendance';
import { Marks } from './pages/Marks';
import { Documents } from './pages/Documents';
import { Analytics } from './pages/Analytics';
import { CloudStatus } from './pages/CloudStatus';

export const App = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedStudentId, setSelectedStudentId] = useState(1);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0b0f19', color: '#9ca3af' }}>
        <p>Loading Student Portal...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  // Guard against non-admin users accessing admin-only pages
  const currentTab = (!isAdmin && activeTab === 'cloud-status') ? 'dashboard' : activeTab;

  const getPageTitle = () => {
    switch (currentTab) {
      case 'dashboard':
        return 'System Dashboard';
      case 'students':
        return 'Student Directory';
      case 'add-student':
        return 'Register Student';
      case 'student-details':
        return 'Student Profile';
      case 'attendance':
        return 'Attendance Management';
      case 'marks':
        return 'Marks & Examinations';
      case 'documents':
        return 'S3 Document Storage';
      case 'analytics':
        return 'Institutional Analytics';
      case 'cloud-status':
        return 'AWS Cloud Architecture';
      default:
        return 'Student Management Portal';
    }
  };

  return (
    <div className="app-container">
      {/* Navigation Sidebar */}
      <Sidebar activeTab={currentTab} setActiveTab={setActiveTab} />

      {/* Main Page Content */}
      <div className="main-content">
        <Navbar currentTitle={getPageTitle()} />

        <main>
          {currentTab === 'dashboard' && (
            <Dashboard
              setActiveTab={setActiveTab}
              setSelectedStudentId={setSelectedStudentId}
            />
          )}

          {currentTab === 'students' && (
            <Students
              setActiveTab={setActiveTab}
              setSelectedStudentId={setSelectedStudentId}
            />
          )}

          {currentTab === 'add-student' && (
            <AddStudent setActiveTab={setActiveTab} />
          )}

          {currentTab === 'student-details' && (
            <StudentDetails
              studentId={selectedStudentId}
              setActiveTab={setActiveTab}
            />
          )}

          {currentTab === 'attendance' && <Attendance />}

          {currentTab === 'marks' && <Marks />}

          {currentTab === 'documents' && <Documents />}

          {currentTab === 'analytics' && <Analytics />}

          {currentTab === 'cloud-status' && isAdmin && <CloudStatus />}
        </main>
      </div>
    </div>
  );
};

export default App;
