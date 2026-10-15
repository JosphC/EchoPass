import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getLocale, t } from '../../../../core/i18n';
import { fontWeights, useTheme } from '../../../../core/theme';
import { BottomSheet, Button } from '../../../../ui';
import type { WalletItem } from '../../types';
import { PASS_PRODUCTS, passCategoryLabel } from '../../passCatalog';

interface RenewPassSheetProps {
  visible: boolean;
  passItem: Extract<WalletItem, { kind: 'pass' }> | null;
  onClose: () => void;
  onRenew: (days: number) => void;
}

function longDate(d: Date): string {
  return d.toLocaleDateString(getLocale() === 'ro' ? 'ro-RO' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

/**
 * Google-style renewal sheet: plain title, a neutral "now → after renewal"
 * summary, one grouped radio list per category (radio left, price right)
 * and a single filled action that states the amount.
 */
export function RenewPassSheet({ visible, passItem, onClose, onRenew }: RenewPassSheetProps) {
  const { colors } = useTheme();
  const locale = getLocale();
  const [selectedId, setSelectedId] = useState<string>('general-30');

  if (!passItem) return null;

  const selected = PASS_PRODUCTS.find((p) => p.id === selectedId) ?? PASS_PRODUCTS[0];
  const curr = new Date(passItem.validUntil);
  const base = isNaN(curr.getTime()) || curr < new Date() ? new Date() : curr;
  const newExpiry = new Date(base.getTime() + selected.days * 86_400_000);

  const handleConfirm = () => {
    onRenew(selected.days);
    onClose();
  };

  const categories: ('personal' | 'company')[] = ['personal', 'company'];

  return (
    <BottomSheet visible={visible} onClose={onClose} testID="renew-pass-sheet">
      <Text style={[styles.title, { color: colors.text }]}>{t('wallet.renewTitle')}</Text>
      <Text style={[styles.sub, { color: colors.textMuted }]}>{t('wallet.renewDesc')}</Text>

      <View style={[styles.summary, { backgroundColor: colors.fill }]}>
        <View style={styles.summaryCol}>
          <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>{t('wallet.currentExpiry')}</Text>
          <Text style={[styles.summaryOld, { color: colors.textMuted }]}>{longDate(base)}</Text>
        </View>
        <Ionicons name="arrow-forward" size={18} color={colors.textMuted} />
        <View style={[styles.summaryCol, styles.summaryRight]}>
          <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>{t('wallet.newExpiry')}</Text>
          <Text style={[styles.summaryNew, { color: colors.text }]}>{longDate(newExpiry)}</Text>
        </View>
      </View>

      <ScrollView style={styles.optionsScroll} showsVerticalScrollIndicator={false}>
        {categories.map((category) => (
          <View key={category} style={styles.categoryGroup}>
            <Text style={[styles.categoryLabel, { color: colors.textMuted }]}>{passCategoryLabel(category, locale)}</Text>
            <View style={[styles.group, { borderColor: colors.border }]}>
              {PASS_PRODUCTS.filter((p) => p.category === category).map((product, i) => {
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
                      styles.option,
                      i > 0 && { borderTopColor: colors.border, borderTopWidth: StyleSheet.hairlineWidth },
                      active && { backgroundColor: colors.primarySoft },
                    ]}
                  >
                    <Ionicons
                      name={active ? 'radio-button-on' : 'radio-button-off'}
                      size={22}
                      color={active ? colors.primary : colors.textMuted}
                    />
                    <View style={styles.optionContent}>
                      <Text style={[styles.optionTitle, { color: colors.text }]}>{name}</Text>
                      <Text numberOfLines={2} style={[styles.optionSub, { color: colors.textMuted }]}>{coverage}</Text>
                    </View>
                    <Text style={[styles.optionPrice, { color: colors.text }]}>{product.priceRon} lei</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>

      <Button pill title={`${t('wallet.confirmRenew')} · ${selected.priceRon} lei`} onPress={handleConfirm} />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: fontWeights.bold, letterSpacing: -0.3 },
  sub: { fontSize: 14, marginTop: -6 },
  summary: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14 },
  summaryCol: { flex: 1, gap: 2 },
  summaryRight: { alignItems: 'flex-end' },
  summaryLabel: { fontSize: 12.5 },
  summaryOld: { fontSize: 15 },
  summaryNew: { fontSize: 15, fontWeight: fontWeights.bold },
  optionsScroll: { maxHeight: 340 },
  categoryGroup: { gap: 8, marginTop: 12 },
  categoryLabel: { fontSize: 13, fontWeight: fontWeights.medium },
  group: { borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  option: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 14, paddingVertical: 13 },
  optionContent: { flex: 1, gap: 2 },
  optionTitle: { fontSize: 15, fontWeight: fontWeights.semiBold },
  optionSub: { fontSize: 12.5 },
  optionPrice: { fontSize: 15, fontWeight: fontWeights.semiBold },
});
