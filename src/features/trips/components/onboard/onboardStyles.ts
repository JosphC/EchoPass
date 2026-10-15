import { StyleSheet } from 'react-native';
import { fontWeights } from '../../../../core/theme';

export const styles = StyleSheet.create({
  // Wallet surface: side margins, 24 radius, no border or accent stripe.
  card: {
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 24,
    overflow: 'hidden',
  },
  headerPressable: {
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textBlock: {
    flex: 1,
    marginLeft: 12,
    gap: 2,
  },
  destinationText: {
    fontSize: 16,
    fontWeight: fontWeights.bold,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  stationText: {
    fontSize: 13,
  },
  fromText: {
    flexShrink: 1,
  },
  // The next stop is the one thing worth a glance: soft inset block, line-coloured stop ring.
  nextBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  nextRing: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 3.5,
  },
  nextLabel: {
    fontSize: 12,
  },
  nextStopHeader: {
    fontSize: 15.5,
    fontWeight: fontWeights.semiBold,
  },
  nextEta: {
    fontSize: 13,
    fontWeight: fontWeights.medium,
    marginLeft: 8,
  },
  timelineWrap: {
    paddingHorizontal: 18,
    paddingBottom: 16,
  },
  togglePrevBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 8,
    paddingBottom: 4,
  },
  togglePrevText: {
    fontSize: 13,
    fontWeight: fontWeights.medium,
  },
});
