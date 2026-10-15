import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { BrandSplash } from './BrandSplash';

SplashScreen.preventAutoHideAsync().catch(() => {
  // Splash-ul nativ era deja ascuns — cel de brand acoperă ecranul oricum.
});

// 2600 ms loading + 1000 ms bun venit, apoi fade ca in varianta web.
const BRAND_SPLASH_MS = 3600;
const FADE_MS = 450;

export function BrandSplashOverlay() {
  const [done, setDone] = useState(false);
  const fade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await SplashScreen.hideAsync();
      } catch {
        // Deja ascuns — continuăm cu splash-ul de brand.
      }
      await new Promise<void>((resolve) => {
        setTimeout(() => resolve(), BRAND_SPLASH_MS);
      });
      if (!mounted) {
        return;
      }
      Animated.timing(fade, { toValue: 0, duration: FADE_MS, useNativeDriver: true }).start(
        ({ finished }) => {
          if (finished && mounted) {
            setDone(true);
          }
        },
      );
    })();
    return () => {
      mounted = false;
    };
  }, [fade]);

  if (done) {
    return null;
  }
  return (
    <Animated.View style={[styles.overlay, { opacity: fade }]}>
      <BrandSplash testID="brand-splash" />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
  },
});
