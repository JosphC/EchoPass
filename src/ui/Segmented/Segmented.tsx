import { Pressable, StyleSheet, Text, View } from 'react-native';
import { fontSizes, fontWeights, radius, spacing } from '../../core/theme';
import { useTheme } from '../../core/theme/useTheme';

interface SegmentedProps {
  options: string[];
  value: string;
  onChange: (next: string) => void;
  testID?: string;
}

export function Segmented({ options, value, onChange, testID }: SegmentedProps) {
  const { colors } = useTheme();

  return (
    <View testID={testID} accessibilityRole="tablist" style={[styles.root, { backgroundColor: `${colors.primary}1A` }]}>
      {options.map((opt) => {
        const selected = opt === value;
        return (
          <Pressable
            key={opt}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(opt)}
            style={[styles.slot, selected && [styles.active, { backgroundColor: colors.card }]]}
          >
            <Text style={[styles.label, { color: colors.primary }]}>{opt}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    borderRadius: radius.full,
    padding: spacing.xs,
  },
  slot: {
    flex: 1,
    borderRadius: radius.full,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  active: {
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  label: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semiBold,
  },
});
