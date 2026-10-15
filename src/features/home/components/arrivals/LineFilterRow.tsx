import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { t } from '../../../../core/i18n';
import { fontWeights, spacing } from '../../../../core/theme';
import { useTheme } from '../../../../core/theme/useTheme';
import { LineBadge } from '../../../../ui';

export interface LineFilterOption {
  shortName: string;
  color?: string;
  textColor?: string;
}

interface LineFilterRowProps {
  lines: LineFilterOption[];
  selected: string[];
  onToggle: (line: string) => void;
  onClear: () => void;
}

/** Multi-select line filters with an All chip; picked lines get ring + check. */
export function LineFilterRow({ lines, selected, onToggle, onClear }: LineFilterRowProps) {
  const { colors } = useTheme();
  if (lines.length < 2) return null;
  const filtering = selected.length > 0;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: !filtering }}
        accessibilityLabel={t('home.all')}
        onPress={onClear}
        style={[styles.all, { backgroundColor: !filtering ? colors.primary : 'transparent', borderColor: !filtering ? colors.primary : colors.border }]}
      >
        <Text style={[styles.allText, { color: !filtering ? colors.onPrimary : colors.text }]}>{t('home.all')}</Text>
      </Pressable>
      {lines.map((line) => {
        const chosen = filtering && selected.includes(line.shortName);
        return (
          <Pressable
            key={line.shortName}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: selected.includes(line.shortName) }}
            accessibilityLabel={`Linia ${line.shortName}`}
            onPress={() => onToggle(line.shortName)}
            style={[
              styles.chip,
              { opacity: !filtering || chosen ? 1 : 0.45, borderColor: chosen ? colors.primary : 'transparent', borderWidth: chosen ? 2 : 0 },
            ]}
          >
            <LineBadge shortName={line.shortName} color={line.color} textColor={line.textColor} />
            {chosen ? (
              <View style={[styles.check, { backgroundColor: colors.primary }]}>
                <Ionicons name="checkmark" size={12} color={colors.onPrimary} />
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 8,
    paddingRight: spacing.xl,
    paddingVertical: 4,
    alignItems: 'center',
  },
  all: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  allText: {
    fontSize: 12.5,
    fontWeight: fontWeights.bold,
  },
  chip: {
    borderRadius: 8,
  },
  check: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
