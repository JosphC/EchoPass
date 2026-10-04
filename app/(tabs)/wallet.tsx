import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { t } from '../../src/core/i18n';
import { fontSizes, fontWeights, spacing } from '../../src/core/theme';
import { useTheme } from '../../src/core/theme/useTheme';
import { ChargeList, PassCard, useWallet } from '../../src/features/wallet';
import { Button, Card, ListItem, ProgressBar, Screen, ScreenHeader, Toast } from '../../src/ui';

export default function WalletTab() {
  const { colors } = useTheme();
  const { pass, paymentMethod, cap, charges, isLoading } = useWallet();
  const [disputed, setDisputed] = useState(false);
  if (isLoading || !pass || !paymentMethod || !cap) return <Text>{t('common.loading')}</Text>;

  return (
    <Screen scroll>
      <ScreenHeader title={t('wallet.title')} />
      <PassCard holderName={pass.holderName} validUntil={pass.validUntil} daysLeft={pass.daysLeft} />
      <Card>
        <ListItem title={`${paymentMethod.brand} ···· ${paymentMethod.last4}`} subtitle={t('wallet.card')} />
      </Card>
      <Text style={[styles.cap, { color: colors.text }]}>
        {t('wallet.dailyCap')}: {cap.spentRon} {t('wallet.spentOf')} {cap.limitRon} lei
      </Text>
      <ProgressBar value={cap.spentRon / cap.limitRon} />
      <View style={styles.actions}>
        <Button title={t('wallet.topUp')} variant="secondary" onPress={() => undefined} />
        <Button title={t('wallet.renew')} variant="ghost" onPress={() => undefined} />
      </View>
      <ChargeList charges={charges} onDispute={() => setDisputed(true)} />
      {disputed ? <Toast message={t('wallet.disputeSent')} tone="success" /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  cap: { marginTop: spacing.lg, marginBottom: spacing.sm, fontSize: fontSizes.md, fontWeight: fontWeights.medium },
  actions: { flexDirection: 'row', gap: spacing.md, marginVertical: spacing.lg },
});
