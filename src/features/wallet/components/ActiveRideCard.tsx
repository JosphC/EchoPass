import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../../../core/theme';
import { styles } from './actions/activeRideStyles';
import { QrProgressButton } from './QrProgressButton';

interface ActiveRideCardProps {
  line?: string;
  destination?: string;
  station?: string;
  boardedAt?: string;
  expiresInMin?: number;
  totalMin?: number;
  fareRon?: number;
  passengers?: number;
  isTransfer?: boolean;
  originalLine?: string;
  expiresAtMs?: number;
  transferStation?: string;
  transferAt?: string;
  onOpenInspector: () => void;
}

function parseLineTitle(rawTitle: string): { boldPart: string; lightPart: string } {
  const match = rawTitle.match(/^([^(]+)(\(.*\))?$/);
  return match
    ? { boldPart: (match[1] ?? rawTitle).trim(), lightPart: match[2] ? ` ${match[2].trim()}` : '' }
    : { boldPart: rawTitle, lightPart: '' };
}

function formatTimeClean(raw: string): string {
  const pmMatch = raw.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!pmMatch) return raw;
  let h = parseInt(pmMatch[1] ?? '0', 10);
  const m = pmMatch[2] ?? '00';
  if (pmMatch[3]?.toUpperCase() === 'PM' && h < 12) h += 12;
  if (pmMatch[3]?.toUpperCase() === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${m}`;
}

export function ActiveRideCard({
  line = '15',
  destination = 'T. Grozăvescu (Poșta Mare)',
  station = 'Piața Mărăști',
  boardedAt = '18:24',
  expiresInMin = 42,
  totalMin = 60,
  fareRon = 3,
  passengers = 1,
  isTransfer = false,
  originalLine,
  expiresAtMs,
  transferStation,
  transferAt,
  onOpenInspector,
}: ActiveRideCardProps) {
  const { colors } = useTheme();
  const progressPercent = Math.min(100, Math.max(0, Math.round((expiresInMin / totalMin) * 100)));
  const { boldPart, lightPart } = parseLineTitle(destination);
  const formattedFare = fareRon.toFixed(2).replace('.', ',');
  const isUrgent = expiresInMin <= 5;
  const countdownColor = isUrgent ? '#DC2626' : (isTransfer ? '#2563EB' : '#15803D');
  const expiryDate = expiresAtMs ? new Date(expiresAtMs) : new Date(Date.now() + expiresInMin * 60000);
  const expiryH = String(expiryDate.getHours()).padStart(2, '0');
  const expiryM = String(expiryDate.getMinutes()).padStart(2, '0');
  const expiryTime = `${expiryH}:${expiryM}`;
  const displayBoardedAt = formatTimeClean(boardedAt);
  const displayTransferAt = transferAt ? formatTimeClean(transferAt) : displayBoardedAt;

  const fareSub = isTransfer
    ? `Din linia ${originalLine ?? '15'} · 0,00 lei`
    : `${passengers > 1 ? 'Bilet de grup' : 'Bilet urban STPT'} · ${formattedFare} lei`;

  return (
    <Pressable
      testID="active-ride-card"
      accessibilityRole="button"
      accessibilityLabel={`Călătorie activă linia ${line}, bilet valabil ${expiresInMin} minute. Apasă pentru cod QR.`}
      onPress={onOpenInspector}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.98 : 1 },
      ]}
    >
      <View style={styles.headerRow}>
        {isTransfer ? (
          <View style={styles.transferRow}>
            <Ionicons name="swap-horizontal" size={17} color="#2563EB" />
            <Text style={styles.transferText}>Transbordare gratuită</Text>
          </View>
        ) : (
          <View style={styles.activeStatusRow}>
            <View style={styles.activeDot} />
            <Text style={styles.activeStatusText}>Călătorie activă</Text>
          </View>
        )}
        <View style={styles.passengersRow}>
          <Ionicons name="people-outline" size={17} color={colors.textMuted} />
          <Text style={[styles.passengersText, { color: colors.textMuted }]}>{passengers} {passengers === 1 ? 'persoană' : 'persoane'}</Text>
        </View>
      </View>

      <View style={styles.transitRow}>
        <View style={styles.lineBadge}><Text style={styles.lineBadgeText}>{line}</Text></View>
        <View style={styles.transitTexts}>
          <Text numberOfLines={1} style={[styles.destinationText, { color: colors.text }]}>
            {boldPart}{lightPart}
          </Text>
          <Text style={[styles.fareText, { color: colors.textMuted }]}>{fareSub}</Text>
        </View>
      </View>

      <View style={styles.countdownRow}>
        <Text style={styles.countdownContainer}>
          <Text style={[styles.bigMinutes, { color: countdownColor }]}>{expiresInMin}</Text>
          <Text style={[styles.ramaseText, { color: colors.textMuted }]}> min rămase</Text>
        </Text>
        <Text style={[styles.expiraText, { color: colors.text }]}>Expiră la {expiryTime}</Text>
      </View>

      <View style={styles.validationRow}>
        <Ionicons name="checkmark-circle-outline" size={18} color="#16A34A" />
        <Text numberOfLines={1} style={[styles.validationText, { color: colors.text }]}>
          {isTransfer
            ? `Transbordat la ${displayTransferAt} · ${transferStation ?? station}`
            : `Validat la ${displayBoardedAt} · ${station}`}
        </Text>
      </View>

      <View style={styles.perforationContainer}>
        <View style={styles.notchWrapperLeft}>
          <View style={[styles.notchCircle, { left: -10, backgroundColor: colors.background, borderColor: colors.border }]} />
        </View>
        <View style={[styles.dashedLine, { borderTopColor: colors.border }]} />
        <View style={styles.notchWrapperRight}>
          <View style={[styles.notchCircle, { right: -10, backgroundColor: colors.background, borderColor: colors.border }]} />
        </View>
      </View>

      <QrProgressButton progressPercent={progressPercent} onPress={onOpenInspector} />

      <Text style={[styles.captionText, { color: colors.textMuted }]}>Pentru controlul STPT</Text>
    </Pressable>
  );
}
