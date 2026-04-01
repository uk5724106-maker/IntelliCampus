import React, { useState, useEffect } from 'react';
import './Events.css';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/events');
        const data = await res.json();
        if (data.success) setEvents(data.events);
      } catch (err) {
        console.error("Failed to load events", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <div className="events-wrapper animate-fade-in">
      <div className="events-header">
        <h2>Campus Events & Announcements</h2>
        <p>Stay updated with the latest happenings at IES University</p>
      </div>

      <div className="events-grid">
        {loading ? (
          <p style={{textAlign: 'center', color: 'gray'}}>Loading events...</p>
        ) : events.length === 0 ? (
          <p style={{textAlign: 'center'}}>No upcoming events.</p>
        ) : (
          events.map(ev => (
            <div key={ev.id} className="event-card glass-panel box-shadow">
              <div className="event-info">
                <h3>{ev.title}</h3>
                <p>📍 {ev.location}</p>
                <p>ℹ️ {ev.description}</p>
              </div>
              <div className="event-date">
                <span className="date-badge">
                  {new Date(ev.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
