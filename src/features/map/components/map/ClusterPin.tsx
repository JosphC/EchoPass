import { StyleSheet, Text, View } from 'react-native';
import { Marker } from 'react-native-maps';
import { fontSizes, fontWeights } from '../../../../core/theme';

export interface ClusterPoint {
  geometry: { coordinates: [number, number] };
  properties: { point_count: number; cluster_id: number };
}

interface ClusterPinProps {
  cluster: ClusterPoint;
  color: string;
}

/** Cluster bubble: bitmap snapshotted once (never tracks view changes). */
export function ClusterPin({ cluster, color }: ClusterPinProps) {
  const [lng, lat] = cluster.geometry.coordinates;
  return (
    <Marker
      key={`c-${cluster.properties.cluster_id}`}
      coordinate={{ latitude: lat, longitude: lng }}
      tracksViewChanges={false}
    >
      <View style={[styles.cluster, { backgroundColor: color, borderColor: '#FFFFFF' }]}>
        <Text style={styles.clusterText}>{cluster.properties.point_count}</Text>
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  cluster: {
    minWidth: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  clusterText: {
    color: '#FFFFFF',
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
  },
});
