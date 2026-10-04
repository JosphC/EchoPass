import { useRouter } from 'expo-router';
import { t } from '../../src/core/i18n';
import { HomeHero, LocationCard, RecentTripsSection } from '../../src/features/home';
import { useBuses } from '../../src/features/map';
import { useTrips } from '../../src/features/trips';
import { Button, Screen, Tag } from '../../src/ui';

export default function HomeScreen() {
  const router = useRouter();
  const { recentTrips } = useTrips();
  const { delayed } = useBuses();
  const banner = delayed[0];
  const goPlan = () => router.push('/plan');

  return (
    <Screen scroll>
      <HomeHero onSearch={goPlan} onNotifications={() => router.push('/notifications')} />
      <LocationCard onPick={goPlan} />
      <Button pill title={t('home.planTrip')} onPress={goPlan} />
      {banner ? (
        <Tag tone="warning" label={`${t('home.delayOnLine')} ${banner.line}: +${banner.delayMin} ${t('common.min')}`} />
      ) : null}
      <RecentTripsSection trips={recentTrips} />
    </Screen>
  );
}
