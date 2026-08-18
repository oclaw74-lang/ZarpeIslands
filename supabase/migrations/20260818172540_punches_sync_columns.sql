-- A4b: columnas requeridas por el protocolo de sync de WatermelonDB
-- (created/updated/deleted por timestamp) sobre punches (A4a).

alter table punches
  add column updated_at timestamptz not null default now(),
  add column deleted_at timestamptz;

create function set_updated_at() returns trigger
  language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger punches_set_updated_at
  before update on punches
  for each row
  execute function set_updated_at();
