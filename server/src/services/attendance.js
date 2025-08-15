import dayjs from 'dayjs';
import config from '../config/env.js';
import { Attendance } from '../models/Attendance.js';
import { Lecture } from '../models/Lecture.js';
import { Course } from '../models/Course.js';
import { recomputeAndSaveProgress } from './progress.js';

export async function markAttendance({ userId, lectureId, status }) {
  const lecture = await Lecture.findById(lectureId).lean();
  if (!lecture) throw new Error('Lecture not found');

  let finalStatus = status;
  if (!finalStatus) {
    // infer based on time vs startTime
    const now = dayjs();
    const start = dayjs(lecture.startTime);
    const diffMin = now.diff(start, 'minute');
    if (diffMin <= config.presentWindowMinutes && diffMin >= 0) finalStatus = 'present';
    else if (diffMin > config.presentWindowMinutes && diffMin < (lecture.duration || 60)) finalStatus = 'late';
    else finalStatus = 'absent';
  }

  await Attendance.findOneAndUpdate(
    { userId, lectureId },
    { $set: { status: finalStatus } },
    { upsert: true }
  );

  const course = await Course.findById(lecture.courseId).lean();
  if (course) await recomputeAndSaveProgress(userId, course._id);

  return { status: finalStatus, courseId: lecture.courseId };
}
