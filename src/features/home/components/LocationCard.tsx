import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { t } from '../../../core/i18n';
import { fontSizes, fontWeights, radius, spacing } from '../../../core/theme';
import { useTheme } from '../../../core/theme/useTheme';

interface LocationCardProps {
  onPick: () => void;
}

const ICON_SIZE = 22;

export function LocationCard({ onPick }: LocationCardProps) {
  const { colors } = useTheme();
  const [swapped, setSwapped] = useState(false);
  const first = swapped ? t('home.to') : t('home.from');
  const second = swapped ? t('home.from') : t('home.to');

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={styles.main}>
        <View style={styles.column}>
          <Pressable accessibilityRole="button" onPress={onPick} style={styles.row}>
            <Ionicons name="radio-button-on-outline" size={ICON_SIZE} color={colors.primary} />
            <Text style={[styles.origin, { color: colors.primary }]}>{first}</Text>
          </Pressable>
          <View style={styles.middle}>
            <View style={styles.dashCol}>
              <View style={[styles.dash, { borderColor: colors.textMuted }]} />
            </View>
            <View style={[styles.divider, { borderBottomColor: colors.border }]} />
          </View>
          <Pressable accessibilityRole="button" onPress={onPick} style={styles.row}>
            <Ionicons name="location-outline" size={ICON_SIZE} color={colors.primary} />
            <Text style={[styles.destination, { color: colors.text }]}>{second}</Text>
          </Pressable>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Swap"
          onPress={() => setSwapped((s) => !s)}
          style={styles.swap}
        >
          <Ionicons name="swap-vertical" size={ICON_SIZE} color={colors.text} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    padding: spacing.lg,
  },
  main: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  column: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 44,
  },
  origin: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.regular,
  },
  destination: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.regular,
  },
  middle: {
    flexDirection: 'row',
    alignItems: 'stretch',
    height: 18,
  },
  dashCol: {
    width: ICON_SIZE,
    alignItems: 'center',
  },
  dash: {
    flex: 1,
    borderLeftWidth: 2,
    borderStyle: 'dashed',
  },
  divider: {
    flex: 1,
    marginLeft: spacing.md,
    alignSelf: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  swap: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
