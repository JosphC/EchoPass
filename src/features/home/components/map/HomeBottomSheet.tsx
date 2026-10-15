import { Animated, Pressable, ScrollView, View, type GestureResponderHandlers, type StyleProp, type ViewStyle } from 'react-native';
import { t } from '../../../../core/i18n';
import { useTheme } from '../../../../core/theme/useTheme';
import type { LatLng, Station } from '../../../map';
import type { TransitOption } from '../../../planner';
import { ArrivalsBoard } from '../arrivals/ArrivalsBoard';
import type { PlaceOrStation } from '../planner/PlannerCard';
import { RouteOptionRow } from '../planner/RouteOptionRow';
import { groupSameStops, RouteOptions } from '../planner/RouteOptions';
import { TimetableNotice } from '../TimetableNotice';
import { styles } from './homeMapStyles';

export type SheetViewMode = 'station' | 'planner';

/** Google Maps snap points: 0 = peek, 1 = half, 2 = full. */
export type SheetSnapIndex = 0 | 1 | 2;

interface HomeBottomSheetProps {
  sheetMode: SheetViewMode;
  station: Station;
  coords: LatLng | null;
  onSelectStation: (station: Station) => void;
  onDirections: () => void;
  onTrackBus: (busId: string) => void;
  origin: PlaceOrStation | null;
  destination: PlaceOrStation | null;
  searched: { from: PlaceOrStation; to: PlaceOrStation } | null;
  originCoords: LatLng | null;
  onOpenOption: (option: TransitOption) => void;
  onHeightChange?: (height: number) => void;
  selectedOptionId?: string | null;
  onSelectOption?: (option: TransitOption) => void;
  routeOptions?: TransitOption[];
  // Draggable sheet wiring (Google Maps behaviour). Optional so tests
  // rendering without animation still work.
  sheetStyle?: Animated.WithAnimatedValue<StyleProp<ViewStyle>>;
  panHandlers?: GestureResponderHandlers;
  snapIndex?: SheetSnapIndex;
  onSnapChange?: (snap: SheetSnapIndex) => void;
}

export function HomeBottomSheet({
  sheetMode,
  station,
  coords,
  onSelectStation,
  onDirections,
  onTrackBus,
  origin,
  destination,
  searched,
  originCoords,
  onOpenOption,
  onHeightChange,
  selectedOptionId,
  onSelectOption,
  routeOptions,
  sheetStyle,
  panHandlers,
  snapIndex = 0,
  onSnapChange,
}: HomeBottomSheetProps) {
  const { colors } = useTheme();

  const activeOrigin = searched?.from ?? origin;
  const activeDest = searched?.to ?? destination;

  const selectedOption =
    routeOptions?.find((o) => o.id === selectedOptionId) ?? routeOptions?.[0] ?? null;
  const selectedAlt = groupSameStops(routeOptions ?? []).find((g) => g.option.id === selectedOption?.id)?.altLines;

  // Peek shows a single preview row (Google Maps place card style);
  // half/full reveal the scrollable list.
  const listOpen = snapIndex >= 1;
  const fullyOpen = snapIndex >= 2;

  function cycleSnap(): void {
    if (!onSnapChange) return;
    onSnapChange(snapIndex === 0 ? 1 : snapIndex === 1 ? 2 : 0);
  }

  return (
    <Animated.View
      onLayout={(e) => {
        const h = e.nativeEvent.layout.height;
        if (h > 0) onHeightChange?.(h);
      }}
      style={[
        styles.bottomSheet,
        { backgroundColor: colors.card },
        sheetStyle,
      ]}
    >
      {/* Drag handle: swipe up/down like Google Maps, tap cycles peek/half/full */}
      <View {...(panHandlers ?? {})}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            snapIndex === 0 ? t('a11y.expandSheet') : snapIndex === 1 ? t('a11y.expandFull') : t('a11y.collapseSheet')
          }
          onPress={cycleSnap}
          style={styles.sheetHandleHit}
        >
          <View style={[styles.sheetHandle, { backgroundColor: colors.handle }]} />
        </Pressable>
      </View>

      {sheetMode === 'planner' ? (
        <View style={styles.sheetContent}>
          {activeOrigin && activeDest ? (
            listOpen ? (
              <ScrollView
                style={[styles.plannerScroll, fullyOpen ? { maxHeight: '100%' } : undefined]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 24 }}
              >
                <RouteOptions
                  hideTitle
                  options={routeOptions}
                  origin={activeOrigin}
                  originCoords={originCoords}
                  destination={activeDest}
                  onOpen={onOpenOption}
                  selectedId={selectedOptionId}
                  onSelect={onSelectOption}
                />
              </ScrollView>
            ) : selectedOption ? (
              <View style={styles.peekWrapper}>
                <RouteOptionRow
                  option={selectedOption}
                  altLines={selectedAlt}
                  index={0}
                  selected
                  onPress={() => onSnapChange?.(1)}
                />
              </View>
            ) : null
          ) : null}
        </View>
      ) : (
        <ScrollView
          style={styles.sheetScroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          <TimetableNotice />
          <ArrivalsBoard
            flat
            station={station}
            coords={coords}
            onSelectStation={onSelectStation}
            onDirections={onDirections}
            onTrackBus={onTrackBus}
          />
        </ScrollView>
      )}
    </Animated.View>
  );
}
