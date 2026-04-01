import React, { useState, useEffect } from 'react';
import './Attendance.css';

// Fixed mock location for "Campus" (Bhopal coordinates)
const CAMPUS_GEO = { lat: 23.2599, lng: 77.4126 };
const ALLOWED_RADIUS = 500; // meters

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export default function Attendance() {
  const [status, setStatus] = useState('NONE'); // NONE, TEMP_PRESENT, CONFIRMED, INVALID
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState('Data Structures');
  const [history, setHistory] = useState([]);
  const [logs, setLogs] = useState([]);
  const [trackingId, setTrackingId] = useState(null);

  const fetchHistory = async () => {
    const token = localStorage.getItem('campus_token');
    try {
      const res = await fetch(`/api/attendance/student/${token}`);
      const data = await res.json();
      if (data.success) setHistory(data.history);
    } catch (err) {}
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const writeLog = (msg) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  const reportStatus = async (newStatus, distance) => {
    const token = localStorage.getItem('campus_token');
    try {
      await fetch('/api/attendance/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, subject, status: newStatus, distance: Math.round(distance) })
      });
      fetchHistory(); // refresh table
    } catch (err) {
      writeLog("API Sync Error: " + err.message);
    }
  };

  useEffect(() => {
    return () => {
      if (trackingId) navigator.geolocation.clearWatch(trackingId);
    };
  }, [trackingId]);

  const handleMarkAttendance = () => {
    setLoading(true);
    writeLog("Requesting GPS coordinates...");

    if (!navigator.geolocation) {
      writeLog("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        writeLog(`Current Position: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        
        const distance = getDistance(latitude, longitude, CAMPUS_GEO.lat, CAMPUS_GEO.lng);
        writeLog(`Distance from Campus Core: ${Math.round(distance)} meters`);

        if (distance <= ALLOWED_RADIUS) {
          setStatus('TEMP_PRESENT');
          reportStatus('TEMP_PRESENT', distance);
          writeLog("Status Update: Temporarily Present. Starting geofence tracking...");
          startTracking();
        } else {
          setStatus('INVALID');
          reportStatus('INVALID', distance);
          writeLog(`Status Update: Initial Location Denied (Too far from class - ${Math.round(distance)}m)`);
        }
        setLoading(false);
      },
      (err) => {
        writeLog(`Error fetching location: ${err.message}`);
        setLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const startTracking = () => {
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const distance = getDistance(latitude, longitude, CAMPUS_GEO.lat, CAMPUS_GEO.lng);
        
        if (distance > ALLOWED_RADIUS) {
          writeLog(`Student exited geofence (${Math.round(distance)}m). Status Invalid.`);
          setStatus('INVALID');
          reportStatus('INVALID', distance);
          navigator.geolocation.clearWatch(id);
        } else {
          writeLog(`Still in class... (${Math.round(distance)}m from center)`);
        }
      },
      (err) => writeLog(`Tracking Error: ${err.message}`),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );
    setTrackingId(id);
  };

  // Mock confirm for demo purposes
  const forceConfirm = () => {
    setStatus('CONFIRMED');
    writeLog("Instructor confirmed attendance manually.");
    if (trackingId) navigator.geolocation.clearWatch(trackingId);
  };

  return (
    <div className="attendance-wrapper animate-fade-in">
      <h2>Smart Attendance Engine</h2>
      <p>Continuous GPS Validation System</p>

      <div className="attendance-card glass-panel">
        <div>
          <h3>Current Status</h3>
          <div className={`status-badge status-${status} ${status === 'TEMP_PRESENT' ? 'pulse-animation' : ''}`}>
            {status.replace('_', ' ')}
          </div>
        </div>

        {status === 'NONE' && (
          <div style={{marginBottom: '20px'}}>
            <select 
              className="input-base" 
              style={{marginBottom: '10px'}} 
              value={subject} 
              onChange={(e) => setSubject(e.target.value)}
            >
              <option value="Data Structures">Data Structures</option>
              <option value="Operating Systems">Operating Systems</option>
              <option value="Web Development">Web Development</option>
              <option value="Calculus II">Calculus II</option>
            </select>
            <button className="btn-primary btn-full" onClick={handleMarkAttendance} disabled={loading}>
              {loading ? 'Locating...' : 'Mark Attendance'}
            </button>
          </div>
        )}

        {status === 'TEMP_PRESENT' && (
          <button className="btn-secondary" onClick={forceConfirm}>
            Dev: Mock Instructor Confirmation
          </button>
        )}

        {status === 'INVALID' && (
          <p style={{color: 'var(--accent-error)', marginTop: '20px'}}>
            Attendance Invalidated. Device left campus radius or spoofing detected.
          </p>
        )}

        <div className="attendance-details">
          <h4>Geofence Logs</h4>
          <div style={{height: '150px', overflowY: 'auto', marginTop: '10px', marginBottom: '20px'}}>
            {logs.length === 0 ? <span style={{color: 'gray'}}>Waiting for actions...</span> : null}
            {logs.map((log, i) => <div key={i}>{log}</div>)}
          </div>
          
          <h4>My Attendance History</h4>
          <div style={{marginTop: '10px'}}>
            {history.length === 0 ? <span style={{color: 'gray'}}>No records found.</span> : (
              <table style={{width: '100%', textAlign: 'left', borderCollapse: 'collapse', marginTop: '10px'}}>
                <thead>
                  <tr style={{borderBottom: '1px solid rgba(255,255,255,0.2)'}}>
                    <th style={{padding: '5px'}}>Subject</th>
                    <th style={{padding: '5px'}}>Status</th>
                    <th style={{padding: '5px'}}>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h, idx) => (
                    <tr key={idx}>
                      <td style={{padding: '5px'}}>{h.subject}</td>
                      <td style={{padding: '5px', color: h.status === 'INVALID' ? 'var(--accent-error)' : 'var(--accent-success)'}}>{h.status.replace('_', ' ')}</td>
                      <td style={{padding: '5px', fontSize:'0.85rem'}}>{new Date(h.timestamp).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
