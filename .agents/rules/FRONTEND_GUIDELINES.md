# 🎨 TinyShow v2 - Frontend Guidelines
**Role:** Creative Developer / Design Engineer
**Framework:** Nuxt 3 (Vue 3 + TypeScript)
**Styling:** Tailwind CSS (Utility-first)

## 1. Visual Language (The Brutalist Vibe)
Our design philosophy is "Structural & Raw". We expose the grid, use high contrast, and treat typography as the main graphical element.

### Typography
Fonts from Google Fonts
* **Headings (Display):** `Archivo Black` (Variable width/weight). Used for the "VUE.JS", "NUXT" big titles.
* **Secondary (Sans):** `Archivo`. Used for project titles, taglines, and UI elements requiring better readability than mono.
* **Body/Data (Mono):** `Space Mono`. Used for everything else: list items, descriptions, logs.
* **Scale:**
    * `text-display-xl`: Massive titles (Landing).
    * `text-mono-sm`: Metadata, tech pills.
    * `text-mono-xs`: "Origin" credits and technical footers.

### Color Palette (Strict)
* `bg-dark` (#141414): Main background for drawers/modals.
* `bg-light` (#F8F8F8): Main background for the app.
* `text-primary`: Inverse of background.
* `text-accent` (#F95C4B): **Industrial Peach**. Used ONLY for:
    * Hover states (lines, arrows).
    * Interactive elements (close buttons).
    * Selected states (active sidebar item).

## 2. Component Architecture (Atomic Design)
We build from the bottom up. Do not create monolithic components.

The application lives within a strict grid system defined in `layouts/default.vue`.

### The Header (`<header>`)
* **Position:** Fixed top, full width, z-index 50.
* **Layout:** Flexbox `justify-between`.
    * **Left:** `AppLogo` (Animated).
    * **Right:** `LangSwitcher`.
* **Padding:** Generous (e.g., `p-6` or `p-8`) to frame the content.

### The Main Stage (`<main>`)
* **Container:** Fluid but with padding matching the header.
* **Structure:**
    * **State A (Landing):** Content is centered.
    * **State B (Browsing):** Two-column grid. Left column = `TechMenu` (Sidebar). Right column = `ProjectList`.

## 3. Component Architecture (Atomic Design)

### Atoms (Primitives - DONE)
* `AppLogo`, `TechPill`, `ActionBtn`, `LangSwitcher`.

### Molecules (Interactive Blocks)
* **`TechMenuItem`**: A single technology link.
    * Props: `label: string`, `isActive: boolean`, `count: number`.
    * State: If active -> change mode to 'sidebar' and emit 'select' event.
* **`ProjectRow`**: A single row in the project list.
    * Layout: `Index (01) | Title | Arrow (->)`.
    * Interaction: Hover triggers the `ProjectHoverCard`.
* **`ProjectHoverCard`**: Floating 3D card.
    * **Behavior:** Must use `<Teleport to="body">` to avoid z-index clipping. Follows mouse cursor.

### Organisms (Complex Logic)
* **`TechMenu` (The Chameleon)**:
    * **Critical Logic:** This component transforms based on the app state (`viewMode`).
    * **Mode 'HERO':** Large text, centered, vertical stack. (Landing view).
    * **Mode 'SIDEBAR':** Smaller text, aligned left, acts as a filter menu.
    * **Animation:** Must use FLIP (GSAP,AutoAnimate or Flip toolkit) to transition between modes smoothly.

* **`ProjectDetail` (The Drawer)**:
    * **UI:** A black accordion/drawer that pushes content down (or slides in).
    * **Content:** Renders the README markdown.
    * **Mandatory Field:** Must render the `Origin` metadata at the bottom:
      `// ORIGIN: {course_name} by {author}` (Opacity 50%, Mono font).

## 4. Z-Index Strategy
* `z-0`: Background / Standard content.
* `z-40`: `ProjectHoverCard` (Must float above text).
* `z-50`: Header (Logo/Lang).
* `z-60`: `ProjectDetail` (If it behaves as an overlay, otherwise part of flow).

## 5. Coding Standards
* Use `<script setup lang="ts">`.
* Use :class for dynamic classes.
* **i18n:** Use computed properties for DB content (`project.title[locale]`).
* **Images:** All user images must have `object-cover` and grayscale filter by default, revealing color on hover.


