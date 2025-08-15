import mongoose from 'mongoose';

const userAssignmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment' },
  status: { type: String, enum: ['pending', 'submitted'], default: 'pending' },
  submittedAt: Date,
}, { timestamps: true });

userAssignmentSchema.index({ userId: 1, assignmentId: 1 }, { unique: true });

export const UserAssignment = mongoose.model('UserAssignment', userAssignmentSchema);
