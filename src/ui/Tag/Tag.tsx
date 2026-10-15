import { StyleSheet, Text, View } from 'react-native';
import { fontSizes, fontWeights, radius, spacing } from '../../core/theme';
import { useTheme } from '../../core/theme/useTheme';

export type TagTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

interface TagProps {
  label: string;
  tone?: TagTone;
}

export function Tag({ label, tone = 'neutral' }: TagProps) {
  const { colors } = useTheme();
  const bg =
    tone === 'info'
      ? colors.primary
      : tone === 'success'
        ? colors.success
        : tone === 'warning'
          ? colors.warning
          : tone === 'danger'
            ? colors.danger
            : colors.border;
  const fg = tone === 'neutral' ? colors.text : colors.onPrimary;

  return (
    <View style={[styles.root, { backgroundColor: bg }]}>
      <Text style={[styles.label, { color: fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  label: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semiBold,
  },
});
