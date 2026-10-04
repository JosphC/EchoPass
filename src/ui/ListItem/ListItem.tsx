import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { fontSizes, fontWeights, spacing } from '../../core/theme';
import { useTheme } from '../../core/theme/useTheme';

interface ListItemProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  onPress?: () => void;
  testID?: string;
}

export function ListItem({ title, subtitle, icon, onPress, testID }: ListItemProps) {
  const { colors } = useTheme();
  const Inner = (
    <View style={[styles.root, { borderBottomColor: colors.border }]}>
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <View style={styles.texts}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text> : null}
      </View>
      {onPress ? <Text style={[styles.chevron, { color: colors.textMuted }]}>{'>'}</Text> : null}
    </View>
  );

  if (!onPress) return <View testID={testID}>{Inner}</View>;
  return (
    <Pressable testID={testID} accessibilityRole="button" onPress={onPress} style={styles.pressable}>
      {Inner}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    minHeight: 44,
    justifyContent: 'center',
  },
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  texts: {
    flex: 1,
    gap: spacing.xs,
  },
  icon: {
    width: 28,
    alignItems: 'center',
  },
  title: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium,
  },
  subtitle: {
    fontSize: fontSizes.sm,
  },
  chevron: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
  },
});
