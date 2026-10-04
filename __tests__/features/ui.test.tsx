import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';
import { BottomSheet } from '../../src/ui/BottomSheet/BottomSheet';
import { Button } from '../../src/ui/Button/Button';
import { Card } from '../../src/ui/Card/Card';
import { CrowdBars } from '../../src/ui/CrowdBars/CrowdBars';
import { ListItem } from '../../src/ui/ListItem/ListItem';
import { ProgressBar } from '../../src/ui/ProgressBar/ProgressBar';
import { ScreenHeader } from '../../src/ui/ScreenHeader/ScreenHeader';
import { Segmented } from '../../src/ui/Segmented/Segmented';
import { Tag } from '../../src/ui/Tag/Tag';
import { Toast } from '../../src/ui/Toast/Toast';
import { Toggle } from '../../src/ui/Toggle/Toggle';

describe('ui library (faza 2)', () => {
  it('button calls onPress and respects disabled', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button title="Mergi" onPress={onPress} />);
    fireEvent.press(getByText('Mergi'));
    expect(onPress).toHaveBeenCalledTimes(1);

    const blocked = jest.fn();
    const disabled = render(<Button title="Stop" onPress={blocked} disabled />);
    fireEvent.press(disabled.getByText('Stop'));
    expect(blocked).not.toHaveBeenCalled();
  });

  it('renders card, tag, toast and list item', () => {
    const card = render(
      <Card>
        <Text>Continut</Text>
      </Card>,
    );
    expect(card.getByText('Continut')).toBeTruthy();
    expect(render(<Tag label="Rapid" tone="info" />).getByText('Rapid')).toBeTruthy();
    expect(render(<Toast message="Plata reusita" tone="success" />).getByText('Plata reusita')).toBeTruthy();

    const onPress = jest.fn();
    const item = render(<ListItem title="Linia 5" subtitle="Sosire 3 min" onPress={onPress} />);
    fireEvent.press(item.getByText('Linia 5'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('toggle flips value and segmented switches option', () => {
    const onToggle = jest.fn();
    const { getByRole } = render(<Toggle value={false} onValueChange={onToggle} label="Check-in automat" />);
    fireEvent.press(getByRole('switch'));
    expect(onToggle).toHaveBeenCalledWith(true);

    const onChange = jest.fn();
    const seg = render(<Segmented options={['Rapid', 'Ieftin']} value="Rapid" onChange={onChange} />);
    fireEvent.press(seg.getByText('Ieftin'));
    expect(onChange).toHaveBeenCalledWith('Ieftin');
  });

  it('header, sheet, crowd and progress expose accessibility values', () => {
    expect(render(<ScreenHeader title="Wallet" />).getByText('Wallet')).toBeTruthy();
    const sheet = render(
      <BottomSheet visible onClose={jest.fn()}>
        <Text>Optiuni</Text>
      </BottomSheet>,
    );
    expect(sheet.getByText('Optiuni')).toBeTruthy();

    const crowd = render(<CrowdBars level={2} testID="crowd" />);
    expect(crowd.getByTestId('crowd').props.accessibilityValue).toEqual({ now: 2, min: 1, max: 3 });
    const progress = render(<ProgressBar value={0.5} testID="progress" />);
    expect(progress.getByTestId('progress').props.accessibilityValue).toEqual({ now: 50, min: 0, max: 100 });
  });
});
