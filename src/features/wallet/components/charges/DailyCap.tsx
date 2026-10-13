import { StyleSheet, Text, View } from 'react-native';
import { t } from '../../../../core/i18n';
import { fontSizes, fontWeights, spacing } from '../../../../core/theme';
import { useTheme } from '../../../../core/theme/useTheme';
import { ProgressBar } from '../../../../ui';

interface DailyCapProps {
  spentRon: number;
  limitRon: number;
}

export function DailyCap({ spentRon, limitRon }: DailyCapProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.root}>
      <Text style={[styles.label, { color: colors.text }]}>
        {t('wallet.dailyCap')}: {spentRon} {t('wallet.spentOf')} {limitRon} lei
      </Text>
      <ProgressBar value={limitRon > 0 ? spentRon / limitRon : 0} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.sm,
  },
  label: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium,
  },
});
