import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  title: String,
  dueDate: Date,
}, { timestamps: true });

export const Assignment = mongoose.model('Assignment', assignmentSchema);
