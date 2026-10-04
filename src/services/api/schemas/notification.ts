import { z } from 'zod';

export const notificationKindSchema = z.enum(['delay', 'charge', 'crowding', 'cap', 'renewal']);
export type NotificationKind = z.infer<typeof notificationKindSchema>;

export const notificationSchema = z.object({
  id: z.string().min(1),
  kind: notificationKindSchema,
  title: z.string().min(1),
  body: z.string().min(1),
  createdAt: z.string().datetime(),
  read: z.boolean(),
});
export type AppNotification = z.infer<typeof notificationSchema>;
