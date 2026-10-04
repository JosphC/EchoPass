import { StyleSheet, View } from 'react-native';
import { radius, spacing } from '../../core/theme';
import { useTheme } from '../../core/theme/useTheme';

export type CrowdLevel = 1 | 2 | 3;

interface CrowdBarsProps {
  level: CrowdLevel;
  testID?: string;
}

const BAR_HEIGHTS = [8, 14, 20];

export function CrowdBars({ level, testID }: CrowdBarsProps) {
  const { colors } = useTheme();
  const active = level === 1 ? colors.success : level === 2 ? colors.warning : colors.danger;

  return (
    <View
      testID={testID}
      accessibilityRole="progressbar"
      accessibilityValue={{ now: level, min: 1, max: 3 }}
      style={styles.root}
    >
      {BAR_HEIGHTS.map((h, i) => (
        <View
          key={h}
          style={[styles.bar, { height: h, backgroundColor: i < level ? active : colors.border }]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.xs,
    minHeight: 44,
  },
  bar: {
    width: 8,
    borderRadius: radius.sm,
  },
});
