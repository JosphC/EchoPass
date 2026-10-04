import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { t } from '../../../core/i18n';
import { fontSizes, fontWeights, spacing } from '../../../core/theme';
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
      <Text style={[styles.heading, { color: colors.text }]}>{t('profile.preferences')}</Text>
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
      />
      <Text style={[styles.heading, { color: colors.text }]}>{t('profile.other')}</Text>
      <ListItem icon={icon('settings-outline')} title={t('profile.settings')} onPress={onSettings} />
      <ListItem icon={icon('help-circle-outline')} title={t('profile.helpCenter')} onPress={onSoon} />
      <ListItem icon={icon('log-out-outline')} title={t('profile.logout')} onPress={onSoon} />
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
  },
});
