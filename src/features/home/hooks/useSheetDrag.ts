import { useMemo, useRef, useState } from 'react';
import { Animated, PanResponder, useWindowDimensions, type PanResponderInstance } from 'react-native';
import type { SheetSnapIndex } from '../components/map/HomeBottomSheet';

const PEEK_HEIGHT = 205;

interface SheetDrag {
  snapIndex: SheetSnapIndex;
  snapTo: (next: SheetSnapIndex) => void;
  sheetAnim: Animated.Value;
  sheetPan: PanResponderInstance;
  sheetHeight: number;
  setSheetHeight: (h: number) => void;
  peekHeight: number;
}

/** Google Maps style draggable bottom sheet: peek / half / full snap points. */
export function useSheetDrag(): SheetDrag {
  const { height: windowHeight } = useWindowDimensions();
  const halfHeight = Math.round(windowHeight * 0.48);
  const fullHeight = Math.round(windowHeight * 0.86);
  const snapHeights = useMemo(
    () => [PEEK_HEIGHT, halfHeight, fullHeight] as const,
    [halfHeight, fullHeight],
  );

  const [snapIndex, setSnapIndex] = useState<SheetSnapIndex>(0);
  const [sheetHeight, setSheetHeight] = useState(PEEK_HEIGHT);
  const sheetAnim = useRef(new Animated.Value(PEEK_HEIGHT)).current;
  const dragStartHeight = useRef(PEEK_HEIGHT);
  const snapRef = useRef<SheetSnapIndex>(0);
  snapRef.current = snapIndex;

  function snapTo(next: SheetSnapIndex): void {
    setSnapIndex(next);
    const target = snapHeights[next];
    setSheetHeight(target);
    Animated.spring(sheetAnim, {
      toValue: target,
      tension: 68,
      friction: 12,
      useNativeDriver: false,
    }).start();
  }

  const sheetPan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 6,
        onPanResponderGrant: () => {
          const current = snapHeights[snapRef.current] ?? PEEK_HEIGHT;
          dragStartHeight.current = current;
          sheetAnim.stopAnimation((value: number) => {
            dragStartHeight.current = value;
          });
        },
        onPanResponderMove: (_, gesture) => {
          sheetAnim.setValue(
            Math.min(fullHeight, Math.max(120, dragStartHeight.current - gesture.dy)),
          );
        },
        onPanResponderRelease: (_, gesture) => {
          const current = Math.min(
            fullHeight,
            Math.max(120, dragStartHeight.current - gesture.dy),
          );
          // Fast flick jumps one snap level, like Google Maps.
          let next: SheetSnapIndex = snapRef.current;
          if (gesture.vy < -0.6) next = Math.min(2, snapRef.current + 1) as SheetSnapIndex;
          else if (gesture.vy > 0.6) next = Math.max(0, snapRef.current - 1) as SheetSnapIndex;
          else {
            let best = 0;
            let bestDist = Number.POSITIVE_INFINITY;
            snapHeights.forEach((h, i) => {
              const d = Math.abs(h - current);
              if (d < bestDist) {
                bestDist = d;
                best = i;
              }
            });
            next = best as SheetSnapIndex;
          }
          snapTo(next);
        },
      }),
    // snapTo/sheetAnim are stable refs; heights drive re-creation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fullHeight, halfHeight],
  );

  return { snapIndex, snapTo, sheetAnim, sheetPan, sheetHeight, setSheetHeight, peekHeight: PEEK_HEIGHT };
}
