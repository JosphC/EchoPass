import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { fontSizes, fontWeights, spacing } from '../../core/theme';
import { t } from '../../core/i18n';
import { useTheme } from '../../core/theme/useTheme';
import { ChevronLeft } from '../ChevronLeft/ChevronLeft';

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
          <Pressable accessibilityRole="button" accessibilityLabel={t('a11y.back')} onPress={onBack} style={styles.back}>
            <View style={styles.backIcon}>
              <ChevronLeft size={22} />
            </View>
          </Pressable>
        ) : null}
        <View style={styles.titles}>
          <Text style={[styles.title, { color: colors.text }, centered && styles.centered]}>{title}</Text>
          {subtitle ? <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text> : null}
        </View>
        {right ? <View style={styles.side}>{right}</View> : null}
        {actionLabel && onAction ? (
          <Pressable accessibilityRole="button" accessibilityLabel={actionLabel} onPress={onAction} style={styles.action}>
            <Text style={[styles.actionLabel, { color: colors.primary }]}>{actionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  back: {
    width: 44,
    height: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
    flexShrink: 0,
  },
  backIcon: {
    // Optical correction: the thin glyph renders with side bearings;
    // pull it flush with the content edge (e.g. "Ieri" below).
    marginLeft: -12,
  },
  titles: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    fontSize: 24,
    fontWeight: fontWeights.bold,
    letterSpacing: -0.4,
  },
  centered: {
    textAlign: 'center',
  },
  side: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
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
