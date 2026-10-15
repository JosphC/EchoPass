import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { t } from '../../../core/i18n';
import { fontWeights, spacing } from '../../../core/theme';
import { useTheme } from '../../../core/theme/useTheme';
import type { SavedRoute } from '../../../services/api/schemas/trip';
import { findRoute } from '../../../services/repositories/gtfs/timetable';
import { LineBadge, ModeIcon } from '../../../ui';

interface SavedRoutesProps {
  routes: SavedRoute[];
}

export function SavedRoutes({ routes }: SavedRoutesProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.root}>
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        {routes.map((r, idx) => (
          <View key={r.id}>
            {idx > 0 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
            <View style={styles.row}>
              <ModeIcon mode={findRoute(r.line)?.mode} />
              <LineBadge shortName={r.line} />
              <View style={styles.info}>
                <View style={styles.routeRow}>
                  <Text numberOfLines={1} style={[styles.route, styles.shrink, { color: colors.text }]}>
                    {r.from}
                  </Text>
                  <Ionicons name="arrow-forward" size={14} color={colors.textMuted} />
                  <Text numberOfLines={1} style={[styles.route, styles.shrink, { color: colors.text }]}>
                    {r.to}
                  </Text>
                </View>
                <Text style={[styles.meta, { color: colors.textMuted }]}>
                  {t('plan.line')} {r.line}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    marginTop: 12,
  },
  card: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 56,
  },
  info: {
    flex: 1,
    gap: 3,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  shrink: {
    flexShrink: 1,
  },
  route: {
    fontSize: 15.5,
    fontWeight: fontWeights.bold,
  },
  meta: {
    fontSize: 12.5,
  },
});
