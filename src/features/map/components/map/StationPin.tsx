import { Marker } from 'react-native-maps';
import type { Station } from '../../stations';

/**
 * Station pin wrapped so the clustering engine treats it as a plain child
 * and never absorbs it into a bus cluster.
 */
export function StationPin({ station, pinColor = '#2563EB' }: { station: Station; pinColor?: string }) {
  return (
    <Marker
      coordinate={{ latitude: station.lat, longitude: station.lng }}
      title={station.name}
      description={station.lines.join(' · ')}
      pinColor={pinColor}
    />
  );
}
