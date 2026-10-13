import { StyleSheet, Text, View } from 'react-native';
import { t } from '../../../../core/i18n';
import { fontSizes, fontWeights, spacing } from '../../../../core/theme';
import { useTheme } from '../../../../core/theme/useTheme';
import { BottomSheet, Button } from '../../../../ui';

interface AddItemSheetProps {
  visible: boolean;
  onClose: () => void;
  onPickCard: () => void;
  onPickPass: () => void;
}

export function AddItemSheet({ visible, onClose, onPickCard, onPickPass }: AddItemSheetProps) {
  const { colors } = useTheme();

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <Text style={[styles.title, { color: colors.text }]}>{t('wallet.addTitle')}</Text>
      <View style={styles.buttons}>
        <Button title={t('wallet.addCard')} onPress={onPickCard} />
        <Button title={t('wallet.addPass')} onPress={onPickPass} />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
  },
  buttons: {
    gap: spacing.md,
  },
});
