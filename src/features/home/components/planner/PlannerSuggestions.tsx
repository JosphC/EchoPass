import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { t } from '../../../../core/i18n';
import { useTheme } from '../../../../core/theme/useTheme';
import { StationResults, type LocationPlace } from '../../../../features/map';
import { styles } from './plannerCardStyles';

interface PlannerSuggestionsProps {
  typing: boolean;
  results: LocationPlace[];
  onPick: (place: LocationPlace) => void;
}

export function PlannerSuggestions({
  typing,
  results,
  onPick,
}: PlannerSuggestionsProps) {
  const { colors, isDark } = useTheme();

  if (typing && results.length > 0) {
    return (
      <View style={styles.suggestionsContainer}>
        <StationResults results={results} onPick={onPick} floating={false} />
      </View>
    );
  }

  if (typing && results.length === 0) {
    return (
      <View style={[styles.emptyContainer, { borderColor: colors.border, backgroundColor: isDark ? '#303134' : '#F8FAFC' }]}>
        <Ionicons name="search-outline" size={18} color={colors.textMuted} />
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>{t('home.noStations')}</Text>
      </View>
    );
  }

  return null;
}
