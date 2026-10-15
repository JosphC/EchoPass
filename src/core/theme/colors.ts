export interface AppColors {
  primary: string;
  primaryDark: string;
  primarySoft: string;
  secondary: string;
  amber: string;
  success: string;
  warning: string;
  danger: string;
  surface: string;
  background: string;
  card: string;
  searchBar: string;
  chip: string;
  text: string;
  textMuted: string;
  border: string;
  cream: string;
  burntOrange: string;
  /** Text/icons on primary or status-colored backgrounds. */
  onPrimary: string;
  /** Soft neutral fill: inputs, secondary buttons, pressed rows. */
  fill: string;
  /** Disabled button background. */
  fillDisabled: string;
  placeholder: string;
  /** Sheet drag handle. */
  handle: string;
  /** Planner connector rail between origin and destination. */
  rail: string;
  /** Modal backdrop. */
  scrim: string;
  shadow: string;
  warningSoft: string;
  warningBorder: string;
  warningText: string;
  dangerSoft: string;
  successSoft: string;
  accentSoft: string;
}

export const lightColors: AppColors = {
  primary: '#3F7DF4',
  primaryDark: '#2F5FD0',
  primarySoft: '#EAF1FE',
  secondary: '#C55221',
  amber: '#CC8800',
  success: '#16A34A',
  warning: '#D97706',
  danger: '#DC2626',
  surface: '#FFFFFF',
  background: '#F4F6FB',
  card: '#FFFFFF',
  searchBar: '#FFFFFF',
  chip: '#FFFFFF',
  text: '#111827',
  textMuted: '#6B7280',
  border: '#E5E7EB',
  cream: '#FFF8EC',
  burntOrange: '#C55221',
  onPrimary: '#FFFFFF',
  fill: '#F1F5F9',
  fillDisabled: '#E2E8F0',
  placeholder: '#94A3B8',
  handle: '#DADCE0',
  rail: '#BFDBFE',
  scrim: 'rgba(17, 24, 39, 0.45)',
  shadow: '#0F172A',
  warningSoft: '#FFFBEB',
  warningBorder: '#FDE68A',
  warningText: '#92400E',
  dangerSoft: '#FEF2F2',
  successSoft: '#ECFDF5',
  accentSoft: '#F3E8FF',
} as const;

export const darkColors: AppColors = {
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  primarySoft: '#1E293B',
  secondary: '#E07B4A',
  amber: '#E0A800',
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
  surface: '#1E1E1E',
  background: '#121212',
  card: '#202124',
  searchBar: '#303030',
  chip: '#1F1F1F',
  text: '#FFFFFF',
  textMuted: '#9AA0A6',
  border: '#3C4043',
  cream: '#1E1E1E',
  burntOrange: '#E07B4A',
  onPrimary: '#FFFFFF',
  fill: '#303134',
  fillDisabled: '#303134',
  placeholder: '#9AA0A6',
  handle: '#5F6368',
  rail: '#5F6368',
  scrim: 'rgba(0, 0, 0, 0.6)',
  shadow: '#000000',
  warningSoft: '#262214',
  warningBorder: '#785A18',
  warningText: '#FBBF24',
  dangerSoft: 'rgba(239, 68, 68, 0.18)',
  successSoft: 'rgba(34, 197, 94, 0.15)',
  accentSoft: 'rgba(168, 85, 247, 0.18)',
} as const;

export type ColorScheme = 'light' | 'dark';
