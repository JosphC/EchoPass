import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { t } from '../../../../core/i18n';
import { fontWeights, spacing } from '../../../../core/theme';
import { useTheme } from '../../../../core/theme/useTheme';

interface BoardHeaderProps {
  stationName: string;
  onOpenPicker: () => void;
}

export function BoardHeader({ stationName, onOpenPicker }: BoardHeaderProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.headingRow}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('live.changeStation')}
        onPress={onOpenPicker}
        style={styles.title}
        hitSlop={8}
      >
        <Text numberOfLines={1} style={[styles.heading, { color: colors.text }]}>
          {stationName}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  headingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  title: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 38 },
  heading: { fontSize: 20, fontWeight: fontWeights.bold, letterSpacing: -0.3, flexShrink: 1 },
});
