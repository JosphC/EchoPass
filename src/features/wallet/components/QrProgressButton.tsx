import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { fontWeights } from '../../../core/theme';

interface QrProgressButtonProps {
  /** Remaining-time percent (0–100). Vivid fill shrinks, pale base drains. */
  progressPercent: number;
  onPress: () => void;
}

/**
 * "Show QR" button that depletes with time instead of a separate progress
 * bar: vivid blue = remaining, pale blue = drained. The label renders in two
 * tones (white over vivid, dark blue over pale) so it stays readable.
 */
export function QrProgressButton({ progressPercent, onPress }: QrProgressButtonProps) {
  const [btnWidth, setBtnWidth] = useState(0);

  return (
    <Pressable
      testID="show-qr-button"
      accessibilityRole="button"
      accessibilityLabel="Arată codul QR"
      onPress={onPress}
      onLayout={(e) => setBtnWidth(e.nativeEvent.layout.width)}
      style={({ pressed }) => [styles.qrButton, { opacity: pressed ? 0.9 : 1 }]}
    >
      <View style={[styles.qrFill, { width: `${progressPercent}%` }]} />
      <View
        style={styles.qrLabelLayer}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Ionicons name="qr-code-outline" size={20} color="#1D4ED8" />
        <Text style={[styles.qrButtonText, { color: '#1D4ED8' }]}>Arată codul QR</Text>
      </View>
      {btnWidth > 0 && (
        <View style={[styles.qrLabelClip, { width: (btnWidth * progressPercent) / 100 }]}>
          <View style={[styles.qrLabelInner, { width: btnWidth }]}>
            <Ionicons name="qr-code-outline" size={20} color="#FFFFFF" />
            <Text style={styles.qrButtonText}>Arată codul QR</Text>
          </View>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  qrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 46,
    borderRadius: 12,
    backgroundColor: '#DBEAFE',
    overflow: 'hidden',
  },
  qrFill: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: '#2563EB' },
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
  qrButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: fontWeights.bold },
});
