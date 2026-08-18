import { synchronize } from '@nozbe/watermelondb/sync';

import { database } from '@/lib/watermelon/database';
import { supabase } from '@/lib/supabase/client';

/**
 * Sincroniza la base local (WatermelonDB) contra Supabase, vía las
 * funciones `pull_changes`/`push_changes` (ver A4b, agteamos/specs/punches.md).
 *
 * No lanza si `supabase` es `null` (falta config, ver A2) — simplemente
 * no hace nada, para no romper la app en ese estado.
 */
export async function synchronizeApp(): Promise<void> {
  const client = supabase;
  if (!client) {
    return;
  }

  await synchronize({
    database,
    pullChanges: async ({ lastPulledAt }) => {
      const { data, error } = await client.rpc('pull_changes', {
        last_pulled_at: lastPulledAt ? new Date(lastPulledAt).toISOString() : null,
      });

      if (error) {
        throw error;
      }

      return {
        changes: { punches: data.punches },
        timestamp: new Date(data.timestamp).getTime(),
      };
    },
    pushChanges: async ({ changes }) => {
      // `SyncDatabaseChangeSet` no expone un índice utilizable en TS pese a ser
      // estructuralmente { [tableName: string]: SyncTableChangeSet } — cast puntual.
      const punchesChanges = (changes as Record<string, unknown>)['punches'];
      const { error } = await client.rpc('push_changes', {
        changes: { punches: punchesChanges },
      });

      if (error) {
        throw error;
      }
    },
  });
}
