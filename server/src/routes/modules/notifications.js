import express from 'express';
const router = express.Router();

// GET /notifications
router.get('/', async (req, res) => {
  const userId = req.header('X-User-Id');
  if (!userId) return res.status(400).json({ error: 'X-User-Id header required' });

  // TODO: fetch notifications for user
  res.json({ items: [], unread: 0 });
});

// PATCH /notifications/:id/read
router.patch('/:id/read', async (req, res) => {
  const userId = req.header('X-User-Id');
  if (!userId) return res.status(400).json({ error: 'X-User-Id header required' });

  const { id } = req.params;
  // TODO: mark as read
  res.json({ ok: true, id });
});

export default router;
