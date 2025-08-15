import express from 'express';
import { getUserNotifications, markNotificationRead } from '../../services/notifications.js';
const router = express.Router();

// GET /notifications
router.get('/', async (req, res) => {
  const userId = req.userId;
  const data = await getUserNotifications(userId);
  res.json(data);
});

// PATCH /notifications/:id/read
router.patch('/:id/read', async (req, res) => {
  const { id } = req.params;
  await markNotificationRead(req.userId, id);
  res.json({ ok: true, id });
});

export default router;
