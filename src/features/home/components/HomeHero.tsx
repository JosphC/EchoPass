import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { t } from '../../../core/i18n';
import { fontWeights, radius } from '../../../core/theme';
import { useTheme } from '../../../core/theme/useTheme';

interface HomeHeroProps {
  name: string | null;
  onNotifications: () => void;
  nowMs?: number;
}

function greeting(nowMs: number): string {
  const hour = new Date(nowMs).getHours();
  if (hour < 12) return t('home.goodMorning');
  if (hour < 18) return t('home.goodDay');
  return t('home.goodEvening');
}

export function HomeHero({ name, onNotifications, nowMs = Date.now() }: HomeHeroProps) {
  const { colors } = useTheme();
  const hello = greeting(nowMs);

  return (
    <View style={styles.header}>
      <Text style={[styles.title, { color: colors.text }]}>
        {name ? `${hello}, ${name}` : hello}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('a11y.notifications')}
        onPress={onNotifications}
        style={[styles.bell, { backgroundColor: colors.card }]}
      >
        <Ionicons name="notifications-outline" size={19} color={colors.primary} />
        <View style={[styles.dot, { backgroundColor: colors.danger, borderColor: colors.card }]} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: fontWeights.bold,
    letterSpacing: -0.4,
  },
  bell: {
    width: 42,
    height: 42,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
  },
});
