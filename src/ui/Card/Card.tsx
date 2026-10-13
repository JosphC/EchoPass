import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { spacing } from '../../core/theme';
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
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.lg,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
});
