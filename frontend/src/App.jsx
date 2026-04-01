import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Navigation from './pages/Navigation';
import Dashboard from './pages/Dashboard';
import Attendance from './pages/Attendance';
import Communication from './pages/Communication';
import FacultyMonitor from './pages/FacultyMonitor';
import Events from './pages/Events';

function App() {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/navigate" element={<Navigation />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/communication" element={<Communication />} />
        <Route path="/faculty-monitor" element={<FacultyMonitor />} />
        <Route path="/events" element={<Events />} />
        {/* Default route redirects to Login for now */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

export default App;
