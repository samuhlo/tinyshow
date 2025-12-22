# 🏗️ TinyShow - Architecture & Standards

Este documento define la estructura técnica, patrones y convenciones para "TinyShow", un escaparate de proyectos "Brutalist & AI-Powered".

---

## 📋 Índice
1. [Stack Tecnológico](#stack-tecnológico)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [Arquitectura de Carpetas](#arquitectura-de-carpetas)
4. [Patrones de Diseño](#patrones-de-diseño)
5. [Data Flow & AI](#data-flow--ai)
6. [Server Architecture](#server-architecture)

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Propósito |
|------------|---------|-----------|
| **Core** | Nuxt 4 (Latest) | Framework Full-stack |
| **UI Engine** | Vue 3.5+ | Composition API |
| **Styling** | Tailwind CSS v4 | Utility-first, Configuración Brutalista (Vite) |
| **Motion** | GSAP + VueUse | Animaciones complejas & Interacciones de Mouse |
| **Database** | PostgreSQL (Neon) | Serverless DB |
| **ORM** | Prisma | Gestión de esquemas y queries |
| **AI Logic** | DeepSeek V3 | Ingesta y análisis de READMEs |
| **Validation** | Zod | Validación estricta de I/O |

---

## 📁 Estructura del Proyecto

Adoptamos una estructura **Domain-Driven** dentro de las carpetas estándar de Nuxt.

```
tinyshow/
├── app/                      # 🟢 NUXY 4 SRCDIR
│   ├── assets/
│   │   ├── css/
│   │   │   └── main.css      # Tailwind v4 directives + Fuentes Custom
│   │   └── fonts/            # Archivo Black & Space Mono
│   ├── components/           # 🟢 ORGANIZADO POR DOMINIO (Ver abajo)
│   ├── composables/          # Lógica reutilizable (useLang, useProject)
│   ├── layouts/              # default.vue (App Shell)
│   ├── pages/                # Rutas basadas en archivos
│   ├── plugins/              # Plugins (Lenis, etc)
│   ├── utils/                # Utilidades cliente
│   ├── app.vue               # Root Component
│   └── error.vue             # Error handling
├── server/                   # 🟠 BACKEND (Nitro)
│   ├── api/                  # Endpoints (Webhook)
│   ├── utils/                # Lógica compartida Server-side (AI, DB)
│   └── database/             # Schemas extra si necesario
├── prisma/
│   ├── schema.prisma         # La verdad de la Base de Datos
│   └── prisma.config.ts      # Configuración Prisma
├── scripts/                  # Scripts de mantenimiento (Seed)
├── i18n/                     # Archivos de traducción (locales)
├── nuxt.config.ts            # Configuración global
└── package.json              # Dependencias
```

---

## 🗂️ Arquitectura de Carpetas (Detalle)

### Componentes (`components/`)
Evitamos la carpeta plana. Todo componente pertenece a un dominio o es una UI primitiva.

```
components/
├── ui/                       # ⚛️ ATOMS (Sin lógica de negocio)
│   ├── AppLogo.vue
│   ├── TechPill.vue
│   ├── ActionBtn.vue
│   ├── LangSwitcher.vue
│   └── Icon.vue
├── project/                  # 🧬 MOLECULES/ORGANISMS (Dominio Proyectos)
│   ├── ProjectRow.vue        # Item de lista
│   ├── ProjectHoverCard.vue  # Tarjeta flotante (GSAP)
│   └── ProjectDetail.vue     # Drawer/Modal con contenido
├── home/                     # 🏠 VISTAS ESPECÍFICAS
│   ├── TechMenu.vue          # Navegación camaleónica (Hero/Sidebar)
│   └── HeroSection.vue
└── layout/                   # 🧱 ESTRUCTURA
    ├── TheHeader.vue
    └── TheFooter.vue
```

### Server Utils (`server/utils/`)
El backend debe ser modular. No escribir lógica en los handlers de API.

* `server/utils/prisma.ts` → Singleton de DB.
* `server/utils/ai.ts` → Cliente DeepSeek y lógica de prompts.
* `server/utils/ingest.ts` → Orquestador (Recibe README → Valida Zod → Guarda DB).
* `server/utils/cache.ts` → Utilidades de cache (si aplica).

---

## 📐 Patrones de Diseño

### 1. "Antigravity" State
Usamos `useState` de Nuxt para estado global ligero.
* `useViewMode()`: Controla si estamos en 'hero' o 'sidebar'.
* `useLang()`: Wrapper sobre i18n.

### 2. Componentes Inteligentes vs Tontos
* **UI Components (`/ui`)**: Reciben Props, emiten Eventos. No hablan con la DB ni stores.
* **Domain Components (`/project`)**: Pueden acceder a datos, pero prefieren recibir props de sus padres (Pages).

### 3. Motion System (GSAP)
No usamos transiciones CSS para animaciones complejas.
* Usar `useGSAP` o `onMounted` para timelines.
* Transiciones de estado (Hero -> Sidebar) usan patrón FLIP.

### 4. Naming Conventions
* Componentes: `PascalCase` (ej: `TechMenu.vue`).
* Composables: `camelCase` (ej: `useProjectData.ts`).
* Server Handlers: `kebab-case.method.ts` (ej: `webhook.post.ts`).

---

## 💾 Data Flow & AI

1.  **Trigger:** GitHub Webhook (Push) OR Manual Seed.
2.  **Filter:** ¿Se tocó el README? (Smart Filtering).
3.  **Process:**
    * Fetch README raw.
    * **AI Analysis (DeepSeek):** Extrae stack, resumen i18n, URLs.
    * **Normalization (Zod):** Asegura estructura estricta.
4.  **Storage:** `UPSERT` en Neon (Postgres) vía Prisma.
5.  **Frontend:** Hidratación reactiva desde DB.

---
