import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lectureId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lecture' },
  status: { type: String, enum: ['present', 'late', 'absent', 'completed'] },
}, { timestamps: true });

export const Attendance = mongoose.model('Attendance', attendanceSchema);
