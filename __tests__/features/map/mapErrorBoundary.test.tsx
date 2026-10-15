import { Text, View } from 'react-native';
import { render } from '@testing-library/react-native';
import { MapErrorBoundary } from '../../../src/features/map/components/map/MapErrorBoundary';

function Boom(): null {
  throw new Error('harta a crăpat');
}

describe('MapErrorBoundary', () => {
  it('arată copiii când harta merge', () => {
    const screen = render(
      <MapErrorBoundary fallback={<View testID="fallback" />}>
        <View testID="copil" />
      </MapErrorBoundary>,
    );
    expect(screen.getByTestId('copil')).toBeTruthy();
    screen.unmount();
  });

  it('arată fallback când harta crapă', () => {
    const silence = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const screen = render(
      <MapErrorBoundary fallback={<Text testID="fallback">listă</Text>}>
        <Boom />
      </MapErrorBoundary>,
    );
    expect(screen.getByTestId('fallback')).toBeTruthy();
    screen.unmount();
    silence.mockRestore();
  });
});
