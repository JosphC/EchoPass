import { StyleSheet } from 'react-native';
import { fontWeights, spacing } from '../../../../core/theme';

/** Google Maps transit timeline: thin line-coloured rail, ringed stops, no per-row dividers. */
export const tlStyles = StyleSheet.create({
  container: { paddingTop: 10 },
  row: { flexDirection: 'row', minHeight: 44 },
  railCol: { width: 24, alignItems: 'center', position: 'relative' },
  railLine: { position: 'absolute', width: 4, top: 0, bottom: 0, borderRadius: 2 },
  railLineFirst: { top: 10 },
  railLineLast: { bottom: undefined, height: 10 },
  bigNode: { width: 16, height: 16, borderRadius: 8, borderWidth: 3.5, zIndex: 4, marginTop: 2 },
  dotNode: { width: 8, height: 8, borderRadius: 4, borderWidth: 2, zIndex: 4, marginTop: 6 },
  infoCol: { flex: 1, paddingLeft: spacing.sm, paddingBottom: 12 },
  mainRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  name: { fontSize: 15, fontWeight: fontWeights.medium },
  nameStrong: { fontWeight: fontWeights.bold },
  timeText: { fontSize: 13.5, fontVariant: ['tabular-nums'] },
  statusText: { fontSize: 12.5, marginTop: 2 },
});
