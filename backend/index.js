require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-Memory Database Simulation
const db = {
  otps: {}, 
  users: {}, 
  attendance: [], // [{ identifier, subject, status, distance, timestamp }]
  messages: [
    { id: 1, sender: 'admin', text: 'Welcome to the Smart Campus Helpdesk! How can we assist you today?' }
  ],
  events: [
    { id: 1, title: 'Annual Tech Symposium', date: '2026-04-10', location: 'Main Auditorium', description: 'Showcase of final year projects and industry guest speakers.' },
    { id: 2, title: 'Campus Hackathon 2026', date: '2026-04-15', location: 'CS Department Labs', description: '48-hour coding marathon to solve real-world problems.' },
    { id: 3, title: 'Cultural Fest - "Rhythm"', date: '2026-04-20', location: 'University Ground', description: 'Annual cultural festival featuring music, dance, and art.' }
  ]
};

// ==========================================
// 1. AUTHENTICATION (MOCKED)
// ==========================================
app.post('/api/auth/otp/send', (req, res) => {
  const { identifier, role } = req.body;
  if (!identifier) return res.status(400).json({ error: 'Identifier required' });
  const otp = '123456'; 
  db.otps[identifier] = otp;
  console.log(`[AUTH] Sent OTP \${otp} to \${identifier} (Role: \${role})`);
  res.json({ message: 'OTP sent successfully', success: true });
});

app.post('/api/auth/otp/verify', (req, res) => {
  const { identifier, otp, role } = req.body;
  if (db.otps[identifier] === otp) {
    const token = `tok_\${Date.now()}`;
    db.users[token] = { identifier, role };
    delete db.otps[identifier]; 
    console.log(`[AUTH] User \${identifier} successfully authenticated.`);
    res.json({ success: true, token, role });
  } else {
    res.status(401).json({ success: false, error: 'Invalid or expired OTP' });
  }
});

// ==========================================
// 2. ATTENDANCE & SUBJECT ROUTING
// ==========================================
app.post('/api/attendance/status', (req, res) => {
  const { token, subject, status, distance } = req.body;
  const user = db.users[token];
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  if (!subject) return res.status(400).json({ error: 'Subject is required' });

  // Update or insert latest status for user AND subject
  const existing = db.attendance.find(a => a.identifier === user.identifier && a.subject === subject);
  if (existing) {
    existing.status = status;
    existing.distance = distance;
    existing.timestamp = new Date().toISOString();
  } else {
    db.attendance.push({
      identifier: user.identifier,
      subject,
      status,
      distance,
      timestamp: new Date().toISOString()
    });
  }

  console.log(`[ATTENDANCE] \${user.identifier} -> \${subject} : \${status} (\${distance}m)`);
  res.json({ success: true, message: 'Status tracked' });
});

app.get('/api/attendance/live', (req, res) => {
  const { subject } = req.query;
  const enrolled = 120; // Mock total
  
  let liveStudents = db.attendance;
  if (subject && subject !== 'All Subjects') {
    liveStudents = liveStudents.filter(s => s.subject === subject);
  }

  res.json({ success: true, enrolled, liveStudents });
});

// Student History Route
app.get('/api/attendance/student/:token', (req, res) => {
  const { token } = req.params;
  const user = db.users[token];
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  // Get all attendance records for this student
  const studentRecords = db.attendance.filter(a => a.identifier === user.identifier);
  
  res.json({ success: true, history: studentRecords });
});

// ==========================================
// 3. EVENTS
// ==========================================
app.get('/api/events', (req, res) => {
  res.json({ success: true, events: db.events });
});

// ==========================================
// 4. COMMUNICATION
// ==========================================
app.get('/api/communication/history', (req, res) => {
  res.json({ success: true, messages: db.messages });
});

app.post('/api/communication/send', (req, res) => {
  const { text, token } = req.body;
  const user = db.users[token] || { identifier: 'Guest' };
  if (!text) return res.status(400).json({ error: 'Text required' });

  const userMsg = { id: Date.now(), sender: 'user', text, user: user.identifier };
  db.messages.push(userMsg);

  setTimeout(() => {
    const adminMsg = { 
      id: Date.now() + 1, sender: 'admin', 
      text: `We have received your message regarding "\${text.substring(0, 10)}...". Our team is on it!` 
    };
    db.messages.push(adminMsg);
  }, 1000);

  res.json({ success: true, message: userMsg });
});

app.listen(PORT, () => {
  console.log(`Local Backend server successfully started on port \${PORT}`);
  console.log('Firebase bypassed. Custom Node API active.');
});
