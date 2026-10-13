import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import { useTheme } from '../../core/theme/useTheme';

interface ModeIconProps {
  mode?: string;
  size?: number;
  color?: string;
}

/** Transport mode glyph; bus by default so no row is ever bare. */
export function ModeIcon({ mode, size = 20, color }: ModeIconProps) {
  const { colors } = useTheme();
  const tint = color ?? colors.text;
  const name = mode === 'tram' ? 'train' : 'bus';
  return (
    <View testID="mode-icon">
      <Ionicons name={name} size={size} color={tint} />
    </View>
  );
}
