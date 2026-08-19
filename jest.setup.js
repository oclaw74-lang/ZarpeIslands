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
