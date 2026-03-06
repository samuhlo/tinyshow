<div align="center">
  <br />
  <h1><code>./TINYSHOW.sh</code></h1>

**Una máquina de mostrar proyectos que se alimenta sola.**
<br />

[![Live](https://img.shields.io/badge/LIVE_DEMO-FFCA40?style=for-the-badge&logo=vercel&logoColor=black)](https://tinyshow.vercel.app/)
[![Status](https://img.shields.io/badge/STATUS-PRODUCTION-0C0011?style=for-the-badge)](https://github.com/samuhlo/tinyshow)

  <br />
</div>

![TinyShow Preview](https://raw.githubusercontent.com/samuhlo/tinyshow/main/public/images/tinyshow_main.webp)

___

## // 00_ THE_MISSION

Un escaparate de proyectos que no necesita que le des de comer. Cada vez que actualizas el README de un repositorio, TinyShow lo detecta, lo analiza con IA, extrae metadatos, genera contenido localizado en inglés y español, y actualiza la interfaz automáticamente. Sin copiar-pegar. Sin mantenimiento manual. Solo escribes código y publicas.

> *Vandal Note: La idea nacio de querer mostrar los proyectos secundarios que voy haciendo. Proyectos que me sirven para aprender, probar cosas, testear tecnologias ... Pero me daba pereza tener que estar subiendo a mano cada vez que tenia alguno que quisiera mostrar, si creaba un portfolio normal. Asi que por pereza cree esto*

___

## // 01_ THE_BLUEPRINT

| LAYER      | TECH          | IMPLEMENTATION DETAIL                                 |
| :--------- | :------------ | :---------------------------------------------------- |
| **Core**   | `Nuxt 4`      | SSR + Composition API + TypeScript                   |
| **UI**     | `Vue 3`       | Script Setup + Components                             |
| **State**  | `Pinia`       | Setup Stores + Prefetch Strategy (Cache Warming)     |
| **Styles** | `Tailwind 4`  | Custom design system + CSS Variables                  |
| **Motion** | `GSAP`        | ScrollTrigger + FLIP animations                      |
| **Data**   | `Prisma`      | ORM con PostgreSQL (Neon) + JSONB                     |
| **AI**     | `DeepSeek`    | Extracción de metadatos + Localización EN/ES         |
| **Git**    | `Octokit`     | GitHub API + Webhooks con validación HMAC            |
| **i18n**   | `@nuxt/i18n`  | EN/ES con detección de idioma por navegador          |
| **Valid**  | `Zod`         | Schema validation desde IA hasta la base de datos    |

___

## // 02_ CONTROLLED_CHAOS

- **Ingestión Automática:** Un webhook recibe eventos de GitHub, valida la firma HMAC-SHA256, detecta cambios en README.md, y dispara el pipeline de IA. No hay intervención humana.

- **Estrategia "Nevera Llena":** El store carga tecnologías primero (bloqueante, necesario para UI) y luego precarga TODOS los proyectos en segundo plano con precarga de imágenes nativa del navegador. El resultado: navegación instantánea entre tecnologías, sin spinners.

- **Experiencia Dual:** Misma lógica, diferente piel. Desktop: navegación lateral expansiva con animaciones FLIP. Mobile: "downbar" inferior optimizada para el pulgar. El contenido se adapta, la esencia permanece.

___

## // 03_ CORE_LOGIC

El pipeline de ingestión completa: desde el webhook hasta la base de datos.

```typescript
// server/utils/ingest.ts
// INGEST_PROJECT :: El corazón del sistema automático

export async function ingestProject(
  owner: string,
  repo: string,
  octokit: Octokit,
  branch: string = "main",
  strictModeOverride?: boolean
): Promise<IngestResult> {
  const projectId = repo;

  // 1. Obtener README desde GitHub API
  const { data: readme } = await octokit.request(ENDPOINT_README, {
    owner, repo, ref: branch,
    mediaType: { format: "raw" },
  });

  // 2. Verificar marcador HIDDEN (ahorra tokens de IA)
  if (readmeContent.includes("<!-- tinyshow:hidden -->")) {
    return { action: "delete", project: null, projectId };
  }

  // 3. DeepSeek extrae título, tagline, descripción, stack, imagen...
  const projectData = await extractProjectData(readmeContent, htmlUrl);

  // 4. Validar assets requeridos (demo_url + img_url en modo strict)
  if (!projectData.demo_url && strictMode) {
    return { action: "delete", project: null, projectId };
  }

  // 5. Upsert en PostgreSQL
  await prisma.project.upsert({
    where: { id: projectData.id },
    update: { ... },
    create: { ... },
  });

  return { action: "save", project: projectData, projectId };
}
```

La IA no solo extrae datos — genera el contenido localized con taglines de max 40 caracteres y descripciones de 150-200 chars. Todo validado con Zod antes de entrar en la base de datos.

___

<div align="center">
<br />

<code>DESIGNED & CODED BY <a href='https://github.com/samuhlo'>samuhlo</a></code>

<small>Lugo, Galicia</small>

</div>

<!--
PORTFOLIO:METADATA
accent_color: #f66f34
hover_text_card: automated showcase 2020
year : 2020

Esto es una prueba para el webhoook

images_url:
https://raw.githubusercontent.com/samuhlo/tinyshow/main/public/images/captures/tinyshow_1.webp
https://raw.githubusercontent.com/samuhlo/tinyshow/main/public/images/captures/tinyshow_3.webp
https://raw.githubusercontent.com/samuhlo/tinyshow/main/public/images/captures/tinyshow_4.webp
https://raw.githubusercontent.com/samuhlo/tinyshow/main/public/images/captures/tinyshow_5.webp

post_url: https://www.linkedin.com/feed/update/urn:li:activity:7415770262341955584/
blog_url:
-->
