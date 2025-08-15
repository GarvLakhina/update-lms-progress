import dayjs from 'dayjs';
import { Notification } from '../models/Notification.js';
import { emitToUser } from '../socket/index.js';

export async function createNotification(io, { userId, message, type = 'general', scheduledTime = new Date() }) {
  const doc = await Notification.create({ userId, message, type, scheduledTime, read: false });
  // emit immediately if time <= now
  if (dayjs(scheduledTime).isBefore(dayjs().add(1, 'minute'))) {
    emitToUser(io, String(userId), 'notification', { id: doc._id, message: doc.message, type: doc.type, createdAt: doc.createdAt });
  }
  return doc;
}

export async function getUserNotifications(userId, { limit = 50 } = {}) {
  const items = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(limit).lean();
  const unread = await Notification.countDocuments({ userId, read: false });
  return { items, unread };
}

export async function markNotificationRead(userId, id) {
  await Notification.updateOne({ _id: id, userId }, { $set: { read: true } });
}
