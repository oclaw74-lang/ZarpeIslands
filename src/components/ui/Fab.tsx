import Icon from '@react-native-vector-icons/ionicons';
import { Pressable, StyleSheet, type PressableProps } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Accent, Radius } from '@/constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type FabProps = Omit<PressableProps, 'style'> & {
  icon?: React.ComponentProps<typeof Icon>['name'];
  testID?: string;
};

/** Botón flotante de acción principal (UI-2) — reemplaza el AppButton ancho arriba de las listas. */
export function Fab({ icon = 'add', testID, onPressIn, onPressOut, ...rest }: FabProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      testID={testID}
      style={[styles.fab, animatedStyle]}
      onPressIn={(e) => {
        // react-hooks/immutability no reconoce el patrón de mutación de
        // `.value` de Reanimated (SharedValue no es estado de React) — es
        // el uso documentado y correcto de la librería, no una violación real.
        // eslint-disable-next-line react-hooks/immutability
        scale.value = withTiming(0.92, { duration: 100 });
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        // eslint-disable-next-line react-hooks/immutability
        scale.value = withTiming(1, { duration: 120 });
        onPressOut?.(e);
      }}
      {...rest}
    >
      <Icon name={icon} size={26} color="#FFFFFF" />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: Radius.large,
    backgroundColor: Accent.coral,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Accent.coralDark,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
});
