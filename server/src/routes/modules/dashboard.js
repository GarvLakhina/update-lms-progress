import express from 'express';
const router = express.Router();

// Mock auth via X-User-Id for MVP
router.get('/', async (req, res) => {
  const userId = req.header('X-User-Id');
  if (!userId) return res.status(400).json({ error: 'X-User-Id header required' });

  // TODO: aggregate upcoming deadlines, lectures, and progress
  res.json({
    progress: [],
    upcomingLectures: [],
    upcomingAssignments: [],
    notificationsUnread: 0,
  });
});

export default router;
