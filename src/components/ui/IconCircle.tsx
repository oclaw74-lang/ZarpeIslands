import Icon from '@react-native-vector-icons/ionicons';
import { StyleSheet, View } from 'react-native';

import { Palette, Radius } from '@/constants/theme';

export type IconCircleProps = {
  /** Nombre de ícono de Ionicons, ej. "boat", "briefcase-outline". */
  name: React.ComponentProps<typeof Icon>['name'];
  size?: 'small' | 'medium' | 'large';
  color?: string;
  backgroundColor?: string;
};

const SIZES = {
  small: { box: 32, icon: 16 },
  medium: { box: 44, icon: 22 },
  large: { box: 56, icon: 28 },
} as const;

/** Círculo de fondo con ícono centrado — usado en filas de lista y headers. */
export function IconCircle({
  name,
  size = 'medium',
  color = Palette.primary,
  backgroundColor = Palette.surface,
}: IconCircleProps) {
  const { box, icon } = SIZES[size];

  return (
    <View style={[styles.circle, { width: box, height: box, borderRadius: box / 2, backgroundColor }]}>
      <Icon name={name} size={icon} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.pill,
  },
});
