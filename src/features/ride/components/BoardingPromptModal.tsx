import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SINGLE_FARE_RON } from '../../../core/config';
import { t } from '../../../core/i18n';
import { fontWeights, useTheme } from '../../../core/theme';
import { findRoute } from '../../../services/repositories/gtfs/timetable';
import { LineBadge } from '../../../ui';
import { useWalletStore } from '../../wallet/walletStore';
import { useRideDetector } from '../hooks/useRideDetector';

export function BoardingPromptModal() {
  const { colors } = useTheme();
  const {
    status,
    detectedVehicle,
    passengerCount,
    incrementPassengers,
    decrementPassengers,
    dismissDetection,
    confirmBoarding,
  } = useRideDetector();
  const items = useWalletStore((s) => s.items);
  const balanceRon = useWalletStore((s) => s.balanceRon);

  const isOpen = status === 'detected' && detectedVehicle !== null;
  const vehicle = detectedVehicle ?? {
    line: '15',
    destination: 'T. Grozăvescu (Poșta Mare)',
  };

  const hasPass = items.some((i) => i.kind === 'pass');
  const baseFare = hasPass ? 0 : SINGLE_FARE_RON;
  const extraFare = (passengerCount - 1) * SINGLE_FARE_RON;
  const fareText = `${SINGLE_FARE_RON.toFixed(2).replace('.', ',')} lei`;
  const route = findRoute(vehicle.line);
  const totalRon = baseFare + (passengerCount > 1 ? extraFare : 0);
  const totalFormatted = `${totalRon.toFixed(2).replace('.', ',')} lei`;
  const remainingBalance = Math.max(0, balanceRon - totalRon);
  const balanceFormatted = `${remainingBalance.toFixed(2).replace('.', ',')} lei`;

  const breakdownLabel = hasPass
    ? passengerCount === 1
      ? t('ride.passOne')
      : `${t('ride.passShort')} + ${passengerCount - 1} × ${fareText}`
    : `${passengerCount} × ${fareText}`;

  const payButtonText =
    totalRon === 0 ? t('ride.validate') : `${t('ride.pay')} ${totalRon % 1 === 0 ? totalRon : totalRon.toFixed(2).replace('.', ',')} lei`;

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={dismissDetection}>
      <View style={[styles.backdrop, { backgroundColor: colors.scrim }]}>
        <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
          <View style={[styles.handle, { backgroundColor: colors.handle }]} />

          {/* Header */}
          <View style={styles.headerRow}>
            <LineBadge shortName={vehicle.line} color={route?.color ?? undefined} textColor={route?.textColor ?? undefined} size="lg" />
            <View style={styles.headerTexts}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>{t('ride.howMany')}</Text>
              <Text style={[styles.headerSub, { color: colors.textMuted }]}>{vehicle.destination}</Text>
            </View>
          </View>

          {/* Stepper */}
          <View style={styles.stepperRow}>
            <Pressable
              testID="btn-decrement-passengers"
              accessibilityRole="button"
              accessibilityLabel={t('ride.decrease')}
              disabled={passengerCount <= 1}
              onPress={decrementPassengers}
              hitSlop={10}
              style={({ pressed }) => [
                styles.circleBtn,
                styles.minusBtn,
                {
                  backgroundColor: colors.fill,
                },
                passengerCount <= 1 && styles.btnDisabled,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Ionicons
                name="remove"
                size={24}
                color={passengerCount <= 1 ? (colors.placeholder) : colors.text}
              />
            </Pressable>

            <View style={styles.countCol}>
              <Text testID="passenger-count-text" style={[styles.countNumber, { color: colors.text }]}>
                {passengerCount}
              </Text>
              <Text style={[styles.countLabel, { color: colors.textMuted }]}>
                {passengerCount === 1 ? t('ride.person') : t('ride.people')}
              </Text>
            </View>

            <Pressable
              testID="btn-increment-passengers"
              accessibilityRole="button"
              accessibilityLabel={t('ride.increase')}
              onPress={incrementPassengers}
              hitSlop={10}
              style={({ pressed }) => [styles.circleBtn, { backgroundColor: colors.primary }, pressed && { opacity: 0.85 }]}
            >
              <Ionicons name="add" size={26} color={colors.onPrimary} />
            </Pressable>
          </View>

          {/* Summary Box */}
          <View
            style={[
              styles.summaryBox,
              {
                backgroundColor: colors.fill,
              },
            ]}
          >
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>{breakdownLabel}</Text>
              <Text testID="total-fare-text" style={[styles.summaryValue, { color: colors.text }]}>
                {totalFormatted}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>{t('ride.balanceAfter')}</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>{balanceFormatted}</Text>
            </View>
          </View>

          {/* Action buttons */}
          <Pressable
            testID="btn-confirm-boarding"
            accessibilityRole="button"
            accessibilityLabel={payButtonText}
            onPress={() => void confirmBoarding()}
            style={({ pressed }) => [styles.payBtn, { backgroundColor: colors.primary }, pressed && { opacity: 0.88 }]}
          >
            <Text style={[styles.payBtnText, { color: colors.onPrimary }]}>{payButtonText}</Text>
          </Pressable>

          <Pressable
            testID="btn-ignore-boarding"
            accessibilityRole="button"
            accessibilityLabel={t('ride.cancel')}
            onPress={dismissDetection}
            style={({ pressed }) => [styles.cancelBtn, pressed && { opacity: 0.6 }]}
          >
            <Text style={[styles.cancelText, { color: colors.textMuted }]}>{t('ride.cancel')}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 22, paddingTop: 12, paddingBottom: 24 },
  handle: { width: 44, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 26 },
  headerTexts: { flex: 1, gap: 2 },
  headerTitle: { fontSize: 18, fontWeight: fontWeights.bold },
  headerSub: { fontSize: 13 },
  stepperRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 36, marginBottom: 24 },
  circleBtn: { width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center' },
  minusBtn: {},
  btnDisabled: { opacity: 0.5 },
  countCol: { alignItems: 'center', minWidth: 80 },
  countNumber: { fontSize: 44, fontWeight: fontWeights.bold, lineHeight: 48 },
  countLabel: { fontSize: 13.5, marginTop: 2 },
  summaryBox: { borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, gap: 10, marginBottom: 18 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: 13.5 },
  summaryValue: { fontSize: 14.5, fontWeight: fontWeights.bold },
  payBtn: { height: 50, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  payBtnText: { fontSize: 16, fontWeight: fontWeights.bold },
  cancelBtn: { alignItems: 'center', justifyContent: 'center', paddingVertical: 14 },
  cancelText: { fontSize: 14.5, fontWeight: fontWeights.bold },
});
