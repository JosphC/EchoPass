import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { t } from '../../../../core/i18n';
import { fontSizes, radius, spacing } from '../../../../core/theme';
import { useTheme } from '../../../../core/theme/useTheme';
import { BottomSheet, ListItem } from '../../../../ui';
import { haversineKm, loadStations, searchStations, type LatLng, type Station } from '../../../../features/map';

interface StationPickerSheetProps {
  visible: boolean;
  coords: LatLng | null;
  selectedId: string;
  favoriteIds: string[];
  onToggleFavorite: (id: string) => void;
  onPick: (station: Station) => void;
  onClose: () => void;
}

function SheetRow({ station, detail, favorite, onToggleFavorite, onPick }: { station: Station; detail: string; favorite: boolean; onToggleFavorite: (id: string) => void; onPick: (station: Station) => void }) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      <View style={styles.main}>
        <ListItem title={station.name} subtitle={detail} onPress={() => onPick(station)} />
      </View>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: favorite }}
        accessibilityLabel={`${station.name} favorit`}
        onPress={() => onToggleFavorite(station.id)}
        hitSlop={8}
        style={styles.star}
      >
        <Ionicons name={favorite ? 'star' : 'star-outline'} size={24} color={favorite ? colors.amber : colors.textMuted} />
      </Pressable>
    </View>
  );
}

/** Nearby stops with distances, favorites first, plus search. Picking never touches the route destination. */
export function StationPickerSheet({ visible, coords, selectedId, favoriteIds, onToggleFavorite, onPick, onClose }: StationPickerSheetProps) {
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const stations = useMemo(() => loadStations(), []);
  const results = useMemo(() => searchStations(stations, query), [stations, query]);
  const typing = query.trim().length >= 2;
  const nearby = useMemo(() => {
    if (!coords) return [];
    return [...stations]
      .sort((a, b) => haversineKm(coords, a) - haversineKm(coords, b))
      .filter((s) => s.id !== selectedId)
      .slice(0, 6);
  }, [stations, coords, selectedId]);
  const favorites = useMemo(
    () => favoriteIds.map((id) => stations.find((s) => s.id === id)).filter((s): s is Station => s !== undefined),
    [stations, favoriteIds],
  );

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder={t('live.searchStations')}
        placeholderTextColor={colors.textMuted}
        style={[styles.input, { color: colors.text, borderColor: colors.border }]}
      />
      {typing ? (
        <FlatList
          data={results}
          keyExtractor={(s) => s.id}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <SheetRow
              station={item}
              detail={item.lines.join(' · ')}
              favorite={favoriteIds.includes(item.id)}
              onToggleFavorite={onToggleFavorite}
              onPick={(s) => {
                onPick(s);
                onClose();
              }}
            />
          )}
        />
      ) : (
        <View style={styles.groups}>
          {favorites.map((s) => (
            <SheetRow
              key={`fav-${s.id}`}
              station={s}
              detail={s.lines.join(' · ')}
              favorite={true}
              onToggleFavorite={onToggleFavorite}
              onPick={(next) => {
                onPick(next);
                onClose();
              }}
            />
          ))}
          {nearby.map((s) => (
            <SheetRow
              key={`near-${s.id}`}
              station={s}
              detail={coords ? `${Math.round(haversineKm(coords, s) * 1000)} ${t('home.meters')} · ${s.lines.join(' · ')}` : s.lines.join(' · ')}
              favorite={favoriteIds.includes(s.id)}
              onToggleFavorite={onToggleFavorite}
              onPick={(next) => {
                onPick(next);
                onClose();
              }}
            />
          ))}
        </View>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    minHeight: 48,
    fontSize: fontSizes.md,
  },
  groups: {
    maxHeight: 360,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  main: {
    flex: 1,
  },
  star: {
    minWidth: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
