import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { t } from '../../../../core/i18n';
import { fontWeights } from '../../../../core/theme';
import { useTheme } from '../../../../core/theme/useTheme';
import { formatTime } from '../../../../core/utils/format';
import { LineBadge, ModeIcon } from '../../../../ui';
import type { StopArrivalItem } from '../../hooks/useStopArrivals';

interface DepartureRowProps {
  item: StopArrivalItem;
  onPress: () => void;
}

function minuteWord(minutes: number): string {
  return minutes === 1 ? t('common.minute') : t('common.minutes');
}

/** Short destination without "spre" prefix, full name kept for TalkBack and details. */
export function shortDestination(name: string): string {
  const words = name.split(/\s+/).filter(Boolean);
  const short = words.length > 2 ? `${words[0]} ${words[1]}` : name;
  return short;
}

export function DepartureRow({ item, onPress }: DepartureRowProps) {
  const { colors } = useTheme();
  const { arrival, minutesLeft, isNow } = item;
  const predictedMs = arrival.predictedTime ? new Date(arrival.predictedTime).getTime() : null;
  const scheduledMs = arrival.scheduledTime ? new Date(arrival.scheduledTime).getTime() : null;
  const delayedMin = arrival.delayMin ?? 0;
  const earlyMin =
    delayedMin === 0 && predictedMs !== null && scheduledMs !== null && predictedMs < scheduledMs - 60_000
      ? Math.round((scheduledMs - predictedMs) / 60_000)
      : 0;
  // Google Maps: realtime minutes green when on time, red when late; timetable ones plain.
  const etaColor = !arrival.isRealtime ? colors.text : delayedMin > 0 ? colors.danger : colors.success;
  const source = arrival.isRealtime ? t('home.tripLive') : t('home.tripScheduled');
  const talkback = `Linia ${arrival.route.shortName} spre ${arrival.headsign}, ${
    isNow ? t('live.now') : `${t('home.after')} ${minutesLeft} ${minuteWord(minutesLeft)}`
  }, ${source.toLowerCase()}`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={talkback}
      onPress={onPress}
      style={[styles.row, { borderTopColor: colors.border }]}
    >
      <ModeIcon mode={arrival.route.mode} />
      <LineBadge shortName={arrival.route.shortName} color={arrival.route.color} textColor={arrival.route.textColor} />
      <View style={styles.info}>
        <Text numberOfLines={1} style={[styles.destination, { color: colors.text }]}>
          {shortDestination(arrival.headsign)}
        </Text>
        {earlyMin > 0 && scheduledMs !== null ? (
          <Text style={[styles.status, { color: colors.text }]}>
            {t('home.early')} {earlyMin} {t('common.min')} · <Text style={styles.struck}>{formatTime(arrival.scheduledTime as string)}</Text>
          </Text>
        ) : delayedMin > 0 ? (
          <Text style={[styles.status, { color: colors.danger }]}>
            {t('home.delayed')} {delayedMin} {t('common.min')}
            {scheduledMs !== null ? (
              <> · <Text style={styles.struck}>{formatTime(arrival.scheduledTime as string)}</Text></>
            ) : (
              <> · {predictedMs !== null ? formatTime(arrival.predictedTime as string) : ''}</>
            )}
          </Text>
        ) : scheduledMs !== null && predictedMs === null ? (
          <Text style={[styles.status, { color: colors.textMuted }]}>
            {t('home.tripScheduled')} · {formatTime(arrival.scheduledTime as string)}
          </Text>
        ) : (
          <Text style={[styles.status, { color: colors.success }]}>
            {t('home.onTime')} {predictedMs !== null ? `· ${formatTime(arrival.predictedTime as string)}` : ''}
          </Text>
        )}
      </View>
      {isNow ? (
        <Text style={[styles.now, { color: etaColor }]}>{t('live.now')}</Text>
      ) : (
        <View style={styles.eta}>
          <View style={styles.etaTop}>
            {arrival.isRealtime ? (
              <Ionicons name="radio-outline" size={12} color={etaColor} testID="departure-live" />
            ) : null}
            <Text style={[styles.etaNumber, { color: etaColor }]}>
              {minutesLeft}
            </Text>
          </View>
          <Text style={[styles.etaUnit, { color: colors.textMuted }]}>{t('common.min')}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: 14,
    paddingHorizontal: 4,
    minHeight: 56,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  destination: {
    fontSize: 15.5,
    fontWeight: fontWeights.bold,
    letterSpacing: -0.2,
  },
  status: {
    fontSize: 12.5,
  },
  struck: {
    textDecorationLine: 'line-through',
  },
  eta: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: 38,
  },
  etaTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 2,
  },
  etaNumber: {
    fontSize: 22,
    fontWeight: fontWeights.bold,
    lineHeight: 24,
  },
  etaUnit: {
    fontSize: 11.5,
    marginTop: 0,
  },
  now: {
    fontSize: 13.5,
    fontWeight: fontWeights.bold,
  },
});
