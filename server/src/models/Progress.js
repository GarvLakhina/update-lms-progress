import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  progressPercentage: { type: Number, default: 0 },
}, { timestamps: true, indexes: [{ fields: { userId: 1, courseId: 1 }, options: { unique: true } }] });

progressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export const Progress = mongoose.model('Progress', progressSchema);
