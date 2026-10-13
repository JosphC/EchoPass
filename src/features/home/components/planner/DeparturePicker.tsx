import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput } from 'react-native';
import { t } from '../../../../core/i18n';
import { fontSizes, radius, spacing } from '../../../../core/theme';
import { useTheme } from '../../../../core/theme/useTheme';
import { BottomSheet } from '../../../../ui';

export type DepartureMode = 'now' | 'leave' | 'arrive';

export interface DepartureOption {
  mode: DepartureMode;
  time: string;
}

interface DeparturePickerProps {
  visible: boolean;
  value: DepartureOption;
  onChange: (next: DepartureOption) => void;
  onClose: () => void;
}

const MODES: DepartureMode[] = ['now', 'leave', 'arrive'];

function modeLabel(mode: DepartureMode): string {
  if (mode === 'leave') return t('home.departAt');
  if (mode === 'arrive') return t('home.arriveAt');
  return t('home.leaveNow');
}

function timeValid(value: string): boolean {
  return /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value.trim());
}

export function DeparturePicker({ visible, value, onChange, onClose }: DeparturePickerProps) {
  const { colors } = useTheme();
  const [time, setTime] = useState(value.time);
  const [error, setError] = useState(false);

  function pick(mode: DepartureMode): void {
    if (mode === 'now') {
      setError(false);
      onChange({ mode, time: '' });
      onClose();
      return;
    }
    if (!timeValid(time)) {
      setError(true);
      return;
    }
    setError(false);
    onChange({ mode, time: time.trim() });
    onClose();
  }

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      {MODES.map((mode) => (
        <Pressable
          key={mode}
          accessibilityRole="radio"
          accessibilityState={{ selected: value.mode === mode }}
          onPress={() => pick(mode)}
          style={styles.row}
        >
          <Ionicons
            name={value.mode === mode ? 'radio-button-on' : 'radio-button-off-outline'}
            size={22}
            color={colors.primary}
          />
          <Text style={[styles.label, { color: colors.text }]}>{modeLabel(mode)}</Text>
        </Pressable>
      ))}
      <TextInput
        value={time}
        onChangeText={(next) => {
          setTime(next);
          setError(false);
        }}
        placeholder={t('home.enterTime')}
        placeholderTextColor={colors.textMuted}
        keyboardType="numbers-and-punctuation"
        maxLength={5}
        style={[styles.input, { color: colors.text, borderColor: error ? colors.danger : colors.border }]}
      />
      {error ? <Text style={[styles.error, { color: colors.danger }]}>{t('home.invalidTime')}</Text> : null}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 48,
  },
  label: {
    fontSize: fontSizes.md,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    minHeight: 48,
    fontSize: fontSizes.md,
    marginTop: spacing.sm,
  },
  error: {
    fontSize: fontSizes.sm,
    marginTop: spacing.xs,
  },
});

export function departureLabel(value: DepartureOption): string {
  if (value.mode === 'leave') return `${t('home.departAt')} ${value.time}`;
  if (value.mode === 'arrive') return `${t('home.arriveAt')} ${value.time}`;
  return t('home.leaveNow');
}
