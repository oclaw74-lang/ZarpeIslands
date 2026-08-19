# Delta: companies (B2)

## ADDED

- Función Postgres `bootstrap_company(p_name, p_full_name, p_country, p_default_currency, p_default_language, p_timezone) returns company_members` — `SECURITY DEFINER`. Crea `companies` + `company_members` (owner) en una transacción; rechaza si `auth.uid()` ya tiene membresía. `grant execute` a `authenticated`.

## Sin cambios en columnas existentes

`companies`/`company_members` (A4a) no se modificaron — B2 solo agrega la forma de crear la primera fila de cada una.
