-- B2: bootstrap de empresa. companies/company_members ya existen (A4a) con RLS
-- de solo-lectura de la fila propia; esta función agrega la única forma de
-- CREAR la primera empresa + membresía owner, sin necesitar políticas de
-- INSERT abiertas (esas llegan completas en B5).

create or replace function bootstrap_company(
  p_name text,
  p_full_name text,
  p_country text default null,
  p_default_currency text default 'USD',
  p_default_language text default 'en',
  p_timezone text default null
) returns company_members
language plpgsql
security definer
set search_path = public
as $$
declare
  v_company_id uuid;
  v_member company_members;
  v_email text;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  -- Evita que un usuario que ya pertenece a una empresa cree otra por
  -- accidente (doble tap, retry de red, etc.) — AC#2 (no duplicar membresía).
  if exists (select 1 from company_members where auth_user_id = auth.uid()) then
    raise exception 'user already belongs to a company';
  end if;

  v_email := coalesce(auth.jwt() ->> 'email', '');

  insert into companies (name, country, default_currency, default_language, timezone)
  values (p_name, p_country, p_default_currency, p_default_language, p_timezone)
  returning id into v_company_id;

  -- Si esto falla (ej. índice único violado por una condición de carrera),
  -- todo el bloque de la función se revierte — el insert de companies de
  -- arriba no queda huérfano (AC#1).
  insert into company_members (company_id, auth_user_id, full_name, email, access_role)
  values (v_company_id, auth.uid(), p_full_name, v_email, 'owner')
  returning * into v_member;

  return v_member;
end;
$$;

grant execute on function bootstrap_company(text, text, text, text, text, text) to authenticated;
