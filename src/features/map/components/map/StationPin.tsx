import { StyleSheet, View } from 'react-native';
import { PointAnnotation } from '@maplibre/maplibre-react-native';
import type { Station } from '../../stations';
import type { MapPinPoint } from './LiveMap';

/** Punct de stație: bulină colorată cu chenar alb, mereu deasupra straturilor hărții. */
export function StationPin({ station, pinColor = '#2563EB' }: { station: Station; pinColor?: string }) {
  return (
    <PointAnnotation id={`station-${station.id}`} coordinate={[station.lng, station.lat]} title={station.name}>
      <View style={[styles.dot, { backgroundColor: pinColor }]} />
    </PointAnnotation>
  );
}

/** Pin de origine / destinație al rutei planificate (același stil ca stația). */
export function PlacePin({ id, pin, color }: { id: string; pin?: MapPinPoint | null; color: string }) {
  if (!pin) return null;
  return (
    <PointAnnotation id={id} coordinate={[pin.lng, pin.lat]} title={pin.title}>
      <View style={[styles.dot, { backgroundColor: color }]} />
    </PointAnnotation>
  );
}

const styles = StyleSheet.create({
  dot: {
    alignItems: 'center',
    borderColor: '#FFFFFF',
    borderRadius: 9,
    borderWidth: 3,
    height: 18,
    justifyContent: 'center',
    width: 18,
  },
});
