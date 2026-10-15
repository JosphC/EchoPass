import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import { SINGLE_FARE_RON } from '../../../core/config';
import { t } from '../../../core/i18n';
import { useTheme } from '../../../core/theme';
import { findRoute } from '../../../services/repositories/gtfs/timetable';
import { LineBadge } from '../../../ui';
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
  fareRon = SINGLE_FARE_RON,
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
  const countdownColor = isUrgent ? colors.danger : isTransfer ? colors.primary : colors.text;
  const route = findRoute(line);
  const expiryDate = expiresAtMs ? new Date(expiresAtMs) : new Date(Date.now() + expiresInMin * 60000);
  const expiryH = String(expiryDate.getHours()).padStart(2, '0');
  const expiryM = String(expiryDate.getMinutes()).padStart(2, '0');
  const expiryTime = `${expiryH}:${expiryM}`;
  const displayBoardedAt = formatTimeClean(boardedAt);
  const displayTransferAt = transferAt ? formatTimeClean(transferAt) : displayBoardedAt;

  const fareSub = isTransfer
    ? `${t('ride.fromLine')} ${originalLine ?? '15'} · 0,00 lei`
    : `${passengers > 1 ? t('ride.groupTicket') : t('ride.urbanTicket')} · ${formattedFare} lei`;

  return (
    <Pressable
      testID="active-ride-card"
      accessibilityRole="button"
      accessibilityLabel={`${t('ride.active')}, ${line}, ${expiresInMin} ${t('ride.minLeft')}. ${t('ride.tapForQr')}`}
      onPress={onOpenInspector}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.98 : 1 },
      ]}
    >
      <View style={styles.headerRow}>
        <View style={[styles.chip, { backgroundColor: isTransfer ? colors.primarySoft : colors.fill }]}>
          {isTransfer ? (
            <Ionicons name="swap-horizontal" size={14} color={colors.primary} />
          ) : (
            <View style={[styles.activeDot, { backgroundColor: colors.success }]} />
          )}
          <Text style={[styles.chipText, { color: isTransfer ? colors.primary : colors.textMuted }]}>
            {isTransfer ? t('ride.freeTransfer') : t('ride.active')}
          </Text>
        </View>
        <View style={styles.passengersRow}>
          <Ionicons name="people-outline" size={16} color={colors.textMuted} />
          <Text style={[styles.passengersText, { color: colors.textMuted }]}>{passengers} {passengers === 1 ? t('ride.person') : t('ride.people')}</Text>
        </View>
      </View>

      <View style={styles.transitRow}>
        <LineBadge shortName={line} color={route?.color ?? undefined} textColor={route?.textColor ?? undefined} size="md" />
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
          <Text style={[styles.ramaseText, { color: colors.textMuted }]}> {t('ride.minLeft')}</Text>
        </Text>
        <Text style={[styles.expiraText, { color: colors.textMuted }]}>
          {t('ride.expiresAt')} <Text style={{ color: colors.text }}>{expiryTime}</Text>
        </Text>
      </View>

      <View style={styles.validationRow}>
        <Ionicons name="checkmark-circle-outline" size={18} color={colors.textMuted} />
        <Text numberOfLines={1} style={[styles.validationText, { color: colors.textMuted }]}>
          {isTransfer
            ? `${t('ride.transferredAt')} ${displayTransferAt} · ${transferStation ?? station}`
            : `${t('ride.validatedAt')} ${displayBoardedAt} · ${station}`}
        </Text>
      </View>

      <View style={styles.perforationContainer}>
        <View style={styles.notchWrapperLeft}>
          <View style={[styles.notchCircle, { left: -11, backgroundColor: colors.background, borderColor: colors.border }]} />
        </View>
        <View style={[styles.dashedLine, { borderTopColor: colors.border }]} />
        <View style={styles.notchWrapperRight}>
          <View style={[styles.notchCircle, { right: -11, backgroundColor: colors.background, borderColor: colors.border }]} />
        </View>
      </View>

      <QrProgressButton progressPercent={progressPercent} onPress={onOpenInspector} />

      <Text style={[styles.captionText, { color: colors.textMuted }]}>{t('ride.forInspection')}</Text>
    </Pressable>
  );
}
