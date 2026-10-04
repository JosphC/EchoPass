import { StyleSheet, Text, View } from 'react-native';
import { t } from '../../../core/i18n';
import { fontSizes, fontWeights, radius, spacing } from '../../../core/theme';
import { useTheme } from '../../../core/theme/useTheme';
import { Button } from '../../../ui';

interface ProfileHeaderProps {
  name: string;
  email: string;
  onEdit: () => void;
}

function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function ProfileHeader({ name, email, onEdit }: ProfileHeaderProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.root}>
      <View style={[styles.avatar, { backgroundColor: `${colors.primary}22` }]}>
        <Text style={[styles.initials, { color: colors.primary }]}>{initials(name)}</Text>
      </View>
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.text }]}>{name}</Text>
        <Text style={[styles.email, { color: colors.textMuted }]}>{email}</Text>
      </View>
      <Button title={t('profile.editProfile')} onPress={onEdit} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
  },
  info: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
  },
  email: {
    fontSize: fontSizes.sm,
  },
});
