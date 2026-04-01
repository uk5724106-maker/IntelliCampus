import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const role = localStorage.getItem('campus_role') || 'STUDENT';

  return (
    <div className="dashboard-wrapper animate-fade-in">
      <div className="dashboard-header">
        <h1>Welcome, {role.charAt(0) + role.slice(1).toLowerCase()}</h1>
        <p>Your centralized Smart Campus Hub</p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card glass-panel" onClick={() => navigate('/navigate')}>
          <div className="icon-wrapper">📍</div>
          <h3>Smart Navigation</h3>
          <p>Find your way around campus and locate departments.</p>
        </div>

        {role === 'STUDENT' || role === 'VISITOR' ? (
          <div className="dashboard-card glass-panel" onClick={() => navigate('/attendance')}>
            <div className="icon-wrapper">✅</div>
            <h3>Mark Attendance</h3>
            <p>Geofenced automated attendance tracking.</p>
          </div>
        ) : (
          <div className="dashboard-card glass-panel" onClick={() => navigate('/faculty-monitor')}>
            <div className="icon-wrapper">📊</div>
            <h3>Class Monitor</h3>
            <p>Live geofence tracker and real-time alerts.</p>
          </div>
        )}

        <div className="dashboard-card glass-panel" onClick={() => navigate('/communication')}>
          <div className="icon-wrapper">💬</div>
          <h3>Communication</h3>
          <p>Raise complaints, view announcements, and get support.</p>
        </div>

        <div className="dashboard-card glass-panel" onClick={() => navigate('/events')}>
          <div className="icon-wrapper">🗓️</div>
          <h3>Events</h3>
          <p>View upcoming seminars, fests, and workshops.</p>
        </div>
      </div>
    </div>
  );
}
