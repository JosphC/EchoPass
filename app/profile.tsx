import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text } from 'react-native';
import { t } from '../src/core/i18n';
import { ProfileHeader, ProfileSections } from '../src/features/profile';
import { useWalletItems } from '../src/features/wallet';
import { Screen, ScreenHeader, Toast } from '../src/ui';

export default function ProfileRoute() {
  const router = useRouter();
  const { items, isLoading } = useWalletItems();
  const [soon, setSoon] = useState(false);
  const pass = items.find((i) => i.kind === 'pass');
  const holder = pass?.holder ?? items[0]?.holder ?? 'EchoPass';
  if (isLoading) return <Text>{t('common.loading')}</Text>;

  return (
    <Screen scroll>
      <ScreenHeader title={t('profile.title')} onBack={() => router.back()} />
      <ProfileHeader name={holder} email="" onEdit={() => setSoon(true)} />
      <ProfileSections onSoon={() => setSoon(true)} onSettings={() => router.push('/(tabs)/settings')} />
      {soon ? <Toast message={t('common.soon')} tone="info" /> : null}
    </Screen>
  );
}
