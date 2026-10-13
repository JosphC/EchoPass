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
        accessibilityLabel="Notifications"
        onPress={onNotifications}
        style={[styles.bell, { backgroundColor: colors.card }]}
      >
        <Ionicons name="notifications-outline" size={19} color={colors.primary} />
        <View style={[styles.dot, { backgroundColor: colors.danger }]} />
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
    elevation: 2,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  dot: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
});
