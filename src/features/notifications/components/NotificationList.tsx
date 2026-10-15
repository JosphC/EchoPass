import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { formatDayMonth, timeAgoShort } from '../../../core/utils/format';
import type { AppNotification } from '../../../services/api/schemas/notification';
import { t } from '../../../core/i18n';
import { fontWeights, radius, spacing } from '../../../core/theme';
import { useTheme } from '../../../core/theme/useTheme';

interface NotificationListProps {
  today: AppNotification[];
  yesterday: AppNotification[];
  older: AppNotification[];
  onOpen: (id: string) => void;
}

const DAY_MS = 86_400_000;

/** "9min" / "2h" inside a day, then the date ("3 oct") like the Activity history. */
function stamp(iso: string): string {
  return Date.now() - new Date(iso).getTime() < DAY_MS ? timeAgoShort(iso) : formatDayMonth(iso.slice(0, 10));
}

function Row({ item, divider, onOpen }: { item: AppNotification; divider: boolean; onOpen: (id: string) => void }) {
  const { colors } = useTheme();
  const unread = !item.read;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${item.title}. ${item.body}`}
      onPress={() => onOpen(item.id)}
      style={[styles.row, divider && { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth }]}
    >
      <View style={[styles.icon, { backgroundColor: unread ? colors.primarySoft : colors.fill }]}>
        <Ionicons name="notifications-outline" size={19} color={unread ? colors.primary : colors.textMuted} />
      </View>
      <View style={styles.texts}>
        <View style={styles.head}>
          <Text numberOfLines={1} style={[styles.title, { color: colors.text }, unread && styles.titleUnread]}>
            {item.title}
          </Text>
          <Text style={[styles.time, { color: colors.textMuted }]}>{stamp(item.createdAt)}</Text>
          {unread ? <View style={[styles.dot, { backgroundColor: colors.primary }]} /> : null}
        </View>
        <Text numberOfLines={2} style={[styles.body, { color: colors.textMuted }]}>
          {item.body}
        </Text>
      </View>
    </Pressable>
  );
}

function Group({ label, items, onOpen }: { label: string; items: AppNotification[]; onOpen: (id: string) => void }) {
  const { colors } = useTheme();
  if (items.length === 0) return null;

  return (
    <View style={styles.group}>
      <Text style={[styles.groupLabel, { color: colors.textMuted }]}>{label}</Text>
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        {items.map((n, i) => (
          <Row key={n.id} item={n} divider={i < items.length - 1} onOpen={onOpen} />
        ))}
      </View>
    </View>
  );
}

/** Grouped like the Activity history: one card per day group, hairlines between rows. */
export function NotificationList({ today, yesterday, older, onOpen }: NotificationListProps) {
  return (
    <View>
      <Group label={t('notifications.today')} items={today} onOpen={onOpen} />
      <Group label={t('notifications.yesterday')} items={yesterday} onOpen={onOpen} />
      <Group label={t('notifications.older')} items={older} onOpen={onOpen} />
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: spacing.sm, marginBottom: spacing.lg },
  groupLabel: { fontSize: 13, fontWeight: fontWeights.medium, marginLeft: 4 },
  card: { borderRadius: 24, paddingHorizontal: 18 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14 },
  icon: { width: 40, height: 40, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  texts: { flex: 1, gap: 3 },
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: { flex: 1, fontSize: 15, fontWeight: fontWeights.medium },
  titleUnread: { fontWeight: fontWeights.bold },
  time: { fontSize: 12.5 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  body: { fontSize: 13.5 },
});
