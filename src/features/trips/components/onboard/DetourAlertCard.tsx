import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../../core/theme';
import type { TransitAlert } from '../../data/lineStations';

interface DetourAlertCardProps {
  alert: TransitAlert;
}

export function DetourAlertCard({ alert }: DetourAlertCardProps) {
  const { scheme } = useTheme();
  const isDark = scheme === 'dark';

  return (
    <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
      <View style={styles.header}>
        <Ionicons name="warning" size={15} color={isDark ? '#FBBF24' : '#D97706'} />
        <Text style={[styles.title, { color: isDark ? '#FBBF24' : '#92400E' }]}>{alert.title}</Text>
      </View>
      <Text numberOfLines={2} style={[styles.desc, { color: isDark ? '#D4D4D8' : '#78350F' }]}>
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
  cardDark: {
    backgroundColor: '#262214',
    borderColor: '#785A18',
  },
  cardLight: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
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
