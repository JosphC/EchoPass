import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { t } from '../../src/core/i18n';
import { fontSizes, fontWeights, spacing } from '../../src/core/theme';
import { useTheme } from '../../src/core/theme/useTheme';
import { SettingsGroups } from '../../src/features/settings';
import { Screen } from '../../src/ui';

export default function SettingsTab() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <Screen scroll>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="settings-outline" size={22} color={colors.primary} />
          <Text style={[styles.title, { color: colors.text }]}>{t('settings.title')}</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={() => router.push('/plan')} style={styles.tool}>
          <Ionicons name="search-outline" size={22} color={colors.primary} />
        </Pressable>
      </View>
      <SettingsGroups onEditProfile={() => router.push('/profile')} />
    </Screen>
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
