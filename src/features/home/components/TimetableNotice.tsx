import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { t } from '../../../core/i18n';
import { fontSizes, fontWeights, radius, spacing } from '../../../core/theme';
import { useTheme } from '../../../core/theme/useTheme';
import { timetableDaysLeft } from '../../../services/repositories/gtfs/validity';

/** Warn this many days before the bundled GTFS calendar runs out. */
export const TIMETABLE_WARN_DAYS = 14;

export function timetableNoticeText(daysLeft: number | null): string | null {
  if (daysLeft === null || daysLeft > TIMETABLE_WARN_DAYS) return null;
  if (daysLeft <= 0) return t('home.timetableExpired');
  if (daysLeft === 1) return t('home.timetableLastDay');
  return `${t('home.timetableExpiresIn')} ${daysLeft} ${t('home.timetableDays')}`;
}

/** Banner shown when the offline timetable is about to expire (or did). */
export function TimetableNotice() {
  const { colors } = useTheme();
  const text = timetableNoticeText(timetableDaysLeft(Date.now()));
  if (!text) return null;
  return (
    <View
      testID="timetable-notice"
      accessibilityRole="alert"
      accessibilityLabel={text}
      style={[styles.card, { backgroundColor: `${colors.warning}1F`, borderColor: `${colors.warning}66` }]}
    >
      <Ionicons name="calendar-outline" size={16} color={colors.warning} />
      <Text style={[styles.text, { color: colors.warning }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  text: { flex: 1, fontSize: fontSizes.xs, fontWeight: fontWeights.medium },
});
