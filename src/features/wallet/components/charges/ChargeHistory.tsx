import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { formatLei, formatShortDateTime } from '../../../../core/utils/format';
import type { Charge, ChargeStatus } from '../../types';
import { t } from '../../../../core/i18n';
import { fontSizes, fontWeights, spacing } from '../../../../core/theme';
import { useTheme } from '../../../../core/theme/useTheme';
import { ChevronRight, LineBadge } from '../../../../ui';

export function statusLabel(status: ChargeStatus): string {
  if (status === 'in_progress') return t('wallet.inProgress');
  if (status === 'capped') return t('wallet.capped');
  if (status === 'covered_by_pass') return t('wallet.coveredByPass');
  if (status === 'cancelled') return t('wallet.cancelled');
  return t('wallet.completed');
}

interface ChargeHistoryProps {
  charges: Charge[];
  onOpen?: (id: string) => void;
  maxItems?: number;
  onViewAll?: () => void;
}

export function ChargeHistory({ charges, onOpen, maxItems, onViewAll }: ChargeHistoryProps) {
  const { colors } = useTheme();
  const allVisible = charges.filter((c) => c.status !== 'cancelled');
  const visible = typeof maxItems === 'number' ? allVisible.slice(0, maxItems) : allVisible;

  if (visible.length === 0) return null;

  return (
    <View style={styles.root}>
      <Text style={[styles.title, { color: colors.text }]}>Ultima activitate</Text>
      {visible.map((charge) => (
        <Pressable
          key={charge.id}
          accessibilityRole="button"
          onPress={() => {
            if (onOpen) onOpen(charge.id);
            else if (onViewAll) onViewAll();
          }}
          style={[styles.row, { borderBottomColor: colors.border }]}
        >
          <Ionicons name="bus" size={20} color={colors.text} />
          <LineBadge shortName={charge.line} />
          <View style={styles.texts}>
            <Text style={[styles.line, { color: colors.text }]}>
              {charge.destination ?? `Linia ${charge.line}`}
            </Text>
            <Text style={[styles.sub, { color: colors.textMuted }]}>
              {formatShortDateTime(charge.startedAt)} · {formatLei(charge.amount)}
            </Text>
          </View>
          <Text
            style={[
              styles.status,
              { color: charge.status === 'in_progress' ? colors.primary : colors.textMuted },
            ]}
          >
            {statusLabel(charge.status)}
          </Text>
          <ChevronRight size={18} />
        </Pressable>
      ))}
      {onViewAll ? (
        <Pressable
          testID="btn-view-all-trips"
          accessibilityRole="button"
          accessibilityLabel="Vezi tot istoricul în Călătorii"
          onPress={onViewAll}
          style={({ pressed }) => [styles.viewAllRow, { opacity: pressed ? 0.7 : 1 }]}
        >
          <Text style={[styles.viewAllText, { color: colors.primary }]}>
            Vezi tot istoricul în Călătorii →
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.xs,
  },
  title: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: 64,
  },
  texts: {
    flex: 1,
    gap: 2,
  },
  line: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium,
  },
  sub: {
    fontSize: fontSizes.sm,
  },
  status: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
  },
  viewAllRow: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewAllText: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semiBold,
  },
});
