import { appSchema, tableSchema } from '@nozbe/watermelondb';

/**
 * Esquema local WatermelonDB — espejo de la tabla `punches` en Postgres
 * (ver agteamos/specs/punches.md). `id` lo maneja WatermelonDB internamente,
 * no se declara como columna acá.
 */
export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'punches',
      columns: [
        { name: 'company_id', type: 'string' },
        { name: 'company_member_id', type: 'string' },
        { name: 'boat_assignment_id', type: 'string', isOptional: true },
        { name: 'punch_type', type: 'string' },
        { name: 'device_timestamp', type: 'number' },
        { name: 'synced_at', type: 'number', isOptional: true },
        { name: 'latitude', type: 'number', isOptional: true },
        { name: 'longitude', type: 'number', isOptional: true },
        { name: 'created_offline', type: 'boolean' },
        { name: 'flagged_out_of_schedule', type: 'boolean' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
  ],
});
