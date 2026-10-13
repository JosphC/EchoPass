import { Ionicons } from '@expo/vector-icons';
import { FlatList, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { fontSizes, fontWeights, radius } from '../../../../core/theme';
import { useTheme } from '../../../../core/theme/useTheme';
import type { LocationPlace } from '../../places';
import type { Station } from '../../stations';

export type PlaceResultItem = Station | LocationPlace;

interface StationResultsProps {
  results: PlaceResultItem[];
  onPick: (item: any) => void;
  floating?: boolean;
  style?: StyleProp<ViewStyle>;
}

function ResultRow({
  item,
  onPick,
  isDark,
  colors,
}: {
  item: PlaceResultItem;
  onPick: (item: any) => void;
  isDark: boolean;
  colors: any;
}) {
  const isPlace = 'kind' in item;
  const title = item.name;
  const subtitle = isPlace
    ? item.subtitle
    : item.lines.length > 0
      ? `Liniile ${item.lines.slice(0, 5).join(', ')}${item.lines.length > 5 ? '…' : ''}`
      : 'Stație de transport';

  const isPoi = isPlace && item.kind === 'poi';
  const iconName = isPlace
    ? item.kind === 'station'
      ? 'bus'
      : item.kind === 'poi'
        ? 'location-sharp'
        : 'navigate'
    : 'bus';

  const iconColor = isPoi ? '#DC2626' : '#2563EB';
  const bubbleBg = isDark
    ? isPoi
      ? 'rgba(220, 38, 38, 0.18)'
      : 'rgba(37, 99, 235, 0.18)'
    : isPoi
      ? '#FEF2F2'
      : '#EFF6FF';

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onPick(item)}
      unstable_pressDelay={0}
      style={({ pressed }) => [
        styles.itemRow,
        { backgroundColor: pressed ? (isDark ? '#303134' : '#F1F5F9') : 'transparent' },
      ]}
    >
      <View style={[styles.iconBubble, { backgroundColor: bubbleBg }]}>
        <Ionicons name={iconName} size={17} color={iconColor} />
      </View>
      <View style={styles.textCol}>
        <Text numberOfLines={1} style={[styles.title, { color: colors.text }]}>
          {title}
        </Text>
        {subtitle ? (
          <Text numberOfLines={1} style={[styles.subtitle, { color: colors.textMuted }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

/** Autocomplete station & POI list: floating dropdown (map) or clean attached block (planner). */
export function StationResults({ results, onPick, floating = true, style }: StationResultsProps) {
  const { colors, isDark } = useTheme();
  if (results.length === 0) return null;

  if (!floating) {
    return (
      <View
        style={[styles.container, styles.inline, { backgroundColor: colors.card, borderColor: colors.border }, style]}
        testID="station-results"
      >
        {results.slice(0, 5).map((item, index) => (
          <View key={item.id}>
            {index > 0 && <View style={[styles.separator, { backgroundColor: colors.border }]} />}
            <ResultRow item={item} onPick={onPick} isDark={isDark} colors={colors} />
          </View>
        ))}
      </View>
    );
  }

  return (
    <View
      style={[styles.container, styles.floating, { backgroundColor: colors.card, borderColor: colors.border }, style]}
      testID="station-results"
    >
      <FlatList
        data={results}
        keyExtractor={(s) => s.id}
        style={styles.list}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
        initialNumToRender={8}
        windowSize={9}
        ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: colors.border }]} />}
        renderItem={({ item }) => <ResultRow item={item} onPick={onPick} isDark={isDark} colors={colors} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  floating: {
    position: 'absolute',
    top: 58,
    left: 0,
    right: 0,
    zIndex: 1000,
    maxHeight: 280,
    elevation: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
  },
  // Bounded height on the list itself so it always scrolls instead of
  // growing past the card (flexGrow 0 shrink-wraps short result sets).
  list: {
    maxHeight: 280,
    flexGrow: 0,
  },
  inline: {
    position: 'relative',
    top: 0,
    maxHeight: 240,
    elevation: 2,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 12,
  },
  iconBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 14.5,
    fontWeight: fontWeights.semiBold,
  },
  subtitle: {
    fontSize: fontSizes.xs,
    marginTop: 2,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 60,
  },
});
