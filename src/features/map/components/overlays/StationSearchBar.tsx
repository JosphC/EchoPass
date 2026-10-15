import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { t } from '../../../../core/i18n';
import { fontSizes, spacing } from '../../../../core/theme';
import { useTheme } from '../../../../core/theme/useTheme';
import { searchAllPlaces, searchLocalPlaces, type LocationPlace } from '../../places';
import type { Station } from '../../stations';
import { StationResults, type PlaceResultItem } from './StationResults';

interface StationSearchBarProps {
  station: Station | null;
  onPickStation: (station: Station) => void;
  onClear: () => void;
  onNotifications?: () => void;
}

/** Writable map search: type to filter stations & POIs, tap a result to pick it. */
export function StationSearchBar({ station, onPickStation, onClear, onNotifications }: StationSearchBarProps) {
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [results, setResults] = useState<(Station | LocationPlace)[]>([]);
  const inputRef = useRef<TextInput | null>(null);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }
    const local = searchLocalPlaces(q);
    setResults(local);

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

  function pick(next: PlaceResultItem): void {
    if (blurTimer.current) clearTimeout(blurTimer.current);
    setQuery('');
    setFocused(false);
    inputRef.current?.blur();
    if ('station' in next && next.station) {
      onPickStation(next.station);
    } else if ('lines' in next) {
      onPickStation(next);
    } else {
      onPickStation({
        id: next.id,
        name: next.name,
        lat: next.lat,
        lng: next.lng,
        lines: [],
      });
    }
  }

  function clear(): void {
    setQuery('');
    if (query === '') onClear();
  }

  return (
    <View>
      <View style={[styles.search, { backgroundColor: colors.searchBar, borderColor: colors.border }]}>
        <Ionicons name="search-outline" size={22} color={colors.textMuted} />
        <TextInput
          ref={inputRef}
          value={query}
          onChangeText={setQuery}
          placeholder={station ? station.name : 'Caută stații, cămine, locuri...'}
          placeholderTextColor={colors.textMuted}
          returnKeyType="search"
          style={[styles.field, { color: colors.text }]}
          onFocus={() => {
            if (blurTimer.current) clearTimeout(blurTimer.current);
            setFocused(true);
          }}
          onBlur={() => {
            blurTimer.current = setTimeout(() => setFocused(false), 180);
          }}
        />
        {query !== '' || station ? (
          <Pressable accessibilityRole="button" accessibilityLabel={t('a11y.clearSearch')} onPress={clear} hitSlop={8}>
            <Ionicons name="close-circle" size={20} color={colors.textMuted} />
          </Pressable>
        ) : null}
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <Pressable accessibilityRole="button" accessibilityLabel={t('a11y.notifications')} onPress={onNotifications} hitSlop={8} style={styles.bell}>
          <Ionicons name="notifications-outline" size={22} color={colors.primary} />
          <View style={[styles.dot, { backgroundColor: colors.danger }]} />
        </Pressable>
      </View>
      {showResults ? <StationResults results={results} onPick={pick} style={styles.results} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: 26,
    borderWidth: StyleSheet.hairlineWidth,
    paddingLeft: spacing.lg,
    paddingRight: spacing.md,
    minHeight: 52,
    elevation: 3,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  // Dropdown one gap (8) under this 52-high bar.
  results: { top: 60 },
  field: { flex: 1, minHeight: 44, fontSize: fontSizes.md },
  divider: { width: StyleSheet.hairlineWidth, minHeight: 28 },
  bell: { minWidth: 40, minHeight: 40, alignItems: 'center', justifyContent: 'center' },
  dot: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4 },
});
