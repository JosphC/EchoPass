import { Ionicons } from '@expo/vector-icons';
import { useState, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import * as Linking from 'expo-linking';
import { t } from '../../../core/i18n';
import { fontSizes, fontWeights, spacing } from '../../../core/theme';
import { useTheme } from '../../../core/theme/useTheme';
import { ListItem, Toast, Toggle } from '../../../ui';
import { useSettings, type SettingsKey } from '../hooks/useSettings';

type Row =
  | { kind: 'nav'; icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }
  | { kind: 'toggle'; icon: keyof typeof Ionicons.glyphMap; label: string; toggleKey: SettingsKey };

function Section({ title, children }: { title: string; children: ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={styles.section}>
      <Text style={[styles.heading, { color: colors.text }]}>{title}</Text>
      {children}
    </View>
  );
}

export function SettingsGroups({ onEditProfile }: { onEditProfile: () => void }) {
  const { colors } = useTheme();
  const settings = useSettings();
  const [soon, setSoon] = useState(false);
  const icon = (name: keyof typeof Ionicons.glyphMap) => <Ionicons name={name} size={22} color={colors.primary} />;
  const soonPress = () => setSoon(true);
  const openSystemSettings = () => {
    void Linking.openSettings();
  };

  const account: Row[] = [
    { kind: 'nav', icon: 'person-outline', label: t('settings.editProfile'), onPress: onEditProfile },
    { kind: 'nav', icon: 'globe-outline', label: t('settings.language'), onPress: soonPress },
    { kind: 'nav', icon: 'lock-closed-outline', label: t('settings.changePassword'), onPress: soonPress },
  ];
  const notifications: Row[] = [
    { kind: 'toggle', icon: 'notifications-outline', label: t('settings.tripReminders'), toggleKey: 'tripReminders' },
    { kind: 'toggle', icon: 'alarm-outline', label: t('settings.arrivalAlerts'), toggleKey: 'arrivalAlerts' },
    { kind: 'toggle', icon: 'information-circle-outline', label: t('settings.disruptions'), toggleKey: 'disruptions' },
  ];
  const privacy: Row[] = [
    { kind: 'toggle', icon: 'location-outline', label: t('settings.locationSharing'), toggleKey: 'locationSharing' },
    { kind: 'nav', icon: 'shield-checkmark-outline', label: t('settings.privacyPolicy'), onPress: soonPress },
    { kind: 'nav', icon: 'key-outline', label: t('settings.permissionsSettings'), onPress: openSystemSettings },
  ];

  const renderRow = (row: Row, key: string) =>
    row.kind === 'toggle' ? (
      <Toggle
        key={key}
        icon={icon(row.icon)}
        label={row.label}
        value={settings[row.toggleKey]}
        onValueChange={() => settings.toggle(row.toggleKey)}
      />
    ) : (
      <ListItem key={key} icon={icon(row.icon)} title={row.label} onPress={row.onPress} />
    );

  return (
    <View>
      <Section title={t('settings.account')}>
        {account.map((r, i) => renderRow(r, `a-${i}`))}
      </Section>
      <Section title={t('settings.notificationsGroup')}>
        {notifications.map((r, i) => renderRow(r, `n-${i}`))}
      </Section>
      <Section title={t('settings.privacyGroup')}>
        {privacy.map((r, i) => renderRow(r, `p-${i}`))}
      </Section>
      <Section title={t('settings.appPrefs')}>
        <ListItem icon={icon('moon-outline')} title={t('settings.appearance')} onPress={soonPress} />
      </Section>
      <Text style={[styles.micTitle, { color: colors.text }]}>{t('settings.micTitle')}</Text>
      <Text style={[styles.micBody, { color: colors.textMuted }]}>{t('settings.micBody')}</Text>
      {soon ? <Toast message={t('common.soon')} tone="info" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.xl,
  },
  heading: {
    marginBottom: spacing.sm,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
  },
  micTitle: {
    marginTop: spacing.md,
    fontSize: fontSizes.md,
  },
  micBody: {
    marginTop: spacing.xs,
    fontSize: fontSizes.sm,
  },
});
