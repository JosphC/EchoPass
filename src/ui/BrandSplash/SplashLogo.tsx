import { useEffect } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { SplashBusSvg, playSplashLoop, stopSplashLoop } from './SplashBusSvg';

// ── Compatibilitate cu implementarile anterioare ──────────────────────────────
// Păstrate ca exporturi depreciate; animația curentă e bucla de loading de
// 3 s din cycle.ts (bara 0→100%, puls consumat/redesenat, shine, bun venit).
/** @deprecated */
export const WAVE_D =
  'M40 122 H80 L88 105 L96 136 L104 122 H114 ' +
  'L121 82 L130 158 L139 122 H149 ' +
  'L155 106 L161 134 L167 122 H200';
/** @deprecated */
export const WAVE_TOTAL = 380;
/** @deprecated */
export const PULSE_LEN = 64;

const SIZE = 150;

interface SplashLogoProps {
  size?: number;
  testID?: string;
}

/**
 * Sigla animată: autobuz față cu bucla de loading, în reluare.
 * Wrapper autonom (își pornește propria buclă); pentru ecranul complet
 * cu text + progres folosiți `BrandSplash`.
 */
export function SplashLogo({ size = SIZE, testID = 'brand-splash-logo' }: SplashLogoProps) {
  const cyc = useSharedValue(0);
  const { width: winW } = useWindowDimensions();
  const resolved = Math.min(size, winW * 0.42, 170);

  useEffect(() => {
    playSplashLoop(cyc);
    return () => {
      stopSplashLoop(cyc);
    };
  }, [cyc]);

  return (
    <View style={[styles.box, { height: resolved, width: resolved }]}>
      <SplashBusSvg cyc={cyc} size={resolved} testID={testID} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    height: SIZE,
    width: SIZE,
  },
});
