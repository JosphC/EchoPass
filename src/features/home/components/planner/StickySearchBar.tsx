import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { t } from '../../../../core/i18n';
import { fontSizes, fontWeights, radius, spacing } from '../../../../core/theme';
import { useTheme } from '../../../../core/theme/useTheme';

interface StickySearchBarProps {
  visible: boolean;
  destinationName: string | null;
  canSearch: boolean;
  onSearch: () => void;
}

/** Collapsed planner bar pinned to the top while scrolling the home feed. */
export function StickySearchBar({ visible, destinationName, canSearch, onSearch }: StickySearchBarProps) {
  const { colors } = useTheme();
  if (!visible) return null;

  return (
    <View style={[styles.bar, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Ionicons name="search-outline" size={20} color={colors.textMuted} />
      <Text numberOfLines={1} style={[styles.title, { color: destinationName ? colors.text : colors.textMuted }]}>
        {destinationName ?? t('home.to')}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('home.searchRoutes')}
        accessibilityState={{ disabled: !canSearch }}
        onPress={onSearch}
        hitSlop={8}
        style={[styles.go, { backgroundColor: canSearch ? colors.primary : colors.border }]}
      >
        <Ionicons name="arrow-forward" size={20} color={canSearch ? colors.onPrimary : colors.textMuted} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    paddingLeft: spacing.lg,
    paddingRight: spacing.sm,
    paddingVertical: spacing.xs,
    minHeight: 48,
    elevation: 4,
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  title: {
    flex: 1,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium,
  },
  go: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
