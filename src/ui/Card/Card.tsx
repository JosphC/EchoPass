import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { radius, spacing } from '../../core/theme';
import { useTheme } from '../../core/theme/useTheme';

interface CardProps {
  children: ReactNode;
  testID?: string;
}

export function Card({ children, testID }: CardProps) {
  const { colors } = useTheme();
  return (
    <View testID={testID} style={[styles.root, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.lg,
  },
});
