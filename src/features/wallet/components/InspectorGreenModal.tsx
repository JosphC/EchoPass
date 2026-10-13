import { Modal, Pressable, Text, View, useWindowDimensions } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './actions/inspectorStyles';

interface InspectorGreenModalProps {
  visible: boolean;
  line?: string;
  busNumber?: string;
  station?: string;
  boardedAt?: string;
  passengers?: number;
  token?: string;
  onClose: () => void;
}

export function InspectorGreenModal({
  visible,
  line = '15',
  busNumber = '3114',
  station = 'Piața Mărăști',
  boardedAt = '18:24',
  passengers = 1,
  token,
  onClose,
}: InspectorGreenModalProps) {
  const { width } = useWindowDimensions();
  const staticQrToken = token ?? `STPT-ECHOPASS-${line}-${passengers}P-VALID`;
  const qrSize = Math.min(width - 96, 210);

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header with Close */}
        <View style={styles.header}>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>CONTROL ACTIV • ECRAN OFICIAL</Text>
          </View>
          <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={12}>
            <Ionicons name="close" size={26} color="#FFFFFF" />
          </Pressable>
        </View>

        {/* Big Status Banner */}
        <View style={styles.badgeContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="checkmark-circle" size={54} color="#059669" />
          </View>
          <Text style={styles.statusTitle}>BILET VALIDAT</Text>
          <Text style={styles.statusSubtitle}>STPT Timișoara • Valabilitate 60 minute</Text>
        </View>

        {/* QR Code Container */}
        <View style={styles.qrCard}>
          <View style={styles.qrWrapper}>
            <QRCode value={staticQrToken} size={qrSize} />
          </View>
          <Text style={styles.timerText}>Validat la {boardedAt} • Valabilitate 60 min</Text>
          <View style={styles.securityBar}>
            <View style={styles.securityIndicator} />
            <Text style={styles.securityText}>Cod QR static STPT • {passengers} {passengers === 1 ? 'persoană' : 'persoane'}</Text>
          </View>
        </View>

        {/* Transit details */}
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Linie / Călători:</Text>
            <Text style={styles.detailValue}>Linia {line} (#{busNumber}) • {passengers} {passengers === 1 ? 'persoană' : 'persoane'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Îmbarcare:</Text>
            <Text style={styles.detailValue}>{boardedAt} ({station})</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Stare bilet:</Text>
            <Text style={[styles.detailValue, { color: '#047857' }]}>Activ • Bilet oficial STPT</Text>
          </View>
        </View>

        {/* Close Button */}
        <Pressable onPress={onClose} style={styles.dismissButton}>
          <Text style={styles.dismissText}>Închide ecranul de control</Text>
        </Pressable>
      </View>
    </Modal>
  );
}
