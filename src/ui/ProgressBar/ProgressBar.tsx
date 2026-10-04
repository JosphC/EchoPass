import { StyleSheet, View } from 'react-native';
import { radius } from '../../core/theme';
import { useTheme } from '../../core/theme/useTheme';

interface ProgressBarProps {
  value: number;
  testID?: string;
}

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

export function ProgressBar({ value, testID }: ProgressBarProps) {
  const { colors } = useTheme();
  const pct = clamp01(value);

  return (
    <View
      testID={testID}
      accessibilityRole="progressbar"
      accessibilityValue={{ now: Math.round(pct * 100), min: 0, max: 100 }}
      style={[styles.track, { backgroundColor: colors.border }]}
    >
      <View style={[styles.fill, { width: `${pct * 100}%`, backgroundColor: colors.primary }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 8,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.full,
  },
});
