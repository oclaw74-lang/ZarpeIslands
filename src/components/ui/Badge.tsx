import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Palette, Radius, Spacing } from '@/constants/theme';

export type BadgeTone = 'primary' | 'success' | 'warning' | 'danger' | 'neutral';

export type BadgeProps = {
  label: string;
  tone?: BadgeTone;
  testID?: string;
};

const TONE_COLORS: Record<BadgeTone, { bg: string; fg: string }> = {
  primary: { bg: '#E4EEF2', fg: Palette.primary },
  success: { bg: '#E3F1E9', fg: Palette.success },
  warning: { bg: '#FBF0DC', fg: '#8A6116' },
  danger: { bg: '#FBE4E6', fg: Palette.danger },
  neutral: { bg: Palette.surface, fg: Palette.neutralMuted },
};

/** Pastilla pequeña para flags/estados (ej. "Required every shift", "Active"). */
export function Badge({ label, tone = 'neutral', testID }: BadgeProps) {
  const { bg, fg } = TONE_COLORS[tone];

  return (
    <View testID={testID} style={[styles.badge, { backgroundColor: bg }]}>
      <ThemedText type="small" style={[styles.text, { color: fg }]}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
  },
  text: {
    fontSize: 12,
    lineHeight: 16,
  },
});
