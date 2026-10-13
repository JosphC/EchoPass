import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, Text } from 'react-native';
import { t } from '../src/core/i18n';
import { useTheme } from '../src/core/theme/useTheme';
import { NotificationList, useNotifications } from '../src/features/notifications';
import { Screen, ScreenHeader } from '../src/ui';

export default function NotificationsRoute() {
  const router = useRouter();
  const { colors } = useTheme();
  const { groups, isLoading, markRead } = useNotifications();
  if (isLoading) return <Text>{t('common.loading')}</Text>;

  return (
    <Screen scroll>
      <ScreenHeader
        title={t('notifications.title')}
        centered
        onBack={() => router.back()}
        right={
          <Pressable accessibilityRole="button" onPress={() => router.push('/(tabs)/settings')}>
            <Ionicons name="settings-outline" size={22} color={colors.primary} />
          </Pressable>
        }
      />
      <NotificationList today={groups.today} yesterday={groups.yesterday} older={groups.older} onOpen={markRead} />
    </Screen>
  );
}
