import { darkColors, lightColors, type ColorScheme } from '../../../../core/theme/colors';
import type { CardNetwork, PassTheme } from '../../types';

export interface CardGradient {
  from: string;
  to: string;
  glow: string;
}

const CARD_GRADIENTS: Record<CardNetwork, CardGradient> = {
  visa: { from: '#1D2F7A', to: '#3F83F8', glow: 'rgba(63,131,248,0.5)' },
  mastercard: { from: '#262B33', to: '#59616E', glow: 'rgba(110,118,132,0.45)' },
  other: { from: '#3A4356', to: '#6B7280', glow: 'rgba(107,114,128,0.4)' },
};

const PASS_GRADIENTS: Record<PassTheme, CardGradient> = {
  ocean: { from: '#3F7DF4', to: '#2B2B9E', glow: 'rgba(63,125,244,0.45)' },
  sunset: { from: '#C55221', to: '#7A2E12', glow: 'rgba(197,82,33,0.45)' },
  forest: { from: '#16A34A', to: '#0B5C2A', glow: 'rgba(22,163,74,0.45)' },
};

export function cardGradientFor(network: CardNetwork): CardGradient {
  return CARD_GRADIENTS[network];
}

export function passGradientFor(theme: PassTheme): CardGradient {
  return PASS_GRADIENTS[theme];
}

export function cardInk(scheme: ColorScheme): string {
  return scheme === 'dark' ? darkColors.text : lightColors.text;
}
