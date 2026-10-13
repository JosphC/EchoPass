import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { fontWeights, useTheme } from '../../../core/theme';
import { useWalletStore } from '../../wallet/walletStore';
import { useRideDetector } from '../hooks/useRideDetector';

export function BoardingPromptModal() {
  const { colors, isDark } = useTheme();
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
  const baseFare = hasPass ? 0 : 3;
  const extraFare = (passengerCount - 1) * 3;
  const totalRon = baseFare + (passengerCount > 1 ? extraFare : 0);
  const totalFormatted = `${totalRon.toFixed(2).replace('.', ',')} lei`;
  const remainingBalance = Math.max(0, balanceRon - totalRon);
  const balanceFormatted = `${remainingBalance.toFixed(2).replace('.', ',')} lei`;

  const breakdownLabel = hasPass
    ? passengerCount === 1
      ? '1 × Abonament activ'
      : `1 ab. + ${passengerCount - 1} × 3,00 lei`
    : `${passengerCount} × 3,00 lei`;

  const payButtonText =
    totalRon === 0 ? 'Validează călătoria' : `Plătește ${totalRon % 1 === 0 ? totalRon : totalRon.toFixed(2).replace('.', ',')} lei`;

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={dismissDetection}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
          <View style={[styles.handle, { backgroundColor: isDark ? '#5F6368' : '#D1D5DB' }]} />

          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.lineBadge}>
              <Text style={styles.lineBadgeText}>{vehicle.line}</Text>
            </View>
            <View style={styles.headerTexts}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>Câte persoane plătești?</Text>
              <Text style={[styles.headerSub, { color: colors.textMuted }]}>{vehicle.destination}</Text>
            </View>
          </View>

          {/* Stepper */}
          <View style={styles.stepperRow}>
            <Pressable
              testID="btn-decrement-passengers"
              disabled={passengerCount <= 1}
              onPress={decrementPassengers}
              hitSlop={10}
              style={({ pressed }) => [
                styles.circleBtn,
                styles.minusBtn,
                {
                  backgroundColor: isDark ? '#303134' : '#F1F4F8',
                  borderColor: colors.border,
                  borderWidth: isDark ? 1 : 0,
                },
                passengerCount <= 1 && styles.btnDisabled,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Ionicons
                name="remove"
                size={24}
                color={passengerCount <= 1 ? (isDark ? '#5F6368' : '#9CA3AF') : colors.text}
              />
            </Pressable>

            <View style={styles.countCol}>
              <Text testID="passenger-count-text" style={[styles.countNumber, { color: colors.text }]}>
                {passengerCount}
              </Text>
              <Text style={[styles.countLabel, { color: colors.textMuted }]}>
                {passengerCount === 1 ? 'persoană' : 'persoane'}
              </Text>
            </View>

            <Pressable
              testID="btn-increment-passengers"
              onPress={incrementPassengers}
              hitSlop={10}
              style={({ pressed }) => [styles.circleBtn, styles.plusBtn, pressed && { opacity: 0.85 }]}
            >
              <Ionicons name="add" size={26} color="#FFFFFF" />
            </Pressable>
          </View>

          {/* Summary Box */}
          <View
            style={[
              styles.summaryBox,
              {
                backgroundColor: isDark ? '#28292A' : '#F3F4F6',
                borderColor: colors.border,
                borderWidth: isDark ? 1 : 0,
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
              <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Sold după plată</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>{balanceFormatted}</Text>
            </View>
          </View>

          {/* Action buttons */}
          <Pressable
            testID="btn-confirm-boarding"
            onPress={() => void confirmBoarding()}
            style={({ pressed }) => [styles.payBtn, { backgroundColor: colors.primary }, pressed && { opacity: 0.88 }]}
          >
            <Text style={styles.payBtnText}>{payButtonText}</Text>
          </Pressable>

          <Pressable
            testID="btn-ignore-boarding"
            onPress={dismissDetection}
            style={({ pressed }) => [styles.cancelBtn, pressed && { opacity: 0.6 }]}
          >
            <Text style={[styles.cancelText, { color: isDark ? '#9AA0A6' : '#4B5563' }]}>Anulează</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(9, 14, 29, 0.65)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 22, paddingTop: 12, paddingBottom: 24 },
  handle: { width: 44, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB', alignSelf: 'center', marginBottom: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 26 },
  lineBadge: { width: 42, height: 42, borderRadius: 10, backgroundColor: '#2A6F86', alignItems: 'center', justifyContent: 'center' },
  lineBadgeText: { color: '#FFFFFF', fontSize: 18, fontWeight: fontWeights.bold },
  headerTexts: { flex: 1, gap: 2 },
  headerTitle: { fontSize: 18, fontWeight: fontWeights.bold },
  headerSub: { fontSize: 13 },
  stepperRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 36, marginBottom: 24 },
  circleBtn: { width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center' },
  minusBtn: { backgroundColor: '#F1F4F8' },
  btnDisabled: { opacity: 0.5 },
  plusBtn: { backgroundColor: '#2563EB' },
  countCol: { alignItems: 'center', minWidth: 80 },
  countNumber: { fontSize: 44, fontWeight: fontWeights.bold, lineHeight: 48 },
  countLabel: { fontSize: 13.5, marginTop: 2 },
  summaryBox: { borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, gap: 10, marginBottom: 18 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: 13.5 },
  summaryValue: { fontSize: 14.5, fontWeight: fontWeights.bold },
  payBtn: { height: 50, borderRadius: 14, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center' },
  payBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: fontWeights.bold },
  cancelBtn: { alignItems: 'center', justifyContent: 'center', paddingVertical: 14 },
  cancelText: { fontSize: 14.5, fontWeight: fontWeights.bold },
});
