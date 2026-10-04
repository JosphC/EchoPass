import { StyleSheet, Text, View } from 'react-native';
import { fontSizes, radius, spacing } from '../../core/theme';
import { useTheme } from '../../core/theme/useTheme';

export type ToastTone = 'info' | 'success' | 'error';

interface ToastProps {
  message: string;
  tone?: ToastTone;
  testID?: string;
}

export function Toast({ message, tone = 'info', testID }: ToastProps) {
  const { colors } = useTheme();
  const bg = tone === 'success' ? colors.success : tone === 'error' ? colors.danger : colors.text;

  return (
    <View testID={testID} accessibilityRole="alert" style={[styles.root, { backgroundColor: bg }]}>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  message: {
    color: '#FFFFFF',
    fontSize: fontSizes.sm,
  },
});
