import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Cloud, Shield, LogOut, User, Database } from 'lucide-react';

export const Navbar = ({ currentTitle = 'Dashboard' }) => {
  const { user, isAdmin, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar-left">
        <h2>{currentTitle}</h2>
      </div>

      <div className="navbar-right">
        {/* AWS Cloud Badge & Database Status (Admin Only) */}
        {isAdmin && (
          <>
            <div className="badge-aws" title="Connected to AWS ap-south-1">
              <Cloud size={16} />
              <span>AWS: ap-south-1</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#10b981' }}>
              <Database size={15} />
              <span>PostgreSQL Active</span>
            </div>
          </>
        )}

        {/* User Info & Logout */}
        <div className="user-profile-badge">
          <div className="user-avatar">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user?.name || 'User'}</span>
            <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>{user?.role || 'FACULTY'}</span>
          </div>
          <button
            onClick={logout}
            className="btn btn-secondary btn-sm"
            style={{ marginLeft: '0.5rem', padding: '0.25rem 0.5rem' }}
            title="Log Out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </header>
  );
};
