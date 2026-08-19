import { Pressable, StyleSheet, type PressableProps } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Palette, Radius, Spacing } from '@/constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type AppButtonVariant = 'primary' | 'secondary' | 'ghost';

export type AppButtonProps = Omit<PressableProps, 'style'> & {
  label: string;
  variant?: AppButtonVariant;
  testID?: string;
};

/** Botón con feedback de presión animado (scale) — reemplaza los Pressable + estilos sueltos. */
export function AppButton({ label, variant = 'primary', testID, onPressIn, onPressOut, ...rest }: AppButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      testID={testID}
      style={[styles.base, VARIANT_STYLES[variant], animatedStyle]}
      onPressIn={(e) => {
        // react-hooks/immutability no reconoce el patrón de mutación de
        // `.value` de Reanimated (SharedValue no es estado de React) — es
        // el uso documentado y correcto de la librería, no una violación real.
        // eslint-disable-next-line react-hooks/immutability
        scale.value = withTiming(0.96, { duration: 100 });
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        // eslint-disable-next-line react-hooks/immutability
        scale.value = withTiming(1, { duration: 120 });
        onPressOut?.(e);
      }}
      {...rest}
    >
      <ThemedText type="smallBold" style={variant === 'primary' ? styles.primaryText : styles.secondaryText}>
        {label}
      </ThemedText>
    </AnimatedPressable>
  );
}

const VARIANT_STYLES = StyleSheet.create({
  primary: {
    backgroundColor: Palette.primary,
  },
  secondary: {
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.neutralLine,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
});

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.medium,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: Palette.primary,
  },
});
