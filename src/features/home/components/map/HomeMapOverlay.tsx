import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { t } from '../../../../core/i18n';
import { useTheme } from '../../../../core/theme/useTheme';
import { searchAllPlaces, searchLocalPlaces, type LatLng, type LocationPlace, type Station } from '../../../map';
import { StationResults } from '../../../map/components/overlays/StationResults';
import type { MapMode } from '../../../map/components/overlays/StationBar';
import { BleSimulationBar } from '../../../ride';
import { HomeDirectionsHeader } from './HomeDirectionsHeader';
import type { PlaceOrStation } from '../planner/PlannerCard';
import type { SheetViewMode } from './HomeBottomSheet';
import { styles } from './homeMapStyles';

interface HomeMapOverlayProps {
  station: Station | null;
  mode: MapMode;
  sheetMode: SheetViewMode;
  userName: string | null;
  origin: PlaceOrStation | null;
  destination: PlaceOrStation | null;
  onMode: (mode: MapMode) => void;
  onPickStation: (station: Station) => void;
  onPickDestination: (place: LocationPlace) => void;
  onClear: () => void;
  onNotifications: () => void;
  onOriginChange: (place: PlaceOrStation | null, coords: LatLng | null) => void;
  onDestinationChange: (place: PlaceOrStation | null) => void;
  onSwap: () => void;
  onCloseDirections: () => void;
  onLocateOrigin: () => void;
  locating?: boolean;
  onSearchRoute?: () => void;
  onHeaderHeightChange?: (height: number) => void;
  /** Bumped by the parent when the map is tapped: hides suggestions (Google Maps behaviour). */
  dismissSearchSignal?: number;
}

const MODES: { mode: MapMode; icon: keyof typeof Ionicons.glyphMap; activeIcon: keyof typeof Ionicons.glyphMap }[] = [
  { mode: 'stations', icon: 'location-outline', activeIcon: 'location-sharp' },
  { mode: 'vehicles', icon: 'bus-outline', activeIcon: 'bus' },
  { mode: 'favorites', icon: 'star-outline', activeIcon: 'star' },
];

function modeLabel(mode: MapMode): string {
  return mode === 'vehicles' ? t('live.vehiclesTab') : mode === 'favorites' ? t('live.favorites') : t('live.stations');
}

export function HomeMapOverlay({
  station,
  mode,
  sheetMode,
  userName,
  origin,
  destination,
  onMode,
  onPickStation,
  onPickDestination,
  onClear,
  onNotifications,
  onOriginChange,
  onDestinationChange,
  onSwap,
  onCloseDirections,
  onLocateOrigin,
  locating,
  onSearchRoute,
  onHeaderHeightChange,
  dismissSearchSignal = 0,
}: HomeMapOverlayProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [results, setResults] = useState<(Station | LocationPlace)[]>([]);
  const inputRef = useRef<TextInput | null>(null);

  // Tapping the map dismisses suggestions (text is kept, like Google Maps).
  const firstSignal = useRef(true);
  useEffect(() => {
    if (firstSignal.current) {
      firstSignal.current = false;
      return;
    }
    inputRef.current?.blur();
    setFocused(false);
  }, [dismissSearchSignal]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setResults(searchLocalPlaces(q));
    if (q.length < 3) return;

    const ctrl = new AbortController();
    const timer = setTimeout(() => {
      void searchAllPlaces(q, ctrl.signal).then((all) => {
        if (!ctrl.signal.aborted && all.length > 0) setResults(all);
      });
    }, 350);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [query]);

  const showResults = focused && query.trim().length >= 2;
  const initial = userName ? userName.charAt(0).toUpperCase() : 'U';

  function handlePick(next: any): void {
    setQuery('');
    setFocused(false);
    inputRef.current?.blur();
    if ('station' in next && next.station) {
      onPickStation(next.station);
    } else if ('lines' in next) {
      onPickStation(next);
    } else if ('kind' in next && next.kind === 'station') {
      onPickStation({ id: next.id, name: next.name, lat: next.lat, lng: next.lng, lines: [] });
    } else {
      onPickDestination(next);
    }
  }

  function handleClear(): void {
    setQuery('');
    if (query === '') onClear();
  }

  if (sheetMode === 'planner') {
    return (
      <View style={[styles.topOverlayFullBleed, { paddingTop: insets.top + 4 }]} pointerEvents="box-none">
        <HomeDirectionsHeader
          origin={origin}
          destination={destination}
          onOriginChange={onOriginChange}
          onDestinationChange={onDestinationChange}
          onSwap={onSwap}
          onBack={onCloseDirections}
          onLocateOrigin={onLocateOrigin}
          locating={locating}
          onSearch={onSearchRoute}
          onHeightChange={onHeaderHeightChange}
        />
      </View>
    );
  }

  return (
    <View style={[styles.topOverlay, { top: insets.top + 4 }]} pointerEvents="box-none">
      {/* Google Maps style floating search pill */}
      <View style={[styles.searchBar, { backgroundColor: colors.card }]} pointerEvents="auto">
        <Ionicons name="search-outline" size={21} color={colors.textMuted} />
        <TextInput
          ref={inputRef}
          value={query}
          onChangeText={setQuery}
          placeholder={t('home.searchAll')}
          placeholderTextColor={colors.textMuted}
          returnKeyType="search"
          style={[styles.searchField, { color: colors.text }]}
          onFocus={() => setFocused(true)}
        />
        {query !== '' || station ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Șterge" onPress={handleClear} hitSlop={8}>
            <Ionicons name="close-circle" size={19} color={colors.textMuted} />
          </Pressable>
        ) : (
          <Ionicons name="mic-outline" size={20} color={colors.textMuted} />
        )}
        <Pressable accessibilityRole="button" accessibilityLabel="Profil" onPress={onNotifications} style={[styles.avatarBtn, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>{initial}</Text>
        </Pressable>
      </View>

      {showResults ? <StationResults results={results} onPick={handlePick} floating /> : null}

      {/* Google Maps style horizontally scrollable category chips */}
      {!showResults ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.chipsRow}
          pointerEvents="box-none"
        >
          {MODES.map((m) => {
            const active = m.mode === mode;
            return (
              <Pressable
                key={m.mode}
                accessibilityRole="button"
                onPress={() => onMode(m.mode)}
                style={[
                  styles.chip,
                  { backgroundColor: active ? colors.primary : colors.card },
                ]}
              >
                <Ionicons name={active ? m.activeIcon : m.icon} size={16} color={active ? '#FFFFFF' : colors.text} />
                <Text style={[styles.chipLabel, { color: active ? '#FFFFFF' : colors.text }]}>{modeLabel(m.mode)}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : null}

      <BleSimulationBar />
    </View>
  );
}
