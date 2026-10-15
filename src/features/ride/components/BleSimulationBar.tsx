import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { t } from '../../../core/i18n';
import { fontWeights, useTheme } from '../../../core/theme';
import { useRideDetector } from '../hooks/useRideDetector';

/** Simulation chips are a developer tool: never shown to riders in release builds. */
const SHOW_SIMULATION = __DEV__;

/** Ride confirmation toast (always) + BLE simulation chips (dev builds only). */
export function BleSimulationBar() {
  const { colors } = useTheme();
  const { status, activeTicket, toastMessage, simulateBoarding, simulateTransfer, clearRide, resetAll, setToastMessage } = useRideDetector();

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 3500);
    return () => clearTimeout(timer);
  }, [toastMessage, setToastMessage]);

  const isTransferToast = Boolean(toastMessage?.startsWith(t('ride.freeTransfer')));
  const hasTicket = Boolean(activeTicket && activeTicket.expiresAtMs > Date.now());

  return (
    <View style={styles.container}>
      {toastMessage ? (
        <Pressable
          testID="ride-toast-banner"
          accessibilityRole="button"
          accessibilityLabel={toastMessage}
          onPress={() => setToastMessage(null)}
          style={[styles.toastCard, { backgroundColor: colors.text }]}
        >
          <View style={[styles.toastIconWrap, { backgroundColor: isTransferToast ? colors.primary : colors.success }]}>
            <Ionicons name={isTransferToast ? 'swap-horizontal' : 'checkmark'} size={20} color={colors.onPrimary} />
          </View>
          <View style={styles.toastTexts}>
            <Text style={[styles.toastTitle, { color: colors.background }]}>
              {isTransferToast ? t('ride.freeTransfer') : t('ride.validated')}
            </Text>
            <Text numberOfLines={1} style={[styles.toastSub, { color: colors.background }]}>
              {toastMessage}
            </Text>
          </View>
        </Pressable>
      ) : null}

      {!toastMessage && SHOW_SIMULATION ? (
        status === 'active' ? (
          <Pressable
            testID="btn-simulate-ble-exit"
            accessibilityRole="button"
            accessibilityLabel={t('ride.simExit')}
            onPress={() => clearRide()}
            hitSlop={10}
            style={({ pressed }) => [styles.simChip, { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.75 : 1 }]}
          >
            <Ionicons name="exit-outline" size={13} color={colors.warning} />
            <Text style={[styles.simText, { color: colors.textMuted }]}>{t('ride.simExit')}</Text>
          </Pressable>
        ) : hasTicket ? (
          <View style={styles.chipsRow}>
            <Pressable
              testID="btn-simulate-transfer"
              accessibilityRole="button"
              accessibilityLabel={t('ride.simTransfer')}
              onPress={() => simulateTransfer()}
              hitSlop={10}
              style={({ pressed }) => [styles.simChip, { backgroundColor: colors.primarySoft, borderColor: colors.rail, opacity: pressed ? 0.75 : 1 }]}
            >
              <Ionicons name="swap-horizontal" size={13} color={colors.primary} />
              <Text style={[styles.simText, { color: colors.primary }]}>{t('ride.simTransfer')}</Text>
            </Pressable>
            <Pressable
              testID="btn-reset-simulation"
              accessibilityRole="button"
              accessibilityLabel={t('ride.simReset')}
              onPress={() => resetAll()}
              hitSlop={10}
              style={({ pressed }) => [styles.simChip, { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.75 : 1 }]}
            >
              <Ionicons name="refresh-outline" size={13} color={colors.textMuted} />
              <Text style={[styles.simText, { color: colors.textMuted }]}>{t('ride.simReset')}</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            testID="btn-simulate-ble-boarding"
            accessibilityRole="button"
            accessibilityLabel={t('ride.simBoard')}
            onPress={() => simulateBoarding()}
            hitSlop={10}
            style={({ pressed }) => [styles.simChip, { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.75 : 1 }]}
          >
            <Ionicons name="bluetooth" size={13} color={colors.primary} />
            <Text style={[styles.simText, { color: colors.text }]}>{t('ride.simBoard')}</Text>
          </Pressable>
        )
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 2, gap: 6 },
  toastCard: { borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  toastIconWrap: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  toastTexts: { flex: 1, gap: 2 },
  toastTitle: { fontSize: 15, fontWeight: fontWeights.semiBold },
  toastSub: { fontSize: 13, opacity: 0.8 },
  chipsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  simChip: { flexDirection: 'row', alignItems: 'center', alignSelf: 'center', gap: 6, paddingHorizontal: 12, height: 28, borderRadius: 14, borderWidth: 1 },
  simText: { fontSize: 11.5, fontWeight: fontWeights.medium },
});
