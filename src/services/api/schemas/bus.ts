import { z } from 'zod';

export const crowdLevelSchema = z.union([z.literal(1), z.literal(2), z.literal(3)]);
export type CrowdLevel = z.infer<typeof crowdLevelSchema>;

export const busSchema = z.object({
  id: z.string().min(1),
  line: z.string().min(1),
  destination: z.string().min(1),
  crowd: crowdLevelSchema,
  delayMin: z.number().int().min(0),
  delayReason: z.string().nullable(),
});
export type Bus = z.infer<typeof busSchema>;

export const busPositionSchema = z.object({
  busId: z.string().min(1),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  nextStop: z.string().min(1),
  arrivesInMin: z.number().int().min(0),
  updatedAt: z.string().datetime(),
  speedKmh: z.number().min(0).optional(),
});
export type BusPosition = z.infer<typeof busPositionSchema>;
