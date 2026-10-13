import { StyleSheet, Text, View } from 'react-native';
import { fontSizes, fontWeights, radius, spacing } from '../../../../core/theme';
import { useTheme } from '../../../../core/theme/useTheme';

interface LiveSummaryProps {
  title: string;
  subtitle: string;
  onHeight?: (height: number) => void;
}

export function LiveSummary({ title, subtitle, onHeight }: LiveSummaryProps) {
  const { colors } = useTheme();

  return (
    <View onLayout={(event) => onHeight?.(event.nativeEvent.layout.height)} style={[styles.sheet, { backgroundColor: colors.card }]}>
      <View style={[styles.handle, { backgroundColor: colors.border }]} />
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.xs,
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: radius.full,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semiBold,
  },
  subtitle: {
    fontSize: fontSizes.sm,
  },
});
