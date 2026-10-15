import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { t } from '../../../../../core/i18n';
import { fontSizes, fontWeights, radius, spacing } from '../../../../../core/theme';
import { useTheme } from '../../../../../core/theme/useTheme';
import { LineBadge } from '../../../../../ui';
import type { Arrival } from '../../../arrivals';
import type { Station } from '../../../stations';

interface ScheduleSheetProps {
  station: Station;
  arrivals: Arrival[];
  selectedLine: string | null;
  onPickLine: (line: string | null) => void;
  onClearStation: () => void;
  onHeight?: (height: number) => void;
}

function etaLabel(etaMin: number): string {
  if (etaMin <= 0) return t('live.now');
  return `${t('live.inPrefix')} ${etaMin} ${t('common.min')}`;
}

/** Station schedule: pick a line to show only its live vehicles on the map. */
export function ScheduleSheet({ station, arrivals, selectedLine, onPickLine, onClearStation, onHeight }: ScheduleSheetProps) {
  const { colors } = useTheme();

  return (
    <View onLayout={(event) => onHeight?.(event.nativeEvent.layout.height)} style={[styles.sheet, { backgroundColor: colors.card }]}>
      <View style={[styles.handle, { backgroundColor: colors.border }]} />
      <View style={styles.headingRow}>
        <View style={styles.heading}>
          <Text style={[styles.title, { color: colors.text }]}>{station.name}</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>{t('live.schedule')}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('live.clearFilter')}
          onPress={onClearStation}
          style={styles.clear}
        >
          <Ionicons name="close-outline" size={22} color={colors.textMuted} />
        </Pressable>
      </View>
      {arrivals.length === 0 ? (
        <Text style={[styles.empty, { color: colors.textMuted }]}>{t('live.empty')}</Text>
      ) : (
        <ScrollView style={styles.list}>
          {arrivals.map((a) => {
          const active = selectedLine === a.line;
          return (
            <Pressable
              key={a.line}
              accessibilityRole="button"
              accessibilityLabel={`${t('plan.line')} ${a.line}`}
              accessibilityState={{ selected: active }}
              onPress={() => onPickLine(active ? null : a.line)}
              style={[
                styles.row,
                { borderColor: colors.border },
                active && { borderColor: colors.primary, backgroundColor: colors.primarySoft },
              ]}
            >
              <Ionicons name="bus" size={20} color={colors.text} />
              <LineBadge shortName={a.line} />
              <View style={styles.info}>
                <Text style={[styles.route, { color: colors.text }]}>
                  {a.destination}
                </Text>
                <Text style={[styles.eta, { color: colors.primary }]}>{etaLabel(a.etaMin)}</Text>
              </View>
              {active ? <Ionicons name="checkmark-circle" size={22} color={colors.primary} /> : null}
            </Pressable>
          );
        })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.sm,
    maxHeight: 320,
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: radius.full,
    marginBottom: spacing.xs,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heading: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semiBold,
  },
  subtitle: {
    fontSize: fontSizes.sm,
  },
  empty: {
    fontSize: fontSizes.sm,
    paddingVertical: spacing.sm,
  },
  list: {
    maxHeight: 208,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 56,
  },
  info: {
    flex: 1,
    gap: spacing.xs,
  },
  route: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium,
  },
  eta: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semiBold,
  },
  clear: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
