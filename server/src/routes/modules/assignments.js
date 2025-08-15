import express from 'express';
const router = express.Router();

// POST /assignments/:id/submit
router.post('/:id/submit', async (req, res) => {
  const userId = req.header('X-User-Id');
  if (!userId) return res.status(400).json({ error: 'X-User-Id header required' });

  const { id } = req.params;
  // TODO: mark assignment submitted for user and update progress, schedule/cancel notifications
  res.json({ ok: true, assignmentId: id });
});

export default router;
