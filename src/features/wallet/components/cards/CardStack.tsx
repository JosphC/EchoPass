import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, useWindowDimensions, View, type ListRenderItemInfo, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { t } from '../../../../core/i18n';
import { spacing, useTheme } from '../../../../core/theme';
import type { WalletItem } from '../../types';
import { CarouselPage } from './CarouselPage';

interface CardStackProps {
  items: WalletItem[];
  frontId: string | null;
  defaultSourceId: string | null;
  onFront: (id: string) => void;
  onSetDefault: (id: string) => void;
}

// Google Wallet style: cardul activ centrat, cu fasii egale din vecini pe ambele parti.
const GAP = spacing.md;
// 40 dp margins leave a ~28 dp strip of the next card: it reads as "swipe for more".
const EDGE = spacing.xl + spacing.lg;

export function CardStack({ items, frontId, defaultSourceId, onFront, onSetDefault }: CardStackProps) {
  const { colors } = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const listRef = useRef<FlatList<WalletItem> | null>(null);
  // Full-bleed: iese din padding-ul Screen ca viewport-ul sa fie latimea ecranului.
  // Latimea reala e masurata cu onLayout (fallback: windowWidth).
  const [viewport, setViewport] = useState(0);
  const viewWidth = viewport > 0 ? viewport : windowWidth;
  // Card centrat: margini egale (EDGE) pe ambele parti -> vecinii se vad simetric.
  const cardWidth = viewWidth - EDGE * 2;
  const step = cardWidth + GAP;
  const resolved = frontId ?? defaultSourceId;
  const initialIndex = Math.max(0, resolved ? items.findIndex((i) => i.id === resolved) : 0);
  const safeInitial = initialIndex === -1 ? 0 : initialIndex;
  const [activeIndex, setActiveIndex] = useState(safeInitial);

  useEffect(() => {
    if (safeInitial > 0) listRef.current?.scrollToOffset({ offset: safeInitial * step, animated: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewWidth]);

  useEffect(() => {
    if (activeIndex > items.length - 1) setActiveIndex(Math.max(0, items.length - 1));
  }, [items.length, activeIndex]);

  useEffect(() => {
    if (!frontId) return;
    const idx = items.findIndex((i) => i.id === frontId);
    if (idx >= 0 && idx !== activeIndex) {
      setActiveIndex(idx);
      listRef.current?.scrollToOffset({ offset: idx * step, animated: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frontId]);

  const onMomentumEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const idx = Math.round(e.nativeEvent.contentOffset.x / step);
      const clamped = Math.max(0, Math.min(items.length - 1, idx));
      setActiveIndex(clamped);
      const id = items[clamped]?.id;
      if (id) onFront(id);
    },
    [items, onFront, step],
  );

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<WalletItem>) => (
      <CarouselPage item={item} active={index === activeIndex} isDefault={item.id === defaultSourceId} onFront={onFront} onSetDefault={onSetDefault} width={cardWidth} />
    ),
    [activeIndex, defaultSourceId, onFront, onSetDefault, cardWidth],
  );

  if (items.length === 0) return null;

  return (
    <View testID="card-carousel" style={styles.bleed}>
      <FlatList
        ref={listRef}
        data={items}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={step}
        disableIntervalMomentum
        contentOffset={{ x: safeInitial * step, y: 0 }}
        onLayout={(e) => {
          const w = e.nativeEvent.layout.width;
          if (Math.abs(w - viewport) > 0.5) setViewport(w);
        }}
        onMomentumScrollEnd={onMomentumEnd}
        contentContainerStyle={{ paddingHorizontal: EDGE }}
        ItemSeparatorComponent={() => <View style={{ width: GAP }} />}
      />
      {items.length > 1 ? (
        <View style={styles.dots} testID="carousel-dots">
          {items.map((item, index) => (
            <Pressable key={item.id} testID={`carousel-dot-${index}`} accessibilityRole="button" accessibilityLabel={`${t('wallet.card')} ${index + 1} ${t('wallet.spentOf')} ${items.length}`} hitSlop={8}
              onPress={() => {
                setActiveIndex(index);
                listRef.current?.scrollToOffset({ offset: index * step, animated: true });
                onFront(item.id);
              }}
            >
              <View style={[styles.dot, { backgroundColor: index === activeIndex ? colors.text : colors.border, width: index === activeIndex ? 20 : 6 }]} />
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bleed: {
    marginHorizontal: -spacing.lg,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: spacing.sm,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
});
