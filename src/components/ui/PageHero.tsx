import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Accent, Radius, Spacing } from '@/constants/theme';

export type PageHeroProps = {
  title: string;
  subtitle?: string;
  /** Fila de stats/acciones bajo el título (ver StatChip) — opcional. */
  children?: ReactNode;
  /** Contenido a la derecha del título (ej. toggle "Mostrar inactivos"). */
  headerRight?: ReactNode;
};

/**
 * Header con degradé de marca (UI-2) — reemplaza el título plano suelto de
 * UI-1. Usado en Home/Boats/Job positions para dar la sensación de "app
 * real" en vez de lista sobre fondo blanco (feedback del usuario tras UI-1).
 */
export function PageHero({ title, subtitle, children, headerRight }: PageHeroProps) {
  return (
    <LinearGradient
      colors={[Accent.heroFrom, Accent.heroVia, Accent.heroTo]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.hero}
    >
      <View style={styles.titleRow}>
        <ThemedText type="heroTitle" style={styles.title}>
          {title}
        </ThemedText>
        {headerRight}
      </View>
      {subtitle && (
        <ThemedText type="small" style={styles.subtitle}>
          {subtitle}
        </ThemedText>
      )}
      {children && <View style={styles.statRow}>{children}</View>}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.four,
    borderBottomLeftRadius: Radius.large,
    borderBottomRightRadius: Radius.large,
    gap: Spacing.half,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  title: {
    color: '#FFFFFF',
    flexShrink: 1,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.72)',
  },
  statRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
});
