import { StyleSheet } from 'react-native';
import { fontWeights, spacing } from '../../../../core/theme';

/** Same surfaces as Activity and Wallet: no borders, 24 radius, sentence-case labels. */
export const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, paddingTop: 54, gap: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 24, fontWeight: fontWeights.bold, letterSpacing: -0.4 },
  closeBtn: { padding: spacing.xs },
  summaryCard: { borderRadius: 24, padding: 20, gap: 2 },
  monthTitle: { fontSize: 12.5, letterSpacing: 0.2 },
  total: { fontSize: 28, fontWeight: fontWeights.bold, letterSpacing: -0.5, marginTop: 2 },
  summarySub: { fontSize: 13, marginTop: 2 },
  listTitle: { fontSize: 13, fontWeight: fontWeights.medium, marginTop: spacing.xs, marginLeft: 4 },
  // Shrink-wraps short lists (no tall empty card), scrolls when the month is long.
  listCard: { flexShrink: 1, borderRadius: 24, overflow: 'hidden' },
  separator: { height: StyleSheet.hairlineWidth, marginLeft: 88 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 14, paddingHorizontal: 18 },
  itemMain: { flex: 1, gap: 3, marginLeft: 2 },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  shrink: { flexShrink: 1 },
  itemTitle: { fontSize: 15, fontWeight: fontWeights.bold },
  itemMeta: { fontSize: 12.5 },
  itemPrice: { fontSize: 15, fontWeight: fontWeights.bold },
  actions: { marginTop: 'auto', paddingTop: spacing.xs },
  downloadBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, height: 50, borderRadius: 999 },
  downloadText: { fontSize: 15, fontWeight: fontWeights.semiBold },
});
