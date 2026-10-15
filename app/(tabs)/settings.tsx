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
        <Text style={[styles.title, { color: colors.text }]}>{t('settings.title')}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('live.searchMap')}
          onPress={() => router.push('/plan')}
          hitSlop={8}
          style={styles.tool}
        >
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
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: fontWeights.bold,
    letterSpacing: -0.4,
  },
  tool: {
    width: 42,
    height: 42,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});
