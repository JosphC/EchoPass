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
  text: string;
  textMuted: string;
  border: string;
  cream: string;
  burntOrange: string;
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
  text: '#111827',
  textMuted: '#6B7280',
  border: '#E5E7EB',
  cream: '#FFF8EC',
  burntOrange: '#C55221',
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
  text: '#FFFFFF',
  textMuted: '#9AA0A6',
  border: '#3C4043',
  cream: '#1E1E1E',
  burntOrange: '#E07B4A',
} as const;

export type ColorScheme = 'light' | 'dark';
