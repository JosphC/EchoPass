import { ScrollView, StyleSheet } from 'react-native';
import { t } from '../../../core/i18n';
import { ListItem } from '../../../ui';
import type { BusMarker } from '../hooks/useLiveMap';

interface BusListFallbackProps {
  markers: BusMarker[];
  onSelect: (id: string) => void;
}

/** Shown when no Google Maps key is compiled in: same live data, list form. */
export function BusListFallback({ markers, onSelect }: BusListFallbackProps) {
  return (
    <ScrollView style={styles.root}>
      {markers.map(({ bus, position }) => (
        <ListItem
          key={bus.id}
          title={`Linia ${bus.line} · ${bus.destination}`}
          subtitle={position ? `${t('live.nowAt')} ${position.nextStop}` : bus.destination}
          onPress={() => onSelect(bus.id)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
