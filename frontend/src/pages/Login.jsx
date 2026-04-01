import React, { useState } from 'react';
import './Login.css';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [role, setRole] = useState('STUDENT');
  const [method, setMethod] = useState('email');
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, role })
      });
      const data = await res.json();
      if (data.success) {
        setStep(2);
      }
    } catch (err) {
      alert('Failed to connect to backend server');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, otp, role })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('campus_token', data.token);
        localStorage.setItem('campus_role', data.role);
        navigate('/dashboard');
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Failed to connect to backend server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card glass-panel animate-fade-in">
        <div className="login-header">
          <h1>Smart Campus</h1>
          <p>Sign in to access campus services</p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSendOTP}>
            <div className="form-group">
              <label>Select Your Role</label>
              <div className="role-selector">
                <button type="button" className={`role-btn ${role === 'STUDENT' ? 'active' : ''}`} onClick={() => setRole('STUDENT')}>Student</button>
                <button type="button" className={`role-btn ${role === 'FACULTY' ? 'active' : ''}`} onClick={() => setRole('FACULTY')}>Faculty</button>
                <button type="button" className={`role-btn ${role === 'VISITOR' ? 'active' : ''}`} onClick={() => setRole('VISITOR')}>Visitor</button>
              </div>
            </div>

            <div className="form-group">
              <label>Phone Number / Email</label>
              <input 
                type={method === 'email' ? 'email' : 'tel'} 
                className="input-base" 
                placeholder="Enter your email or phone"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>
            
            <div id="recaptcha-container"></div>

            <button type="submit" className="btn-primary btn-full" disabled={loading}>
              {loading ? 'Sending Request...' : 'Get OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="animate-fade-in">
            <div className="form-group">
              <label>Enter OTP Code</label>
              <input 
                type="text" 
                className="input-base" 
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
              <p style={{marginTop: '10px', fontSize: '0.8rem', color: 'var(--text-secondary)'}}>
                OTP sent to {identifier}
              </p>
            </div>
            <button type="submit" className="btn-primary btn-full" disabled={loading}>
              {loading ? 'Verifying...' : 'Sign In'}
            </button>
            <button 
              type="button" 
              className="btn-secondary btn-full" 
              style={{marginTop: '10px'}}
              onClick={() => setStep(1)}
              disabled={loading}
            >
              Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
