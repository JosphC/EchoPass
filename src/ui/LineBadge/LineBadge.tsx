import { StyleSheet, Text, View } from 'react-native';
import { fontSizes, fontWeights, radius, spacing } from '../../core/theme';
import { lineColor } from '../../core/theme/lineColors';
import { contrastText } from '../../core/utils/contrast';

interface LineBadgeProps {
  shortName: string;
  color?: string;
  textColor?: string;
  testID?: string;
  size?: 'sm' | 'md' | 'lg';
}

/** The one line badge used app-wide: official color, palette fallback. */
export function LineBadge({ shortName, color, textColor, testID, size = 'sm' }: LineBadgeProps) {
  const bg = color ?? lineColor(shortName);
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  return (
    <View
      testID={testID}
      style={[
        styles.badge,
        isSm ? styles.badgeSm : isLg ? styles.badgeLg : styles.badgeMd,
        { backgroundColor: bg },
      ]}
    >
      <Text
        numberOfLines={1}
        style={[
          styles.text,
          isSm ? styles.textSm : isLg ? styles.textLg : styles.textMd,
          { color: textColor ?? contrastText(bg) },
        ]}
      >
        {shortName}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeSm: {
    minWidth: 28,
    height: 22,
    paddingHorizontal: 6,
  },
  badgeMd: {
    minWidth: 38,
    height: 32,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
  },
  badgeLg: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
  },
  text: {
    fontWeight: fontWeights.bold,
  },
  textSm: {
    fontSize: 12,
    letterSpacing: -0.2,
  },
  textMd: {
    fontSize: fontSizes.sm,
  },
  textLg: {
    fontSize: 18,
  },
});
