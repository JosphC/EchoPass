import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { t } from '../../../core/i18n';
import { fontWeights, spacing } from '../../../core/theme';
import { useTheme } from '../../../core/theme/useTheme';
import type { SavedRoute } from '../../../services/api/schemas/trip';
import { LineBadge } from '../../../ui';

interface SavedRoutesProps {
  routes: SavedRoute[];
}

export function SavedRoutes({ routes }: SavedRoutesProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.root}>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {routes.map((r, idx) => (
          <View key={r.id}>
            {idx > 0 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
            <View style={styles.row}>
              <Ionicons name="bus" size={20} color={colors.text} />
              <LineBadge shortName={r.line} />
              <View style={styles.info}>
                <Text style={[styles.route, { color: colors.text }]}>
                  {r.from} → {r.to}
                </Text>
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
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
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
  route: {
    fontSize: 15.5,
    fontWeight: fontWeights.bold,
  },
  meta: {
    fontSize: 12.5,
  },
});
