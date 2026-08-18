import en from '@/lib/i18n/locales/en/auth.json';
import es from '@/lib/i18n/locales/es/auth.json';

function collectKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return collectKeys(value as Record<string, unknown>, fullKey);
    }
    return [fullKey];
  });
}

function collectValues(obj: Record<string, unknown>): string[] {
  return Object.values(obj).flatMap((value) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return collectValues(value as Record<string, unknown>);
    }
    return [String(value)];
  });
}

describe('i18n auth namespace', () => {
  it('has exactly the same keys in en and es (happy path / regression guard)', () => {
    const enKeys = collectKeys(en).sort();
    const esKeys = collectKeys(es).sort();

    expect(esKeys).toEqual(enKeys);
  });

  it('does not have empty translation values in either language (edge case)', () => {
    const values = [...collectValues(en), ...collectValues(es)];

    expect(values.length).toBeGreaterThan(0);
    for (const value of values) {
      expect(value.trim().length).toBeGreaterThan(0);
    }
  });
});
