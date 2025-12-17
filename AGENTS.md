# TinyShow // The Brutalist Automaton

TinyShow es un Live Showcase técnico. Rechaza el concepto de portfolio estático tradicional en favor de un sistema reactivo dual que automatiza la documentación de ingeniería mediante escuchas activas de repositorios e inteligencia artificial.

## 1. Core Philosophy & Vibe

- **Codename:** The Brutalist Automaton.
- **Identity:** Escaparate autónomo. No es un CMS, es un "Active Listener".
- **Aesthetics:** Brutalismo Estructural + Minimalismo Suizo ("Less but Heavier").
- **Visual Language:** Alto contraste, tipografía pesada (Archivo Black), datos técnicos monoespaciados (Space Mono) y animaciones secas (GSAP).
- **Color Palette (Legacy/Refined):**
    - Off-White (`#F8F8F8`)
    - Deep Black (`#141414`)
    - Industrial Peach (`#F95C4B`)

## 2. Technical Architecture (The Stack)

Un enfoque moderno, Type-Safe y orientado a la excelencia en movimiento (Motion-First).

| Capa | Tecnología | Descripción |
| :--- | :--- | :--- |
| **Frontend** | Nuxt 3 | Vue.js Composition API. |
| **Estilos** | Tailwind CSS | Sistema de diseño atómico y utilitario. |
| **Motion** | GSAP + Lenis | Coreografías complejas y scroll suave obligatorio. |
| **Backend** | Nitro Engine | Server Routes para API y Webhooks. |
| **AI Brain** | DeepSeek (V3) | Procesamiento de READMEs (Bilingüe EN/ES) y extracción de valor técnico. |
| **Data** | PostgreSQL | Neon Serverless DB gestionada con **Prisma ORM**. |
| **Package** | pnpm | Gestión de dependencias rápida y eficiente. |

## 3. The Pipeline (Core Mechanics)

El sistema invierte el flujo de trabajo habitual.

### Input (Dual):
- **Live:** Webhook de GitHub recibe un evento push que actualice un README.md
- **Batch:** Script de "Seeding" (`npm run seed`) escanea repositorios existentes.

### Processing (The Brain):
1. El sistema descarga el README.md raw.
2. **DeepSeek Agent** analiza el contenido, extrae el stack y resume el valor técnico.
3. Se valida la salida contra esquemas **Zod**.

### Output (The UI):
- El frontend se hidrata automáticamente con el JSON estructurado.
- **"The Drill-Down":** Navegación sin recargas usando animaciones FLIP.

## 4. Folder Structure

Estructura modular optimizada para separar la lógica de negocio (showcase) de la presentación puramente visual (motion/ui).

```
tinyshow/
├── app/                              # srcDir: Tu código fuente Vue
│   ├── assets/
│   │   └── css/
│   │       └──main.css            # Tailwind @tailwind base + Fuentes Custom
│   ├── components/
│   │   ├── ui/                       # Elementos básicos (Botones brutales, inputs)
│   │   ├── motion/                   # Visuales puros (Identity Spinner, Matrix Text)
│   │   └── showcase/                 # Lógica de negocio (ProjectCard, ProjectList)
│   ├── composables/                  # State & Logic (useShowcaseStore, useAnimation)
│   ├── layouts/                      # Estructura base
│   ├── pages/                        # Rutas de la aplicación
│   ├── plugins/
│   │   └── smooth-scroll.client.ts   # CRÍTICO: Inicialización de Lenis/GSAP
│   ├── utils/                        # Funciones puras (formatters, math)
│   └── app.vue                       # Entry Point
├── public/                           # Assets estáticos (favicon, robots.txt)
├── server/                           # The Backend (Nitro)
│   ├── api/
│   │   └── showcase/                 # Endpoints frontend (GET projects)
│   ├── webhooks/
│   │   └── github.post.ts            # Recibe el push event
│   └── utils/
│       ├── deepseek.ts               # Cliente AI (DeepSeek V3)
│       └── prisma.ts                 # Cliente Prisma
├── seed/                             # Scripts de Base de Datos
│   ├── seed-database.ts              # Carga masiva (Clean & Seed)
│   └── seed-single-database.ts       # Carga unitaria
├── shared/
│   ├── types.ts                      # Interfaces y Zod Schemas
│   └── utils/
│       └── scripts/
│           └── test-ai.ts            # Script de prueba AI
├── prisma/
│   ├── schema.prisma                 # Definición de modelo
│   └── migrations/                   # Historial de cambios
├── nuxt.config.ts                    # Configuración Nuxt
├── tailwind.config.ts                # Configuración Tailwind
├── tsconfig.json                     # Configuración TypeScript
└── package.json                      # Dependencias
```

## 5. Setup & Installation

Este proyecto utiliza `pnpm` estrictamente.

### 5.1. Inicialización

```bash
# Clonar repositorio
git clone <repo-url>
cd tinyshow-v2

# Instalar dependencias
pnpm install

# Generar cliente Prisma
npx prisma generate
```

### 5.2. Configuración (.env)

```ini
# AI Provider (DeepSeek)
NUXT_DEEPSEEK_API_KEY="sk-..."

# Security
NUXT_GITHUB_WEBHOOK_SECRET="tu_secreto_brutal"

# Database (Neon/Prisma)
NEON_DATABASE_URL="postgresql://..."

# Github Seed
GITHUB_SEED_TOKEN="ghp_..."
GITHUB_USERNAME="samuhlo-training"

### 5.3. Desarrollo

```bash
# Iniciar servidor de desarrollo
pnpm run dev
```

### 5.4. Data Seeding (Retroactive)

Para poblar la base de datos sin esperar eventos push:

```bash
# Carga masiva (Borra todo y recarga)
pnpm run seed

# Carga individual (Upsert de un solo repo)
npx tsx seed/seed-single-database.ts <repo-url>
```

### 5.5. AI Testing

Para verificar la extracción sin guardar en BD:

```bash
npx tsx shared/utils/scripts/test-ai.ts <repo-url>
```