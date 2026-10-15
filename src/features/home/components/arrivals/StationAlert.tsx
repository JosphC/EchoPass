import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { t } from '../../../../core/i18n';
import { fontWeights } from '../../../../core/theme';
import { useTheme } from '../../../../core/theme/useTheme';
import type { DelayCause } from '../../../../features/map/delays';
import type { Report } from '../../../../services/api/schemas/report';

function causeLabel(cause: DelayCause): string {
  if (cause === 'traffic') return t('live.causeTraffic');
  if (cause === 'accident') return t('live.causeAccident');
  if (cause === 'breakdown') return t('live.causeBreakdown');
  if (cause === 'works') return t('live.causeWorks');
  if (cause === 'crowding') return t('live.causeCrowding');
  if (cause === 'detour') return t('live.causeDetour');
  return t('live.causeUnknown');
}

interface StationAlertProps {
  alerts: Report[];
}

/** "acum 12 min" / "acum 2 h" / "acum 3 zile": whole words, never a cryptic "11z". */
export function ageLabel(createdAt: string | undefined, nowMs: number = Date.now()): string | null {
  if (!createdAt) return null;
  const min = Math.max(0, Math.round((nowMs - new Date(createdAt).getTime()) / 60_000));
  const days = Math.floor(min / 1440);
  const amount =
    min < 60
      ? `${min} ${t('common.min')}`
      : min < 1440
        ? `${Math.floor(min / 60)} ${t('common.hours')}`
        : `${days} ${days === 1 ? t('common.day') : t('common.days')}`;
  return [t('home.agoPre'), amount, t('home.agoPost')].filter((p) => p !== '').join(' ');
}

/** Compact disruption row, expandable to confirmations and all alerts. */
export function StationAlert({ alerts }: StationAlertProps) {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);
  if (alerts.length === 0) return null;
  const first = alerts[0];
  const rest = alerts.length - 1;
  const age = ageLabel(first.createdAt);
  const headline = `${causeLabel(first.kind)} · ${t('plan.line')} ${first.line}${rest > 0 ? ` +${rest} ${t('home.alerts')}` : ''}${age ? ` · ${age}` : ''}`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={headline}
      accessibilityState={{ expanded }}
      onPress={() => setExpanded((e) => !e)}
      style={[styles.card, { backgroundColor: colors.warningSoft, borderColor: colors.warningBorder }]}
    >
      <View style={styles.titleRow}>
        <Ionicons name="warning" size={16} color={colors.warning} />
        <Text numberOfLines={1} style={[styles.title, { color: colors.warning }]}>
          {headline}
        </Text>
      </View>
      {expanded ? (
        <View style={styles.details}>
          <Text style={[styles.body, { color: colors.textMuted }]}>
            {first.stopName} · {first.confirmations} {t('live.confirmations')}
          </Text>
          {alerts.slice(1).map((a) => (
            <Text key={a.id} style={[styles.body, { color: colors.textMuted }]}>
              {causeLabel(a.kind)} · Linia {a.line} · {a.stopName}
            </Text>
          ))}
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
    gap: 4,
    minHeight: 32,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 12.5,
    fontWeight: fontWeights.bold,
    flex: 1,
  },
  details: {
    gap: 2,
    marginTop: 2,
  },
  body: {
    fontSize: 11.5,
  },
});
