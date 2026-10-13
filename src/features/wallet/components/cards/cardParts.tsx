import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import { Circle, Path, Svg } from 'react-native-svg';
import { t } from '../../../../core/i18n';
import { fontSizes, fontWeights } from '../../../../core/theme';
import type { CardNetwork } from '../../types';

const RING_RADII = [40, 68, 96, 124, 152, 180];

/** Soft top-right highlight + faint concentric rings over the card gradient. */
export function CardBackdrop() {
  return (
    <>
      <LinearGradient
        colors={['rgba(255,255,255,0.22)', 'rgba(255,255,255,0)']}
        start={{ x: 1, y: 0 }}
        end={{ x: 0.3, y: 0.7 }}
        style={StyleSheet.absoluteFill}
      />
      <Svg style={StyleSheet.absoluteFill} viewBox="0 0 340 214" preserveAspectRatio="xMidYMid slice">
        {RING_RADII.map((r) => (
          <Circle key={r} cx={300} cy={40} r={r} fill="none" stroke="#FFFFFF" strokeOpacity={0.07} strokeWidth={1} />
        ))}
      </Svg>
    </>
  );
}

/** Gold EMV chip with contactless waves. */
export function CardChip() {
  return (
    <View style={styles.chipRow}>
      <LinearGradient
        colors={['#F7DD8E', '#D9B45C', '#9A7633', '#E9C46F']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.chip}
      >
        <View style={styles.chipH} />
        <View style={[styles.chipV, { left: 16 }]} />
        <View style={[styles.chipV, { left: 34 }]} />
      </LinearGradient>
      <Svg width={30} height={30} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round">
        <Path d="M6 9a8 8 0 0 1 0 6" />
        <Path d="M9.5 6.5a12 12 0 0 1 0 11" />
        <Path d="M13 4a16 16 0 0 1 0 16" />
      </Svg>
    </View>
  );
}

/** Network mark, bottom-right: italic VISA or overlapping MC circles. */
export function NetworkLogo({ network }: { network: CardNetwork }) {
  if (network === 'mastercard') {
    return (
      <View testID="network-mastercard" style={styles.mc}>
        <View style={[styles.mcDot, { backgroundColor: '#EB001B' }]} />
        <View style={[styles.mcDot, { backgroundColor: '#F79E1B', marginLeft: -12, opacity: 0.92 }]} />
      </View>
    );
  }
  if (network === 'visa') {
    return <Text style={styles.visa}>VISA</Text>;
  }
  return <Text style={styles.other}>{t('wallet.otherNetwork')}</Text>;
}

const styles = StyleSheet.create({
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  chip: {
    width: 52,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(90,60,10,0.4)',
    overflow: 'hidden',
  },
  chipH: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 19,
    height: 1,
    backgroundColor: 'rgba(90,60,10,0.55)',
  },
  chipV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(90,60,10,0.55)',
  },
  mc: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mcDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  visa: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: fontWeights.bold,
    fontStyle: 'italic',
    letterSpacing: 1.5,
  },
  other: {
    color: '#FFFFFF',
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semiBold,
  },
});
