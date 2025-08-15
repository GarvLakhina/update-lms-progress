import express from 'express';
import dayjs from 'dayjs';
import { User } from '../../models/User.js';
import { Lecture } from '../../models/Lecture.js';
import { Assignment } from '../../models/Assignment.js';
import { Progress } from '../../models/Progress.js';
import { Notification } from '../../models/Notification.js';
const router = express.Router();

router.get('/', async (req, res) => {
  const userId = req.userId;

  const user = await User.findById(userId).lean();
  if (!user) return res.status(404).json({ error: 'User not found' });

  const now = dayjs();
  const soon = now.add(7, 'day').toDate();

  const progress = await Progress.find({ userId }).lean();

  const upcomingLectures = await Lecture.find({
    courseId: { $in: user.enrolledCourses || [] },
    startTime: { $gte: now.toDate(), $lte: soon },
  }).sort({ startTime: 1 }).lean();

  const upcomingAssignments = await Assignment.find({
    courseId: { $in: user.enrolledCourses || [] },
    dueDate: { $gte: now.toDate(), $lte: soon },
  }).sort({ dueDate: 1 }).lean();

  const notificationsUnread = await Notification.countDocuments({ userId, read: false });

  res.json({ progress, upcomingLectures, upcomingAssignments, notificationsUnread });
});

export default router;
