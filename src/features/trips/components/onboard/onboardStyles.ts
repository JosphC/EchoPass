import { StyleSheet } from 'react-native';
import { fontWeights } from '../../../../core/theme';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: 'transparent',
    position: 'relative',
    overflow: 'hidden',
    borderBottomWidth: 1,
  },
  accentStripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4.5,
    backgroundColor: '#2E7D5B',
  },
  headerPressable: {
    position: 'relative',
    paddingVertical: 14,
    paddingLeft: 18,
    paddingRight: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lineBadgeWrap: {
    backgroundColor: '#2E7D5B',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 32,
  },
  lineBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: fontWeights.bold,
  },
  textBlock: {
    flex: 1,
    marginLeft: 12,
    gap: 2,
  },
  destinationText: {
    fontSize: 15.5,
    fontWeight: fontWeights.bold,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#16A34A',
  },
  laBordText: {
    fontSize: 13,
    fontWeight: fontWeights.bold,
    color: '#16A34A',
  },
  stationText: {
    fontSize: 13,
  },
  nextStopHeader: {
    fontSize: 13,
    fontWeight: fontWeights.semiBold,
  },
  timelineWrap: {
    paddingLeft: 18,
    paddingRight: 16,
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
