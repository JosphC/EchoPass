import type { ReactNode } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing } from '../../core/theme';
import { useTheme } from '../../core/theme/useTheme';

interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  onScrollY?: (y: number) => void;
  fixedTop?: ReactNode;
  contentPaddingHorizontal?: number;
  contentGap?: number;
  backgroundColor?: string;
}

/** Page container: safe-area top gap, horizontal rhythm, themed background. */
export function Screen({
  children,
  scroll = false,
  refreshing,
  onRefresh,
  onScrollY,
  fixedTop,
  contentPaddingHorizontal,
  contentGap,
  backgroundColor,
}: ScreenProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const base = {
    backgroundColor: backgroundColor ?? colors.background,
    paddingTop: insets.top + spacing.lg,
    paddingHorizontal: contentPaddingHorizontal ?? spacing.lg,
  };

  function handleScroll(e: NativeSyntheticEvent<NativeScrollEvent>): void {
    onScrollY?.(e.nativeEvent.contentOffset.y);
  }

  if (scroll) {
    return (
      <View style={[base, styles.fill]}>
        <ScrollView
          testID="screen-scroll"
          style={styles.fill}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.content, contentGap !== undefined && { gap: contentGap }]}
          scrollEventThrottle={onScrollY ? 16 : undefined}
          onScroll={onScrollY ? handleScroll : undefined}
          refreshControl={
            onRefresh ? <RefreshControl refreshing={refreshing ?? false} onRefresh={onRefresh} tintColor={colors.primary} /> : undefined
          }
        >
          {children}
        </ScrollView>
        {fixedTop ? <View style={[styles.sticky, { top: insets.top + spacing.sm }]}>{fixedTop}</View> : null}
      </View>
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
  sticky: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
  },
});
