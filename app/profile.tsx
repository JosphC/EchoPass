import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text } from 'react-native';
import { t } from '../src/core/i18n';
import { ProfileHeader, ProfileSections } from '../src/features/profile';
import { useWallet } from '../src/features/wallet';
import { Screen, ScreenHeader, Toast } from '../src/ui';

export default function ProfileRoute() {
  const router = useRouter();
  const { pass, isLoading } = useWallet();
  const [soon, setSoon] = useState(false);
  if (isLoading || !pass) return <Text>{t('common.loading')}</Text>;

  return (
    <Screen scroll>
      <ScreenHeader title={t('profile.title')} centered onBack={() => router.back()} />
      <ProfileHeader name={pass.holderName} email={pass.email ?? ''} onEdit={() => setSoon(true)} />
      <ProfileSections onSoon={() => setSoon(true)} onSettings={() => router.push('/(tabs)/settings')} />
      {soon ? <Toast message={t('common.soon')} tone="info" /> : null}
    </Screen>
  );
}
