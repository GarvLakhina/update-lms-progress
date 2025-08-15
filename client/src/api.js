const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';
// For MVP, set the userId manually in .env or paste the seeded id in UI
export const USER_ID = import.meta.env.VITE_USER_ID || '';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-User-Id': USER_ID,
      ...(options.headers || {}),
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const api = {
  getDashboard: () => request('/dashboard'),
  getNotifications: () => request('/notifications'),
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
  submitAssignment: (id) => request(`/assignments/${id}/submit`, { method: 'POST' }),
  markAttendance: (lectureId) => request('/attendance', { method: 'POST', body: JSON.stringify({ lectureId }) }),
};
