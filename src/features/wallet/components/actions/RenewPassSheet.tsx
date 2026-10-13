import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getLocale, t } from '../../../../core/i18n';
import { fontSizes, fontWeights, radius, spacing, useTheme } from '../../../../core/theme';
import { BottomSheet, Button } from '../../../../ui';
import type { WalletItem } from '../../types';
import { PASS_PRODUCTS, passCategoryLabel } from '../../passCatalog';

interface RenewPassSheetProps {
  visible: boolean;
  passItem: Extract<WalletItem, { kind: 'pass' }> | null;
  onClose: () => void;
  onRenew: (days: number) => void;
}

export function RenewPassSheet({
  visible,
  passItem,
  onClose,
  onRenew,
}: RenewPassSheetProps) {
  const { colors } = useTheme();
  const locale = getLocale();
  const [selectedId, setSelectedId] = useState<string>('general-30');

  if (!passItem) return null;

  const selected = PASS_PRODUCTS.find((p) => p.id === selectedId) ?? PASS_PRODUCTS[0];
  const curr = new Date(passItem.validUntil);
  const base = isNaN(curr.getTime()) || curr < new Date() ? new Date() : curr;
  const newExpiry = new Date(base.getTime() + selected.days * 86_400_000).toISOString().slice(0, 10);

  const handleConfirm = () => {
    onRenew(selected.days);
    onClose();
  };

  const categories: ('personal' | 'company')[] = ['personal', 'company'];

  return (
    <BottomSheet visible={visible} onClose={onClose} testID="renew-pass-sheet">
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: '#F3E8FF' }]}>
          <Ionicons name="repeat-outline" size={24} color="#7C3AED" />
        </View>
        <View style={styles.headerTexts}>
          <Text style={[styles.title, { color: colors.text }]}>{t('wallet.renewTitle')}</Text>
          <Text style={[styles.sub, { color: colors.textMuted }]}>{t('wallet.renewDesc')}</Text>
        </View>
      </View>

      {/* Expiry calculation preview */}
      <View style={[styles.expiryBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.expiryRow}>
          <Text style={[styles.label, { color: colors.textMuted }]}>{t('wallet.currentExpiry')}</Text>
          <Text style={[styles.val, { color: colors.text }]}>{passItem.validUntil}</Text>
        </View>
        <Ionicons name="arrow-forward" size={16} color={colors.primary} style={{ alignSelf: 'center' }} />
        <View style={styles.expiryRow}>
          <Text style={[styles.label, { color: colors.textMuted }]}>{t('wallet.newExpiry')}</Text>
          <Text style={[styles.val, { color: colors.primary, fontWeight: fontWeights.bold }]}>
            {newExpiry}
          </Text>
        </View>
      </View>

      {/* Official STPT subscription catalog */}
      <ScrollView style={styles.optionsScroll} showsVerticalScrollIndicator={false}>
        {categories.map((category) => (
          <View key={category} style={styles.categoryGroup}>
            <Text style={[styles.categoryLabel, { color: colors.textMuted }]}>
              {passCategoryLabel(category, locale)}
            </Text>
            {PASS_PRODUCTS.filter((p) => p.category === category).map((product) => {
              const active = product.id === selected.id;
              const name = locale === 'ro' ? product.nameRo : product.nameEn;
              const coverage = locale === 'ro' ? product.coverageRo : product.coverageEn;
              return (
                <Pressable
                  key={product.id}
                  testID={`pass-option-${product.id}`}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: active }}
                  accessibilityLabel={`${name}, ${product.priceRon} lei`}
                  onPress={() => setSelectedId(product.id)}
                  style={[
                    styles.optionCard,
                    {
                      backgroundColor: active ? colors.surface : colors.background,
                      borderColor: active ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <View style={styles.optionContent}>
                    <View style={styles.optionTitleRow}>
                      <Text style={[styles.optionTitle, { color: colors.text }]}>
                        {name}
                      </Text>
                      <Text style={[styles.optionPrice, { color: colors.primary }]}>
                        {product.priceRon} lei
                      </Text>
                    </View>
                    <Text style={[styles.optionSub, { color: colors.textMuted }]}>
                      {coverage}
                    </Text>
                  </View>
                  <Ionicons
                    name={active ? 'radio-button-on' : 'radio-button-off'}
                    size={22}
                    color={active ? colors.primary : colors.textMuted}
                  />
                </Pressable>
              );
            })}
          </View>
        ))}
      </ScrollView>

      {/* Confirm Button */}
      <Button title={t('wallet.confirmRenew')} onPress={handleConfirm} />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.xs },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  headerTexts: { flex: 1, gap: 2 },
  title: { fontSize: fontSizes.lg, fontWeight: fontWeights.bold },
  sub: { fontSize: fontSizes.sm },
  expiryBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md, borderRadius: radius.md, borderWidth: 1 },
  expiryRow: { gap: 2 },
  label: { fontSize: fontSizes.xs },
  val: { fontSize: fontSizes.sm },
  optionsScroll: { maxHeight: 320 },
  categoryGroup: { gap: spacing.xs, marginTop: spacing.sm },
  categoryLabel: { fontSize: fontSizes.xs, fontWeight: fontWeights.semiBold, textTransform: 'uppercase' },
  optionCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md, borderRadius: radius.md, borderWidth: 1.5, gap: spacing.sm },
  optionContent: { flex: 1, gap: 2 },
  optionTitleRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: spacing.sm },
  optionTitle: { fontSize: fontSizes.sm, fontWeight: fontWeights.semiBold, flexShrink: 1 },
  optionPrice: { fontSize: fontSizes.sm, fontWeight: fontWeights.bold },
  optionSub: { fontSize: fontSizes.xs },
});
