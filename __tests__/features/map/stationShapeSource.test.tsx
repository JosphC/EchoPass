import { render } from '@testing-library/react-native';
import { ShapeSource } from '@maplibre/maplibre-react-native';
import type { FeatureCollection } from 'geojson';
import { StationShapeSource } from '../../../src/features/map/components/map/StationShapeSource';
import { loadStations, type Station } from '../../../src/features/map';

describe('stații atingibile pe hartă', () => {
  const first = loadStations()[0];

  function renderSource(selectedId: string | null, onPress: (s: Station) => void) {
    const view = render(
      <StationShapeSource selectedId={selectedId} onPress={onPress} />,
    );
    return view.UNSAFE_getByType(ShapeSource).props as {
      shape: FeatureCollection;
      onPress: (e: { features: { properties: Record<string, unknown> | null }[] }) => void;
    };
  }

  it('desenează câte un punct pentru fiecare stație și marchează stația aleasă', () => {
    const source = renderSource(first.id, jest.fn());
    expect(source.shape.features).toHaveLength(loadStations().length);
    const selected = source.shape.features.filter((f) => f.properties?.selected === true);
    expect(selected.map((f) => f.properties?.stationId)).toEqual([first.id]);
  });

  it('tap pe punct deschide exact stația atinsă', () => {
    const onPress = jest.fn();
    const source = renderSource(null, onPress);
    source.onPress({ features: [{ properties: { stationId: first.id } }] });
    expect(onPress).toHaveBeenCalledWith(first);
  });

  it('ignoră tap-urile fără stație (alt strat, id necunoscut)', () => {
    const onPress = jest.fn();
    const source = renderSource(null, onPress);
    source.onPress({ features: [] });
    source.onPress({ features: [{ properties: { stationId: 'nu-exista' } }] });
    source.onPress({ features: [{ properties: null }] });
    expect(onPress).not.toHaveBeenCalled();
  });
});
