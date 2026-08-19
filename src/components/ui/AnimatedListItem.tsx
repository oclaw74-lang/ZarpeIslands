import Animated, { FadeInDown } from 'react-native-reanimated';
import type { ViewProps } from 'react-native';

export type AnimatedListItemProps = ViewProps & {
  /** Índice del ítem en la lista — escalona la entrada para un efecto de cascada. */
  index: number;
};

/** Envoltorio de entrada animada para filas de lista (reanimated, sin dependencia nueva). */
export function AnimatedListItem({ index, style, ...rest }: AnimatedListItemProps) {
  return (
    <Animated.View
      entering={FadeInDown.delay(Math.min(index, 8) * 40).duration(260)}
      style={style}
      {...rest}
    />
  );
}
