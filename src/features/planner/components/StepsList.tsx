import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { t } from '../../../core/i18n';
import { spacing } from '../../../core/theme';
import { useTheme } from '../../../core/theme/useTheme';
import { ListItem } from '../../../ui';
import type { RouteStep } from '../options';

interface StepsListProps {
  steps: RouteStep[];
}

export function StepsList({ steps }: StepsListProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.root}>
      {steps.map((s, i) => (
        <ListItem
          key={`${s.kind}-${i}`}
          icon={
            s.kind === 'walk' ? (
              <Ionicons name="walk-outline" size={20} color={colors.primary} />
            ) : (
              <Ionicons name="bus" size={20} color={colors.text} />
            )
          }
          title={s.kind === 'walk' ? t('plan.walk') : `${t('plan.line')} ${s.line}`}
          subtitle={`${s.minutes} ${t('common.min')} · ${s.to || (s.kind === 'walk' ? t('plan.toStop') : '')}`}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.xs,
  },
});
