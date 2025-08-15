import express from 'express';
import { Assignment } from '../../models/Assignment.js';
import { Course } from '../../models/Course.js';
import { UserAssignment } from '../../models/UserAssignment.js';
import { recomputeAndSaveProgress } from '../../services/progress.js';
const router = express.Router();

// POST /assignments/:id/submit
router.post('/:id/submit', async (req, res) => {
  const userId = req.userId;

  const { id } = req.params;
  const assignment = await Assignment.findById(id).lean();
  if (!assignment) return res.status(404).json({ error: 'Assignment not found' });

  await UserAssignment.findOneAndUpdate(
    { userId, assignmentId: id },
    { $set: { status: 'submitted', submittedAt: new Date() } },
    { upsert: true }
  );

  await recomputeAndSaveProgress(userId, assignment.courseId);
  res.json({ ok: true, assignmentId: id });
});

export default router;
