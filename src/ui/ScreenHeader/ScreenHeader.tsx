import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { fontSizes, fontWeights, spacing } from '../../core/theme';
import { useTheme } from '../../core/theme/useTheme';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  actionLabel?: string;
  onAction?: () => void;
  centered?: boolean;
  right?: ReactNode;
}

export function ScreenHeader({ title, subtitle, onBack, actionLabel, onAction, centered = false, right }: ScreenHeaderProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.root}>
      <View style={styles.row}>
        {onBack ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={onBack} style={styles.back}>
            <Text style={[styles.backGlyph, { color: colors.text }]}>{'<'}</Text>
          </Pressable>
        ) : null}
        <View style={styles.titles}>
          <Text style={[styles.title, { color: colors.text }, centered && styles.centered]}>{title}</Text>
          {subtitle ? <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text> : null}
        </View>
        {right ? <View style={styles.side}>{right}</View> : null}
        {actionLabel && onAction ? (
          <Pressable accessibilityRole="button" onPress={onAction} style={styles.action}>
            <Text style={[styles.actionLabel, { color: colors.primary }]}>{actionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingVertical: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  back: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backGlyph: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
  },
  titles: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
  },
  centered: {
    textAlign: 'center',
  },
  side: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    fontSize: fontSizes.sm,
  },
  action: {
    minHeight: 44,
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semiBold,
  },
});
