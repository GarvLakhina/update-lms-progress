import mongoose from 'mongoose';
import dayjs from 'dayjs';
import config from '../config/env.js';
import { User } from '../models/User.js';
import { Course } from '../models/Course.js';
import { Lecture } from '../models/Lecture.js';
import { Assignment } from '../models/Assignment.js';
import { UserAssignment } from '../models/UserAssignment.js';

async function main() {
  await mongoose.connect(config.mongoUri);
  console.log('Connected to Mongo');

  // Clean minimal related data for repeatable seed
  await Promise.all([
    User.deleteMany({ email: 'student1@example.com' }),
  ]);

  const course = await Course.create({
    title: 'Intro to Node.js',
    totalLectures: 10,
    totalAssignments: 5,
    totalQuizzes: 0,
  });

  const user = await User.create({
    name: 'Student One',
    email: 'student1@example.com',
    role: 'student',
    enrolledCourses: [course._id],
  });

  // Lectures: one in 15 minutes, one just ended, one in 2 days
  const now = dayjs();
  const lectures = await Lecture.insertMany([
    {
      courseId: course._id,
      title: 'Live Lecture: Event Loop',
      startTime: now.add(15, 'minute').toDate(),
      duration: 60,
    },
    {
      courseId: course._id,
      title: 'Live Lecture: Streams',
      startTime: now.subtract(90, 'minute').toDate(),
      duration: 60,
    },
    {
      courseId: course._id,
      title: 'Live Lecture: Cluster',
      startTime: now.add(2, 'day').toDate(),
      duration: 60,
    },
  ]);

  // Assignments: due in 1h and 24h
  const assignments = await Assignment.insertMany([
    { courseId: course._id, title: 'HW1: Basics', dueDate: now.add(1, 'hour').toDate() },
    { courseId: course._id, title: 'HW2: Express', dueDate: now.add(24, 'hour').toDate() },
  ]);

  // Create pending UserAssignment rows
  for (const a of assignments) {
    await UserAssignment.updateOne(
      { userId: user._id, assignmentId: a._id },
      { $setOnInsert: { status: 'pending' } },
      { upsert: true }
    );
  }

  console.log('Seeded:');
  console.log(' userId:', String(user._id));
  console.log(' courseId:', String(course._id));
  console.log(' lectures:', lectures.map(l => ({ id: String(l._id), title: l.title, startTime: l.startTime })));
  console.log(' assignments:', assignments.map(a => ({ id: String(a._id), title: a.title, dueDate: a.dueDate })));

  await mongoose.disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
