import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { fontWeights, useTheme } from '../../../../core/theme';
import type { WalletItem } from '../../types';

interface PassManageCardProps {
  item: Extract<WalletItem, { kind: 'pass' }>;
  onOpenRenew: () => void;
}

const RO_MONTHS_GEN = [
  'ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie',
  'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie',
];

function formatRoDate(iso: string): string {
  const parts = iso.split('-');
  if (parts.length === 3) {
    const day = parseInt(parts[2] ?? '1', 10);
    const monthIdx = parseInt(parts[1] ?? '1', 10) - 1;
    const monthName = RO_MONTHS_GEN[monthIdx] ?? '';
    const year = parts[0];
    return `${day} ${monthName} ${year}`;
  }
  return iso;
}

export function PassManageCard({ item, onOpenRenew }: PassManageCardProps) {
  const { colors } = useTheme();
  const diffMs = new Date(item.validUntil).getTime() - Date.now();
  const daysLeft = Math.max(0, Math.ceil(diffMs / 86_400_000));

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Top section: Kicker, Days left, Title */}
      <View style={styles.topSection}>
        <View style={styles.headerRow}>
          <Text style={[styles.kicker, { color: colors.textMuted }]}>Abonament activ</Text>
          <Text style={styles.daysLeftText}>{daysLeft} zile rămase</Text>
        </View>
        <Text style={[styles.title, { color: colors.text }]}>Abonament STPT Timișoara</Text>
      </View>

      {/* Details list: Valabil până la, Acoperire */}
      <View style={[styles.detailRow, { borderTopColor: colors.border }]}>
        <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Valabil până la</Text>
        <Text style={[styles.detailValue, { color: colors.text }]}>{formatRoDate(item.validUntil)}</Text>
      </View>
      <View style={[styles.detailRow, { borderTopColor: colors.border }]}>
        <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Acoperire</Text>
        <Text style={[styles.detailValue, { color: colors.text }]}>
          {item.lines === 'all' ? 'Toate liniile urbane STPT' : item.lines.join(', ')}
        </Text>
      </View>

      {/* Bottom action: Centered blue action link */}
      <Pressable
        testID="btn-renew-pass"
        accessibilityRole="button"
        accessibilityLabel="Reînnoiește abonamentul"
        onPress={onOpenRenew}
        style={({ pressed }) => [styles.renewBtn, { borderTopColor: colors.border, opacity: pressed ? 0.75 : 1 }]}
      >
        <Ionicons name="reload-outline" size={17} color="#2563EB" />
        <Text style={styles.renewBtnText}>Reînnoiește abonamentul</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  topSection: {
    padding: 16,
    paddingBottom: 14,
    gap: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kicker: {
    fontSize: 13,
    fontWeight: fontWeights.medium,
  },
  daysLeftText: {
    fontSize: 13.5,
    fontWeight: fontWeights.semiBold,
    color: '#16A34A',
  },
  title: {
    fontSize: 16,
    fontWeight: fontWeights.bold,
    marginTop: 2,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: fontWeights.bold,
  },
  renewBtn: {
    borderTopWidth: 1,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  renewBtnText: {
    color: '#2563EB',
    fontSize: 15,
    fontWeight: fontWeights.bold,
  },
});
