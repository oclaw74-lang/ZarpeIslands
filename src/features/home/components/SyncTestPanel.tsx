/* eslint-disable react-hooks/set-state-in-effect --
   Carga inicial de datos locales/sesión al montar (patrón estándar de fetch-on-mount),
   no un efecto sincronizando estado derivado de props. Ver src/hooks/use-color-scheme.web.ts
   para el mismo caso ya documentado en A1. */
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { database } from '@/lib/watermelon/database';
import Punch from '@/lib/watermelon/models/Punch';
import { synchronizeApp } from '@/lib/watermelon/sync';
import { supabase } from '@/lib/supabase/client';

/**
 * Panel de prueba temporal para A4c — demuestra escritura local
 * offline-first (AC #1) y dispara sync manual (AC #2/#3). Placeholder
 * hasta que Epic D2 tenga la UI real de ponche.
 *
 * Nota: sincronizar requiere una sesión de Supabase real (login, Epic B1).
 * Sin sesión, este panel solo ejercita la escritura/lectura local.
 */
export default function SyncTestPanel() {
  const [punchCount, setPunchCount] = useState<number | null>(null);
  const [status, setStatus] = useState('');
  const [hasSession, setHasSession] = useState(false);

  const refreshCount = async () => {
    const collection = database.collections.get<Punch>('punches');
    const all = await collection.query().fetch();
    setPunchCount(all.length);
  };

  useEffect(() => {
    refreshCount();
    supabase?.auth.getSession().then(({ data }) => setHasSession(data.session !== null));
  }, []);

  const createLocalPunch = async () => {
    await database.write(async () => {
      const collection = database.collections.get<Punch>('punches');
      await collection.create((punch: any) => {
        punch.companyId = 'local-test-company';
        punch.companyMemberId = 'local-test-member';
        punch.punchType = 'in';
        punch.deviceTimestamp = new Date();
        punch.createdOffline = true;
        punch.flaggedOutOfSchedule = false;
      });
    });
    setStatus('Punch creado localmente.');
    await refreshCount();
  };

  const runSync = async () => {
    if (!hasSession) {
      setStatus('Sin sesión de Supabase — sync requiere login (Epic B1). Solo lectura/escritura local disponible.');
      return;
    }
    try {
      await synchronizeApp();
      setStatus('Sync completado.');
      await refreshCount();
    } catch (error) {
      setStatus(`Error de sync: ${(error as Error).message}`);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="smallBold">Sync test panel (A4c)</ThemedText>
      <ThemedText type="small">Punches locales: {punchCount ?? '...'}</ThemedText>
      <Pressable onPress={createLocalPunch}>
        <ThemedText type="link">Crear punch local</ThemedText>
      </Pressable>
      <Pressable onPress={runSync}>
        <ThemedText type="link">Sincronizar ahora</ThemedText>
      </Pressable>
      {status ? <ThemedText type="small">{status}</ThemedText> : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.half,
    marginTop: Spacing.four,
  },
});
