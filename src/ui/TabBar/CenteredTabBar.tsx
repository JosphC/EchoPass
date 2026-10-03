import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fontSizes, radius, spacing } from '../../core/theme';
import { useTheme } from '../../core/theme/useTheme';

const ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  index: 'home-outline',
  wallet: 'wallet-outline',
  live: 'map-outline',
  trips: 'time-outline',
  settings: 'settings-outline',
};

interface CenteredTabBarProps extends BottomTabBarProps {
  centerRouteName: string;
}

export function CenteredTabBar({ state, descriptors, navigation, centerRouteName }: CenteredTabBarProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, spacing.sm), backgroundColor: colors.card, borderTopColor: colors.border }]}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const { options } = descriptors[route.key];
        const label = options.title ?? route.name;
        const isCenter = route.name === centerRouteName;
        const color = focused ? colors.primary : colors.textMuted;
        const icon = ICONS[route.name] ?? 'ellipse-outline';

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={{ selected: focused }}
            onPress={() => navigation.navigate(route.name)}
            style={isCenter ? styles.centerSlot : styles.slot}
          >
            {isCenter ? (
              <View style={[styles.centerBtn, { backgroundColor: colors.primary }]}>
                <Ionicons name={icon} size={26} color={colors.surface} />
              </View>
            ) : (
              <Ionicons name={icon} size={22} color={color} />
            )}
            {isCenter ? null : <Text style={[styles.label, { color }]}>{label}</Text>}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: spacing.sm,
  },
  slot: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  centerSlot: {
    flex: 1,
    alignItems: 'center',
    marginTop: -spacing.xl,
  },
  centerBtn: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: fontSizes.xs,
  },
});
