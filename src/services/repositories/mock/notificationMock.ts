import { seedNotifications } from './seed';
import type { NotificationRepo } from '../types';

export function createNotificationMock(): NotificationRepo {
  const read = new Set<string>();
  return {
    getNotifications: async () => seedNotifications.map((n) => (read.has(n.id) ? { ...n, read: true } : n)),
    markRead: async (id) => {
      read.add(id);
    },
  };
}
