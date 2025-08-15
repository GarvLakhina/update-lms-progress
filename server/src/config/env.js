import dotenv from 'dotenv';
dotenv.config();

const config = {
  port: process.env.PORT || 4000,
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lms',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  presentWindowMinutes: parseInt(process.env.PRESENT_WINDOW_MINUTES || '10', 10),
  recordedCompletePercent: parseInt(process.env.RECORDED_COMPLETE_PERCENT || '80', 10),
};

export default Object.freeze(config);
