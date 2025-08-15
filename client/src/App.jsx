import React, { useEffect, useMemo, useState } from 'react';
import io from 'socket.io-client';
import { api, USER_ID } from './api';

function NotificationBell({ unread, items, onRead }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(v => !v)}>
        🔔 {unread}
      </button>
      {open && (
        <div style={{ position: 'absolute', right: 0, top: '2.2rem', background: '#fff', border: '1px solid #ddd', padding: 8, width: 320, maxHeight: 320, overflowY: 'auto' }}>
          {items.length === 0 ? (
            <div>No notifications</div>
          ) : items.map(n => (
            <div key={n._id} style={{ borderBottom: '1px solid #eee', padding: '6px 0' }}>
              <div style={{ fontSize: 12, color: '#666' }}>{n.type}</div>
              <div>{n.message}</div>
              {!n.read && <button onClick={() => onRead(n._id)} style={{ fontSize: 12 }}>Mark read</button>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProgressBar({ value }) {
  return (
    <div style={{ background: '#eee', height: 10, borderRadius: 6, overflow: 'hidden' }}>
      <div style={{ width: `${value}%`, background: '#4f46e5', height: '100%' }} />
    </div>
  );
}

function LectureList({ lectures, onJoin }) {
  return (
    <div>
      <h3>Lectures</h3>
      {lectures.length === 0 ? <div>No upcoming lectures</div> : (
        <ul>
          {lectures.map(l => (
            <li key={l._id} style={{ marginBottom: 8 }}>
              <strong>{l.title}</strong> — {new Date(l.startTime).toLocaleString()} ({l.duration}m)
              <button onClick={() => onJoin(l._id)} style={{ marginLeft: 8 }}>Join</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AssignmentList({ assignments, onSubmit }) {
  return (
    <div>
      <h3>Assignments</h3>
      {assignments.length === 0 ? <div>No upcoming assignments</div> : (
        <ul>
          {assignments.map(a => (
            <li key={a._id} style={{ marginBottom: 8 }}>
              <strong>{a.title}</strong> — due {new Date(a.dueDate).toLocaleString()}
              <button onClick={() => onSubmit(a._id)} style={{ marginLeft: 8 }}>Submit</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function App() {
  const [dashboard, setDashboard] = useState({ progress: [], upcomingLectures: [], upcomingAssignments: [], notificationsUnread: 0 });
  const [notifications, setNotifications] = useState({ items: [], unread: 0 });

  const socket = useMemo(() => io('http://localhost:4000', { transports: ['websocket'] }), []);

  const loadDashboard = async () => {
    const data = await api.getDashboard();
    setDashboard(data);
  };
  const loadNotifications = async () => {
    const data = await api.getNotifications();
    setNotifications(data);
  };

  useEffect(() => {
    if (!USER_ID) return;
    socket.on('connect', () => {
      socket.emit('register', { userId: USER_ID });
    });
    socket.on('notification', () => {
      loadNotifications();
    });
    return () => socket.disconnect();
  }, [socket]);

  useEffect(() => {
    loadDashboard();
    loadNotifications();
  }, []);

  const handleJoinLecture = async (lectureId) => {
    await api.markAttendance(lectureId);
    await loadDashboard();
  };
  const handleSubmitAssignment = async (assignmentId) => {
    await api.submitAssignment(assignmentId);
    await loadDashboard();
  };

  const userIdSet = !!USER_ID;

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 16, maxWidth: 900, margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2>LMS Dashboard</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {!userIdSet && <div style={{ color: 'crimson' }}>Set VITE_USER_ID in client .env</div>}
          <NotificationBell unread={notifications.unread} items={notifications.items} onRead={async (id) => { await api.markNotificationRead(id); await loadNotifications(); }} />
        </div>
      </header>

      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <h3>Progress</h3>
          {dashboard.progress.length === 0 ? <div>No progress yet</div> : (
            <ul>
              {dashboard.progress.map(p => (
                <li key={p._id} style={{ marginBottom: 8 }}>
                  <div style={{ marginBottom: 4 }}>Course {p.courseId} — {p.progressPercentage}%</div>
                  <ProgressBar value={p.progressPercentage} />
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <LectureList lectures={dashboard.upcomingLectures} onJoin={handleJoinLecture} />
        </div>
      </section>

      <section style={{ marginTop: 16 }}>
        <AssignmentList assignments={dashboard.upcomingAssignments} onSubmit={handleSubmitAssignment} />
      </section>
    </div>
  );
}
