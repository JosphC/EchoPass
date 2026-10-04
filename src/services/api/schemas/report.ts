import { z } from 'zod';

export const reportKindSchema = z.enum(['traffic', 'accident', 'breakdown', 'works', 'crowding', 'detour']);
export type ReportKind = z.infer<typeof reportKindSchema>;

export const reportSchema = z.object({
  id: z.string().min(1),
  kind: reportKindSchema,
  line: z.string().min(1),
  stopName: z.string().min(1),
  confirmations: z.number().int().min(0),
  expiresAt: z.string().datetime(),
});
export type Report = z.infer<typeof reportSchema>;

export function isConfirmed(report: Pick<Report, 'confirmations'>, threshold: number): boolean {
  return report.confirmations >= threshold;
}
