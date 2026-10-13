import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { t } from '../../../../core/i18n';
import { fontSizes, fontWeights, radius, spacing } from '../../../../core/theme';
import { useTheme } from '../../../../core/theme/useTheme';
import { Button, LineBadge } from '../../../../ui';
import type { BusMarker } from '../../hooks/useLiveMap';

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
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <PressableClose onClose={onClose} />
      <View style={styles.row}>
        <Ionicons name="bus" size={20} color={colors.text} />
        <LineBadge shortName={bus.line} />
        <Text style={[styles.text, { color: colors.text }]}>
          Linia {bus.line}
        </Text>
      </View>
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
      <View style={styles.trackRow}>
        <View style={styles.trackBtn}>
          <Button pill title={tracked ? t('live.tracking') : t('live.track')} onPress={onTrack} />
        </View>
      </View>
    </View>
  );
}

function PressableClose({ onClose }: { onClose: () => void }) {
  const { colors } = useTheme();
  return (
    <View style={styles.closeRow}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close"
        onPress={onClose}
        hitSlop={8}
        style={styles.closeHit}
      >
        <Text style={[styles.close, { color: colors.textMuted }]}>×</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.lg,
    gap: spacing.md,
    elevation: 3,
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  closeRow: {
    alignItems: 'flex-end',
    marginBottom: -spacing.sm,
  },
  close: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    textAlign: 'center',
  },
  closeHit: {
    minWidth: 32,
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
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
  trackRow: {
    alignItems: 'center',
  },
  trackBtn: {
    minWidth: 140,
  },
});
