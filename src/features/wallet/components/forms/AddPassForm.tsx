import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { t } from '../../../../core/i18n';
import { fontSizes, radius, spacing } from '../../../../core/theme';
import { useTheme } from '../../../../core/theme/useTheme';
import { Button } from '../../../../ui';
import type { PassTheme } from '../../types';

interface AddPassFormProps {
  onSubmit: (input: { name: string; holder: string; validUntil: string; lines: 'all'; theme: PassTheme }) => Promise<unknown>;
  onDone: () => void;
}

export function AddPassForm({ onSubmit, onDone }: AddPassFormProps) {
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [holder, setHolder] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(): Promise<void> {
    if (name.trim().length === 0 || holder.trim().length === 0 || !/^\d{4}-\d{2}-\d{2}$/.test(validUntil)) {
      setError(t('wallet.invalidPass'));
      return;
    }
    setError(null);
    setBusy(true);
    try {
      await onSubmit({ name: name.trim(), holder: holder.trim(), validUntil, lines: 'all', theme: 'ocean' });
      onDone();
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.root}>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder={t('wallet.passName')}
        placeholderTextColor={colors.textMuted}
        style={[styles.input, { color: colors.text, borderColor: colors.border }]}
      />
      <TextInput
        value={holder}
        onChangeText={setHolder}
        placeholder={t('wallet.passHolder')}
        placeholderTextColor={colors.textMuted}
        style={[styles.input, { color: colors.text, borderColor: colors.border }]}
      />
      <TextInput
        value={validUntil}
        onChangeText={setValidUntil}
        placeholder={t('wallet.passValidUntil')}
        placeholderTextColor={colors.textMuted}
        style={[styles.input, { color: colors.text, borderColor: colors.border }]}
      />
      {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
      <Button title={t('wallet.addPass')} loading={busy} onPress={() => void submit()} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.md,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    minHeight: 48,
    fontSize: fontSizes.md,
  },
  error: {
    fontSize: fontSizes.sm,
  },
});
