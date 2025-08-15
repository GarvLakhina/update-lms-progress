import cron from 'node-cron';

export function registerCronJobs(io) {
  // Every minute placeholder (replace with real schedules later)
  cron.schedule('* * * * *', async () => {
    // TODO: check deadlines and emit notifications
    // io.to(`user:${userId}`).emit('notification', payload)
  });
}
