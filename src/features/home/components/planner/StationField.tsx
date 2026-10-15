import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { t } from '../../../../core/i18n';
import { fontSizes, fontWeights, spacing } from '../../../../core/theme';
import { useTheme } from '../../../../core/theme/useTheme';
import {
  searchAllPlaces,
  searchLocalPlaces,
  stationToPlace,
  StationResults,
  type LocationPlace,
  type Station,
} from '../../../../features/map';

export type FieldPlaceValue = Station | LocationPlace;

interface StationFieldProps {
  icon?: keyof typeof Ionicons.glyphMap;
  value: FieldPlaceValue | null;
  placeholder: string;
  active: boolean;
  onActivate: () => void;
  onPick: (place: LocationPlace) => void;
  onClear: () => void;
  showLocate?: boolean;
  locating?: boolean;
  onLocate?: () => void;
  trailing?: ReactNode;
  hideIcon?: boolean;
  renderResultsInline?: boolean;
  onSearchStateChange?: (state: { results: LocationPlace[]; typing: boolean; query: string }) => void;
  onSearch?: () => void;
}

/** Google Maps style station & POI input row with autocomplete & inline locate/clear. */
export function StationField({
  icon,
  value,
  placeholder,
  active,
  onActivate,
  onPick,
  onClear,
  showLocate,
  locating,
  onLocate,
  trailing,
  hideIcon = true,
  renderResultsInline = true,
  onSearchStateChange,
  onSearch,
}: StationFieldProps) {
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [results, setResults] = useState<LocationPlace[]>([]);
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

    if (q.length < 3) {
      return;
    }

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

  const typing = query.trim().length >= 2;
  const showResults = active && focused && typing;
  const showEmpty = active && focused && typing && results.length === 0;

  useEffect(() => {
    if (!active) {
      setFocused(false);
      setQuery('');
    }
  }, [active]);

  useEffect(() => {
    if (value) setQuery('');
  }, [value]);

  useEffect(() => {
    onSearchStateChange?.({ results, typing, query });
  }, [results, typing, query, onSearchStateChange]);

  const boxBg = colors.fill;
  // Filled field without an outline; only the focus ring is drawn.
  const borderColor = focused ? colors.primary : boxBg;
  const placeholderColor = colors.placeholder;

  function pick(next: Station | LocationPlace): void {
    if (blurTimer.current) clearTimeout(blurTimer.current);
    setQuery('');
    setFocused(false);
    inputRef.current?.blur();
    const place = 'kind' in next ? next : stationToPlace(next);
    onPick(place);
  }

  return (
    <View style={styles.container}>
      <View style={[styles.inputBox, { borderColor, backgroundColor: boxBg }]}>
        {!hideIcon && icon ? <Ionicons name={icon} size={18} color={colors.primary} /> : null}
        <TextInput
          ref={inputRef}
          value={query}
          onChangeText={setQuery}
          placeholder={value ? value.name : placeholder}
          placeholderTextColor={value ? colors.text : placeholderColor}
          returnKeyType="search"
          onSubmitEditing={() => {
            inputRef.current?.blur();
            onSearch?.();
          }}
          style={[styles.field, { color: colors.text, fontWeight: value ? fontWeights.medium : fontWeights.regular }]}
          onFocus={() => {
            if (blurTimer.current) clearTimeout(blurTimer.current);
            setFocused(true);
            onActivate();
          }}
          onBlur={() => {
            blurTimer.current = setTimeout(() => setFocused(false), 180);
          }}
        />
        {query !== '' || value ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('live.clearFilter')}
            onPress={() => {
              setQuery('');
              if (query === '') onClear();
            }}
            hitSlop={12}
            style={styles.actionBtn}
          >
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </Pressable>
        ) : null}
        {showLocate && !value && query === '' ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={locating ? t('home.locating') : t('home.currentLocation')}
            onPress={onLocate}
            hitSlop={12}
            style={styles.actionBtn}
          >
            <Ionicons name={locating ? 'hourglass-outline' : 'locate'} size={18} color={colors.primary} />
          </Pressable>
        ) : null}
        {trailing}
      </View>
      {showEmpty && renderResultsInline ? <Text style={[styles.empty, { color: colors.textMuted }]}>{t('home.noStations')}</Text> : null}
      {showResults && typing && renderResultsInline ? <StationResults results={results} onPick={pick} floating={false} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    gap: 10,
  },
  field: { flex: 1, height: 44, fontSize: 14.5, paddingVertical: 0 },
  actionBtn: { padding: 3, alignItems: 'center', justifyContent: 'center' },
  empty: { fontSize: fontSizes.sm, paddingVertical: spacing.sm },
});
