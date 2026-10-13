import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { t } from '../../../../core/i18n';
import { fontSizes, fontWeights, radius, spacing } from '../../../../core/theme';
import type { WalletItem } from '../../types';
import { cardGradientFor } from './cardThemes';
import { CardBackdrop, CardChip, NetworkLogo } from './cardParts';

interface WalletCardProps {
  item: Extract<WalletItem, { kind: 'card' }>;
  isDefault: boolean;
  expanded: boolean;
}

const MONO = Platform.select({ ios: 'Courier', android: 'monospace', default: 'monospace' });

export function WalletCard({ item, isDefault, expanded }: WalletCardProps) {
  const gradient = cardGradientFor(item.network);
  const bank = item.bank ?? t('wallet.card');
  const tagLabel = item.tag ?? (isDefault ? t('wallet.usedForPayment') : null);

  return (
    <View style={[styles.wrap, { backgroundColor: gradient.from, shadowColor: gradient.glow }]}>
      <LinearGradient colors={[gradient.from, gradient.to]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
        <CardBackdrop />
        <View style={styles.body}>
          <View style={styles.top}>
            <Text style={styles.bank}>{bank}</Text>
            {tagLabel ? (
              <View style={styles.tag}>
                {!item.tag && isDefault ? <Ionicons name="checkmark" size={14} color="#FFFFFF" /> : null}
                <Text style={styles.tagText}>{tagLabel}</Text>
              </View>
            ) : null}
          </View>
          <CardChip />
          <Text style={styles.number}>•••• •••• •••• {item.last4}</Text>
          {expanded ? (
            <View style={styles.bottom}>
              <View style={styles.col}>
                <Text style={styles.lab}>{t('wallet.cardHolder')}</Text>
                <Text style={styles.val}>{item.holder.toUpperCase()}</Text>
              </View>
              <View style={styles.col}>
                <Text style={styles.lab}>{t('wallet.expires')}</Text>
                <Text style={[styles.val, { fontFamily: MONO }]}>{item.expiry}</Text>
              </View>
              <NetworkLogo network={item.network} />
            </View>
          ) : null}
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    aspectRatio: 1.586,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  card: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  body: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bank: {
    color: '#FFFFFF',
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semiBold,
  },
  number: {
    color: '#FFFFFF',
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.medium,
    fontFamily: MONO,
    letterSpacing: 2,
  },
  bottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  col: {
    gap: 3,
  },
  lab: {
    color: '#FFFFFF',
    opacity: 0.65,
    fontSize: fontSizes.xs,
    letterSpacing: 1,
  },
  val: {
    color: '#FFFFFF',
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium,
  },
});
