import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { t } from '../../../core/i18n';
import { fontSizes, fontWeights, spacing } from '../../../core/theme';
import { useTheme } from '../../../core/theme/useTheme';

interface TripsHeaderProps {
  onNotifications: () => void;
}

export function TripsHeader({ onNotifications }: TripsHeaderProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <Ionicons name="briefcase-outline" size={22} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text }]}>{t('trips.title')}</Text>
      </View>
      <Pressable accessibilityRole="button" onPress={onNotifications} style={styles.tool}>
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.medium,
  },
  tool: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
