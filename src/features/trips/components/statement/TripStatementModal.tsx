import { useState } from 'react';
import { Alert, FlatList, Modal, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../../core/theme';
import type { RecentTrip } from '../../../../services/api/schemas/trip';
import { LineBadge } from '../../../../ui';
import { styles } from './statementStyles';

interface TripStatementModalProps {
  visible: boolean;
  monthName: string;
  trips: RecentTrip[];
  onClose: () => void;
}

export function TripStatementModal({ visible, monthName, trips, onClose }: TripStatementModalProps) {
  const { colors } = useTheme();
  const [downloaded, setDownloaded] = useState(false);

  const totalSpent = trips.reduce((sum, t) => sum + t.fareRon, 0);

  const handleDownload = () => {
    setDownloaded(true);
    Alert.alert(
      'Extras Generat',
      `Extrasul pentru ${monthName} (${trips.length} călătorii, ${totalSpent.toFixed(2)} Lei) a fost pregătit pentru decontare.`,
      [{ text: 'OK' }],
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Extras Călătorii STPT</Text>
          <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={10}>
            <Ionicons name="close" size={24} color={colors.text} />
          </Pressable>
        </View>

        {/* Monthly Summary */}
        <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.monthTitle, { color: colors.text }]}>{monthName}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statCol}>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Călătorii decontabile</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>{trips.length}</Text>
            </View>
            <View style={styles.statCol}>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Total sumă</Text>
              <Text style={[styles.statValue, { color: '#10B981' }]}>{totalSpent.toFixed(2).replace('.', ',')} Lei</Text>
            </View>
            <View style={styles.statCol}>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Operator</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>STPT</Text>
            </View>
          </View>
        </View>

        {/* Trips List */}
        <View style={styles.listContainer}>
          <Text style={[styles.listTitle, { color: colors.textMuted }]}>TICHETE ȘI VALIDĂRI AUTOMATE</Text>
          <FlatList
            data={trips}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={[styles.itemRow, { borderBottomColor: colors.border }]}>
                <View style={{ marginRight: 10 }}>
                  <LineBadge shortName={item.line ?? 'STPT'} size="sm" />
                </View>
                <View style={styles.itemMain}>
                  <Text numberOfLines={1} style={[styles.itemTitle, { color: colors.text }]}>
                    {item.from} → {item.to}
                  </Text>
                  <Text style={[styles.itemMeta, { color: colors.textMuted }]}>
                    {item.date} {item.time ?? ''} · Seria STPT-{item.id.toUpperCase()}
                  </Text>
                </View>
                <Text style={[styles.itemPrice, { color: colors.text }]}>
                  {item.fareRon.toFixed(2).replace('.', ',')} lei
                </Text>
              </View>
            )}
          />
        </View>

        {/* Action Button */}
        <View style={styles.actions}>
          <Pressable onPress={handleDownload} style={styles.downloadBtn}>
            <Ionicons name={downloaded ? 'checkmark-circle' : 'document-text-outline'} size={20} color="#FFFFFF" />
            <Text style={styles.downloadText}>
              {downloaded ? 'Extras Descărcat (PDF)' : 'Descarcă Extras PDF (Decont)'}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
