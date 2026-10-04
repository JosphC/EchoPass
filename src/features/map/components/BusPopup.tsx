import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { t } from '../../../core/i18n';
import { fontSizes, fontWeights, radius, spacing } from '../../../core/theme';
import { useTheme } from '../../../core/theme/useTheme';
import { Button } from '../../../ui';
import type { BusMarker } from '../hooks/useLiveMap';

interface BusPopupProps {
  marker: BusMarker;
  tracked: boolean;
  onTrack: () => void;
  onClose: () => void;
}

export function BusPopup({ marker, tracked, onTrack, onClose }: BusPopupProps) {
  const { colors } = useTheme();
  const { bus, position } = marker;
  const status =
    position && position.arrivesInMin > 0
      ? `${t('live.arrivingIn')} ${position.arrivesInMin} ${t('common.min')}`
      : t('live.arrived');

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.primary }]}>
      <PressableClose onClose={onClose} />
      <View style={styles.row}>
        <Ionicons name="location-outline" size={20} color={colors.primary} />
        <Text style={[styles.text, { color: colors.text }]}>
          {t('live.nowAt')} {position ? position.nextStop : bus.destination}
        </Text>
      </View>
      <View style={styles.row}>
        <Ionicons name="time-outline" size={20} color={colors.primary} />
        <Text style={[styles.text, { color: colors.text }]}>{status}</Text>
      </View>
      <Button title={tracked ? t('live.tracking') : t('live.track')} onPress={onTrack} />
    </View>
  );
}

function PressableClose({ onClose }: { onClose: () => void }) {
  const { colors } = useTheme();
  return (
    <View style={styles.closeRow}>
      <Text onPress={onClose} style={[styles.close, { color: colors.textMuted }]}>
        ×
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
  closeRow: {
    alignItems: 'flex-end',
    marginBottom: -spacing.sm,
  },
  close: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    minWidth: 32,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  text: {
    flex: 1,
    fontSize: fontSizes.md,
  },
});
