import { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import LogoImage from '../../../assets/icon.png';

interface BrandSplashProps {
  testID?: string;
}

export function BrandSplash({ testID }: BrandSplashProps) {
  const scale = useRef(new Animated.Value(0.92)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 450, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, damping: 14, stiffness: 120, useNativeDriver: true }),
    ]).start();
  }, [opacity, scale]);

  return (
    <LinearGradient
      testID={testID}
      colors={['#2563EB', '#14B8A6']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.root}
    >
      <Animated.View style={{ opacity, transform: [{ scale }] }}>
        <Image source={LogoImage} style={styles.logo} resizeMode="contain" accessible accessibilityLabel="EchoPass" />
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  logo: {
    height: 240,
    width: 240,
  },
});
