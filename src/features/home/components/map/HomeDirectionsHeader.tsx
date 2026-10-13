import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Animated, Keyboard, Pressable, Text, View } from 'react-native';
import { t } from '../../../../core/i18n';
import { useTheme } from '../../../../core/theme/useTheme';
import { StationResults, type LatLng, type LocationPlace } from '../../../map';
import type { PlaceOrStation } from '../planner/PlannerCard';
import { StationField } from '../planner/StationField';
import { styles } from './homeMapStyles';

interface HomeDirectionsHeaderProps {
  origin: PlaceOrStation | null;
  destination: PlaceOrStation | null;
  onOriginChange: (place: PlaceOrStation | null, coords: LatLng | null) => void;
  onDestinationChange: (place: PlaceOrStation | null) => void;
  onSwap: () => void;
  onBack: () => void;
  onLocateOrigin: () => void;
  locating?: boolean;
  onSearch?: () => void;
  onHeightChange?: (height: number) => void;
}

type OpenField = 'origin' | 'dest' | null;

export function HomeDirectionsHeader({
  origin,
  destination,
  onOriginChange,
  onDestinationChange,
  onSwap,
  onBack,
  onLocateOrigin,
  locating,
  onSearch,
  onHeightChange,
}: HomeDirectionsHeaderProps) {
  const { colors, isDark } = useTheme();
  const [open, setOpen] = useState<OpenField>(null);
  const [activeResults, setActiveResults] = useState<LocationPlace[]>([]);
  const [activeTyping, setActiveTyping] = useState(false);
  // Google Maps behaviour: once the route is set, the two input fields
  // collapse into a compact one-line summary bar so the map stays visible.
  // Tapping the summary expands the fields again for editing.
  const [editing, setEditing] = useState(!(origin && destination));

  useEffect(() => {
    if (!origin || !destination) setEditing(true);
  }, [origin, destination]);

  const swapAnim = useRef(new Animated.Value(0)).current;
  const rotationCount = useRef(0);

  function handleSwapPress(): void {
    rotationCount.current += 1;
    Animated.spring(swapAnim, { toValue: rotationCount.current, friction: 7, tension: 60, useNativeDriver: true }).start();
    onSwap();
  }

  const spin = swapAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });

  const canSearch = origin !== null && destination !== null && origin.id !== destination.id;
  const searchBtnLabel = canSearch
    ? t('home.searchRoutes')
    : !destination
      ? t('home.chooseDestination')
      : !origin
        ? t('home.chooseOrigin')
        : t('home.pickDifferent');

  function handleSearchPress(): void {
    Keyboard.dismiss();
    if (canSearch) setEditing(false);
    onSearch?.();
  }

  function handlePick(place: LocationPlace): void {
    const willHaveBoth =
      open === 'origin' ? destination !== null : origin !== null;
    if (open === 'origin') onOriginChange(place, { lat: place.lat, lng: place.lng });
    else onDestinationChange(place);
    setActiveResults([]);
    setActiveTyping(false);
    setOpen(null);
    if (willHaveBoth) {
      Keyboard.dismiss();
      setEditing(false);
    }
  }

  function reportHeight(h: number): void {
    if (h > 0) onHeightChange?.(h);
  }

  // Compact Google Maps style summary bar: back + origin/destination on two
  // truncated lines, so long names can never push the bar out of frame.
  if (!editing && origin && destination) {
    return (
      <View
        onLayout={(e) => reportHeight(e.nativeEvent.layout.height)}
        style={[styles.directionsCard, styles.directionsCardCompact, { backgroundColor: colors.card }]}
      >
        <View style={styles.dirCompactRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Înapoi la hartă"
            onPress={onBack}
            hitSlop={8}
            style={[styles.backBtn, { backgroundColor: isDark ? '#303134' : '#F1F5F9' }]}
          >
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Editează ruta"
            onPress={() => setEditing(true)}
            style={styles.dirSummaryCol}
          >
            <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.dirSummaryOrigin, { color: colors.textMuted }]}>
              {origin.name}
            </Text>
            <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.dirSummaryText, { color: colors.text }]}>
              → {destination.name}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Schimbă originea cu destinația"
            onPress={handleSwapPress}
            hitSlop={10}
            style={[styles.dirSwapBtnSmall, { backgroundColor: isDark ? '#303134' : '#F1F5F9' }]}
          >
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <Ionicons name="swap-vertical" size={17} color={colors.primary} />
            </Animated.View>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View
      onLayout={(e) => reportHeight(e.nativeEvent.layout.height)}
      style={[styles.directionsCard, { backgroundColor: colors.card }]}
    >
      <View style={styles.dirNavRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Înapoi la hartă"
          onPress={onBack}
          hitSlop={8}
          style={[styles.backBtn, { backgroundColor: isDark ? '#303134' : '#F1F5F9' }]}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </Pressable>
        <Text style={[styles.dirNavTitle, { color: colors.text }]}>{t('home.plannerTitle')}</Text>
      </View>

      <View style={styles.dirBodyRow}>
        <View style={styles.dirTrackCol}>
          <View style={styles.dirOriginDot} />
          <View style={[styles.dirRail, { backgroundColor: isDark ? '#5F6368' : '#BFDBFE' }]} />
          <Ionicons name="location-sharp" size={18} color="#DC2626" />
        </View>

        <View style={styles.dirInputsCol}>
          <StationField
            value={origin}
            placeholder={locating && !origin ? t('home.locating') : t('home.from')}
            active={open === 'origin'}
            renderResultsInline={false}
            onActivate={() => {
              setOpen('origin');
              setActiveResults([]);
              setActiveTyping(false);
            }}
            onPick={handlePick}
            onSearchStateChange={(state) => {
              if (open === 'origin') {
                setActiveResults(state.results);
                setActiveTyping(state.typing);
              }
            }}
            onClear={() => onOriginChange(null, null)}
            showLocate
            locating={locating}
            onLocate={onLocateOrigin}
            onSearch={handleSearchPress}
          />

          <StationField
            value={destination}
            placeholder={t('home.to')}
            active={open === 'dest'}
            renderResultsInline={false}
            onActivate={() => {
              setOpen('dest');
              setActiveResults([]);
              setActiveTyping(false);
            }}
            onPick={handlePick}
            onSearchStateChange={(state) => {
              if (open === 'dest') {
                setActiveResults(state.results);
                setActiveTyping(state.typing);
              }
            }}
            onClear={() => onDestinationChange(null)}
            onSearch={handleSearchPress}
          />
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Schimbă originea cu destinația"
          onPress={handleSwapPress}
          hitSlop={10}
          style={({ pressed }) => [
            styles.dirSwapBtn,
            {
              backgroundColor: isDark ? '#303134' : '#F1F5F9',
              borderColor: isDark ? '#3C4043' : '#E2E8F0',
              borderWidth: 1,
              opacity: pressed ? 0.75 : 1,
            },
          ]}
        >
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <Ionicons name="swap-vertical" size={18} color={colors.primary} />
          </Animated.View>
        </Pressable>
      </View>

      {!activeTyping && (!origin || !destination) ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={searchBtnLabel}
          accessibilityState={{ disabled: !canSearch }}
          onPress={handleSearchPress}
          style={({ pressed }) => [
            styles.dirSearchBtn,
            {
              backgroundColor: canSearch ? colors.primary : isDark ? '#303134' : '#E2E8F0',
              opacity: pressed && canSearch ? 0.88 : 1,
            },
          ]}
        >
          <Ionicons name="search" size={17} color={canSearch ? '#FFFFFF' : colors.textMuted} />
          <Text style={[styles.dirSearchText, { color: canSearch ? '#FFFFFF' : colors.textMuted }]}>
            {searchBtnLabel}
          </Text>
        </Pressable>
      ) : null}

      {open !== null && activeTyping && (
        <StationResults results={activeResults} onPick={handlePick} floating style={styles.dirResults} />
      )}
    </View>
  );
}
