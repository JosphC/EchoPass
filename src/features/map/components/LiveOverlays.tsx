import { StyleSheet, Text, View } from 'react-native';
import { t } from '../../../core/i18n';
import { useTheme } from '../../../core/theme/useTheme';
import type { BusMarker } from '../hooks/useLiveMap';
import type { Station } from '../stations';
import { BusPopup } from './BusPopup';
import { StationSheet } from './StationSheet';

interface LiveOverlaysProps {
  showEmpty: boolean;
  selected: BusMarker | null;
  trackedId: string | null;
  sheetOpen: boolean;
  onTrack: (id: string | null) => void;
  onSelect: (id: string | null) => void;
  onCloseSheet: () => void;
  onPickStation: (station: Station) => void;
}

export function LiveOverlays({
  showEmpty,
  selected,
  trackedId,
  sheetOpen,
  onTrack,
  onSelect,
  onCloseSheet,
  onPickStation,
}: LiveOverlaysProps) {
  const { colors } = useTheme();

  return (
    <>
      {showEmpty ? (
        <View style={[styles.empty, { backgroundColor: colors.card }]}>
          <Text style={{ color: colors.textMuted }}>{t('live.empty')}</Text>
        </View>
      ) : null}
      {selected ? (
        <View style={styles.popup}>
          <BusPopup
            marker={selected}
            tracked={trackedId === selected.bus.id}
            onTrack={() => onTrack(trackedId === selected.bus.id ? null : selected.bus.id)}
            onClose={() => onSelect(null)}
          />
        </View>
      ) : null}
      <StationSheet visible={sheetOpen} onClose={onCloseSheet} onPick={onPickStation} />
    </>
  );
}

const styles = StyleSheet.create({
  popup: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 150,
  },
  empty: {
    position: 'absolute',
    top: 170,
    alignSelf: 'center',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});
