import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, type Region } from 'react-native-maps';
import { useTheme } from '../../../core/theme/useTheme';
import type { BusMarker } from '../hooks/useLiveMap';
import { hasMapKey } from '../mapKey';
import type { Station } from '../stations';
import { BusListFallback } from './BusListFallback';

const TIMISOARA: Region = {
  latitude: 45.7577,
  longitude: 21.2287,
  latitudeDelta: 0.12,
  longitudeDelta: 0.12,
};

interface LiveMapProps {
  markers: BusMarker[];
  station: Station | null;
  selectedId: string | null;
  followed: BusMarker | null;
  located?: boolean;
  onSelect: (id: string) => void;
  onLocated?: () => void;
}

export function LiveMap({ markers, station, selectedId, followed, located = true, onSelect, onLocated }: LiveMapProps) {
  const ref = useRef<MapView>(null);
  const { colors } = useTheme();

  useEffect(() => {
    if (!located && onLocated) onLocated();
  }, [located, onLocated]);

  useEffect(() => {
    if (followed?.position) {
      ref.current?.animateToRegion(
        { latitude: followed.position.lat, longitude: followed.position.lng, latitudeDelta: 0.03, longitudeDelta: 0.03 },
        500,
      );
    }
  }, [followed]);

  if (!hasMapKey()) {
    return <BusListFallback markers={markers} onSelect={onSelect} />;
  }

  return (
    <MapView ref={ref} style={styles.map} provider={PROVIDER_GOOGLE} initialRegion={TIMISOARA} showsUserLocation>
      {station ? (
        <Marker
          coordinate={{ latitude: station.lat, longitude: station.lng }}
          title={station.name}
          description={station.lines.join(' · ')}
          pinColor="red"
        />
      ) : null}
      {markers.map(({ bus, position }) =>
        position ? (
          <Marker
            key={bus.id}
            coordinate={{ latitude: position.lat, longitude: position.lng }}
            title={`Linia ${bus.line}`}
            description={bus.destination}
            onPress={() => onSelect(bus.id)}
          >
            <View
              style={[
                styles.bus,
                { backgroundColor: colors.primary, borderColor: '#FFFFFF' },
                selectedId === bus.id && styles.selected,
              ]}
            >
              <Ionicons name="bus-outline" size={20} color="#FFFFFF" />
            </View>
          </Marker>
        ) : null,
      )}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
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
