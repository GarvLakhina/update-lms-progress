import cron from 'node-cron';
import dayjs from 'dayjs';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Assignment } from '../models/Assignment.js';
import { Lecture } from '../models/Lecture.js';
import { Attendance } from '../models/Attendance.js';
import { createNotification } from '../services/notifications.js';

export function registerCronJobs(io) {
  // Run every minute to simulate real-time reminders
  cron.schedule('* * * * *', async () => {
    const now = dayjs();

    // Assignment reminders: 24h and 1h before due
    const in24hStart = now.add(24, 'hour').startOf('minute').toDate();
    const in24hEnd = now.add(24, 'hour').endOf('minute').toDate();
    const in1hStart = now.add(1, 'hour').startOf('minute').toDate();
    const in1hEnd = now.add(1, 'hour').endOf('minute').toDate();

    const assignments24h = await Assignment.find({ dueDate: { $gte: in24hStart, $lte: in24hEnd } }).lean();
    const assignments1h = await Assignment.find({ dueDate: { $gte: in1hStart, $lte: in1hEnd } }).lean();

    const courseIds24h = [...new Set(assignments24h.map(a => String(a.courseId)))];
    const courseIds1h = [...new Set(assignments1h.map(a => String(a.courseId)))];

    const users = await User.find({
      $or: [
        { enrolledCourses: { $in: courseIds24h.map(id => new mongoose.Types.ObjectId(id)) } },
        { enrolledCourses: { $in: courseIds1h.map(id => new mongoose.Types.ObjectId(id)) } },
      ],
    }).lean();

    // Map courseId -> users
    const usersByCourse = new Map();
    for (const u of users) {
      for (const cid of u.enrolledCourses || []) {
        const key = String(cid);
        if (!usersByCourse.has(key)) usersByCourse.set(key, []);
        usersByCourse.get(key).push(u);
      }
    }

    // Create notifications
    for (const a of assignments24h) {
      const list = usersByCourse.get(String(a.courseId)) || [];
      for (const u of list) {
        await createNotification(io, {
          userId: u._id,
          type: 'assignment',
          message: `Assignment "${a.title}" due in 24h`,
          scheduledTime: new Date(),
        });
      }
    }
    for (const a of assignments1h) {
      const list = usersByCourse.get(String(a.courseId)) || [];
      for (const u of list) {
        await createNotification(io, {
          userId: u._id,
          type: 'assignment',
          message: `Assignment "${a.title}" due in 1h`,
          scheduledTime: new Date(),
        });
      }
    }

    // Lecture start reminders: 15 minutes before
    const in15Start = now.add(15, 'minute').startOf('minute').toDate();
    const in15End = now.add(15, 'minute').endOf('minute').toDate();
    const lecturesSoon = await Lecture.find({ startTime: { $gte: in15Start, $lte: in15End } }).lean();
    const lectureCourseIds = [...new Set(lecturesSoon.map(l => String(l.courseId)))];
    const usersForLectures = await User.find({ enrolledCourses: { $in: lectureCourseIds.map(id => new mongoose.Types.ObjectId(id)) } }).lean();
    const usersByCourse2 = new Map();
    for (const u of usersForLectures) {
      for (const cid of u.enrolledCourses || []) {
        const key = String(cid);
        if (!usersByCourse2.has(key)) usersByCourse2.set(key, []);
        usersByCourse2.get(key).push(u);
      }
    }
    for (const l of lecturesSoon) {
      const list = usersByCourse2.get(String(l.courseId)) || [];
      for (const u of list) {
        await createNotification(io, {
          userId: u._id,
          type: 'lecture',
          message: `Lecture "${l.title}" starts in 15 minutes`,
          scheduledTime: new Date(),
        });
      }
    }

    // Missed lecture: mark absent if no attendance after end
    const endedStart = now.subtract(5, 'minute').toDate();
    const endedEnd = now.toDate();
    const justEnded = await Lecture.find({
      startTime: { $lte: endedEnd },
      // end = start + duration
    }).lean();
    for (const l of justEnded) {
      const endAt = dayjs(l.startTime).add(l.duration || 60, 'minute');
      if (endAt.isAfter(now) || endAt.isBefore(dayjs(endedStart))) continue; // only if ended in last ~5m

      const enrolled = await User.find({ enrolledCourses: new mongoose.Types.ObjectId(String(l.courseId)) }).lean();
      for (const u of enrolled) {
        const hasAttendance = await Attendance.findOne({ userId: u._id, lectureId: l._id }).lean();
        if (!hasAttendance) {
          await Attendance.create({ userId: u._id, lectureId: l._id, status: 'absent' });
          await createNotification(io, {
            userId: u._id,
            type: 'lecture',
            message: `You missed lecture "${l.title}"`,
            scheduledTime: new Date(),
          });
        }
      }
    }
  });
}
