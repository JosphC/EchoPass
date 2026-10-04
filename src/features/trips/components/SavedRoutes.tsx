import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import type { SavedRoute } from '../../../services/api/schemas/trip';
import { useTheme } from '../../../core/theme/useTheme';
import { ListItem } from '../../../ui';
import { t } from '../../../core/i18n';

interface SavedRoutesProps {
  routes: SavedRoute[];
}

export function SavedRoutes({ routes }: SavedRoutesProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.root}>
      {routes.map((r) => (
        <ListItem
          key={r.id}
          icon={<Ionicons name="bus-outline" size={22} color={colors.primary} />}
          title={`${r.from} → ${r.to}`}
          subtitle={`${t('plan.line')} ${r.line}`}
          onPress={() => undefined}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
