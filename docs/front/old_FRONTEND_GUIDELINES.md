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

### Atoms (Primitives)
* `AppLogo`: The animated header logo.
* `TechPill`: Small badges for stack (e.g., [ vue.js ]).
* `ActionBtn`: Minimalist outline buttons (Github/Demo).
* `LangSwitcher`: Simple text toggle [ ES // EN ].

### Molecules (Interactive)
* `ProjectRow`: The main list item. Needs hover state logic.
* `ProjectHoverCard`: The floating 3D card that follows the mouse.

### Organisms (Complex)
* `ProjectDetail`: The black drawer/accordion. Must render Markdown.
    * **CRITICAL:** Must include the "Origin" field logic: `// ORIGIN: {course} by {author}` at the bottom.

## 3. Motion Rules (GSAP + VueUse)
* **No Bouncing:** Animations must be mechanical (`power3.out`, `expo.inOut`).
* **Micro-interactions:**
    * Use `useMouseInElement` for the Hover Card tilt effect.
    * Use `FLIP` concepts for the Hero -> Sidebar transition.

## 4. Coding Standards
* Use `<script setup lang="ts">`.
* Use :class for dynamic classes.
* **i18n:** Never hardcode strings. Use `useI18n()` and the computed property pattern for DB content (`project.title[locale]`).


