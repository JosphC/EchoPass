import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { t } from '../../../core/i18n';
import { fontWeights, useTheme } from '../../../core/theme';

interface QrProgressButtonProps {
  /** Remaining-time percent (0–100). Blue fill shrinks over a neutral base. */
  progressPercent: number;
  onPress: () => void;
}

/**
 * "Show QR" button that depletes with time instead of a separate progress
 * bar: blue = remaining, neutral grey = drained. The label renders in two
 * tones (white over blue, text colour over the neutral drained part) so it stays readable.
 */
export function QrProgressButton({ progressPercent, onPress }: QrProgressButtonProps) {
  const { colors } = useTheme();
  const [btnWidth, setBtnWidth] = useState(0);

  return (
    <Pressable
      testID="show-qr-button"
      accessibilityRole="button"
      accessibilityLabel={t('ride.showQr')}
      onPress={onPress}
      onLayout={(e) => setBtnWidth(e.nativeEvent.layout.width)}
      style={({ pressed }) => [styles.qrButton, { backgroundColor: colors.fill, opacity: pressed ? 0.9 : 1 }]}
    >
      <View style={[styles.qrFill, { backgroundColor: colors.primary, width: `${progressPercent}%` }]} />
      <View
        style={styles.qrLabelLayer}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Ionicons name="qr-code-outline" size={19} color={colors.text} />
        <Text style={[styles.qrButtonText, { color: colors.text }]}>{t('ride.showQr')}</Text>
      </View>
      {btnWidth > 0 && (
        <View style={[styles.qrLabelClip, { width: (btnWidth * progressPercent) / 100 }]}>
          <View style={[styles.qrLabelInner, { width: btnWidth }]}>
            <Ionicons name="qr-code-outline" size={19} color={colors.onPrimary} />
            <Text style={[styles.qrButtonText, { color: colors.onPrimary }]}>{t('ride.showQr')}</Text>
          </View>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Pill like the pass "Renew" button.
  qrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 999,
    overflow: 'hidden',
  },
  qrFill: { position: 'absolute', left: 0, top: 0, bottom: 0 },
  qrLabelLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  qrLabelClip: { position: 'absolute', left: 0, top: 0, bottom: 0, overflow: 'hidden' },
  qrLabelInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: '100%' },
  qrButtonText: { fontSize: 15, fontWeight: fontWeights.semiBold },
});
