import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { t } from '../../../../core/i18n';
import { fontSizes, spacing } from '../../../../core/theme';
import { useTheme } from '../../../../core/theme/useTheme';
import { Button } from '../../../../ui';
import { detectNetwork, expiryValid, luhnValid } from '../../validation/cardValidation';

interface AddCardFormProps {
  onSubmit: (input: { network: 'visa' | 'mastercard' | 'other'; last4: string; holder: string; expiry: string }) => Promise<unknown>;
  onDone: () => void;
}

export function AddCardForm({ onSubmit, onDone }: AddCardFormProps) {
  const { colors } = useTheme();
  const [pan, setPan] = useState('');
  const [holder, setHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(): Promise<void> {
    const digits = pan.replace(/\D/g, '');
    if (!luhnValid(digits)) {
      setError(t('wallet.invalidCard'));
      return;
    }
    if (!expiryValid(expiry)) {
      setError(t('wallet.expiredCard'));
      return;
    }
    if (holder.trim().length === 0) {
      setError(t('wallet.invalidHolder'));
      return;
    }
    setError(null);
    setBusy(true);
    try {
      await onSubmit({ network: detectNetwork(digits), last4: digits.slice(-4), holder: holder.trim(), expiry });
      onDone();
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.root}>
      <TextInput
        value={pan}
        onChangeText={setPan}
        placeholder={t('wallet.cardNumber')}
        keyboardType="number-pad"
        maxLength={19}
        placeholderTextColor={colors.textMuted}
        style={[styles.input, { color: colors.text, backgroundColor: colors.fill }]}
      />
      <TextInput
        value={holder}
        onChangeText={setHolder}
        placeholder={t('wallet.cardHolder')}
        placeholderTextColor={colors.textMuted}
        style={[styles.input, { color: colors.text, backgroundColor: colors.fill }]}
      />
      <TextInput
        value={expiry}
        onChangeText={setExpiry}
        placeholder={t('wallet.cardExpiry')}
        keyboardType="number-pad"
        maxLength={5}
        placeholderTextColor={colors.textMuted}
        style={[styles.input, { color: colors.text, backgroundColor: colors.fill }]}
      />
      {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
      <Button title={t('wallet.addCard')} loading={busy} onPress={() => void submit()} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.md,
  },
  input: {
    borderRadius: 14,
    paddingHorizontal: spacing.lg,
    minHeight: 48,
    fontSize: fontSizes.md,
  },
  error: {
    fontSize: fontSizes.sm,
  },
});
