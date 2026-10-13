import { z } from 'zod';

export const routeModeSchema = z.enum(['bus', 'tram', 'trolley']);
export type RouteMode = z.infer<typeof routeModeSchema>;

const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/);

export const routeSchema = z.object({
  id: z.string().min(1),
  shortName: z.string().min(1),
  color: hexColor.optional(),
  textColor: hexColor.optional(),
  mode: routeModeSchema.optional(),
});
export type Route = z.infer<typeof routeSchema>;

export const arrivalSchema = z
  .object({
    tripId: z.string().min(1),
    route: routeSchema,
    headsign: z.string().min(1),
    scheduledTime: z.string().datetime().nullable(),
    predictedTime: z.string().datetime().nullable(),
    isRealtime: z.boolean(),
    delayMin: z.number().int().min(0).optional(),
    busId: z.string().min(1).optional(),
  })
  .refine((a) => (a.isRealtime ? a.predictedTime !== null : true), {
    message: 'realtime arrivals must carry a predictedTime',
  });
export type Arrival = z.infer<typeof arrivalSchema>;

export const arrivalsQuerySchema = z.object({
  limit: z.number().int().min(1).max(50).default(10),
  windowMin: z.number().int().min(1).max(180).default(60),
});
export type ArrivalsQuery = z.infer<typeof arrivalsQuerySchema>;
