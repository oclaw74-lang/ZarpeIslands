# Zarpe Islands

> Nombre provisional — pendiente de validar disponibilidad de marca (dominio, redes, tiendas de apps).

Aplicación de gestión operativa para negocios de turismo náutico en zonas de islas (excursiones, tours y renta de embarcaciones con tripulación asignada). Centraliza en un solo lugar lo que hoy se maneja de forma manual o dispersa:

- Programación de mantenimientos por barco
- Asignación y rotación automática/sugerida del personal entre barcos
- Control de asistencia (ponche de entrada/salida), incluso sin señal de internet
- Registro de propinas, individuales o repartidas entre tripulación
- Roles diferenciados por tipo de usuario (dueño, gerente, encargado, secretaría, personal de barco)

Interfaz en inglés como idioma base, con soporte multilenguaje (i18n) desde el día uno (mínimo inglés/español).

## Stack

| Capa | Tecnología |
|---|---|
| App móvil | React Native + Expo (Android → tablet → iOS) |
| Backend / DB | Supabase (Postgres, Auth, Storage, Edge Functions, Realtime) |
| Seguridad multi-tenant | Row Level Security (RLS) por `company_id` |
| Sincronización offline | PowerSync + SQLite local |
| Notificaciones | Expo Notifications / Firebase Cloud Messaging |
| Documentos/facturas | PDF generado vía Edge Function |

## Documentación

El detalle completo del producto vive en [`documents/`](./documents):

1. [Concepto y Marca](./documents/01-Concepto-y-Marca-ZarpeIslands.md) — propuesta de valor, público objetivo, tono e identidad visual.
2. [Arquitectura y Tecnologías](./documents/02-Arquitectura-y-Tecnologias-ZarpeIslands.md) — stack, offline-first, multi-tenant, entornos de despliegue.
3. [Flujo del Sistema y Vistas](./documents/03-Flujo-del-Sistema-y-Vistas-ZarpeIslands.md) — pantallas y flujos operativos por tipo de usuario.
4. [Roles y Permisos](./documents/04-Roles-y-Permisos-ZarpeIslands.md) — matriz de permisos por módulo y reglas de segregación de funciones.
5. [Modelo de Base de Datos](./documents/05-Modelo-de-Base-de-Datos-ZarpeIslands.md) — esquema Postgres, relaciones y políticas RLS.
6. [Algoritmo de Rotación](./documents/06-Algoritmo-de-Rotacion-ZarpeIslands.md) — reglas de negocio y prioridades para la sugerencia automática de turnos.

## Estado del proyecto

Fase de diseño y especificación — sin código de aplicación todavía. Próximos pasos: validación de nombre/marca, definición de políticas operativas adicionales, y arranque de la implementación (esquema de base de datos y app móvil).
