import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { fontWeights, spacing, useTheme } from '../../../core/theme';

export interface MonthOption {
  key: string;
  label: string;
}

interface TripsMonthHeaderProps {
  months: MonthOption[];
  selectedMonth: string;
  onSelectMonth: (monthKey: string) => void;
  tripCount: number;
  totalFareRon: number;
  onOpenStatement: () => void;
}

function getMonthDisplay(label: string): string {
  const match = label.match(/\((.*?)\)/);
  if (match && match[1]) return match[1];
  return label.replace(/\s+\d{4}$/, '');
}

export function TripsMonthHeader({
  months,
  selectedMonth,
  onSelectMonth,
  tripCount,
  totalFareRon,
  onOpenStatement,
}: TripsMonthHeaderProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.topRow}>
        <Text style={[styles.kicker, { color: colors.textMuted }]}>Activitate lunară</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Exportă extras" onPress={onOpenStatement} hitSlop={8}>
          <Text style={[styles.extrasBtnText, { color: colors.primary }]}>Extras</Text>
        </Pressable>
      </View>

      <View style={styles.heroCol}>
        <Text style={[styles.countTitle, { color: colors.text }]}>
          {tripCount} {tripCount === 1 ? 'călătorie' : 'călătorii'}
        </Text>
        <Text style={[styles.countSub, { color: colors.textMuted }]}>
          {totalFareRon.toFixed(2).replace('.', ',')} lei decontați · STPT
        </Text>
      </View>

      <View style={[styles.selectorWrapper, { borderBottomColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.monthsScroll}>
          {months.map((m) => {
            const isSelected = m.key === selectedMonth;
            const displayName = getMonthDisplay(m.label);
            return (
              <Pressable key={m.key} onPress={() => onSelectMonth(m.key)} style={styles.monthTab}>
                <Text
                  style={[
                    styles.monthText,
                    {
                      color: isSelected ? colors.text : colors.textMuted,
                      fontWeight: isSelected ? fontWeights.bold : fontWeights.medium,
                    },
                  ]}
                >
                  {displayName}
                </Text>
                {isSelected && <View style={[styles.activeUnderline, { backgroundColor: colors.primary }]} />}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    gap: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  kicker: {
    fontSize: 13,
    fontWeight: fontWeights.semiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  extrasBtnText: {
    fontSize: 14,
    fontWeight: fontWeights.bold,
  },
  heroCol: {
    gap: 2,
    marginTop: 2,
  },
  countTitle: {
    fontSize: 24,
    fontWeight: fontWeights.bold,
    letterSpacing: -0.4,
  },
  countSub: {
    fontSize: 13,
  },
  selectorWrapper: {
    marginTop: 10,
  },
  monthsScroll: {
    gap: 22,
    paddingRight: spacing.sm,
  },
  monthTab: {
    paddingBottom: 8,
    position: 'relative',
    alignItems: 'center',
  },
  monthText: {
    fontSize: 14,
  },
  activeUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#2563EB',
    borderRadius: 1.5,
  },
});
