import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { getLocale, t } from '../../../../core/i18n';
import { fontWeights, useTheme } from '../../../../core/theme';
import type { WalletItem } from '../../types';

interface PassManageCardProps {
  item: Extract<WalletItem, { kind: 'pass' }>;
  onOpenRenew: () => void;
}

const DAY_MS = 86_400_000;
/** From this many days left the ring turns amber. */
const EXPIRING_DAYS = 5;
const RING = 92;
const STROKE = 8;
const RADIUS = (RING - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function longDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(getLocale() === 'ro' ? 'ro-RO' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

/**
 * Google (Material 3) style pass panel: a progress ring with the days left
 * in its centre (like Google Fit / Pixel battery), the expiry date beside it,
 * coverage as an icon row and one filled pill action.
 */
export function PassManageCard({ item, onOpenRenew }: PassManageCardProps) {
  const { colors } = useTheme();
  const endMs = new Date(item.validUntil).getTime();
  const totalDays = Math.max(1, Math.round((endMs - new Date(item.validFrom).getTime()) / DAY_MS));
  const daysLeft = Math.max(0, Math.ceil((endMs - Date.now()) / DAY_MS));
  const expired = daysLeft === 0;
  const expiring = !expired && daysLeft <= EXPIRING_DAYS;
  const ringColor = expired ? colors.danger : expiring ? colors.warning : colors.primary;
  const daysWord = daysLeft === 1 ? t('common.day') : t('common.days');
  const coverage = item.lines === 'all' ? t('pass.allLines') : item.lines.join(', ');
  const dash = CIRCUMFERENCE * Math.min(1, daysLeft / totalDays);

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={styles.top}>
        <View
          style={styles.ring}
          accessible
          accessibilityLabel={`${daysLeft} ${daysWord} ${t('pass.remainingOf')} ${totalDays}`}
        >
          <Svg width={RING} height={RING}>
            <Circle cx={RING / 2} cy={RING / 2} r={RADIUS} stroke={colors.border} strokeWidth={STROKE} fill="none" />
            <Circle
              cx={RING / 2}
              cy={RING / 2}
              r={RADIUS}
              stroke={ringColor}
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={`${dash} ${CIRCUMFERENCE}`}
              fill="none"
              transform={`rotate(-90 ${RING / 2} ${RING / 2})`}
            />
          </Svg>
          <View style={styles.ringCenter}>
            <Text style={[styles.ringNumber, { color: colors.text }]}>{daysLeft}</Text>
            <Text style={[styles.ringUnit, { color: colors.textMuted }]}>{daysWord}</Text>
          </View>
        </View>

        <View style={styles.topText}>
          <View style={[styles.chip, { backgroundColor: expired ? colors.dangerSoft : colors.fill }]}>
            <View style={[styles.dot, { backgroundColor: expired ? colors.danger : expiring ? colors.warning : colors.success }]} />
            <Text style={[styles.chipText, { color: expired ? colors.danger : colors.textMuted }]}>
              {expired ? t('pass.expired') : t('pass.activeShort')}
            </Text>
          </View>
          <Text style={[styles.label, { color: colors.textMuted }]}>{t('wallet.validUntil')}</Text>
          <Text style={[styles.date, { color: colors.text }]}>{longDate(item.validUntil)}</Text>
        </View>
      </View>

      <View style={[styles.infoRow, { borderTopColor: colors.border }]}>
        <View style={[styles.infoIcon, { backgroundColor: colors.fill }]}>
          <Ionicons name="bus-outline" size={18} color={colors.text} />
        </View>
        <View style={styles.infoText}>
          <Text style={[styles.label, { color: colors.textMuted }]}>{t('pass.coverage')}</Text>
          <Text numberOfLines={2} style={[styles.infoValue, { color: colors.text }]}>{coverage}</Text>
        </View>
      </View>

      <Pressable
        testID="btn-renew-pass"
        accessibilityRole="button"
        accessibilityLabel={t('pass.renew')}
        onPress={onOpenRenew}
        style={({ pressed }) => [styles.renewBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]}
      >
        <Ionicons name="refresh" size={18} color={colors.onPrimary} />
        <Text style={[styles.renewText, { color: colors.onPrimary }]}>{t('pass.renew')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 24, padding: 20 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  ring: { width: RING, height: RING },
  ringCenter: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  ringNumber: { fontSize: 28, fontWeight: fontWeights.bold, letterSpacing: -0.5, lineHeight: 32 },
  ringUnit: { fontSize: 12.5 },
  topText: { flex: 1, alignItems: 'flex-start' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  chipText: { fontSize: 13, fontWeight: fontWeights.semiBold },
  label: { fontSize: 12.5, letterSpacing: 0.2, marginTop: 10 },
  date: { fontSize: 19, fontWeight: fontWeights.bold, letterSpacing: -0.3, marginTop: 2 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 20, paddingTop: 6, borderTopWidth: StyleSheet.hairlineWidth },
  infoIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  infoText: { flex: 1 },
  infoValue: { fontSize: 15, fontWeight: fontWeights.medium, marginTop: 2 },
  renewBtn: { flexDirection: 'row', gap: 8, marginTop: 20, borderRadius: 999, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  renewText: { fontSize: 15, fontWeight: fontWeights.semiBold },
});
