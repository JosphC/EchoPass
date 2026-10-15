import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { t } from '../../../core/i18n';
import { fontWeights } from '../../../core/theme';
import { useTheme } from '../../../core/theme/useTheme';

interface TripsHeaderProps {
  onNotifications: () => void;
}

export function TripsHeader({ onNotifications }: TripsHeaderProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.header}>
      <Text style={[styles.title, { color: colors.text }]}>{t('trips.heading')}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('a11y.notifications')}
        onPress={onNotifications}
        hitSlop={8}
        style={styles.bell}
      >
        <Ionicons name="notifications-outline" size={22} color={colors.primary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 24,
    fontWeight: fontWeights.bold,
    letterSpacing: -0.4,
  },
  bell: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
