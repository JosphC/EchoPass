import { StyleSheet } from 'react-native';
import { fontSizes, fontWeights, radius, spacing } from '../../../../core/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    paddingTop: 54,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  summaryCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.sm,
    elevation: 1,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  monthTitle: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.xs,
  },
  statCol: {
    gap: 2,
  },
  statLabel: {
    fontSize: fontSizes.xs,
  },
  statValue: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
  },
  listContainer: {
    flex: 1,
    gap: spacing.xs,
  },
  listTitle: {
    fontSize: 11,
    fontWeight: fontWeights.bold,
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  itemMain: {
    flex: 1,
    gap: 2,
  },
  itemTitle: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semiBold,
  },
  itemMeta: {
    fontSize: fontSizes.xs,
  },
  itemPrice: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.bold,
  },
  actions: {
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 50,
    borderRadius: radius.full,
    backgroundColor: '#0F172A',
  },
  downloadText: {
    color: '#FFFFFF',
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.bold,
  },
});
