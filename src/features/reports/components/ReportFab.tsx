import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { t } from '../../../core/i18n';
import { fontSizes, fontWeights, radius, spacing } from '../../../core/theme';
import { useTheme } from '../../../core/theme/useTheme';
import type { ReportKind } from '../../../services/api/schemas/report';
import { BottomSheet, ListItem } from '../../../ui';
import { useReportSubmit } from '../hooks/useReportSubmit';

const KINDS: { kind: ReportKind; icon: keyof typeof Ionicons.glyphMap }[] = [
  { kind: 'traffic', icon: 'car-outline' },
  { kind: 'accident', icon: 'warning-outline' },
  { kind: 'breakdown', icon: 'construct-outline' },
  { kind: 'works', icon: 'hammer-outline' },
  { kind: 'crowding', icon: 'people-outline' },
  { kind: 'detour', icon: 'git-branch-outline' },
];

function kindLabel(kind: ReportKind): string {
  if (kind === 'traffic') return t('live.causeTraffic');
  if (kind === 'accident') return t('live.causeAccident');
  if (kind === 'breakdown') return t('live.causeBreakdown');
  if (kind === 'works') return t('live.causeWorks');
  if (kind === 'crowding') return t('live.causeCrowding');
  return t('live.causeDetour');
}

interface ReportFabProps {
  line: string | null;
  bottomOffset?: number;
}

/** Waze-style floating report button with a 6-cause bottom sheet. */
export function ReportFab({ line, bottomOffset = 96 }: ReportFabProps) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const { submitReport, isSubmitting } = useReportSubmit();

  async function pick(kind: ReportKind): Promise<void> {
    if (!line) return;
    await submitReport({ kind, line });
    setSent(true);
  }

  function close(): void {
    setOpen(false);
    setSent(false);
  }

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('reports.title')}
        onPress={() => setOpen(true)}
        style={[styles.fab, { backgroundColor: colors.warning, bottom: bottomOffset }]}
      >
        <Ionicons name="warning-outline" size={26} color="#FFFFFF" />
      </Pressable>
      <BottomSheet visible={open} onClose={close}>
        <Text style={[styles.title, { color: colors.text }]}>{t('reports.title')}</Text>
        {line ? (
          <Text style={[styles.line, { color: colors.textMuted }]}>
            Linia {line}
          </Text>
        ) : (
          <Text style={[styles.line, { color: colors.warning }]}>{t('reports.pickBus')}</Text>
        )}
        {sent ? (
          <Text style={[styles.sent, { color: colors.success }]}>{t('reports.sent')}</Text>
        ) : (
          <View>
            {KINDS.map(({ kind, icon }) => (
              <ListItem
                key={kind}
                icon={<Ionicons name={icon} size={22} color={colors.primary} />}
                title={kindLabel(kind)}
                onPress={() => void pick(kind)}
              />
            ))}
          </View>
        )}
        {isSubmitting ? <Text style={{ color: colors.textMuted }}>…</Text> : null}
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  title: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
  },
  line: {
    fontSize: fontSizes.sm,
  },
  sent: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium,
  },
});
