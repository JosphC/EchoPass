import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { t } from '../../../../core/i18n';
import { fontWeights, spacing } from '../../../../core/theme';
import { useTheme } from '../../../../core/theme/useTheme';
import type { Station } from '../../stations';
import { StationSearchBar } from './StationSearchBar';

export type MapMode = 'stations' | 'vehicles' | 'favorites';

interface StationBarProps {
  station: Station | null;
  mode: MapMode;
  onMode: (mode: MapMode) => void;
  onOpen: () => void;
  onClear: () => void;
  onPickStation: (station: Station) => void;
  onNotifications?: () => void;
}

const MODES: { mode: MapMode; icon: keyof typeof Ionicons.glyphMap; activeIcon: keyof typeof Ionicons.glyphMap }[] = [
  { mode: 'stations', icon: 'location-outline', activeIcon: 'location-sharp' },
  { mode: 'vehicles', icon: 'bus-outline', activeIcon: 'bus' },
  { mode: 'favorites', icon: 'star-outline', activeIcon: 'star' },
];

function modeLabel(mode: MapMode): string {
  if (mode === 'vehicles') return t('live.vehiclesTab');
  if (mode === 'favorites') return t('live.favorites');
  return t('live.stations');
}

/** Floating writable search + Stații/Vehicule/Favorite chips over the map. */
export function StationBar({ station, mode, onMode, onOpen, onClear, onPickStation, onNotifications }: StationBarProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <StationSearchBar station={station} onPickStation={onPickStation} onClear={onClear} onNotifications={onNotifications} />
      <View style={styles.chips} pointerEvents="box-none">
        {MODES.map((m) => {
          const active = m.mode === mode;
          return (
            <Pressable
              key={m.mode}
              accessibilityRole="button"
              onPress={() => {
                onMode(m.mode);
                if (m.mode === 'stations') onOpen();
              }}
              style={[styles.chip, { backgroundColor: active ? colors.primary : colors.card, borderColor: colors.border }]}
            >
              <Ionicons name={active ? m.activeIcon : m.icon} size={18} color={active ? '#FFFFFF' : colors.text} />
              <Text style={[styles.chipLabel, { color: active ? '#FFFFFF' : colors.text }]}>{modeLabel(m.mode)}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.lg,
    right: spacing.lg,
    gap: spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 19,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    minHeight: 38,
    elevation: 2,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  chipLabel: {
    fontSize: 14,
    fontWeight: fontWeights.semiBold,
  },
});
