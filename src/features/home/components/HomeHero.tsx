import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { t } from '../../../core/i18n';
import { fontSizes, fontWeights, spacing } from '../../../core/theme';
import { useTheme } from '../../../core/theme/useTheme';

interface HomeHeroProps {
  onSearch: () => void;
  onNotifications: () => void;
}

export function HomeHero({ onSearch, onNotifications }: HomeHeroProps) {
  const { colors } = useTheme();

  return (
    <View>
      <View style={styles.tools}>
        <Pressable accessibilityRole="button" accessibilityLabel="Search" onPress={onSearch} style={styles.tool}>
          <Ionicons name="search-outline" size={24} color={colors.primary} />
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Notifications" onPress={onNotifications} style={styles.tool}>
          <Ionicons name="notifications-outline" size={24} color={colors.primary} />
        </Pressable>
      </View>
      <View style={[styles.rule, { borderColor: colors.primary }]} />
      <Text accessibilityLabel={t('home.title')} style={[styles.title, { color: colors.text }]}>
        {t('home.titleStart')} <Text style={{ color: colors.primary }}>{t('home.titleAccent')}</Text> {t('home.titleEnd')}
      </Text>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>{t('home.subtitle')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tools: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  tool: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rule: {
    marginTop: spacing.sm,
    borderBottomWidth: 1,
    borderStyle: 'dotted',
  },
  title: {
    marginTop: spacing.lg,
    fontSize: fontSizes.xxl,
    fontWeight: fontWeights.bold,
  },
  subtitle: {
    marginTop: spacing.xs,
    fontSize: fontSizes.md,
  },
});
