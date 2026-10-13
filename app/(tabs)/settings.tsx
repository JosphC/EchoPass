import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { t } from '../../src/core/i18n';
import { fontWeights, spacing } from '../../src/core/theme';
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
        <Pressable accessibilityRole="button" onPress={() => router.push('/plan')} style={[styles.tool, { backgroundColor: colors.card }]}>
          <Ionicons name="search-outline" size={20} color={colors.primary} />
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
    marginBottom: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    fontSize: 24,
    fontWeight: fontWeights.bold,
    letterSpacing: -0.4,
  },
  tool: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
});
