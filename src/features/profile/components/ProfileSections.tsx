import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { t } from '../../../core/i18n';
import { fontWeights, spacing } from '../../../core/theme';
import { useTheme } from '../../../core/theme/useTheme';
import { useThemeStore } from '../../../core/theme/themeStore';
import { ListItem, Toggle } from '../../../ui';
import { useSettingsStore } from '../../settings';

interface ProfileSectionsProps {
  onSoon: () => void;
  onSettings: () => void;
}

export function ProfileSections({ onSoon, onSettings }: ProfileSectionsProps) {
  const { colors } = useTheme();
  const icon = (name: keyof typeof Ionicons.glyphMap) => <Ionicons name={name} size={22} color={colors.primary} />;
  const locationSharing = useSettingsStore((s) => s.locationSharing);
  const toggleSettings = useSettingsStore((s) => s.toggle);
  const preference = useThemeStore((s) => s.preference);
  const setPreference = useThemeStore((s) => s.setPreference);

  return (
    <View>
      <Text style={[styles.heading, { color: colors.textMuted }]}>{t('profile.preferences')}</Text>
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Toggle
          icon={icon('location-outline')}
          label={t('profile.location')}
          value={locationSharing}
          onValueChange={() => toggleSettings('locationSharing')}
        />
        <ListItem icon={icon('globe-outline')} title={t('profile.language')} onPress={onSoon} />
        <Toggle
          icon={icon('notifications-outline')}
          label={t('profile.pushNotifications')}
          value={false}
          onValueChange={onSoon}
        />
        <Toggle
          icon={icon('moon-outline')}
          label={t('profile.darkMode')}
          value={preference === 'dark'}
          onValueChange={(next) => setPreference(next ? 'dark' : 'light')}
          divider={false}
        />
      </View>

      <Text style={[styles.heading, { color: colors.textMuted }]}>{t('profile.other')}</Text>
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <ListItem icon={icon('settings-outline')} title={t('profile.settings')} onPress={onSettings} />
        <ListItem icon={icon('help-circle-outline')} title={t('profile.helpCenter')} onPress={onSoon} />
        <ListItem icon={icon('log-out-outline')} title={t('profile.logout')} onPress={onSoon} divider={false} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    marginTop: spacing.md,
    marginBottom: 6,
    marginLeft: 4,
    fontSize: 13,
    fontWeight: fontWeights.medium,
  },
  card: {
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 2,
  },
});
