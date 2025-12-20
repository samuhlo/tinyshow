/**
 * [MODULE] :: SHARED_TYPES
 * ----------------------------------------------------------------------
 * Definiciones de esquemas de validación y tipos principales.
 * Utiliza Zod para asegurar la integridad de los datos en toda la APP.
 *
 * @module    shared/types
 * @architect Samuh Lo
 * ----------------------------------------------------------------------
 */

import { z } from "zod";

// =====================================================================
// [SECTION] :: SCHEMAS
// =====================================================================

export const LocalizedText = z.object({
  en: z.string(),
  es: z.string(),
});

export const ProjectSchema = z.object({
  id: z.string().describe("Generated from repo name"),
  title: z.string().describe("Punchy, short title"),
  tagline: LocalizedText.describe("One-liner vendor in EN and ES"),
  description: LocalizedText.describe(
    "Emotional summary of the project in EN and ES"
  ),
  tech_stack: z.array(z.string()).describe("e.g. Vue, Tailwind"),
  primary_tech: z
    .string()
    .describe("Main technology: e.g. Astro > TS, Nuxt > Vue, Next > React"),
  img_url: z.string().nullish().describe("Project image URL"),
  repo_url: z.string(),
  demo_url: z.string().nullish(),
  origin: z
    .object({
      is_course: z
        .boolean()
        .describe(
          "true if the project is from a course, bootcamp, or tutorial"
        ),
      name: z.string().nullish().describe("Name of the course/bootcamp"),
      author: z.string().nullish().describe("Instructor or platform name"),
      course_url: z.string().nullish().describe("URL to the course page"),
      author_url: z
        .string()
        .nullish()
        .describe("Author's website, Twitter, or YouTube channel"),
    })
    .nullish()
    .describe("Origin of the project if it's from a course"),
});

// =====================================================================
// [SECTION] :: TYPES
// =====================================================================

/** Texto localizado en inglés y español */
export type LocalizedTextType = z.infer<typeof LocalizedText>;

/** Información de origen del proyecto (curso, bootcamp, etc.) */
export type OriginType = z.infer<typeof ProjectSchema.shape.origin>;

/** Tipo completo de proyecto */
export type Project = z.infer<typeof ProjectSchema>;
