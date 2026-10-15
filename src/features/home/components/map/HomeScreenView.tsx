import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Animated, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { pushPlanRoute } from '../../navigation';
import { useRoutePlanner } from '../../hooks/useRoutePlanner';
import { useRoutePreview } from '../../hooks/useRoutePreview';
import { useSheetDrag } from '../../hooks/useSheetDrag';
import {
  LiveMapPanel,
  LocateButton,
  makeUserLocationPlace,
  resolveUserLocationPlace,
  useLiveMap,
  type LocationPlace,
  type MapMode,
  type Station,
} from '../../../map';
import { useWalletItems } from '../../../wallet';
import { HomeBottomSheet, type SheetSnapIndex, type SheetViewMode } from './HomeBottomSheet';
import { HomeMapOverlay } from './HomeMapOverlay';
import { styles } from './homeMapStyles';

export function HomeScreenView() {
  const router = useRouter();
  const live = useLiveMap();
  const items = useWalletItems().items;
  const holder = items.find((i) => i.kind === 'card')?.holder.split(' ')[0] ?? null;
  const sheet = useSheetDrag();
  const insets = useSafeAreaInsets();

  const [mapMode, setMapMode] = useState<MapMode>('stations');
  const [sheetMode, setSheetMode] = useState<SheetViewMode>('station');
  const [headerHeight, setHeaderHeight] = useState(130);
  const [centerTrigger, setCenterTrigger] = useState(0);
  const [dismissSearch, setDismissSearch] = useState(0);
  const { sheetHeight } = sheet;

  // Total top obstruction = status bar inset + header card height, so the
  // fitted route never slides under the header (Google Maps behaviour).
  const headerObstruction = headerHeight + insets.top + 4;

  const routeEdgePadding = useMemo(
    () => ({
      top: Math.max(150, headerObstruction + 12),
      right: 48,
      bottom: Math.max(200, sheetHeight + 24),
      left: 48,
    }),
    [headerObstruction, sheetHeight],
  );

  // Keeps Google Maps controls (compass, logo) visible above the sheet.
  // In explore mode the header is the floating search (~120px tall).
  const mapPadding = useMemo(
    () => ({
      top: sheetMode === 'planner' ? headerObstruction : insets.top + 124,
      right: 0,
      bottom: sheetHeight,
      left: 0,
    }),
    [sheetMode, headerObstruction, insets.top, sheetHeight],
  );

  const {
    origin,
    originCoords,
    destination,
    searched,
    changeOrigin,
    changeDestination,
    swap,
    openNotifications,
  } = useRoutePlanner(live.pickStation, {
    plan: (from, to, option, c, dc) => pushPlanRoute(router, from, to, option, c, dc),
    notifications: () => router.push('/notifications'),
  });

  const routePreview = useRoutePreview({
    origin,
    originCoords,
    destination,
    markers: live.allMarkers,
    active: sheetMode === 'planner',
  });

  const markers =
    mapMode === 'vehicles'
      ? live.allMarkers
      : mapMode === 'favorites'
        ? (live.tracked ? [live.tracked] : [])
        : live.markers;

  const trackedId = live.tracked?.bus.id ?? null;

  function handleMode(next: MapMode): void {
    setMapMode(next);
    if (next !== 'stations') live.pickStation(null);
  }

  // Map dot taps open the stop's schedule half-way (snap 1); search picks peek.
  function handlePickStation(st: Station, snap: SheetSnapIndex = 0): void {
    setMapMode('stations');
    setSheetMode('station');
    live.pickStation(st);
    sheet.snapTo(snap);
  }

  function handleDirections(): void {
    const dest = live.arrivalStation;
    if (!dest) return;
    changeDestination(dest);
    changeOrigin(makeUserLocationPlace(live.coords), live.coords);
    setSheetMode('planner');
    sheet.snapTo(1);
    if (live.coords) void resolveUserLocationPlace(live.coords).then((real) => changeOrigin(real, live.coords));
  }

  function handlePickDestination(place: LocationPlace): void {
    changeDestination(place);
    changeOrigin(makeUserLocationPlace(live.coords), live.coords);
    setSheetMode('planner');
    sheet.snapTo(1);
    if (live.coords) void resolveUserLocationPlace(live.coords).then((real) => changeOrigin(real, live.coords));
  }

  async function handleLocateOrigin(): Promise<void> {
    await live.locate();
    if (live.coords) {
      changeOrigin(makeUserLocationPlace(live.coords), live.coords);
      const real = await resolveUserLocationPlace(live.coords);
      changeOrigin(real, live.coords);
    }
  }

  async function handleLocate(): Promise<void> {
    await live.locate();
    setCenterTrigger((prev) => prev + 1);
  }

  function handleSearchRoute(): void {
    if (origin && destination) {
      setSheetMode('planner');
      sheet.snapTo(1);
    }
  }

  // Google Maps: tapping empty map dismisses the vehicle card (not the sheet)
  // and collapses the search suggestions (text is kept).
  function handleMapPress(): void {
    if (live.selected) live.select(null);
    setDismissSearch((prev) => prev + 1);
  }

  return (
    <View style={styles.root}>
      <View style={styles.mapLayer}>
        <LiveMapPanel
          markers={markers}
          station={routePreview.selectedOption?.boardStation ?? live.station}
          highlightStation={live.arrivalStation}
          selectedId={live.selected?.bus.id ?? null}
          followed={live.tracked}
          located={live.located}
          onSelect={live.select}
          onLocated={live.locate}
          onMapPress={handleMapPress}
          onStationPress={(st) => handlePickStation(st, 1)}
          popup={live.selected}
          popupTracked={trackedId === live.selected?.bus.id}
          onTrackPopup={() => live.track(trackedId === live.selected?.bus.id ? null : (live.selected?.bus.id ?? null))}
          onClosePopup={() => live.select(null)}
          centerTrigger={centerTrigger}
          userCoords={live.coords}
          extraStations={routePreview.extraStations}
          routeSegments={routePreview.routeSegments}
          routeFitCoords={routePreview.routeFitCoords}
          originPin={routePreview.originPin}
          destPin={routePreview.destPin}
          routeEdgePadding={routeEdgePadding}
          mapPadding={mapPadding}
          bottomOffset={sheetHeight}
        />
      </View>

      <HomeMapOverlay
        station={live.station}
        mode={mapMode}
        sheetMode={sheetMode}
        userName={holder}
        origin={origin}
        destination={destination}
        onMode={handleMode}
        onPickStation={handlePickStation}
        onPickDestination={handlePickDestination}
        onClear={() => live.pickStation(null)}
        onNotifications={openNotifications}
        onOriginChange={changeOrigin}
        onDestinationChange={changeDestination}
        onSwap={swap}
        onCloseDirections={() => {
          setSheetMode('station');
          sheet.snapTo(0);
        }}
        onLocateOrigin={() => void handleLocateOrigin()}
        onSearchRoute={handleSearchRoute}
        onHeaderHeightChange={setHeaderHeight}
        dismissSearchSignal={dismissSearch}
      />

      {/* Follows the sheet's animated height, so it never sinks under the sheet. */}
      <Animated.View style={[styles.locateWrap, { bottom: Animated.add(sheet.sheetAnim, 14) }]}>
        <LocateButton active={live.located} onPress={() => void handleLocate()} style={styles.locateInline} />
      </Animated.View>

      <HomeBottomSheet
        sheetMode={sheetMode}
        station={live.arrivalStation}
        coords={live.coords}
        onSelectStation={handlePickStation}
        onDirections={handleDirections}
        onTrackBus={(busId) => live.track(busId)}
        origin={origin}
        destination={destination}
        searched={searched}
        originCoords={originCoords}
        onOpenOption={(opt) => routePreview.selectOption(opt)}
        selectedOptionId={routePreview.selectedOption?.id}
        onSelectOption={(opt) => routePreview.selectOption(opt)}
        routeOptions={routePreview.options}
        onHeightChange={(h) => {
          // First mount / font scaling only; drag animation drives the rest.
          if (Math.abs(h - sheetHeight) > 4 && sheet.snapIndex === 0 && h < sheet.peekHeight + 120) {
            sheet.setSheetHeight(h);
          }
        }}
        sheetStyle={{ height: sheet.sheetAnim }}
        panHandlers={sheet.sheetPan.panHandlers}
        snapIndex={sheet.snapIndex}
        onSnapChange={sheet.snapTo}
      />
    </View>
  );
}
