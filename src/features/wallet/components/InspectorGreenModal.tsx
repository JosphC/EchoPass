import { Modal, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { t } from '../../../core/i18n';
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
            <Text style={styles.liveText}>{t('inspector.liveBanner')}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('inspector.dismiss')}
            onPress={onClose}
            style={styles.closeBtn}
            hitSlop={12}
          >
            <Ionicons name="close" size={26} color="#FFFFFF" />
          </Pressable>
        </View>

        {/* Big Status Banner */}
        <View style={styles.badgeContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="checkmark-circle" size={54} color="#059669" />
          </View>
          <Text style={styles.statusTitle}>{t('inspector.valid')}</Text>
          <Text style={styles.statusSubtitle}>{t('inspector.subtitle')}</Text>
        </View>

        {/* QR Code Container */}
        <View style={styles.qrCard}>
          <View style={styles.qrWrapper}>
            <QRCode value={staticQrToken} size={qrSize} />
          </View>
          <Text style={styles.timerText}>
            {t('ride.validatedAt')} {boardedAt} • {t('inspector.validFor')}
          </Text>
          <View style={styles.securityBar}>
            <View style={styles.securityIndicator} />
            <Text style={styles.securityText}>
              {t('inspector.staticQr')} • {passengers} {passengers === 1 ? t('ride.person') : t('ride.people')}
            </Text>
          </View>
        </View>

        {/* Transit details */}
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('inspector.lineRiders')}</Text>
            <Text style={styles.detailValue}>
              {t('plan.line')} {line} (#{busNumber}) • {passengers} {passengers === 1 ? t('ride.person') : t('ride.people')}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('inspector.boarding')}</Text>
            <Text style={styles.detailValue}>{boardedAt} ({station})</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('inspector.status')}</Text>
            <Text style={[styles.detailValue, styles.detailValueOk]}>{t('inspector.statusValue')}</Text>
          </View>
        </View>

        {/* Close Button */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('inspector.dismiss')}
          onPress={onClose}
          style={styles.dismissButton}
        >
          <Text style={styles.dismissText}>{t('inspector.dismiss')}</Text>
        </Pressable>
      </View>
    </Modal>
  );
}
