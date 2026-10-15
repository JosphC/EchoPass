import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { t } from '../../../../core/i18n';
import { useTheme } from '../../../../core/theme/useTheme';
import type { LatLng, LocationPlace, Station } from '../../../../features/map';
import { useLocateOrigin } from '../../hooks/useLocateOrigin';
import { departureLabel, DeparturePicker, type DepartureOption } from './DeparturePicker';
import { PlannerSuggestions } from './PlannerSuggestions';
import { StationField } from './StationField';
import { styles } from './plannerCardStyles';

export type PlaceOrStation = Station | LocationPlace;

interface PlannerCardProps {
  origin: PlaceOrStation | null;
  destination: PlaceOrStation | null;
  onOriginChange: (place: PlaceOrStation | null, coords: LatLng | null) => void;
  onDestinationChange: (place: PlaceOrStation | null) => void;
  onSwap: () => void;
  onSearchRoute: (origin: PlaceOrStation, destination: PlaceOrStation) => void;
}

type OpenField = 'origin' | 'dest' | null;

export function PlannerCard({
  origin,
  destination,
  onOriginChange,
  onDestinationChange,
  onSwap,
  onSearchRoute,
}: PlannerCardProps) {
  const { colors } = useTheme();
  const [open, setOpen] = useState<OpenField>(null);
  const [error, setError] = useState<string | null>(null);
  const { locating, error: locateError, setError: setLocateError, locate } = useLocateOrigin();
  const [departure, setDeparture] = useState<DepartureOption>({ mode: 'now', time: '' });
  const [sheetOpen, setSheetOpen] = useState(false);
  const [activeResults, setActiveResults] = useState<LocationPlace[]>([]);
  const [activeTyping, setActiveTyping] = useState(false);

  const swapAnim = useRef(new Animated.Value(0)).current;
  const rotationCount = useRef(0);

  function handleSwapPress(): void {
    rotationCount.current += 1;
    Animated.spring(swapAnim, {
      toValue: rotationCount.current,
      friction: 7,
      tension: 60,
      useNativeDriver: true,
    }).start();
    onSwap();
  }

  const spin = swapAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const valid = origin !== null && destination !== null && origin.id !== destination.id;
  const shownError = error ?? locateError;
  const iconColor = colors.text;

  async function locateOrigin(): Promise<void> {
    setError(null);
    const found = await locate();
    if (found) onOriginChange(found.station, found.coords);
  }

  function handlePick(place: LocationPlace): void {
    if (open === 'origin') onOriginChange(place, { lat: place.lat, lng: place.lng });
    else onDestinationChange(place);
    setActiveResults([]);
    setActiveTyping(false);
    setOpen(null);
    setError(null);
    setLocateError(null);
  }

  function search(): void {
    if (!valid) {
      setError(!destination ? t('home.chooseDestination') : !origin ? t('home.chooseOrigin') : t('home.pickDifferent'));
      return;
    }
    setError(null);
    onSearchRoute(origin, destination);
  }

  const searchLabel = valid
    ? t('home.searchRoutes')
    : !destination ? t('home.chooseDestination') : !origin ? t('home.chooseOrigin') : t('home.pickDifferent');

  const onFieldActivate = (field: OpenField) => {
    setOpen(field);
    setActiveResults([]);
    setActiveTyping(false);
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={styles.routeRow}>
        <View style={styles.trackColumn}>
          <View style={[styles.metroOrigin, { backgroundColor: colors.card, borderColor: colors.primary }]}>
            <View style={[styles.metroOriginDot, { backgroundColor: colors.primary }]} />
          </View>
          <View style={[styles.metroRail, { backgroundColor: colors.rail }]} />
          <View style={styles.metroDestWrap}>
            <Ionicons name="location-sharp" size={19} color={colors.danger} />
          </View>
        </View>

        <View style={styles.inputsColumn}>
          <StationField
            value={origin}
            placeholder={locating && !origin ? t('home.locating') : t('home.from')}
            active={open === 'origin'}
            renderResultsInline={false}
            onActivate={() => onFieldActivate('origin')}
            onPick={(s) => {
              onOriginChange(s, { lat: s.lat, lng: s.lng });
              setError(null);
              setLocateError(null);
              setOpen(null);
            }}
            onSearchStateChange={(state) => {
              if (open === 'origin') {
                setActiveResults(state.results);
                setActiveTyping(state.typing);
              }
            }}
            onClear={() => onOriginChange(null, null)}
            showLocate locating={locating} onLocate={() => void locateOrigin()}
          />
          <StationField
            value={destination}
            placeholder={t('home.to')}
            active={open === 'dest'}
            renderResultsInline={false}
            onActivate={() => onFieldActivate('dest')}
            onPick={(s) => {
              onDestinationChange(s);
              setError(null);
              setLocateError(null);
              setOpen(null);
            }}
            onSearchStateChange={(state) => {
              if (open === 'dest') {
                setActiveResults(state.results);
                setActiveTyping(state.typing);
              }
            }}
            onClear={() => onDestinationChange(null)}
          />
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('a11y.swap')}
          onPress={handleSwapPress}
          hitSlop={12}
          style={({ pressed }) => [
            styles.swapButton,
            {
              backgroundColor: colors.fill,
              opacity: pressed ? 0.75 : 1,
              transform: [{ scale: pressed ? 0.92 : 1 }],
            },
          ]}
        >
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <Ionicons name="swap-vertical" size={18} color={iconColor} />
          </Animated.View>
        </Pressable>
      </View>

      <PlannerSuggestions typing={activeTyping} results={activeResults} onPick={handlePick} />

      {!activeTyping ? (
        <>
          <View style={styles.bottomChipsRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={departureLabel(departure)}
              onPress={() => setSheetOpen(true)}
              style={[styles.departureChip, { backgroundColor: colors.fill }]}
            >
              <Ionicons name="time-outline" size={15} color={iconColor} />
              <Text style={[styles.departureText, { color: colors.text }]}>
                {departure.mode === 'now' ? 'Plecare acum' : departure.time || 'Plecare'}
              </Text>
              <Ionicons name="chevron-down" size={13} color={colors.textMuted} />
            </Pressable>
          </View>

          {shownError ? <Text style={[styles.error, { color: colors.danger }]}>{shownError}</Text> : null}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={searchLabel}
            accessibilityState={{ disabled: !valid }}
            onPress={search}
            style={({ pressed }) => [
              styles.searchButton,
              {
                backgroundColor: valid ? colors.primary : colors.fillDisabled,
                opacity: pressed && valid ? 0.9 : 1,
              },
            ]}
          >
            <Ionicons name="navigate" size={16} color={valid ? colors.onPrimary : colors.textMuted} />
            <Text numberOfLines={1} style={[styles.searchLabel, { color: valid ? colors.onPrimary : colors.textMuted }]}>
              {searchLabel}
            </Text>
          </Pressable>
        </>
      ) : null}

      <DeparturePicker visible={sheetOpen} value={departure} onChange={setDeparture} onClose={() => setSheetOpen(false)} />
    </View>
  );
}
