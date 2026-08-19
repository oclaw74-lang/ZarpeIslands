import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';

export type StatChipProps = {
  value: number | string;
  label: string;
  testID?: string;
};

/** Chip de stat (número + etiqueta) para la fila de stats de PageHero. */
export function StatChip({ value, label, testID }: StatChipProps) {
  return (
    <View testID={testID} style={styles.chip}>
      <ThemedText type="statNumber" style={styles.value}>
        {value}
      </ThemedText>
      <ThemedText type="small" style={styles.label}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: Radius.medium,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
  },
  value: {
    color: '#FFFFFF',
  },
  label: {
    color: 'rgba(255,255,255,0.68)',
    fontSize: 11,
    lineHeight: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
});
