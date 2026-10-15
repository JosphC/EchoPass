import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { fontSizes, fontWeights, radius, spacing } from '../../core/theme';
import { useTheme } from '../../core/theme/useTheme';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  pill?: boolean;
  testID?: string;
}

export function Button({ title, onPress, variant = 'primary', disabled = false, loading = false, pill = false, testID }: ButtonProps) {
  const { colors } = useTheme();
  const inactive = disabled || loading;

  const bg =
    variant === 'primary'
      ? colors.primary
      : variant === 'secondary'
        ? colors.secondary
        : variant === 'danger'
          ? colors.danger
          : 'transparent';
  const fg = variant === 'ghost' ? colors.primary : colors.onPrimary;

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.root,
        { backgroundColor: bg, borderColor: colors.primary, opacity: inactive ? 0.55 : pressed ? 0.88 : 1 },
        variant === 'ghost' && styles.ghost,
        pill && styles.pill,
      ]}
    >
      {loading ? <ActivityIndicator color={fg} /> : <Text style={[styles.label, { color: fg }]}>{title}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    minHeight: 48,
    borderRadius: 14,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghost: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  pill: {
    borderRadius: radius.full,
  },
  label: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
  },
});
