import { useEffect } from 'react';
import type { ComponentType } from 'react';
import { StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import type { TextInputProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedProps, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { SplashBusSvg, playSplashOnce, stopSplashLoop } from './SplashBusSvg';
import { barAlpha, loadAlpha, pctText, welcomeAlpha } from './cycle';

export const SPLASH_BG = '#FFFFFF';
const INK = '#262626';
const LOADING_LABEL = 'Aplicația se încarcă...';
const WELCOME_LABEL = 'Welcome, sunteți conectați!';

const ATextInput = Animated.createAnimatedComponent(
  TextInput as unknown as ComponentType<TextInputProps & { text?: string }>,
);

interface BrandSplashProps {
  testID?: string;
}

/** Splash 1:1 din varianta web: o rulare de 2600 ms, apoi bun venit. */
export function BrandSplash({ testID }: BrandSplashProps) {
  const cyc = useSharedValue(0);
  const { width: winW } = useWindowDimensions();
  const barW = Math.min(winW * 0.72, 280);

  useEffect(() => {
    playSplashOnce(cyc);
    return () => {
      stopSplashLoop(cyc);
    };
  }, [cyc]);

  const loadStyle = useAnimatedStyle(() => ({ opacity: loadAlpha(cyc.value) }));
  const welcomeStyle = useAnimatedStyle(() => ({ opacity: welcomeAlpha(cyc.value) }));
  const barStyle = useAnimatedStyle(() => ({ opacity: barAlpha(cyc.value) }));
  const fillStyle = useAnimatedStyle(() => ({ width: `${Math.min(cyc.value, 1) * 100}%` }));
  const pillPosStyle = useAnimatedStyle(() => ({ left: `${Math.min(cyc.value, 1) * 100}%` }));
  const pctProps = useAnimatedProps(() => ({ text: pctText(cyc.value) }));

  return (
    <View testID={testID} style={styles.root}>
      <View style={styles.logoWrap}>
        <SplashBusSvg cyc={cyc} size={210} testID="brand-splash-logo" />
      </View>
      <View style={styles.slot}>
        <Animated.View style={[styles.centered, loadStyle]} testID="splash-loading-text">
          <Text style={styles.status}>{LOADING_LABEL}</Text>
        </Animated.View>
        <Animated.View style={[styles.centered, welcomeStyle]} testID="splash-welcome-text">
          <Text style={styles.status}>{WELCOME_LABEL}</Text>
        </Animated.View>
      </View>
      <Animated.View style={[{ width: barW }, barStyle]} testID="splash-progress" accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100 }}>
        <View style={styles.track}>
          <Animated.View style={[styles.fill, fillStyle]}>
            <LinearGradient colors={['#1e62b5', '#19a992']} end={{ x: 1, y: 0 }} start={{ x: 0, y: 0 }} style={StyleSheet.absoluteFill} />
          </Animated.View>
          <Animated.View style={[styles.pillPos, pillPosStyle]}>
            <ATextInput animatedProps={pctProps} defaultValue="0%" editable={false} style={styles.pill} testID="splash-pill" />
          </Animated.View>
        </View>
        <ATextInput animatedProps={pctProps} defaultValue="0%" editable={false} style={styles.bottom} testID="splash-percent" />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', backgroundColor: SPLASH_BG, flex: 1, justifyContent: 'center' },
  logoWrap: { height: 230, marginBottom: 14, width: 210 },
  slot: { alignItems: 'center', height: 30, justifyContent: 'center', marginBottom: 16 },
  centered: { position: 'absolute' },
  status: { color: INK, fontSize: 19, fontWeight: '500', letterSpacing: -0.2, textAlign: 'center' },
  track: { backgroundColor: '#e9ecef', borderRadius: 10, height: 8, overflow: 'visible' },
  fill: { borderRadius: 10, height: '100%', overflow: 'hidden' },
  pillPos: { marginLeft: -18, position: 'absolute', top: -3 },
  pill: {
    backgroundColor: '#00b87c', borderRadius: 8, color: '#ffffff', elevation: 2, fontSize: 9,
    fontWeight: '700', lineHeight: 11, paddingHorizontal: 6, paddingVertical: 2,
    shadowColor: '#000', shadowOffset: { height: 1, width: 0 }, shadowOpacity: 0.15, shadowRadius: 2,
  },
  bottom: { color: INK, fontSize: 12, fontWeight: '600', marginTop: 8, padding: 0, textAlign: 'center' },
});
