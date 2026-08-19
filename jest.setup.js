// Mock oficial de @react-native-async-storage/async-storage para Jest.
// https://react-native-async-storage.github.io/async-storage/docs/advanced/jest
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock oficial de @react-native-community/netinfo para Jest.
jest.mock('@react-native-community/netinfo', () => require('@react-native-community/netinfo/jest/netinfo-mock'));

// WatermelonDB no tiene mock oficial de Jest — su adapter SQLite es nativo (JSI)
// y no corre en el entorno de test de Node. Se mockea nuestro propio módulo
// `@/lib/watermelon/database` (no el adapter interno de WatermelonDB) con una
// colección en memoria — suficiente para que los componentes que la importan
// no crasheen al testear. La lógica de sync real se testea aparte mockeando
// `@nozbe/watermelondb/sync` (ver src/lib/watermelon/__tests__/sync.test.ts).
// Mock manual de react-native-reanimated (UI-1). El mock oficial
// (`react-native-reanimated/mock`) inicializa el módulo nativo real de
// react-native-worklets (arquitectura nueva de Reanimated 4), que no corre
// en el entorno de test de Node — de ahí el mock propio y mínimo, cubriendo
// solo las APIs que usan los componentes del sistema de diseño.
jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const RN = require('react-native');

  return {
    __esModule: true,
    default: {
      View: RN.View,
      createAnimatedComponent: (Component) =>
        React.forwardRef((props, ref) => React.createElement(Component, { ref, ...props })),
    },
    useSharedValue: (initial) => ({ value: initial }),
    useAnimatedStyle: (fn) => fn(),
    withTiming: (toValue) => toValue,
    FadeInDown: {
      delay: () => ({ duration: () => ({}) }),
      duration: () => ({}),
    },
  };
});

jest.mock('@/lib/watermelon/database', () => ({
  database: {
    collections: {
      get: () => ({
        query: () => ({ fetch: async () => [] }),
        create: async (fn) => fn({}),
      }),
    },
    write: async (fn) => fn(),
  },
}));
