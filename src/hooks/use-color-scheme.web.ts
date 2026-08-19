/* eslint-disable react-hooks/set-state-in-effect --
   Patrón estándar de hidratación web (marcar montado en cliente) del template
   oficial de Expo — el linter de react-hooks todavía no reconoce esta excepción
   conocida vía disable-next-line. Ver https://react.dev/learn/you-might-not-need-an-effect */
import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const colorScheme = useRNColorScheme();

  if (hasHydrated) {
    return colorScheme;
  }

  return 'light';
}
