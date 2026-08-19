import Icon from '@react-native-vector-icons/ionicons';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconCircle } from '@/components/ui/IconCircle';
import { Palette, Spacing } from '@/constants/theme';

export type EmptyStateProps = {
  icon: React.ComponentProps<typeof Icon>['name'];
  title: string;
  testID?: string;
};

/** Estado vacío estandarizado — reemplaza el texto suelto centrado en las listas. */
export function EmptyState({ icon, title, testID }: EmptyStateProps) {
  return (
    <View testID={testID} style={styles.container}>
      <IconCircle name={icon} size="large" color={Palette.neutralMuted} />
      <ThemedText type="small" style={styles.title}>
        {title}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.five,
    alignItems: 'center',
    gap: Spacing.two,
  },
  title: {
    color: Palette.neutralMuted,
    textAlign: 'center',
  },
});
