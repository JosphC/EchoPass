import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing } from '../../core/theme';
import { useTheme } from '../../core/theme/useTheme';

interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
}

/** Page container: safe-area top gap, horizontal rhythm, themed background. */
export function Screen({ children, scroll = false }: ScreenProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const base = {
    backgroundColor: colors.background,
    paddingTop: Math.max(insets.top, spacing.lg),
    paddingHorizontal: spacing.lg,
  };

  if (scroll) {
    return (
      <ScrollView style={base} contentContainerStyle={styles.content}>
        {children}
      </ScrollView>
    );
  }
  return <View style={[base, styles.fill]}>{children}</View>;
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  content: {
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
});
