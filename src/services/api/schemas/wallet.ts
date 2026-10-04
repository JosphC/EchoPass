import { z } from 'zod';

export const passSchema = z.object({
  id: z.string().min(1),
  holderName: z.string().min(1),
  email: z.string().email().optional(),
  validUntil: z.string().date(),
  daysLeft: z.number().int().min(0),
});
export type Pass = z.infer<typeof passSchema>;

export const paymentMethodSchema = z.object({
  id: z.string().min(1),
  brand: z.string().min(1),
  last4: z.string().length(4),
});
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;

export const chargeSchema = z.object({
  id: z.string().min(1),
  line: z.string().min(1),
  amountRon: z.number().min(0),
  chargedAt: z.string().datetime(),
  capped: z.boolean(),
});
export type Charge = z.infer<typeof chargeSchema>;

export const dailyCapSchema = z.object({
  limitRon: z.number().positive(),
  spentRon: z.number().min(0),
});
export type DailyCap = z.infer<typeof dailyCapSchema>;
