import { Ionicons } from '@expo/vector-icons';
import { useState, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import * as Linking from 'expo-linking';
import { t } from '../../../core/i18n';
import { fontWeights, spacing } from '../../../core/theme';
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
      <Text style={[styles.heading, { color: colors.textMuted }]}>{title}</Text>
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        {children}
      </View>
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
  const payments: Row[] = [
    { kind: 'toggle', icon: 'card-outline', label: t('settings.askBeforeCharge'), toggleKey: 'askBeforeCharge' },
  ];

  const renderRow = (row: Row, key: string, divider: boolean) =>
    row.kind === 'toggle' ? (
      <Toggle
        key={key}
        icon={icon(row.icon)}
        label={row.label}
        value={settings[row.toggleKey]}
        onValueChange={() => settings.toggle(row.toggleKey)}
        divider={divider}
      />
    ) : (
      <ListItem key={key} icon={icon(row.icon)} title={row.label} onPress={row.onPress} divider={divider} />
    );
  const rows = (list: Row[], prefix: string) => list.map((r, i) => renderRow(r, `${prefix}-${i}`, i < list.length - 1));

  return (
    <View>
      <Section title={t('settings.account')}>
        {rows(account, 'a')}
      </Section>
      <Section title={t('settings.notificationsGroup')}>
        {rows(notifications, 'n')}
      </Section>
      <Section title={t('settings.privacyGroup')}>
        {rows(privacy, 'p')}
      </Section>
      <Section title={t('settings.appPrefs')}>
        <ListItem icon={icon('moon-outline')} title={t('settings.appearance')} onPress={soonPress} divider={false} />
      </Section>
      <Section title={t('settings.payments')}>
        {rows(payments, 'pay')}
      </Section>
      {soon ? <Toast message={t('common.soon')} tone="info" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.lg,
  },
  heading: {
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
