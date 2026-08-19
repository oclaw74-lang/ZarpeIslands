-- Init schema: extensiones base requeridas por todo el modelo de datos.
-- Ver documents/05-Modelo-de-Base-de-Datos-ZarpeIslands.md — todas las tablas
-- usan `uuid` como PK generado por defecto.
--
-- Las tablas de negocio (companies, company_members, boats, etc.) NO se crean
-- acá — cada una se agrega en su propio ticket de epic (ver
-- agteamos/product/backlog-detail.md), con su propia migración numerada,
-- siguiendo esta misma convención: `supabase migration new <dominio>`.

create extension if not exists "pgcrypto" with schema extensions;
