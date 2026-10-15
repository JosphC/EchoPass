import { Pressable, StyleSheet, Text, View } from 'react-native';
import { fontSizes, fontWeights, radius, spacing } from '../../core/theme';
import { useTheme } from '../../core/theme/useTheme';

interface SegmentedProps {
  options: string[];
  value: string;
  onChange: (next: string) => void;
  testID?: string;
  variant?: 'tabs' | 'pill';
}

export function Segmented({ options, value, onChange, testID, variant = 'tabs' }: SegmentedProps) {
  const { colors } = useTheme();

  if (variant === 'pill') {
    return (
      <View testID={testID} accessibilityRole="tablist" style={[styles.pillRoot, { backgroundColor: colors.border }]}>
        {options.map((opt) => {
          const selected = opt === value;
          return (
            <Pressable
              key={opt}
              accessibilityRole="tab"
              accessibilityLabel={opt}
              accessibilityState={{ selected }}
              onPress={() => onChange(opt)}
              style={[styles.pillSlot, selected && [styles.pillActive, { backgroundColor: colors.surface }]]}
            >
              <Text
                style={[
                  styles.pillLabel,
                  {
                    color: selected ? colors.text : colors.textMuted,
                    fontWeight: selected ? fontWeights.bold : fontWeights.medium,
                  },
                ]}
              >
                {opt}
              </Text>
            </Pressable>
          );
        })}
      </View>
    );
  }

  return (
    <View testID={testID} accessibilityRole="tablist" style={[styles.tabsRoot, { borderBottomColor: colors.border }]}>
      {options.map((opt) => {
        const selected = opt === value;
        return (
          <Pressable
            key={opt}
            accessibilityRole="tab"
              accessibilityLabel={opt}
            accessibilityState={{ selected }}
            onPress={() => onChange(opt)}
            style={styles.tabSlot}
          >
            <Text
              style={[
                styles.tabLabel,
                {
                  color: selected ? colors.text : colors.textMuted,
                  fontWeight: selected ? fontWeights.bold : fontWeights.medium,
                },
              ]}
            >
              {opt}
            </Text>
            {selected && <View style={[styles.tabIndicator, { backgroundColor: colors.primary }]} />}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabsRoot: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    backgroundColor: 'transparent',
  },
  tabSlot: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tabLabel: {
    fontSize: 15,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 3,
  },
  pillRoot: {
    flexDirection: 'row',
    borderRadius: radius.full,
    padding: 3,
  },
  pillSlot: {
    flex: 1,
    borderRadius: radius.full,
    paddingVertical: spacing.xs,
    alignItems: 'center',
    minHeight: 40,
    justifyContent: 'center',
  },
  pillActive: {
  },
  pillLabel: {
    fontSize: fontSizes.sm,
  },
});


