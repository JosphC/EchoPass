import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { timeAgoShort } from '../../../core/utils/format';
import type { AppNotification } from '../../../services/api/schemas/notification';
import { t } from '../../../core/i18n';
import { fontSizes, fontWeights, radius, spacing } from '../../../core/theme';
import { useTheme } from '../../../core/theme/useTheme';

interface NotificationListProps {
  today: AppNotification[];
  yesterday: AppNotification[];
  older: AppNotification[];
  onOpen: (id: string) => void;
}

function Card({ item, onOpen }: { item: AppNotification; onOpen: (id: string) => void }) {
  const { colors } = useTheme();
  const unread = !item.read;
  const accent = unread ? colors.primary : colors.textMuted;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onOpen(item.id)}
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <View style={[styles.icon, { borderColor: colors.border }]}>
        <Ionicons name="notifications-outline" size={22} color={accent} />
        {unread ? <View style={[styles.dot, { backgroundColor: colors.danger }]} /> : null}
      </View>
      <View style={styles.texts}>
        <View style={styles.head}>
          <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
          <Text style={[styles.time, { color: accent }]}>{timeAgoShort(item.createdAt)}</Text>
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
      <View style={styles.groupHead}>
        <Text style={[styles.groupLabel, { color: colors.text }]}>{label}</Text>
        <View style={[styles.groupLine, { backgroundColor: colors.border }]} />
      </View>
      {items.map((n) => (
        <Card key={n.id} item={n} onOpen={onOpen} />
      ))}
    </View>
  );
}

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
  group: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  groupHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  groupLabel: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium,
  },
  groupLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    minHeight: 76,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: radius.full,
  },
  texts: {
    flex: 1,
    gap: spacing.xs,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semiBold,
  },
  time: {
    fontSize: fontSizes.sm,
  },
  body: {
    fontSize: fontSizes.sm,
  },
});
