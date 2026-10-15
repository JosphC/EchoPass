import { Pressable, StyleSheet, Text, View } from 'react-native';
import { fontSizes, fontWeights, spacing } from '../../core/theme';
import { useTheme } from '../../core/theme/useTheme';

interface EmptyStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  testID?: string;
}

export function EmptyState({ title, message, actionLabel, onAction, testID }: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <View testID={testID} style={styles.root}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.message, { color: colors.textMuted }]}>{message}</Text>
      {actionLabel && onAction ? (
        <Pressable accessibilityRole="button" accessibilityLabel={actionLabel} onPress={onAction} style={styles.action}>
          <Text style={[styles.actionLabel, { color: colors.primary }]}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.lg,
  },
  title: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semiBold,
    textAlign: 'center',
  },
  message: {
    fontSize: fontSizes.sm,
    textAlign: 'center',
  },
  action: {
    minHeight: 44,
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
  },
});
