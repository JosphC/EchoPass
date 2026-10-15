import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { fontWeights, radius, spacing } from '../../core/theme';
import { useTheme } from '../../core/theme/useTheme';

interface ToggleProps {
  value: boolean;
  onValueChange: (next: boolean) => void;
  label?: string;
  icon?: ReactNode;
  testID?: string;
  /** Hairline under the row; pass false for the last row of a grouped card. */
  divider?: boolean;
}

export function Toggle({ value, onValueChange, label, icon, testID, divider = true }: ToggleProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      testID={testID}
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
      onPress={() => onValueChange(!value)}
      style={[styles.row, label && divider ? { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth } : null]}
    >
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      {label ? <Text style={[styles.label, { color: colors.text }]}>{label}</Text> : null}
      <View style={styles.spacer} />
      <View style={[styles.track, { backgroundColor: value ? colors.primary : colors.border, borderColor: colors.border }]}>
        <View style={[styles.thumb, { backgroundColor: colors.onPrimary, marginLeft: value ? 22 : 2 }]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 44,
    paddingVertical: 10,
  },
  track: {
    width: 48,
    height: 28,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
  },
  thumb: {
    width: 22,
    height: 22,
    borderRadius: radius.full,
  },
  label: {
    fontSize: 15.5,
    fontWeight: fontWeights.semiBold,
  },
  icon: {
    width: 28,
    alignItems: 'center',
  },
  spacer: {
    flex: 1,
  },
});
