import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { t } from '../../../../core/i18n';
import { fontSizes, fontWeights, spacing } from '../../../../core/theme';
import { useTheme } from '../../../../core/theme/useTheme';
import { useLiveMap, type LatLng, type LocationPlace, type Station } from '../../../../features/map';
import { planTransit, type DestinationTarget, type TransitOption } from '../../../../features/planner';
import { RouteOptionRow } from './RouteOptionRow';

interface RouteOptionsProps {
  options?: TransitOption[];
  origin: Station | LocationPlace | null;
  originCoords: LatLng | null;
  destination: Station | LocationPlace;
  onOpen: (option: TransitOption) => void;
  hideTitle?: boolean;
  selectedId?: string | null;
  onSelect?: (option: TransitOption) => void;
}

export interface GroupedOption {
  option: TransitOption;
  /** Other lines doing the same stops in the same time (Google: "14 / 18 / M14"). */
  altLines: string[];
}

/**
 * Merges direct options that differ only by line (same stops, same walk/ride
 * minutes); the first one — the fastest, options come sorted — leads the row.
 */
export function groupSameStops(options: TransitOption[]): GroupedOption[] {
  const groups = new Map<string, GroupedOption>();
  options.forEach((option, i) => {
    const key = option.transferStation
      ? `single-${i}`
      : [option.boardStation.id, option.alightStation.id, ...option.legs.map((l) => `${l.kind}${l.minutes}`)].join('|');
    const group = groups.get(key);
    if (group) group.altLines.push(option.line);
    else groups.set(key, { option, altLines: [] });
  });
  return [...groups.values()];
}

/** Real transit options: walk to the stop, ride, transfer when needed, walk to destination. */
export function RouteOptions({
  options: optionsProp,
  origin,
  originCoords,
  destination,
  onOpen,
  hideTitle,
  selectedId,
  onSelect,
}: RouteOptionsProps) {
  const { colors } = useTheme();
  const { allMarkers } = useLiveMap();
  const [activeId, setActiveId] = useState<string | null>(null);

  const originStation = origin && 'station' in origin && origin.station ? origin.station : (origin && 'lines' in origin ? origin : null);
  const originCoord = originCoords ?? (origin ? { lat: origin.lat, lng: origin.lng } : null);

  const destStation = 'station' in destination && destination.station ? destination.station : ('lines' in destination ? destination : null);
  const destTarget: DestinationTarget = destStation ?? {
    station: null,
    coords: { lat: destination.lat, lng: destination.lng },
    name: destination.name,
  };

  const computedOptions = planTransit({ station: originStation, coords: originCoord, name: origin?.name }, destTarget, allMarkers);
  const options = optionsProp && optionsProp.length > 0 ? optionsProp : computedOptions;
  if (options.length === 0) return null;

  const currentSelectedId = selectedId ?? activeId;

  return (
    <View style={styles.section}>
      {!hideTitle && <Text style={[styles.heading, { color: colors.text }]}>{t('home.routes')}</Text>}
      <View style={styles.list}>
        {groupSameStops(options).map(({ option, altLines }, i) => {
          const isSelected = currentSelectedId ? currentSelectedId === option.id : i === 0;
          return (
            <RouteOptionRow
              key={option.id}
              option={option}
              altLines={altLines}
              index={i}
              selected={isSelected}
              onPress={() => {
                setActiveId(option.id);
                onSelect?.(option);
                onOpen(option);
              }}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
  },
  heading: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semiBold,
  },
  list: {
    gap: 10,
  },
});
