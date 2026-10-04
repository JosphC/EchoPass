import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { t } from '../../src/core/i18n';
import { spacing } from '../../src/core/theme';
import { LiveMap, LiveOverlays, LiveSummary, StationBar, useLiveMap } from '../../src/features/map';

export default function LiveTab() {
  const insets = useSafeAreaInsets();
  const live = useLiveMap();
  const title = live.station ? live.station.name : t('live.city');
  const count = live.markers.length;
  const unit = live.station ? t('live.trolleys') : t('live.vehicles');

  return (
    <View style={[styles.root, { paddingTop: Math.max(insets.top, spacing.lg) }]}>
      <StationBar station={live.station} onOpen={live.openSheet} onClear={() => live.pickStation(null)} />
      <View style={styles.map}>
        <LiveMap
          markers={live.markers}
          station={live.station}
          selectedId={live.selected?.bus.id ?? null}
          followed={live.tracked}
          located={live.located}
          onSelect={live.select}
          onLocated={live.locate}
        />
      </View>
      <LiveOverlays
        showEmpty={!live.isLoading && count === 0}
        selected={live.selected}
        trackedId={live.tracked?.bus.id ?? null}
        sheetOpen={live.sheetOpen}
        onTrack={live.track}
        onSelect={live.select}
        onCloseSheet={live.closeSheet}
        onPickStation={live.pickStation}
      />
      <LiveSummary title={title} subtitle={`${count} ${unit}`} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});
