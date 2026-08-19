import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius } from '@/constants/theme';

export type PhotoStripProps = {
  title: string;
  gradient: readonly [string, string];
};

/**
 * Franja superior de color/degradé con el nombre superpuesto — sustituye al
 * ícono chico en círculo para dar sensación de "foto de barco" sin tener
 * fotos reales todavía (UI-2). El degradé se elige por índice en la lista
 * (`BoatPhotoGradients`), no por dato real del barco.
 */
export function PhotoStrip({ title, gradient }: PhotoStripProps) {
  return (
    <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.strip}>
      <ThemedText type="sectionTitle" style={styles.title}>
        {title}
      </ThemedText>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  strip: {
    height: 72,
    borderTopLeftRadius: Radius.large,
    borderTopRightRadius: Radius.large,
    justifyContent: 'flex-end',
    paddingHorizontal: 14,
    paddingBottom: 10,
  },
  title: {
    color: '#FFFFFF',
  },
});
