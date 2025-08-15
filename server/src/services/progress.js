// Progress calculation and recompute service
import { Attendance } from '../models/Attendance.js';
import { Assignment } from '../models/Assignment.js';
import { Course } from '../models/Course.js';
import { Lecture } from '../models/Lecture.js';
import { Progress } from '../models/Progress.js';
import { UserAssignment } from '../models/UserAssignment.js';

export function calculateCourseProgress({ lecturesAttended, totalLectures, assignmentsCompleted, totalAssignments, quizzesCompleted, totalQuizzes }) {
  const lecturesPart = (totalLectures ? lecturesAttended / totalLectures : 0) * 0.5;
  const assignmentsPart = (totalAssignments ? assignmentsCompleted / totalAssignments : 0) * 0.3;
  const quizzesPart = (totalQuizzes ? quizzesCompleted / totalQuizzes : 0) * 0.2;
  const pct = Math.round((lecturesPart + assignmentsPart + quizzesPart) * 100);
  return Math.max(0, Math.min(100, pct));
}

export async function recomputeAndSaveProgress(userId, courseId) {
  const course = await Course.findById(courseId).lean();
  if (!course) return null;

  const lectureIds = await Lecture.find({ courseId }, { _id: 1 }).lean();
  const lectureIdList = lectureIds.map(l => l._id);

  const attendedCount = await Attendance.countDocuments({
    userId,
    lectureId: { $in: lectureIdList.length ? lectureIdList : [null] },
    status: { $in: ['present', 'late', 'completed'] },
  });

  const assignmentIds = await Assignment.find({ courseId }, { _id: 1 }).lean();
  const assignmentIdList = assignmentIds.map(a => a._id);

  const submittedCount = await UserAssignment.countDocuments({
    userId,
    assignmentId: { $in: assignmentIdList.length ? assignmentIdList : [null] },
    status: 'submitted',
  });

  const pct = calculateCourseProgress({
    lecturesAttended: attendedCount,
    totalLectures: course.totalLectures || lectureIdList.length || 0,
    assignmentsCompleted: submittedCount,
    totalAssignments: course.totalAssignments || assignmentIdList.length || 0,
    quizzesCompleted: 0,
    totalQuizzes: course.totalQuizzes || 0,
  });

  const doc = await Progress.findOneAndUpdate(
    { userId, courseId },
    { $set: { progressPercentage: pct } },
    { upsert: true, new: true }
  );
  return doc;
}

