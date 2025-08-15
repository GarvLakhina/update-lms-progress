import express from 'express';
import { markAttendance } from '../../services/attendance.js';
const router = express.Router();

// POST /attendance { lectureId, status? }
router.post('/', async (req, res) => {
  const userId = req.userId;

  const { lectureId, status } = req.body;
  if (!lectureId) return res.status(400).json({ error: 'lectureId required' });

  try {
    const result = await markAttendance({ userId, lectureId, status });
    res.json({ ok: true, ...result });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
