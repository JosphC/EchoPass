import { useColorScheme } from 'react-native';
import { darkColors, lightColors, type AppColors, type ColorScheme } from './colors';
import { radius } from './radius';
import { spacing } from './spacing';
import { fontFamilies, fontSizes, fontWeights } from './typography';
import { useThemeStore } from './themeStore';

export function useTheme(): { colors: AppColors; scheme: ColorScheme } {
  const system = useColorScheme() ?? 'light';
  const preference = useThemeStore((state) => state.preference);
  const scheme: ColorScheme = preference === 'system' ? system : preference;
  const colors = scheme === 'dark' ? darkColors : lightColors;
  return { colors, scheme };
}

export const theme = {
  lightColors,
  darkColors,
  spacing,
  radius,
  fontSizes,
  fontWeights,
  fontFamilies,
};
