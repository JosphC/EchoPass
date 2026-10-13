import { StyleSheet, Text, View } from 'react-native';
import { t } from '../../../../core/i18n';
import { useTheme } from '../../../../core/theme/useTheme';
import type { Station } from '../../stations';
import { StationSheet } from './sheets/StationSheet';

interface LiveOverlaysProps {
  showEmpty: boolean;
  emptyText?: string;
  sheetOpen: boolean;
  onCloseSheet: () => void;
  onPickStation: (station: Station) => void;
}

export function LiveOverlays({ showEmpty, emptyText, sheetOpen, onCloseSheet, onPickStation }: LiveOverlaysProps) {
  const { colors } = useTheme();

  return (
    <>
      {showEmpty ? (
        <View style={[styles.empty, { backgroundColor: colors.card }]}>
          <Text style={{ color: colors.textMuted }}>{emptyText ?? t('live.empty')}</Text>
        </View>
      ) : null}
      <StationSheet visible={sheetOpen} onClose={onCloseSheet} onPick={onPickStation} />
    </>
  );
}

const styles = StyleSheet.create({
  empty: {
    position: 'absolute',
    top: 170,
    alignSelf: 'center',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});
