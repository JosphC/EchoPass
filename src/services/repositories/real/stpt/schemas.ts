import { z } from 'zod';

const stptVehicleSchema = z.object({
  id: z.string().min(1),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  route: z.string().min(1),
  headsign: z.string().min(1),
  stop: z.string().min(1),
  speed: z.number().min(0),
  timestamp: z.number().positive(),
  routeId: z.string().min(1),
});

const stptEnvelopeSchema = z.object({
  success: z.literal(true),
  data: z.object({
    vehicles: z.array(stptVehicleSchema),
    age_seconds: z.number().min(0),
    is_stale: z.boolean(),
  }),
});

export type StptVehicle = z.infer<typeof stptVehicleSchema>;
export type StptEnvelope = z.infer<typeof stptEnvelopeSchema>;

export function parseStptEnvelope(json: unknown): StptEnvelope {
  return stptEnvelopeSchema.parse(json);
}
