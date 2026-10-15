import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { fontWeights, spacing } from '../../../../core/theme';
import { useTheme } from '../../../../core/theme/useTheme';

export interface BoardAction {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  active?: boolean;
}

interface ActionChipRowProps {
  actions: BoardAction[];
}

/** Horizontal action chips with an edge fade instead of abrupt clipping. */
export function ActionChipRow({ actions }: ActionChipRowProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.wrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {actions.map((a, i) => {
          const primary = i === 0;
          const active = a.active ?? false;
          const bg = primary
            ? colors.primary
            : active
              ? colors.primarySoft
              : colors.fill;
          const border = primary
            ? colors.primary
            : active
              ? colors.primary
              : colors.border;
          const fg = primary
            ? colors.onPrimary
            : active
              ? colors.primary
              : colors.text;

          return (
            <Pressable
              key={a.label}
              accessibilityRole="button"
              accessibilityLabel={a.label}
              onPress={a.onPress}
              style={({ pressed }) => [
                styles.chip,
                {
                  backgroundColor: bg,
                  borderColor: border,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <Ionicons name={a.icon} size={15} color={fg} />
              <Text style={[styles.label, { color: fg }]}>{a.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <LinearGradient
        // Same color as the sheet (card), so the last chip fades out instead of being cut.
        colors={['transparent', colors.card]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.fade}
        pointerEvents="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
    marginVertical: 2,
  },
  row: {
    gap: 8,
    paddingRight: spacing.xl,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 13,
    height: 36,
  },
  label: {
    fontSize: 13,
    fontWeight: fontWeights.semiBold,
  },
  fade: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: spacing.xl * 1.5,
  },
});
