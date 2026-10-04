import { t } from '../i18n';

export function formatRon(value: number): string {
  return `${value.toFixed(2)} lei`;
}

export function formatMinutes(min: number): string {
  return `${Math.round(min)} min`;
}

/** Compact age: "9min", "2h", "3d". Future dates clamp to "0min". */
export function timeAgoShort(iso: string, nowMs: number = Date.now()): string {
  const diffMin = Math.max(0, Math.round((nowMs - new Date(iso).getTime()) / 60_000));
  if (diffMin < 60) return `${diffMin}${t('common.minShort')}`;
  const hours = Math.floor(diffMin / 60);
  if (hours < 24) return `${hours}${t('common.hourShort')}`;
  return `${Math.floor(hours / 24)}${t('common.dayShort')}`;
}
