import express from 'express';
const router = express.Router();

// POST /attendance { lectureId, status? }
router.post('/', async (req, res) => {
  const userId = req.header('X-User-Id');
  if (!userId) return res.status(400).json({ error: 'X-User-Id header required' });

  const { lectureId, status } = req.body;
  if (!lectureId) return res.status(400).json({ error: 'lectureId required' });

  // TODO: mark attendance and update progress
  res.json({ ok: true });
});

export default router;
