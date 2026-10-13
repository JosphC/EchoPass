import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { t } from '../../../../core/i18n';
import { fontWeights } from '../../../../core/theme';
import { useTheme } from '../../../../core/theme/useTheme';
import { timeAgoShort } from '../../../../core/utils/format';
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

function ageLabel(createdAt: string | undefined): string | null {
  if (!createdAt) return null;
  const parts = [t('home.agoPre'), timeAgoShort(createdAt), t('home.agoPost')].filter((p) => p !== '');
  return parts.join(' ');
}

/** Compact disruption row, expandable to confirmations and all alerts. */
export function StationAlert({ alerts }: StationAlertProps) {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);
  if (alerts.length === 0) return null;
  const first = alerts[0];
  const rest = alerts.length - 1;
  const age = ageLabel(first.createdAt);
  const headline = `${causeLabel(first.kind)} · Linia ${first.line}${rest > 0 ? ` +${rest} ${t('home.alerts')}` : ''}${age ? ` · ${age}` : ''}`;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => setExpanded((e) => !e)}
      style={[styles.card, { backgroundColor: `${colors.warning}1F`, borderColor: `${colors.warning}66` }]}
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
