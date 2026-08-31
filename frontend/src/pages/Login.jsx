import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Cloud, Lock, Mail, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('Password@123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (role) => {
    if (role === 'admin') {
      setEmail('admin@example.com');
      setPassword('Password@123');
    } else {
      setEmail('ramesh.cse@example.com');
      setPassword('Password@123');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 0 25px rgba(59, 130, 246, 0.4)',
              marginBottom: '1rem',
            }}
          >
            <Cloud size={30} />
          </div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>CloudEdu Portal</h1>
          <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
            Serverless Student Management & Analytics using AWS
          </p>
        </div>

        {/* Error Notice */}
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

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={18}
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }}
              />
              <input
                type="email"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={18}
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }}
              />
              <input
                type="password"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-gradient"
            style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In to Portal'}
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Demo Quick Fill Buttons */}
        <div style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#9ca3af', fontSize: '0.8rem' }}>
            <Sparkles size={14} color="#ff9900" />
            <span>Quick Demo Accounts (1-Click Fill):</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleQuickFill('admin')}
              style={{ fontSize: '0.8rem' }}
            >
              🛡️ Admin Demo
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleQuickFill('faculty')}
              style={{ fontSize: '0.8rem' }}
            >
              👨‍🏫 Faculty Demo
            </button>
          </div>
        </div>

        {/* AWS Security Footer */}
        <div style={{ marginTop: '1.5rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#6b7280', fontSize: '0.75rem' }}>
          <ShieldCheck size={14} color="#10b981" />
          <span>Secured with AWS IAM, JWT & S3 Encryption</span>
        </div>
      </div>
    </div>
  );
};
