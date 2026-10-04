import { Pressable, StyleSheet, Text, View } from 'react-native';
import { t } from '../../../core/i18n';
import { fontSizes, fontWeights, radius, spacing } from '../../../core/theme';
import { useTheme } from '../../../core/theme/useTheme';
import type { Station } from '../stations';

interface StationBarProps {
  station: Station | null;
  onOpen: () => void;
  onClear: () => void;
}

/** Top overlay: open the station picker, or show the active filter with clear. */
export function StationBar({ station, onOpen, onClear }: StationBarProps) {
  const { colors } = useTheme();

  if (!station) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onOpen}
        style={[styles.pill, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        <Text style={[styles.label, { color: colors.text }]}>{t('live.stations')}</Text>
      </Pressable>
    );
  }

  return (
    <View style={[styles.pill, styles.active, { backgroundColor: colors.primary }]}>
      <Text numberOfLines={1} style={[styles.label, styles.onPrimary]}>
        {station.name}
      </Text>
      <Pressable accessibilityRole="button" accessibilityLabel={t('live.clearFilter')} onPress={onClear} style={styles.clear}>
        <Text style={[styles.label, styles.onPrimary, styles.bold]}>×</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    maxWidth: '85%',
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    minHeight: 44,
  },
  active: {
    borderWidth: 0,
  },
  label: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
  },
  onPrimary: {
    color: '#FFFFFF',
  },
  bold: {
    fontWeight: fontWeights.bold,
    fontSize: fontSizes.lg,
  },
  clear: {
    minWidth: 32,
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
