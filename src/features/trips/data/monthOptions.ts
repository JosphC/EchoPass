import type { MonthOption } from '../components/TripsMonthHeader';

const RO_MONTHS = [
  'Ianuarie',
  'Februarie',
  'Martie',
  'Aprilie',
  'Mai',
  'Iunie',
  'Iulie',
  'August',
  'Septembrie',
  'Octombrie',
  'Noiembrie',
  'Decembrie',
];

/**
 * Returns options for current month and up to 3 past months (max 4 options).
 */
export function getRecentMonthOptions(referenceDate = new Date()): MonthOption[] {
  const options: MonthOption[] = [];
  const currentYear = referenceDate.getFullYear();
  const currentMonth = referenceDate.getMonth();

  for (let i = 0; i <= 3; i++) {
    const d = new Date(currentYear, currentMonth - i, 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const key = `${y}-${m}`;
    const name = RO_MONTHS[d.getMonth()] ?? '';
    const label = i === 0 ? `Luna aceasta (${name})` : `${name} ${y !== currentYear ? y : ''}`.trim();
    options.push({ key, label });
  }

  return options;
}

export function getMonthName(key: string): string {
  const parts = key.split('-');
  if (parts.length < 2) return key;
  const year = parts[0];
  const monthIdx = parseInt(parts[1], 10) - 1;
  const name = RO_MONTHS[monthIdx] ?? key;
  return `${name} ${year}`;
}
