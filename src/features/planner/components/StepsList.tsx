import { StyleSheet, View } from 'react-native';
import { t } from '../../../core/i18n';
import { spacing } from '../../../core/theme';
import { ListItem } from '../../../ui';
import type { RouteStep } from '../options';

interface StepsListProps {
  steps: RouteStep[];
}

export function StepsList({ steps }: StepsListProps) {
  return (
    <View style={styles.root}>
      {steps.map((s, i) => (
        <ListItem
          key={`${s.kind}-${i}`}
          title={s.kind === 'walk' ? t('plan.walk') : `${t('plan.line')} ${s.line}`}
          subtitle={`${s.minutes} ${t('common.min')} · ${s.kind === 'walk' ? t('plan.toStop') : s.to}`}
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
