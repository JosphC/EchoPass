import { StyleSheet, Text, View } from 'react-native';
import { t } from '../../../core/i18n';
import { fontSizes, fontWeights, spacing } from '../../../core/theme';
import { useTheme } from '../../../core/theme/useTheme';
import { Card } from '../../../ui';

interface PassCardProps {
  holderName: string;
  validUntil: string;
  daysLeft: number;
}

export function PassCard({ holderName, validUntil, daysLeft }: PassCardProps) {
  const { colors } = useTheme();

  return (
    <Card>
      <Text style={[styles.label, { color: colors.textMuted }]}>{t('wallet.pass')}</Text>
      <Text style={[styles.name, { color: colors.text }]}>{holderName}</Text>
      <View style={styles.row}>
        <Text style={[styles.meta, { color: colors.textMuted }]}>
          {t('wallet.validUntil')} {validUntil}
        </Text>
        <Text style={[styles.meta, { color: colors.primary }]}>
          {daysLeft} {t('wallet.daysLeft')}
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: fontSizes.sm,
  },
  name: {
    marginTop: spacing.xs,
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
  },
  row: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  meta: {
    fontSize: fontSizes.sm,
  },
});
