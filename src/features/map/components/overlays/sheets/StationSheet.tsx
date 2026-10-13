import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, TextInput, View } from 'react-native';
import { t } from '../../../../../core/i18n';
import { fontSizes, radius, spacing } from '../../../../../core/theme';
import { useTheme } from '../../../../../core/theme/useTheme';
import { BottomSheet, ListItem } from '../../../../../ui';
import { loadStations, searchStations, type Station } from '../../../stations';

interface StationSheetProps {
  visible: boolean;
  onClose: () => void;
  onPick: (station: Station) => void;
}

export function StationSheet({ visible, onClose, onPick }: StationSheetProps) {
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const stations = useMemo(() => loadStations(), []);
  const results = useMemo(() => searchStations(stations, query), [stations, query]);

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder={t('live.searchStations')}
        placeholderTextColor={colors.textMuted}
        style={[styles.input, { color: colors.text, borderColor: colors.border }]}
      />
      <View style={styles.list}>
        <FlatList
          data={results}
          keyExtractor={(s) => s.id}
          keyboardShouldPersistTaps="handled"
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews
          renderItem={({ item }) => (
            <ListItem
              title={item.name}
              subtitle={item.lines.join(' · ')}
              onPress={() => {
                onPick(item);
                onClose();
              }}
            />
          )}
        />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    minHeight: 48,
    fontSize: fontSizes.md,
  },
  list: {
    maxHeight: 320,
  },
});
