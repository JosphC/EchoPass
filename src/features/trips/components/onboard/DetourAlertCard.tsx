import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../../core/theme';
import type { TransitAlert } from '../../data/lineStations';

interface DetourAlertCardProps {
  alert: TransitAlert;
}

export function DetourAlertCard({ alert }: DetourAlertCardProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.warningSoft, borderColor: colors.warningBorder }]}>
      <View style={styles.header}>
        <Ionicons name="warning" size={15} color={colors.warning} />
        <Text style={[styles.title, { color: colors.warningText }]}>{alert.title}</Text>
      </View>
      <Text numberOfLines={2} style={[styles.desc, { color: colors.warningText }]}>
        {alert.description}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 8,
    marginBottom: 6,
    gap: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
  },
  desc: {
    fontSize: 11.5,
    lineHeight: 16,
  },
});
