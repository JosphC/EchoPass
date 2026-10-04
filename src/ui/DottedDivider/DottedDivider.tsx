import { StyleSheet, View } from 'react-native';
import { spacing } from '../../core/theme';
import { useTheme } from '../../core/theme/useTheme';

/** Dotted horizontal rule, e.g. under headers. */
export function DottedDivider() {
  const { colors } = useTheme();
  return <View style={[styles.rule, { borderColor: colors.primary }]} />;
}

const styles = StyleSheet.create({
  rule: {
    borderBottomWidth: 1,
    borderStyle: 'dotted',
    marginVertical: spacing.sm,
  },
});
