# Convención de carpetas — `src/`

Patrón: **Expo Router + Bulletproof React adaptado**. Ver `agteamos/changes/2-init-expo-typescript/specs/design.md` para las fuentes de la investigación.

```
src/
├── app/            # Rutas de Expo Router — capa de ruteo DELGADA, sin lógica de negocio
├── features/       # Módulos de negocio por dominio (auth, boats, punch, tips, ...)
│   └── <dominio>/
│       ├── screens/    # Pantallas de ese dominio (importadas desde src/app/)
│       ├── components/ # Componentes propios del dominio (no reutilizados fuera de él)
│       ├── hooks/       # Hooks propios del dominio
│       └── api/         # Llamadas a Supabase/PowerSync específicas del dominio
├── components/     # Componentes UI reutilizables entre features (Button, Card, Badge, ...)
├── hooks/          # Custom hooks globales (no atados a un dominio)
├── lib/            # Clientes de servicios: Supabase (A2), PowerSync (A4), i18n (A3)
├── store/          # Estado global (librería a definir cuando la primera feature lo requiera)
├── types/          # Tipos TypeScript globales/compartidos
├── constants/      # Theme/tokens (ver agteamos/design/DESIGN_SYSTEM.md), config
└── utils/          # Funciones helper puras, sin dependencias de React/Expo
```

## Reglas de dependencia

1. **`app/` nunca contiene lógica de negocio.** Cada archivo de ruta solo importa y re-exporta (o compone mínimamente) una screen de `features/<dominio>/screens/`.
2. **Una `feature` no importa directamente de otra `feature`.** Si dos dominios necesitan compartir algo, ese algo sube a `components/`, `hooks/`, `lib/`, `types/` o `utils/` (nivel compartido).
3. **Ningún string de UI se hardcodea** — usa las claves de traducción de i18n (ver A3) desde el primer componente que agregues.
4. **Todo componente de UI nuevo respeta `agteamos/design/DESIGN_SYSTEM.md`** (paleta, tipografía, accesibilidad de línea base).

## Cómo agregar una feature nueva

```
src/features/<dominio>/
├── screens/
├── components/     (opcional, solo si el dominio tiene componentes propios)
├── hooks/          (opcional)
└── api/            (opcional, cuando exista integración con Supabase/PowerSync)
```

Y en `src/app/`, agregar la ruta correspondiente que importe la screen desde esa feature.
