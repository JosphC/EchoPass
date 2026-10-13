import { StyleSheet, Text, View } from 'react-native';
import { fontSizes, fontWeights, spacing } from '../../../../core/theme';
import { useTheme } from '../../../../core/theme/useTheme';
import { LineBadge } from '../../../../ui';
import { formatTime } from '../../../../core/utils/format';
import { t } from '../../../../core/i18n';
import type { StopArrivalItem } from '../../hooks/useStopArrivals';

export function TripSheet({ item }: { item: StopArrivalItem }) {
  const { colors } = useTheme();
  const time = item.arrival.predictedTime ?? item.arrival.scheduledTime;

  return (
    <View style={styles.sheet}>
      <LineBadge shortName={item.arrival.route.shortName} color={item.arrival.route.color} textColor={item.arrival.route.textColor} />
      <Text style={[styles.title, { color: colors.text }]}>{item.arrival.headsign}</Text>
      <Text style={[styles.line, { color: colors.textMuted }]}>
        {(item.arrival.isRealtime ? t('home.tripLive') : t('home.tripScheduled')) + (time ? ` · ${formatTime(time)}` : '')}
      </Text>
      {item.arrival.delayMin ? (
        <Text style={[styles.line, { color: colors.warning }]}>{`+${item.arrival.delayMin} ${t('common.min')} ${t('home.late')}`}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: { alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.sm },
  title: { fontSize: fontSizes.lg, fontWeight: fontWeights.bold, textAlign: 'center' },
  line: { fontSize: fontSizes.sm },
});
