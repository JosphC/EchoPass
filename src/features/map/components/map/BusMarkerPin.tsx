import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { Marker } from 'react-native-maps';
import type { BusMarker } from '../../hooks/useLiveMap';

interface BusMarkerPinProps {
  marker: BusMarker;
  selected: boolean;
  color: string;
  onSelect: (id: string) => void;
}

/** Bus pin: bitmap snapshotted once (never tracks view changes). */
export function BusMarkerPin({ marker, selected, color, onSelect }: BusMarkerPinProps) {
  const { bus, position } = marker;
  if (!position) return null;
  return (
    <Marker
      coordinate={{ latitude: position.lat, longitude: position.lng }}
      title={`Linia ${bus.line}`}
      description={bus.destination}
      tracksViewChanges={false}
      onPress={() => onSelect(bus.id)}
    >
      <View style={[styles.bus, { backgroundColor: color, borderColor: '#FFFFFF' }, selected && styles.selected]}>
        <Ionicons name="bus-outline" size={20} color="#FFFFFF" />
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  bus: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selected: {
    transform: [{ scale: 1.25 }],
  },
});
