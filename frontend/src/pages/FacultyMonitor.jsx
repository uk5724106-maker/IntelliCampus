import React, { useState, useEffect } from 'react';
import './FacultyMonitor.css';

export default function FacultyMonitor() {
  const [data, setData] = useState({ enrolled: 0, liveStudents: [] });
  const [notifications, setNotifications] = useState([]);
  const [invalidCount, setInvalidCount] = useState(0);
  const [subjectFilter, setSubjectFilter] = useState('All Subjects');

  const fetchLiveStats = async () => {
    try {
      const res = await fetch(`/api/attendance/live?subject=${encodeURIComponent(subjectFilter)}`);
      const json = await res.json();
      
      if (json.success) {
        // Find newly invalid students to simulate Notification
        const currentInvalids = json.liveStudents.filter(s => s.status === 'INVALID');
        setInvalidCount(currentInvalids.length);

        setData(json);
      }
    } catch (err) {
      console.error('Failed to fetch roster:', err);
    }
  };

  useEffect(() => {
    fetchLiveStats();
    const interval = setInterval(fetchLiveStats, 3000);
    return () => clearInterval(interval);
  }, [subjectFilter]); // Re-fetch on filter change

  return (
    <div className="faculty-wrapper animate-fade-in">
      <div className="faculty-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div style={{textAlign: 'left'}}>
          <h2>Faculty Operations Dashboard</h2>
          <p>Real-time geofence tracking and enrollment stats</p>
        </div>
        <div>
          <select 
            className="input-base" 
            value={subjectFilter} 
            onChange={(e) => setSubjectFilter(e.target.value)}
            style={{minWidth: '200px', padding: '10px'}}
          >
            <option value="All Subjects">All Subjects</option>
            <option value="Data Structures">Data Structures</option>
            <option value="Operating Systems">Operating Systems</option>
            <option value="Web Development">Web Development</option>
            <option value="Calculus II">Calculus II</option>
          </select>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card glass-panel">
          <h3>{data.enrolled}</h3>
          <p>Total Enrolled</p>
        </div>
        <div className="stat-card glass-panel">
          <h3>{data.liveStudents.filter(s => s.status === 'TEMP_PRESENT').length}</h3>
          <p>Present in Class</p>
        </div>
        <div className="stat-card glass-panel alert">
          <h3>{invalidCount}</h3>
          <p>Exited/Invalidated</p>
        </div>
      </div>

      <div style={{marginBottom: '20px'}}>
        <h3 style={{color: 'var(--brand-primary)', marginBottom: '10px'}}>Live Roster Log</h3>
        {invalidCount > 0 && (
          <div style={{padding: '10px', background: 'rgba(239,68,68,0.2)', borderLeft: '4px solid #ef4444', marginBottom: '15px'}}>
            ⚠️ <strong>Alert:</strong> Students have left the active geofence boundaries!
          </div>
        )}
      </div>

      <table className="roster-table">
        <thead>
          <tr>
            <th>Student ID (Email/Phone)</th>
            <th>Distance (meters)</th>
            <th>Status</th>
            <th>Last Updated</th>
          </tr>
        </thead>
        <tbody>
          {data.liveStudents.length === 0 ? (
            <tr><td colSpan="4" style={{textAlign: 'center'}}>No students have scanned in today.</td></tr>
          ) : (
            data.liveStudents.map((student, idx) => (
              <tr key={idx} className={student.status === 'INVALID' ? 'row-alert' : ''}>
                <td>{student.identifier}</td>
                <td>{student.distance}m</td>
                <td>
                  <span className={student.status === 'INVALID' ? 'badge-invalid' : 'badge-present'}>
                    {student.status.replace('_', ' ')}
                  </span>
                </td>
                <td>{new Date(student.timestamp).toLocaleTimeString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
