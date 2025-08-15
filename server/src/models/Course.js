import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: String,
  totalLectures: Number,
  totalAssignments: Number,
  totalQuizzes: { type: Number, default: 0 },
}, { timestamps: true });

export const Course = mongoose.model('Course', courseSchema);
