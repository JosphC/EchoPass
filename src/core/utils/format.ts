import { getLocale, t } from '../i18n';
import { formatTransitTime } from './timezone';

export function formatRon(value: number): string {
  return `${value.toFixed(2)} lei`;
}

/** Locale-aware lei: virgulă în română ("3,00 lei"). */
export function formatLei(value: number): string {
  const fixed = value.toFixed(2);
  return `${getLocale() === 'ro' ? fixed.replace('.', ',') : fixed} lei`;
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

const MONTHS_RO = ['ian', 'feb', 'mar', 'apr', 'mai', 'iun', 'iul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Group stamp: "5 oct" (ro) / "Oct 5" (en). Date-only input, UTC-safe. */
export function formatDayMonth(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  const months = getLocale() === 'ro' ? MONTHS_RO : MONTHS_EN;
  const month = months[d.getUTCMonth()] ?? '';
  return getLocale() === 'ro' ? `${d.getUTCDate()} ${month}` : `${month} ${d.getUTCDate()}`;
}

/** Wall-clock HH:MM on Timișoara's clock ("19:24"), like the printed timetable. */
export function formatTime(iso: string): string {
  return formatTransitTime(new Date(iso).getTime());
}

/** Card-style stamp: "24 Mar · 07:42". */
export function formatShortDateTime(iso: string): string {
  const d = new Date(iso);
  const months = getLocale() === 'ro' ? MONTHS_RO : MONTHS_EN;
  const day = d.getUTCDate();
  const time = iso.slice(11, 16);
  return `${day} ${months[d.getUTCMonth()]} · ${time}`;
}
