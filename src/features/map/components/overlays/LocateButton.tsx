import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { t } from '../../../../core/i18n';
import { radius, spacing } from '../../../../core/theme';
import { useTheme } from '../../../../core/theme/useTheme';

interface LocateButtonProps {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  active?: boolean;
}

/** Google Maps style "my location" FAB: white circle docked above the sheet. */
export function LocateButton({ onPress, style, active = false }: LocateButtonProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('live.locate')}
      onPress={onPress}
      style={({ pressed }) => [
        styles.locate,
        { backgroundColor: colors.card, opacity: pressed ? 0.82 : 1 },
        style ?? styles.defaultPos,
      ]}
    >
      <Ionicons name={active ? 'locate-sharp' : 'locate-outline'} size={24} color={active ? '#1A73E8' : colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  locate: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.28,
    shadowRadius: 6,
  },
  defaultPos: {
    position: 'absolute',
    left: spacing.lg,
    bottom: spacing.lg,
  },
});
