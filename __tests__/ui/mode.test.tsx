import { render } from '@testing-library/react-native';
import { ModeIcon } from '../../src/ui/ModeIcon/ModeIcon';

jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));

describe('ModeIcon', () => {
  it('always renders a glyph, bus by default', () => {
    expect(render(<ModeIcon mode="bus" />).getByTestId('mode-icon')).toBeTruthy();
    expect(render(<ModeIcon mode={undefined} />).getByTestId('mode-icon')).toBeTruthy();
    expect(render(<ModeIcon mode="tram" />).getByTestId('mode-icon')).toBeTruthy();
    expect(render(<ModeIcon mode="trolley" />).getByTestId('mode-icon')).toBeTruthy();
  });
});
