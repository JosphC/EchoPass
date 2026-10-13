import { Image, StyleSheet, Text, View } from 'react-native';
import type { WalletItem } from '../../types';
import { PASS_WARNING_DAYS } from '../../../../core/config';
import { fontSizes, fontWeights, radius, spacing } from '../../../../core/theme';
import { t } from '../../../../core/i18n';
import PassArt from '../../../../assets/stpt-abonament.jpg';

interface PassCardViewProps {
  item: Extract<WalletItem, { kind: 'pass' }>;
  isDefault?: boolean;
  nowMs?: number;
}

export function daysLeft(validUntil: string, nowMs: number): number {
  return Math.max(0, Math.ceil((new Date(validUntil).getTime() - nowMs) / 86_400_000));
}

export function PassCardView({ item, nowMs = Date.now() }: PassCardViewProps) {
  const left = daysLeft(item.validUntil, nowMs);
  const expired = left <= 0;
  const warning = !expired && left < PASS_WARNING_DAYS;

  return (
    <View style={styles.card}>
      <Image source={PassArt} style={styles.image} resizeMode="contain" fadeDuration={0} />
      {expired || warning ? (
        <View style={styles.chips}>
          <View style={[styles.chip, expired ? styles.expired : styles.warning]}>
            <Text style={styles.chipText}>
              {expired ? t('wallet.expired') : t('wallet.expiringSoon')}
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    // Same as bank cards (WalletCard): standard card ratio 1.586.
    aspectRatio: 1.586,
    backgroundColor: '#5E2A84',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  image: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  chips: {
    position: 'absolute',
    left: spacing.lg,
    top: 76,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  warning: {
    backgroundColor: '#D97706',
  },
  expired: {
    backgroundColor: '#DC2626',
  },
  chipText: {
    color: '#FFFFFF',
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semiBold,
  },
});
