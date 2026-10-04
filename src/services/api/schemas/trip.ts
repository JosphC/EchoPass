import { z } from 'zod';

export const savedRouteSchema = z.object({
  id: z.string().min(1),
  from: z.string().min(1),
  to: z.string().min(1),
  line: z.string().min(1),
});
export type SavedRoute = z.infer<typeof savedRouteSchema>;

export const recentTripSchema = z.object({
  id: z.string().min(1),
  from: z.string().min(1),
  to: z.string().min(1),
  date: z.string().date(),
  fareRon: z.number().min(0),
  distanceKm: z.number().min(0),
  durationMin: z.number().int().min(0),
});
export type RecentTrip = z.infer<typeof recentTripSchema>;
