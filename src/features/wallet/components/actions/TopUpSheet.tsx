import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { t } from '../../../../core/i18n';
import { fontSizes, fontWeights, radius, spacing, useTheme } from '../../../../core/theme';
import { BottomSheet, Button } from '../../../../ui';

const PRESETS = [10, 20, 50, 100];

interface TopUpSheetProps {
  visible: boolean;
  balanceRon: number;
  activeCardName: string;
  onClose: () => void;
  onTopUp: (amount: number) => void;
}

export function TopUpSheet({
  visible,
  balanceRon,
  activeCardName,
  onClose,
  onTopUp,
}: TopUpSheetProps) {
  const { colors } = useTheme();
  const [selected, setSelected] = useState<number>(20);

  const handleConfirm = () => {
    onTopUp(selected);
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} testID="topup-sheet">
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: '#ECFDF5' }]}>
          <Ionicons name="wallet-outline" size={24} color="#059669" />
        </View>
        <View style={styles.headerTexts}>
          <Text style={[styles.title, { color: colors.text }]}>{t('wallet.topUpTitle')}</Text>
          <Text style={[styles.sub, { color: colors.textMuted }]}>{t('wallet.topUpDesc')}</Text>
        </View>
      </View>

      {/* Balance Box */}
      <View style={[styles.balanceCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.balanceLabel, { color: colors.textMuted }]}>{t('wallet.balance')}</Text>
        <Text style={[styles.balanceValue, { color: colors.text }]}>{balanceRon.toFixed(2)} Lei</Text>
      </View>

      {/* Preset Amount Chips */}
      <View style={styles.chipsRow}>
        {PRESETS.map((amount) => {
          const isSelected = selected === amount;
          return (
            <Pressable
              key={amount}
              testID={`preset-${amount}`}
              accessibilityRole="button"
              accessibilityLabel={`+${amount} Lei`}
              onPress={() => setSelected(amount)}
              style={[
                styles.chip,
                {
                  backgroundColor: isSelected ? colors.primary : colors.surface,
                  borderColor: isSelected ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: isSelected ? '#FFFFFF' : colors.text, fontWeight: isSelected ? fontWeights.bold : fontWeights.medium },
                ]}
              >
                +{amount} Lei
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Payment Source info */}
      <View style={[styles.sourceBox, { backgroundColor: colors.background }]}>
        <Ionicons name="card-outline" size={16} color={colors.textMuted} />
        <Text style={[styles.sourceText, { color: colors.textMuted }]}>
          Plată prin: <Text style={{ color: colors.text, fontWeight: fontWeights.semiBold }}>{activeCardName}</Text>
        </Text>
      </View>

      {/* Confirm Button */}
      <Button
        title={`${t('wallet.confirmTopUp')} (+${selected} Lei)`}
        onPress={handleConfirm}
      />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.xs },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  headerTexts: { flex: 1, gap: 2 },
  title: { fontSize: fontSizes.lg, fontWeight: fontWeights.bold },
  sub: { fontSize: fontSizes.sm },
  balanceCard: { borderRadius: radius.md, borderWidth: 1, padding: spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  balanceLabel: { fontSize: fontSizes.sm },
  balanceValue: { fontSize: fontSizes.lg, fontWeight: fontWeights.bold },
  chipsRow: { flexDirection: 'row', gap: spacing.sm },
  chip: { flex: 1, paddingVertical: spacing.md, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md, borderWidth: 1 },
  chipText: { fontSize: fontSizes.sm },
  sourceBox: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: spacing.sm, borderRadius: radius.sm },
  sourceText: { fontSize: fontSizes.xs },
});
