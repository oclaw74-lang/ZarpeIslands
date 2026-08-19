import { StyleSheet, View, type ViewProps } from 'react-native';

import { Palette, Radius, Shadow, Spacing } from '@/constants/theme';

export type CardProps = ViewProps & {
  /** Sin sombra ni elevación — para usar dentro de otra Card o superficie ya elevada. */
  flat?: boolean;
};

/** Contenedor base del sistema de diseño (UI-1): fondo claro, esquinas redondeadas, sombra suave. */
export function Card({ style, flat = false, ...rest }: CardProps) {
  return <View style={[styles.card, !flat && Shadow.soft, style]} {...rest} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Palette.surfaceElevated,
    borderRadius: Radius.large,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: Palette.neutralLine,
  },
});
