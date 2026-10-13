import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { fontWeights, useTheme } from '../../../core/theme';
import { useRideDetector } from '../hooks/useRideDetector';

export function BleSimulationBar() {
  const { colors } = useTheme();
  const { status, activeTicket, toastMessage, simulateBoarding, simulateTransfer, clearRide, resetAll, setToastMessage } = useRideDetector();

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 3500);
    return () => clearTimeout(timer);
  }, [toastMessage, setToastMessage]);

  const isTransferToast = Boolean(toastMessage?.includes('Transbordare'));
  const hasTicket = Boolean(activeTicket && activeTicket.expiresAtMs > Date.now());

  return (
    <View style={styles.container}>
      {toastMessage ? (
        <Pressable testID="ride-toast-banner" onPress={() => setToastMessage(null)} style={[styles.toastCard, isTransferToast && styles.transferCard]}>
          <View style={styles.toastIconWrap}>
            <Ionicons name={isTransferToast ? 'swap-horizontal' : 'checkmark'} size={20} color="#FFFFFF" />
          </View>
          <View style={styles.toastTexts}>
            <Text style={styles.toastTitle}>{isTransferToast ? 'Transbordare Gratuită' : 'Validat cu succes'}</Text>
            <Text numberOfLines={1} style={styles.toastSub}>{toastMessage}</Text>
          </View>
        </Pressable>
      ) : null}

      {!toastMessage ? (
        status === 'active' ? (
          <Pressable
            testID="btn-simulate-ble-exit"
            onPress={() => clearRide()}
            hitSlop={10}
            style={({ pressed }) => [styles.simChip, { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.75 : 1 }]}
          >
            <Ionicons name="exit-outline" size={13} color="#D97706" />
            <Text style={[styles.simText, { color: colors.textMuted }]}>Simulează ieșire semnal BLE</Text>
          </Pressable>
        ) : hasTicket ? (
          <View style={styles.chipsRow}>
            <Pressable
              testID="btn-simulate-transfer"
              onPress={() => simulateTransfer()}
              hitSlop={10}
              style={({ pressed }) => [styles.simChip, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE', opacity: pressed ? 0.75 : 1 }]}
            >
              <Ionicons name="swap-horizontal" size={13} color="#2563EB" />
              <Text style={[styles.simText, { color: '#1D4ED8' }]}>Simulează transbordare (Linia 1)</Text>
            </Pressable>
            <Pressable
              testID="btn-reset-simulation"
              onPress={() => resetAll()}
              hitSlop={10}
              style={({ pressed }) => [styles.simChip, { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.75 : 1 }]}
            >
              <Ionicons name="refresh-outline" size={13} color={colors.textMuted} />
              <Text style={[styles.simText, { color: colors.textMuted }]}>Reset</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            testID="btn-simulate-ble-boarding"
            onPress={() => simulateBoarding()}
            hitSlop={10}
            style={({ pressed }) => [styles.simChip, { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.75 : 1 }]}
          >
            <Ionicons name="bluetooth" size={13} color="#2563EB" />
            <Text style={[styles.simText, { color: colors.text }]}>Simulează urcare BLE (Linia 15)</Text>
          </Pressable>
        )
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 2, gap: 6 },
  toastCard: { backgroundColor: '#286F4E', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  transferCard: { backgroundColor: '#1E40AF' },
  toastIconWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255, 255, 255, 0.22)', alignItems: 'center', justifyContent: 'center' },
  toastTexts: { flex: 1, gap: 2 },
  toastTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: fontWeights.bold },
  toastSub: { color: 'rgba(255, 255, 255, 0.9)', fontSize: 13 },
  chipsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  simChip: { flexDirection: 'row', alignItems: 'center', alignSelf: 'center', gap: 6, paddingHorizontal: 12, height: 28, borderRadius: 14, borderWidth: 1 },
  simText: { fontSize: 11.5, fontWeight: fontWeights.medium },
});
