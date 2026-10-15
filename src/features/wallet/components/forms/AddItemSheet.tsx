import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { t } from '../../../../core/i18n';
import { fontWeights } from '../../../../core/theme';
import { useTheme } from '../../../../core/theme/useTheme';
import { BottomSheet, ChevronRight } from '../../../../ui';

interface AddItemSheetProps {
  visible: boolean;
  onClose: () => void;
  onPickCard: () => void;
  onPickPass: () => void;
}

/** Two equal choices as one grouped list (icon, title, description, chevron), not two primary buttons. */
export function AddItemSheet({ visible, onClose, onPickCard, onPickPass }: AddItemSheetProps) {
  const { colors } = useTheme();
  const options: { icon: keyof typeof Ionicons.glyphMap; title: string; sub: string; onPress: () => void }[] = [
    { icon: 'card-outline', title: t('wallet.addCard'), sub: t('wallet.addCardSub'), onPress: onPickCard },
    { icon: 'bus-outline', title: t('wallet.addPass'), sub: t('wallet.addPassSub'), onPress: onPickPass },
  ];

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <Text style={[styles.title, { color: colors.text }]}>{t('wallet.addTitle')}</Text>
      <View style={[styles.group, { borderColor: colors.border }]}>
        {options.map((o, i) => (
          <Pressable
            key={o.title}
            accessibilityRole="button"
            accessibilityLabel={`${o.title}, ${o.sub}`}
            onPress={o.onPress}
            style={({ pressed }) => [
              styles.row,
              i > 0 && { borderTopColor: colors.border, borderTopWidth: StyleSheet.hairlineWidth },
              pressed && { backgroundColor: colors.fill },
            ]}
          >
            <View style={[styles.icon, { backgroundColor: colors.primarySoft }]}>
              <Ionicons name={o.icon} size={20} color={colors.primary} />
            </View>
            <View style={styles.texts}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>{o.title}</Text>
              <Text style={[styles.rowSub, { color: colors.textMuted }]}>{o.sub}</Text>
            </View>
            <ChevronRight size={18} />
          </Pressable>
        ))}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: fontWeights.bold, letterSpacing: -0.3 },
  group: { borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 14, paddingVertical: 14 },
  icon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  texts: { flex: 1, gap: 2 },
  rowTitle: { fontSize: 15, fontWeight: fontWeights.semiBold },
  rowSub: { fontSize: 13 },
});
