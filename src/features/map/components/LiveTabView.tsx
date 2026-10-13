import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { t } from '../../../core/i18n';
import { spacing } from '../../../core/theme';
import { ReportFab } from '../../reports';
import type { useLiveMap } from '../hooks/useLiveMap';
import type { Station } from '../stations';
import { LiveMapPanel } from './map/LiveMapPanel';
import { LiveOverlays } from './overlays/LiveOverlays';
import { LiveSummary } from './overlays/LiveSummary';
import { LocateButton } from './overlays/LocateButton';
import { ScheduleSheet } from './overlays/sheets/ScheduleSheet';
import { StationBar, type MapMode } from './overlays/StationBar';

interface LiveTabViewProps {
  live: ReturnType<typeof useLiveMap>;
  onNotifications: () => void;
}

/** Full map screen: floating search + chips over the map, FABs, bottom sheet. */
export function LiveTabView({ live, onNotifications }: LiveTabViewProps) {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<MapMode>('stations');
  const [sheetH, setSheetH] = useState(0);
  const [summaryH, setSummaryH] = useState(0);
  const markers =
    mode === 'vehicles' ? live.allMarkers : mode === 'favorites' ? (live.tracked ? [live.tracked] : []) : live.markers;
  const count = markers.length;
  const title = live.station ? live.station.name : t('live.city');
  const unit = live.station ? t('live.trolleys') : t('live.vehicles');
  const reportLine = live.selected?.bus.line ?? live.tracked?.bus.line ?? live.line;
  const trackedId = live.tracked?.bus.id ?? null;
  const sheetHeight = (live.station ? sheetH : summaryH) || 160;
  const showEmpty = mode === 'favorites' ? live.tracked === null : !live.isLoading && live.line !== null && count === 0;

  function handleMode(next: MapMode): void {
    setMode(next);
    if (next !== 'stations') live.pickStation(null);
  }

  function handlePickStation(next: Station): void {
    setMode('stations');
    live.pickStation(next);
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.mapWrap}>
        <LiveMapPanel
          markers={markers}
          station={live.station}
          selectedId={live.selected?.bus.id ?? null}
          followed={live.tracked}
          located={live.located}
          onSelect={live.select}
          onLocated={live.locate}
          popup={live.selected}
          popupTracked={trackedId === live.selected?.bus.id}
          onTrackPopup={() => live.track(trackedId === live.selected?.bus.id ? null : (live.selected?.bus.id ?? null))}
          onClosePopup={() => live.select(null)}
        />
        <StationBar
          station={live.station}
          mode={mode}
          onMode={handleMode}
          onOpen={live.openSheet}
          onClear={() => live.pickStation(null)}
          onPickStation={handlePickStation}
          onNotifications={onNotifications}
        />
        <LocateButton onPress={() => void live.locate()} />
      </View>
      <LiveOverlays
        showEmpty={showEmpty}
        emptyText={mode === 'favorites' ? t('live.noFavorites') : undefined}
        sheetOpen={live.sheetOpen}
        onCloseSheet={live.closeSheet}
        onPickStation={live.pickStation}
      />
      {live.station ? (
        <ScheduleSheet
          station={live.station}
          arrivals={live.arrivals}
          selectedLine={live.line}
          onPickLine={live.pickLine}
          onClearStation={() => live.pickStation(null)}
          onHeight={setSheetH}
        />
      ) : (
        <LiveSummary title={title} subtitle={`${count} ${unit}`} onHeight={setSummaryH} />
      )}
      <ReportFab line={reportLine} bottomOffset={sheetHeight + spacing.lg} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  mapWrap: {
    flex: 1,
  },
});
