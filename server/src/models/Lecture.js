import mongoose from 'mongoose';

const lectureSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  title: String,
  startTime: Date,
  duration: Number, // minutes
  recordingUrl: String,
}, { timestamps: true });

export const Lecture = mongoose.model('Lecture', lectureSchema);
