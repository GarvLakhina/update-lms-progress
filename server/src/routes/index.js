import express from 'express';
import dashboardRouter from './modules/dashboard.js';
import attendanceRouter from './modules/attendance.js';
import assignmentsRouter from './modules/assignments.js';
import notificationsRouter from './modules/notifications.js';
import { requireUser } from '../middleware/user.js';

export function registerRoutes(app, io) {
  // attach io for routes that need to emit
  app.use((req, res, next) => {
    req.io = io;
    next();
  });

  // Protect API with simple user header for MVP
  app.use(requireUser);

  app.use('/dashboard', dashboardRouter);
  app.use('/attendance', attendanceRouter);
  app.use('/assignments', assignmentsRouter);
  app.use('/notifications', notificationsRouter);
}
