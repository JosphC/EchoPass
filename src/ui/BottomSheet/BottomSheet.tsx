import type { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { radius, spacing } from '../../core/theme';
import { t } from '../../core/i18n';
import { useTheme } from '../../core/theme/useTheme';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  testID?: string;
}

export function BottomSheet({ visible, onClose, children, testID }: BottomSheetProps) {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('common.close')}
        onPress={onClose}
        style={[styles.scrim, { backgroundColor: colors.scrim }]}
      />
      <View testID={testID} style={[styles.sheet, { backgroundColor: colors.card }]}>
        <View style={[styles.handle, { backgroundColor: colors.border }]} />
        {children}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
  },
  sheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: radius.full,
  },
});
